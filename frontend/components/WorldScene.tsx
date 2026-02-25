"use client";

import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GRID_WIDTH, GRID_HEIGHT } from "@/lib/config";

const WORLD_GLB = "/the_world_of_remnant.glb";

if (typeof window !== "undefined") {
  useGLTF.preload(WORLD_GLB);
}
const TREE_VISUAL_SCALE = 0.0055;
const GREEN_COLOR = "#22c55e";
const USER_TREE_COLOR = "#86efac";
const USER_TREE_SCALE = 1.35;
const TRUNK_COLOR = "#6B4423";
const TRUNK_HEIGHT = 0.02;
const TRUNK_RADIUS = 0.0045;
const TRUNK_CAP_RADIUS = 0.007;
const TRUNK_CAP_HEIGHT = 0.002;
const FOLIAGE_HEIGHT = 0.026;
const FOLIAGE_RADIUS = 0.016;
const TREE_SCALE_FACTOR = TREE_VISUAL_SCALE / FOLIAGE_RADIUS;

function gridToLngLat(x: number, y: number): { lng: number; lat: number } {
  const lng = (x / GRID_WIDTH) * 360 - 180;
  const lat = 90 - (y / GRID_HEIGHT) * 180;
  return { lng, lat };
}

function lngLatToGrid(lng: number, lat: number): { x: number; y: number } {
  const x = Math.round(((lng + 180) / 360) * GRID_WIDTH);
  const y = Math.round(((90 - lat) / 180) * GRID_HEIGHT);
  return {
    x: Math.max(0, Math.min(GRID_WIDTH - 1, x)),
    y: Math.max(0, Math.min(GRID_HEIGHT - 1, y)),
  };
}

function lngLatToPosition(lng: number, lat: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = (lng * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function positionToLngLat(pos: THREE.Vector3, radius: number): { lng: number; lat: number } {
  const phi = Math.acos(THREE.MathUtils.clamp(pos.y / radius, -1, 1));
  const theta = Math.atan2(pos.x, pos.z);
  const lat = 90 - (phi * 180) / Math.PI;
  const lng = (theta * 180) / Math.PI;
  return { lng, lat };
}

export type GreenPosition = { x: number; y: number; position: [number, number, number] };

type WorldSceneProps = {
  greenTiles: Set<string>;
  exactPositions: Map<string, [number, number, number]>;
  userTileKeys?: Set<string>;
  onTileClick: (x: number, y: number, position: [number, number, number]) => void;
  disabled?: boolean;
  /** Mobil veya miniapp: kamera başlangıçta daha uzak (dünya ekrana sığar) */
  mobileOrMiniapp?: boolean;
};

const TARGET_RADIUS = 1;

const BOX3_SIZE = new THREE.Vector3();

function isBarOrRingObject(obj: THREE.Object3D): boolean {
  const t = obj.type;
  if (t === "Line" || t === "LineSegments") return true;
  const name = (obj.name || "").toLowerCase();
  if (
    name.includes("axis") ||
    name.includes("equator") ||
    name.includes("line") ||
    name.includes("bar") ||
    name.includes("ring") ||
    name.includes("pole")
  )
    return true;
  if ((obj as THREE.Mesh).isMesh) {
    const mesh = obj as THREE.Mesh;
    const geom = mesh.geometry;
    if (!geom) return false;
    if (!geom.boundingBox) geom.computeBoundingBox();
    const box = geom.boundingBox;
    if (!box) return false;
    box.getSize(BOX3_SIZE);
    const min = Math.min(BOX3_SIZE.x, BOX3_SIZE.y, BOX3_SIZE.z);
    const max = Math.max(BOX3_SIZE.x, BOX3_SIZE.y, BOX3_SIZE.z);
    if (max < 1e-6) return false;
    if (min / max < 0.25) return true;
  }
  return false;
}

function hideBarsAndRing(scene: THREE.Object3D): void {
  scene.traverse((child) => {
    if (isBarOrRingObject(child)) child.visible = false;
  });
}

function GlobeModel({
  onPointerDown,
  onRadius,
}: {
  onPointerDown: (point: THREE.Vector3) => void;
  onRadius: (r: number) => void;
}) {
  const { scene } = useGLTF(WORLD_GLB);
  const groupRef = useRef<THREE.Group>(null);
  const reported = useRef(false);

  const cloned = useMemo(() => {
    const s = scene.clone();
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = (mesh.material as THREE.Material).clone();
      }
    });
    hideBarsAndRing(s);
    return s;
  }, [scene]);

  useFrame(() => {
    if (groupRef.current && !reported.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const size = box.getSize(new THREE.Vector3());
      const r = Math.max(size.x, size.y, size.z) / 2;
      if (r > 0 && isFinite(r)) {
        reported.current = true;
        const scale = TARGET_RADIUS / r;
        groupRef.current.scale.setScalar(scale);
        onRadius(TARGET_RADIUS);
      }
    }
  });

  const handlePointerDown = useCallback(
    (e: { point: THREE.Vector3; stopPropagation: () => void }) => {
      e.stopPropagation();
      onPointerDown(e.point.clone());
    },
    [onPointerDown]
  );

  return (
    <group ref={groupRef}>
      <primitive object={cloned} onPointerDown={handlePointerDown} />
    </group>
  );
}

function TinyTree({
  position,
  scale,
  color,
  renderOrder,
}: {
  position: THREE.Vector3;
  scale: number;
  color: string;
  renderOrder: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const normal = useMemo(() => position.clone().normalize(), [position.x, position.y, position.z]);
  const quat = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normal
      ),
    [normal.x, normal.y, normal.z]
  );
  const trunkY = TRUNK_HEIGHT / 2;
  const capY = TRUNK_HEIGHT;
  const foliageY = TRUNK_HEIGHT + FOLIAGE_HEIGHT / 2;

  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    g.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).raycast = () => {};
    });
  }, []);

  return (
    <group ref={groupRef} position={position} quaternion={quat} scale={scale}>
      <mesh position={[0, trunkY, 0]} renderOrder={renderOrder}>
        <cylinderGeometry args={[TRUNK_RADIUS, TRUNK_RADIUS * 1.1, TRUNK_HEIGHT, 6]} />
        <meshBasicMaterial color={TRUNK_COLOR} depthTest={true} depthWrite={false} />
      </mesh>
      <mesh position={[0, capY, 0]} renderOrder={renderOrder}>
        <cylinderGeometry args={[TRUNK_CAP_RADIUS, TRUNK_CAP_RADIUS, TRUNK_CAP_HEIGHT, 8]} />
        <meshBasicMaterial color={TRUNK_COLOR} depthTest={true} depthWrite={false} />
      </mesh>
      <mesh position={[0, foliageY, 0]} renderOrder={renderOrder}>
        <coneGeometry args={[FOLIAGE_RADIUS, FOLIAGE_HEIGHT, 8]} />
        <meshBasicMaterial color={color} depthTest={true} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GreenDots({
  greenTiles,
  exactPositions,
  radius,
  userTileKeys,
}: {
  greenTiles: Set<string>;
  exactPositions: Map<string, [number, number, number]>;
  radius: number;
  userTileKeys?: Set<string>;
}) {
  const treeScale = TREE_SCALE_FACTOR * radius;
  const dots = useMemo(() => {
    return Array.from(greenTiles).map((key) => {
      const exact = exactPositions.get(key);
      const pos = exact
        ? new THREE.Vector3(exact[0], exact[1], exact[2])
        : (() => {
            const [x, y] = key.split(",").map(Number);
            const { lng, lat } = gridToLngLat(x, y);
            return lngLatToPosition(lng, lat, radius);
          })();
      return { key, pos };
    });
  }, [greenTiles, exactPositions, radius]);

  return (
    <>
      {dots.map(({ key, pos }, i) => {
        const isYours = userTileKeys?.has(key);
        const scale = treeScale * (isYours ? USER_TREE_SCALE : 1);
        const color = isYours ? USER_TREE_COLOR : GREEN_COLOR;
        return (
          <TinyTree
            key={`${key}-${i}`}
            position={pos}
            scale={scale}
            color={color}
            renderOrder={isYours ? 2 : 1}
          />
        );
      })}
    </>
  );
}

export function WorldScene({
  greenTiles,
  exactPositions,
  userTileKeys,
  onTileClick,
  disabled,
  mobileOrMiniapp = false,
}: WorldSceneProps) {
  const handleGlobeClick = useCallback(
    (point: THREE.Vector3) => {
      if (disabled) return;
      const r = point.length();
      if (r < 1e-6) return;
      const { lng, lat } = positionToLngLat(point, r);
      const { x, y } = lngLatToGrid(lng, lat);
      onTileClick(x, y, [point.x, point.y, point.z]);
    },
    [onTileClick, disabled]
  );

  const [autoRotate, setAutoRotate] = useState(true);
  const [fastSpeed, setFastSpeed] = useState(false);
  const autoRotateSpeed = fastSpeed ? 2.2 : 0.8;

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", minHeight: "100vh" }}>
      <CanvasWrapper
        greenTiles={greenTiles}
        exactPositions={exactPositions}
        userTileKeys={userTileKeys}
        onGlobeClick={handleGlobeClick}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        mobileOrMiniapp={mobileOrMiniapp}
      />
      <div className="globe-controls">
        <button
          type="button"
          className="globe-rotate-toggle"
          onClick={() => setAutoRotate((v) => !v)}
          title={autoRotate ? "Durdur" : "Döndür"}
          aria-label={autoRotate ? "Durdur" : "Döndür"}
        >
          {autoRotate ? "⏸" : "▶"}
        </button>
        <button
          type="button"
          className={`globe-speed-toggle ${fastSpeed ? "is-fast" : ""}`}
          onClick={() => setFastSpeed((v) => !v)}
          title={fastSpeed ? "Hızı düşür (1x)" : "Hızlandır (2x)"}
          aria-label={fastSpeed ? "Hızı düşür" : "Hızlandır"}
        >
          {fastSpeed ? "2×" : "1×"}
        </button>
      </div>
    </div>
  );
}

const CAMERA_Z_DESKTOP = 2.2;
const CAMERA_Z_MOBILE = 3.5;
const MIN_DISTANCE_DESKTOP = 1.65;
const MIN_DISTANCE_MOBILE = 2.8;

function CanvasWrapper({
  greenTiles,
  exactPositions,
  userTileKeys,
  onGlobeClick,
  autoRotate,
  autoRotateSpeed,
  mobileOrMiniapp = false,
}: {
  greenTiles: Set<string>;
  exactPositions: Map<string, [number, number, number]>;
  userTileKeys?: Set<string>;
  onGlobeClick: (point: THREE.Vector3) => void;
  autoRotate: boolean;
  autoRotateSpeed: number;
  mobileOrMiniapp?: boolean;
}) {
  const [radius, setRadius] = useState(1);
  const cameraZ = mobileOrMiniapp ? CAMERA_Z_MOBILE : CAMERA_Z_DESKTOP;
  const minDist = mobileOrMiniapp ? MIN_DISTANCE_MOBILE : MIN_DISTANCE_DESKTOP;

  const onRadius = useCallback((r: number) => {
    setRadius((prev) => (r > 0 && r !== prev ? r : prev));
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", background: "transparent" }}>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", display: "block", background: "transparent" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-3, -2, 2]} intensity={0.5} />
        <GlobeModel onPointerDown={onGlobeClick} onRadius={onRadius} />
        <GreenDots
          greenTiles={greenTiles}
          exactPositions={exactPositions}
          radius={radius}
          userTileKeys={userTileKeys}
        />
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={minDist}
          maxDistance={6}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
        />
      </Canvas>
    </div>
  );
}

