import { youtubeFilm } from '../film-source.js';
// Synthetic, labelled still for offline tests only; never copied into public/.
export async function thumbnailFixture(page){
 await page.route(youtubeFilm.poster,route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#8ea984"/><path d="M0 250 170 100 350 250 480 160V360H0Z" fill="#517e71"/><text x="20" y="320" font-size="18" fill="white">OFFLINE THUMBNAIL TEST</text></svg>'}));
}
