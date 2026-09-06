import corpusData from "./corpus.json";

export interface GuideSource {
  id: string;
  title: string;
  url: string;
}

export interface GuideDocument extends GuideSource {
  text: string;
  tags: string[];
  projectId?: string;
}

export interface GuideMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GuideResponse {
  answer: string;
  sources: GuideSource[];
  mode: "ai" | "search";
}

export const corpus: GuideDocument[] = corpusData;

const STOP_WORDS = new Set(
  "a an and are as at be been can could did do does for from had has have how i in into is it its me my of on or show tell than that the their them there these they this to was we were what when where which who why will with would you your about please".split(
    " ",
  ),
);

function terms(value: string): string[] {
  return [
    ...new Set(
      value
        .toLowerCase()
        .replace(/[^a-z0-9+#]+/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 1 && !STOP_WORDS.has(word)),
    ),
  ];
}

export function retrieveDocuments(
  question: string,
  projectId?: string,
  documents: GuideDocument[] = corpus,
): GuideDocument[] {
  const query = terms(question);
  const ranked = documents.map((document, index) => {
    const title = terms(document.title);
    const tags = terms(document.tags.join(" "));
    const body = terms(document.text);
    let score = (document.projectId === projectId || document.id === projectId) && projectId ? 24 : 0;
    for (const word of query) {
      if (title.includes(word)) score += 8;
      if (tags.includes(word)) score += 5;
      if (body.includes(word)) score += 1;
    }
    // Keep broad portfolio questions useful without returning unrelated projects.
    if (
      (document.id === "about" || document.id === "about-hammad") &&
      query.some((word) =>
        [
          "hammad",
          "portfolio",
          "contact",
          "skills",
          "email",
          "background",
        ].includes(word),
      )
    )
      score += 16;
    return { document, score, index };
  });
  return ranked
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4)
    .map(({ document }) => document);
}

export function searchGuide(
  question: string,
  projectId?: string,
  documents: GuideDocument[] = corpus,
): GuideResponse {
  const results = retrieveDocuments(question, projectId, documents);
  if (!results.length) {
    return {
      answer:
        "I couldn’t find that in the portfolio. Try a project name or a topic such as assembly, AI agents, Flutter, or simulations.",
      sources: [],
      mode: "search",
    };
  }
  const snippets = results
    .slice(0, 3)
    .map(
      (document) =>
        `${document.title} — ${document.text.split("\n")[0].slice(0, 420)}`,
    );
  return {
    answer: `From the project notes:\n\n${snippets.join("\n\n")}`,
    sources: results
      .slice(0, 3)
      .map(({ id, title, url }) => ({ id, title, url })),
    mode: "search",
  };
}

/** Only corpus-owned URLs are returned; a model cannot invent a link. */
export function validateAIResponse(
  output: unknown,
  documents: GuideDocument[],
): GuideResponse | null {
  if (typeof output !== "object" || output === null) return null;
  const record = output as Record<string, unknown>;
  let raw: unknown = record.response;
  if (Array.isArray(record.choices)) {
    const first = record.choices[0] as
      { message?: { content?: unknown } } | undefined;
    raw = first?.message?.content;
  }
  if (typeof raw !== "string" || raw.length > 8000) return null;
  let result: unknown;
  try {
    result = JSON.parse(
      raw
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, ""),
    );
  } catch {
    return null;
  }
  if (!result || typeof result !== "object") return null;
  const { answer, sourceIds } = result as Record<string, unknown>;
  if (typeof answer !== "string" || !answer.trim() || answer.length > 2200)
    return null;
  // The UI renders plain text and puts validated references in separate links.
  if (/(?:https?:\/\/|javascript:|data:|<\/?[a-z][^>]*>)/i.test(answer))
    return null;
  if (!Array.isArray(sourceIds) || !sourceIds.length || sourceIds.length > 4)
    return null;
  const byId = new Map(documents.map((document) => [document.id, document]));
  if (sourceIds.some((id) => typeof id !== "string" || !byId.has(id)))
    return null;
  return {
    answer: answer.trim(),
    sources: [...new Set(sourceIds as string[])].map((id) => {
      const { title, url } = byId.get(id)!;
      return { id, title, url };
    }),
    mode: "ai",
  };
}
