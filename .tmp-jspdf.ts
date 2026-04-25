import jsPDF from 'jspdf';
const d = new jsPDF();
console.log('save on instance?', Object.prototype.hasOwnProperty.call(d, 'save'));
console.log('proto save?', typeof (jsPDF as any).prototype.save);
console.log('keys:', Object.keys(d).filter(k => k === 'save'));
