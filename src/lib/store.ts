import { create } from "zustand";
import { persist } from "zustand/middleware";
export type Quality = "auto" | "high" | "low";
type Settings = {
  quality: Quality;
  motion: "system" | "reduced" | "full";
  sound: boolean;
  setQuality: (q: Quality) => void;
  setMotion: (m: Settings["motion"]) => void;
  toggleSound: () => void;
};
export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      quality: "auto",
      motion: "system",
      sound: false,
      setQuality: (quality) => set({ quality }),
      setMotion: (motion) => set({ motion }),
      toggleSound: () => set((s) => ({ sound: !s.sound })),
    }),
    {
      name: "hammads-lab-settings",
      partialize: (s) => ({ quality: s.quality, motion: s.motion }),
    },
  ),
);
type Demo = {
  activeId: string | null;
  activate: (id: string) => void;
  stop: () => void;
};
export const useDemo = create<Demo>((set) => ({
  activeId: null,
  activate: (activeId) => set({ activeId }),
  stop: () => set({ activeId: null }),
}));
let audioContext: AudioContext | undefined;
export function playTone(frequency = 440) {
  if (!useSettings.getState().sound) return;
  try {
    audioContext ??= new AudioContext();
    void audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.18,
    );
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch {
    /* audio is optional */
  }
}
