'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GammaVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 8;
    camera.position.y = 3;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create 3D gamma surface
    const surfaceGeometry = new THREE.PlaneGeometry(10, 10, 50, 50);
    const surfaceMaterial = new THREE.MeshBasicMaterial({
      color: 0xc9a227,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.rotation.x = -Math.PI / 2;
    scene.add(surface);

    // Add gamma peaks (mountains)
    const peaks: THREE.Mesh[] = [];
    const peakGeometry = new THREE.ConeGeometry(0.5, 2, 8);
    const peakMaterial = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < 8; i++) {
      const peak = new THREE.Mesh(peakGeometry, peakMaterial);
      peak.position.x = (Math.random() - 0.5) * 8;
      peak.position.z = (Math.random() - 0.5) * 8;
      peak.position.y = 1;
      peak.scale.y = 0.5 + Math.random() * 1.5;
      peaks.push(peak);
      scene.add(peak);
    }

    // Add support/resistance levels as 3D planes
    const levelGeometry = new THREE.BoxGeometry(10, 0.1, 0.5);
    const levelMaterial = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.5
    });

    const supportLevel = new THREE.Mesh(levelGeometry, levelMaterial);
    supportLevel.position.y = -1;
    scene.add(supportLevel);

    const resistanceLevel = new THREE.Mesh(levelGeometry, levelMaterial.clone());
    resistanceLevel.material = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.5
    });
    resistanceLevel.position.y = 3;
    scene.add(resistanceLevel);

    // Add moving price line
    const lineGeometry = new THREE.BufferGeometry();
    const linePoints: THREE.Vector3[] = [];
    for (let i = 0; i < 50; i++) {
      linePoints.push(new THREE.Vector3(
        (i - 25) * 0.2,
        Math.sin(i * 0.3) * 1.5,
        0
      ));
    }
    lineGeometry.setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xf97316,
      linewidth: 2
    });
    const priceLine = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(priceLine);

    // Add glow effect particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = Math.random() * 4;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xc9a227,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation
    let animationId: number;
    let time = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      // Smooth camera rotation based on mouse
      targetRotationY = mouseX * 0.3;
      targetRotationX = mouseY * 0.2;
      
      camera.position.x = Math.sin(targetRotationY) * 8;
      camera.position.z = Math.cos(targetRotationY) * 8;
      camera.position.y = 3 + targetRotationX * 2;
      camera.lookAt(0, 0, 0);

      // Animate surface
      const positions = surfaceGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        positions[i + 1] = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time) * 0.5;
      }
      surfaceGeometry.attributes.position.needsUpdate = true;

      // Animate peaks
      peaks.forEach((peak, i) => {
        peak.scale.y = 0.5 + Math.sin(time + i) * 0.5;
        peak.position.y = peak.scale.y * 0.5;
      });

      // Animate price line
      const linePositions = priceLine.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < linePositions.length; i += 3) {
        linePositions[i + 1] = Math.sin((i / 3) * 0.3 + time) * 1.5;
      }
      priceLine.geometry.attributes.position.needsUpdate = true;

      // Rotate particles
      particles.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[300px]"
      style={{ position: 'relative', cursor: 'grab' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}
