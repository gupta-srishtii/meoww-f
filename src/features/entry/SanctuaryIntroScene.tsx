import React, {Component, ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {AdditiveBlending, Group, Points} from 'three';

function Portal({active}: {active: boolean}) {
  const orbit = useRef<Group>(null);
  const lights = useRef<Points>(null);
  const positions = useMemo(() => {
    const points = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {const angle = i * 2.399963; points[i*3] = Math.cos(angle)*(1.8+(i%13)*.23); points[i*3+1] = Math.sin(angle)*(1.5+(i%11)*.25); points[i*3+2] = -2+(i%7)*.6;}
    return points;
  }, []);
  useFrame(({clock, pointer, camera}, delta) => {
    if (!active) return;
    const elapsed = clock.getElapsedTime();
    if (orbit.current) {orbit.current.rotation.z = Math.sin(elapsed*.12)*.07; orbit.current.rotation.y = Math.sin(elapsed*.16)*.12;}
    if (lights.current) lights.current.rotation.z = elapsed*.012;
    camera.position.x += (pointer.x*.22-camera.position.x)*Math.min(1,delta*2);
    camera.position.y += (.2+pointer.y*.13-camera.position.y)*Math.min(1,delta*2);
    camera.lookAt(0,0,0);
  });
  return <>
    <ambientLight intensity={1.2}/><pointLight position={[2,3,4]} intensity={22} color="#ffe6b0"/><pointLight position={[-3,-1,2]} intensity={10} color="#91b6ac"/>
    <group ref={orbit}>
      <mesh position={[0,.1,-.4]} rotation={[0,.25,0]}><torusGeometry args={[2,.075,12,96]}/><meshStandardMaterial color="#d3be8f" emissive="#d5ac64" emissiveIntensity={1.8} roughness={.3} metalness={.65}/></mesh>
      <mesh position={[0,.1,-.45]} rotation={[0,.25,0]}><torusGeometry args={[2.16,.012,6,96]}/><meshBasicMaterial color="#819b8b" transparent opacity={.7}/></mesh>
      <mesh position={[0,.1,-.6]}><circleGeometry args={[1.98,64]}/><meshBasicMaterial color="#53796a" transparent opacity={.09} depthWrite={false}/></mesh>
      <mesh rotation={[1.2,.3,.25]} position={[0,-.25,-.1]}><torusGeometry args={[2.5,.013,6,80]}/><meshBasicMaterial color="#d9caac" transparent opacity={.22}/></mesh>
      {[[-1.75,-1.25,.5,.34],[1.65,.9,.1,.25],[1.9,-1.4,-.8,.48],[-1.3,1.6,-.6,.19]].map(([x,y,z,scale],i) => <mesh key={i} position={[x,y,z]} scale={[scale,scale*.7,scale]} rotation={[i*.6,i*.4,.3]}><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={i%2?'#adb7a3':'#6f8975'} metalness={.18} roughness={.65}/></mesh>)}
    </group>
    <points ref={lights}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color="#e8d8b5" size={.028} sizeAttenuation transparent opacity={.7} blending={AdditiveBlending} depthWrite={false}/></points>
    <mesh position={[0,-2.3,-.3]} scale={[2.8,.12,1.5]}><sphereGeometry args={[1,32,12]}/><meshStandardMaterial color="#263e33" roughness={.8}/></mesh>
  </>;
}

class SceneBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() {return {failed:true};}
  render() {return this.state.failed ? this.props.fallback : this.props.children;}
}

function SceneFallback({onReady}:{onReady:()=>void}) {
  useEffect(onReady,[onReady]);
  return <div className="intro-portal-fallback"><span/><span/><p>A quiet, still sanctuary.</p></div>;
}

function supportsWebGL() {
  try {
    const probe = document.createElement('canvas');
    const context = probe.getContext('webgl2');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {return false;}
}

export default function SanctuaryIntroScene({active,onReady}:{active:boolean;onReady:()=>void}) {
  const [failed,setFailed] = useState(false);
  const [supported] = useState(supportsWebGL);
  const [canvas,setCanvas] = useState<HTMLCanvasElement|null>(null);
  useEffect(() => {
    const lost = (event:Event) => {event.preventDefault();setFailed(true);};
    canvas?.addEventListener('webglcontextlost',lost);
    return () => canvas?.removeEventListener('webglcontextlost',lost);
  },[canvas]);
  const fallback = <SceneFallback onReady={onReady}/>;
  if (failed || !supported) return fallback;
  return <SceneBoundary fallback={fallback}><Canvas dpr={[1,1.5]} camera={{position:[0,.2,6.8],fov:48}} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} frameloop={active?'always':'demand'} fallback={fallback} onCreated={({gl})=>{setCanvas(gl.domElement);onReady();}}><Portal active={active}/></Canvas></SceneBoundary>;
}
