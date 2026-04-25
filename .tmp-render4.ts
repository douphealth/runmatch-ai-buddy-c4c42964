import jsPDF from 'jspdf';
import fs from 'node:fs';
import path from 'node:path';
const PUBLIC = path.join(process.cwd(), 'public');
(globalThis as any).fetch = async (url: any) => {
  const rel = String(url).replace(/^\/+/, '');
  const fp = path.join(PUBLIC, rel);
  if (!fs.existsSync(fp)) return { ok: false, status: 404, blob: async () => ({ size: 0, type: '' }) };
  const buf = fs.readFileSync(fp);
  const ext = path.extname(fp).toLowerCase();
  const type = ext === '.png' ? 'image/png' : 'image/jpeg';
  return { ok: true, status: 200, blob: async () => ({ size: buf.length, type, arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) }) };
};
class FR { result: any = null; onloadend: any = null; onerror: any = null; readAsDataURL(blob: any) { Promise.resolve().then(() => blob.arrayBuffer()).then((ab: any) => { this.result = `data:${blob.type};base64,${Buffer.from(ab).toString('base64')}`; if (this.onloadend) this.onloadend(); }); } }
(globalThis as any).FileReader = FR;

// Use jsPDF.API to add a method that replaces save on each instance
let captured: any = null;
(jsPDF as any).API.events.push(['initialized', function() {
  const self = this;
  self.save = function() { captured = self; };
}]);

const m = await import('./src/lib/pdf-generator');
const answers: any = { footType: 'flat', pronation: 'overpronation', weeklyMileage: 30, distance: '10k', terrain: 'trail', paceGoal: 'moderate', injuries: ['shin-splints', 'it-band'], brand: ['nike', 'asics'], budget: ['100-150', '150-200'] };
const mkShoe = (id: string, brand: string, model: string): any => ({ id, brand, model, priceUSD: 145, weightGrams: 268, dropMM: 8, cushioning: 8, highlights: ['Energetic PEBA midsole foam returns 78% of impact energy on toe-off','Engineered mesh upper locks the midfoot without hot spots','Carbon-rubber outsole rated for 800+ km'], reviewURL: 'https://gearuptofit.com/review/sample', imageURL: '' });
const rotation: any = { primary: { shoe: mkShoe('s1','Adidas','Adizero Boston 12'), matchPercent: 96, reasons: ['Stability platform aligns with overpronation','Boost cushioning matches 30 km/week'] }, speed: { shoe: mkShoe('s2','Adidas','Adios Pro 4'), matchPercent: 91, reasons: [] }, longRun: { shoe: mkShoe('s3','Adidas','Adizero Adios Pro 3'), matchPercent: 88, reasons: [] } };
const recommendation: any = { shoeProfile: { summary: 'Based on your overpronation pattern, flat foot type and 30 km weekly volume on trail terrain, you need a stability-oriented daily trainer with moderate cushioning, a low-to-mid drop and a durable outsole rated for mixed surfaces.', category: 'Stability Trail', cushioning: 'Moderate (7/10)', dropRange: '6-10 mm', supportType: 'Guided Stability' }, whyItWorks: 'This rotation balances support and energy return for a flat-footed overpronator targeting 10K performance on trail. The daily trainer prevents inward roll while the speed shoe sharpens turnover for race-day.', trainingEmphasis: ['Add 2 stability-focused strength sessions per week (single-leg work)','Cap long-run volume increases at 10% per week to protect IT band','Rotate shoes by surface — trail shoe for technical terrain only','Include weekly hill repeats to build resilience'] };
const radarData = [{axis:'Cushion',value:7},{axis:'Support',value:9},{axis:'Speed',value:6},{axis:'Trail',value:8},{axis:'Durability',value:8},{axis:'Comfort',value:7}];

await m.generateResultsPDF({ answers, recommendation, rotation, radarData } as any);
await new Promise(r => setTimeout(r, 200));
if (!captured) throw new Error('not captured');
fs.writeFileSync('/tmp/pdf-qa/sample.pdf', Buffer.from(captured.output('arraybuffer')));
console.log('wrote', fs.statSync('/tmp/pdf-qa/sample.pdf').size, 'bytes');
