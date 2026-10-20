import React,{useEffect,useMemo,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {landPoints} from '../world-land.js';
const TAU=Math.PI*2;
const cameraConfig={position:[0,0,6.7],fov:43,near:.1,far:50};
const glConfig={alpha:true,antialias:true,powerPreference:'low-power'};
function point(lon,lat,r=1.495){const a=lon*Math.PI/180,b=lat*Math.PI/180;return [r*Math.cos(b)*Math.sin(a),r*Math.sin(b),r*Math.cos(b)*Math.cos(a)];}
function orbit(t){const x=2.15*Math.cos(t),y=.86*Math.sin(t);return new THREE.Vector3(x*.96+y*.28,-x*.28+y*.96,1.82*Math.sin(t));}
const dots=new Float32Array(landPoints.flatMap(([lon,lat])=>point(lon,lat)));
function World({running,stage,onReady,onFallback}){
 const earth=useRef(),plane=useRef(),trail=useRef(),floatA=useRef(),floatB=useRef(),elapsed=useRef(0),wasRunning=useRef(false),lastMeta=useRef(-1),ready=useRef(false),readyFrame=useRef(0);
 const {camera,gl,invalidate,size}=useThree();
 const controlsRef=useRef(null),runningRef=useRef(running);runningRef.current=running;
 const uniforms=useMemo(()=>({uSize:{value:18}}),[]);
 const ring=useMemo(()=>new Float32Array(Array.from({length:129},(_,i)=>orbit(i/128*TAU).toArray()).flat()),[]);
 const trailPositions=useMemo(()=>new Float32Array(28*3),[]);
 const aircraft=useMemo(()=>{const shape=new THREE.Shape();[[22,0],[16,-3],[2,-4],[-8,-20],[-13,-20],[-7,-3],[-21,-4],[-26,-10],[-30,-10],[-26,0],[-30,10],[-26,10],[-21,4],[-7,3],[-13,20],[-8,20],[2,4],[16,3]].forEach(([x,y],i)=>i?shape.lineTo(x/110,y/110):shape.moveTo(x/110,y/110));shape.closePath();return shape;},[]);
 useEffect(()=>{uniforms.uSize.value=size.height*gl.getPixelRatio()*.025;invalidate();},[size.height,gl,uniforms,invalidate]);
 useEffect(()=>{wasRunning.current=false;invalidate();},[running,invalidate]);
 useEffect(()=>{
  const controls=new OrbitControls(camera,gl.domElement);controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=false;controls.rotateSpeed=.55;controls.enabled=runningRef.current;controlsRef.current=controls;controls.saveState();gl.domElement.style.touchAction='pan-y';
  const change=()=>{stage.dataset.camera=camera.position.toArray().map(n=>n.toFixed(2)).join(',');invalidate();};
  const reset=()=>{controls.reset();change();};
  const keyboard=event=>{if(!runningRef.current||event.target.closest('button'))return;if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();camera.position.applyAxisAngle(new THREE.Vector3(0,1,0),event.key==='ArrowLeft'?.16:-.16);camera.lookAt(0,0,0);controls.update();change();}if(event.key==='Home'){event.preventDefault();reset();}};
  const lost=event=>{event.preventDefault();onFallback();};
  controls.addEventListener('change',change);stage.addEventListener('keydown',keyboard);stage.addEventListener('luxury-reset',reset);gl.domElement.addEventListener('webglcontextlost',lost);change();
  return()=>{controls.removeEventListener('change',change);controls.dispose();stage.removeEventListener('keydown',keyboard);stage.removeEventListener('luxury-reset',reset);gl.domElement.removeEventListener('webglcontextlost',lost);};
 },[camera,gl,stage,invalidate,onFallback]);
 useEffect(()=>{if(controlsRef.current)controlsRef.current.enabled=running;},[running]);
 useEffect(()=>()=>cancelAnimationFrame(readyFrame.current),[]);
 useFrame((_,delta)=>{
  if(running){if(wasRunning.current)elapsed.current+=Math.min(delta,.15);wasRunning.current=true;}else wasRunning.current=false;
  const time=elapsed.current,phase=.16+time*TAU/19,pos=orbit(phase),next=orbit(phase+.001),x=next.clone().sub(pos).normalize(),z=pos.clone().cross(x).normalize(),y=z.clone().cross(x).normalize();
  earth.current.rotation.set(.09,-.7+time*TAU/85,.1);plane.current.position.copy(pos);plane.current.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
  for(let i=0;i<28;i++){const p=orbit(phase-(27-i)*.013);trail.current.attributes.position.setXYZ(i,p.x,p.y,p.z);}trail.current.attributes.position.needsUpdate=true;
  floatA.current.position.y=1.55+Math.sin(time*.45)*.075;floatA.current.rotation.set(time*.12,.3,time*.08);
  floatB.current.position.y=-1.48+Math.sin(time*.4+1)*.055;floatB.current.rotation.z=-time*.1;
  if(!ready.current){ready.current=true;readyFrame.current=requestAnimationFrame(()=>{stage.tabIndex=0;stage.setAttribute('role','group');stage.setAttribute('aria-label','Interactive three-dimensional Earth with an orbiting airplane');stage.setAttribute('aria-describedby','luxury-globe-instructions');onReady();});}
  if(time-lastMeta.current>.12||!running){const canvas=gl.domElement;canvas.dataset.phase=String(Math.round(phase*1000));canvas.dataset.turns=String(Math.floor(time/19));canvas.dataset.orbitSide=pos.dot(camera.position)>=0?'front':'back';stage.dataset.motion=running?'running':'paused';lastMeta.current=time;}
 });
 return <>
  <ambientLight intensity={1.4}/><directionalLight position={[-3,4,6]} intensity={3} color="#fff1d5"/><directionalLight position={[4,-1,-2]} intensity={2} color="#5c9e95"/>
  <group ref={earth}>
   <mesh><sphereGeometry args={[1.48,64,48]}/><meshPhysicalMaterial color="#123e42" metalness={.28} roughness={.4} clearcoat={.35}/></mesh>
   <mesh><sphereGeometry args={[1.53,48,32]}/><meshBasicMaterial color="#91c1a9" side={THREE.BackSide} transparent opacity={.07} depthWrite={false}/></mesh>
   <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[dots,3]}/></bufferGeometry><shaderMaterial transparent depthWrite={false} uniforms={uniforms} vertexShader={'uniform float uSize; varying float light; void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=uSize/-mv.z;light=.5+.5*max(0.0,normalize(normalMatrix*normalize(position)).z);}'} fragmentShader={'varying float light; void main(){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;gl_FragColor=vec4(vec3(.91,.79,.61)*light,smoothstep(.5,.32,d));}'}/></points>
   <mesh position={point(76.9558,11.0168,1.51)}><sphereGeometry args={[.022,12,10]}/><meshBasicMaterial color="#fff2ce"/></mesh>
  </group>
  <line><bufferGeometry><bufferAttribute attach="attributes-position" args={[ring,3]}/></bufferGeometry><lineBasicMaterial color="#bca078" transparent opacity={.4}/></line>
  <line><bufferGeometry ref={trail}><bufferAttribute attach="attributes-position" args={[trailPositions,3]}/></bufferGeometry><lineBasicMaterial color="#fff0d0" transparent opacity={.8}/></line>
  <mesh ref={plane}><extrudeGeometry args={[aircraft,{depth:.028,bevelEnabled:true,bevelThickness:.008,bevelSize:.005,bevelSegments:1,steps:1}]}/><meshStandardMaterial color="#f4ddad" metalness={.48} roughness={.28}/></mesh>
  <mesh ref={floatA} position={[-1.87,1.55,-.2]}><icosahedronGeometry args={[.095,0]}/><meshStandardMaterial color="#cfb07a" metalness={.6} roughness={.34}/></mesh>
  <mesh ref={floatB} position={[1.94,-1.48,.1]} rotation={[.3,.4,0]}><torusGeometry args={[.09,.013,6,24]}/><meshStandardMaterial color="#cfb07a" metalness={.6} roughness={.34}/></mesh>
 </>;
}
export default function GlobeScene({running,stage,onReady,onFallback}){
 return <><Canvas onCreated={({gl})=>{gl.domElement.id="world-flight-webgl";gl.domElement.dataset.engine="react-three-fiber";}} aria-hidden="true" className="luxury-webgl-canvas" frameloop={running?'always':'demand'} dpr={[1,1.5]} camera={cameraConfig} gl={glConfig} fallback={<span/>}><World running={running} stage={stage} onReady={onReady} onFallback={onFallback}/></Canvas><div className="luxury-globe-ui"><span id="luxury-globe-instructions">{running?'DRAG TO EXPLORE · ← → TO ROTATE':'MOTION PAUSED · RESUME TO EXPLORE'}</span><button type="button" aria-label="Reset globe view" title="Reset globe view" onClick={()=>stage.dispatchEvent(new Event('luxury-reset'))}>↺</button></div></>;
}
