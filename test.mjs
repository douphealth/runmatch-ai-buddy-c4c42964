import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
const dom = new JSDOM(''); globalThis.window=dom.window; globalThis.document=dom.window.document; globalThis.navigator=dom.window.navigator; globalThis.HTMLCanvasElement=dom.window.HTMLCanvasElement;
const { jsPDF } = await import('jspdf');
const d = new jsPDF();
d.text('hello',10,10);
const buf = Buffer.from(d.output('arraybuffer'));
writeFileSync('/tmp/test.pdf', buf);
console.log('OK', buf.length, d.constructor.name);
