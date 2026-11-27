import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:375,height:812}});
for (const s of process.argv.slice(2)) {
  await p.goto(`http://localhost:3000/industrias/consultoria/${s}`, {waitUntil:"networkidle"});
  const r = await p.evaluate(()=>{const m=document.querySelector("article > div");const out=[];
   const walk=(el,d)=>{ for(const c of el.children){const h=Math.round(c.getBoundingClientRect().height); if(h>0) out.push(" ".repeat(d)+c.tagName+"."+(c.className||"").toString().slice(0,30)+" "+h+" "+(c.textContent||"").slice(0,30)); if(d<0) walk(c,d+1);} };
   walk(m,0); return out.join("\n");});
  console.log("##",s,"\n"+r);
}
await b.close();
