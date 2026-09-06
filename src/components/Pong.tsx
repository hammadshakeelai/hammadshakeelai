import { useEffect, useRef, useState } from "react";
import { playTone } from "../lib/store";
export default function Pong() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState([0, 0]);
  const paddle = useRef(150);
  const reset = useRef(0);
  const redraw = useRef<()=>void>(()=>{});
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    let frame = 0;
    let x = 320,
      y = 180,
      vx = 220,
      vy = 100,
      ai = 180;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.03);
      last = now;
      if (running && !document.hidden) {
        x += vx * dt;
        y += vy * dt;
        ai += Math.sign(y - ai) * Math.min(Math.abs(y - ai), 140 * dt);
        if (y < 9 || y > 351) {
          vy = -vy;
          y = Math.max(9, Math.min(351, y));
        }
        if (x < 29 && x > 13 && Math.abs(y - paddle.current) < 43 && vx < 0) {
          vx = Math.abs(vx) * 1.04;
          vy = (y - paddle.current) * 6;
          playTone(500);
        }
        if (x > 611 && x < 627 && Math.abs(y - ai) < 43 && vx > 0) {
          vx = -Math.abs(vx);
          playTone(360);
        }
        if (x < 0 || x > 640) {
          const missed = x < 0;
          setScore((s) => (missed ? [s[0], s[1] + 1] : [s[0] + 1, s[1]]));
          x = 320;
          y = 180;
          vx = missed ? 220 : -220;
          vy = 100;
        }
      }
      ctx.fillStyle = "#080c21";
      ctx.fillRect(0, 0, 640, 360);
      ctx.strokeStyle = "#33405e";
      ctx.setLineDash([5, 10]);
      ctx.beginPath();
      ctx.moveTo(320, 0);
      ctx.lineTo(320, 360);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ab94f9";
      ctx.fillRect(15, paddle.current - 36, 9, 72);
      ctx.fillStyle = "#77ddf4";
      ctx.fillRect(616, ai - 36, 9, 72);
      ctx.fillStyle = "#e9eef8";
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      if(running) frame = requestAnimationFrame(draw);
    };
    redraw.current=()=>{if(!running)draw(performance.now())};
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [running, reset.current]);
  return (
    <div className="pong">
      <div className="pong-score">
        <span>
          YOU <b>{score[0]}</b>
        </span>
        <span>
          <b>{score[1]}</b> THE LAB
        </span>
      </div>
      <canvas
        width={640}
        height={360}
        ref={canvas}
        tabIndex={0}
        aria-label="Table tennis game. Move your pointer or use arrow up and arrow down to move the left paddle."
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          paddle.current = Math.max(
            36,
            Math.min(324, ((e.clientY - rect.top) / rect.height) * 360),
          );
          redraw.current();
        }}
        onKeyDown={(e) => {
          if (["ArrowUp", "ArrowDown"].includes(e.key)) {
            e.preventDefault();
            paddle.current = Math.max(
              36,
              Math.min(324, paddle.current + (e.key === "ArrowUp" ? -24 : 24)),
            );
            redraw.current();
          }
        }}
      />
      <div className="pong-controls">
        <button className="button primary" onClick={() => setRunning(!running)}>
          {running ? "Pause game" : "Play table tennis"}
        </button>
        <button
          className="button subtle"
          onClick={() => {
            setRunning(false);
            setScore([0, 0]);
            reset.current++;
          }}
        >
          Reset
        </button>
      </div>
      <p className="small muted">
        Move your pointer or touch to control the left paddle. Keyboard: ↑ / ↓.
        First to your own personal best.
      </p>
    </div>
  );
}
