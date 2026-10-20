import {setupWorldFlight as setupCanvasFlight} from './world-flight-fallback.js';

// A lazy React boundary owns the interactive globe and signature chapters only.
// Existing routing, enquiries, published pricing and owner authentication stay intact.
export function setupWorldFlight({stage,canvas,initialPaused=false,initialActive=true,onLayout,scrollTo}){
 const originalLabel=stage.getAttribute('aria-label');
 let fallback=null,mounted=false,loading=false,glSupported=null;
 let snapshot={paused:initialPaused,active:initialActive,documentVisible:!document.hidden,globeVisible:false,overlay:false,webgl:false};
 const story=document.querySelector('#luxury-chapters'),pinMedia=matchMedia('(min-width:1100px) and (min-height:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 function reserve(){story.dataset.reservePin=String(pinMedia.matches&&!snapshot.paused&&snapshot.active&&!reduced.matches);}
 reserve();pinMedia.addEventListener('change',reserve);reduced.addEventListener('change',reserve);
 const listeners=new Set();
 const store={getSnapshot:()=>snapshot,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
 function publish(patch){snapshot={...snapshot,...patch};reserve();listeners.forEach(fn=>fn());}
 function useFallback(){
  if(fallback)return;stage.classList.remove('is-webgl');stage.removeAttribute('tabindex');stage.removeAttribute('aria-describedby');stage.setAttribute('role','img');stage.setAttribute('aria-label',originalLabel||'Earth and an orbiting airplane illustration');
  fallback=setupCanvasFlight({stage,canvas});fallback.setPaused(snapshot.paused||snapshot.overlay);fallback.setActive(snapshot.active);
  publish({webgl:false});
 }
 function supportsWebGL(){
  if(glSupported!==null)return glSupported;
  try{const probe=document.createElement('canvas'),gl=probe.getContext('webgl2',{powerPreference:'low-power'});glSupported=!!gl;gl?.getExtension('WEBGL_lose_context')?.loseContext();}catch{glSupported=false;}
  return glSupported;
 }
 async function mount(){
  if(mounted||loading)return;loading=true;
  if(!supportsWebGL())useFallback();else publish({webgl:true});
  try{
   const {mountLuxuryExperience}=await import('./luxury/LuxuryExperience.jsx');
   const host=document.createElement('div');host.className='react-globe-host';stage.append(host);
   mountLuxuryExperience({host,stage,story:document.querySelector('#luxury-chapters'),store,onFallback:useFallback,onReady(){stage.classList.add('is-rendered','is-webgl');stage.dataset.renderer='webgl';},onLayout,scrollTo});
   mounted=true;
  }catch{mounted=true;useFallback();story.dataset.react='unavailable';story.dataset.reservePin='false';}
  finally{loading=false;}
 }
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(entry.target===stage)publish({globeVisible:entry.isIntersecting});if(entry.isIntersecting)void mount();}
 },{rootMargin:'0px',threshold:.02});
 observer.observe(stage);observer.observe(document.querySelector('#luxury-chapters'));
 document.addEventListener('visibilitychange',()=>publish({documentVisible:!document.hidden}));
 stage.dataset.renderer='poster';stage.dataset.motion='paused';
 return {
  setPaused(value){publish({paused:value});fallback?.setPaused(value||snapshot.overlay);},
  setActive(value){publish({active:value});fallback?.setActive(value);},
  setOverlay(value){publish({overlay:value});fallback?.setPaused(snapshot.paused||value);},
 };
}
