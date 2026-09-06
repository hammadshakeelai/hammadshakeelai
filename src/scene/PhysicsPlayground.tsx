import { Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
function Cube({ index }: { index: number }) {
  const ref = useRef<RapierRigidBody>(null);
  return (
    <RigidBody
      ref={ref}
      colliders="cuboid"
      position={[((index % 3) - 1) * 0.9, 3 + Math.floor(index / 3) * 1.1, -3]}
      restitution={0.6}
    >
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          ref.current?.applyImpulse(
            { x: (Math.random() - 0.5) * 3, y: 6, z: 2 },
            true,
          );
        }}
      >
        <boxGeometry args={[0.65, 0.65, 0.65]} />
        <meshStandardMaterial
          color={["#ffb36b", "#ab94f9", "#77ddf4"][index % 3]}
          metalness={0.35}
          roughness={0.3}
        />
      </mesh>
    </RigidBody>
  );
}
export default function PhysicsPlayground({paused=false}:{paused?:boolean}) {
  return (
    <Physics gravity={[0, -9.81, 0]} paused={paused}>
      <RigidBody type="fixed" position={[0, -0.3, -3]}>
        <mesh>
          <boxGeometry args={[10, 0.5, 8]} />
          <meshStandardMaterial color="#242138" />
        </mesh>
      </RigidBody>
      {Array.from({ length: 9 }, (_, i) => (
        <Cube key={i} index={i} />
      ))}
    </Physics>
  );
}
