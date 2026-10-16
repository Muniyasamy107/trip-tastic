import assert from 'node:assert/strict';
import fs from 'node:fs';
import { launchBrowser } from './browser.mjs';
import { youtubeFixture } from './youtube-fixture.mjs';
import { youtubeFilm } from '../film-source.js';
const base=process.env.TEST_URL||'http://localhost:5173';
const browser=await launchBrowser();const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await youtubeFixture(page);
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto(base);await page.waitForFunction(()=>window.__ytPlayers?.[0]?.state===1);
 assert.equal(await page.locator('#hero-youtube').count(),1);assert.equal(await page.locator('#hero-video').evaluate(v=>!v.getAttribute('src')&&v.paused),true);
 const url=new URL(await page.locator('#hero-youtube').getAttribute('src'));assert.equal(url.hostname,'www.youtube-nocookie.com');assert.equal(url.pathname,`/embed/${youtubeFilm.videoId}`);assert.equal(url.searchParams.get('origin'),new URL(base).origin);assert.equal(url.searchParams.get('loop'),'0');
 assert.equal(await page.locator('#hero-youtube').getAttribute('referrerpolicy'),'strict-origin-when-cross-origin');
 assert.equal(requests.some(url=>url.includes('videos.pexels.com')||url.endsWith('/hero-road-trip.mp4')),false);
 await page.evaluate(()=>{window.originalYouTubeFrame=document.querySelector('#hero-youtube');window.__ytPlayers[0].time=32;});
 await page.locator('#watch-film').click();await page.locator('#film-dialog:modal').waitFor();
 assert.equal(await page.evaluate(()=>document.querySelector('#hero-youtube')===window.originalYouTubeFrame),true);
 assert.equal(await page.evaluate(()=>window.__ytPlayers.length===1&&window.__ytPlayers[0].getCurrentTime()===32),true);
 await page.keyboard.press('Escape');await page.locator('#film-dialog.youtube-embedded').waitFor();assert.equal(await page.locator('body').evaluate(b=>b.style.overflow), '');
 await page.getByRole('button',{name:'Pause decorative motion',exact:true}).click();assert.equal(await page.evaluate(()=>window.__ytPlayers[0].state),2);
 await page.getByRole('button',{name:'Play decorative motion',exact:true}).click();assert.equal(await page.evaluate(()=>window.__ytPlayers[0].state),1);
 await page.evaluate(()=>location.hash='/journey/munnar-mist');await page.locator('.detail-hero h1').waitFor();assert.equal(await page.evaluate(()=>window.__ytPlayers[0].state),2);
 await page.evaluate(()=>location.hash='');await page.locator('.hero').waitFor();await page.waitForFunction(()=>window.__ytPlayers[0].state===1);
 // Embedded background must not keep the page scroll-locked after another dialog.
 await page.locator('.nav-plan').click();await page.locator('#planner-dialog:modal').waitFor();await page.getByRole('button',{name:'Close journey planner',exact:true}).click();assert.equal(await page.locator('body').evaluate(b=>b.style.overflow),'');
 for(const width of [360,390,768,1440]){
  await page.setViewportSize({width,height:844});await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>{const hero=document.querySelector('.hero').getBoundingClientRect(),frame=document.querySelector('#hero-youtube').getBoundingClientRect();return frame.left<=hero.left+1&&frame.right>=hero.right-1&&frame.top<=hero.top+1&&frame.bottom>=hero.bottom-1&&document.documentElement.scrollWidth<=innerWidth;}),true,`Full-cover iframe at ${width}`);
 }
 await page.evaluate(()=>window.__ytPlayers[0].end());assert.equal(await page.locator('#hero-youtube').count(),0);assert.equal(await page.locator('#watch-film').isDisabled(),true);
 const completedRequests=[];page.on('request',r=>completedRequests.push(r.url()));await page.reload();await page.locator('#watch-film:disabled').waitFor();assert.equal(completedRequests.some(url=>url.includes('youtube.com/iframe_api')||url.includes('youtube-nocookie.com/embed/')),false);
 assert.equal(await page.locator('#hero-youtube').count(),0);assert.equal(await page.locator('.hero-poster').getAttribute('src'),youtubeFilm.poster);
 const reduced=await context.newPage();await reduced.emulateMedia({reducedMotion:'reduce'});await youtubeFixture(reduced);const reducedRequests=[];reduced.on('request',r=>reducedRequests.push(r.url()));await reduced.goto(base);await reduced.locator('#watch-film').waitFor();await reduced.waitForTimeout(300);assert.equal(reducedRequests.some(url=>url.includes('youtube.com/iframe_api')),false);
 await reduced.locator('#watch-film').click();await reduced.waitForFunction(()=>window.__ytPlayers?.[0]?.state===1);await reduced.close();
 const blocked=await context.newPage();await youtubeFixture(blocked,{autoplayBlocked:true});await blocked.goto(base);await blocked.locator('.hero-film-status').filter({hasText:'Autoplay is blocked'}).waitFor();await blocked.locator('#watch-film').click();await blocked.waitForFunction(()=>window.__ytPlayers?.[0]?.state===1);await blocked.close();
 const denied=await context.newPage();await youtubeFixture(denied,{error:150});await denied.goto(base);await denied.locator('.hero-film-status').filter({hasText:'disabled embedding'}).waitFor();assert.equal(await denied.locator('#hero-youtube').count(),0);assert.equal(await denied.locator('.hero-film-credit').getAttribute('href'),youtubeFilm.source);await denied.close();
 const network=await context.newPage();await network.route('https://www.youtube.com/iframe_api',r=>r.abort());await network.goto(base);await network.locator('.hero-film-status').filter({hasText:'could not play here'}).waitFor();assert.equal(await network.locator('#hero-youtube').count(),0);await network.close();
 assert.deepEqual(errors,[]);console.log('PASS: selected YouTube ID, one persistent iframe, full-cover crop at 4 widths, modal without reparent/reload, motion/route pausing, scroll unlock, once-only completion/no provider request after reload, reduced-motion deferral, blocked-autoplay gesture recovery, embed denial and network fallback. Provider mocked; live YouTube availability is not verified.');
}finally{await browser.close();}
