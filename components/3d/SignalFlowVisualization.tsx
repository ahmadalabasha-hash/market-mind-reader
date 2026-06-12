'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function SignalFlowVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create 3D bar chart for signal strength
    const bars: THREE.Mesh[] = [];
    const barGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const barMaterial = new THREE.MeshBasicMaterial({
      color: 0xc9a227,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < 15; i++) {
      const bar = new THREE.Mesh(barGeometry, barMaterial.clone());
      bar.position.x = (i - 7) * 0.8;
      bar.position.z = 0;
      bar.scale.y = 0.5 + Math.random() * 2;
      bars.push(bar);
      scene.add(bar);
    }

    // Add signal flow lines
    const flowLines: THREE.Line[] = [];
    const flowMaterial = new THREE.LineBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.6
    });

    for (let i = 0; i < 5; i++) {
      const points: THREE.Vector3[] = [];
      for (let j = 0; j < 20; j++) {
        points.push(new THREE.Vector3(
          (j - 10) * 0.5,
          Math.sin(j * 0.5 + i) * 1.5 + i * 0.5,
          (i - 2) * 0.5
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, flowMaterial);
      flowLines.push(line);
      scene.add(line);
    }

    // Add signal nodes (circles)
    const nodes: THREE.Mesh[] = [];
    const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.9
    });

    for (let i = 0; i < 10; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.x = (Math.random() - 0.5) * 8;
      node.position.y = Math.random() * 3;
      node.position.z = (Math.random() - 0.5) * 4;
      nodes.push(node);
      scene.add(node);
    }

    // Add grid floor
    const gridHelper = new THREE.GridHelper(15, 30, 0xc9a227, 0x333333);
    gridHelper.position.y = -2;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Add moving signal particles
    const signalGeometry = new THREE.BufferGeometry();
    const signalCount = 50;
    const signalPositions = new Float32Array(signalCount * 3);

    for (let i = 0; i < signalCount * 3; i += 3) {
      signalPositions[i] = (Math.random() - 0.5) * 10;
      signalPositions[i + 1] = Math.random() * 4;
      signalPositions[i + 2] = (Math.random() - 0.5) * 4;
    }

    signalGeometry.setAttribute('position', new THREE.BufferAttribute(signalPositions, 3));
    const signalMaterial = new THREE.PointsMaterial({
      color: 0x22c55e,
      size: 0.08,
      transparent: true,
      opacity: 0.8
    });
    const signalParticles = new THREE.Points(signalGeometry, signalMaterial);
    scene.add(signalParticles);

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
      time += 0.02;

      // Smooth scene rotation based on mouse
      targetRotationY = mouseX * 0.3;
      targetRotationX = mouseY * 0.2;
      
      scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.05;
      scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.05;

      // Animate bars
      bars.forEach((bar, i) => {
        bar.scale.y = 0.5 + Math.sin(time + i * 0.5) * 1.5 + 1;
        bar.position.y = bar.scale.y / 2 - 2;
      });

      // Animate flow lines
      flowLines.forEach((line, i) => {
        const positions = line.geometry.attributes.position.array as Float32Array;
        for (let j = 0; j < positions.length; j += 3) {
          positions[j + 1] = Math.sin((j / 3) * 0.5 + time + i) * 1.5 + i * 0.5;
        }
        line.geometry.attributes.position.needsUpdate = true;
      });

      // Animate nodes
      nodes.forEach((node, i) => {
        node.position.y += Math.sin(time + i) * 0.01;
        node.position.x += Math.cos(time + i * 0.5) * 0.005;
      });

      // Animate signal particles
      const signalPositions = signalParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < signalCount * 3; i += 3) {
        signalPositions[i] += 0.02;
        if (signalPositions[i] > 5) signalPositions[i] = -5;
        signalPositions[i + 1] += Math.sin(time + i) * 0.01;
      }
      signalParticles.geometry.attributes.position.needsUpdate = true;

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
