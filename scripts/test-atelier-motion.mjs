import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {filmFixture} from './film-fixture.mjs';
const base=process.env.TEST_URL||'http://localhost:5173';
fs.mkdirSync('.cache',{recursive:true});
const browser=await launchBrowser(),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
let releaseImage,releaseSubmit;
const imageGate=new Promise(resolve=>releaseImage=resolve),submitGate=new Promise(resolve=>releaseSubmit=resolve);
await filmFixture(page,{available:false});
await page.route('**/media/kodai-cinematic*.webp',async route=>{await imageGate;await route.continue();});
await page.route('**/api/enquiries',async route=>{await submitGate;await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Offline motion-test response. No enquiry was sent.'})});});
const value=selector=>page.locator(selector).first().evaluate(el=>getComputedStyle(el).transform);
try{
 await page.goto(base);await page.waitForFunction(()=>document.documentElement.dataset.atelierPointer==='on');
 assert.equal(await page.locator('.atelier-arrival img').getAttribute('src'),'/trip-tastic-logo.jpeg');
 assert.equal(await page.locator('.atelier-arrival').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
 assert.equal(await page.locator('body').evaluate(el=>el.style.overflow),'');
 await page.waitForFunction(()=>!document.querySelector('.atelier-arrival'));
 const pending=page.locator('[data-journey=kodai-light] .card-image');
 assert.ok(await pending.evaluate(el=>el.classList.contains('atelier-image-pending')));
 assert.equal(await pending.evaluate(el=>getComputedStyle(el,'::before').animationPlayState),'paused','Offscreen image shimmer sleeps');
 const card=page.locator('#journey-grid .journey-card').first(),stage=card.locator('.card-image');
 await card.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForTimeout(1500);
 const bounds=await stage.boundingBox();await page.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height*.3,{steps:5});
 await page.waitForFunction(()=>document.querySelector('.card-image.atelier-tilting')?.style.getPropertyValue('--tilt-y'));
 assert.match(await value('#journey-grid .card-image'),/^matrix3d/);
 assert.ok(await page.locator('.atelier-cursor').evaluate(el=>el.classList.contains('is-visible')&&el.classList.contains('is-image')));
 assert.equal(await card.evaluate(el=>el.style.getPropertyValue('--tilt-x')),'','Pointer effect does not take ownership of the GSAP parent');
 await page.screenshot({path:'.cache/atelier-pointer-depth.png'});
 await page.mouse.move(15,85);await page.waitForFunction(()=>!document.querySelector('.atelier-tilting'));
 assert.equal(await stage.evaluate(el=>el.style.getPropertyValue('--tilt-y')),'');
 await card.locator('[data-save]').click();assert.equal(await card.locator('[data-save]').getAttribute('aria-pressed'),'true');
 assert.ok(await card.locator('[data-save] svg').evaluate(el=>el.getAnimations().some(a=>a.playState==='running')),'Real save action has a bounded icon response');
 await page.waitForTimeout(500);await card.locator('[data-save]').focus();await page.keyboard.press('Space');
 assert.equal(await card.locator('[data-save]').getAttribute('aria-pressed'),'false','Keyboard action keeps native save semantics');
 assert.ok(await page.locator('.atelier-cursor').evaluate(el=>!el.classList.contains('is-visible')));
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(400);
 const cta=page.locator('.hero-actions .button'),buttonBounds=await cta.boundingBox();
 await page.mouse.move(buttonBounds.x+buttonBounds.width*.8,buttonBounds.y+buttonBounds.height*.65);
 await page.waitForFunction(()=>document.querySelector('.hero-actions .button').style.getPropertyValue('--magnet-x'));
 assert.ok(Math.abs((await cta.boundingBox()).x-buttonBounds.x)<1,'Button hit area stays anchored');
 assert.notEqual(await cta.locator('.button-arrow').evaluate(el=>getComputedStyle(el).translate),'none');
 // Isolate visual feedback here; the existing suite tests actual anchor routing.
 await cta.evaluate(el=>el.addEventListener('click',event=>event.preventDefault(),{once:true}));
 await cta.click();assert.equal(await cta.locator('.atelier-ripple').count(),1);await page.waitForFunction(()=>!document.querySelector('.atelier-ripple'),{},{timeout:15000}).catch(async error=>{console.log('ripple diagnostic',await page.evaluate(()=>({ripples:[...document.querySelectorAll('.atelier-ripple')].map(n=>({html:n.outerHTML,parent:n.parentElement.className,animations:n.getAnimations().map(a=>({state:a.playState,time:a.currentTime}))})),effects:document.getAnimations().length,html:document.documentElement.dataset})),errors);throw error;});assert.equal(await page.locator('.atelier-ripple').count(),0,'Ripples clean themselves up');
 await page.locator('#introduction').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 const light=page.locator('#introduction .atelier-light');
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('#introduction .atelier-light')).animationPlayState==='running');
 const initialLight=await value('#introduction .atelier-light');await page.waitForTimeout(160);assert.notEqual(await value('#introduction .atelier-light'),initialLight);
 await page.locator('#introduction').screenshot({path:'.cache/atelier-ambient-light.png',style:'.site-header{visibility:hidden!important}'});
 await page.evaluate(()=>document.querySelector('#motion-toggle').click());
 assert.equal(await page.locator('html').getAttribute('data-atelier-motion'),'still');assert.equal(await page.locator('html').getAttribute('data-atelier-pointer'),'off');
 assert.equal(await page.locator('.nav-plan').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 assert.equal(await light.evaluate(el=>getComputedStyle(el).animationPlayState),'paused');const frozen=await value('#introduction .atelier-light');await page.waitForTimeout(150);assert.equal(await value('#introduction .atelier-light'),frozen);
 await page.evaluate(()=>document.querySelector('#motion-toggle').click());
 await page.locator('.nav-plan').click();await page.locator('#planner-dialog:modal').waitFor();
 assert.equal(await page.locator('html').getAttribute('data-atelier-motion'),'still');assert.equal(await page.locator('html').getAttribute('data-atelier-feedback'),'on','Functional saving feedback may run while decorative background is frozen');
 const date=page.locator('#planner-form [name=date]');await date.fill(await date.getAttribute('min'));await page.locator('#wizard-next').click();
 await page.locator('#planner-form [name=budget]').selectOption('25000-40000');await page.locator('#wizard-next').click();
 await page.locator('#planner-form [name=name]').fill('Motion QA');await page.locator('#planner-form [name=email]').fill('motion-qa@example.invalid');await page.locator('#planner-form [name=consent]').check();
 await page.locator('#wizard-submit').click();await page.waitForFunction(()=>document.querySelector('#planner-form').getAttribute('aria-busy')==='true');
 assert.equal(await page.locator('#wizard-submit').isDisabled(),true);
 assert.equal(await page.locator('#wizard-submit .button-arrow').evaluate(el=>getComputedStyle(el,'::after').animationPlayState),'running');
 releaseSubmit();await page.waitForFunction(()=>document.querySelector('#planner-form').getAttribute('aria-busy')==='false');
 assert.equal(await page.locator('#wizard-submit').isDisabled(),false);assert.match(await page.locator('#planner-error').innerText(),/No enquiry was sent/);
 await page.getByRole('button',{name:'Close journey planner',exact:true}).click();assert.equal(await page.locator('html').getAttribute('data-atelier-motion'),'running');
 await pending.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-journey=kodai-light] .card-image').classList.contains('atelier-in-view'));
 assert.equal(await pending.evaluate(el=>getComputedStyle(el,'::before').animationPlayState),'running');releaseImage();
 await page.waitForFunction(()=>!document.querySelector('[data-journey=kodai-light] .card-image').classList.contains('atelier-image-pending'));
 assert.ok(await pending.locator('img').evaluate(img=>img.naturalWidth>0));
 // Error recovery: no permanently invisible image/indefinite shimmer after failure.
 await page.evaluate(()=>{const stage=document.createElement('div');stage.id='motion-error-fixture';stage.className='journal-image';stage.innerHTML='<img src="/media/missing-motion-fixture.webp" alt="Offline missing-image fixture">';document.body.append(stage);});
 await page.waitForFunction(()=>{const img=document.querySelector('#motion-error-fixture img');return img.complete&&!img.closest('.atelier-image-pending')&&getComputedStyle(img).opacity==='1';});
 await page.evaluate(()=>document.querySelector('#motion-error-fixture').remove());
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await page.locator('html').getAttribute('data-atelier-motion'),'still');assert.equal(await page.locator('html').getAttribute('data-atelier-pointer'),'off');
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.locator('html').getAttribute('data-atelier-motion'),'running');
 await page.evaluate(()=>location.hash='/journey/nilgiri-slowdown');await page.locator('.detail-hero-content h1').waitFor();
 assert.ok(await page.locator('.detail-hero-content').evaluate(el=>el.getAnimations().some(a=>a.playState==='running')),'Real route entrance animation');
 assert.equal(await page.locator('.atelier-arrival').count(),0,'Welcome does not replay on routes');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.documentElement.dataset.atelierPointer==='off');assert.equal(await page.locator('html').getAttribute('data-atelier-pointer'),'off');
 assert.equal(await page.locator('.atelier-cursor').evaluate(el=>getComputedStyle(el).display),'none');assert.equal(await page.locator('.detail-hero-content').evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>location.hash='');
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>document.documentElement.dataset.atelierPointer==='off');assert.equal(await page.locator('html').getAttribute('data-atelier-pointer'),'off');
 await page.locator('#journey-grid .card-image').first().scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:'.cache/atelier-motion-phone.png'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 // Isolated lifecycle check, independent of the application and its React roots.
 await page.goto('about:blank');await page.setContent('<html><body><section class="introduction"></section><div class="card-image"><img alt="Pending fixture"></div></body></html>');
 await page.addScriptTag({content:fs.readFileSync('atelier-motion.js','utf8').replace('export function setupAtelierMotion','window.createAtelierFixture=function setupAtelierMotion')});
 assert.ok(await page.evaluate(()=>{
  const image=document.querySelector('img');Object.defineProperty(image,'complete',{configurable:true,get:()=>false});
  const controller=window.createAtelierFixture({initialPaused:true});const pending=document.querySelector('.card-image').classList.contains('atelier-image-pending');controller.destroy();
  return pending&&!document.querySelector('.atelier-cursor,.atelier-ambience,.atelier-image-pending')&&!document.documentElement.dataset.atelierMotion;
 }),'Destroy restores pending-image visibility and removes owned decoration');
 console.log('PASS: non-blocking original-logo arrival; perspective hover/glare/cursor; anchored magnetic CTA; cleaned-up ripple and keyboard save response; visible-only ambient light; real image pending/success/failure; enquiry busy spinner/error recovery; pause, modal, visibility, route entrance, reduced motion and phone fallback. No customer record or real message was sent.');
}finally{releaseImage();releaseSubmit();await browser.close();}
// Separate browser: the minimal single-process Chromium does not safely close
// multiple emulated contexts in one browser (see the React touch regression).
const touchBrowser=await launchBrowser();
try{
 const touch=await touchBrowser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await filmFixture(touch,{available:false});await touch.goto(base);
 assert.equal(await touch.locator('html').getAttribute('data-atelier-pointer'),'off');
 const save=touch.locator('#journey-grid [data-save]').first();await save.tap();assert.equal(await save.getAttribute('aria-pressed'),'true');
 assert.equal(await touch.locator('.atelier-cursor').evaluate(el=>getComputedStyle(el).display),'none');assert.ok(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 console.log('PASS: separate touch browser, no mouse follower/tilt, native save tap and no horizontal overflow.');
}finally{await touchBrowser.close();}
