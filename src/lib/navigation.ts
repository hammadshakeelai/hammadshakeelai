import { useEffect, useState } from "react";
export function navigate(path: string) {
  window.location.hash = path;
}
export function useRoute() {
  const [path, setPath] = useState(() => location.hash.slice(1) || "/");
  useEffect(() => {
    const change = () => {
      setPath(location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  return path;
}
export function asset(path: string) {
  if (/^(https?:|data:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
