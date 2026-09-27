import fs from "node:fs/promises";
import { articles } from "../src/data/articles.ts";
const snapshot = JSON.parse(
  await fs.readFile(
    new URL("../src/data/github-snapshot.json", import.meta.url),
    "utf8",
  ),
);
const overrides = JSON.parse(
  await fs.readFile(
    new URL("../src/data/project-overrides.json", import.meta.url),
    "utf8",
  ),
);
const corpus = snapshot.repositories.map((r) => {
  const p = overrides[r.name] || {};
  return {
    id: r.name.toLowerCase(),
    projectId: r.name.toLowerCase(),
    title: p.name || r.name,
    url: r.html_url,
    tags: [...(p.tags || []), r.language || "", p.category || ""].filter(
      Boolean,
    ),
    text: [
      p.summary || r.description || "Public project archive.",
      p.attribution || "",
      r.fork ? "Forked project: original authorship belongs to upstream." : "",
      p.status ? `Presentation: ${p.status}.` : "Source repository.",
      p.caseStudy ? Object.values(p.caseStudy).join(" ") : "",
    ]
      .filter(Boolean)
      .join(" "),
  };
});
corpus.push(...articles.map((article) => ({
  id: `article-${article.id}`,
  title: article.title,
  url: `https://hammadshakeelai.github.io/hammadshakeelai/#/writing/${article.id}`,
  projectId: article.projectIds[0],
  tags: ["article", "walkthrough", ...article.projectIds],
  text: [article.description, ...article.sections.map(({ heading, body }) => `${heading}\n${body}`)].join("\n\n"),
})));
corpus.push({
  id: "about-hammad",
  title: "About Hammad",
  url: "https://github.com/hammadshakeelai",
  tags: ["about", "hammad", "contact", "AI", "Pakistan"],
  text: "Muhammad Hammad Shakeel is an Artificial Intelligence student at IM|Sciences in Pakistan. He builds software, AI agent tooling, browser applications, and educational simulations. Public interests include badminton, table tennis, gym, and learning. Public contact: hammadshakeel61@gmail.com. No employment history or professional certifications are documented in this portfolio.",
});
const serialized = JSON.stringify(corpus, null, 2) + "\n";
await Promise.all([
  fs.writeFile(new URL("./corpus.json", import.meta.url), serialized),
  fs.writeFile(new URL("../public/guide-corpus.json", import.meta.url), serialized),
]);
console.log(`Built guide corpus with ${corpus.length} source documents.`);
