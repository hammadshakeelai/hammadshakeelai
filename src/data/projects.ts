import snapshot from "./github-snapshot.json";
import editorial from "./project-overrides.json";
import type { Project, Category } from "./types";
export const categories: Category[] = [
  "AI",
  "Simulations",
  "Applications",
  "Tools",
  "Learning",
  "Forks",
];
export const projects: Project[] = snapshot.repositories
  .map((repo) => {
    const override =
      (editorial as Record<string, Partial<Project>>)[repo.name] || {};
    return {
      id: repo.name.toLowerCase(),
      repo: repo.name,
      name: repo.name.replaceAll("-", " "),
      summary:
        repo.description ||
        "An experiment from my public GitHub archive. Explore the source and its history.",
      category: repo.fork ? "Forks" : "Learning",
      tags: repo.language ? [repo.language] : [],
      sourceUrl: repo.html_url,
      embedVerified: false,
      status: repo.archived ? "archived" : repo.size === 0 ? "empty" : "source",
      updatedAt: repo.updated_at,
      stars: repo.stargazers_count,
      language: repo.language || undefined,
      ...(repo.fork
        ? {
            attribution:
              "Fork / exploration. Original authorship belongs to the upstream project.",
          }
        : {}),
      ...override,
    } as Project;
  })
  .sort(
    (a, b) =>
      (a.featured ?? 100) - (b.featured ?? 100) || a.name.localeCompare(b.name),
  );
export const featuredProjects = projects.filter(
  (p) => p.featured !== undefined,
);
