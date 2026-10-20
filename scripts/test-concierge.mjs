import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {stockFilm} from '../film-source.js';
const base=process.env.TEST_URL||'http://localhost:5173';
const metadata=await (await fetch(base+'/api/hero-film')).json();assert.equal(metadata.provider,'stock');assert.equal(metadata.src,stockFilm.src);
fs.mkdirSync('.cache',{recursive:true});
const browser=await launchBrowser(),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
await page.route(stockFilm.src,route=>route.fulfill({contentType:'video/mp4',body:fs.readFileSync('scripts/fixtures/player-test.mp4')}));
let submission=0;
await page.route('**/api/enquiries',route=>{submission++;const payload=route.request().postDataJSON();assert.equal(payload.destination,'nilgiri-slowdown');assert.equal(payload.travellers,4);assert.equal(payload.consent,true);return route.fulfill({status:submission===1?503:201,json:submission===1?{error:'Offline QA retry: details were not saved.'}:{saved:true,reference:'TT-A1B2C3D4E5F6'}});});
try{
 await page.goto(base);await page.waitForFunction(()=>document.querySelector('#hero-video').currentTime>.1);
 assert.equal(await page.locator('#hero-video').getAttribute('src'),stockFilm.src);assert.equal(await page.locator('#hero-video').evaluate(v=>v.loop),false);
 assert.equal(await page.locator('#hero-youtube').count(),0);assert.ok(!requests.some(url=>/https:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com|i\.ytimg\.com)\//.test(url)),'Default film does not contact YouTube');
 await page.evaluate(()=>window.firstFilm=document.querySelector('#hero-video'));
 await page.locator('.nav-plan').click();await page.locator('#planner-dialog:modal').waitFor();assert.equal(await page.locator('#hero-video').evaluate(v=>v.paused),true,'Film suspends behind enquiry');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.locator('#hero-video').evaluate(v=>v.paused),true,'A visibility restore must not restart film behind an open planner');
 await page.getByRole('button',{name:'Close journey planner',exact:true}).click();await page.locator('#watch-film').click();
 assert.equal(await page.evaluate(()=>window.firstFilm===document.querySelector('#hero-video')),true);assert.equal(await page.locator('video').count(),1);assert.equal(await page.locator('#hero-video').evaluate(v=>v.controls),true);
 await page.keyboard.press('Escape');await page.locator('#hero-video').evaluate(v=>{v.currentTime=v.duration-.2;v.play();});await page.waitForFunction(()=>document.querySelector('#hero-video').ended);
 const before=requests.length;await page.reload();await page.locator('#film-duration').filter({hasText:'Viewed once'}).waitFor();assert.ok(!requests.slice(before).includes(stockFilm.src));assert.equal(await page.locator('#hero-video').getAttribute('src'),null);
 // Fresh reduced-motion visit: the real source preview, no synthetic footage.
 await page.evaluate(()=>sessionStorage.clear());await page.emulateMedia({reducedMotion:'reduce'});const reducedBefore=requests.length;await page.reload();await page.locator('#watch-film').waitFor();assert.ok(!requests.slice(reducedBefore).includes(stockFilm.src));
 await page.screenshot({path:'.cache/concierge-road-hero-1440.png'});
 await page.locator('.nav-plan').click();await page.locator('#planner-dialog:modal').waitFor();assert.equal(await page.locator('#enquiry-progress').getAttribute('aria-valuenow'),'1');
 await page.locator('#planner-destination').selectOption('nilgiri-slowdown');const date=page.locator('#planner-form [name=date]');await date.fill(await date.getAttribute('min'));await page.locator('#planner-form [name=travellers]').selectOption('4');
 assert.equal(await page.locator('.concierge-summary [data-enquiry-summary=destination]').innerText(),'The Nilgiri Slowdown');assert.match(await page.locator('.concierge-summary [data-enquiry-summary=timing]').innerText(),/4 travellers/);
 await page.locator('#concierge-preview').evaluate(img=>img.decode());await page.locator('#planner-dialog').screenshot({path:'.cache/concierge-escape-1440.png'});
 await page.locator('#wizard-next').click();assert.equal(await page.locator('#enquiry-progress').getAttribute('aria-valuenow'),'2');await page.locator('#planner-form [name=budget]').selectOption('40000-60000');await page.getByLabel('A little adventure',{exact:true}).check();await page.locator('#planner-form [name=notes]').fill('Offline QA celebration brief.');
 await page.locator('#planner-dialog').screenshot({path:'.cache/concierge-feeling-1440.png'});
 await page.locator('#wizard-next').click();assert.equal(await page.locator('#enquiry-progress').getAttribute('aria-valuenow'),'3');assert.equal(await page.locator('[data-wizard-indicator="3"]').getAttribute('aria-current'),'step');
 await page.locator('.concierge-review summary').click();assert.match(await page.locator('.concierge-review [data-enquiry-summary=budget]').innerText(),/40,000/);assert.equal(await page.locator('.concierge-review [data-enquiry-summary=pace]').innerText(),'A little adventure');
 await page.getByRole('button',{name:'Edit journey details ↗',exact:true}).click();assert.equal(await page.locator('#enquiry-progress').getAttribute('aria-valuenow'),'1');assert.equal(await page.locator('#planner-destination').inputValue(),'nilgiri-slowdown');
 await page.locator('#wizard-next').click();assert.equal(await page.locator('#planner-form [name=budget]').inputValue(),'40000-60000');await page.locator('#wizard-next').click();
 await page.locator('#planner-form [name=name]').fill('Concierge QA');await page.locator('#planner-form [name=email]').fill('concierge-qa@example.invalid');await page.locator('#planner-form [name=consent]').check();
 await page.locator('#wizard-submit').click();await page.locator('#planner-error').filter({hasText:'Offline QA retry'}).waitFor();assert.equal(await page.locator('#planner-form [name=email]').inputValue(),'concierge-qa@example.invalid');assert.equal(await page.locator('#planner-form').getAttribute('aria-busy'),'false');
 await page.locator('#wizard-submit').click();await page.locator('#planner-success').waitFor();assert.equal(await page.locator('#enquiry-reference').innerText(),'TT-A1B2C3D4E5F6');assert.equal(await page.locator('.concierge-next li').count(),3);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedReference=text;}}}));await page.getByRole('button',{name:'Copy reference ↗',exact:true}).click();assert.equal(await page.evaluate(()=>window.copiedReference),'TT-A1B2C3D4E5F6');assert.match(await page.locator('#concierge-copy-feedback').innerText(),/copied/);
 await page.evaluate(()=>navigator.clipboard.writeText=async()=>{throw new Error('Clipboard denied');});await page.getByRole('button',{name:'Copy reference ↗',exact:true}).click();assert.match(await page.locator('#concierge-copy-feedback').innerText(),/Select and copy/);
 await page.locator('#planner-dialog').screenshot({path:'.cache/concierge-confirmation-1440.png'});
 await page.getByRole('button',{name:'Close journey planner',exact:true}).click();await page.locator('.nav-plan').click();
 for(const [width,height]of [[320,740],[390,844],[768,1024],[1024,768],[1440,1000],[844,390]]){
  await page.setViewportSize({width,height});await page.locator('#planner-dialog').evaluate(d=>d.scrollTo({top:0,behavior:'instant'}));
  assert.ok(await page.locator('#planner-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1),`Dialog overflow at ${width}`);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const close=await page.getByRole('button',{name:'Close journey planner',exact:true}).boundingBox();assert.ok(close.x>=0&&close.x+close.width<=width+1&&close.y>=0&&close.y+close.height<=height+1,`Close control remains reachable at ${width}`);
  assert.ok(await page.locator('#planner-form select').first().evaluate(el=>el.getBoundingClientRect().width>200));
  if(width===390||width===768){await page.locator('#concierge-preview').evaluate(img=>img.decode());await page.locator('#planner-dialog').screenshot({path:`.cache/concierge-escape-${width}.png`});}
 }
 await page.getByRole('button',{name:'Close journey planner',exact:true}).click();await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>sessionStorage.clear());
 await page.unroute(stockFilm.src);await page.route(stockFilm.src,route=>route.abort());await page.reload();await page.locator('.hero-film-status').filter({hasText:'The film could not load'}).waitFor();
 assert.equal(await page.locator('.hero-poster').getAttribute('src'),stockFilm.poster);assert.equal(await page.locator('#watch-film').isHidden(),true);
 await page.unroute(stockFilm.src);await page.route(stockFilm.src,route=>route.fulfill({contentType:'video/mp4',body:fs.readFileSync('scripts/fixtures/player-test.mp4')}));
 await page.addInitScript(()=>{const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return document.querySelector('#film-dialog:modal')?play.call(this):Promise.reject(new DOMException('Offline autoplay policy fixture','NotAllowedError'));};});
 await page.reload();await page.locator('.hero-film-status').filter({hasText:'Select Play the film'}).waitFor();await page.locator('#watch-film').click();await page.waitForFunction(()=>document.querySelector('#hero-video').currentTime>.1);await page.keyboard.press('Escape');
 assert.equal(submission,2);assert.deepEqual(errors,[]);console.log('PASS: default real-stock provider with no YouTube requests, full-view same player, modal pause, once-only reload, reduced-motion request deferral, network fallback and blocked-autoplay gesture recovery; concierge dynamic preview/summary, real step progress, review/edit preservation, retry/success/reference-copy fallback, and six responsive modal sizes. Video uses an intercepted labelled test fixture; real CDN playback is not verified. No real enquiry or message was sent.');
}finally{await browser.close();}
