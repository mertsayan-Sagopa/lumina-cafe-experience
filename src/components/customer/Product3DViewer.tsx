"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Move3d, RotateCcw } from "lucide-react";
import { Product } from "@/lib/types";

interface Product3DViewerProps {
  product: Product;
}

function buildProceduralModel(product: Product): THREE.Group {
  const group = new THREE.Group();
  const cat = product.category_id;
  const id = product.id;

  // Common materials
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: 0xf5efe6,
    roughness: 0.25,
    metalness: 0.05,
  });
  const darkPlateMat = new THREE.MeshStandardMaterial({
    color: 0x2c1e16,
    roughness: 0.45,
    metalness: 0.1,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xc9a063,
    roughness: 0.25,
    metalness: 0.85,
  });

  // 1. Iced Drinks / Mocktails / Matcha
  if (cat === "cat-mocktail" || cat === "cat-soft" || id === "prod-matcha") {
    const liquidColor =
      id === "prod-hibiscus"
        ? 0x9b1b30
        : id === "prod-matcha"
          ? 0x6b9e4b
          : id === "prod-cola"
            ? 0x2b140c
            : 0xe6d67a;

    // Glass body
    const glassGeo = new THREE.CylinderGeometry(0.68, 0.52, 2.0, 32, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0,
      transmission: 0.82,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 1.05;
    group.add(glass);

    // Glass base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.52, 0.14, 32),
      ceramicMat
    );
    base.position.y = 0.07;
    group.add(base);

    // Liquid
    const liquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.48, 1.55, 32),
      new THREE.MeshStandardMaterial({
        color: liquidColor,
        roughness: 0.18,
        metalness: 0.05,
        transparent: true,
        opacity: 0.9,
      })
    );
    liquid.position.y = 0.92;
    group.add(liquid);

    // Ice cubes
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0xeef8ff,
      roughness: 0.12,
      transparent: true,
      opacity: 0.72,
    });
    const icePositions = [
      [-0.18, 1.55, 0.12],
      [0.2, 1.6, -0.1],
      [0.0, 1.35, -0.16],
    ];
    icePositions.forEach(([x, y, z], idx) => {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), iceMat);
      cube.position.set(x, y, z);
      cube.rotation.set(idx * 0.4, idx * 0.7, 0.2);
      group.add(cube);
    });

    // Straw
    const straw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 2.4, 16),
      goldMat
    );
    straw.position.set(0.22, 1.35, 0);
    straw.rotation.z = -0.18;
    group.add(straw);

    group.position.y = -0.95;
    return group;
  }

  // 2. Hot Coffees & Teas (Ceramic Cup + Saucer + Foam)
  if (cat === "cat-espresso" || cat === "cat-coffee" || cat === "cat-tea") {
    const foamColor =
      id === "prod-golden-milk"
        ? 0xe4a83b
        : id === "prod-longblack" || id === "prod-v60"
          ? 0x3b2214
          : 0xc89b72;

    // Saucer
    const saucer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 0.85, 0.12, 40),
      ceramicMat
    );
    saucer.position.y = 0.06;
    saucer.receiveShadow = true;
    group.add(saucer);

    // Cup outer body
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.56, 1.05, 40),
      ceramicMat
    );
    cup.position.y = 0.65;
    cup.castShadow = true;
    group.add(cup);

    // Coffee / Foam surface
    const foam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, 0.06, 36),
      new THREE.MeshStandardMaterial({
        color: foamColor,
        roughness: 0.4,
      })
    );
    foam.position.y = 1.15;
    group.add(foam);

    // Latte art swirl dot
    const art = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.02, 24),
      new THREE.MeshStandardMaterial({ color: 0xf7f1e8, roughness: 0.5 })
    );
    art.position.y = 1.19;
    group.add(art);

    // Cup Handle
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.075, 16, 32, Math.PI),
      ceramicMat
    );
    handle.position.set(0.72, 0.68, 0);
    handle.rotation.z = -Math.PI / 2;
    group.add(handle);

    group.position.y = -0.55;
    return group;
  }

  // 3. Packaged Coffee Beans Bag
  if (cat === "cat-packaged") {
    const bagMat = new THREE.MeshStandardMaterial({
      color: 0x241913,
      roughness: 0.6,
      metalness: 0.12,
    });
    const bag = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.85, 0.6), bagMat);
    bag.position.y = 0.92;
    bag.castShadow = true;
    group.add(bag);

    // Gold label
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.72, 0.62), goldMat);
    label.position.y = 1.02;
    group.add(label);

    // Top seal
    const seal = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.16, 0.12), bagMat);
    seal.position.y = 1.9;
    group.add(seal);

    group.position.y = -0.9;
    return group;
  }

  // 4. Burger
  if (id === "prod-burger") {
    // Plate
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.1, 0.12, 40),
      darkPlateMat
    );
    plate.position.y = 0.06;
    group.add(plate);

    const bunMat = new THREE.MeshStandardMaterial({
      color: 0xd49552,
      roughness: 0.55,
    });
    const pattyMat = new THREE.MeshStandardMaterial({
      color: 0x4b2617,
      roughness: 0.8,
    });
    const cheeseMat = new THREE.MeshStandardMaterial({
      color: 0xf2b531,
      roughness: 0.35,
    });

    const bottomBun = new THREE.Mesh(
      new THREE.CylinderGeometry(0.82, 0.78, 0.28, 32),
      bunMat
    );
    bottomBun.position.y = 0.26;
    group.add(bottomBun);

    const patty1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.22, 32),
      pattyMat
    );
    patty1.position.y = 0.5;
    group.add(patty1);

    const cheese = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.06, 1.42),
      cheeseMat
    );
    cheese.position.y = 0.64;
    cheese.rotation.y = 0.3;
    group.add(cheese);

    const patty2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.83, 0.83, 0.2, 32),
      pattyMat
    );
    patty2.position.y = 0.78;
    group.add(patty2);

    const topBun = new THREE.Mesh(
      new THREE.SphereGeometry(0.84, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      bunMat
    );
    topBun.scale.set(1, 0.65, 1);
    topBun.position.y = 0.88;
    group.add(topBun);

    group.position.y = -0.65;
    return group;
  }

  // 5. Desserts / Bakery / Main Plates (Layered 3D Cake / Dish on Ceramic Plate)
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.0, 0.12, 40),
    ceramicMat
  );
  plate.position.y = 0.06;
  group.add(plate);

  const mainColor =
    cat === "cat-dessert"
      ? 0xf2dfbd
      : cat === "cat-bakery"
        ? 0xd69a4a
        : cat === "cat-breakfast"
          ? 0x8fb569
          : 0x8f5634;

  const toppingColor =
    cat === "cat-dessert"
      ? 0x3a1f14
      : cat === "cat-breakfast"
        ? 0x9b2242
        : 0xc9a063;

  const baseDish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.84, 0.72, 32),
    new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.5,
    })
  );
  baseDish.position.y = 0.48;
  baseDish.castShadow = true;
  group.add(baseDish);

  const glaze = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.14, 32),
    new THREE.MeshStandardMaterial({
      color: toppingColor,
      roughness: 0.22,
      metalness: 0.08,
    })
  );
  glaze.position.y = 0.88;
  group.add(glaze);

  group.position.y = -0.5;
  return group;
}

export default function Product3DViewer({ product }: Product3DViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [loadingGlb, setLoadingGlb] = useState(Boolean(product.model_3d_url));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.4, 2.0, 3.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Luxury warm studio lighting
    const ambient = new THREE.AmbientLight(0xfff6ea, 1.25);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.8);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd9b382, 0.9);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Subtle studio floor shadow disc
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 48),
      new THREE.MeshStandardMaterial({
        color: 0xe8dfd3,
        roughness: 0.95,
        transparent: true,
        opacity: 0.35,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.95;
    floor.receiveShadow = true;
    scene.add(floor);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.8;
    controlsRef.current = controls;

    let activeModel: THREE.Object3D | null = null;

    if (product.model_3d_url) {
      setLoadingGlb(true);
      const loader = new GLTFLoader();
      loader.load(
        product.model_3d_url,
        (gltf) => {
          activeModel = gltf.scene;
          const box = new THREE.Box3().setFromObject(activeModel);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const scale = 2.0 / maxDim;
          activeModel.scale.setScalar(scale);
          const center = box.getCenter(new THREE.Vector3());
          activeModel.position.sub(center.multiplyScalar(scale));
          scene.add(activeModel);
          setLoadingGlb(false);
        },
        undefined,
        () => {
          // Fallback to procedural 3D model if .glb fails
          activeModel = buildProceduralModel(product);
          scene.add(activeModel);
          setLoadingGlb(false);
        }
      );
    } else {
      activeModel = buildProceduralModel(product);
      scene.add(activeModel);
      setLoadingGlb(false);
    }

    let animId = 0;
    const animate = () => {
      animId = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 240;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [product]);

  const resetCamera = () => {
    controlsRef.current?.reset();
  };

  return (
    <div className="relative h-60 w-full select-none overflow-hidden bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-card)]">
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {loadingGlb && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--bg-elevated)]/70 backdrop-blur-sm">
          <span className="rounded-full bg-[var(--brand-primary)] px-3 py-1 text-xs font-medium text-[var(--text-inverse)]">
            3D Model Yükleniyor...
          </span>
        </div>
      )}

      {/* Interactive 360° Hint */}
      <div className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)]/85 px-2.5 py-1 text-[10px] font-medium text-[var(--text-primary)] shadow-sm backdrop-blur-md">
        <Move3d className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
        360° döndürmek için sürükleyin
      </div>

      {/* Reset Camera Button */}
      <button
        type="button"
        onClick={resetCamera}
        aria-label="Kamerayı sıfırla"
        className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)]/85 text-[var(--text-primary)] shadow-sm backdrop-blur-md active:scale-95"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
