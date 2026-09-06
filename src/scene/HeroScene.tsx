import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AdditiveBlending, DoubleSide, Group, Mesh } from "three";
import {
  AdaptiveResolution,
  StudioLights,
  useSceneActivity,
  type SceneQuality,
} from "./shared";
import "./scenes.css";

export interface HeroSceneProps {
  reducedMotion: boolean;
  quality: SceneQuality;
  onProject?: (id: string) => void;
}

function OrbitalMachine({ animate, low }: { animate: boolean; low: boolean }) {
  const machine = useRef<Group>(null);
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const elapsed = useRef(0);
  useFrame((state, dt) => {
    if (!animate) return;
    elapsed.current += Math.min(dt, 0.04);
    const t = elapsed.current;
    if (machine.current) {
      machine.current.rotation.y +=
        (state.pointer.x * 0.13 - machine.current.rotation.y) * 0.025;
      machine.current.position.y = Math.sin(t * 0.45) * 0.1;
    }
    if (outer.current) outer.current.rotation.z = t * 0.08;
    if (inner.current) inner.current.rotation.z = -t * 0.12;
    if (core.current) core.current.rotation.y = t * 0.08;
  });
  const segments = low ? 64 : 128;
  return (
    <group ref={machine} rotation={[0.12, 0, -0.38]}>
      <group rotation={[0.62, -0.32, 0]}>
        <group ref={outer}>
          <mesh>
            <torusGeometry args={[2.52, 0.16, 18, segments, Math.PI * 1.7]} />
            <meshPhysicalMaterial
              color="#b6a3ed"
              metalness={0.73}
              roughness={0.2}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI * 1.73]}>
            <torusGeometry args={[2.52, 0.16, 18, 24, Math.PI * 0.23]} />
            <meshPhysicalMaterial
              color="#dfe5f8"
              metalness={0.95}
              roughness={0.17}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[2.73, 0.012, 8, segments]} />
            <meshBasicMaterial color="#c7b7fb" transparent opacity={0.65} />
          </mesh>
          <mesh>
            <torusGeometry args={[2.35, 0.017, 8, segments]} />
            <meshBasicMaterial color="#ede5ff" />
          </mesh>
          {Array.from({ length: 48 }, (_, i) => {
            const angle = (i / 48) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 2.88, Math.sin(angle) * 2.88, 0]}
                rotation={[0, 0, angle]}
              >
                <boxGeometry
                  args={[i % 4 === 0 ? 0.09 : 0.035, 0.012, 0.014]}
                />
                <meshBasicMaterial
                  color="#b8b7d7"
                  transparent
                  opacity={i % 4 === 0 ? 0.75 : 0.32}
                />
              </mesh>
            );
          })}
          <group position={[2.52, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.25, 0.38, 24]} />
              <meshPhysicalMaterial
                color="#eef1f7"
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, 0, 0.23]}>
              <circleGeometry args={[0.12, 24]} />
              <meshBasicMaterial color="#77ddf4" />
            </mesh>
          </group>
          <mesh position={[-1.78, 1.78, 0]}>
            <sphereGeometry args={[0.24, 24, 24]} />
            <meshPhysicalMaterial
              color="#c0caf5"
              metalness={1}
              roughness={0.12}
            />
          </mesh>
        </group>
      </group>
      <group rotation={[-0.88, 0.55, -0.35]}>
        <group ref={inner}>
          <mesh>
            <torusGeometry args={[1.94, 0.245, 24, segments, Math.PI * 1.72]} />
            <meshPhysicalMaterial
              color="#e7ddfc"
              metalness={0.75}
              roughness={0.15}
              clearcoat={1}
              iridescence={0.65}
              iridescenceIOR={1.3}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[2.23, 0.011, 8, segments]} />
            <meshBasicMaterial color="#b9a3ff" />
          </mesh>
          <mesh position={[1.94, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.12, 32]} />
            <meshPhysicalMaterial
              color="#b7a0ea"
              metalness={0.65}
              roughness={0.14}
            />
          </mesh>
        </group>
      </group>
      <group rotation={[1.25, 0.65, 0.4]}>
        <mesh>
          <torusGeometry args={[1.52, 0.035, 10, segments]} />
          <meshPhysicalMaterial
            color="#c4cfe8"
            metalness={0.95}
            roughness={0.14}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[1.6, 0.012, 8, segments]} />
          <meshBasicMaterial color="#77ddf4" />
        </mesh>
      </group>
      <mesh ref={core}>
        <sphereGeometry args={[1.24, low ? 32 : 64, low ? 32 : 64]} />
        <meshPhysicalMaterial
          color="#9a75f3"
          metalness={0.22}
          roughness={0.13}
          transmission={low ? 0 : 0.38}
          thickness={2.5}
          ior={1.6}
          clearcoat={1}
          iridescence={0.7}
          iridescenceIOR={1.4}
          envMapIntensity={1.45}
        />
      </mesh>
      <mesh scale={[1, 0.72, 1]} rotation={[0.25, 0, -0.6]}>
        <torusGeometry args={[0.62, 0.17, 16, 60]} />
        <meshStandardMaterial
          color="#ae8fff"
          emissive="#6a32c1"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh rotation={[0.8, -0.2, 0.2]}>
        <torusGeometry args={[1.28, 0.016, 8, 80]} />
        <meshBasicMaterial color="#e5d4ff" transparent opacity={0.62} />
      </mesh>
      <mesh position={[3.1, -0.8, -0.8]}>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshPhysicalMaterial
          color="#dbe9ff"
          roughness={0.14}
          metalness={0.96}
        />
      </mesh>
      <mesh position={[-2.5, -1.9, 0.8]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshPhysicalMaterial
          color="#ffb36b"
          roughness={0.18}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}

function Dust() {
  const positions = useMemo(() => {
    const vertices = new Float32Array(110 * 3);
    for (let i = 0; i < 110; i++) {
      const random = (n: number) =>
        (((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1) + 1) % 1;
      vertices[i * 3] = (random(i + 2) - 0.5) * 16;
      vertices[i * 3 + 1] = (random(i + 310) - 0.5) * 12;
      vertices[i * 3 + 2] = -4 - random(i + 612) * 5;
    }
    return vertices;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#c3c7ee"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

function Halo() {
  return (
    <group position={[0, 0, -3]}>
      <mesh>
        <ringGeometry args={[2.9, 2.905, 100]} />
        <meshBasicMaterial
          color="#a99aca"
          opacity={0.16}
          transparent
          side={DoubleSide}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[3.4, 3.405, 100]} />
        <meshBasicMaterial
          color="#a99aca"
          opacity={0.09}
          transparent
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function HeroScene({ reducedMotion, quality }: HeroSceneProps) {
  const [element, active] = useSceneActivity<HTMLDivElement>();
  return (
    <div
      className="lab-hero-scene"
      ref={element}
      role="img"
      aria-label="An interactive violet and chrome orbital sculpture. Drag to rotate it."
    >
      <div className="lab-hero-aura" />
      <Canvas
        camera={{ position: [0, 0.25, 9.8], fov: 42, near: 0.1, far: 60 }}
        dpr={quality === "low" ? 1 : [1, 1.5]}
        gl={{
          antialias: quality !== "low",
          alpha: true,
          powerPreference: "high-performance",
        }}
        frameloop={active && !reducedMotion ? "always" : "demand"}
        fallback={
          <div className="lab-scene-fallback">
            <span>◌</span>
            <p>A universe of things, waiting to be explored.</p>
          </div>
        }
      >
        <Suspense fallback={null}>
          <StudioLights low={quality === "low"} />
          <AdaptiveResolution quality={quality} active={active} />
          <Halo />
          <Dust />
          <OrbitalMachine
            animate={active && !reducedMotion}
            low={quality === "low"}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.45}
            minPolarAngle={0.65}
            maxPolarAngle={2.4}
          />
        </Suspense>
      </Canvas>
      <span className="lab-sculpture-caption">
        <span className="lab-status-light" /> LIVE OBJECT / DRAG TO ROTATE
      </span>
    </div>
  );
}
