import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ForestModel from "./models/ForestModel";
import OceanModel from "./models/OceanModel";

export default function DreamModel({ keyName }) {
  return (
    <Canvas>
      <ambientLight />
      <OrbitControls />

      {keyName === "forest" && <ForestModel />}
      {keyName === "ocean" && <OceanModel />}
    </Canvas>
  );
}
