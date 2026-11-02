import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const base=process.env.TEST_URL||'http://127.0.0.1:4173/carnivore-planner/';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'carnivore-install-'));
const context=await chromium.launchPersistentContext(profile,{headless:true,viewport:{width:390,height:844},serviceWorkers:'allow'});
try{
 await context.route('https://images.unsplash.com/**',r=>r.abort());
 const page=await context.newPage();await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const session=await context.newCDPSession(page);await session.send('Page.enable');
 const manifest=await session.send('Page.getAppManifest');
 assert.deepEqual(manifest.errors,[],'Manifest parsing errors');
 const m=JSON.parse(manifest.data);assert.equal(new URL(m.start_url,manifest.url).pathname,'/carnivore-planner/');
 assert.equal(m.scope,m.start_url);assert.equal(m.id,m.start_url);assert.equal(m.display,'standalone');
 const report=await session.send('Page.getInstallabilityErrors');console.log('Chromium installability:',JSON.stringify(report));
 assert.deepEqual(report.installabilityErrors,[],'Chromium reports installability blockers');
 console.log('PASS: Chromium persistent profile parses manifest and reports no installability blockers; physical Samsung installation remains untested');
}finally{await context.close();fs.rmSync(profile,{recursive:true,force:true});}
