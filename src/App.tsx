import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Command,
  Search,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Orbit,
  Monitor,
  Grid2X2,
  Sparkles,
  Github,
  Mail,
  Download,
  ChevronLeft,
  ExternalLink,
  Plus,
} from "lucide-react";
import { projects, featuredProjects, categories } from "./data/projects";
import { articles } from "./data/articles";
import type { Project } from "./data/types";
import { useRoute, navigate, asset } from "./lib/navigation";
import { useSettings, useDemo, playTone } from "./lib/store";
import ProjectPreview, { ProjectCard } from "./components/ProjectPreview";
import Dialog from "./components/Dialog";
const HeroScene = lazy(() => import("./scene/HeroScene"));
const ExploreScene = lazy(() => import("./scene/ExploreScene"));
const Desktop = lazy(() => import("./components/Desktop"));
const Guide = lazy(() => import("./components/Guide"));
const Pong = lazy(() => import("./components/Pong"));
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-static">
        <div className="static-orbit" />
        <span>∞</span>
        <p>
          The lab is ready to explore.
          <br />
          All projects are available below.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export default function App() {
  const route = useRoute();
  const settings = useSettings();
  const systemReduced = useReducedMotion();
  const reduced =
    settings.motion === "reduced" ||
    (settings.motion === "system" && !!systemReduced);
  const [panel, setPanel] = useState<"search" | "settings" | "guide" | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const section = route.split("/")[1] || "home";
  const project =
    section === "project"
      ? projects.find(
          (p) => p.id === decodeURIComponent(route.split("/")[2] || ""),
        )
      : undefined;
  const article =
    section === "writing"
      ? articles.find((a) => a.id === route.split("/")[2])
      : undefined;
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPanel((p) => (p === "search" ? null : "search"));
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    useDemo.getState().stop();
    document.title = project
      ? `${project.name} — Hammad’s Lab`
      : article
        ? `${article.title} — Hammad’s Lab`
        : "Hammad’s Lab — ideas made interactive";
  }, [route, project, article]);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  const open = (p: Project) => navigate(`/project/${p.id}`);
  const navigateAndClose = (path: string) => {
    setPanel(null);
    navigate(path);
  };
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#/" aria-label="Hammad’s Lab home">
          <span className="brand-mark">
            <Orbit size={25} strokeWidth={1.5} />
          </span>
          <span>
            hammad<span className="brand-dot">.</span>
            <small>THE LAB</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a className={section === "home" ? "active" : ""} href="#/">
            Home
          </a>
          <a
            className={
              section === "projects" || section === "project" ? "active" : ""
            }
            href="#/projects"
          >
            Projects <sup>{projects.length}</sup>
          </a>
          <a className={section === "explore" ? "active" : ""} href="#/explore">
            Explore <span className="nav-3d">3D</span>
          </a>
          <a className={section === "desktop" ? "active" : ""} href="#/desktop">
            Desktop
          </a>
          <a className={section === "about" ? "active" : ""} href="#/about">
            About
          </a>
        </nav>
        <div className="header-tools">
          <button
            className="command-button"
            onClick={() => setPanel("search")}
            aria-label="Search projects and commands"
          >
            <Command size={14} />
            <span>K</span>
          </button>
          <button className="contact-button" onClick={() => setPanel("guide")}>
            Ask the lab <Sparkles size={14} />
          </button>
        </div>
      </header>
      {section === "desktop" ? (
        <Suspense fallback={<Loading />}>
          <Desktop />
        </Suspense>
      ) : section === "explore" ? (
        <main id="main-content" tabIndex={-1} className="explore-page">
          <div className="explore-page-intro">
            <span className="eyebrow">TAKE THE SCENIC ROUTE</span>
            <h1>Welcome to my little universe.</h1>
            <p>
              Three places. A lot of possibilities. Pick a destination or pilot
              the probe.
            </p>
          </div>
          <SceneBoundary>
            <Suspense fallback={<Loading />}>
              <ExploreScene
                projects={featuredProjects}
                onProject={(id) => navigate(`/project/${id}`)}
                reducedMotion={reduced}
                quality={settings.quality}
              />
            </Suspense>
          </SceneBoundary>
          <div className="explore-access">
            <h2>Jump straight into a project</h2>
            <div>
              {featuredProjects.map((p) => (
                <button key={p.id} onClick={() => open(p)}>
                  {p.name}
                  <ArrowUpRight size={15} />
                </button>
              ))}
            </div>
          </div>
        </main>
      ) : section === "projects" ? (
        <Catalog onOpen={open} />
      ) : section === "project" && project ? (
        <main
          id="main-content"
          tabIndex={-1}
          className="project-page content-width"
        >
          <a href="#/projects" className="back-link">
            <ChevronLeft size={16} /> All projects
          </a>
          <div className="project-heading">
            <div>
              <span className="eyebrow">
                {project.category} / {project.status}
              </span>
              <h1>{project.name}</h1>
            </div>
            <a
              className="circle-link"
              href={project.sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.name} source`}
            >
              <Github />
            </a>
          </div>
          <p className="project-summary">{project.summary}</p>
          <div className="tag-list">
            {project.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <ProjectPreview project={project} />
          {project.attribution && (
            <p className="attribution">{project.attribution}</p>
          )}
          {project.caseStudy && (
            <div className="case-study">
              <div>
                <span className="eyebrow">THE STORY BEHIND THE BUILD</span>
                <h2>A closer look.</h2>
                <p>{project.caseStudy.intro}</p>
              </div>
              <div>
                {[
                  ["The question", project.caseStudy.challenge],
                  ["The approach", project.caseStudy.approach],
                  ["What exists today", project.caseStudy.outcome],
                  ["The boundaries", project.caseStudy.limitations],
                ].map(([title, body]) => (
                  <section key={title}>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </section>
                ))}
              </div>
            </div>
          )}
          <div className="project-next">
            <p>Keep following your curiosity.</p>
            <button
              className="button"
              onClick={() =>
                open(
                  featuredProjects[
                    (featuredProjects.findIndex((p) => p.id === project.id) +
                      1) %
                      featuredProjects.length
                  ],
                )
              }
            >
              Next experiment <ArrowRight size={17} />
            </button>
          </div>
        </main>
      ) : section === "about" ? (
        <About onOpen={open} />
      ) : section === "writing" ? (
        <main
          id="main-content"
          tabIndex={-1}
          className="writing-page content-width"
        >
          {article ? (
            <>
              <a className="back-link" href="#/writing">
                <ChevronLeft size={16} /> Field notes
              </a>
              <span className="eyebrow">FIELD NOTES / {article.readTime}</span>
              <h1>{article.title}</h1>
              <p className="article-lede">{article.description}</p>
              <div className="article-body">
                {article.sections.map((s) => (
                  <section key={s.heading}>
                    <h2>{s.heading}</h2>
                    <p>{s.body}</p>
                  </section>
                ))}
                <h2>Explore the source</h2>
                {article.projectIds.map((id) => {
                  const p = projects.find((p) => p.id === id);
                  return p ? (
                    <p key={id}>
                      <a href={p.sourceUrl} target="_blank" rel="noreferrer">
                        {p.name} <ExternalLink size={14} />
                      </a>
                    </p>
                  ) : null;
                })}
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">THINKING OUT LOUD</span>
              <h1>Field notes.</h1>
              <p className="section-lede">
                A few things learned while making things.
              </p>
              <ArticleList />
            </>
          )}
        </main>
      ) : (
        <main id="main-content" tabIndex={-1}>
          <section className="hero content-width">
            <div className="hero-copy">
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="eyebrow">
                  <span className="status-light" /> A PERSONAL SPACE FOR BIG
                  CURIOSITIES
                </div>
                <h1>
                  Ideas, made
                  <br />
                  <span>interactive.</span>
                  <span className="title-star">✳</span>
                </h1>
                <p>
                  I’m Hammad. I build with AI, code, and a healthy amount of
                  “what if?”
                  <br />
                  Welcome to the things that happened next.
                </p>
                <div className="hero-actions">
                  <a className="button primary" href="#/projects">
                    Enter the lab <ArrowUpRight size={19} />
                  </a>
                  <a className="text-button" href="#/explore">
                    <Orbit size={18} /> Take a 3D detour
                  </a>
                </div>
                <div className="hero-signature">
                  <span className="signature-line" />
                  <span>
                    MUHAMMAD HAMMAD SHAKEEL
                    <br />
                    <b>AI / SOFTWARE / EXPERIMENTS</b>
                  </span>
                </div>
              </motion.div>
            </div>
            <div className="hero-art">
              <SceneBoundary>
                <Suspense
                  fallback={
                    <div className="scene-loading">
                      <span className="loading-orbit" />
                    </div>
                  }
                >
                  <HeroScene
                    reducedMotion={reduced}
                    quality={settings.quality}
                  />
                </Suspense>
              </SceneBoundary>
              <div className="hero-coordinate coordinate-top">
                OBJ—001
                <br />
                <span>CURIOSITY IN ORBIT</span>
              </div>
              <div className="hero-project-label">
                <span className="tiny-dot" />
                <span>
                  Always a work in progress.
                  <br />
                  <b>Just like the good stuff.</b>
                </span>
                <Plus size={18} />
              </div>
            </div>
            <div className="hero-bottom">
              <a
                href="#selected"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("selected")
                    ?.scrollIntoView({
                      behavior: reduced ? "instant" : "smooth",
                    });
                }}
              >
                <ArrowDown size={15} /> SCROLL TO EXPLORE
              </a>
              <span>OPEN SOURCE. OPEN POSSIBILITIES.</span>
              <span>EST. IN CURIOSITY ↗</span>
            </div>
          </section>
          <div className="discipline-strip" aria-label="Areas of interest">
            <span>Artificial intelligence</span>
            <i>✳</i>
            <span>Creative code</span>
            <i>✳</i>
            <span>Scientific simulations</span>
            <i>✳</i>
            <span>Things you can play with</span>
            <i>✳</i>
          </div>
          <section id="selected" className="selected-section content-width">
            <Reveal className="section-heading">
              <div>
                <span className="eyebrow">A FEW THINGS FROM THE LAB</span>
                <h2>
                  Built to be
                  <br />
                  <span className="muted-title">played with.</span>
                </h2>
              </div>
              <div>
                <p>
                  Some solve problems. Some ask questions.
                  <br />
                  All started with curiosity.
                </p>
                <a className="text-button" href="#/projects">
                  The whole collection{" "}
                  <span className="count-pill">{projects.length}</span>
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </Reveal>
            <div className="featured-grid">
              {featuredProjects.slice(0, 6).map((p, i) => (
                <Reveal key={p.id}>
                  <ProjectCard project={p} index={i} onOpen={open} />
                </Reveal>
              ))}
            </div>
            <a href="#/projects" className="all-projects">
              There’s more where that came from.
              <span>
                Explore all {projects.length} repositories{" "}
                <ArrowUpRight size={22} />
              </span>
            </a>
          </section>
          <section className="world-invitation content-width">
            <Reveal className="world-card">
              <div className="world-card-art">
                <div className="mini-planet" />
                <div className="mini-ring" />
                <span className="world-map-label a">OBSERVATORY</span>
                <span className="world-map-label b">WORKSHOP</span>
                <span className="world-map-label c">EXHIBITION</span>
              </div>
              <div>
                <span className="eyebrow">FOR THE EXPLORERS</span>
                <h2>
                  Getting a little
                  <br />
                  lost is the point.
                </h2>
                <p>
                  Three worlds to wander. Projects to discover.
                  <br />A few secrets along the way.
                </p>
                <a href="#/explore" className="button primary">
                  Explore the universe <Orbit size={18} />
                </a>
                <a href="#/desktop" className="text-button desktop-invite">
                  Or make yourself at home on the desktop{" "}
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </Reveal>
          </section>
          <section className="notes-section content-width">
            <Reveal className="section-heading">
              <div>
                <span className="eyebrow">THINGS LEARNED ALONG THE WAY</span>
                <h2>Field notes.</h2>
              </div>
              <a href="#/writing" className="text-button">
                All notes <ArrowUpRight size={18} />
              </a>
            </Reveal>
            <ArticleList />
          </section>
          <section className="about-teaser content-width">
            <span className="eyebrow">THE HUMAN IN THE LOOP</span>
            <h2>
              Serious about building.
              <br />
              <span>Playful about everything else.</span>
            </h2>
            <div>
              <p>
                AI student. Agent orchestrator. Terminal enthusiast.
                <br />
                Usually building something; occasionally playing badminton.
              </p>
              <a href="#/about" className="button">
                A little about me <ArrowUpRight size={18} />
              </a>
            </div>
          </section>
        </main>
      )}
      {section !== "desktop" && <Footer />}
      <div className="utility-bar">
        <button
          onClick={() => {
            settings.toggleSound();
            playTone(600);
          }}
          aria-label={settings.sound ? "Mute sound" : "Enable sound"}
        >
          {settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <span />
        <button
          aria-label="Experience settings"
          onClick={() => setPanel("settings")}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>
      <button
        className="floating-guide"
        aria-label="Open lab guide"
        onClick={() => setPanel("guide")}
      >
        <Sparkles size={18} />
        <span>Ask the lab</span>
      </button>
      {panel === "guide" && (
        <Dialog title="YOUR LAB GUIDE" onClose={() => setPanel(null)}>
          <Suspense fallback={<Loading />}>
            <Guide />
          </Suspense>
        </Dialog>
      )}
      {panel === "settings" && (
        <Dialog
          title="MAKE YOURSELF COMFORTABLE"
          onClose={() => setPanel(null)}
        >
          <div className="settings-panel">
            <h2>Your kind of experience.</h2>
            <label>
              Visual quality
              <select
                value={settings.quality}
                onChange={(e) =>
                  settings.setQuality(e.target.value as "auto" | "high" | "low")
                }
              >
                <option value="auto">Adaptive (recommended)</option>
                <option value="high">High detail</option>
                <option value="low">Lightweight</option>
              </select>
            </label>
            <label>
              Motion
              <select
                value={settings.motion}
                onChange={(e) =>
                  settings.setMotion(
                    e.target.value as "system" | "reduced" | "full",
                  )
                }
              >
                <option value="system">Follow my device</option>
                <option value="reduced">Reduce motion</option>
                <option value="full">Full experience</option>
              </select>
            </label>
            <button className="button" onClick={settings.toggleSound}>
              {settings.sound ? "Mute sound" : "Enable gentle sound effects"}
            </button>
            <p className="muted small">
              Your visual preferences stay on this device. Sound always starts
              muted.
            </p>
          </div>
        </Dialog>
      )}
      {panel === "search" && (
        <Dialog title="FOLLOW A CURIOSITY" onClose={() => setPanel(null)}>
          <div className="command-search">
            <Search size={22} />
            <input
              autoFocus
              aria-label="Search the lab"
              placeholder="Projects, places, possibilities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <kbd>ESC</kbd>
          </div>
          <div className="command-results">
            {!search &&
              [
                ["Explore the 3D universe", "/explore"],
                ["Open the desktop", "/desktop"],
                ["Read field notes", "/writing"],
                ["Meet Hammad", "/about"],
              ].map(([name, path]) => (
                <button key={path} onClick={() => navigateAndClose(path)}>
                  <Command size={17} />
                  {name}
                  <ArrowUpRight size={16} />
                </button>
              ))}
            {projects
              .filter((p) =>
                (p.name + " " + p.summary + " " + p.tags.join(" "))
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .slice(0, 12)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigateAndClose(`/project/${p.id}`)}
                >
                  <span className="command-project-icon">
                    <Grid2X2 size={16} />
                  </span>
                  <span>
                    {p.name}
                    <small>{p.category}</small>
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
          </div>
        </Dialog>
      )}
    </>
  );
}
function Loading() {
  return (
    <div className="loading">
      <span className="loading-orbit" />
      <p>Opening the lab…</p>
    </div>
  );
}
function Catalog({ onOpen }: { onOpen: (p: Project) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [live, setLive] = useState(false);
  const filtered = projects.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (!live || p.embedVerified) &&
      (p.name + " " + p.summary + " " + p.tags.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="catalog-page content-width"
    >
      <span className="eyebrow">THE EVER-GROWING COLLECTION</span>
      <div className="catalog-title">
        <h1>
          Curiosity,
          <br />
          in many forms<span>.</span>
        </h1>
        <p>
          Apps, experiments, tools, and things
          <br />
          I’m still figuring out.
          <br />
          <b>{projects.length} public repositories. One place to explore.</b>
        </p>
      </div>
      <div className="catalog-controls">
        <div className="filter-tabs" role="group" aria-label="Project category">
          {["All", ...categories].map((c) => (
            <button
              className={category === c ? "selected" : ""}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="catalog-search">
          <label className="search-box">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection"
              aria-label="Search the collection"
            />
          </label>
          <label className="live-filter">
            <input
              type="checkbox"
              checked={live}
              onChange={(e) => setLive(e.target.checked)}
            />{" "}
            Playable here
          </label>
        </div>
      </div>
      <p className="results-count mono" aria-live="polite">
        {filtered.length} EXPERIMENTS FOUND
      </p>
      <div className="catalog-grid">
        {filtered.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} onOpen={onOpen} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h2>A little too specific?</h2>
          <p>Try another word, or explore the full collection.</p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
              setLive(false);
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </main>
  );
}
function ArticleList() {
  return (
    <div className="article-list">
      {articles.map((a, i) => (
        <a key={a.id} href={`#/writing/${a.id}`}>
          <span className="mono">0{i + 1}</span>
          <div>
            <span className="eyebrow">{a.readTime} READ</span>
            <h3>{a.title}</h3>
            <p>{a.description}</p>
          </div>
          <span className="circle-link">
            <ArrowUpRight size={21} />
          </span>
        </a>
      ))}
    </div>
  );
}
function About({ onOpen }: { onOpen: (p: Project) => void }) {
  const [skill, setSkill] = useState("AI agents");
  const skills = [
    "AI agents",
    "Python",
    "TypeScript",
    "Three.js",
    "Flutter",
    "Assembly",
    "Algorithms",
    "React",
  ];
  const matches = projects
    .filter((p) =>
      (p.tags.join(" ") + " " + p.name + " " + p.language + " " + p.category)
        .toLowerCase()
        .includes(skill.toLowerCase().replace("ai agents", "agent")),
    )
    .slice(0, 6);
  return (
    <main id="main-content" tabIndex={-1} className="about-page content-width">
      <span className="eyebrow">HELLO FROM THE OTHER SIDE OF THE SCREEN</span>
      <div className="about-header">
        <div>
          <h1>
            Hammad.
            <br />
            <span>Always curious.</span>
          </h1>
          <p>
            I’m Muhammad Hammad Shakeel, an Artificial Intelligence student at
            IM|Sciences in Pakistan. I build software, explore machine learning,
            and work with coding agents to turn ideas into working experiments.
          </p>
          <p>
            This lab brings those experiments together. The finished, the
            unfinished, and the “let’s see what happens”.
          </p>
          <a
            className="button"
            href={asset("profile.html")}
            target="_blank"
            rel="noreferrer"
          >
            <Download size={17} /> View / save my profile
          </a>
        </div>
        <div className="identity-art">
          <span>HS</span>
          <div className="identity-orbit" />
          <small>HUMAN. CURIOUS. STILL LEARNING.</small>
        </div>
      </div>
      <section className="skills-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CONNECTED BY CURIOSITY</span>
            <h2>
              A constellation
              <br />
              of interests.
            </h2>
          </div>
          <p>Pick an interest to see where it shows up.</p>
        </div>
        <div className="skills-layout">
          <div className="skill-constellation">
            <svg viewBox="0 0 500 360" aria-hidden="true">
              {skills.map((_, i) => (
                <line
                  key={i}
                  x1="250"
                  y1="180"
                  x2={250 + 170 * Math.cos((i / 8) * Math.PI * 2)}
                  y2={180 + 130 * Math.sin((i / 8) * Math.PI * 2)}
                  stroke="currentColor"
                />
              ))}
            </svg>
            <span className="skill-center">HS</span>
            {skills.map((s, i) => (
              <button
                key={s}
                className={s === skill ? "selected" : ""}
                style={{
                  left: `${50 + 34 * Math.cos((i / 8) * Math.PI * 2)}%`,
                  top: `${50 + 36 * Math.sin((i / 8) * Math.PI * 2)}%`,
                }}
                onClick={() => {
                  setSkill(s);
                  playTone(300 + i * 50);
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="skill-projects">
            <span className="eyebrow">FOLLOWING: {skill.toUpperCase()}</span>
            {matches.map((p) => (
              <button key={p.id} onClick={() => onOpen(p)}>
                {p.name}
                <ArrowUpRight size={16} />
              </button>
            ))}
            {!matches.length && (
              <p>
                More experiments are on the way. Browse the source archive for
                the full picture.
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="activity-section">
        <span className="eyebrow">RECENT PUBLIC PROJECT ACTIVITY</span>
        <h2>Still making things.</h2>
        <div className="timeline">
          {[...projects]
            .filter((p) => p.featured)
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .slice(0, 6)
            .map((p) => (
              <button key={p.id} onClick={() => onOpen(p)}>
                <time>
                  {new Date(p.updatedAt).toLocaleDateString("en", {
                    month: "short",
                    year: "numeric",
                  })}
                </time>
                <span className="timeline-dot" />
                <span>
                  {p.name}
                  <small>Repository updated</small>
                </span>
                <ArrowUpRight size={17} />
              </button>
            ))}
        </div>
      </section>
      <section className="play-section">
        <div>
          <span className="eyebrow">A SMALL DETOUR</span>
          <h2>
            Not everything
            <br />
            needs a roadmap.
          </h2>
          <p>
            Outside code: badminton, table tennis, the gym, and friends. Here’s
            a little table tennis for your browser.
          </p>
        </div>
        <Suspense fallback={<Loading />}>
          <Pong />
        </Suspense>
      </section>
    </main>
  );
}
function Footer() {
  return (
    <footer className="site-footer content-width">
      <div className="footer-top">
        <div>
          <span className="eyebrow">HAVE A GOOD “WHAT IF?”</span>
          <h2>
            Let’s make
            <br />
            something <span>interesting.</span>
          </h2>
        </div>
        <a
          className="footer-email"
          href="mailto:hammadshakeel61@gmail.com"
          aria-label="Email Hammad"
        >
          <ArrowUpRight size={42} />
        </a>
      </div>
      <div className="footer-bottom">
        <a className="brand" href="#/">
          <Orbit size={23} /> hammad.
        </a>
        <div>
          <a
            href="https://github.com/hammadshakeelai"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
          <a
            href="https://www.linkedin.com/in/muhammad-hammad-shakeel-2905a0410"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn ↗
          </a>
          <a
            href="https://www.kaggle.com/hammadshakeelai"
            target="_blank"
            rel="noreferrer"
          >
            Kaggle ↗
          </a>
          <a href="mailto:hammadshakeel61@gmail.com">Email ↗</a>
        </div>
        <span>BUILT WITH CURIOSITY · {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
