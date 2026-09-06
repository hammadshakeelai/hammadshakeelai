import { useState, useRef, type PointerEvent } from "react";
import {
  Terminal,
  Folder,
  Maximize2,
  Minus,
  X,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { projects, featuredProjects } from "../data/projects";
import type { Project } from "../data/types";
import ProjectPreview from "./ProjectPreview";
import { useDemo, playTone } from "../lib/store";
type LabWindow = {
  id: string;
  x: number;
  y: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
};
export function terminalCommand(input: string) {
  const [command, ...args] = input.trim().split(/\s+/);
  const query = args.join(" ").toLowerCase();
  if (command === "help")
    return "help · projects · open <name> · about · clear · secret";
  if (command === "projects")
    return featuredProjects.map((p) => p.name).join(" / ");
  if (command === "about")
    return "Muhammad Hammad Shakeel — AI student, software builder, endlessly curious. Based in Pakistan.";
  if (command === "secret")
    return "You found the quiet room. Try the table-tennis game in About, or collect all three signals in Explore.";
  if (command === "open") {
    const p =
      projects.find((p) => p.name.toLowerCase() === query || p.id === query) ||
      projects.find((p) => p.name.toLowerCase().includes(query));
    return query && p
      ? { project: p }
      : `No project matched “${args.join(" ")}”. Try projects.`;
  }
  if (command === "clear") return "";
  return `Unknown command: ${command || "(empty)"}. Try help.`;
}
export default function Desktop() {
  const [windows, setWindows] = useState<LabWindow[]>([]);
  const [query, setQuery] = useState("");
  const [terminal, setTerminal] = useState(true);
  const [command, setCommand] = useState("");
  const [lines, setLines] = useState([
    "Welcome to Hammad’s Lab. This terminal navigates the portfolio.",
    "Type help to get started.",
  ]);
  const [z, setZ] = useState(10);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const workspace = useRef<HTMLDivElement>(null);
  function open(project: Project) {
    playTone(540);
    setZ((v) => v + 1);
    setWindows((ws) =>
      ws.some((w) => w.id === project.id)
        ? ws.map((w) =>
            w.id === project.id ? { ...w, minimized: false, z: z + 1 } : w,
          )
        : [
            ...ws,
            {
              id: project.id,
              x: 70 + (ws.length % 5) * 34,
              y: 40 + (ws.length % 5) * 28,
              z: z + 1,
              minimized: false,
              maximized: false,
            },
          ],
    );
  }
  function patch(id: string, change: Partial<LabWindow>) {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...change } : w)));
  }
  function down(e: PointerEvent<HTMLElement>, w: LabWindow) {
    if ((e.target as HTMLElement).closest("button") || w.maximized) return;
    drag.current = { id: w.id, dx: e.clientX - w.x, dy: e.clientY - w.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    setZ((v) => v + 1);
    patch(w.id, { z: z + 1 });
  }
  function move(e: PointerEvent<HTMLElement>) {
    if (!drag.current) return;
    patch(drag.current.id, {
      x: Math.max(
        0,
        Math.min((workspace.current?.clientWidth || window.innerWidth) - 100, e.clientX - drag.current.dx),
      ),
      y: Math.max(
        0,
        Math.min((workspace.current?.clientHeight || window.innerHeight) - 100, e.clientY - drag.current.dy),
      ),
    });
  }
  const filtered = projects.filter((p) =>
    (p.name + " " + p.tags.join(" "))
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <main className="desktop-view" id="main-content" tabIndex={-1}>
      <div className="desktop-wallpaper">
        <span>
          MAKE YOURSELF
          <br />
          AT HOME.
        </span>
        <div className="desktop-orb" />
      </div>
      <aside className="desktop-library">
        <div className="mono">
          <Folder size={15} /> PROJECT FILES <span>{projects.length}</span>
        </div>
        <label className="search-box">
          <Search size={16} />
          <input
            placeholder="Find a project"
            aria-label="Search desktop projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="desktop-file-list">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => open(p)}>
              <span className={`file-icon tone-${p.category.toLowerCase()}`}>
                <Folder size={19} />
              </span>
              <span>
                {p.name}
                <small>{p.category}</small>
              </span>
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
      </aside>
      <div className="desktop-workspace" ref={workspace}>
        {windows
          .filter((w) => !w.minimized)
          .map((w) => {
            const p = projects.find((p) => p.id === w.id)!;
            return (
              <section
                key={w.id}
                className={`app-window ${w.maximized ? "maximized" : ""}`}
                style={{ left: w.x, top: w.y, zIndex: w.z }}
                aria-label={`${p.name} window`}
                onPointerDown={() => {
                  setZ((v) => v + 1);
                  patch(w.id, { z: z + 1 });
                }}
              >
                <header
                  className="window-title"
                  onPointerDown={(e) => down(e, w)}
                  onPointerMove={move}
                  onPointerUp={() => {
                    drag.current = null;
                  }}
                >
                  <span>{p.name}</span>
                  <div>
                    <button
                      aria-label={`Minimize ${p.name}`}
                      onClick={() => {
                        patch(w.id, { minimized: true });
                        if (useDemo.getState().activeId === p.id)
                          useDemo.getState().stop();
                      }}
                    >
                      <Minus size={15} />
                    </button>
                    <button
                      aria-label={`Maximize ${p.name}`}
                      onClick={() => patch(w.id, { maximized: !w.maximized })}
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button
                      aria-label={`Close ${p.name}`}
                      onClick={() => {
                        setWindows((ws) => ws.filter((x) => x.id !== w.id));
                        if (useDemo.getState().activeId === p.id)
                          useDemo.getState().stop();
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </header>
                <div className="window-body">
                  <ProjectPreview project={p} compact />
                  <p>{p.summary}</p>
                </div>
              </section>
            );
          })}
        {windows.length === 0 && (
          <div className="desktop-hint">
            <span className="crosshair">+</span>
            <p>Your projects. Your space.</p>
            <small>Open a file from the left to start exploring.</small>
          </div>
        )}
        {terminal && (
          <section className="terminal-window">
            <header>
              <span>
                <Terminal size={15} /> lab-terminal
              </span>
              <button
                aria-label="Close terminal"
                onClick={() => setTerminal(false)}
              >
                <X size={16} />
              </button>
            </header>
            <div className="terminal-lines" aria-live="polite">
              {lines.slice(-9).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const result = terminalCommand(command);
                if (typeof result === "object") {
                  open(result.project);
                  setLines((ls) => [
                    ...ls,
                    `› ${command}`,
                    `Opening ${result.project.name}…`,
                  ]);
                } else if (command.trim() === "clear") setLines([]);
                else setLines((ls) => [...ls, `› ${command}`, result]);
                setCommand("");
              }}
            >
              <span>hammad@lab ~ %</span>
              <input
                aria-label="Terminal command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                spellCheck={false}
                autoComplete="off"
              />
            </form>
          </section>
        )}
      </div>
      <div className="desktop-dock">
        <button
          onClick={() => setTerminal(!terminal)}
          aria-label="Toggle terminal"
        >
          <Terminal size={21} />
        </button>
        {windows.map((w) => (
          <button
            key={w.id}
            className={w.minimized ? "" : "running"}
            onClick={() => {
              setZ((v) => v + 1);
              patch(w.id, { minimized: false, z: z + 1 });
            }}
            title={projects.find((p) => p.id === w.id)?.name}
          >
            {projects.find((p) => p.id === w.id)?.name.slice(0, 2)}
          </button>
        ))}
      </div>
    </main>
  );
}
