import { useRef, useState } from "react";
import {
  ExternalLink,
  Play,
  Square,
  Maximize2,
  ArrowUpRight,
  Code2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Project } from "../data/types";
import { asset } from "../lib/navigation";
import { useDemo, playTone } from "../lib/store";
export function ProjectArtwork({
  project,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`project-art art-${project.category.toLowerCase()} ${large ? "large" : ""}`}
    >
      {project.image && !failed ? (
        <img
          loading="lazy"
          src={asset(project.image)}
          alt={`${project.name} application preview`}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="code-art"
          aria-label={`${project.name} project illustration`}
        >
          <div className="art-orbit" />
          <div className="art-orbit second" />
          <span className="art-monogram">
            {project.name === "AlgoViz"
              ? "A↗"
              : project.name === "Mirage Terminal"
                ? ">_"
                : project.name === "Nano-Swarm"
                  ? "◉"
                  : project.name.slice(0, 2)}
          </span>
          <span className="art-code">
            {project.tags.slice(0, 2).join(" / ") ||
              project.language ||
              "OPEN SOURCE"}
          </span>
        </div>
      )}
    </div>
  );
}
export function ProjectCard({
  project,
  onOpen,
  index = 0,
}: {
  project: Project;
  onOpen: (p: Project) => void;
  index?: number;
}) {
  return (
    <button
      className="project-card"
      onClick={() => {
        playTone(520);
        onOpen(project);
      }}
      aria-label={`Open ${project.name}`}
    >
      <div className="card-image">
        <ProjectArtwork project={project} />
        <span className="card-category">{project.category}</span>
        <span className="card-arrow">
          <ArrowUpRight size={21} />
        </span>
      </div>
      <div className="card-meta">
        <span className="mono">
          {String(index + 1).padStart(2, "0")} /{" "}
          {project.status === "live"
            ? "INTERACTIVE"
            : project.status.toUpperCase()}
        </span>
        <span>{project.language || project.tags[0]}</span>
      </div>
      <h3>{project.name}</h3>
      <p>{project.summary}</p>
    </button>
  );
}
export default function ProjectPreview({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  const { activeId, activate, stop } = useDemo();
  const [photo, setPhoto] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = activeId === project.id;
  const canEmbed = project.embedVerified && project.embedUrl;
  const images = project.images || [];
  return (
    <div
      ref={ref}
      className={`project-preview ${expanded ? "preview-expanded" : ""} ${compact ? "compact" : ""}`}
    >
      <div className="browser-chrome">
        <div className="browser-dots">
          <i />
          <i />
          <i />
        </div>
        <span>{project.name}</span>
        <button
          className="icon-button"
          aria-label={expanded ? "Exit expanded preview" : "Expand preview"}
          onClick={() => setExpanded(!expanded)}
        >
          <Maximize2 size={15} />
        </button>
      </div>
      <div
        className={`preview-stage ${project.status === "mobile" ? "mobile-stage" : ""}`}
      >
        {active && canEmbed ? (
          <iframe
            title={`${project.name} interactive demo`}
            src={asset(project.embedUrl!)}
            allow="fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : images.length ? (
          <div className="phone-gallery">
            <div className="phone">
              <img
                src={asset(images[photo])}
                alt={`${project.name} screenshot ${photo + 1} of ${images.length}`}
              />
            </div>
            <div className="gallery-buttons">
              <button
                aria-label="Previous screenshot"
                onClick={() =>
                  setPhoto((photo + images.length - 1) % images.length)
                }
              >
                <ChevronLeft />
              </button>
              <span>
                {photo + 1} / {images.length}
              </span>
              <button
                aria-label="Next screenshot"
                onClick={() => setPhoto((photo + 1) % images.length)}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        ) : (
          <ProjectArtwork project={project} large />
        )}
        {!active && canEmbed && (
          <div className="preview-launch">
            <button
              className="button primary"
              onClick={() => {
                activate(project.id);
                playTone(650);
              }}
            >
              <Play size={16} /> Interact with project
            </button>
            {activeId && (
              <small>
                Starting this demo closes your previous demo session.
              </small>
            )}
          </div>
        )}
      </div>
      <div className="preview-toolbar">
        <div>
          {canEmbed ? (
            <button onClick={() => (active ? stop() : activate(project.id))}>
              {active ? (
                <>
                  <Square size={14} /> Close demo
                </>
              ) : (
                <>
                  <Play size={14} /> Interact
                </>
              )}
            </button>
          ) : (
            <span className="muted small">
              {project.status === "mobile"
                ? "Real app screenshots"
                : project.status === "unavailable"
                  ? "Service currently unavailable"
                  : "Explore the original project"}
            </span>
          )}
        </div>
        <div className="toolbar-links">
          {project.liveUrl && (
            <a href={asset(project.liveUrl)} target="_blank" rel="noreferrer">
              {project.status === "mobile" ? "Android releases" : "Open live"}
              <ExternalLink size={14} />
            </a>
          )}
          <a href={project.sourceUrl} target="_blank" rel="noreferrer">
            <Code2 size={14} /> Source
          </a>
        </div>
      </div>
      {active && (
        <p className="embed-note">
          This is the original application. If it is slow or doesn’t display,
          use “Open live”. Free hosted services may need a moment to wake.
        </p>
      )}
    </div>
  );
}
