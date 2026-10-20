import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Smooth wheel interpolation on suitable desktops. Touch, form/dialog scrolling,
// reduced motion and keyboard navigation keep their native browser behavior.
export function setupSmoothScroll({gsap,ScrollTrigger,initialPaused=false}){
 let paused=initialPaused,overlay=false,lenis=null;
 const desktop=matchMedia('(min-width: 901px) and (pointer: fine)');
 const tick=time=>lenis?.raf(time*1000);
 function destroy(){if(!lenis)return;gsap.ticker.remove(tick);lenis.destroy();lenis=null;document.documentElement.dataset.scrollEngine='native';}
 function sync(){
  if(paused||overlay||document.hidden||!desktop.matches){destroy();document.documentElement.dataset.scrollEngine='native';return;}
  if(lenis)return;
  lenis=new Lenis({autoRaf:false,smoothWheel:true,syncTouch:false,lerp:.085,anchors:false,prevent:node=>!!node.closest('dialog,[data-native-scroll],input,textarea,select')});
  lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(tick);document.documentElement.dataset.scrollEngine='lenis';
 }
 function to(target,{immediate=false,offset=0}={}){
  if(lenis)lenis.scrollTo(target,{immediate,offset,duration:1.2});
  else {const top=typeof target==='number'?target:scrollY+target.getBoundingClientRect().top;window.scrollTo({top:top+offset,behavior:immediate||paused?'instant':'smooth'});}
 }
 // Handle public in-page anchors once; the existing hash router owns navigation.
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank'||!lenis)return;
  const hash=link.getAttribute('href');if(hash.startsWith('#/'))return;
  if(hash!=='#'&&!document.getElementById(hash.slice(1)))return;
  event.preventDefault();const oldURL=location.href;history.pushState(null,'',hash);window.dispatchEvent(new HashChangeEvent('hashchange',{oldURL,newURL:location.href}));
 });
 desktop.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',destroy);window.addEventListener('pageshow',sync);
 sync();return {to,setPaused(value){paused=value;sync();},setOverlay(value){overlay=value;sync();}};
}
