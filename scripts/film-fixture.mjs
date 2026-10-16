import fs from 'node:fs';
import { thumbnailFixture } from './thumbnail-fixture.mjs';
import { stockFilm } from '../film-source.js';
// Synthetic colour-chart footage, used ONLY by intercepted browser test requests.
// It is never part of public/, dist/, or the site's configured hero footage.
const body=fs.readFileSync(new URL('./fixtures/player-test.mp4',import.meta.url));
export async function filmFixture(page,{available=true,stock=false}={}){
 await thumbnailFixture(page);
 await page.route('**/api/hero-film',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(available?{available:true,src:stock?stockFilm.src:'/media/hero-road-trip.mp4',revision:stock?'synthetic-stock-fixture-v1':'synthetic-test-fixture-v1',poster:stockFilm.poster}:{available:false})}));
 if(stock)await page.route(stockFilm.src,route=>route.fulfill({status:200,contentType:'video/mp4',body}));
 await page.route('**/media/hero-road-trip.mp4',route=>route.fulfill({status:200,contentType:'video/mp4',body}));
}
