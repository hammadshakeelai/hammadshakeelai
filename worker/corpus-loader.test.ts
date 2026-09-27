import { afterEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { corpus } from "./search";
import {
  CORPUS_TIMEOUT_MS,
  CORPUS_TTL_MS,
  CORPUS_URL,
  MAX_CORPUS_BYTES,
  createCorpusLoader,
  validateCorpus,
} from "./corpus-loader";

afterEach(() => vi.useRealTimers());

describe("published guide corpus", () => {
  it("publishes matching bundled and static documents, including all walkthroughs", async () => {
    const published = JSON.parse(await readFile(new URL("../public/guide-corpus.json", import.meta.url), "utf8"));
    expect(published).toEqual(corpus);
    expect(validateCorpus(published)).toEqual(corpus);
    expect(corpus.filter(({ id }) => id.startsWith("article-"))).toHaveLength(3);
  });

  it("rejects unowned URLs, duplicate IDs, invalid fields, and oversized evidence", () => {
    expect(validateCorpus([{ ...corpus[0], url: "https://evil.example/evidence" }])).toBeNull();
    expect(validateCorpus([{ ...corpus[0], url: "https://github.com/another-owner/repository" }])).toBeNull();
    expect(validateCorpus([{ ...corpus[0], url: "https://hammadshakeelai.github.io.evil.example/hammadshakeelai/#/project/demo" }])).toBeNull();
    expect(validateCorpus([corpus[0], corpus[0]])).toBeNull();
    expect(validateCorpus([{ ...corpus[0], tags: [42] }])).toBeNull();
    expect(validateCorpus([{ ...corpus[0], text: "x".repeat(10_001) }])).toBeNull();
    expect(validateCorpus([])).toBeNull();
  });

  it("uses one fixed source, shares concurrent requests, and caches verified updates", async () => {
    let time = 1;
    const updated = [{ ...corpus[0], text: "A newly published source note." }];
    const fetcher = vi.fn(async () => Response.json(updated));
    const load = createCorpusLoader(fetcher, () => time);
    const [first, second] = await Promise.all([load(), load()]);
    expect(first).toEqual(updated);
    expect(second).toEqual(updated);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(CORPUS_URL, expect.objectContaining({ redirect: "error" }));
    time += CORPUS_TTL_MS - 1;
    await load();
    expect(fetcher).toHaveBeenCalledTimes(1);
    time += 2;
    await load();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("keeps the last good content when a refreshed source fails validation", async () => {
    let time = 1;
    const updated = [{ ...corpus[0], text: "The last valid publication." }];
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json(updated)).mockResolvedValueOnce(Response.json([{ ...corpus[0], url: "https://evil.example" }]));
    const load = createCorpusLoader(fetcher, () => time);
    expect(await load()).toEqual(updated);
    time += CORPUS_TTL_MS + 1;
    expect(await load()).toEqual(updated);
    await load();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("falls back to bundled evidence on network errors and oversized streamed bodies", async () => {
    expect(await createCorpusLoader(vi.fn(async () => { throw new Error("offline"); }))()).toEqual(corpus);
    const response = new Response("x".repeat(MAX_CORPUS_BYTES + 1), { headers: { "Content-Type": "application/json" } });
    expect(await createCorpusLoader(vi.fn(async () => response))()).toEqual(corpus);
  });

  it("bounds a sleeping content server without blocking the guide", async () => {
    vi.useFakeTimers();
    let aborted = false;
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      init?.signal?.addEventListener("abort", () => { aborted = true; });
      return new Promise<Response>(() => {});
    });
    const result = createCorpusLoader(fetcher)();
    await vi.advanceTimersByTimeAsync(CORPUS_TIMEOUT_MS);
    expect(await result).toEqual(corpus);
    expect(aborted).toBe(true);
  });
});
