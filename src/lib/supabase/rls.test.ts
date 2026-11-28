import { afterAll, beforeAll, beforeEach, afterEach, describe, expect, it } from "vitest";
import { Client } from "pg";

/**
 * Integration tests against a LOCAL Supabase Postgres (`npx supabase start`, then
 * SUPABASE_TEST_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres npm test).
 * Skipped when the variable is not set. Each test runs in a transaction that is rolled back.
 */
const dbUrl = process.env.SUPABASE_TEST_DB_URL;
const suite = dbUrl ? describe : describe.skip;

const A = "00000000-0000-0000-0000-00000000aa01";
const B = "00000000-0000-0000-0000-00000000bb02";

suite("accounts schema (RLS, age gate, deletion)", () => {
  let db: Client;

  beforeAll(async () => {
    db = new Client({ connectionString: dbUrl });
    await db.connect();
  });
  afterAll(async () => {
    await db.end();
  });
  beforeEach(async () => {
    await db.query("begin");
    await createUser(A, 2004);
    await createUser(B, 2003);
  });
  afterEach(async () => {
    await db.query("rollback");
  });

  async function createUser(id: string, birthYear: number | null) {
    const meta = birthYear === null ? "{}" : JSON.stringify({ birth_year: birthYear });
    await db.query(
      `insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
       values ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, $3)`,
      [id, `${id}@example.test`, meta],
    );
  }

  /** Runs queries as an authenticated end user (RLS enforced), then restores the superuser. */
  async function asUser<T>(id: string, fn: () => Promise<T>): Promise<T> {
    await db.query("savepoint as_user");
    try {
      await db.query("set local role authenticated");
      await db.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: id, role: "authenticated" }),
      ]);
      const result = await fn();
      await db.query("reset role");
      await db.query("release savepoint as_user");
      return result;
    } catch (error) {
      // Rolling back to the savepoint also undoes the SET LOCAL role, keeping the tx usable.
      await db.query("rollback to savepoint as_user");
      throw error;
    }
  }

  async function asAnon<T>(fn: () => Promise<T>): Promise<T> {
    await db.query("savepoint as_anon");
    try {
      await db.query("set local role anon");
      return await fn();
    } finally {
      await db.query("rollback to savepoint as_anon");
    }
  }

  it("sign-up creates a profile with the birth year", async () => {
    const { rows } = await db.query("select birth_year from public.profiles where id = $1", [A]);
    expect(rows[0].birth_year).toBe(2004);
  });

  it("user A cannot read user B's profile, consents or saved items", async () => {
    await db.query(
      "insert into public.consents (user_id, privacy_version, terms_version) values ($1,'v1','v1')",
      [B],
    );
    await db.query(
      "insert into public.saved_items (user_id, kind, ref) values ($1,'posting','x')",
      [B],
    );
    const seen = await asUser(A, async () => ({
      profiles: (await db.query("select id from public.profiles")).rows,
      consents: (await db.query("select id from public.consents")).rows,
      items: (await db.query("select id from public.saved_items")).rows,
    }));
    expect(seen.profiles.map((r) => r.id)).toEqual([A]);
    expect(seen.consents).toHaveLength(0);
    expect(seen.items).toHaveLength(0);
  });

  it("user A cannot write rows for user B", async () => {
    await expect(
      asUser(A, () =>
        db.query("insert into public.saved_items (user_id, kind, ref) values ($1,'posting','x')", [
          B,
        ]),
      ),
    ).rejects.toThrow(/row-level security/);
    const res = await asUser(A, () =>
      db.query("update public.profiles set display_name = 'hacked' where id = $1", [B]),
    );
    expect(res.rowCount).toBe(0);
  });

  it("applications: each user sees and changes only their own, constraints hold", async () => {
    await db.query("insert into public.applications (user_id, firm) values ($1,'Firma B')", [B]);
    const own = await asUser(A, async () => {
      await db.query("insert into public.applications (firm, stage) values ('Firma A','enviada')");
      return (await db.query("select firm from public.applications")).rows;
    });
    expect(own).toEqual([{ firm: "Firma A" }]); // user_id defaults to auth.uid(); B's row is hidden

    await expect(
      asUser(A, () =>
        db.query("insert into public.applications (user_id, firm) values ($1,'x')", [B]),
      ),
    ).rejects.toThrow(/row-level security/);
    const upd = await asUser(A, () => db.query("update public.applications set firm = 'hacked'"));
    expect(upd.rowCount).toBe(1); // only A's own row
    const del = await asUser(A, () =>
      db.query("delete from public.applications where user_id = $1", [B]),
    );
    expect(del.rowCount).toBe(0);

    for (const bad of [
      "insert into public.applications (firm, url) values ('F','http://a.es')",
      "insert into public.applications (firm, stage) values ('F','fichada')",
      "insert into public.applications (firm, industry) values ('F','retail')",
      "insert into public.applications (firm) values ('')",
    ]) {
      await expect(asUser(A, () => db.query(bad))).rejects.toThrow(/check constraint/);
    }
    await expect(asAnon(() => db.query("select * from public.applications"))).rejects.toThrow(
      /permission denied/,
    );
  });

  it("anonymous role gets no access", async () => {
    await expect(asAnon(() => db.query("select * from public.profiles"))).rejects.toThrow(
      /permission denied/,
    );
  });

  it("a user can update their own profile but cannot lower their birth year below 16", async () => {
    await asUser(A, () =>
      db.query(
        "update public.profiles set display_name = 'Ana', degree = 'ADE', study_year = 3 where id = $1",
        [A],
      ),
    );
    const { rows } = await db.query("select display_name from public.profiles where id = $1", [A]);
    expect(rows[0].display_name).toBe("Ana");
    await expect(
      asUser(A, () =>
        db.query("update public.profiles set birth_year = $2 where id = $1", [
          A,
          new Date().getFullYear() - 10,
        ]),
      ),
    ).rejects.toThrow(/check constraint/);
  });

  describe("age gate", () => {
    const young = new Date().getFullYear() - 15;
    it("blocks sign-up under 16", async () => {
      await db.query("savepoint s");
      await expect(createUser("00000000-0000-0000-0000-00000000cc03", young)).rejects.toThrow(
        /age_gate/,
      );
    });
    it("blocks sign-up without a birth year", async () => {
      await db.query("savepoint s");
      await expect(createUser("00000000-0000-0000-0000-00000000cc04", null)).rejects.toThrow(
        /age_gate/,
      );
    });
  });

  it("delete_my_account removes the auth user and every row, and only theirs", async () => {
    for (const id of [A, B]) {
      await db.query(
        "insert into public.consents (user_id, privacy_version, terms_version) values ($1,'v1','v1')",
        [id],
      );
      await db.query(
        "insert into public.saved_items (user_id, kind, ref) values ($1,'progress','p')",
        [id],
      );
      await db.query("insert into public.applications (user_id, firm) values ($1,'F')", [id]);
    }
    await asUser(A, () => db.query("select public.delete_my_account()"));
    const count = async (table: string, col: string, id: string) =>
      Number(
        (await db.query(`select count(*) from ${table} where ${col} = $1`, [id])).rows[0].count,
      );
    expect(await count("auth.users", "id", A)).toBe(0);
    expect(await count("public.profiles", "id", A)).toBe(0);
    expect(await count("public.consents", "user_id", A)).toBe(0);
    expect(await count("public.saved_items", "user_id", A)).toBe(0);
    expect(await count("public.applications", "user_id", A)).toBe(0);
    expect(await count("public.profiles", "id", B)).toBe(1);
    expect(await count("public.saved_items", "user_id", B)).toBe(1);
  });

  it("delete_my_account is not callable anonymously", async () => {
    await expect(asAnon(() => db.query("select public.delete_my_account()"))).rejects.toThrow(
      /permission denied/,
    );
  });
});
