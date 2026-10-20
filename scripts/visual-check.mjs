import {launchBrowser} from './browser.mjs';
import fs from 'node:fs';
fs.mkdirSync('.cache',{recursive:true});
const browser=await launchBrowser();const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',console.error);page.on('response',r=>{if(r.status()>=400)console.log(r.status(),r.url());});
await page.goto('http://localhost:5173/');await page.waitForTimeout(2500);await page.screenshot({path:'.cache/premium-hero.png'});
for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(120);}
await page.waitForTimeout(1200);await page.screenshot({path:'.cache/premium-full.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:5173/');await page.waitForTimeout(2300);await page.screenshot({path:'.cache/premium-mobile.png'});
console.log('Mobile widths',await page.evaluate(()=>({inner:innerWidth,page:document.documentElement.scrollWidth})));
await page.goto('http://localhost:5173/#/journey/munnar-mist');await page.waitForTimeout(1500);await page.screenshot({path:'.cache/premium-detail.png',fullPage:true});
await browser.close();
