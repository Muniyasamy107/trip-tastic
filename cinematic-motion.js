// Native scrolling stays native: no wheel/touch interception, pinning or scroll hijack.
// GSAP owns only these editorial transforms, never the hero video/iframe geometry.
export function setupCinematicMotion({gsap,ScrollTrigger,initialPaused=false,initialActive=true}){
 const home=document.querySelector('#home-page');
 let paused=initialPaused,active=initialActive,context=null;
 const reveals=new Map();
 const rotors=[...home.querySelectorAll('.cine-compass,.rotating-seal,.about-mark')];
 home.querySelectorAll('.world-copy h2,.intro-main h2,.section-top h2,.manifesto-content h2,.about-copy h2,.closing-content h2').forEach(heading=>{
  const lines=heading.innerHTML.split(/<br\s*\/?>/i);heading.classList.add('cine-title');
  heading.innerHTML=lines.map(line=>`<span class="cine-line"><span class="cine-line-inner">${line}</span></span>`).join('');
 });
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.classList.toggle('cine-in-view',entry.isIntersecting);},{threshold:.05});
 rotors.forEach(el=>observer.observe(el));
 const running=()=>!paused&&active&&!document.hidden;
 function finishReveals(predicate=()=>true){for(const [el,tween] of reveals){if(!predicate(el))continue;tween.progress(1);tween.scrollTrigger?.kill();tween.kill();reveals.delete(el);}}
 function clearScenes(){if(context){context.revert();context=null;}home.dataset.cinema='still';}
 function buildScenes(){
  if(context)return;
  context=gsap.context(()=>{
   const mobile=innerWidth<=700;
   const scrub=(trigger)=>({trigger,start:'top bottom',end:'bottom top',scrub:.65,invalidateOnRefresh:true});
   gsap.to('.hero-copy',{y:mobile?-24:-65,opacity:.45,force3D:false,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.65}});
   gsap.fromTo('.cine-band-track',{xPercent:3},{xPercent:mobile?-20:-30,force3D:false,ease:'none',scrollTrigger:scrub('.cine-title-band')});
   gsap.fromTo('.cine-compass-needle',{rotation:-40,svgOrigin:'100 100'},{rotation:230,ease:'none',scrollTrigger:scrub('.introduction')});
   for(const selector of ['.manifesto-image','.closing-section']){
    const stage=home.querySelector(selector),image=stage?.querySelector(':scope > img');if(!image)continue;
    gsap.fromTo(image,{scale:1.14,yPercent:mobile?-2.5:-5},{scale:1.14,yPercent:mobile?2.5:5,force3D:false,ease:'none',scrollTrigger:scrub(stage)});
   }
   home.querySelectorAll('.process-step>svg').forEach(icon=>gsap.fromTo(icon,{rotation:-22},{rotation:35,ease:'none',scrollTrigger:scrub(icon.closest('.process-step'))}));
   home.querySelectorAll('.step-index i').forEach(line=>gsap.fromTo(line,{scaleX:0,transformOrigin:'left'},{scaleX:1,ease:'none',scrollTrigger:{trigger:line.closest('.process-step'),start:'top 85%',end:'bottom 45%',scrub:.5}}));
   const path=home.querySelector('.mini-route path'),dot=home.querySelector('.cine-route-traveller');
   if(path&&dot){const length=path.getTotalLength(),travel={progress:0};
    gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});
    gsap.to(path,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.introduction',start:'top 85%',end:'bottom 35%',scrub:.5}});
    gsap.to(travel,{progress:1,ease:'none',scrollTrigger:{trigger:'.introduction',start:'top 85%',end:'bottom 35%',scrub:.5},onUpdate:()=>{const point=path.getPointAtLength(length*travel.progress);dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);}});
   }
  },home);
  home.dataset.cinema='running';
 }
 function sync(){home.classList.toggle('cine-rotors-active',running());if(running())buildScenes();else clearScenes();}
 function reveal(root=document){
  finishReveals(el=>!el.isConnected||!!el.closest('[hidden]'));
  if(paused||document.hidden)return;
  root.querySelectorAll('.reveal,.cine-title').forEach(el=>{
   if(el.dataset.cineRevealed)return;
   // Titles nested in a reveal have their own line mask, not another parent fade.
   el.dataset.cineRevealed='true';
   const title=el.matches('.cine-title'),card=el.matches('.journey-card'),lines=title?[...el.querySelectorAll('.cine-line-inner')]:null;
   const targets=title?lines:el;
   const column=card&&innerWidth>700?[...el.parentElement.children].indexOf(el)%(innerWidth>1100?3:2):0;
   const from=title?{yPercent:110,rotation:1.7}:{opacity:0,y:card?56:36,...(card?{transformPerspective:1000,rotationX:6,scale:.97}:{})};
   const to=title?{yPercent:0,rotation:0,stagger:.12}:{opacity:1,y:0,...(card?{rotationX:0,scale:1}:{})};
   const tween=gsap.fromTo(targets,from,{...to,duration:title?1.35:1.15,delay:column*.09,ease:'power3.out',force3D:'auto',immediateRender:false,scrollTrigger:{trigger:el,start:'top 93%',once:true},onComplete:()=>{reveals.delete(el);gsap.set(targets,{clearProps:title?'transform':'transform,opacity'});}});
   reveals.set(el,tween);
  });
  ScrollTrigger.refresh();
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finishReveals();sync();});
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{clearScenes();sync();ScrollTrigger.refresh();},180);},{passive:true});
 sync();
 return {
  reveal,
  setPaused(value){paused=value;if(paused)finishReveals();sync();},
  setActive(value){if(active===value)return;active=value;if(!active)finishReveals(el=>home.contains(el));sync();},
 };
}
