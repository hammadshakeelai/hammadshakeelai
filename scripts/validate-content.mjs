import fs from "node:fs/promises";
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
const names = new Set(snapshot.repositories.map((r) => r.name));
if (names.size !== snapshot.repositories.length)
  throw new Error("Duplicate repositories");
for (const [name, item] of Object.entries(overrides)) {
  if (!names.has(name)) throw new Error(`Unknown repository override: ${name}`);
  if (item.embedVerified && !item.embedUrl)
    throw new Error(`Missing embed URL: ${name}`);
  for (const key of ["liveUrl", "embedUrl"])
    if (item[key] && !/^(https:\/\/|demos\/)/.test(item[key]))
      throw new Error(`Unsafe ${key}: ${name}`);
  if (item.featured && !item.caseStudy)
    throw new Error(`Missing case study: ${name}`);
}
console.log(
  `Validated ${names.size} repositories and ${Object.values(overrides).filter((p) => p.featured).length} featured projects.`,
);
