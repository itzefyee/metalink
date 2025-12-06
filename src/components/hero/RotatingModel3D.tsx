'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

export default function RotatingModel3D() {
  const geometry = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.5,
        roughness: 0.3,
        emissive: '#5daaff',
        emissiveIntensity: 0.3,
      }),
    []
  );

  return (
    <div className="w-full h-64 md:h-96">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 3]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
        <mesh geometry={geometry} material={material}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
        </mesh>
      </Canvas>
    </div>
  );
}

