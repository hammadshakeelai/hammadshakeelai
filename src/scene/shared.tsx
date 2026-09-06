import { useEffect, useRef, useState, type RefObject } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

export type SceneQuality = "auto" | "high" | "low";

/** A hidden tab or an offscreen exhibit should not spend GPU time. */
export function useSceneActivity<T extends HTMLElement>(): [
  RefObject<T | null>,
  boolean,
] {
  const element = useRef<T>(null);
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    if (element.current) observer.observe(element.current);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, []);
  return [element, inView && visible];
}

/** Original studio illumination; no external environment-map requests. */
export function StudioLights({ low = false }: { low?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 6]} intensity={3.2} color="#e9e5ff" />
      <directionalLight position={[-6, 2, -4]} intensity={2} color="#8570ed" />
      <Environment resolution={low ? 64 : 128} frames={1}>
        <Lightformer
          form="rect"
          intensity={5}
          color="#efebff"
          position={[0, 5, -5]}
          scale={[9, 2, 1]}
          rotation={[Math.PI / 4, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color="#b9a4ff"
          position={[-5, 0, 1]}
          scale={[2, 8, 1]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Lightformer
          form="rect"
          intensity={4}
          color="#ffffff"
          position={[6, 0, 3]}
          scale={[3, 8, 1]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <Lightformer
          form="ring"
          intensity={3}
          color="#77ddf4"
          position={[0, -4, -3]}
          scale={5}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Environment>
    </>
  );
}

/** Lower resolution after sustained slow rendering. Never oscillates between modes. */
export function AdaptiveResolution({
  quality,
  active,
}: {
  quality: SceneQuality;
  active: boolean;
}) {
  const setDpr = useThree((state) => state.setDpr);
  const samples = useRef({ seconds: 0, frames: 0, lowered: false });
  useEffect(() => {
    samples.current = { seconds: 0, frames: 0, lowered: false };
    setDpr(
      quality === "low"
        ? 1
        : Math.min(window.devicePixelRatio, quality === "high" ? 2 : 1.5),
    );
  }, [quality, setDpr]);
  useFrame((_, delta) => {
    if (quality !== "auto" || !active || samples.current.lowered || delta > 0.2)
      return;
    samples.current.seconds += delta;
    samples.current.frames += 1;
    if (samples.current.seconds > 5) {
      if (samples.current.frames / samples.current.seconds < 38) {
        setDpr(1);
        samples.current.lowered = true;
      }
      samples.current.seconds = 0;
      samples.current.frames = 0;
    }
  });
  return null;
}
