// A single progressive-enhancement controller. Never owns the film, React trees,
// scroll position or GSAP's reveal transforms. No document-sized animation loop.
export function setupAtelierMotion({initialPaused=false}={}){
 const html=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const desktop=matchMedia('(min-width:1101px) and (hover:hover) and (pointer:fine)');
 const listeners=new AbortController(),signal=listeners.signal;
 const effects=new Map(),decorations=[],pendingImages=new Set(),readyImages=new WeakSet();
 const imageSelector='.card-image,.journal-image,.detail-hero,.article-hero,.manifesto-image';
 let paused=initialPaused,overlay=false,suspended=false,disposed=false;
 let frame=0,latest=null,tilt=null,magnet=null,rect=null,arrival=null,arrivalTimer=0;
 let cursorX=0,cursorY=0,positioned=false;
 const cursor=document.createElement('div');cursor.className='atelier-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='<span>VIEW ↗</span>';document.body.append(cursor);
 const feedback=()=>!disposed&&!paused&&!reduced.matches&&!document.hidden&&!suspended;
 const running=()=>feedback()&&!overlay;
 const pointing=()=>running()&&desktop.matches;
 function cancelEffects(){for(const [effect,finish] of effects){effect.cancel();finish();}effects.clear();}
 function animate(node,keyframes,options,done){
  if(!feedback()||typeof node.animate!=='function'){done?.();return;}
  const effect=node.animate(keyframes,options);let ended=false;
  const finish=()=>{if(ended)return;ended=true;clearTimeout(expiry);effect.onfinish=null;effect.oncancel=null;effects.delete(effect);done?.();};
  // Offscreen render throttling must not leave decorative nodes behind.
  const expiry=setTimeout(()=>{effect.cancel();finish();},Number(options.duration)+250);
  effects.set(effect,finish);effect.onfinish=finish;effect.oncancel=finish;
 }
 function removeArrival(){clearTimeout(arrivalTimer);arrival?.remove();arrival=null;}
 function resetTilt(){if(!tilt)return;tilt.classList.remove('atelier-tilting');for(const prop of ['--tilt-x','--tilt-y','--shine-x','--shine-y'])tilt.style.removeProperty(prop);tilt=null;rect=null;}
 function resetMagnet(){if(!magnet)return;magnet.style.removeProperty('--magnet-x');magnet.style.removeProperty('--magnet-y');magnet=null;}
 function resetPointer(){if(frame)cancelAnimationFrame(frame);frame=0;latest=null;positioned=false;cursor.classList.remove('is-visible','is-image');resetTilt();resetMagnet();}
 function sync(){
  html.dataset.atelierMotion=running()?'running':'still';html.dataset.atelierFeedback=feedback()?'on':'off';html.dataset.atelierPointer=pointing()?'on':'off';
  if(!pointing())resetPointer();
  if(!running()){removeArrival();cancelEffects();}
 }
 function tick(){
  frame=0;if(!pointing()||!latest)return;
  const {x,y,target}=latest;
  if(!target.isConnected){resetPointer();return;}
  if(!positioned){cursorX=x;cursorY=y;positioned=true;}
  cursorX+=(x-cursorX)*.3;cursorY+=(y-cursorY)*.3;
  cursor.style.transform=`translate3d(${(cursorX-24).toFixed(2)}px,${(cursorY-24).toFixed(2)}px,0)`;
  const hide=!!target.closest('dialog,input,textarea,select,[contenteditable],#world-globe');
  cursor.classList.toggle('is-visible',!hide);cursor.classList.toggle('is-image',!hide&&!target.closest('button')&&!!target.closest('.card-image,.journal-image'));
  const next=hide?null:target.closest('.card-image,.journal-image');
  if(next!==tilt){resetTilt();tilt=next;if(tilt)rect=tilt.getBoundingClientRect();}
  if(tilt&&rect?.width&&rect?.height){
   const px=Math.max(0,Math.min(1,(x-rect.left)/rect.width)),py=Math.max(0,Math.min(1,(y-rect.top)/rect.height));
   tilt.classList.add('atelier-tilting');tilt.style.setProperty('--tilt-x',`${((.5-py)*7).toFixed(2)}deg`);tilt.style.setProperty('--tilt-y',`${((px-.5)*8).toFixed(2)}deg`);
   tilt.style.setProperty('--shine-x',`${(px*100).toFixed(1)}%`);tilt.style.setProperty('--shine-y',`${(py*100).toFixed(1)}%`);
  }
  const nextMagnet=hide?null:target.closest('.button,.nav-plan');
  if(nextMagnet!==magnet){resetMagnet();magnet=nextMagnet;}
  if(magnet){const b=magnet.getBoundingClientRect();magnet.style.setProperty('--magnet-x',`${Math.max(-5,Math.min(5,(x-b.left-b.width/2)*.08)).toFixed(2)}px`);magnet.style.setProperty('--magnet-y',`${Math.max(-4,Math.min(4,(y-b.top-b.height/2)*.12)).toFixed(2)}px`);}
  // Settle and sleep. Further pointer events wake this one shared frame request.
  if(Math.abs(x-cursorX)+Math.abs(y-cursorY)>.25)frame=requestAnimationFrame(tick);
 }
 function pointer(event){if(event.pointerType!=='mouse'||!pointing())return;latest={x:event.clientX,y:event.clientY,target:event.target};if(!frame)frame=requestAnimationFrame(tick);}
 function finishImage(img){
  const stage=img.closest(imageSelector);if(!stage)return;
  stage.classList.remove('atelier-image-pending','atelier-in-view');pendingImages.delete(stage);ambientObserver.unobserve(stage);
  if(img.naturalWidth>0&&!readyImages.has(img)){readyImages.add(img);if(running())stage.classList.add('atelier-image-ready');}
 }
 function scan(root){
  if(!(root instanceof Element))return;
  const images=root.matches('img')?[root]:root.querySelectorAll('img');
  for(const img of images){const stage=img.closest(imageSelector);if(!stage)continue;if(img.complete)finishImage(img);else {stage.classList.add('atelier-image-pending');pendingImages.add(stage);ambientObserver.observe(stage);}}
 }
 const ambientObserver=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.classList.toggle('atelier-in-view',entry.isIntersecting);},{threshold:0});
 for(const section of document.querySelectorAll('.introduction,.how-section,.journal-section')){
  section.classList.add('atelier-ambient-section');
  const layer=document.createElement('div');layer.className='atelier-ambience';layer.setAttribute('aria-hidden','true');layer.innerHTML='<div class="atelier-contours"></div><div class="atelier-light"></div>';
  section.prepend(layer);decorations.push(layer);ambientObserver.observe(section);
 }
 const mutations=new MutationObserver(records=>{
  if(tilt&&!tilt.isConnected)resetPointer();
  for(const stage of pendingImages)if(!stage.isConnected){ambientObserver.unobserve(stage);pendingImages.delete(stage);}
  for(const record of records)for(const node of record.addedNodes)scan(node);
 });
 mutations.observe(document.body,{subtree:true,childList:true});scan(document.body);
 document.addEventListener('load',event=>{if(event.target instanceof HTMLImageElement)finishImage(event.target);},{capture:true,signal});
 document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement)finishImage(event.target);},{capture:true,signal});
 for(const type of ['animationend','animationcancel'])document.addEventListener(type,event=>{if(event.animationName==='atelier-image-in'&&event.target instanceof HTMLImageElement)event.target.closest(imageSelector)?.classList.remove('atelier-image-ready');},{signal});
 document.addEventListener('pointermove',pointer,{passive:true,signal});
 document.addEventListener('pointerout',event=>{if(!event.relatedTarget)resetPointer();},{signal});
 document.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse')resetPointer();},{passive:true,signal});
 document.addEventListener('keydown',()=>resetPointer(),{signal});
 document.addEventListener('scroll',resetPointer,{passive:true,signal});
 window.addEventListener('resize',resetPointer,{passive:true,signal});
 window.addEventListener('blur',resetPointer,{signal});
 document.addEventListener('visibilitychange',sync,{signal});
 desktop.addEventListener('change',sync,{signal});reduced.addEventListener('change',sync,{signal});
 window.addEventListener('pagehide',()=>{suspended=true;sync();},{signal});
 window.addEventListener('pageshow',()=>{suspended=false;sync();},{signal});
 document.addEventListener('click',event=>{
  if(!feedback())return;
  const target=event.target.closest('button,a');if(!target||target.matches(':disabled,[aria-disabled="true"]'))return;
  if(target.matches('[data-save]')){
   const icon=target.querySelector('svg');if(icon)animate(icon,[{transform:'scale(1)'},{transform:'scale(1.35) rotate(-12deg)',offset:.45},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
  if(target.matches('.button,.nav-plan,.finder-submit')){
   const b=target.getBoundingClientRect(),size=Math.max(b.width,b.height)*2;
   const ripple=document.createElement('span');ripple.className='atelier-ripple';ripple.setAttribute('aria-hidden','true');
   Object.assign(ripple.style,{width:`${size}px`,height:`${size}px`,left:`${(event.detail?event.clientX-b.left:b.width/2)-size/2}px`,top:`${(event.detail?event.clientY-b.top:b.height/2)-size/2}px`});
   target.append(ripple);animate(ripple,[{transform:'scale(0)',opacity:.6},{transform:'scale(1)',opacity:0}],{duration:620,easing:'cubic-bezier(.2,.6,.2,1)'},()=>ripple.remove());
  }
 },{capture:true,signal});
 sync();
 // A short, non-blocking welcome, never a fake network-progress indicator. No
 // font/video/network wait, no scroll lock, no repeat on routes or BFCache restore.
 if(running()&&!location.hash&&scrollY<40){
  arrival=document.createElement('div');arrival.className='atelier-arrival';arrival.setAttribute('aria-hidden','true');
  arrival.innerHTML='<img src="/trip-tastic-logo.jpeg" width="48" height="48" alt=""><div><span>TRIP-TASTIC / THE PERSONAL EDIT</span><b>A slower kind of extraordinary.</b><i></i></div>';document.body.append(arrival);
  arrivalTimer=setTimeout(removeArrival,1500);
 }
 return {
  setPaused(value){paused=value;sync();},
  setOverlay(value){overlay=value;sync();},
  routeChanged(){resetPointer();scan(document.body);for(const node of document.querySelectorAll('.detail-hero-content,.article-hero>div,.not-found'))if(running()&&!node.closest('[hidden]'))animate(node,[{opacity:.3,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.2,.7,.2,1)'});},
  destroy(){disposed=true;sync();listeners.abort();mutations.disconnect();ambientObserver.disconnect();for(const stage of pendingImages)stage.classList.remove('atelier-image-pending','atelier-in-view');pendingImages.clear();document.querySelectorAll('.atelier-image-ready').forEach(stage=>stage.classList.remove('atelier-image-ready'));cursor.remove();for(const layer of decorations){layer.parentElement?.classList.remove('atelier-ambient-section','atelier-in-view');layer.remove();}delete html.dataset.atelierMotion;delete html.dataset.atelierPointer;delete html.dataset.atelierFeedback;},
 };
}
