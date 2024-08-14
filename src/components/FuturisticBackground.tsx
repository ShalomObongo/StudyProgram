import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Line, Html, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { random } from 'maath';
import { MeshBasicMaterial, SphereGeometry, CylinderGeometry, ConeGeometry, BoxGeometry } from 'three';

type Projectile = { position: THREE.Vector3; target: THREE.Vector3 } | null;

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const { width, height } = useThree((state) => state.viewport);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    const colors = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = Math.random() * 2;
      positions.set([x, y, z], i * 3);
      colors.set([Math.random() + 0.5, Math.random() + 0.5, Math.random() + 0.5], i * 3);
    }
    return [positions, colors];
  }, [width, height]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.01}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function NeonGrid() {
  const { width, height } = useThree((state) => state.viewport);
  const lineCount = 20;
  const lineSpacing = width / lineCount;

  return (
    <>
      {Array.from({ length: lineCount + 1 }).map((_, i) => (
        <React.Fragment key={`grid-${i}`}>
          <Line
            points={[
              [i * lineSpacing - width / 2, -height / 2, 0],
              [i * lineSpacing - width / 2, height / 2, 0],
            ]}
            color="#00ffff"
            lineWidth={0.5}
            transparent
            opacity={0.2}
          />
          <Line
            points={[
              [-width / 2, i * lineSpacing - height / 2, 0],
              [width / 2, i * lineSpacing - height / 2, 0],
            ]}
            color="#00ffff"
            lineWidth={0.5}
            transparent
            opacity={0.2}
          />
        </React.Fragment>
      ))}
    </>
  );
}

function Explosion({ position }: { position: THREE.Vector3 }) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const particleCount = 500;
  const explosionDuration = 2;
  const clock = new THREE.Clock();

  const [particlePositions, particleColors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = Math.random() * 0.2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
    }
    return [positions, colors];
  }, []);

  const shockwaveMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x00ffff) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        void main() {
          float strength = 1.0 - step(0.1, abs(distance(vUv, vec2(0.5)) - time * 0.5));
          gl_FragColor = vec4(color, strength * 0.5);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  useEffect(() => {
    clock.start();
    return () => {
      clock.stop();
    };
  }, []);

  useFrame(() => {
    const elapsedTime = clock.getElapsedTime();
    const t = Math.min(elapsedTime / explosionDuration, 1);

    if (particlesRef.current) {
      const geometry = particlesRef.current.geometry as THREE.BufferGeometry;
      const positions = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = particlePositions[i3] * (1 + t * 20);
        positions[i3 + 1] = particlePositions[i3 + 1] * (1 + t * 20);
        positions[i3 + 2] = particlePositions[i3 + 2] * (1 + t * 20);
      }

      geometry.attributes.position.needsUpdate = true;
      (particlesRef.current.material as THREE.PointsMaterial).opacity = 1 - t;
    }

    if (shockwaveRef.current) {
      shockwaveRef.current.scale.setScalar(1 + t * 5);
      (shockwaveRef.current.material as THREE.ShaderMaterial).uniforms.time.value = t;
    }

    if (t >= 1 && groupRef.current) {
      groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={particleColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <mesh ref={shockwaveRef} material={shockwaveMaterial}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <pointLight intensity={10} distance={5} decay={2} color={0xffff00} />
    </group>
  );
}

function Projectile({ position, target, onExplode }: { position: THREE.Vector3; target: THREE.Vector3; onExplode: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [exploded, setExploded] = useState(false);

  const rocketMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xd3d3d3,
    metalness: 0.8,
    roughness: 0.2,
  }), []);

  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.5,
  }), []);

  const engineGlowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xff4500,
    transparent: true,
    opacity: 0.8,
  }), []);

  useFrame((state, delta) => {
    if (groupRef.current && !exploded) {
      const direction = new THREE.Vector3().subVectors(target, groupRef.current.position).normalize();
      groupRef.current.position.add(direction.multiplyScalar(delta * 0.5));
      groupRef.current.lookAt(target);

      if (groupRef.current.position.distanceTo(target) < 0.05) {
        setExploded(true);
        onExplode();
      }
    }
  });

  if (exploded) {
    return <Explosion position={groupRef.current?.position || position} />;
  }

  return (
    <>
      <group ref={groupRef} position={position}>
        <group rotation={[0, 0, Math.PI / 2]}>
          {/* Main body */}
          <mesh material={rocketMaterial}>
            <cylinderGeometry args={[0.05, 0.1, 0.6, 16]} />
          </mesh>

          {/* Nose cone */}
          <mesh position={[0.35, 0, 0]} material={rocketMaterial}>
            <coneGeometry args={[0.05, 0.2, 16]} />
          </mesh>

          {/* Fins (4 asymmetrical fins) */}
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[-0.25, 0, 0]} rotation={[(i * Math.PI) / 2, 0, 0]} material={rocketMaterial}>
              <extrudeGeometry args={[
                new THREE.Shape()
                  .moveTo(0, 0)
                  .lineTo(0.15, -0.1)
                  .lineTo(0.1, 0.1)
                  .lineTo(0, 0.15),
                { depth: 0.01, bevelEnabled: false }
              ]} />
            </mesh>
          ))}

          {/* Glow effect */}
          <mesh material={glowMaterial}>
            <sphereGeometry args={[0.12, 32, 32]} />
          </mesh>

          {/* Engine nozzles */}
          {[-0.03, 0, 0.03].map((z, i) => (
            <group key={i} position={[-0.3, 0, z]}>
              <mesh material={rocketMaterial}>
                <cylinderGeometry args={[0.02, 0.03, 0.1, 16]} />
              </mesh>
              <mesh position={[-0.05, 0, 0]} material={engineGlowMaterial}>
                <sphereGeometry args={[0.025, 16, 16]} />
              </mesh>
            </group>
          ))}

          {/* Fuel tanks */}
          {[-0.06, 0.06].map((z, i) => (
            <mesh key={i} position={[0, 0, z]} material={rocketMaterial}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
            </mesh>
          ))}

          {/* Thrusters */}
          {[[0, -0.1], [0, 0.1], [-0.1, 0], [0.1, 0]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0, z]} rotation={[0, 0, Math.PI / 2]} material={rocketMaterial}>
              <cylinderGeometry args={[0.01, 0.01, 0.05, 8]} />
            </mesh>
          ))}

          {/* Engine glow */}
          <pointLight position={[-0.3, 0, 0]} distance={0.5} intensity={2} color={0xff4500} />
        </group>

        {/* Particle trail */}
        <Trail
          width={0.05}
          length={5}
          color={new THREE.Color(0x00ffff)}
          attenuation={(t) => t * t}
        >
          <mesh visible={false}>
            <sphereGeometry args={[0.01]} />
          </mesh>
        </Trail>
      </group>
    </>
  );
}

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [activeProjectile, setActiveProjectile] = useState<Projectile | null>(null);
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3());
  const [lastShot, setLastShot] = useState(0);

  const { camera } = useThree();

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      const vec = new THREE.Vector3(x, y, 0.5);
      vec.unproject(camera);
      vec.sub(camera.position).normalize();
      const distance = -camera.position.z / vec.z;
      const pos = camera.position.clone().add(vec.multiplyScalar(distance));
      setMousePosition(pos);
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [camera]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }

    // Shoot projectile only if there's no active projectile
    if (!activeProjectile && state.clock.getElapsedTime() - lastShot > 2) {
      const spherePosition = meshRef.current?.position || new THREE.Vector3();
      const newProjectile = { position: spherePosition.clone(), target: mousePosition.clone() };
      setActiveProjectile(newProjectile);
      setLastShot(state.clock.getElapsedTime());
    }
  });

  const handleExplode = () => {
    setActiveProjectile(null);
  };

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#0088ff" wireframe={true} transparent opacity={0.1} />
      </mesh>
      {activeProjectile && (
        <Projectile
          position={activeProjectile.position}
          target={activeProjectile.target}
          onExplode={handleExplode}
        />
      )}
    </>
  );
}

export function FuturisticBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <color attach="background" args={['#000']} />
        <fog attach="fog" args={['#000', 5, 15]} />
        <ambientLight intensity={0.5} />
        <ParticleField />
        <NeonGrid />
        <AnimatedSphere />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-900/20 to-purple-900/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-blue-900/20 to-transparent" />
    </div>
  );
}