import { corpus, searchGuide } from "../../worker/search";
import type { GuideMessage, GuideResponse } from "../../worker/search";

export type {
  GuideMessage,
  GuideResponse,
  GuideSource,
} from "../../worker/search";

export function searchLocalGuide(
  question: string,
  projectId?: string,
): GuideResponse {
  return searchGuide(question, projectId);
}

function validateRemote(value: unknown): GuideResponse | null {
  if (!value || typeof value !== "object") return null;
  const { answer, sources, mode } = value as Record<string, unknown>;
  if (
    typeof answer !== "string" ||
    answer.length > 2200 ||
    (mode !== "ai" && mode !== "search") ||
    !Array.isArray(sources) ||
    sources.length > 4
  )
    return null;
  const validSources = new Map(
    corpus.map(({ id, title, url }) => [id, { id, title, url }]),
  );
  const verified = sources.map((source: unknown) => {
    if (!source || typeof source !== "object") return null;
    const { id, url } = source as Record<string, unknown>;
    const known = typeof id === "string" ? validSources.get(id) : undefined;
    return known && known.url === url ? known : null;
  });
  if (verified.some((source) => source === null)) return null;
  return { answer, sources: verified as GuideResponse["sources"], mode };
}

/** No credentials are ever sent from the portfolio. VITE_GUIDE_URL is public. */
export async function askGuide(
  question: string,
  history: GuideMessage[] = [],
  projectId?: string,
): Promise<GuideResponse> {
  const fallback = () => searchLocalGuide(question, projectId);
  const endpoint = import.meta.env.VITE_GUIDE_URL?.trim();
  if (!endpoint || !question.trim()) return fallback();
  let url: URL;
  try {
    url = new URL(endpoint);
    if (
      url.protocol !== "https:" &&
      !(
        import.meta.env.DEV && ["localhost", "127.0.0.1"].includes(url.hostname)
      )
    )
      return fallback();
    if (url.pathname === "/") url.pathname = "/api/guide";
  } catch {
    return fallback();
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 22_000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      signal: controller.signal,
      body: JSON.stringify({
        question: question.slice(0, 1000),
        history: history
          .slice(-6)
          .map(({ role, content }) => ({
            role,
            content: content.slice(0, 600),
          })),
        ...(projectId ? { projectId } : {}),
      }),
    });
    if (!response.ok && response.status !== 429) return fallback();
    return validateRemote(await response.json()) ?? fallback();
  } catch {
    return fallback();
  } finally {
    clearTimeout(timeout);
  }
}
