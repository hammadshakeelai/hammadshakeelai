import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
const root = path.resolve(".demo-source/nano-swarm");
const ref = "2fc986d49a7b3d5c5e3782e12712a5b8f6372759";
function run(command, args, cwd) {
  const r = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32" && command === "npm",
  });
  if (r.status !== 0) throw new Error(`${command} failed (${r.status})`);
}
await fs.mkdir(path.dirname(root), { recursive: true });
try {
  await fs.access(path.join(root, ".git"));
} catch {
  run("git", [
    "clone",
    "--no-checkout",
    "https://github.com/hammadshakeelai/Nano-Swarm-Intelligence-Coronary-Clot-Simulator.git",
    root,
  ]);
}
run("git", ["checkout", "--detach", ref], root);
run("npm", ["ci"], root);
run(
  "npm",
  ["run", "build", "--", "--base", "/hammadshakeelai/demos/nano-swarm/"],
  root,
);
await fs.mkdir("public/demos/nano-swarm", { recursive: true });
await fs.cp(path.join(root, "dist"), "public/demos/nano-swarm", {
  recursive: true,
});
console.log(`Built original Nano-Swarm at ${ref}.`);
