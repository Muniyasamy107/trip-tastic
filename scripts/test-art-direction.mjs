import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {thumbnailFixture} from './thumbnail-fixture.mjs';
import {journeys} from '../journeys.js';
import {responsiveEditorial} from '../editorial-media.js';

const base=process.env.TEST_URL||'http://localhost:5173';
assert.equal(new Set(journeys.map(j=>j.image)).size,6,'Each destination needs its own editorial image');
for(const name of ['valparai','coorg','nilgiris','kodai']){
 const src=`/media/${name}-cinematic.webp`;
 const image=responsiveEditorial(src,'86vw');
 assert.equal(image.sizes,'86vw');assert.match(image.srcSet,/640w, .*960w, .*1264w$/);
 for(const suffix of ['', '-640','-960'])assert.ok(fs.statSync(`public/media/${name}-cinematic${suffix}.webp`).size<270_000);
}
assert.deepEqual(responsiveEditorial('https://example.com/image.webp'),{});
const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try{
 await thumbnailFixture(page);await page.goto(base);await page.evaluate(()=>document.fonts.ready);
 await page.locator('#journey-grid .journey-card').first().scrollIntoViewIfNeeded();
 await page.locator('#journey-grid .journey-card img').first().evaluate(img=>img.decode());
 assert.match(await page.locator('#journey-grid .journey-card img').first().evaluate(img=>img.currentSrc),/-640\.webp$/,'Phone requests the small source, not the full editorial image');
 for(const [width,height] of [[320,740],[390,844],[768,1024],[1024,768],[1440,1000],[1920,1080],[844,390]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth,{},{timeout:3000});
  const layout=await page.evaluate(()=>{
   const nav=document.querySelector('.main-nav'),brand=document.querySelector('.wordmark').getBoundingClientRect(),tools=document.querySelector('.header-tools').getBoundingClientRect(),r=nav.getBoundingClientRect();
   const visible=getComputedStyle(nav).display!=='none'&&getComputedStyle(nav).visibility!=='hidden';
   const title=document.querySelector('.hero h1').getBoundingClientRect();
   return {navClear:!visible||(r.left>=brand.right-1&&r.right<=tools.left+1),titleFits:title.right<=innerWidth+1&&title.left>=0};
  });
  assert.ok(layout.navClear,`Navigation collision at ${width}`);assert.ok(layout.titleFits,`Hero title overflow at ${width}`);
  if([390,1440].includes(width))await page.screenshot({path:`.cache/atelier-hero-${width}.png`});
  const cards=page.locator('#journey-grid .journey-card');assert.equal(await cards.count(),6);
  const positions=await cards.evaluateAll(nodes=>nodes.map(card=>{const r=card.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,right:r.right}}));
  assert.ok(positions.every(r=>r.left>=-1&&r.right<=width+1&&r.width>200),`Card bounds at ${width}`);
  if(width>1100){assert.equal(Math.round(positions[0].top),Math.round(positions[1].top));assert.ok(positions[0].width>positions[1].width);assert.ok(positions[2].width<positions[3].width);}
  if(width<=700)assert.ok(positions[1].top>positions[0].top,'Single-column phone collection');
  if([390,768,1440].includes(width)){
   await cards.first().scrollIntoViewIfNeeded();await page.waitForTimeout(150);
   await page.screenshot({path:`.cache/atelier-collection-${width}.png`});
  }
 }
 await page.getByRole('button',{name:'About the imagery ↗',exact:true}).click();
 await page.locator('#content-dialog:modal').waitFor();assert.match(await page.locator('#content-dialog').innerText(),/AI-created mood visuals/);
 await page.keyboard.press('Escape');assert.deepEqual(errors,[]);
 console.log('PASS: seven responsive layouts, asymmetric desktop/single-column phone collection, header and title bounds, six unique destination images, responsive WebP selection/budgets, and visible AI-imagery disclosure. Screenshots use a labelled offline thumbnail, not a substitute film.');
}finally{await browser.close();}
