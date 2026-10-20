import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { getGlobeTexture, isLand, latLonToUnit } from './globeTexture'

const RADIUS = 1.55

/* ----------------------------- helpers ----------------------------- */

const latLonToVec3 = (lat, lon, radius = RADIUS) => {
  const u = latLonToUnit(lat, lon)
  return new THREE.Vector3(u.x * radius, u.y * radius, u.z * radius)
}

/**
 * Pins start from a globally spread set of anchor coordinates and snap to the
 * nearest "land" patch, so the arc network reads as a real itinerary map.
 */
const SEEDS = [
  [28.2, 77.1], // Himalaya
  [9.9, 76.2], // Kerala
  [-8.4, 115.2], // Bali
  [64.9, -19.0], // Iceland
  [35.0, 135.8], // Kyoto
  [-33.9, 18.4], // Cape Town
  [-50.0, -73.0], // Patagonia
  [-27.5, 153.0], // Queensland
  [62.0, 9.0], // Norway
  [31.6, -7.6], // Morocco
  [-13.5, -71.9], // Peru
  [51.0, -114.0], // Rockies
  [45.9, 6.9], // Alps
  [1.35, 103.8], // Singapore
  [-1.3, 36.8], // Kenya
]

function findLand(lat, lon) {
  if (isLand(lat, lon)) return [lat, lon]
  for (let r = 4; r <= 20; r += 4) {
    for (let a = 0; a < 360; a += 24) {
      const rad = (a * Math.PI) / 180
      const la = lat + Math.cos(rad) * r
      const lo = lon + (Math.sin(rad) * r) / Math.max(Math.cos((lat * Math.PI) / 180), 0.35)
      if (Math.abs(la) < 76 && isLand(la, lo)) return [la, lo]
    }
  }
  return null
}

function usePins() {
  return useMemo(() => {
    const pins = []
    SEEDS.forEach(([lat, lon], i) => {
      const hit = findLand(lat, lon)
      if (!hit) return
      const position = latLonToVec3(hit[0], hit[1], RADIUS * 1.008)
      if (pins.some((p) => p.position.distanceTo(position) < 0.3)) return
      pins.push({ position, offset: i * 0.83 })
    })
    return pins.slice(0, 9)
  }, [])
}

/* ------------------------------ globe ------------------------------ */

function Globe() {
  const texture = useMemo(() => getGlobeTexture(), [])
  return (
    <mesh castShadow>
      <sphereGeometry args={[RADIUS, 72, 72]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.82}
        metalness={0.12}
        color="#f2f6ee"
      />
    </mesh>
  )
}

/* ---------------------------- atmosphere --------------------------- */

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const atmosphereFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = clamp(0.78 - dot(vNormal, vView), 0.0, 1.0);
    float glow = pow(rim, 2.4);
    vec3 gold = vec3(0.937, 0.663, 0.239);
    vec3 jade = vec3(0.271, 0.639, 0.510);
    vec3 col = mix(gold, jade, 0.28);
    gl_FragColor = vec4(col, glow * 0.9);
  }
`

function Atmosphere() {
  return (
    <mesh scale={1.17}>
      <sphereGeometry args={[RADIUS, 48, 48]} />
      <shaderMaterial
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

/* ------------------------------- arcs ------------------------------ */

function Arc({ from, to, delay = 0, speed = 0.55, tone = '#f0c46a' }) {
  const head = useRef(null)

  const { geometry, curve, indexCount } = useMemo(() => {
    const a = from.clone().normalize().multiplyScalar(RADIUS * 1.01)
    const b = to.clone().normalize().multiplyScalar(RADIUS * 1.01)
    const mid = a.clone().add(b).multiplyScalar(0.5)
    const lift = a.distanceTo(b) * 0.45 + 0.12
    const midLifted = mid.normalize().multiplyScalar(RADIUS + lift)
    const c = new THREE.QuadraticBezierCurve3(a, midLifted, b)
    const geo = new THREE.TubeGeometry(c, 48, 0.0075, 6, false)
    return { geometry: geo, curve: c, indexCount: geo.index.count }
  }, [from, to])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const cycle = 3.6 + speed * 2.6
    const local = ((t + delay) % cycle) / cycle
    const grow = Math.min(local / 0.62, 1)
    const p = 1 - Math.pow(1 - grow, 3)
    geometry.setDrawRange(0, Math.max(6, Math.floor((indexCount * p) / 6) * 6))

    if (head.current) {
      const point = curve.getPointAt(Math.min(p, 0.999))
      head.current.position.copy(point)
      const fade = p >= 0.999 ? Math.max(0, 1 - (local - 0.62) / 0.3) : 1
      head.current.material.opacity = fade
      head.current.visible = fade > 0.01
    }
  })

  return (
    <>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={tone}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={head}>
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshBasicMaterial color="#ffe6ad" transparent opacity={1} />
      </mesh>
    </>
  )
}

/* ------------------------------- pins ------------------------------ */

function Pin({ position, offset = 0 }) {
  const ring = useRef(null)
  useFrame(({ clock }) => {
    if (!ring.current) return
    const t = (clock.elapsedTime * 0.75 + offset) % 1
    const s = 1 + t * 2.6
    ring.current.scale.setScalar(s)
    ring.current.material.opacity = (1 - t) * 0.65
  })

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.019, 12, 12]} />
        <meshBasicMaterial color="#ffd89b" />
      </mesh>
      <Billboard>
        <mesh ref={ring}>
          <ringGeometry args={[0.028, 0.038, 28]} />
          <meshBasicMaterial color="#e9a63a" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  )
}

/* ---------------------------- orbit ring --------------------------- */

function OrbitRing() {
  const ref = useRef(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.05
  })
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.35, 0, 0.35]}>
      <torusGeometry args={[RADIUS * 1.34, 0.0032, 6, 180]} />
      <meshBasicMaterial color="#e9a63a" transparent opacity={0.42} />
    </mesh>
  )
}

/* ---------------------------- scene rig ---------------------------- */

function Scene() {
  const group = useRef(null)
  const { viewport, pointer } = useThree()
  const pins = usePins()

  const scale = Math.min(1, viewport.width / 4.6)
  const arcs = useMemo(() => {
    if (pins.length < 2) return []
    const list = []
    for (let i = 0; i < pins.length; i += 1) {
      const a = pins[i]
      const b = pins[(i + 3) % pins.length]
      if (a === b) continue
      list.push({
        from: a.position.clone().normalize().multiplyScalar(RADIUS),
        to: b.position.clone().normalize().multiplyScalar(RADIUS),
        delay: i * 1.35,
        speed: 0.4 + (i % 3) * 0.22,
      })
    }
    return list
  }, [pins])

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const t = clock.elapsedTime
    group.current.rotation.y += delta * 0.075
    // gentle pointer parallax
    const targetX = 0.32 + pointer.y * 0.16
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.045
    group.current.position.y = Math.sin(t * 0.5) * 0.045
  })

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 3.5, 5]} intensity={2.1} color="#ffe4bc" />
      <directionalLight position={[-5, -2, -3]} intensity={0.9} color="#3f9d83" />
      <pointLight position={[0, 0, 4]} intensity={1.1} color="#ffcf8a" />

      <group ref={group} rotation={[0.32, -0.4, -0.06]} scale={scale}>
        <Globe />
        <Atmosphere />
        <OrbitRing />
        {pins.map((pin, i) => (
          <Pin key={`pin-${i}`} {...pin} />
        ))}
        {arcs.map((arc, i) => (
          <Arc
            key={`arc-${i}`}
            from={arc.from}
            to={arc.to}
            delay={arc.delay}
            speed={arc.speed}
            tone={i % 3 === 0 ? '#ffe2a8' : '#f0c46a'}
          />
        ))}
      </group>
    </>
  )
}

export default function GlobeScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5], fov: 38 }}
      style={{ pointerEvents: 'none' }}
      fallback={
        <div className="globe-fallback">
          <div className="globe-fallback-disc" />
        </div>
      }
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
