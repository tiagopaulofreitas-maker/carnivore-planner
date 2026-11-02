import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const app=fs.readFileSync('app.js','utf8');
const start=app.indexOf('function planPosition('),end=app.indexOf('function nextSaturday()',start);
function indexAt(now){
 const c={state:{start:'2026-11-01'},Date:class extends Date{constructor(...args){super(...(args.length?args:[now]))}}};
 vm.runInNewContext(app.slice(start,end),c);return c.todayIndex();
}
assert.equal(indexAt('2026-11-30T12:00:00Z'),29);
assert.equal(indexAt('2026-12-01T12:00:00Z'),29,'Ended plan must not wrap to day 1');
assert.equal(indexAt('2026-10-31T12:00:00Z'),0);
assert.equal(indexAt('2027-01-01T12:00:00Z'),29);
console.log('PASS: day 30 is retained after the plan ends, without automatic cycle creation');
