import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating 3D Coin
function Coin({ position, rotationSpeed = 1, color = '#F59E0B' }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8 * rotationSpeed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position}>
        <cylinderGeometry args={[0.9, 0.9, 0.15, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

// Floating Sleek Credit Card
function CreditCard() {
  const cardRef = useRef();

  useFrame((state, delta) => {
    if (cardRef.current) {
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
      cardRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1}>
      <group ref={cardRef} position={[0, 0, 0]} rotation={[0.2, -0.4, 0.1]}>
        {/* Card Body */}
        <mesh>
          <boxGeometry args={[3.2, 2.0, 0.08]} />
          <meshStandardMaterial
            color="#1E1B4B"
            roughness={0.25}
            metalness={0.85}
          />
        </mesh>
        {/* Chip Accent */}
        <mesh position={[-0.9, 0.2, 0.05]}>
          <boxGeometry args={[0.5, 0.4, 0.02]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Holographic glowing sphere inside */}
        <mesh position={[0.9, -0.4, 0.05]}>
          <circleGeometry args={[0.3, 32]} />
          <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.7, -0.4, 0.06]}>
          <circleGeometry args={[0.3, 32]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.5} transparent opacity={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

// Particle field
function Particles({ count = 60 }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 12;
      coords[i * 3 + 1] = (Math.random() - 0.5) * 12;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return coords;
  }, [count]);

  const pointsRef = useRef();

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#38BDF8"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

class ThreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('WebGL / 3D Canvas notice:', error?.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[380px] flex items-center justify-center p-6 text-center">
          <div className="relative w-56 h-36 rounded-3xl bg-gradient-to-tr from-brand-violet/40 via-indigo-900/60 to-brand-cyan/30 border border-white/20 p-5 shadow-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-white/80 font-bold">
              <span>SpendIQ</span>
              <span>•••• 2026</span>
            </div>
            <div className="text-2xl font-black font-numeric text-white">₹ 1,50,000</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main 3D Canvas with Fallback & Error Handling
export default function ThreeHeroScene() {
  return (
    <ThreeErrorBoundary>
      <div className="relative w-full h-full min-h-[380px] flex items-center justify-center pointer-events-none">
        <Suspense
          fallback={
            <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-brand-violet/20 via-brand-cyan/20 to-finance-income/10 animate-pulse blur-2xl" />
          }
        >
          <Canvas
            camera={{ position: [0, 0, 6], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            className="w-full h-full"
          >
            <ambientLight intensity={0.9} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#38BDF8" />
            <pointLight position={[-5, -3, 3]} intensity={1.2} color="#A855F7" />
            <directionalLight position={[0, 4, 3]} intensity={0.8} />

            <CreditCard />
            <Coin position={[-2.2, 1.4, -0.5]} rotationSpeed={1.2} color="#FBBF24" />
            <Coin position={[2.4, -1.2, -0.2]} rotationSpeed={0.8} color="#34D399" />
            <Coin position={[2.0, 1.5, -1]} rotationSpeed={1.5} color="#818CF8" />
            <Particles count={70} />
          </Canvas>
        </Suspense>
      </div>
    </ThreeErrorBoundary>
  );
}
