import fs from 'node:fs';
// Synthetic colour-chart footage, used ONLY by intercepted browser test requests.
// It is never part of public/, dist/, or the site's configured hero footage.
const body=fs.readFileSync(new URL('./fixtures/player-test.mp4',import.meta.url));
export async function filmFixture(page,{available=true}={}){
 await page.route('**/api/hero-film',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(available?{available:true,src:'/media/hero-road-trip.mp4',revision:'synthetic-test-fixture-v1',poster:null}:{available:false})}));
 await page.route('**/media/hero-road-trip.mp4',route=>route.fulfill({status:200,contentType:'video/mp4',body}));
}
