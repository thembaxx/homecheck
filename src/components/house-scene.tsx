import { useLayoutEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export type HouseLayers = {
  boundary: boolean;
  power: boolean;
  water: boolean;
  garden: boolean;
};

const clay = "#c4a07a";
const plaster = "#efe6d8";
const roof = "#2c2a28";
const glass = "#d5e0ea";
const grass = "#c5d4c4";
const soil = "#e7e1d4";
const tank = "#7f9a86";
const leaf = "#6d5c8f";
const trunk = "#5c4636";
const lemon = "#e6f25a";
const ink = "#171715";

function Aim() {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.lookAt(0, 0.8, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

function Erf({ layers }: { layers: HouseLayers }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[5.2, 48]} />
        <meshStandardMaterial color={grass} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[3.5, 40]} />
        <meshStandardMaterial color={soil} />
      </mesh>

      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[3.3, 1.7, 2.5]} />
        <meshStandardMaterial color={plaster} />
      </mesh>
      <mesh position={[0, 0.45, 1.26]}>
        <boxGeometry args={[3.32, 0.9, 0.08]} />
        <meshStandardMaterial color={clay} />
      </mesh>
      <mesh position={[0, 2.15, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.05, 2.35, 1.05, 4]} />
        <meshStandardMaterial color={roof} />
      </mesh>
      <mesh position={[0, 0.08, 1.85]}>
        <boxGeometry args={[3.3, 0.16, 1]} />
        <meshStandardMaterial color={soil} />
      </mesh>
      <mesh position={[0, 0.55, 1.28]}>
        <boxGeometry args={[0.55, 1.1, 0.08]} />
        <meshStandardMaterial color={ink} />
      </mesh>
      {[
        [-1, 1.05, 1.28],
        [1, 1.05, 1.28],
        [-1.66, 1.05, 0.3],
        [1.66, 1.05, -0.3],
      ].map((pos) => (
        <mesh key={pos.join()} position={pos as [number, number, number]}>
          <boxGeometry args={[pos[0] === -1.66 || pos[0] === 1.66 ? 0.06 : 0.7, 0.55, pos[2] === 1.28 ? 0.06 : 0.55]} />
          <meshStandardMaterial color={glass} />
        </mesh>
      ))}

      {layers.boundary && (
        <group>
          <mesh position={[0, 0.38, -2.15]}>
            <boxGeometry args={[4.6, 0.76, 0.12]} />
            <meshStandardMaterial color={plaster} />
          </mesh>
          <mesh position={[-2.24, 0.38, 0]}>
            <boxGeometry args={[0.12, 0.76, 4.3]} />
            <meshStandardMaterial color={plaster} />
          </mesh>
          <mesh position={[2.24, 0.38, 0.4]}>
            <boxGeometry args={[0.12, 0.76, 3.5]} />
            <meshStandardMaterial color={plaster} />
          </mesh>
          <mesh position={[-0.9, 0.38, 2.15]}>
            <boxGeometry args={[1.6, 0.76, 0.12]} />
            <meshStandardMaterial color={plaster} />
          </mesh>
          <mesh position={[1.15, 0.38, 2.15]}>
            <boxGeometry args={[2.1, 0.76, 0.12]} />
            <meshStandardMaterial color={plaster} />
          </mesh>
          <mesh position={[0.15, 0.45, 2.15]}>
            <boxGeometry args={[0.08, 0.9, 0.08]} />
            <meshStandardMaterial color={ink} />
          </mesh>
        </group>
      )}

      {layers.power && (
        <group>
          <mesh position={[0.35, 2.35, 0.15]} rotation={[0.55, 0.4, 0.1]}>
            <boxGeometry args={[1.15, 0.05, 0.7]} />
            <meshStandardMaterial color={ink} />
          </mesh>
          <mesh position={[-1.55, 0.85, 0.55]}>
            <boxGeometry args={[0.18, 0.28, 0.16]} />
            <meshStandardMaterial color={lemon} />
          </mesh>
        </group>
      )}

      {layers.water && (
        <mesh position={[-1.85, 0.42, -1.35]}>
          <cylinderGeometry args={[0.38, 0.4, 0.82, 20]} />
          <meshStandardMaterial color={tank} />
        </mesh>
      )}

      {layers.garden && (
        <group position={[2.05, 0, 1.45]}>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1.1, 8]} />
            <meshStandardMaterial color={trunk} />
          </mesh>
          <mesh position={[0, 1.35, 0]}>
            <sphereGeometry args={[0.62, 18, 18]} />
            <meshStandardMaterial color={leaf} />
          </mesh>
        </group>
      )}

      <group position={[1.7, 0, -1.15]}>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.9, 0.32, 1.7]} />
          <meshStandardMaterial color={ink} />
        </mesh>
        <mesh position={[0, 0.42, 0.15]}>
          <boxGeometry args={[0.86, 0.22, 0.7]} />
          <meshStandardMaterial color="#3a3836" />
        </mesh>
      </group>
    </group>
  );
}

export default function HouseScene({
  layers,
  motionOn,
}: {
  layers: HouseLayers;
  motionOn: boolean;
}) {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.6]}
      camera={{ position: [12, 11, 12], zoom: 46, near: -40, far: 80 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ touchAction: "none" }}
    >
      <Aim />
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#f3f0e8", "#d5e6de", 0.45]} />
      <directionalLight position={[8, 14, 6]} intensity={1.25} />
      <Erf layers={layers} />
      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate={motionOn}
        autoRotateSpeed={0.65}
        target={[0, 0.8, 0]}
        minPolarAngle={Math.PI / 5.2}
        maxPolarAngle={Math.PI / 2.35}
        minZoom={28}
        maxZoom={72}
        enableDamping
      />
    </Canvas>
  );
}
