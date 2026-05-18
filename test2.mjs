import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
const dom = new JSDOM(''); globalThis.window=dom.window; globalThis.document=dom.window.document; globalThis.navigator=dom.window.navigator; globalThis.HTMLCanvasElement=dom.window.HTMLCanvasElement;
const { jsPDF } = await import('jspdf');
jsPDF.API.save = function(filename) {
  const buf = Buffer.from(this.output('arraybuffer'));
  writeFileSync('/tmp/out.pdf', buf);
  console.log('SAVED', filename, buf.length);
  return this;
};
const d = new jsPDF();
d.text('hi',10,10);
d.save('x.pdf');
