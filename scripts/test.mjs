import { launchBrowser } from './browser.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
const base=process.env.TEST_URL||'http://localhost:5173';
const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const future=new Date();future.setDate(future.getDate()+40);const date=future.toISOString().slice(0,10);
const email=`qa-${Date.now()}@example.test`;
let savedReference;
try{
await page.goto(base);await page.waitForFunction(()=>document.querySelector('#hero-video').currentTime>.2);
assert.ok(Math.abs(await page.locator('#hero-video').evaluate(v=>v.duration)-15)<.15);
assert.equal(await page.locator('#hero-video').evaluate(v=>v.muted&&v.loop&&v.playsInline),true);
await page.waitForTimeout(1600);
assert.equal(await page.locator('#journey-grid .journey-card').count(),6);
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
await page.getByRole('button',{name:'Design this journey',exact:true}).click();assert.equal(await page.locator('#planner-destination').inputValue(),'munnar-mist');
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
await page.getByRole('button',{name:'Play decorative motion',exact:true}).click();await page.locator('#watch-film').click();await page.waitForFunction(()=>document.querySelector('#film-dialog video').currentTime>.15);assert.equal(await page.locator('#hero-video').evaluate(v=>v.paused),true);await page.keyboard.press('Escape');
for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:844});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Horizontal overflow at ${width}`);}
await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.locator('.main-nav').getByRole('link',{name:'Road notes',exact:true}).click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
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
console.log('PASS: cinematic autoplay, six journeys, filters/search/sort/finder, saved persistence, compare limit/table, route pages, itinerary downloads, keyboard tabs, 3-step enquiry + SQLite receipt, nested privacy dialog, brief download, journal, persistent checklist, motion controls, film, 4 responsive widths, mobile menu, reduced motion, 404 page, API validation/origin/size/privacy/idempotency.');
}finally{
 // Test records contain no real personal data; remove them after verifying storage.
 if(savedReference){const db=new DatabaseSync('.data/enquiries.sqlite');db.prepare('DELETE FROM enquiries WHERE id=? AND email=?').run(savedReference,email);db.close();}
 await browser.close();
}
