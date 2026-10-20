import {landPoints} from './world-land.js';

// A local Canvas 2D orthographic globe; no WebGL, map API, cookies or CDN needed.
const TAU=Math.PI*2,rad=Math.PI/180;
const sphere=(lon,lat)=>[Math.cos(lat*rad)*Math.sin(lon*rad),-Math.sin(lat*rad),Math.cos(lat*rad)*Math.cos(lon*rad)];
const land=landPoints.map(([lon,lat])=>sphere(lon,lat));
const graticules=[...Array.from({length:12},(_,i)=>Array.from({length:73},(_,j)=>sphere(-180+i*30,-90+j*2.5))),...Array.from({length:5},(_,i)=>Array.from({length:145},(_,j)=>sphere(-180+j*2.5,-60+i*30)))];
const planePath='M22 0 Q22 -2 16 -3 L2 -4 -8 -20 -13 -20 -7 -3 -21 -4 -26 -10 -30 -10 -26 0 -30 10 -26 10 -21 4 -7 3 -13 20 -8 20 2 4 16 3 Q22 2 22 0Z';
export function setupWorldFlight({stage,canvas}){
 if(!stage||!canvas)return {setPaused(){},setActive(){}};
 // Prefer CPU rasterization for this small batched illustration; software-GPU
 // paths can be slower. Keep the normal compositor (not desynchronized) so
 // paused/resized frames remain visible in screenshots and embedded previews.
 let ctx;try{ctx=canvas.getContext('2d',{alpha:true,willReadFrequently:true});}catch{}if(!ctx){stage.dataset.renderer='fallback';return {setPaused(){},setActive(){}};}
 const aircraft=new Path2D(planePath);
 let width=600,height=540,ratio=1,frame=0,last=0,elapsed=0,visible=false,paused=true,active=true;
 const orbit=t=>{const x=Math.cos(t)*1.43,y=Math.sin(t)*.61;return [x*.927+y*.375,-x*.375+y*.927,Math.sin(t)*1.29];};
 function draw(){
  const cx=width/2,cy=height/2,r=width*.315,yaw=-.7+elapsed*TAU/85000,phase=.16+elapsed*TAU/19000;
  const cosYaw=Math.cos(yaw),sinYaw=Math.sin(yaw),project=v=>{const x=v[0]*cosYaw+v[2]*sinYaw;return [x*.985+v[1]*.174,-x*.174+v[1]*.985,v[2]*cosYaw-v[0]*sinYaw];};
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  const screen=p=>[cx+p[0]*r,cy+p[1]*r];
  function track(front){ctx.beginPath();let previous=false;for(let i=0;i<=180;i++){const p=orbit(i/180*TAU),[x,y]=screen(p);if((p[2]>=0)===front){if(previous)ctx.lineTo(x,y);else ctx.moveTo(x,y);previous=true;}else previous=false;}ctx.strokeStyle=front?'rgba(221,195,154,.48)':'rgba(221,195,154,.18)';ctx.lineWidth=.9;ctx.setLineDash(front?[]:[2,6]);ctx.stroke();ctx.setLineDash([]);}
  function airplane(){const p=orbit(phase),next=orbit(phase+.01),[x,y]=screen(p);ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(next[1]-p[1],next[0]-p[0]));const size=width/600*(p[2]>=0?1:.78);ctx.scale(size,size);ctx.shadowColor='#ddc39a66';ctx.shadowBlur=12;ctx.fillStyle=p[2]>=0?'#fff1d5':'#b5a17f';ctx.fill(aircraft);ctx.shadowBlur=0;ctx.strokeStyle='#bca276';ctx.lineWidth=.6;ctx.stroke(aircraft);ctx.restore();}
  track(false);if(orbit(phase)[2]<0)airplane();
  const halo=ctx.createRadialGradient(cx,cy,r*.9,cx,cy,r*1.17);halo.addColorStop(0,'#63978c20');halo.addColorStop(1,'#63978c00');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,r*1.17,0,TAU);ctx.fill();
  const ocean=ctx.createRadialGradient(cx-r*.35,cy-r*.38,r*.05,cx,cy,r*1.1);ocean.addColorStop(0,'#2a5555');ocean.addColorStop(.6,'#15383b');ocean.addColorStop(1,'#061e23');ctx.fillStyle=ocean;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fill();
  // Subtle meridians/latitudes give the dots a clearly spherical surface.
  ctx.lineWidth=.65;ctx.strokeStyle='#ddc39a16';
  const grid=points=>{ctx.beginPath();let previous=false;for(const point of points){const p=project(point),[x,y]=screen(p);if(p[2]>0){if(previous)ctx.lineTo(x,y);else ctx.moveTo(x,y);previous=true;}else previous=false;}ctx.stroke();};
  for(const line of graticules)grid(line);
  // Batch land into six depth bands: six fills instead of ~1,200 GPU fills/frame.
  const bands=Array.from({length:6},()=>[]);
  for(const point of land){const p=project(point);if(p[2]>.015)bands[Math.min(5,Math.floor(p[2]*6))].push(p);}
  for(let band=0;band<6;band++){const depth=(band+.5)/6,dot=Math.max(.65,width/600*1.6*(.45+depth*.55));ctx.fillStyle=`rgba(226,204,166,${.2+depth*.72})`;ctx.beginPath();for(const p of bands[band]){const [x,y]=screen(p);ctx.moveTo(x+dot,y);ctx.arc(x,y,dot,0,TAU);}ctx.fill();}
  const india=project(sphere(76.9558,11.0168));if(india[2]>.08){const [x,y]=screen(india);ctx.fillStyle='#fff2d6';ctx.beginPath();ctx.arc(x,y,width/600*3,0,TAU);ctx.fill();ctx.strokeStyle='#e8d1a977';ctx.beginPath();ctx.arc(x,y,width/600*(8+Math.sin(elapsed/1100)*1.5),0,TAU);ctx.stroke();}
  ctx.strokeStyle='#ddc39a40';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();
  track(true);
  // A short fading trail follows the same orbit, with real front/back occlusion.
  for(let i=26;i>0;i--){const a=orbit(phase-i*.013),b=orbit(phase-(i-1)*.013);if(a[2]<0)continue;const [x,y]=screen(a),[nx,ny]=screen(b);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.strokeStyle=`rgba(245,220,177,${(1-i/27)*.8})`;ctx.lineWidth=1.7;ctx.stroke();}
  if(orbit(phase)[2]>=0)airplane();
  canvas.dataset.orbitSide=orbit(phase)[2]>=0?'front':'back';canvas.dataset.phase=String(Math.round(phase*1000));canvas.dataset.turns=String(Math.floor(elapsed/19000));
  stage.classList.add('is-rendered');
 }
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;}
 function tick(time){frame=0;if(!running())return;if(last)elapsed+=Math.min(time-last,250);last=time;draw();frame=requestAnimationFrame(tick);}
 function running(){return visible&&!paused&&active&&!document.hidden;}
 function sync(){stage.dataset.motion=running()?'running':'paused';if(running()){if(!frame){last=0;frame=requestAnimationFrame(tick);}}else stop();}
 function resize(){const rect=stage.getBoundingClientRect();if(!rect.width)return;width=rect.width;height=rect.height;ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);draw();}
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.02});observer.observe(stage);
 new ResizeObserver(resize).observe(stage);
 document.addEventListener('visibilitychange',sync);window.addEventListener('pagehide',stop);window.addEventListener('pageshow',sync);
 resize();stage.dataset.renderer='canvas2d';
 return {setPaused(value){paused=value;sync();},setActive(value){active=value;sync();}};
}
