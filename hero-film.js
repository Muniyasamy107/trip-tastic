// One media element, one playback. No generated vehicle animation is used here.
// Supply public/media/hero-road-trip.mp4 to enable the real-film slot.
export function setupHeroFilm({video,container,dialog,stage,watchButton,durationLabel,caption,canAutoplay,onDialogOpen}) {
 let available=false,completed=false,revision='',opening=false;
 const completionKey=()=>`tt-hero-film-finished:${revision}`;
 const finishedRecord=()=>{try{const value=sessionStorage.getItem(completionKey());return value==='yes'?{finished:true}:JSON.parse(value||'null');}catch{return null;}};
 const rememberFinished=()=>{
  let poster=null;
  try{const canvas=document.createElement('canvas');canvas.width=Math.min(video.videoWidth,1280);canvas.height=Math.round(canvas.width*video.videoHeight/video.videoWidth);canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);poster=canvas.toDataURL('image/jpeg',.82);}catch{/* Keep completion even if frame capture is unavailable. */}
  try{sessionStorage.setItem(completionKey(),JSON.stringify({finished:true,poster}));}catch{/* In-memory guard still prevents repeat playback. */}
 };
 const sync=()=>{
  if(!available||completed||document.hidden||(!dialog.open&&!canAutoplay())){video.pause();return;}
  video.play().catch(()=>{/* Muted autoplay may be blocked; the user can open the film. */});
 };
 const updateFinishedLabel=()=>{
  watchButton.querySelector('[data-film-title]').textContent='THE FINAL FRAME';
  durationLabel.textContent='Viewed once · no automatic replay';
 };
 const showFallback=()=>{available=false;video.pause();video.hidden=true;watchButton.hidden=true;};
 video.loop=false;
 video.addEventListener('ended',()=>{completed=true;rememberFinished();video.pause();updateFinishedLabel();});
 // Native controls must not silently rewind/replay a completed film either.
 video.addEventListener('play',()=>{if(completed){video.pause();if(Number.isFinite(video.duration))video.currentTime=Math.max(0,video.duration-.01);}});
 video.addEventListener('loadedmetadata',()=>{
  if(completed){if(Number.isFinite(video.duration))video.currentTime=Math.max(0,video.duration-.01);video.pause();updateFinishedLabel();}
  else if(Number.isFinite(video.duration)){const seconds=Math.floor(video.duration);durationLabel.textContent=`A moment of escape · ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
 });
 video.addEventListener('loadeddata',()=>{video.hidden=false;sync();});
 video.addEventListener('error',()=>{showFallback();if(dialog.open)dialog.close();});
 watchButton.addEventListener('click',()=>{
  if(!available||opening)return;opening=true;
  // Move the existing element: preserve its source, position and completion state.
  video.pause();stage.append(video);video.controls=!completed;video.classList.add('is-expanded');
  dialog.showModal();onDialogOpen();sync();opening=false;
 });
 dialog.addEventListener('close',()=>{video.pause();video.controls=false;video.classList.remove('is-expanded');container.append(video);sync();});
 document.addEventListener('visibilitychange',sync);
 const ready=fetch('/api/hero-film',{headers:{Accept:'application/json'}}).then(async response=>{
  if(!response.ok)throw new Error('Film availability could not be checked');
  const data=await response.json();
  if(data.available!==true||data.src!=='/media/hero-road-trip.mp4'){showFallback();return;}
  revision=String(data.revision||data.src);const previous=finishedRecord();completed=previous?.finished===true;available=true;
  if(data.poster==='/media/hero-road-trip-poster.jpg')video.poster=data.poster;
  caption.textContent='Road-trip film · Supplied by the site owner · Plays once';
  watchButton.hidden=false;
  if(completed){updateFinishedLabel();video.poster=previous.poster||video.poster||'/media/western-ghats-cinematic.jpg';video.hidden=false;return;}
  video.src=data.src;video.load();sync();
 }).catch(showFallback);
 return {sync,ready,pause:()=>video.pause(),isAvailable:()=>available,isCompleted:()=>completed};
}
