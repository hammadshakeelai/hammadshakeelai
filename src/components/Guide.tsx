import { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, ArrowUpRight } from "lucide-react";
import { askGuide, type GuideResponse, type GuideMessage } from "../lib/guide";
type Entry = { question: string; response: GuideResponse };
export default function Guide() {
  const [question, setQuestion] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    [entries, busy],
  );
  async function send(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setQuestion("");
    const history: GuideMessage[] = entries
      .flatMap((e) => [
        { role: "user" as const, content: e.question },
        { role: "assistant" as const, content: e.response.answer },
      ])
      .slice(-6);
    try {
      const response = await askGuide(text, history);
      setEntries((list) => [...list, { question: text, response }]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="guide">
      <div className="guide-intro">
        <div className="guide-symbol">
          <Sparkles size={29} />
        </div>
        <h2>Meet your lab guide.</h2>
        <p>
          Find a project, follow a curiosity, or ask how something was built.
        </p>
      </div>
      <div className="chat-log" aria-live="polite">
        {entries.map((entry, i) => (
          <div key={i} className="chat-turn">
            <p className="chat-question">{entry.question}</p>
            <div className="chat-answer">
              <span className="mono">
                {entry.response.mode === "ai"
                  ? "LAB GUIDE"
                  : "FROM THE PROJECT LIBRARY"}
              </span>
              <p>{entry.response.answer}</p>
              <div className="source-links">
                {entry.response.sources.map((s) => (
                  <a href={s.url} target="_blank" rel="noreferrer" key={s.id}>
                    {s.title}
                    <ArrowUpRight size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
        {busy && (
          <p className="thinking">
            Looking through the lab<span>...</span>
          </p>
        )}
        <div ref={bottom} />
      </div>
      {entries.length === 0 && (
        <div className="suggested-questions">
          {[
            "What can I play with?",
            "Show me the AI projects",
            "How does ASMBOOK work?",
            "Tell me about Hammad",
          ].map((q) => (
            <button key={q} onClick={() => void send(q)}>
              {q}
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
      )}
      <form
        className="guide-input"
        onSubmit={(e) => {
          e.preventDefault();
          void send(question);
        }}
      >
        <input
          aria-label="Ask the lab guide"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={1000}
          placeholder="Follow your curiosity…"
        />
        <button
          className="icon-button"
          disabled={busy || !question.trim()}
          aria-label="Send question"
        >
          <ArrowUp size={20} />
        </button>
      </form>
      <p className="guide-footnote">
        Answers link to public project sources. Search stays available when AI
        is offline.
      </p>
    </div>
  );
}
