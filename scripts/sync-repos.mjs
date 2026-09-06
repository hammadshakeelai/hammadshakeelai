import fs from "node:fs/promises";
const file = new URL("../src/data/github-snapshot.json", import.meta.url);
try {
  let repositories = [];
  for (let page = 1; page <= 20; page++) {
    const response = await fetch(
      `https://api.github.com/users/hammadshakeelai/repos?type=owner&per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        signal: AbortSignal.timeout(20000),
      },
    );
    if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Unexpected GitHub response");
    repositories.push(
      ...data
        .filter((r) => !r.private)
        .map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          html_url: r.html_url,
          homepage: r.homepage,
          language: r.language,
          fork: r.fork,
          archived: r.archived,
          size: r.size,
          stargazers_count: r.stargazers_count,
          updated_at: r.updated_at,
          default_branch: r.default_branch,
          owner: r.owner.login,
        })),
    );
    if (data.length < 100) break;
  }
  if (!repositories.length) throw new Error("Empty catalog");
  await fs.writeFile(
    file,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        owner: "hammadshakeelai",
        repositories,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Synced ${repositories.length} public repositories.`);
} catch (error) {
  await fs.access(file);
  console.warn(`Using saved catalog: ${error.message}`);
}
