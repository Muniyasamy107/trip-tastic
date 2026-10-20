import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {filmFixture} from './film-fixture.mjs';
const base=process.env.TEST_URL||'http://localhost:5173';
const html=fs.readFileSync('index.html','utf8');assert.match(html,/href="tel:\+917303215348"/);assert.match(html,/href="mailto:triptasticholidays1430@gmail.com"/);assert.match(html,/href="https:\/\/www.instagram.com\/triptastic_holidays_\/"/);assert.equal(html.includes('utm_source=qr'),false);
const response=await fetch(base+'/api/site-settings');assert.equal(response.status,200);const {socials}=await response.json();
const browser=await launchBrowser();const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',hasTouch:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await filmFixture(page,{available:false});
try{
 await page.goto(base);await page.addStyleTag({content:'.about-mark::after{animation:none!important;transform:rotate(45deg)!important}'});await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(expected=>document.querySelector('#footer-call').getAttribute('href')===(expected.phone?`tel:+${expected.phone}`:null)&&document.querySelector('#footer-instagram').getAttribute('href')===(expected.instagram||null),socials);
 const call=/^[1-9]\d{7,14}$/.test(socials.phone)?`tel:+${socials.phone}`:null;const email=socials.email?`mailto:${encodeURIComponent(socials.email).replace(/%40/gi,'@')}`:null;
 assert.equal(await page.locator('.header-call').getAttribute('href'),call);assert.equal(await page.locator('#footer-call').getAttribute('href'),call);assert.equal(await page.locator('#footer-email').getAttribute('href'),email);assert.equal(await page.locator('#footer-instagram').getAttribute('href'),socials.instagram||null);
 for(const [width,height]of [[320,740],[360,800],[390,844],[768,1024],[820,1180],[1024,768],[1280,800],[1440,900],[1920,1080],[844,390]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth,{},{timeout:3000});
  assert.equal(await page.evaluate(()=>{const brand=document.querySelector('.site-header .wordmark').getBoundingClientRect(),tools=document.querySelector('.header-tools').getBoundingClientRect();return brand.right<=tools.left+1&&tools.right<=innerWidth+1;}),true,`Header collision at ${width}×${height}`);
  assert.equal(await page.locator('.header-call').evaluate(a=>a.getBoundingClientRect().width>=44&&a.getBoundingClientRect().height>=44),true);
  for(const id of ['footer-call','footer-email','footer-whatsapp','footer-instagram'])assert.equal(await page.locator('#'+id).evaluate(a=>a.getBoundingClientRect().width>=44&&a.getBoundingClientRect().height>=44),true);
  if(width<=700){await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.locator('.main-nav').getByRole('link',{name:'Road notes',exact:true}).click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');}
  if([390,768,1440].includes(width)){await page.locator('.site-footer').scrollIntoViewIfNeeded();await page.locator('.footer-socials').screenshot({path:`.cache/contact-footer-${width}.png`});}
 }
 await page.setViewportSize({width:390,height:844});await page.locator('.site-footer [data-plan=custom]').first().click();await page.locator('#planner-dialog').waitFor({state:'visible'});assert.equal(await page.locator('#planner-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1),true);await page.getByRole('button',{name:'Close journey planner',exact:true}).click();
 assert.deepEqual(errors,[]);console.log('PASS: clean owner contact defaults, native call/email URLs, published contact overrides, 10 phone/tablet/laptop/desktop/landscape viewports, no horizontal overflow/header collisions, touch target sizes, mobile navigation and planner width. No real calls/emails/social messages were placed.');
}catch(error){await page.screenshot({path:'.cache/contact-layout-failure.png',fullPage:true}).catch(()=>{});throw error;}finally{await browser.close();}
