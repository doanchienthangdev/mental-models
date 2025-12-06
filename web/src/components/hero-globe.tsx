'use client';

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const createGlowTexture = () => {
      const size = 128;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(255,255,255,0.95)");
      gradient.addColorStop(0.4, "rgba(148,255,228,0.8)");
      gradient.addColorStop(1, "rgba(148,255,228,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    let animationFrame: number;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.z = 6;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const radius = 1.64;
    const frameGeometry = new THREE.EdgesGeometry(new THREE.SphereGeometry(radius, 52, 52));
    const frameMaterial = new THREE.LineBasicMaterial({
      color: 0x3fb3ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const wireframe = new THREE.LineSegments(frameGeometry, frameMaterial);
    globeGroup.add(wireframe);

    const pointCount = 360;
    const positions = new Float32Array(pointCount * 3);
    const baseColors = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);
    const blinkSeeds = new Float32Array(pointCount);
    const blinkSpeeds = new Float32Array(pointCount);
    const blinkAmplitudes = new Float32Array(pointCount);
    const tempColor = new THREE.Color();
    for (let i = 0; i < pointCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + (Math.random() * 0.3 - 0.12);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      tempColor.setHSL(0.47 + Math.random() * 0.05, 1, 0.56 + Math.random() * 0.12);
      baseColors.set([tempColor.r, tempColor.g, tempColor.b], i * 3);
      colors.set([tempColor.r, tempColor.g, tempColor.b], i * 3);
      blinkSeeds[i] = Math.random() * Math.PI * 2;
      blinkSpeeds[i] = 0.8 + Math.random() * 2.2;
      blinkAmplitudes[i] = 0.3 + Math.random() * 0.6;
    }
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const glowTexture = createGlowTexture();
    const pointMaterial = new THREE.PointsMaterial({
      size: 0.11,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      vertexColors: true,
      map: glowTexture ?? undefined,
      alphaTest: 0.02,
    });
    const points = new THREE.Points(pointGeometry, pointMaterial);
    globeGroup.add(points);

    const linkMaterial = new THREE.LineBasicMaterial({ color: 0x58f9ff, transparent: true, opacity: 0.25 });
    const links: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];
    for (let i = 0; i < 28; i++) {
      const start = new THREE.Vector3().randomDirection().multiplyScalar(radius);
      const end = new THREE.Vector3().randomDirection().multiplyScalar(radius);
      const midPoint = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.15);
      const curve = new THREE.CatmullRomCurve3([start, midPoint, end]);
      const curveGeom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const line = new THREE.Line(curveGeom, linkMaterial);
      globeGroup.add(line);
      links.push(line);
    }

    const streaks: {
      line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
      progress: number;
      speed: number;
      pointsLength: number;
    }[] = [];

    const spawnStreak = () => {
      if (streaks.length >= 6) return;
      const start = new THREE.Vector3().randomDirection().multiplyScalar(radius * 0.95);
      const end = new THREE.Vector3().randomDirection().multiplyScalar(radius * 0.95);
      const midPoint = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius * (1.25 + Math.random() * 0.2));
      const curve = new THREE.CatmullRomCurve3([start, midPoint, end]);
      const points = curve.getPoints(120);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      geometry.setDrawRange(0, 0);
      const material = new THREE.LineBasicMaterial({
        color: 0x9af7ff,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
      globeGroup.add(line);
      streaks.push({ line, progress: 0, speed: 0.02 + Math.random() * 0.015, pointsLength: points.length });
    };
    const light = new THREE.PointLight(0x4effcd, 2.4, 20);
    light.position.set(3, 2, 5);
    scene.add(light);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const colorAttribute = pointGeometry.getAttribute("color") as THREE.BufferAttribute;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      globeGroup.rotation.y += 0.002;
      globeGroup.rotation.x += 0.0012;
      const time = performance.now() * 0.0015;

      const framePulse = 0.25 + 0.18 * (Math.sin(time * 0.45) + 1) / 2;
      frameMaterial.opacity = framePulse;
      frameMaterial.needsUpdate = true;

      const linkPulse = 0.15 + 0.12 * (Math.sin(time * 0.6 + 1.2) + 1) / 2;
      linkMaterial.opacity = linkPulse;
      linkMaterial.needsUpdate = true;

      const colorArray = colorAttribute.array as Float32Array;
      for (let i = 0; i < pointCount; i++) {
        const blink =
          0.45 +
          blinkAmplitudes[i] *
            Math.max(0, Math.sin(time * blinkSpeeds[i] + blinkSeeds[i]) * 0.5 + Math.random() * 0.15);
        colorArray[i * 3] = baseColors[i * 3] * blink;
        colorArray[i * 3 + 1] = baseColors[i * 3 + 1] * blink;
        colorArray[i * 3 + 2] = baseColors[i * 3 + 2] * blink;
      }
      colorAttribute.needsUpdate = true;
      pointMaterial.size = 0.055 + Math.sin(time * 1.2) * 0.01;

      if (Math.random() < 0.02) {
        spawnStreak();
      }
      for (let i = streaks.length - 1; i >= 0; i--) {
        const streak = streaks[i];
        streak.progress += streak.speed;
        const drawCount = Math.floor(streak.progress * streak.pointsLength);
        streak.line.geometry.setDrawRange(0, Math.min(drawCount, streak.pointsLength));
        streak.line.material.opacity = Math.max(0, 0.9 - streak.progress * 0.9);
        if (streak.progress >= 1) {
          globeGroup.remove(streak.line);
          streak.line.geometry.dispose();
          streak.line.material.dispose();
          streaks.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      frameGeometry.dispose();
      frameMaterial.dispose();
      pointGeometry.dispose();
      pointMaterial.dispose();
      links.forEach((line) => line.geometry.dispose());
      linkMaterial.dispose();
      streaks.forEach((streak) => {
        streak.line.geometry.dispose();
        streak.line.material.dispose();
      });
      renderer.dispose();
      glowTexture?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-3xl"
      style={{ aspectRatio: "1 / 1", minHeight: 360 }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_50%_40%,rgba(46,160,225,0.15),transparent_55%)]" />
    </div>
  );
}
