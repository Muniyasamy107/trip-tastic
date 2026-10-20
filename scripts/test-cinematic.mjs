import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {filmFixture} from './film-fixture.mjs';
const base=process.env.TEST_URL||'http://localhost:5173';fs.mkdirSync('.cache',{recursive:true});
const browser=await launchBrowser(),context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await filmFixture(page,{available:false});
const transform=selector=>page.locator(selector).evaluate(el=>getComputedStyle(el).transform);
async function scrollScene(selector,fraction){await page.locator(selector).evaluate((el,fraction)=>{scrollTo({top:scrollY+el.getBoundingClientRect().top-innerHeight*fraction,behavior:'instant'});},fraction);}
try{
 await page.goto(base);await page.waitForFunction(()=>document.querySelector('#home-page').dataset.cinema==='running');
 assert.equal(await page.locator('.world-copy h2').innerText(),'One world.\nEndless wonder.');
 assert.equal(await page.locator('#world-globe').evaluate(el=>getComputedStyle(el).contain.includes('paint')&&getComputedStyle(el).transform!=='none'),true,'Continuous canvas retains its isolated compositor surface');
 assert.equal(await page.locator('.pin-spacer').count(),0,'No scroll pinning');
 await scrollScene('#introduction',.8);const needleBefore=await transform('.cine-compass-needle'),dashBefore=await page.locator('.mini-route path').evaluate(el=>getComputedStyle(el).strokeDashoffset);
 await scrollScene('#introduction',.15);await page.waitForFunction(before=>getComputedStyle(document.querySelector('.cine-compass-needle')).transform!==before,needleBefore);await page.waitForTimeout(800);assert.notEqual(await page.locator('.mini-route path').evaluate(el=>getComputedStyle(el).strokeDashoffset),dashBefore);
 const compass=await transform('.cine-compass-ring');await page.waitForFunction(before=>getComputedStyle(document.querySelector('.cine-compass-ring')).transform!==before,compass);
 await page.locator('#introduction').screenshot({style:'.site-header,.skip-link{visibility:hidden!important}',path:'.cache/cinema-introduction.png'});
 await scrollScene('.cine-title-band',.8);const bandBefore=await transform('.cine-band-track');await scrollScene('.cine-title-band',.15);await page.waitForFunction(before=>getComputedStyle(document.querySelector('.cine-band-track')).transform!==before,bandBefore);
 await page.locator('.cine-title-band').screenshot({style:'.site-header,.skip-link{visibility:hidden!important}',path:'.cache/cinema-type-band.png'});
 await page.evaluate(()=>{window.cardRotationSeen=false;const observer=new MutationObserver(()=>{if([...document.querySelectorAll('#journey-grid .journey-card')].some(el=>el.style.transform.includes('perspective'))){window.cardRotationSeen=true;observer.disconnect();}});observer.observe(document.querySelector('#journey-grid'),{subtree:true,attributes:true,attributeFilter:['style']});});
 await page.getByRole('button',{name:'Hills & tea',exact:true}).click();await page.locator('#journey-grid .journey-card').first().evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForFunction(()=>window.cardRotationSeen===true);
 await scrollScene('#philosophy',.8);const imageBefore=await transform('.manifesto-image>img');await scrollScene('#philosophy',.1);await page.waitForFunction(before=>getComputedStyle(document.querySelector('.manifesto-image>img')).transform!==before,imageBefore);await page.waitForTimeout(900);
 await page.locator('#philosophy').screenshot({style:'.site-header,.skip-link{visibility:hidden!important}',path:'.cache/cinema-manifesto.png'});
 // Pausing must restore readable content and neutral editorial transforms.
 await page.evaluate(()=>document.querySelector('#motion-toggle').click());assert.equal(await page.locator('#home-page').getAttribute('data-cinema'),'still');assert.equal(await transform('.manifesto-image>img'),'none');
 await scrollScene('#introduction',.25);const pausedRing=await transform('.cine-compass-ring');await page.waitForTimeout(200);assert.equal(await transform('.cine-compass-ring'),pausedRing);assert.equal(await page.locator('.intro-main').evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.evaluate(()=>document.querySelector('#motion-toggle').click());await page.waitForFunction(()=>document.querySelector('#home-page').dataset.cinema==='running');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.locator('#home-page').getAttribute('data-cinema'),'still');await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 for(let i=0;i<3;i++){await page.goto(base+'/#/journey/munnar-mist');await page.waitForFunction(()=>document.querySelector('#home-page').dataset.cinema==='still');await page.goto(base+'/#introduction');await page.waitForFunction(()=>document.querySelector('#home-page').dataset.cinema==='running');assert.equal(await page.locator('.cine-compass').count(),1);assert.equal(await page.locator('.cine-title-band').count(),1);}
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#home-page').dataset.cinema==='still');
 // Probe the square rotation bounds at the widest angle, even with motion paused.
 await page.addStyleTag({content:'.cine-compass-ring{transform:rotate(45deg)!important}'});
 for(const [width,height]of [[320,740],[360,800],[390,844],[768,1024],[820,1180],[1024,768],[1280,800],[1440,900],[1920,1080],[844,390]]){
  await page.setViewportSize({width,height});await scrollScene('#introduction',.15);await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
  assert.equal(await page.locator('.cine-compass').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1;}),true,`Compass bounds at ${width}`);
  assert.equal(await page.locator('#introduction h2').evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);return [...range.getClientRects()].every(r=>r.left>=0&&r.right<=innerWidth+1);}),true,`Readable title at ${width}`);
  if(width===390)await page.locator('#introduction').screenshot({style:'.site-header,.skip-link{visibility:hidden!important}',path:'.cache/cinema-mobile.png'});
 }
 // Preference respected from first load, and ordinary filters still work.
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForFunction(()=>document.querySelector('#home-page').dataset.cinema==='still');assert.ok(await page.locator('.cine-title').count()>5);
 assert.equal(await page.locator('.cine-title').first().evaluate(el=>getComputedStyle(el.querySelector('.cine-line-inner')).transform),'none');
 await page.getByRole('button',{name:'Hills & tea',exact:true}).click();assert.equal(await page.locator('#journey-grid .journey-card').count(),3);assert.equal(await page.locator('#journey-grid .journey-card').first().evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.getByRole('button',{name:'All journeys',exact:false}).click();assert.equal(await page.locator('#journey-grid .journey-card').count(),6);
 assert.deepEqual(errors,[]);console.log('PASS: masked headings, scroll-linked compass/road/type band/parallax, visible rotation, global pause/readability, hidden-tab and route lifecycle, reduced-motion initial/change, 10 responsive sizes, filters, no pinning or page errors. Hero footage geometry/source unchanged.');
}catch(error){await page.screenshot({path:'.cache/cinema-failure.png',fullPage:true}).catch(()=>{});throw error;}finally{await browser.close();}
