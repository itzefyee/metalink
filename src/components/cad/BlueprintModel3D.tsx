'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

interface BlueprintModel3DProps {
  modelType?: 'gear' | 'shaft' | 'bracket' | 'beam';
}

function Model({ modelType = 'gear' }: { modelType: 'gear' | 'shaft' | 'bracket' | 'beam' }) {
  const geometry = useMemo(() => {
    switch (modelType) {
      case 'gear':
        return new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
      case 'shaft':
        return new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16);
      case 'bracket':
        return new THREE.BoxGeometry(0.8, 0.6, 0.2);
      case 'beam':
        return new THREE.BoxGeometry(1.2, 0.3, 0.3);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [modelType]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#5daaff',
        metalness: 0.3,
        roughness: 0.4,
        emissive: '#1a4d80',
        emissiveIntensity: 0.2,
      }),
    []
  );

  return (
    <mesh geometry={geometry} material={material}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} />
    </mesh>
  );
}

export default function BlueprintModel3D({ modelType = 'gear' }: BlueprintModel3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full" />;
  }

  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
      <Model modelType={modelType} />
    </Canvas>
  );
}

