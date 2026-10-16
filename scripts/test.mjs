import { launchBrowser } from './browser.mjs';
import { filmFixture } from './film-fixture.mjs';
import { api } from '../server/api.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
const base=process.env.TEST_URL||'http://localhost:5173';
fs.mkdirSync('.cache',{recursive:true});
const testMedia=fs.mkdtempSync('.cache/hero-metadata-');
try{
 const readMetadata=()=>{let output;api({method:'GET',url:'/api/hero-film'},{writeHead(status){assert.equal(status,200);},end(body){output=JSON.parse(body);}},()=>assert.fail('Media metadata route was not handled'),{mediaRoot:testMedia});return output;};
 assert.deepEqual(readMetadata(),{available:false});
 fs.writeFileSync(`${testMedia}/hero-road-trip.mp4`,'');assert.deepEqual(readMetadata(),{available:false});
 fs.copyFileSync(new URL('./fixtures/player-test.mp4',import.meta.url),`${testMedia}/hero-road-trip.mp4`);
 const metadata=readMetadata();assert.equal(metadata.available,true);assert.equal(metadata.src,'/media/hero-road-trip.mp4');assert.equal(metadata.poster,null);assert.ok(metadata.revision);
 fs.copyFileSync('public/trip-tastic-logo.jpeg',`${testMedia}/hero-road-trip-poster.jpg`);assert.equal(readMetadata().poster,'/media/hero-road-trip-poster.jpg');
}finally{fs.rmSync(testMedia,{recursive:true,force:true});}

const browser=await launchBrowser();
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await filmFixture(page);
const future=new Date();future.setDate(future.getDate()+40);const date=future.toISOString().slice(0,10);
const email=`qa-${Date.now()}@example.test`;
let savedReference;
try{
await page.goto(base);await page.waitForFunction(()=>document.querySelector('#hero-video').currentTime>.2);
assert.ok(Math.abs(await page.locator('#hero-video').evaluate(v=>v.duration)-15)<.15);
assert.equal(await page.locator('#hero-video').evaluate(v=>v.muted&&!v.loop&&v.playsInline),true);
await page.waitForTimeout(1600);
assert.equal(await page.locator('#journey-grid .journey-card').count(),6);
for(const selector of ['.site-header .brand-logo','.site-footer .brand-logo','.about-mark img']){
 const logo=page.locator(selector);await logo.scrollIntoViewIfNeeded();await logo.evaluate(img=>img.decode());assert.equal(await logo.getAttribute('src'),'/trip-tastic-logo.jpeg');
 assert.equal(await logo.evaluate(img=>img.complete&&img.naturalWidth>0&&getComputedStyle(img).objectFit!=='cover'),true);
}
assert.equal(await page.locator('.brand-seal').count(),0);
const manifest=await page.request.get(base+'/site.webmanifest');assert.equal(manifest.status(),200);
assert.equal((await manifest.json()).name,'Trip-Tastic Holidays');
for(const asset of ['/brand/favicon-32.png','/brand/favicon-48.png','/brand/apple-touch-icon.png','/brand/favicon-192.png','/brand/favicon-512.png','/brand/share-logo.jpg','/favicon.ico'])assert.equal((await page.request.get(base+asset)).status(),200);
assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'),'/brand/share-logo.jpg');
await page.getByRole('button',{name:'Hills & tea',exact:true}).click();assert.equal(await page.locator('#journey-grid .journey-card').count(),3);
await page.getByRole('button',{name:'Wild & offbeat',exact:true}).click();assert.equal(await page.locator('#journey-grid .journey-card').count(),2);
await page.getByRole('button',{name:'Water & wellness',exact:true}).click();assert.equal(await page.locator('#journey-grid .journey-card').count(),1);
await page.locator('#clear-filters').click();
await page.getByRole('searchbox',{name:'Search journeys'}).fill('Munnar');assert.equal(await page.locator('#journey-grid .journey-card').count(),1);
await page.getByRole('searchbox',{name:'Search journeys'}).fill('nowhere-qa');await page.locator('#empty-state').waitFor({state:'visible'});
await page.locator('#reset-search').click();
await page.getByLabel('Sort journeys').selectOption('budget');assert.equal(await page.locator('#journey-grid .journey-card').first().getAttribute('data-journey'),'nilgiri-slowdown');
await page.getByLabel('Choose a landscape').selectOption('Water & wellness');await page.getByLabel('Time away').selectOption('3');await page.getByRole('button',{name:'Find my escape',exact:true}).click();await page.locator('#empty-state').waitFor({state:'visible'});await page.locator('#reset-search').click();
await page.locator('#journey-grid').getByRole('button',{name:'Save The Nilgiri Slowdown',exact:true}).click();
assert.equal(await page.locator('.saved-count').innerText(),'1');await page.reload();
await page.getByRole('button',{name:'Open saved journeys',exact:true}).click();await page.locator('#content-dialog').waitFor({state:'visible'});
assert.match(await page.locator('#dialog-content').innerText(),/The Nilgiri Slowdown/);
await page.getByRole('button',{name:'Remove The Nilgiri Slowdown from saved journeys',exact:true}).click();assert.match(await page.locator('#dialog-content').innerText(),/Save what speaks to you/);await page.getByRole('button',{name:'Close window',exact:true}).click();
const compare=page.locator('#journey-grid [data-compare]');for(let i=0;i<3;i++)await compare.nth(i).click();await compare.nth(3).click();assert.equal(await page.locator('#compare-count').innerText(),'3');
await page.locator('#show-compare').click();await page.locator('.compare-table').waitFor();assert.equal(await page.locator('.compare-table thead th').count(),4);
await page.getByRole('button',{name:'Make this one yours',exact:false}).first().click();await page.locator('#planner-dialog').waitFor({state:'visible'});assert.equal(await page.locator('#content-dialog').evaluate(d=>d.open),false);await page.getByRole('button',{name:'Close journey planner',exact:true}).click();await page.locator('#clear-compare').click();
await page.goto(base+'/#/journey/munnar-mist');await page.locator('.detail-hero h1').waitFor();assert.match(await page.title(),/Where the Mist Belongs/);assert.equal(await page.locator('.itinerary-day').count(),4);
await page.locator('.itinerary-day').nth(1).locator('summary').click();assert.equal(await page.locator('.itinerary-day').nth(1).evaluate(d=>d.open),true);
await page.getByRole('tab',{name:'What can be arranged'}).focus();await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'What’s extra'}).getAttribute('aria-selected'),'true');assert.match(await page.locator('#inclusion-panel').innerText(),/Flights and rail tickets/);
const itineraryDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Keep this suggested itinerary'}).click();const itinerary=await itineraryDownload;assert.match(itinerary.suggestedFilename(),/munnar-mist/);
await page.getByRole('button',{name:'Design this journey',exact:true}).click();assert.equal(await page.locator('#planner-destination').inputValue(),'munnar-mist');assert.equal(await page.locator('.planner-brand img').getAttribute('src'),'/trip-tastic-logo.jpeg');
await page.locator('#planner-form [name=date]').fill(date);await page.locator('#wizard-next').click();await page.locator('#planner-form [name=budget]').selectOption('25000-40000');await page.getByLabel('A bit of both',{exact:true}).check();await page.locator('#planner-form [name=notes]').fill('Automated QA record — safe to remove.');await page.locator('#wizard-next').click();
await page.locator('#planner-form [name=name]').fill('Automated QA');await page.locator('#planner-form [name=email]').fill(email);await page.locator('#planner-form [name=consent]').check();
await page.locator('#planner-form [data-info=privacy]').click();assert.equal(await page.locator('#planner-dialog').evaluate(d=>d.open),true);await page.getByRole('button',{name:'Close window',exact:true}).click();assert.equal(await page.locator('body').evaluate(b=>b.style.overflow),'hidden');
const apiResponse=page.waitForResponse(r=>r.url().endsWith('/api/enquiries')&&r.request().method()==='POST');await page.locator('#wizard-submit').click();const response=await apiResponse;assert.equal(response.status(),201);const body=await response.json();assert.equal(body.saved,true);savedReference=body.reference;assert.match(savedReference,/^TT-[A-F0-9]{12}$/);
await page.locator('#planner-success').waitFor({state:'visible'});assert.equal(await page.locator('#enquiry-reference').innerText(),savedReference);
const briefDownload=page.waitForEvent('download');await page.locator('#download-brief').click();const brief=await briefDownload;const stream=await brief.createReadStream();let briefText='';for await(const chunk of stream)briefText+=chunk;assert.match(briefText,new RegExp(savedReference));assert.match(briefText,/not a confirmed booking/i);
// Verify actual persistence, not just a frontend success screen.
const db=new DatabaseSync('.data/enquiries.sqlite');const row=db.prepare('SELECT * FROM enquiries WHERE id=?').get(savedReference);assert.equal(row.email,email);assert.equal(row.destination,'munnar-mist');assert.equal(row.travellers,2);assert.equal(row.consent,1);db.close();
await page.getByRole('button',{name:'Close journey planner',exact:true}).click();
await page.goto(base+'/#/journal/packing-light');assert.match(await page.locator('.article-hero h1').innerText(),/Pack lighter/);await page.locator('#article-packing').click();await page.getByRole('checkbox',{name:'Photo ID & travel documents',exact:true}).check();assert.match(await page.locator('#packing-progress').innerText(),/1 of 12/);await page.getByRole('button',{name:'Close window',exact:true}).click();await page.reload();await page.locator('#article-packing').click();assert.equal(await page.getByRole('checkbox',{name:'Photo ID & travel documents',exact:true}).isChecked(),true);await page.locator('#reset-packing').click();assert.match(await page.locator('#packing-progress').innerText(),/0 of 12/);await page.keyboard.press('Escape');
await page.goto(base);await page.waitForTimeout(1300);await page.getByRole('button',{name:'Pause decorative motion',exact:true}).click();assert.equal(await page.locator('#hero-video').evaluate(v=>v.paused),true);assert.equal(await page.locator('.statement-marquee>div').evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
await page.getByRole('button',{name:'Play decorative motion',exact:true}).click();
await page.evaluate(()=>{window.originalPlayer=document.querySelector('#hero-video');window.originalTime=window.originalPlayer.currentTime;});
await page.locator('#watch-film').click();await page.waitForFunction(()=>document.querySelector('#film-dialog video')?.currentTime>.15);
assert.equal(await page.locator('video').count(),1);assert.equal(await page.evaluate(()=>document.querySelector('#film-dialog video')===window.originalPlayer),true);
assert.equal(await page.evaluate(()=>document.querySelector('#hero-video').currentTime>=window.originalTime-.1),true);
await page.keyboard.press('Escape');await page.locator('.hero-visual #hero-video').waitFor();assert.equal(await page.locator('.hero-visual #hero-video').count(),1);
for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:844});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Horizontal overflow at ${width}`);}
await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('.site-header .brand-logo').isVisible(),true);await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.locator('.main-nav').getByRole('link',{name:'Road notes',exact:true}).click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.documentElement.classList.contains('motion-paused'));assert.equal(await page.locator('#hero-video').evaluate(v=>v.paused),true);
await page.goto(base+'/#/journey/not-a-place');assert.match(await page.locator('.not-found h1').innerText(),/Off the map/);
// API protections and validation. No public read endpoint exposes enquiries.
const request=page.request;
assert.equal((await request.get(base+'/api/enquiries')).status(),405);
assert.equal((await request.get(base+'/api/enquiries/'+savedReference)).status(),404);
assert.equal((await request.post(base+'/api/enquiries',{data:{name:'Bad'}})).status(),422);
assert.equal((await request.post(base+'/api/enquiries',{headers:{Origin:'https://evil.example'},data:{name:'Bad'}})).status(),403);
assert.equal((await request.post(base+'/api/enquiries',{headers:{'Content-Type':'text/plain'},data:'bad'})).status(),415);
assert.equal((await request.post(base+'/api/enquiries',{data:{website:'spam'}})).status(),400);
assert.equal((await request.post(base+'/api/enquiries',{data:{notes:'x'.repeat(17000)}})).status(),413);
const duplicatePayload={name:'Automated QA',email,destination:'munnar-mist',date,travellers:2,budget:'25000-40000',pace:'A bit of both',notes:'Automated QA record — safe to remove.',consent:true,phone:''};
const duplicate=await request.post(base+'/api/enquiries',{data:duplicatePayload});assert.equal(duplicate.status(),200);assert.equal((await duplicate.json()).reference,savedReference);
const past=await request.post(base+'/api/enquiries',{data:{...duplicatePayload,date:'2020-01-01'}});assert.equal(past.status(),422);assert.ok((await past.json()).fields.date);
assert.deepEqual(errors,[]);
// Verify the unconfigured site never downloads or plays the rejected animation.
const fallback=await page.context().newPage();await filmFixture(fallback,{available:false});const fallbackRequests=[];fallback.on('request',r=>fallbackRequests.push(r.url()));
await fallback.goto(base);await fallback.waitForTimeout(400);
assert.equal(await fallback.locator('#watch-film').isVisible(),false);
assert.equal(await fallback.locator('#hero-video').evaluate(v=>!v.getAttribute('src')&&v.paused),true);
assert.equal(fallbackRequests.some(url=>url.includes('cinematic-drive.mp4')),false);
await fallback.close();
// A completed film stays completed after scroll, SPA navigation, motion toggles,
// enlargement and page reload in the same tab. No duplicate media element.
const once=await page.context().newPage();await once.setViewportSize({width:1440,height:1000});await filmFixture(once);await once.goto(base);
await once.waitForFunction(()=>document.querySelector('#hero-video').currentTime>.1);
await once.locator('#hero-video').evaluate(v=>{v.currentTime=v.duration-.25;v.play();});
await once.waitForFunction(()=>document.querySelector('#hero-video').ended);
await once.evaluate(()=>scrollTo({top:innerHeight*2,behavior:'instant'}));await once.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
await once.getByRole('button',{name:'Pause decorative motion',exact:true}).click();await once.getByRole('button',{name:'Play decorative motion',exact:true}).click();
await once.evaluate(()=>location.hash='/journey/nilgiri-slowdown');await once.locator('.detail-hero h1').waitFor();await once.evaluate(()=>location.hash='');await once.locator('.hero').waitFor();
await once.locator('#watch-film').click();assert.equal(await once.locator('video').count(),1);assert.equal(await once.locator('#hero-video').evaluate(v=>v.paused&&v.currentTime>14.8),true);await once.keyboard.press('Escape');
const repeatedRequests=[];once.on('request',r=>repeatedRequests.push(r.url()));
await once.reload();await once.waitForFunction(()=>document.querySelector('#hero-video').poster.startsWith('data:image/jpeg'));
await once.waitForTimeout(500);assert.equal(await once.locator('#hero-video').evaluate(v=>v.paused&&!v.loop&&!v.getAttribute('src')),true);assert.equal(repeatedRequests.some(url=>url.endsWith('/media/hero-road-trip.mp4')),false);await once.close();
console.log('PASS: owner-footage fallback, single shared player, once-only/session-persistent playback, original-logo placements and brand icons, test-fixture autoplay, six journeys, filters/search/sort/finder, saved persistence, compare limit/table, route pages, itinerary downloads, keyboard tabs, 3-step enquiry + SQLite receipt, nested privacy dialog, brief download, journal, persistent checklist, motion controls, film, 4 responsive widths, mobile menu, reduced motion, 404 page, API validation/origin/size/privacy/idempotency.');
}finally{
 // Test records contain no real personal data; remove them after verifying storage.
 if(savedReference){const db=new DatabaseSync('.data/enquiries.sqlite');db.prepare('DELETE FROM enquiries WHERE id=? AND email=?').run(savedReference,email);db.close();}
 await browser.close();
}
