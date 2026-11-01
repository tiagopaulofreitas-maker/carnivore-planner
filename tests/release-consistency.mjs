import fs from 'node:fs';
import assert from 'node:assert/strict';
const {version,build}=JSON.parse(fs.readFileSync('release.json','utf8'));
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),app=fs.readFileSync('app.js','utf8');
assert.ok(sw.includes(`carnivore-planner-v${build}`));
assert.ok(app.includes(`./sw.js?v=${build}`),'Worker registration and shell build differ');
assert.ok(app.includes(`window.CP_RELEASE='${version}'`));
for(const [,asset] of html.matchAll(/(?:src|href)="(\.\/[^\"]+\?v=\d+)"/g)){
 assert.ok(asset.endsWith('?v='+build),'Wrong asset version: '+asset);
 assert.ok(sw.includes(asset),'Offline shell omits '+asset);
 assert.ok(fs.existsSync(asset.split('?')[0]),'Missing file: '+asset);
}
console.log('PASS: release metadata, script order, worker registration and offline asset versions agree');
