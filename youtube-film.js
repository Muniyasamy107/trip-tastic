import { youtubeFilm } from './film-source.js';

let apiPromise;
function loadYouTubeAPI(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.id='youtube-iframe-api';
  const previous=window.onYouTubeIframeAPIReady;
  const timer=setTimeout(()=>reject(new Error('YouTube player timed out')),12000);
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);try{previous?.();}finally{resolve(window.YT);}};
  script.onerror=()=>{clearTimeout(timer);reject(new Error('YouTube player could not load'));};
  document.head.append(script);
 });
 return apiPromise;
}

export function setupYouTubeFilm({video,container,dialog,stage,watchButton,durationLabel,caption,canAutoplay,onDialogOpen}){
 const key=`tt-hero-film-finished:${youtubeFilm.revision}`;
 let completed=false,failed=false,expanded=false,player,frame,playerReady=false,initializing=false,progressTimer,readyTimer;
 try{completed=JSON.parse(sessionStorage.getItem(key)||'null')?.finished===true;}catch{/* In-memory completion still applies. */}
 video.hidden=true;video.removeAttribute('src');container.dataset.filmProvider='youtube';
 const credit=document.querySelector('.hero-film-credit');credit.href=youtubeFilm.source;credit.textContent='WATCH ON YOUTUBE / THE INDIAN AMBIENCE ↗';
 const byline=document.querySelector('.hero-coordinate>span');if(byline)byline.textContent='A FILM BY THE INDIAN AMBIENCE';
 const poster=container.querySelector('.hero-poster');poster.src=youtubeFilm.poster;poster.alt='Official YouTube thumbnail for South India by The Indian Ambience';
 caption.textContent=`${youtubeFilm.title} · ${youtubeFilm.credit} · Creator-labelled 4K · YouTube auto quality · Plays once`;
 const status=document.createElement('p');status.className='hero-film-status';status.setAttribute('role','status');status.hidden=true;watchButton.parentElement.after(status);
 const message=text=>{status.textContent=text;status.hidden=!text;};
 const finishedLabel=()=>{watchButton.querySelector('[data-film-title]').textContent='FILM VIEWED';durationLabel.textContent='Viewed once · no automatic replay';watchButton.disabled=true;container.style.setProperty('--film-progress','100%');};
 watchButton.hidden=false;
 if(completed){finishedLabel();return {ready:Promise.resolve(),sync(){},pause(){},isAvailable:()=>true,isCompleted:()=>true};}
 durationLabel.textContent='YouTube · Auto quality';
 // Keep the iframe in this dialog permanently. Changing nonmodal/modal state
 // does not reparent the browsing context or restart/reload the movie.
 container.append(dialog);dialog.classList.add('youtube-embedded');dialog.setAttribute('role','presentation');dialog.setAttribute('open','');
 stage.classList.add('youtube-stage');
 const resize=()=>{
  if(!frame)return;
  const rect=stage.getBoundingClientRect();if(!rect.width||!rect.height)return;
  // A modest header overscan keeps cover edges clean; enlarged playback shows
  // the complete uncropped player, with native quality controls available.
  const width=expanded?rect.width:Math.max(rect.width,rect.height*16/9)*1.04;
  frame.style.width=`${width}px`;frame.style.height=`${expanded?rect.height:width*9/16}px`;
 };
 const observer=new ResizeObserver(resize);observer.observe(stage);
 const command=method=>{if(playerReady)try{player?.[method]?.();}catch{/* Provider may be buffering or tearing down. */}};
 const clearTimers=()=>{clearTimeout(readyTimer);clearInterval(progressTimer);};
 const destroy=()=>{clearTimers();try{player?.destroy();}catch{}frame?.remove();frame=null;playerReady=false;};
 const failure=code=>{
  if(failed||completed)return;failed=true;destroy();watchButton.hidden=true;
  if(expanded)dialog.close();else dialog.removeAttribute('open');
  message(code===101||code===150?'The owner has disabled embedding. Use the YouTube link below to watch.':code===100?'This film is unavailable. Use the YouTube link below to check it.':'YouTube could not play here. Use the YouTube link below, or check your connection and reload.');
 };
 const finish=()=>{
  if(completed)return;completed=true;
  try{sessionStorage.setItem(key,JSON.stringify({finished:true}));}catch{}
  // YouTube does not permit canvas frame capture. Restore the official thumbnail,
  // and remove the ended player so recommendations cannot become a replay.
  destroy();stage.style.backgroundImage=`url("${youtubeFilm.poster}")`;finishedLabel();message('Film viewed once. The film thumbnail is shown; it will not automatically replay in this tab.');
 };
 const shouldPlay=()=>!document.hidden&&(expanded||canAutoplay());
 async function initialize(){
  if(initializing||player||failed||completed)return;initializing=true;
  try{
   const YT=await loadYouTubeAPI();if(failed||completed)return;
   const url=new URL(`https://www.youtube-nocookie.com/embed/${youtubeFilm.videoId}`);
   Object.entries({enablejsapi:'1',origin:location.origin,autoplay:'0',mute:'1',playsinline:'1',controls:'1',loop:'0',rel:'0'}).forEach(([k,v])=>url.searchParams.set(k,v));
   frame=document.createElement('iframe');frame.id='hero-youtube';frame.title=youtubeFilm.title;frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.tabIndex=expanded?0:-1;frame.style.visibility=expanded?'visible':'hidden';frame.src=url.href;stage.append(frame);resize();
   readyTimer=setTimeout(()=>failure(),15000);
   player=new YT.Player(frame,{host:'https://www.youtube-nocookie.com',events:{
    onReady:event=>{if(failed||completed)return;player=event.target;playerReady=true;clearTimeout(readyTimer);command('mute');sync();progressTimer=setInterval(()=>{if(!playerReady||completed||failed)return;try{const duration=player.getDuration(),time=player.getCurrentTime();if(duration>0){container.style.setProperty('--film-progress',`${Math.min(100,time/duration*100)}%`);const seconds=Math.floor(duration),hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60);durationLabel.textContent=`${hours?`${hours}:${String(minutes).padStart(2,'0')}`:minutes}:${String(seconds%60).padStart(2,'0')} · Auto quality`;}}catch{}},500);},
    onStateChange:event=>{if(completed||failed)return;if(event.data===0){finish();return;}if(event.data===1){frame.style.visibility='visible';message('');if(!shouldPlay())command('pauseVideo');}},
    onAutoplayBlocked:()=>{if(expanded&&frame)frame.style.visibility='visible';watchButton.querySelector('[data-film-title]').textContent='PLAY THE FILM';message('Autoplay is blocked. Select Play the film to start, or open it on YouTube.');},
    onError:event=>failure(event.data),
   }});
  }catch{failure();}finally{initializing=false;}
 }
 function sync(){
  if(completed||failed)return;
  if(!shouldPlay()){command('pauseVideo');return;}
  if(!player){void initialize();return;}
  command('playVideo');
 }
 watchButton.addEventListener('click',()=>{
  if(completed||failed||expanded)return;
  expanded=true;dialog.close();dialog.classList.remove('youtube-embedded');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-label',youtubeFilm.title);dialog.showModal();onDialogOpen();if(frame){frame.tabIndex=0;frame.style.visibility='visible';}resize();sync();
 });
 dialog.addEventListener('close',()=>{
  // Ignore the queued close event from the nonmodal -> modal transition.
  if(dialog.open)return;
  if(!expanded)return;
  expanded=false;dialog.classList.add('youtube-embedded');dialog.setAttribute('role','presentation');dialog.removeAttribute('aria-label');
  if(!failed)dialog.setAttribute('open','');if(frame)frame.tabIndex=-1;resize();sync();watchButton.focus({preventScroll:true});
 });
 document.addEventListener('visibilitychange',sync);
 sync();
 return {ready:Promise.resolve(),sync,pause:()=>command('pauseVideo'),isAvailable:()=>!failed,isCompleted:()=>completed};
}
