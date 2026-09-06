import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import { Group, Mesh, Vector3 } from "three";
import {
  StudioLights,
  AdaptiveResolution,
  useSceneActivity,
  type SceneQuality,
} from "./shared";
import { playTone } from "../lib/store";
import "./scenes.css";
const PhysicsPlayground = lazy(() => import("./PhysicsPlayground"));
type Exhibit = { id: string; name: string; category: string };
type Props = {
  projects: Exhibit[];
  onProject: (id: string) => void;
  reducedMotion: boolean;
  quality: SceneQuality;
};
const rooms = [
  { name: "Observatory", x: -12, color: "#ab94f9" },
  { name: "Workshop", x: 0, color: "#ffb36b" },
  { name: "Exhibition", x: 12, color: "#77ddf4" },
];
function Orb({ active }: { active: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (active && ref.current) ref.current.rotation.y += dt * 0.13;
  });
  return (
    <group ref={ref} position={[-12, 2, -4]}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color="#8e6fd7"
          metalness={0.65}
          roughness={0.18}
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[i * 0.7, 0.6, i * 0.5]}>
          <torusGeometry args={[1.7 + i * 0.15, 0.035, 8, 80]} />
          <meshStandardMaterial
            color={i === 1 ? "#77ddf4" : "#b5a0ef"}
            emissive="#574376"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}
function Station({
  project,
  position,
  index,
  color,
  onProject,
  active,
}: {
  project: Exhibit;
  position: [number, number, number];
  index: number;
  color: string;
  onProject: (id: string) => void;
  active: boolean;
}) {
  const item = useRef<Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (!active || !item.current) return;
    item.current.rotation.y += dt * 0.3;
    item.current.position.y =
      1.45 + Math.sin(clock.elapsedTime * 0.7 + index) * 0.12;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.8, 0.95, 0.5, 6]} />
        <meshStandardMaterial
          color="#20233b"
          metalness={0.5}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.65, 48]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh
        ref={item}
        position={[0, 1.45, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onProject(project.id);
          playTone(600);
        }}
      >
        {index % 3 === 0 ? (
          <icosahedronGeometry args={[0.62, 0]} />
        ) : index % 3 === 1 ? (
          <torusKnotGeometry args={[0.38, 0.11, 70, 10]} />
        ) : (
          <octahedronGeometry args={[0.68]} />
        )}
        <meshPhysicalMaterial
          color={color}
          metalness={0.7}
          roughness={0.19}
          clearcoat={1}
        />
      </mesh>
      <Html
        position={[0, 2.5, 0]}
        center
        distanceFactor={17}
        zIndexRange={[5, 0]}
      >
        <button
          className="station-label"
          onClick={() => onProject(project.id)}
          aria-label={`Open ${project.name}`}
        >
          {project.name} ↗
        </button>
      </Html>
    </group>
  );
}
function Pilot({
  keys,
  destination,
  stations,
  nearby,
  onCollect,
  collected,
  active,
}: {
  keys: React.RefObject<Set<string>>;
  destination: { room: number; tick: number };
  stations: { project: Exhibit; position: [number, number, number] }[];
  nearby: (p: Exhibit | null) => void;
  onCollect: (i: number) => void;
  collected: number[];
  active: boolean;
}) {
  const ref = useRef<Group>(null);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as {target: Vector3; update: () => void} | null;
  const following = useRef(new Vector3());
  const pos = useRef(new Vector3(-12, 0.75, 6));
  const last = useRef("");
  useEffect(() => {
    pos.current.set(rooms[destination.room].x, 0.75, 6);
    if (ref.current) ref.current.position.copy(pos.current);
    camera.position.set(pos.current.x, 10, 16);
    controls?.target.set(pos.current.x, 0, 0);
    controls?.update();
  }, [destination, camera, controls]);
  useFrame((_, dt) => {
    if (!active) return;
    const delta = Math.min(dt, 0.04) * 5;
    let moved = false;
    const current = keys.current;
    if (current.has("w") || current.has("arrowup")) {
      pos.current.z -= delta;
      moved = true;
    }
    if (current.has("s") || current.has("arrowdown")) {
      pos.current.z += delta;
      moved = true;
    }
    if (current.has("a") || current.has("arrowleft")) {
      pos.current.x -= delta;
      moved = true;
    }
    if (current.has("d") || current.has("arrowright")) {
      pos.current.x += delta;
      moved = true;
    }
    pos.current.x = Math.max(-18, Math.min(18, pos.current.x));
    pos.current.z = Math.max(-7, Math.min(10, pos.current.z));
    if (ref.current) {
      ref.current.position.copy(pos.current);
      if (moved) ref.current.rotation.y += dt * 2;
    }
    if (moved) {
      following.current.set(pos.current.x, 0, pos.current.z - 1);
      if (controls) {
        const dx = (following.current.x - controls.target.x) * 0.08;
        const dz = (following.current.z - controls.target.z) * 0.08;
        controls.target.x += dx;
        controls.target.z += dz;
        camera.position.x += dx;
        camera.position.z += dz;
        controls.update();
      }
    }
    const station = stations.find(
      (s) =>
        Math.hypot(
          s.position[0] - pos.current.x,
          s.position[2] - pos.current.z,
        ) < 2.3,
    );
    if ((station?.project.id || "") !== last.current) {
      last.current = station?.project.id || "";
      nearby(station?.project || null);
    }
    rooms.forEach((room, i) => {
      if (
        !collected.includes(i) &&
        Math.hypot(pos.current.x - room.x, pos.current.z + 1) < 1.3
      )
        onCollect(i);
    });
  });
  return (
    <group ref={ref} position={[-12, 0.75, 6]}>
      <mesh>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshPhysicalMaterial
          color="#d9e8ef"
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.035, 8, 40]} />
        <meshBasicMaterial color="#77ddf4" />
      </mesh>
      <pointLight color="#77ddf4" intensity={2} distance={3} />
      <mesh position={[0, 0.05, -0.29]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#77ddf4" />
      </mesh>
    </group>
  );
}
export default function ExploreScene({
  projects,
  onProject,
  reducedMotion,
  quality,
}: Props) {
  const [element, active] = useSceneActivity<HTMLDivElement>();
  const [destination, setDestination] = useState({ room: 0, tick: 0 });
  const keys = useRef(new Set<string>());
  const [near, setNear] = useState<Exhibit | null>(null);
  const [collected, setCollected] = useState<number[]>(() => {
    try {
      const saved:unknown = JSON.parse(localStorage.getItem("lab-discoveries") || "[]");
      return Array.isArray(saved) ? [...new Set(saved.filter((n):n is number=>Number.isInteger(n)&&n>=0&&n<3))] : [];
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState("");
  const [physics, setPhysics] = useState(false);
  const nearRef = useRef(near);
  nearRef.current = near;
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!element.current?.contains(document.activeElement)) return;
      if ((e.target as HTMLElement).closest("input,textarea,select,button,a"))
        return;
      const k = e.key.toLowerCase();
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
        ].includes(k)
      ) {
        e.preventDefault();
        keys.current.add(k);
      }
      if (k === "e" && nearRef.current) onProject(nearRef.current.id);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [onProject, element]);
  const stations = projects.map((p, i) => {
    const room = i % 3;
    const order = Math.floor(i / 3);
    return {
      project: p,
      position: [
        rooms[room].x + (order % 2 === 0 ? -3 : 3),
        0,
        order < 2 ? 1 : -4,
      ] as [number, number, number],
      room,
    };
  });
  function collect(i: number) {
    setCollected((previous) => {
      if (previous.includes(i)) return previous;
      const next = [...previous, i];
      try {
        localStorage.setItem("lab-discoveries", JSON.stringify(next));
      } catch {}
      setNotice(
        next.length === 3
          ? "All three signals found. Curiosity looks good on you."
          : "Signal found: " +
              [
                "keep asking questions",
                "make something playful",
                "share what you learn",
              ][i],
      );
      playTone(500 + i * 100);
      return next;
    });
  }
  return (
    <div className="explore-world" ref={element} tabIndex={0} aria-label="Interactive 3D lab. Focus here, then use W A S D or arrow keys to pilot the probe." onPointerDown={e=>{if(!(e.target as HTMLElement).closest('button,a'))element.current?.focus({preventScroll:true})}}>
      <div className="world-toolbar">
        <div
          className="world-destinations"
          role="group"
          aria-label="3D destinations"
        >
          {rooms.map((room, i) => (
            <button
              key={room.name}
              className={destination.room === i ? "selected" : ""}
              onClick={() => {
                setDestination({ room: i, tick: destination.tick + 1 });
                setNear(null);
                keys.current.clear();
                playTone(400 + i * 100);
              }}
            >
              {room.name}
            </button>
          ))}
        </div>
        <span className="world-collected">{collected.length} / 3 SIGNALS</span>
      </div>
      <button
        className="world-reset"
        onClick={() =>
          setDestination({ ...destination, tick: destination.tick + 1 })
        }
      >
        Reset view
      </button>
      {destination.room === 1 && (
        <button
          className="world-physics-button"
          onClick={() => setPhysics(!physics)}
        >
          {physics ? "Clear the workbench" : "Drop some physics cubes"}
        </button>
      )}
      {notice && (
        <div className="world-discovery" aria-live="polite">
          {notice}
          <button onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}
      <Canvas
        camera={{ position: [-12, 10, 17], fov: 48 }}
        dpr={quality === "low" ? 1 : [1, 1.5]}
        gl={{ antialias: quality !== "low" }}
        frameloop={active ? "always" : "never"}
      >
        <color attach="background" args={["#0b1128"]} />
        <fog attach="fog" args={["#0b1128", 25, 62]} />
        <Suspense fallback={null}>
          <StudioLights low={quality === "low"} />
          <AdaptiveResolution quality={quality} active={active} />
          <Stars
            radius={50}
            depth={25}
            count={quality === "low" ? 150 : 500}
            factor={2}
            fade
            speed={0}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
            <planeGeometry args={[60, 40]} />
            <meshStandardMaterial
              color="#0c1228"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
          <gridHelper
            args={[60, 40, "#252640", "#161e36"]}
            position={[0, -0.06, 0]}
          />
          {rooms.map((room, i) => (
            <group key={room.name} position={[room.x, 0, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[5.9, 64]} />
                <meshStandardMaterial
                  color={i === 1 ? "#211b2b" : i === 2 ? "#172436" : "#191b34"}
                  roughness={0.6}
                  metalness={0.3}
                />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[5.85, 5.9, 80]} />
                <meshBasicMaterial
                  color={room.color}
                  transparent
                  opacity={0.4}
                />
              </mesh>
              <Html
                position={[0, 0.08, 8]}
                center
                distanceFactor={16}
                zIndexRange={[4, 0]}
              >
                <span className="room-label">{room.name.toUpperCase()}</span>
              </Html>
              {!collected.includes(i) && (
                <mesh position={[0, 1, -1]} onClick={() => collect(i)}>
                  <octahedronGeometry args={[0.24]} />
                  <meshStandardMaterial
                    color={room.color}
                    emissive={room.color}
                    emissiveIntensity={1.2}
                  />
                </mesh>
              )}
            </group>
          ))}
          <Orb active={active && !reducedMotion} />
          <group position={[12, 2, -4]}>
            <mesh rotation={[0.4, 0.3, 0.2]}>
              <torusKnotGeometry args={[1.1, 0.32, 100, 16]} />
              <meshPhysicalMaterial
                color="#d9e5ef"
                metalness={1}
                roughness={0.12}
              />
            </mesh>
          </group>
          {stations.map((s, i) => (
            <Station
              key={s.project.id}
              {...s}
              index={i}
              color={rooms[s.room].color}
              onProject={onProject}
              active={active && !reducedMotion}
            />
          ))}
          <Pilot
            keys={keys}
            destination={destination}
            stations={stations}
            nearby={setNear}
            onCollect={collect}
            collected={collected}
            active={active}
          />
          {physics && (
            <Suspense fallback={null}>
              <PhysicsPlayground paused={!active} />
            </Suspense>
          )}
          <OrbitControls
            makeDefault
            target={[rooms[destination.room].x, 0, 0]}
            enablePan
            enableZoom
            minDistance={6}
            maxDistance={35}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Suspense>
      </Canvas>
      {near && (
        <button className="world-nearby" onClick={() => onProject(near.id)}>
          Open {near.name} ↗ <span className="mono">[E]</span>
        </button>
      )}
      <div className="world-instructions">
        <b>W A S D / ARROWS</b> PILOT THE PROBE
        <br />
        DRAG TO LOOK · SCROLL TO ZOOM
        <br />
        FIND THE THREE GLOWING SIGNALS
      </div>
      <div className="world-touch" aria-label="Probe direction controls">
        {[
          ["w", "↑", "Move forward"],
          ["a", "←", "Move left"],
          ["s", "↓", "Move backward"],
          ["d", "→", "Move right"],
        ].map(([key, label, title]) => (
          <button
            key={key}
            aria-label={title}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              keys.current.add(key);
            }}
            onPointerUp={() => keys.current.delete(key)}
            onPointerCancel={() => keys.current.delete(key)}
            onLostPointerCapture={() => keys.current.delete(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
