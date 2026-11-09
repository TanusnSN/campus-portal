'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geom = new THREE.IcosahedronGeometry(7, 2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.9,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(10, 0, 0);
    scene.add(mesh);

    const count = 1200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 100;
    }
    const partGeom = new THREE.BufferGeometry();
    partGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(partGeom, partMat);
    scene.add(particles);

    const light = new THREE.PointLight(0xa855f7, 4, 100);
    light.position.set(5, 10, 15);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    let mouseX = 0;
    let mouseY = 0;
    const onPointerMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onPointerMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let id: number;
    const animate = () => {
      id = requestAnimationFrame(animate);

      mesh.rotation.y += 0.004;
      mesh.rotation.x += 0.002;
      particles.rotation.y += 0.0006;

      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('resize', onResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geom.dispose();
      mat.dispose();
      partGeom.dispose();
      partMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
