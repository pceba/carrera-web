import { chromium } from "@playwright/test";
const pages = ["como-funciona","el-trabajo","empresas","proceso","caso-practico","recursos","personas","estrategia"];
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:375,height:812}});
for (const s of pages) {
  await p.goto(`http://localhost:3000/industrias/consultoria/${s}`, {waitUntil:"networkidle"});
  const r = await p.evaluate(()=>({total:document.documentElement.scrollHeight, body: document.querySelector("main article, main")?.scrollHeight}));
  console.log(s, r.total, r.body);
}
await b.close();
