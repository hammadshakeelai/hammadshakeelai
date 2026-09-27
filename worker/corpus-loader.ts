import { corpus, type GuideDocument } from "./search";

// This is deliberately not configurable by a request or by model output.
export const CORPUS_URL =
  "https://hammadshakeelai.github.io/hammadshakeelai/guide-corpus.json";
export const CORPUS_TTL_MS = 15 * 60_000;
export const CORPUS_RETRY_MS = 60_000;
export const CORPUS_TIMEOUT_MS = 2_500;
export const MAX_CORPUS_BYTES = 512 * 1024;

function ownedSource(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.search)
      return false;
    if (url.hostname === "github.com")
      return /^\/hammadshakeelai(?:\/[a-z0-9._-]+)?\/?$/i.test(url.pathname) && !url.hash;
    return url.hostname === "hammadshakeelai.github.io" &&
      url.pathname === "/hammadshakeelai/" &&
      /^#\/(?:writing|project)\/[a-z0-9._-]+$/i.test(url.hash);
  } catch {
    return false;
  }
}

/** Validate the whole document, rather than silently trusting a partial update. */
export function validateCorpus(value: unknown): GuideDocument[] | null {
  if (!Array.isArray(value) || !value.length || value.length > 500) return null;
  const result: GuideDocument[] = [];
  const ids = new Set<string>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const { id, title, url, text, tags, projectId } = entry as Record<string, unknown>;
    if (typeof id !== "string" || !/^[a-z0-9._-]{1,160}$/i.test(id) || ids.has(id) ||
      typeof title !== "string" || !title.trim() || title.length > 200 ||
      typeof url !== "string" || !ownedSource(url) ||
      typeof text !== "string" || !text.trim() || text.length > 10_000 ||
      !Array.isArray(tags) || tags.length > 24 ||
      tags.some((tag) => typeof tag !== "string" || tag.length > 160) ||
      (projectId !== undefined && (typeof projectId !== "string" || !/^[a-z0-9._-]{1,160}$/i.test(projectId))))
      return null;
    ids.add(id);
    result.push({ id, title, url, text, tags: tags as string[], ...(typeof projectId === "string" ? { projectId } : {}) });
  }
  return result;
}

async function readBoundedJSON(response: Response): Promise<unknown> {
  if (!response.ok || !response.headers.get("Content-Type")?.toLowerCase().includes("application/json") ||
    Number(response.headers.get("Content-Length")) > MAX_CORPUS_BYTES || !response.body)
    throw new Error("Corpus unavailable");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_CORPUS_BYTES) {
        await reader.cancel();
        throw new Error("Corpus too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

/** One bounded request per isolate/TTL; failures preserve the last good copy. */
export function createCorpusLoader(
  fetcher: typeof fetch = fetch,
  now: () => number = Date.now,
) {
  let current = corpus;
  let expires = 0;
  let pending: Promise<GuideDocument[]> | undefined;
  return function load(): Promise<GuideDocument[]> {
    if (now() < expires) return Promise.resolve(current);
    if (pending) return pending;
    pending = (async () => {
      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const update = async () => {
          const response = await fetcher(CORPUS_URL, {
            headers: { Accept: "application/json" },
            redirect: "error",
            signal: controller.signal,
          });
          return validateCorpus(await readBoundedJSON(response));
        };
        const validated = await Promise.race([
          update(),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
              controller.abort();
              reject(new Error("Corpus timeout"));
            }, CORPUS_TIMEOUT_MS);
          }),
        ]);
        if (!validated) throw new Error("Invalid corpus");
        current = validated;
        expires = now() + CORPUS_TTL_MS;
      } catch {
        expires = now() + CORPUS_RETRY_MS;
      } finally {
        if (timer) clearTimeout(timer);
        pending = undefined;
      }
      return current;
    })();
    return pending;
  };
}

export const loadPublishedCorpus = createCorpusLoader();
