"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

function Model({ stepFileUrl }: { stepFileUrl: string }) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    // Convert STEP to STL on server, then load
    fetch(`/api/convert-to-stl?stepFileUrl=${encodeURIComponent(stepFileUrl)}`)
      .then(res => res.blob())
      .then(blob => {
        const loader = new STLLoader();
        loader.load(URL.createObjectURL(blob), (geo) => {
          geo.center();
          setGeometry(geo);
        });
      })
      .catch((error) => {
        console.error("Error loading STEP file:", error);
      });
  }, [stepFileUrl]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#64748b"
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
}

export default function CADViewer({ stepFileId }: { stepFileId: string }) {
  const [mounted, setMounted] = useState(false);
  const stepFileUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${stepFileId}`;

  useEffect(() => {
    // Ensure we're on the client side before rendering Canvas
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] rounded-2xl border-2 border-gray-200 overflow-hidden flex items-center justify-center">
        <div className="text-gray-500">Loading 3D viewer...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-2xl border-2 border-gray-200 overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[50, 50, 50]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={20}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-10, 5, -5]} intensity={0.3} color="#3b82f6" />
        
        {/* Ground plane */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>

        {/* Model */}
        <Suspense fallback={null}>
          <Model stepFileUrl={stepFileUrl} />
        </Suspense>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

