import React,{Suspense,lazy,useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore} from 'react';
import {createRoot} from 'react-dom/client';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
const GlobeScene=lazy(()=>import('./GlobeScene.jsx'));
const chapters=[
 {number:'01',label:'THE HILLS',title:'Where the world\nslows down.',place:'MUNNAR / THE WESTERN GHATS',copy:'Misty mornings. Tea-scented air. Time that feels like your own.',image:'/media/western-ghats-cinematic.jpg',route:'#/journey/munnar-mist'},
 {number:'02',label:'THE WATERS',title:'A little stillness.\nA lasting feeling.',place:'KERALA / THE BACKWATERS',copy:'Quiet waterways and unhurried days. Take the softer way home.',image:'/media/kerala-editorial.jpg',route:'#/journey/kerala-waterlines'},
 {number:'03',label:'THE QUIET',title:'Less ordinary.\nMore you.',place:'SOUTH INDIA / THE PERSONAL EDIT',copy:'A private escape, thoughtfully shaped around what moves you.',image:'/media/coorg-editorial.jpg',route:'#journeys'},
];
function useMedia(query){const [matches,set]=useState(()=>matchMedia(query).matches);useEffect(()=>{const media=matchMedia(query),change=()=>set(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[query]);return matches;}
class SceneBoundary extends React.Component{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(){this.props.onFallback();}render(){return this.state.failed?null:this.props.children;}
}
function InteractiveGlobe({store,stage,onReady,onFallback}){
 const state=useSyncExternalStore(store.subscribe,store.getSnapshot),[requested,setRequested]=useState(false);
 useEffect(()=>{if(state.globeVisible&&!state.paused&&state.webgl)setRequested(true);},[state.globeVisible,state.paused,state.webgl]);
 if(!state.webgl||!requested)return null;
 const running=!state.paused&&state.active&&state.globeVisible&&state.documentVisible&&!state.overlay;
 return <SceneBoundary onFallback={onFallback}><Suspense fallback={null}><GlobeScene running={running} stage={stage} onReady={onReady} onFallback={onFallback}/></Suspense></SceneBoundary>;
}
function SignatureChapters({store,onLayout,scrollTo}){
 const state=useSyncExternalStore(store.subscribe,store.getSnapshot),reduced=useReducedMotion();
 const desktop=useMedia('(min-width:1100px) and (min-height:760px)'),[chapter,setChapter]=useState(0),root=useRef(null),layers=useRef([]),trigger=useRef(null);
 const pin=desktop&&!state.paused&&state.active&&!reduced;
 const still=state.paused||reduced;
 useLayoutEffect(()=>{
  const el=root.current;el.dataset.pinState=pin?'pinned':'native';
  if(!pin){setChapter(0);onLayout?.();return;}
  const ctx=gsap.context(()=>{
   gsap.set(layers.current,{autoAlpha:0,scale:1.08});gsap.set(layers.current[0],{autoAlpha:1,scale:1});
   const timeline=gsap.timeline({scrollTrigger:{trigger:el,start:'top 78px',end:()=>`+=${Math.round(innerHeight*1.25)}`,pin:true,scrub:.8,invalidateOnRefresh:true,anticipatePin:1,onUpdate:self=>setChapter(previous=>{const next=Math.min(2,Math.round(self.progress*2));return previous===next?previous:next;})}});
   trigger.current=timeline.scrollTrigger;
   timeline.to(layers.current[0],{scale:1.05,autoAlpha:0,duration:.32},.14).to(layers.current[1],{autoAlpha:1,scale:1,duration:.36},.14).to(layers.current[1],{autoAlpha:0,scale:1.06,duration:.32},.64).to(layers.current[2],{autoAlpha:1,scale:1,duration:.36},.64);
  },el);
  requestAnimationFrame(()=>{ScrollTrigger.refresh();onLayout?.();});
  return()=>{trigger.current=null;ctx.revert();};
 },[pin,onLayout]);
 useEffect(()=>{if(!pin)layers.current.forEach((layer,index)=>{if(layer){layer.style.opacity=index===chapter?'1':'0';layer.style.visibility=index===chapter?'visible':'hidden';}});},[pin,chapter]);
 const selected=chapters[chapter];
 function choose(index){if(pin&&trigger.current){const t=trigger.current;scrollTo(t.start+(t.end-t.start)*(index/2),{immediate:false});}else setChapter(index);}
 return <div ref={root} className="luxury-story" data-react="signature-chapters" aria-labelledby="luxury-heading">
  <div className="luxury-story-images" aria-hidden="true">{chapters.map((item,index)=><div key={item.number} ref={el=>{layers.current[index]=el;}} className={`luxury-story-image image-${index}`}><img src={item.image} alt="" loading="lazy"/></div>)}<div className="luxury-story-shade"/></div>
  <div className="luxury-story-top"><span>THE PRIVATE EDIT</span><span>SOUTH INDIA / PERSONALLY PLANNED</span><span className="luxury-story-edition">VOL. 01 — 03</span></div>
  <div className="luxury-story-copy">
   <motion.span className="luxury-story-kicker" initial={false} animate={{opacity:1}}>{selected.place}</motion.span>
   <AnimatePresence mode="wait" initial={false}><motion.div key={chapter} initial={still?false:{opacity:0,y:25}} animate={{opacity:1,y:0}} exit={still?{opacity:1}:{opacity:0,y:-14}} transition={{duration:still?0:.55,ease:[.22,1,.36,1]}}>
    <h2 id="luxury-heading">{selected.title.split('\n').map((line,index)=><span key={line}>{index===1?<em>{line}</em>:line}</span>)}</h2><p>{selected.copy}</p>
   </motion.div></AnimatePresence>
   <a className="luxury-story-link" href={selected.route}>Discover this feeling <span aria-hidden="true">↗</span></a>
  </div>
  <div className="luxury-story-bottom"><div className="luxury-chapter-choices" role="group" aria-label="Explore the private edit">{chapters.map((item,index)=><button key={item.number} aria-pressed={chapter===index} onClick={()=>choose(index)}><span>{item.number}</span>{item.label}<i aria-hidden="true"/></button>)}</div><span className="luxury-scroll-note">{pin?'SCROLL TO UNFOLD ↓':'CHOOSE YOUR FEELING ↗'}</span></div>
  <span className="luxury-image-note">CREATIVE MOOD IMAGERY · ARRANGEMENTS BY PERSONAL QUOTE</span>
 </div>;
}
export function mountLuxuryExperience({host,stage,story,store,onReady,onFallback,onLayout,scrollTo}){
 createRoot(host).render(<InteractiveGlobe store={store} stage={stage} onReady={onReady} onFallback={onFallback}/>);
 createRoot(story).render(<SignatureChapters store={store} onLayout={onLayout} scrollTo={scrollTo}/>);
 story.dataset.react='mounted';onLayout?.();
}
