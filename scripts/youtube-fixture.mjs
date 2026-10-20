import {youtubeFilm} from '../film-source.js';
import { thumbnailFixture } from './thumbnail-fixture.mjs';
// Offline provider double. Never shipped or used by the public application.
export async function youtubeFixture(page,{error,autoplayBlocked=false}={}){
 await thumbnailFixture(page);
 await page.route('**/api/hero-film',route=>route.fulfill({json:{available:true,...youtubeFilm}}));
 const settings=JSON.stringify({error,autoplayBlocked});
 await page.route('https://www.youtube.com/iframe_api',route=>route.fulfill({contentType:'application/javascript',body:`
  const settings=${settings};window.__ytPlayers=[];
  window.YT={Player:class {
   constructor(frame,options){this.frame=frame;this.events=options.events;this.state=-1;this.time=8;this.destroyed=false;window.__ytPlayers.push(this);setTimeout(()=>{if(settings.error){this.events.onError({data:settings.error});return;}this.events.onReady({target:this});},10);}
   mute(){this.muted=true;}
   playVideo(){if(this.destroyed)return;if(settings.autoplayBlocked&&!document.querySelector('#film-dialog:modal')){this.events.onAutoplayBlocked();return;}this.state=1;this.events.onStateChange({data:1});}
   pauseVideo(){this.state=2;}
   getDuration(){return 15082;}
   getCurrentTime(){return this.time;}
   destroy(){this.destroyed=true;this.frame.remove();}
   end(){this.events.onStateChange({data:0});}
  }};window.onYouTubeIframeAPIReady();
 `}));
 await page.route('https://www.youtube-nocookie.com/embed/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0;background:#1a3232;color:#fff">Offline YouTube player test double</body></html>'}));
}
