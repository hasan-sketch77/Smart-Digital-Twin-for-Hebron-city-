"use client";

import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  Suspense,
} from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useMapStore } from "@/stores/map-store";
import type { DrawingMode } from "@/types/map";

// ─────────────────────────────────────────────────────────────────────────────
// CITY GRID — identical layout, zero changes to positions/sizes
// ─────────────────────────────────────────────────────────────────────────────
const BLOCK = 26;
const ROAD = 7;
const SIDE = 1.6;    // slightly wider sidewalk for clarity
const CURB = 0.22;   // raised curb height
const COLS = 5;
const ROWS = 4;
const STEP = BLOCK + ROAD;

const OX = -((COLS * STEP) / 2) + ROAD / 2;
const OZ = -((ROWS * STEP) / 2) + ROAD / 2;

// ─────────────────────────────────────────────────────────────────────────────
// MATERIAL LIBRARY — refined palette, higher quality surface descriptions
// ─────────────────────────────────────────────────────────────────────────────

// Procedural texture helpers
function makeConcreteNormalMap() {
  const size = 128;
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!canvas) return null;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#8080ff";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 3 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${100 + Math.random() * 40},${100 + Math.random() * 40},255,0.3)`;
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createMaterials() {
  const normalMap = typeof window !== "undefined" ? makeConcreteNormalMap() : null;
  const nm = (t: THREE.Texture | null) => t ?? undefined;

  return {
    // ── Concrete façades — distinct warm/cool/neutral variants ──
    concrete_a: new THREE.MeshStandardMaterial({ color: "#68788a", roughness: 0.82, metalness: 0.08, normalMap: nm(normalMap) }),
    concrete_b: new THREE.MeshStandardMaterial({ color: "#7a8d9e", roughness: 0.78, metalness: 0.11 }),
    concrete_c: new THREE.MeshStandardMaterial({ color: "#8a9db0", roughness: 0.75, metalness: 0.13 }),
    concrete_d: new THREE.MeshStandardMaterial({ color: "#586a7a", roughness: 0.85, metalness: 0.06 }),
    concrete_e: new THREE.MeshStandardMaterial({ color: "#97aab6", roughness: 0.70, metalness: 0.16 }),
    // ── Glass curtain walls — multiple tint variants ──
    glass_a: new THREE.MeshStandardMaterial({ color: "#2a4a6e", roughness: 0.03, metalness: 0.92, transparent: true, opacity: 0.82, envMapIntensity: 1.4 }),
    glass_b: new THREE.MeshStandardMaterial({ color: "#284466", roughness: 0.04, metalness: 0.94, transparent: true, opacity: 0.78, envMapIntensity: 1.5 }),
    glass_c: new THREE.MeshStandardMaterial({ color: "#3c5875", roughness: 0.05, metalness: 0.90, transparent: true, opacity: 0.80, envMapIntensity: 1.3 }),
    // ── Architectural details ──
    ledge: new THREE.MeshStandardMaterial({ color: "#3f4f5e", roughness: 0.88, metalness: 0.14 }),
    ledge_top: new THREE.MeshStandardMaterial({ color: "#35444f", roughness: 0.90, metalness: 0.10 }),
    roof: new THREE.MeshStandardMaterial({ color: "#2e3c48", roughness: 0.92, metalness: 0.06 }),
    parapet: new THREE.MeshStandardMaterial({ color: "#28363f", roughness: 0.90, metalness: 0.08 }),
    // ── Rooftop infrastructure ──
    hvac: new THREE.MeshStandardMaterial({ color: "#a8b8c2", roughness: 0.52, metalness: 0.48 }),
    hvac_dark: new THREE.MeshStandardMaterial({ color: "#6a7a84", roughness: 0.60, metalness: 0.40 }),
    solar: new THREE.MeshStandardMaterial({ color: "#1a2f50", roughness: 0.30, metalness: 0.70, transparent: true, opacity: 0.95 }),
    solar_frame: new THREE.MeshStandardMaterial({ color: "#8090a0", roughness: 0.45, metalness: 0.60 }),
    vent: new THREE.MeshStandardMaterial({ color: "#909ea8", roughness: 0.58, metalness: 0.42 }),
    utility: new THREE.MeshStandardMaterial({ color: "#78888e", roughness: 0.72, metalness: 0.28 }),
    tank: new THREE.MeshStandardMaterial({ color: "#b8cad0", roughness: 0.40, metalness: 0.55 }),
    // ── Ground layer ──
    ground: new THREE.MeshStandardMaterial({ color: "#0c1620", roughness: 1.00 }),
    road_primary: new THREE.MeshStandardMaterial({ color: "#151e28", roughness: 0.92 }),
    road_marking_w: new THREE.MeshStandardMaterial({ color: "#e8e8e0", roughness: 0.78 }),
    road_marking_y: new THREE.MeshStandardMaterial({ color: "#d4a820", roughness: 0.78 }),
    sidewalk: new THREE.MeshStandardMaterial({ color: "#2c3e4e", roughness: 0.94 }),
    curb: new THREE.MeshStandardMaterial({ color: "#404f5a", roughness: 0.90, metalness: 0.05 }),
    crosswalk_w: new THREE.MeshStandardMaterial({ color: "#c8c8be", roughness: 0.80 }),
    highlight: new THREE.MeshStandardMaterial({ color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 2.0, transparent: true, opacity: 0.9 }),
  };
}

let MAT: ReturnType<typeof createMaterials> | null = null;
function useMaterials() {
  if (!MAT) MAT = createMaterials();
  return MAT;
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY CACHE
// ─────────────────────────────────────────────────────────────────────────────
const geoCache = new Map<string, THREE.BoxGeometry>();
function box(w: number, h: number, d: number) {
  const k = `${w.toFixed(2)}_${h.toFixed(2)}_${d.toFixed(2)}`;
  if (!geoCache.has(k)) geoCache.set(k, new THREE.BoxGeometry(w, h, d));
  return geoCache.get(k)!;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOFTOP DETAIL PACK — all equipment placed deterministically per building
// ─────────────────────────────────────────────────────────────────────────────
interface RoofDetailProps {
  px: number; pz: number;
  w: number; d: number;
  topY: number;
  seed: number;
}

function RoofDetails({ px, pz, w, d, topY, seed }: RoofDetailProps) {
  const M = useMaterials();
  const halfW = w / 2;
  const halfD = d / 2;

  // Pack of roof elements based on seed
  const elements = useMemo(() => {
    const items: React.ReactElement[] = [];
    const rng = (offset: number) => {
      const x = Math.sin(seed * 127.1 + offset * 311.7) * 0.5 + 0.5;
      return x;
    };

    const addHVAC = (lx: number, lz: number, idx: number) => {
      const uw = 1.4 + rng(idx) * 0.4;
      const ud = 0.9 + rng(idx + 1) * 0.3;
      const uh = 0.65 + rng(idx + 2) * 0.35;
      items.push(
        <group key={`hvac${idx}`} position={[px + lx, topY + uh / 2, pz + lz]}>
          {/* Main unit body */}
          <mesh castShadow geometry={box(uw, uh, ud)} material={M.hvac} />
          {/* Top grille */}
          <mesh geometry={box(uw * 0.85, 0.04, ud * 0.85)} material={M.hvac_dark}
            position={[0, uh / 2 + 0.02, 0]} />
          {/* Exhaust cylinder */}
          <mesh castShadow position={[uw * 0.28, uh / 2 + 0.25, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.5, 8]} />
            <primitive object={M.hvac_dark} />
          </mesh>
        </group>
      );
    };

    const addSolarPanel = (lx: number, lz: number, idx: number) => {
      const pw = 2.2; const pd = 1.5;
      const tilt = 0.18; // radians
      items.push(
        <group key={`solar${idx}`} position={[px + lx, topY + 0.18, pz + lz]} rotation={[tilt, 0, 0]}>
          {/* Panel glass */}
          <mesh geometry={box(pw, 0.04, pd)} material={M.solar}>
            <primitive object={M.solar} />
          </mesh>
          {/* Frame */}
          <mesh geometry={box(pw + 0.08, 0.04, 0.07)} material={M.solar_frame} position={[0, 0, pd / 2]} />
          <mesh geometry={box(pw + 0.08, 0.04, 0.07)} material={M.solar_frame} position={[0, 0, -pd / 2]} />
          <mesh geometry={box(0.07, 0.04, pd)} material={M.solar_frame} position={[pw / 2, 0, 0]} />
          <mesh geometry={box(0.07, 0.04, pd)} material={M.solar_frame} position={[-pw / 2, 0, 0]} />
          {/* Mount legs */}
          <mesh geometry={box(0.06, 0.28, 0.06)} material={M.solar_frame}
            position={[pw * 0.35, -0.14, pd * 0.35]} />
          <mesh geometry={box(0.06, 0.28, 0.06)} material={M.solar_frame}
            position={[-pw * 0.35, -0.14, pd * 0.35]} />
        </group>
      );
    };

    const addVent = (lx: number, lz: number, idx: number) => {
      const vr = 0.14 + rng(idx) * 0.06;
      const vh = 0.5 + rng(idx + 1) * 0.4;
      items.push(
        <group key={`vent${idx}`} position={[px + lx, topY, pz + lz]}>
          <mesh castShadow position={[0, vh / 2, 0]}>
            <cylinderGeometry args={[vr, vr * 1.1, vh, 10]} />
            <primitive object={M.vent} />
          </mesh>
          {/* Hood cap */}
          <mesh position={[0, vh + 0.12, 0]}>
            <cylinderGeometry args={[vr * 1.5, vr * 0.8, 0.22, 10]} />
            <primitive object={M.hvac_dark} />
          </mesh>
        </group>
      );
    };

    const addUtilityRoom = (lx: number, lz: number, idx: number) => {
      const rw = 2.5 + rng(idx) * 1.5;
      const rd = 1.8 + rng(idx + 1) * 1.0;
      const rh = 1.6 + rng(idx + 2) * 0.8;
      items.push(
        <group key={`util${idx}`} position={[px + lx, topY + rh / 2, pz + lz]}>
          <mesh castShadow receiveShadow geometry={box(rw, rh, rd)} material={M.utility} />
          {/* Door detail */}
          <mesh position={[0, -rh * 0.15, rd / 2 + 0.01]} geometry={box(0.7, rh * 0.7, 0.03)} material={M.hvac_dark} />
        </group>
      );
    };

    const addWaterTank = (lx: number, lz: number, idx: number) => {
      const tr = 0.55 + rng(idx) * 0.25;
      const th = 1.2 + rng(idx + 1) * 0.5;
      items.push(
        <group key={`tank${idx}`} position={[px + lx, topY, pz + lz]}>
          {/* Legs */}
          {[[-tr * 0.6, -tr * 0.6], [tr * 0.6, -tr * 0.6], [-tr * 0.6, tr * 0.6], [tr * 0.6, tr * 0.6]].map((leg, li) => (
            <mesh key={li} position={[leg[0], th * 0.25, leg[1]]}
              geometry={box(0.07, th * 0.5, 0.07)} material={M.hvac_dark} />
          ))}
          {/* Tank body */}
          <mesh castShadow position={[0, th * 0.55 + 0.08, 0]}>
            <cylinderGeometry args={[tr, tr, th * 0.55, 14]} />
            <primitive object={M.tank} />
          </mesh>
          {/* Cap */}
          <mesh position={[0, th * 0.83 + 0.08, 0]}>
            <cylinderGeometry args={[tr * 0.5, tr, 0.18, 14]} />
            <primitive object={M.hvac_dark} />
          </mesh>
        </group>
      );
    };

    // ── Stairwell / access hatch ──
    const addAccess = (lx: number, lz: number, idx: number) => {
      items.push(
        <group key={`access${idx}`} position={[px + lx, topY, pz + lz]}>
          <mesh castShadow position={[0, 0.55, 0]} geometry={box(1.4, 1.1, 1.0)} material={M.utility} />
          {/* Door */}
          <mesh position={[0, 0.15, 0.51]} geometry={box(0.6, 0.8, 0.04)} material={M.hvac_dark} />
          {/* Railings */}
          {[-0.55, 0.55].map((side, si) => (
            <group key={si}>
              <mesh position={[side, 0.4, 1.0]} geometry={box(0.04, 0.8, 0.04)} material={M.vent} />
              <mesh position={[side, 0.4, 1.5]} geometry={box(0.04, 0.8, 0.04)} material={M.vent} />
              <mesh position={[side, 0.8, 1.25]} geometry={box(0.04, 0.04, 0.5)} material={M.vent} />
            </group>
          ))}
        </group>
      );
    };

    // Place elements deterministically based on building size and seed
    const margin = 1.2;
    const usable = { w: w - margin * 2, d: d - margin * 2 };

    // HVAC units — distributed across roof
    const hvacCols = Math.max(1, Math.floor(usable.w / 4.0));
    const hvacRows = Math.max(1, Math.floor(usable.d / 3.5));
    for (let r = 0; r < hvacRows; r++) {
      for (let c = 0; c < hvacCols; c++) {
        const lx = -usable.w / 2 + (c + 0.5) * (usable.w / hvacCols);
        const lz = -usable.d / 2 + (r + 0.5) * (usable.d / hvacRows);
        const variant = (seed + r * 3 + c * 7) % 3;
        if (variant === 0) addHVAC(lx - usable.w * 0.15, lz, r * hvacCols + c);
        else if (variant === 1) addVent(lx, lz, r * hvacCols + c + 100);
        else addHVAC(lx, lz + usable.d * 0.1, r * hvacCols + c + 200);
      }
    }

    // Solar panels on one side
    if (usable.w > 4 && usable.d > 3) {
      const solarCols = Math.min(3, Math.floor(usable.w / 2.8));
      for (let sc = 0; sc < solarCols; sc++) {
        const lx = -usable.w / 2 + (sc + 0.5) * (usable.w / solarCols);
        addSolarPanel(lx, -halfD + 3.0, sc + 50);
      }
    }

    // Utility room / stairwell access
    if (usable.w > 5 && usable.d > 5) {
      addUtilityRoom(halfW - 2.5, -halfD + 2.2, 80);
      addAccess(-halfW + 2.0, halfD - 2.0, 90);
    } else {
      addAccess(0, -halfD + 1.8, 90);
    }

    // Water tanks for larger buildings
    if (usable.w > 7 && usable.d > 7) {
      addWaterTank(halfW - 1.8, halfD - 2.0, 70);
    }

    return items;
  }, [px, pz, w, d, topY, seed, halfW, halfD, M]);

  return <>{elements}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDING — refined architecture with proper façade sections
// ─────────────────────────────────────────────────────────────────────────────
const FACADE_MATS = ["concrete_a", "concrete_b", "concrete_c", "concrete_d", "concrete_e"] as const;
const GLASS_MATS = ["glass_a", "glass_b", "glass_c"] as const;

type FacadeKey = typeof FACADE_MATS[number];
type GlassKey = typeof GLASS_MATS[number];

interface BuildingProps {
  px: number; py: number; pz: number;
  w: number; h: number; d: number;
  facadeKey: FacadeKey;
  glassKey: GlassKey;
  floors: number;
  seed: number;
  selected?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

function Building({ px, py, pz, w, h, d, facadeKey, glassKey, floors, seed, selected, onClick }: BuildingProps) {
  const M = useMaterials();
  const flH = h / Math.max(floors, 1);
  const halfW = w / 2;
  const halfD = d / 2;

  // Glass curtain wall height = bottom 25–35% of building, min 2 floors
  const glassFloors = Math.max(2, Math.floor(floors * 0.32));
  const glassH = glassFloors * flH;

  // Slight footprint chamfer for visual variety (no real geometry change — just corner trim strips)
  const chamfer = Math.min(0.3, w * 0.03);

  // Corner pillar width
  const pillarW = Math.max(0.25, w * 0.04);
  const pillarD = Math.max(0.25, d * 0.04);

  return (
    <group onClick={onClick}>
      {/* ── Main body ── */}
      <mesh
        castShadow receiveShadow
        position={[px, py + h / 2, pz]}
        geometry={box(w, h, d)}
        material={selected ? M.highlight : M[facadeKey]}
      />

      {/* ── Glazed ground band ── */}
      <mesh
        castShadow
        position={[px, py + glassH / 2, pz]}
        geometry={box(w + 0.06, glassH, d + 0.06)}
        material={M[glassKey]}
      />

      {/* ── Mid-height glass accent band (every 3 floors above ground zone) ── */}
      {floors > 5 && (
        <mesh
          position={[px, py + glassH + flH * 1.5, pz]}
          geometry={box(w + 0.05, flH * 0.6, d + 0.05)}
          material={M[glassKey]}
        />
      )}

      {/* ── Corner pilasters (vertical concrete fins) ── */}
      {[
        [halfW + pillarW / 2, halfD + pillarD / 2],
        [-halfW - pillarW / 2, halfD + pillarD / 2],
        [halfW + pillarW / 2, -halfD - pillarD / 2],
        [-halfW - pillarW / 2, -halfD - pillarD / 2],
      ].map(([cx, cz], i) => (
        <mesh key={i} castShadow position={[px + cx, py + h / 2, pz + cz]}
          geometry={box(pillarW, h, pillarD)} material={M.ledge} />
      ))}

      {/* ── Horizontal floor ledges ── */}
      {Array.from({ length: floors - 1 }).map((_, fi) => {
        const fy = py + (fi + 1) * flH;
        return (
          <group key={fi}>
            {/* Main ledge */}
            <mesh castShadow position={[px, fy, pz]} geometry={box(w + 0.22, 0.18, d + 0.22)} material={M.ledge} />
            {/* Ledge top face accent */}
            <mesh position={[px, fy + 0.1, pz]} geometry={box(w + 0.24, 0.04, d + 0.24)} material={M.ledge_top} />
          </group>
        );
      })}

      {/* ── Roof slab ── */}
      <mesh receiveShadow position={[px, py + h + 0.10, pz]}
        geometry={box(w + 0.18, 0.20, d + 0.18)} material={M.roof} />

      {/* ── Roof parapet walls ── */}
      {[
        { pos: [px, py + h + 0.65, pz + halfD + 0.12], geo: box(w + 0.36, 1.1, 0.22) },
        { pos: [px, py + h + 0.65, pz - halfD - 0.12], geo: box(w + 0.36, 1.1, 0.22) },
        { pos: [px + halfW + 0.12, py + h + 0.65, pz], geo: box(0.22, 1.1, d + 0.36) },
        { pos: [px - halfW - 0.12, py + h + 0.65, pz], geo: box(0.22, 1.1, d + 0.36) },
      ].map((p, i) => (
        <mesh key={i} castShadow position={p.pos as [number, number, number]} geometry={p.geo} material={M.parapet} />
      ))}

      {/* ── Parapet top cap (lighter trim) ── */}
      {[
        [px, py + h + 1.22, pz + halfD + 0.12, w + 0.40, 0.12, 0.28],
        [px, py + h + 1.22, pz - halfD - 0.12, w + 0.40, 0.12, 0.28],
        [px + halfW + 0.12, py + h + 1.22, pz, 0.28, 0.12, d + 0.40],
        [px - halfW - 0.12, py + h + 1.22, pz, 0.28, 0.12, d + 0.40],
      ].map(([bx, by, bz, bw, bh, bd], i) => (
        <mesh key={i} position={[bx, by, bz] as [number, number, number]}
          geometry={box(bw, bh, bd)} material={M.ledge} />
      ))}

      {/* ── Rooftop details ── */}
      <RoofDetails px={px} pz={pz} w={w} d={d} topY={py + h + 0.20} seed={seed} />

      {/* ── Selection ring ── */}
      {selected && (
        <mesh position={[px, py + 0.08, pz]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) * 0.65, Math.max(w, d) * 0.72, 40]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2.8} transparent opacity={0.92} />
        </mesh>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK LAYOUT — identical to previous, zero positional changes
// ─────────────────────────────────────────────────────────────────────────────
interface BSpec { px: number; pz: number; w: number; d: number; floors: number; fi: number; gi: number; subId: string; }

function layoutBlock(col: number, row: number, type: string, seed: number): BSpec[] {
  const bx = OX + col * STEP;
  const bz = OZ + row * STEP;
  const cx = bx + BLOCK / 2;
  const cz = bz + BLOCK / 2;
  const B = BLOCK;
  const p = 0.8;
  const fi = (i: number) => (seed + i * 3) % FACADE_MATS.length;
  const gi = (i: number) => (seed + i * 5) % GLASS_MATS.length;
  const fl = (base: number, i: number) => Math.max(4, Math.min(8, base + ((seed + i) % 3)));

  switch (type) {
    case "PERIMETER": {
      const ww = 8.5; const wd = 8.5; const g = 4;
      return [
        { px: cx - g - ww / 2, pz: cz - g - wd / 2, w: ww, d: wd, floors: fl(5, 0), fi: fi(0), gi: gi(0), subId: "NW" },
        { px: cx + g + ww / 2, pz: cz - g - wd / 2, w: ww, d: wd, floors: fl(6, 1), fi: fi(1), gi: gi(1), subId: "NE" },
        { px: cx - g - ww / 2, pz: cz + g + wd / 2, w: ww, d: wd, floors: fl(4, 2), fi: fi(2), gi: gi(2), subId: "SW" },
        { px: cx + g + ww / 2, pz: cz + g + wd / 2, w: ww, d: wd, floors: fl(5, 3), fi: fi(3), gi: gi(3), subId: "SE" },
      ];
    }
    case "U_SHAPE": {
      const aw = 7; const ad = 14; const bkW = B - 2 * p - 2; const bkD = 5.5;
      const aox = B / 2 - p - aw / 2;
      return [
        { px: cx - aox, pz: cz + 1.5, w: aw, d: ad, floors: fl(5, 0), fi: fi(0), gi: gi(0), subId: "L" },
        { px: cx + aox, pz: cz + 1.5, w: aw, d: ad, floors: fl(6, 1), fi: fi(1), gi: gi(1), subId: "R" },
        { px: cx, pz: bz + p + bkD / 2, w: bkW, d: bkD, floors: fl(7, 2), fi: fi(2), gi: gi(2), subId: "B" },
      ];
    }
    case "L_SHAPE": {
      const lw = B - 2 * p; const ld = 6; const sw2 = (B - 2 * p) * 0.52; const sd = B - 2 * p - ld - 1;
      return [
        { px: cx, pz: bz + p + ld / 2, w: lw, d: ld, floors: fl(5, 0), fi: fi(0), gi: gi(0), subId: "H" },
        { px: bx + p + sw2 / 2, pz: bz + p + ld + 0.5 + sd / 2, w: sw2, d: sd, floors: fl(4, 1), fi: fi(1), gi: gi(1), subId: "V" },
      ];
    }
    case "DONUT": {
      const ow = B - 2 * p; const wt = (ow - ow * 0.42) / 2;
      return [
        { px: cx, pz: bz + p + wt / 2, w: ow, d: wt, floors: fl(5, 0), fi: fi(0), gi: gi(0), subId: "N" },
        { px: cx, pz: bz + p + ow - wt / 2, w: ow, d: wt, floors: fl(5, 1), fi: fi(1), gi: gi(1), subId: "S" },
        { px: bx + p + wt / 2, pz: bz + p + ow / 2, w: wt, d: ow - 2 * wt, floors: fl(5, 2), fi: fi(2), gi: gi(2), subId: "W" },
        { px: bx + p + ow - wt / 2, pz: bz + p + ow / 2, w: wt, d: ow - 2 * wt, floors: fl(5, 3), fi: fi(3), gi: gi(3), subId: "E" },
      ];
    }
    case "SPLIT": {
      const hw = (B - 2 * p - 3) / 2; const hd = B - 2 * p;
      return [
        { px: bx + p + hw / 2, pz: cz, w: hw, d: hd, floors: fl(5, 0), fi: fi(0), gi: gi(0), subId: "A" },
        { px: bx + p + hw + 3 + hw / 2, pz: cz, w: hw, d: hd, floors: fl(6, 1), fi: fi(1), gi: gi(1), subId: "B" },
      ];
    }
    case "CORNER_CUT": {
      const fw = B - 2 * p; const fh2 = (B - 2 * p) * 0.46;
      const sw2 = (B - 2 * p) * 0.54; const sh = (B - 2 * p) * 0.44;
      return [
        { px: cx, pz: bz + p + fh2 / 2, w: fw, d: fh2, floors: fl(6, 0), fi: fi(0), gi: gi(0), subId: "H" },
        { px: bx + p + sw2 / 2, pz: cz + fh2 / 2 + 0.5 + sh / 2, w: sw2, d: sh, floors: fl(4, 1), fi: fi(1), gi: gi(1), subId: "V1" },
        { px: bx + p + sw2 + 1.5 + (sw2 * 0.65) / 2, pz: cz + fh2 / 2 + 0.5 + sh / 2, w: sw2 * 0.65, d: sh, floors: fl(5, 2), fi: fi(2), gi: gi(2), subId: "V2" },
      ];
    }
    case "TOWER_BLOCK": {
      const pw = B - 2 * p; const pd = B - 2 * p; const tw = pw * 0.55; const td = pd * 0.55;
      return [
        { px: cx, pz: cz, w: pw, d: pd, floors: 2, fi: fi(0), gi: gi(0), subId: "POD" },
        { px: cx, pz: cz, w: tw, d: td, floors: 8, fi: fi(1), gi: gi(1), subId: "TWR" },
      ];
    }
    default:
      return [{ px: cx, pz: cz, w: B - 2 * p, d: B - 2 * p, floors: 5, fi: fi(0), gi: gi(0), subId: "DEFAULT" }];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK DATA — identical, no layout changes
// ─────────────────────────────────────────────────────────────────────────────
const BLOCK_DATA = [
  { col: 0, row: 0, type: "PERIMETER", id: "b00", nameAr: "مجمع تجاري أ", congestion: 0.40 },
  { col: 1, row: 0, type: "U_SHAPE", id: "b10", nameAr: "برج المكاتب ١", congestion: 0.70 },
  { col: 2, row: 0, type: "DONUT", id: "b20", nameAr: "مركز البلدية", congestion: 0.55 },
  { col: 3, row: 0, type: "L_SHAPE", id: "b30", nameAr: "مجمع التكنولوجيا", congestion: 0.30 },
  { col: 4, row: 0, type: "CORNER_CUT", id: "b40", nameAr: "برج المالية", congestion: 0.60 },
  { col: 0, row: 1, type: "L_SHAPE", id: "b01", nameAr: "مجمع سكني أ", congestion: 0.45 },
  { col: 1, row: 1, type: "CORNER_CUT", id: "b11", nameAr: "مركز الخدمات", congestion: 0.80 },
  { col: 2, row: 1, type: "PERIMETER", id: "b21", nameAr: "مجمع طبي", congestion: 0.50 },
  { col: 3, row: 1, type: "SPLIT", id: "b31", nameAr: "مبنى الإدارة ١", congestion: 0.35 },
  { col: 4, row: 1, type: "U_SHAPE", id: "b41", nameAr: "مجمع تجاري ب", congestion: 0.65 },
  { col: 0, row: 2, type: "DONUT", id: "b02", nameAr: "مركز الثقافة", congestion: 0.40 },
  { col: 1, row: 2, type: "TOWER_BLOCK", id: "b12", nameAr: "برج المكاتب ٢", congestion: 0.55 },
  { col: 2, row: 2, type: "L_SHAPE", id: "b22", nameAr: "مجمع سكني ب", congestion: 0.75 },
  { col: 3, row: 2, type: "PERIMETER", id: "b32", nameAr: "مركز التسوق", congestion: 0.90 },
  { col: 4, row: 2, type: "SPLIT", id: "b42", nameAr: "مبنى الإدارة ٢", congestion: 0.30 },
  { col: 0, row: 3, type: "SPLIT", id: "b03", nameAr: "مجمع مكاتب أ", congestion: 0.60 },
  { col: 1, row: 3, type: "L_SHAPE", id: "b13", nameAr: "المجمع الصناعي", congestion: 0.45 },
  { col: 2, row: 3, type: "CORNER_CUT", id: "b23", nameAr: "مركز الابتكار", congestion: 0.70 },
  { col: 3, row: 3, type: "U_SHAPE", id: "b33", nameAr: "مجمع مكاتب ب", congestion: 0.50 },
  { col: 4, row: 3, type: "DONUT", id: "b43", nameAr: "المجمع المركزي", congestion: 0.65 },
];

// ─────────────────────────────────────────────────────────────────────────────
// IOT SENSORS
// ─────────────────────────────────────────────────────────────────────────────
const IOT_SENSORS = [
  { id: "s1", pos: [-50, 0, -42] as [number, number, number], type: "traffic", nameAr: "مستشعر المرور ١", status: "active" },
  { id: "s2", pos: [7, 0, 0] as [number, number, number], type: "air", nameAr: "مستشعر الهواء ١", status: "active" },
  { id: "s3", pos: [50, 0, -42] as [number, number, number], type: "traffic", nameAr: "مستشعر المرور ٢", status: "warning" },
  { id: "s4", pos: [-50, 0, 35] as [number, number, number], type: "camera", nameAr: "كاميرا ١", status: "active" },
  { id: "s5", pos: [7, 0, 35] as [number, number, number], type: "energy", nameAr: "مستشعر الطاقة ١", status: "active" },
  { id: "s6", pos: [50, 0, 35] as [number, number, number], type: "camera", nameAr: "كاميرا ٢", status: "error" },
];

const SENSOR_COLORS: Record<string, string> = { camera: "#00d4ff", traffic: "#f59e0b", air: "#10b981", energy: "#8b5cf6" };
const STATUS_COLORS: Record<string, string> = { active: "#00e676", warning: "#ffb300", error: "#ff1744" };

// ─────────────────────────────────────────────────────────────────────────────
// ROAD NETWORK — enhanced with lane markings, raised curbs, clearer hierarchy
// ─────────────────────────────────────────────────────────────────────────────
function RoadNetwork({ showHeatmap }: { showHeatmap: boolean }) {
  const M = useMaterials();
  const totalW = COLS * STEP + ROAD;
  const totalD = ROWS * STEP + ROAD;
  const cx = OX + (COLS * STEP) / 2 - ROAD / 2;
  const cz = OZ + (ROWS * STEP) / 2 - ROAD / 2;
  const ext = 3; // road extension beyond outer blocks

  // Lane dash pattern
  const dashLen = 1.8;
  const dashGap = 2.4;
  const dashCycle = dashLen + dashGap;
  const dashW = 0.10;

  return (
    <group>
      {/* ── Subgrade — deepest layer ── */}
      <mesh receiveShadow position={[cx, -0.08, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[totalW + ext * 2 + 4, totalD + ext * 2 + 4]} />
        <primitive object={M.ground} />
      </mesh>

      {/* ── HORIZONTAL PRIMARY ROADS ── */}
      {Array.from({ length: ROWS + 1 }, (_, ri) => {
        const rz = OZ + ri * STEP;
        const roadLen = totalW + ext * 2;

        return (
          <group key={`hr${ri}`}>
            {/* Asphalt surface */}
            <mesh receiveShadow position={[cx, 0.02, rz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[roadLen, ROAD]} />
              <primitive object={M.road_primary} />
            </mesh>

            {/* Raised curb — north side */}
            <mesh receiveShadow castShadow position={[cx, CURB / 2, rz - ROAD / 2 - 0.05]}>
              <boxGeometry args={[roadLen, CURB, 0.12]} />
              <primitive object={M.curb} />
            </mesh>
            {/* Sidewalk — north */}
            <mesh receiveShadow position={[cx, CURB, rz - ROAD / 2 - SIDE / 2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[roadLen, SIDE]} />
              <primitive object={M.sidewalk} />
            </mesh>

            {/* Raised curb — south side */}
            <mesh receiveShadow castShadow position={[cx, CURB / 2, rz + ROAD / 2 + 0.05]}>
              <boxGeometry args={[roadLen, CURB, 0.12]} />
              <primitive object={M.curb} />
            </mesh>
            {/* Sidewalk — south */}
            <mesh receiveShadow position={[cx, CURB, rz + ROAD / 2 + SIDE / 2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[roadLen, SIDE]} />
              <primitive object={M.sidewalk} />
            </mesh>

            {/* Center yellow divider line */}
            <mesh receiveShadow position={[cx, 0.032, rz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[roadLen, 0.12]} />
              <primitive object={M.road_marking_y} />
            </mesh>

            {/* White lane dashes — left lane */}
            {Array.from({ length: Math.floor((roadLen) / dashCycle) }, (_, di) => (
              <mesh key={`dlh${ri}_${di}`} receiveShadow
                position={[OX - ext + di * dashCycle + dashLen / 2, 0.033, rz - ROAD * 0.26]}
                rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[dashLen, dashW]} />
                <primitive object={M.road_marking_w} />
              </mesh>
            ))}
            {/* White lane dashes — right lane */}
            {Array.from({ length: Math.floor((roadLen) / dashCycle) }, (_, di) => (
              <mesh key={`drh${ri}_${di}`} receiveShadow
                position={[OX - ext + di * dashCycle + dashLen / 2, 0.033, rz + ROAD * 0.26]}
                rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[dashLen, dashW]} />
                <primitive object={M.road_marking_w} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* ── VERTICAL PRIMARY ROADS ── */}
      {Array.from({ length: COLS + 1 }, (_, ci) => {
        const rx = OX + ci * STEP;
        const roadLen = totalD + ext * 2;

        return (
          <group key={`vr${ci}`}>
            {/* Asphalt surface */}
            <mesh receiveShadow position={[rx, 0.02, cz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[ROAD, roadLen]} />
              <primitive object={M.road_primary} />
            </mesh>

            {/* Raised curb — west side */}
            <mesh receiveShadow castShadow position={[rx - ROAD / 2 - 0.05, CURB / 2, cz]}>
              <boxGeometry args={[0.12, CURB, roadLen]} />
              <primitive object={M.curb} />
            </mesh>
            {/* Sidewalk — west */}
            <mesh receiveShadow position={[rx - ROAD / 2 - SIDE / 2, CURB, cz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[SIDE, roadLen]} />
              <primitive object={M.sidewalk} />
            </mesh>

            {/* Raised curb — east side */}
            <mesh receiveShadow castShadow position={[rx + ROAD / 2 + 0.05, CURB / 2, cz]}>
              <boxGeometry args={[0.12, CURB, roadLen]} />
              <primitive object={M.curb} />
            </mesh>
            {/* Sidewalk — east */}
            <mesh receiveShadow position={[rx + ROAD / 2 + SIDE / 2, CURB, cz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[SIDE, roadLen]} />
              <primitive object={M.sidewalk} />
            </mesh>

            {/* Center yellow divider */}
            <mesh receiveShadow position={[rx, 0.032, cz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.12, roadLen]} />
              <primitive object={M.road_marking_y} />
            </mesh>

            {/* White dashes — left lane */}
            {Array.from({ length: Math.floor((roadLen) / dashCycle) }, (_, di) => (
              <mesh key={`dlv${ci}_${di}`} receiveShadow
                position={[rx - ROAD * 0.26, 0.033, OZ - ext + di * dashCycle + dashLen / 2]}
                rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[dashW, dashLen]} />
                <primitive object={M.road_marking_w} />
              </mesh>
            ))}
            {/* White dashes — right lane */}
            {Array.from({ length: Math.floor((roadLen) / dashCycle) }, (_, di) => (
              <mesh key={`drv${ci}_${di}`} receiveShadow
                position={[rx + ROAD * 0.26, 0.033, OZ - ext + di * dashCycle + dashLen / 2]}
                rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[dashW, dashLen]} />
                <primitive object={M.road_marking_w} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* ── INTERSECTIONS & CROSSWALKS ── */}
      {Array.from({ length: ROWS + 1 }, (_, ri) =>
        Array.from({ length: COLS + 1 }, (_, ci) => {
          const ix = OX + ci * STEP;
          const iz = OZ + ri * STEP;
          const stripes = 6;
          const stripeW = 0.55;
          const stripeGap = 0.38;
          const cwLen = ROAD * 0.84;

          return (
            <group key={`ix${ci}${ri}`}>
              {/* Intersection surface */}
              <mesh receiveShadow position={[ix, 0.025, iz]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[ROAD, ROAD]} />
                <primitive object={M.road_primary} />
              </mesh>

              {/* N-S crosswalk stripes (on west side of intersection) */}
              {Array.from({ length: stripes }, (_, si) => (
                <mesh key={`ns${si}`} receiveShadow
                  position={[ix - ROAD / 2 - 0.4 + si * (stripeW + stripeGap), 0.034, iz]}
                  rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[stripeW, cwLen]} />
                  <primitive object={M.crosswalk_w} />
                </mesh>
              ))}

              {/* E-W crosswalk stripes (on south side of intersection) */}
              {Array.from({ length: stripes }, (_, si) => (
                <mesh key={`ew${si}`} receiveShadow
                  position={[ix, 0.034, iz - ROAD / 2 - 0.4 + si * (stripeW + stripeGap)]}
                  rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[cwLen, stripeW]} />
                  <primitive object={M.crosswalk_w} />
                </mesh>
              ))}

              {/* Stop line — horizontal road north approach */}
              <mesh receiveShadow position={[ix - ROAD * 0.3, 0.034, iz - ROAD / 2 - 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[ROAD * 0.45, 0.15]} />
                <primitive object={M.road_marking_w} />
              </mesh>
              {/* Stop line — vertical road west approach */}
              <mesh receiveShadow position={[ix - ROAD / 2 - 0.1, 0.034, iz - ROAD * 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.15, ROAD * 0.45]} />
                <primitive object={M.road_marking_w} />
              </mesh>

              {/* Intersection corner curb patches */}
              {[
                [ix - ROAD / 2, CURB / 2, iz - ROAD / 2],
                [ix + ROAD / 2, CURB / 2, iz - ROAD / 2],
                [ix - ROAD / 2, CURB / 2, iz + ROAD / 2],
                [ix + ROAD / 2, CURB / 2, iz + ROAD / 2],
              ].map((pos, pi) => (
                <mesh key={pi} position={pos as [number, number, number]}>
                  <boxGeometry args={[SIDE, CURB, SIDE]} />
                  <primitive object={M.curb} />
                </mesh>
              ))}
            </group>
          );
        })
      )}

      {/* ── HEATMAP OVERLAY ── */}
      {showHeatmap && BLOCK_DATA.map(block => {
        const bx = OX + block.col * STEP;
        const bz = OZ + block.row * STEP;
        const c = block.congestion > 0.7 ? "#ef4444" : block.congestion > 0.45 ? "#f59e0b" : "#22c55e";
        return (
          <mesh key={block.id} position={[bx + BLOCK / 2, 0.06, bz + BLOCK / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[BLOCK - 0.6, BLOCK - 0.6]} />
            <meshStandardMaterial color={c} transparent opacity={0.26} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CITY BLOCK — unchanged district/positions, passes seed to Building
// ─────────────────────────────────────────────────────────────────────────────
function CityBlock({
  block,
  selectedObjectId,
  selectedObjectType,
  selectObject,
  drawingMode,
}: {
  block: typeof BLOCK_DATA[0];
  selectedObjectId: string | null;
  selectedObjectType: string | null;
  selectObject: (id: string, type: string) => void;
  drawingMode: DrawingMode;
}) {
  const blockSeed = block.col * 7 + block.row * 13;
  const specs = useMemo(() => layoutBlock(block.col, block.row, block.type, blockSeed), [block, blockSeed]);
  const FLOOR_H = 3.4;

  return (
    <group>
      {specs.map((spec) => {
        const bid = `${block.id}-${spec.subId}`;
        const isSelected = selectedObjectId === bid && selectedObjectType === "building";
        const h = spec.floors * FLOOR_H;
        const baseY = spec.subId === "TWR" ? 2 * FLOOR_H : 0;
        const bseed = blockSeed + spec.fi * 17 + spec.gi * 31;

        return (
          <Building
            key={bid}
            px={spec.px} py={baseY} pz={spec.pz}
            w={spec.w} h={h} d={spec.d}
            facadeKey={FACADE_MATS[spec.fi]}
            glassKey={GLASS_MATS[spec.gi]}
            floors={spec.floors}
            seed={bseed}
            selected={isSelected}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              if (drawingMode === "none") {
                e.stopPropagation();
                selectObject(bid, "building");
              }
            }}
          />
        );
      })}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IOT SENSOR NODE — unchanged visuals, same positions
// ─────────────────────────────────────────────────────────────────────────────
function SensorNode({
  sensor,
  selected,
  onClick,
}: {
  sensor: typeof IOT_SENSORS[0];
  selected: boolean;
  onClick: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) ringRef.current.rotation.y = state.clock.elapsedTime * 1.6;
    if (pulseRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2.8) * 0.22;
      pulseRef.current.scale.set(s, s, s);
    }
  });

  const sColor = SENSOR_COLORS[sensor.type] ?? "#ffffff";
  const stColor = STATUS_COLORS[sensor.status] ?? "#ffffff";

  return (
    <group position={sensor.pos}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}>
      <mesh castShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 3.2, 8]} />
        <meshStandardMaterial color="#1a2d3e" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 3.3, 0]}>
        <cylinderGeometry args={[0.22, 0.16, 0.2, 12]} />
        <meshStandardMaterial color={sColor} emissive={sColor} emissiveIntensity={0.7} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 3.52, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color={stColor} emissive={stColor} emissiveIntensity={selected ? 5 : 2.5} />
      </mesh>
      <mesh ref={ringRef} position={[0, 3.3, 0]}>
        <torusGeometry args={[0.38, 0.025, 8, 28]} />
        <meshStandardMaterial color={sColor} emissive={sColor} emissiveIntensity={1.5} transparent opacity={0.85} />
      </mesh>
      <mesh ref={pulseRef} position={[0, 3.52, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={stColor} emissive={stColor} emissiveIntensity={0.8} transparent opacity={0.28} />
      </mesh>
      {selected && (
        <mesh position={[0, 8.6, 0]}>
          <cylinderGeometry args={[0.01, 0.32, 10, 12, 1, true]} />
          <meshStandardMaterial color={sColor} emissive={sColor} emissiveIntensity={1.2} transparent opacity={0.16} side={THREE.DoubleSide} />
        </mesh>
      )}
      {selected && (
        <Html position={[0, 5.2, 0]} center distanceFactor={14}>
          <div style={{
            background: "rgba(4,12,24,0.94)", border: `1px solid ${sColor}55`, borderRadius: 8,
            padding: "8px 12px", color: "#e2e8f0", fontSize: 11, whiteSpace: "nowrap", boxShadow: `0 0 18px ${sColor}35`
          }} dir="rtl">
            <div style={{ fontWeight: 700, color: sColor, marginBottom: 3 }}>{sensor.nameAr}</div>
            <div style={{ color: "#94a3b8" }}>
              الحالة:{" "}
              <span style={{ color: stColor, fontWeight: 600 }}>
                {sensor.status === "active" ? "نشط" : sensor.status === "warning" ? "تحذير" : "خطأ"}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAWING PREVIEW — unchanged
// ─────────────────────────────────────────────────────────────────────────────
function DrawingPreview({ points }: { points: [number, number, number][] }) {
  if (points.length < 2) return null;
  return (
    <>
      {points.slice(0, -1).map((_, i) => {
        const a = new THREE.Vector3(...points[i]);
        const b = new THREE.Vector3(...points[i + 1]);
        const dir = new THREE.Vector3().subVectors(b, a);
        const len = dir.length();
        const ctr = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        const ang = Math.atan2(dir.x, dir.z);
        return (
          <mesh key={i} position={[ctr.x, 0.05, ctr.z]} rotation={[0, ang, 0]}>
            <boxGeometry args={[ROAD, 0.06, len]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1.2} transparent opacity={0.55} />
          </mesh>
        );
      })}
      {points.map((pt, i) => (
        <mesh key={`pt${i}`} position={[pt[0], 0.3, pt[2]]}>
          <sphereGeometry args={[0.3, 14, 14]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2.5} />
        </mesh>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA LIMITS
// ─────────────────────────────────────────────────────────────────────────────
function CameraSetup() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.y = Math.max(10, Math.min(160, camera.position.y));
  });
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE — improved lighting rig for better building/road contrast
// ─────────────────────────────────────────────────────────────────────────────
function Scene() {
  const {
    layers, drawingMode, drawingPoints, addDrawingPoint,
    selectedObjectId, selectedObjectType, selectObject, clearSelection,
  } = useMapStore();

  const showInfra = layers.infrastructure ?? true;
  const showHeatmap = layers.heatmap ?? false;
  const showSensors = layers.traffic ?? true;

  const handleGround = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (drawingMode !== "none") {
      e.stopPropagation();
      addDrawingPoint([parseFloat(e.point.x.toFixed(2)), 0, parseFloat(e.point.z.toFixed(2))]);
    }
  }, [drawingMode, addDrawingPoint]);

  return (
    <>
      <CameraSetup />

      {/* ── Multi-directional architectural lighting rig ── */}
      {/* Key light — sun from north-west, 65° elevation */}
      <directionalLight
        position={[75, 95, 55]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={400}
        shadow-camera-left={-140}
        shadow-camera-right={140}
        shadow-camera-top={140}
        shadow-camera-bottom={-140}
        shadow-bias={-0.0003}
        color="#e8f0f8"
      />
      {/* Fill light — soft diffuse from south-east */}
      <directionalLight position={[-55, 55, -45]} intensity={0.55} color="#c8d8ec" />
      {/* Rim light — from rear, defines building silhouettes */}
      <directionalLight position={[0, 40, -80]} intensity={0.30} color="#b8cce0" />
      {/* Ambient sky dome */}
      <ambientLight intensity={0.42} color="#c0d2e4" />
      {/* Hemisphere — sky/ground balance */}
      <hemisphereLight args={["#b8d0e8", "#141e28", 0.38]} />

      <Environment preset="city" />

      {/* Ground click for drawing mode */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} onClick={handleGround} visible={false}>
        <planeGeometry args={[600, 600]} />
        <meshBasicMaterial />
      </mesh>

      <RoadNetwork showHeatmap={showHeatmap} />

      {showInfra && BLOCK_DATA.map(block => (
        <CityBlock
          key={block.id}
          block={block}
          selectedObjectId={selectedObjectId}
          selectedObjectType={selectedObjectType}
          selectObject={selectObject}
          drawingMode={drawingMode}
        />
      ))}

      {showSensors && IOT_SENSORS.map(sensor => (
        <SensorNode
          key={sensor.id}
          sensor={sensor}
          selected={selectedObjectId === sensor.id && selectedObjectType === "sensor"}
          onClick={() => { if (drawingMode === "none") selectObject(sensor.id, "sensor"); }}
        />
      ))}

      <DrawingPreview points={drawingPoints} />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minPolarAngle={0.10}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={14}
        maxDistance={150}
        target={[0, 0, 0]}
        onClick={() => { if (drawingMode === "none") clearSelection(); }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERLAYS — unchanged UI, same structure
// ─────────────────────────────────────────────────────────────────────────────
function DrawingToolbar() {
  const { drawingMode, setDrawingMode, drawingPoints, clearDrawing, proposedStreet } = useMapStore();
  const tools: { mode: DrawingMode; labelAr: string; icon: string; color: string }[] = [
    { mode: "add_street", labelAr: "إضافة شارع", icon: "➕", color: "#00AEEF" },
    { mode: "modify_street", labelAr: "تعديل شارع", icon: "✏️", color: "#F59E0B" },
    { mode: "add_roundabout", labelAr: "إضافة دوار", icon: "🔄", color: "#8B5CF6" },
    { mode: "remove_traffic_light", labelAr: "إزالة إشارة", icon: "🚦", color: "#EF4444" },
  ];
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10" dir="rtl">
      {tools.map(t => (
        <button key={t.mode}
          onClick={() => setDrawingMode(drawingMode === t.mode ? "none" : t.mode)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold shadow-lg transition-all border backdrop-blur-sm"
          style={{
            backgroundColor: drawingMode === t.mode ? t.color : "rgba(4,12,24,0.88)",
            borderColor: drawingMode === t.mode ? t.color : "rgba(0,212,255,0.22)",
            color: drawingMode === t.mode ? "#fff" : "#94a3b8",
          }}>
          <span>{t.icon}</span><span>{t.labelAr}</span>
        </button>
      ))}
      {drawingPoints.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          <div className="text-[10px] text-[#00d4ff] text-center font-semibold">{drawingPoints.length} نقطة</div>
          <button onClick={clearDrawing} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-900/80 border border-red-700/60 text-red-300">مسح الرسم</button>
        </div>
      )}
      {proposedStreet && <div className="mt-1 px-3 py-2 rounded-lg bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs text-center">شارع محفوظ ✓</div>}
    </div>
  );
}

function LayerControls() {
  const { layers, toggleLayer } = useMapStore();
  const layerList = [
    { key: "traffic", labelAr: "المرور", color: "#F59E0B" },
    { key: "infrastructure", labelAr: "البنية التحتية", color: "#00d4ff" },
    { key: "heatmap", labelAr: "خريطة الحرارة", color: "#EF4444" },
    { key: "lighting", labelAr: "الإضاءة", color: "#FCD34D" },
    { key: "pedestrian", labelAr: "المشاة", color: "#10B981" },
  ];
  return (
    <div className="absolute bottom-4 right-4 rounded-xl p-3 z-10 min-w-[160px]"
      style={{ background: "rgba(4,12,24,0.90)", border: "1px solid rgba(0,212,255,0.20)" }} dir="rtl">
      <div className="text-[10px] text-[#00d4ff] font-bold mb-2.5 uppercase tracking-widest">الطبقات</div>
      {layerList.map(l => (
        <button key={l.key} onClick={() => toggleLayer(l.key)}
          className="flex items-center gap-2 w-full py-1.5 text-xs transition-all hover:opacity-80">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all"
            style={{ backgroundColor: layers[l.key] ? l.color : "transparent", border: `1.5px solid ${l.color}`, boxShadow: layers[l.key] ? `0 0 6px ${l.color}80` : "none" }} />
          <span style={{ color: layers[l.key] ? "#e2e8f0" : "#4a5568" }}>{l.labelAr}</span>
        </button>
      ))}
    </div>
  );
}

function SelectionPanel() {
  const { selectedObjectId, selectedObjectType, clearSelection } = useMapStore();
  if (!selectedObjectId) return null;
  const sensor = IOT_SENSORS.find(s => s.id === selectedObjectId);
  const block = BLOCK_DATA.find(b => selectedObjectId.startsWith(b.id));
  return (
    <div className="absolute bottom-4 left-4 rounded-xl p-4 z-10 w-64 shadow-2xl"
      style={{ background: "rgba(4,12,24,0.93)", border: "1px solid rgba(0,212,255,0.28)", boxShadow: "0 0 24px rgba(0,212,255,0.12)" }} dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00d4ff" }}>
          {selectedObjectType === "sensor" ? "مستشعر ذكي" : "مبنى / مجمع"}
        </span>
        <button onClick={clearSelection} className="text-gray-500 hover:text-gray-300 text-sm">✕</button>
      </div>
      {sensor && (
        <div className="space-y-2">
          <div className="text-white font-bold text-sm">{sensor.nameAr}</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="text-slate-400 mb-0.5">النوع</div>
              <div className="text-white font-semibold">
                {sensor.type === "camera" ? "كاميرا" : sensor.type === "traffic" ? "مرور" : sensor.type === "energy" ? "طاقة" : "هواء"}
              </div>
            </div>
            <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="text-slate-400 mb-0.5">الحالة</div>
              <div className="font-semibold" style={{ color: STATUS_COLORS[sensor.status] }}>
                {sensor.status === "active" ? "نشط" : sensor.status === "warning" ? "تحذير" : "خطأ"}
              </div>
            </div>
          </div>
        </div>
      )}
      {!sensor && block && (
        <div className="space-y-2">
          <div className="text-white font-bold text-sm">{block.nameAr}</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="text-slate-400 mb-0.5">الازدحام</div>
              <div className="font-semibold" style={{ color: block.congestion > 0.7 ? "#EF4444" : block.congestion > 0.45 ? "#F59E0B" : "#22C55E" }}>
                {Math.round(block.congestion * 100)}%
              </div>
            </div>
            <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="text-slate-400 mb-0.5">النوع</div>
              <div className="text-white font-semibold">{block.type.replace("_", " ")}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — refined camera angle for optimal road + building visibility
// ─────────────────────────────────────────────────────────────────────────────
export default function CityMap3D({ height = "100%" }: { height?: string }) {
  const [err, setErr] = useState(false);

  if (err) {
    return (
      <div className="w-full flex items-center justify-center text-gray-500"
        style={{ height, background: "#04080e" }}>
        <div className="text-center" dir="rtl">
          <div className="text-4xl mb-3">🏙️</div>
          <div className="text-sm">تعذّر تحميل التوأم الرقمي</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ height, background: "#04080e" }}>
      <Canvas
        shadows
        // Balanced 45° oblique view — shows roads & rooftops equally
        camera={{ position: [-20, 72, 100], fov: 38, near: 0.5, far: 600 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        onError={() => setErr(true)}
      >
        <Suspense fallback={
          <Html center>
            <div style={{ color: "#64748b", fontSize: 13 }} dir="rtl">
              جارٍ بناء المدينة الرقمية...
            </div>
          </Html>
        }>
          <Scene />
        </Suspense>
      </Canvas>

      <DrawingToolbar />
      <LayerControls />
      <SelectionPanel />

      {/* Compass rose */}
      <div className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
        style={{ background: "rgba(4,12,24,0.90)", border: "1px solid rgba(0,212,255,0.30)" }}>
        <span className="text-[11px] font-bold" style={{ color: "#00d4ff" }}>N</span>
      </div>

      {/* Scale bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
        <div className="flex">
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 20, height: 4, background: i % 2 === 0 ? "#94a3b8" : "#1c2a38",
              borderRadius: i === 0 ? "2px 0 0 2px" : i === 3 ? "0 2px 2px 0" : undefined
            }} />
          ))}
        </div>
        <span className="text-[9px]" style={{ color: "#4b5563" }}>200م</span>
      </div>

      {/* Live badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full z-10"
        style={{ background: "rgba(4,12,24,0.90)", border: "1px solid rgba(0,212,255,0.22)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-semibold" style={{ color: "#94a3b8" }}>Digital Twin • Live</span>
      </div>
    </div>
  );
}
