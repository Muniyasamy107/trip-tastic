import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {filmFixture} from './film-fixture.mjs';
const base=process.env.TEST_URL||'http://localhost:5173';
fs.mkdirSync('.cache',{recursive:true});
const browser=await launchBrowser();const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await filmFixture(page,{available:false});
await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'||type==='webgl2'?null:original.call(this,type,...args);};});
const phase=()=>page.locator('#world-flight-canvas').getAttribute('data-phase');
try{
 await page.goto(base);await page.waitForFunction(()=>['poster','canvas2d'].includes(document.querySelector('#world-globe').dataset.renderer));
 // No perpetual drawing while the feature is below the fold.
 assert.equal(await page.locator('#world-globe').getAttribute('data-motion'),'paused');
 await page.locator('#world-globe').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#world-globe').dataset.renderer==='canvas2d');await page.waitForFunction(()=>document.querySelector('#world-globe').dataset.motion==='running');
 const start=await phase();await page.waitForFunction(start=>document.querySelector('#world-flight-canvas').dataset.phase!==start,start);
 await page.locator('#world-of-wonder').screenshot({style:'.site-header,.skip-link{visibility:hidden!important}',path:'.cache/world-flight-desktop.png'});

 // Full orbit: front -> back -> front, with a continuously increasing phase.
 await page.waitForFunction(()=>document.querySelector('#world-flight-canvas').dataset.orbitSide==='back',{},{timeout:22000});
 await page.waitForFunction(()=>Number(document.querySelector('#world-flight-canvas').dataset.turns)>=1,{},{timeout:25000});
 await page.getByRole('button',{name:'Pause globe animation',exact:true}).click();const stopped=await phase();const pixels=await page.locator('#world-flight-canvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(350);assert.equal(await phase(),stopped);assert.equal(await page.locator('#world-flight-canvas').evaluate(c=>c.toDataURL()),pixels);assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Resume globe animation',exact:true}).click();await page.locator('#world-globe').scrollIntoViewIfNeeded();await page.waitForFunction(stopped=>document.querySelector('#world-flight-canvas').dataset.phase!==stopped,stopped);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});const hidden=await phase();await page.waitForTimeout(150);assert.equal(await phase(),hidden);await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.evaluate(()=>document.querySelector('#motion-toggle').click());assert.equal(await page.locator('#globe-motion').getAttribute('aria-pressed'),'true');await page.evaluate(()=>document.querySelector('#motion-toggle').click());
 await page.goto(base+'/#/journey/munnar-mist');await page.waitForFunction(()=>document.querySelector('#world-globe').dataset.motion==='paused');
 await page.goto(base+'/#world-of-wonder');await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#world-globe').dataset.motion==='paused');
 for(const [width,height]of [[320,740],[360,800],[390,844],[768,1024],[820,1180],[1024,768],[1280,800],[1440,900],[1920,1080],[844,390]]){
  await page.setViewportSize({width,height});await page.locator('#world-globe').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
  assert.equal(await page.locator('#world-heading').evaluate(e=>{const range=document.createRange();range.selectNodeContents(e);return [...range.getClientRects()].every(r=>r.right<=innerWidth+1&&r.left>=0);}),true,`Heading text not clipped at ${width}`);
  assert.equal(await page.locator('#world-globe').evaluate(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth+1;}),true,`Globe bounds at ${width}`);
  assert.equal(await page.locator('#world-flight-canvas').evaluate(c=>c.getContext('2d').getImageData(Math.floor(c.width/2),Math.floor(c.height/2),1,1).data[3]),255,`Canvas redraw after resize to ${width}`);
  assert.equal(await page.locator('#globe-motion').evaluate(e=>e.clientHeight>=42),true);
  if(width===390||width===768)await page.locator('#world-of-wonder').screenshot({style:'.site-header,.skip-link{visibility:hidden!important}',path:`.cache/world-flight-${width}.png`});
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#world-of-wonder [data-plan]').click();await page.locator('#planner-dialog').waitFor({state:'visible'});await page.getByRole('button',{name:'Close journey planner',exact:true}).click();
 // Reduced motion from the initial load, not only a preference change.
 await page.goto(base+'/#world-of-wonder');await page.waitForFunction(()=>document.querySelector('#world-globe').classList.contains('is-rendered'));assert.equal(await page.locator('#world-globe').getAttribute('data-motion'),'paused');const reducedPhase=await phase();await page.waitForTimeout(200);assert.equal(await phase(),reducedPhase);
 // A blocked/unsupported canvas must keep the locally served SVG and site usable.
 await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});await page.reload();await page.waitForFunction(()=>document.querySelector('#world-globe').dataset.renderer==='fallback');assert.equal(await page.locator('.world-globe-fallback').isVisible(),true);
 assert.deepEqual(errors,[]);console.log('PASS: local geographic globe, continuous full airplane orbit/front-back occlusion state, canvas pixel freeze on pause, shared motion controls, tab/route/offscreen suspension, reduced motion on load/change, 10 responsive layouts, planner CTA, no-canvas SVG fallback, no page errors. No real flight data or tracking service.');
}catch(error){console.error('Globe failure',await page.evaluate(()=>({canvas:{...document.querySelector('canvas').dataset},stage:{...document.querySelector('#world-globe').dataset},hidden:document.hidden,box:document.querySelector('#world-globe').getBoundingClientRect().toJSON()})).catch(()=>null));await page.screenshot({path:'.cache/world-flight-failure.png',fullPage:true}).catch(()=>{});throw error;}finally{await browser.close();}
