'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface BlueprintModel3DProps {
  modelType?: 'gear' | 'bracket' | 'beam' | 'shaft' | 'pipe' | 'plate' | 'connector' | 'housing';
  className?: string;
}

// Wireframe Gear Component
function WireframeGear({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.005;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const geometry = useMemo(() => new THREE.CylinderGeometry(1, 1, 0.3, 16, 1), []);

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.8} />
    </mesh>
  );
}

// Wireframe Bracket Component
function WireframeBracket({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + 1) * 0.15;
    }
  });

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, 2);
    shape.lineTo(1.5, 2);
    shape.lineTo(1.5, 1.5);
    shape.lineTo(0.5, 1.5);
    shape.lineTo(0.5, 0.5);
    shape.lineTo(1.5, 0.5);
    shape.lineTo(1.5, 0);
    shape.lineTo(0, 0);

    const extrudeSettings = {
      steps: 1,
      depth: 0.3,
      bevelEnabled: false,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.7} />
    </mesh>
  );
}

// Wireframe I-Beam Component
function WireframeBeam({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.006;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 + 2) * 0.18;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Top flange */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2, 0.2, 0.4]} />
        <meshBasicMaterial color="#2563eb" wireframe transparent opacity={0.75} />
      </mesh>
      {/* Web */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 1.6, 0.4]} />
        <meshBasicMaterial color="#2563eb" wireframe transparent opacity={0.75} />
      </mesh>
      {/* Bottom flange */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[2, 0.2, 0.4]} />
        <meshBasicMaterial color="#2563eb" wireframe transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

// Wireframe Shaft Component
function WireframeShaft({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7 + 3) * 0.12;
    }
  });

  const geometry = useMemo(() => new THREE.CylinderGeometry(0.3, 0.3, 2.5, 16, 1), []);

  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, Math.PI / 2]} geometry={geometry}>
      <meshBasicMaterial color="#1d4ed8" wireframe transparent opacity={0.8} />
    </mesh>
  );
}

// Wireframe Pipe Component
function WireframePipe({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.007;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.55 + 4) * 0.16;
    }
  });

  const outerGeometry = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 2, 16, 1), []);
  const innerGeometry = useMemo(() => new THREE.CylinderGeometry(0.35, 0.35, 2.1, 16, 1), []);

  return (
    <group ref={meshRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={outerGeometry}>
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.75} />
      </mesh>
      <mesh geometry={innerGeometry}>
        <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Wireframe Plate Component
function WireframePlate({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.004;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.45 + 5) * 0.14;
    }
  });

  const geometry = useMemo(() => new THREE.BoxGeometry(2, 0.2, 1.5), []);

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshBasicMaterial color="#2563eb" wireframe transparent opacity={0.7} />
    </mesh>
  );
}

// Wireframe Connector Component
function WireframeConnector({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.009;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + 6) * 0.17;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Main vertical pipe */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
        <meshBasicMaterial color="#1d4ed8" wireframe transparent opacity={0.8} />
      </mesh>
      {/* Horizontal branch */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

// Wireframe Housing Component
function WireframeHousing({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.006;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.48 + 7) * 0.15;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Main box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 1.8, 1.2]} />
        <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.7} />
      </mesh>
      {/* Top cover */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1.9, 0.15, 1.3]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.65} />
      </mesh>
      {/* Side panel */}
      <mesh position={[0.95, 0, 0]}>
        <boxGeometry args={[0.1, 1.6, 1.1]} />
        <meshBasicMaterial color="#2563eb" wireframe transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Scene Component
function Scene({ modelType }: { modelType: string }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />

      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />

      {/* Models based on type */}
      {modelType === 'gear' && (
        <>
          <WireframeGear position={[0, 0, 0]} />
          <WireframeGear position={[-2.5, 0.5, -1]} />
          <WireframeShaft position={[2, -0.5, 1]} />
        </>
      )}

      {modelType === 'bracket' && (
        <>
          <WireframeBracket position={[0, 0, 0]} />
          <WireframeBracket position={[-2, 0.3, -0.5]} />
          <WireframeGear position={[2, -0.2, 0.5]} />
        </>
      )}

      {modelType === 'beam' && (
        <>
          <WireframeBeam position={[0, 0, 0]} />
          <WireframeBracket position={[-2.5, 0.5, -1]} />
          <WireframeShaft position={[2.5, -0.3, 1]} />
        </>
      )}

      {modelType === 'shaft' && (
        <>
          <WireframeShaft position={[0, 0, 0]} />
          <WireframeGear position={[-2, 0.4, -1]} />
          <WireframeGear position={[2, -0.4, 1]} />
        </>
      )}

      {modelType === 'pipe' && (
        <>
          <WireframePipe position={[0, 0, 0]} />
          <WireframeConnector position={[-2, 0.3, -1]} />
          <WireframePlate position={[2, -0.3, 1]} />
        </>
      )}

      {modelType === 'plate' && (
        <>
          <WireframePlate position={[0, 0, 0]} />
          <WireframeBracket position={[-2.2, 0.4, -0.8]} />
          <WireframeShaft position={[2.2, -0.4, 0.8]} />
        </>
      )}

      {modelType === 'connector' && (
        <>
          <WireframeConnector position={[0, 0, 0]} />
          <WireframePipe position={[-2.5, 0.5, -1]} />
          <WireframeGear position={[2.5, -0.5, 1]} />
        </>
      )}

      {modelType === 'housing' && (
        <>
          <WireframeHousing position={[0, 0, 0]} />
          <WireframeBeam position={[-2.3, 0.4, -1]} />
          <WireframeBracket position={[2.3, -0.4, 1]} />
        </>
      )}
    </>
  );
}

export default function BlueprintModel3D({ modelType = 'gear', className = '' }: BlueprintModel3DProps) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        style={{ background: 'transparent' }}
      >
        <Scene modelType={modelType} />
      </Canvas>
    </div>
  );
}
