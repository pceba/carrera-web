import styles from "./guide-visuals.module.css";

export type PayLevel = {
  level: string;
  experience: string;
  fixed: string;
  variable: string;
  total: string;
};

/** Average pay by level from one named study. Amounts are strings so the MDX controls rounding. */
export function PayByLevel({ caption, rows }: { caption: string; rows: PayLevel[] }) {
  return (
    <figure className={styles.pay}>
      <figcaption className={styles.caption}>{caption}</figcaption>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Nivel</th>
            <th scope="col">Fijo</th>
            <th scope="col">Variable</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.level}>
              <th scope="row">
                {r.level}
                <span className={styles.sub}>{r.experience}</span>
              </th>
              <td>{r.fixed}</td>
              <td>{r.variable}</td>
              <td>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
