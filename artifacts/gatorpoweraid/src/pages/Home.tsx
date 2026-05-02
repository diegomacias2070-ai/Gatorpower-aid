import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  accent: boolean;
}

function useScrollReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const ro = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), i * 80);
            ro.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    reveals.forEach((r) => ro.observe(r));
    return () => ro.disconnect();
  }, []);
}

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      initParticles();
    }

    function initParticles() {
      const count = Math.floor((canvas!.width * canvas!.height) / 10000);
      particlesRef.current = Array.from({ length: count }, () => makeParticle());
    }

    function makeParticle(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size: Math.random() * 1.0 + 0.3,
        speedX: (Math.random() - 0.5) * 0.18,
        speedY: (Math.random() - 0.5) * 0.18,
        opacity: Math.random() * 0.22 + 0.04,
        accent: Math.random() > 0.92,
      };
    }

    function animate() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      particlesRef.current.forEach((p) => {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          p.x -= dx * 0.0015;
          p.y -= dy * 0.0015;
        }
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas!.width || p.y < 0 || p.y > canvas!.height) {
          Object.assign(p, makeParticle());
        }
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.accent ? "#9a9a94" : "#e2e2dc";
        ctx.beginPath();
        ctx.rect(p.x, p.y, p.size, p.size);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    }

    resize();
    animate();

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }} />;
}

function VisualCanvas({ id, type }: { id: string; type: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;

    function draw() {
      cv!.width = cv!.offsetWidth;
      cv!.height = cv!.offsetHeight;
      const w = cv!.width, h = cv!.height;
      const palettes = [
        ["#9a9a94", "#0f0f0f", "#2a2a2a"],
        ["#1e1e1e", "#6a6a65", "#303030"],
        ["#080808", "#888882", "#222222"],
        ["#9a9a94", "#1a1a1a", "#404040"],
        ["#0a0a0a", "#7a7a76", "#585852"],
        ["#181818", "#e2e2dc", "#2a2a2a"],
      ];
      const palette = palettes[id.charCodeAt(id.length - 1) - "1".charCodeAt(0)] ?? palettes[0];

      ctx.fillStyle = palette[1];
      ctx.fillRect(0, 0, w, h);

      if (type === 0) {
        ctx.strokeStyle = palette[0];
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.25;
        for (let x = 0; x < w; x += Math.floor(w / 12)) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + Math.random() * 30 - 15, h); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = palette[0];
          ctx.globalAlpha = 0.6;
          ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 70 + 8, Math.random() * 2 + 0.5);
        }
      } else if (type === 1) {
        const pxSize = Math.floor(w / 20);
        for (let px = 0; px < w; px += pxSize) {
          for (let py = 0; py < h; py += pxSize) {
            const r = Math.random();
            if (r < 0.12) {
              ctx.fillStyle = palette[0];
              ctx.globalAlpha = Math.random() * 0.7 + 0.1;
              ctx.fillRect(px, py, pxSize - 1, pxSize - 1);
            } else if (r < 0.2) {
              ctx.fillStyle = palette[2];
              ctx.globalAlpha = 0.5;
              ctx.fillRect(px, py, pxSize - 1, pxSize - 1);
            }
          }
        }
      } else if (type === 2) {
        const bars = 60;
        const bw = w / bars;
        for (let i = 0; i < bars; i++) {
          const bh = Math.random() * h * 0.65 + h * 0.05;
          ctx.fillStyle = palette[0];
          ctx.globalAlpha = Math.random() * 0.55 + 0.1;
          ctx.fillRect(i * bw, h - bh, bw - 1, bh);
        }
      } else {
        ctx.strokeStyle = palette[0];
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 15; i++) {
          const inset = i * (Math.min(w, h) / 30);
          ctx.globalAlpha = (1 - i / 15) * 0.5;
          ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = palette[0];
        ctx.fillRect(w * 0.3, h * 0.45, w * 0.4, 1);
      }
      ctx.globalAlpha = 1;
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [id, type]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}

interface TrackCardProps {
  num: string;
  label: string;
  title: string;
  meta: string;
  duration: string;
}

function TrackCard({ num, label, title, meta, duration }: TrackCardProps) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [m, s] = duration.split(":").map(Number);
  const totalSec = m * 60 + s;
  const pct = totalSec > 0 ? (elapsed / totalSec) * 100 : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const toggle = () => {
    if (playing) {
      setPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setPlaying(true);
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => (prev + 1 >= totalSec ? 0 : prev + 1));
      }, 1000);
    }
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div
      style={{
        background: "var(--bg)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        transition: "background 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg)")}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "2px", background: "var(--accent)", transform: playing ? "scaleY(1)" : "scaleY(0)", transition: "transform 0.5s ease", transformOrigin: "bottom" }} />
      <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "var(--muted)" }}>{num} — {label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--white)", lineHeight: 1, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: "11px", color: "var(--muted)" }}>{meta}</div>
      <div style={{ height: "2px", background: "var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: "var(--accent)", width: `${pct}%`, transition: "width 0.9s linear" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={toggle}
          style={{
            width: 32, height: 32,
            border: "0.5px solid var(--border)",
            background: playing ? "var(--accent)" : "transparent",
            cursor: "crosshair",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "border-color 0.3s, background 0.3s",
            color: playing ? "#000" : "var(--text)",
          }}
        >
          {playing ? (
            <svg viewBox="0 0 8 12" width="12" height="12" fill="currentColor"><rect x="0" y="0" width="3" height="12"/><rect x="5" y="0" width="3" height="12"/></svg>
          ) : (
            <svg viewBox="0 0 10 12" width="12" height="12" fill="currentColor"><polygon points="0,0 10,6 0,12"/></svg>
          )}
        </button>
        <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "auto" }}>{mm}:{ss}</span>
      </div>
    </div>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setErrors(data.error ?? {});
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "transparent", border: "none", outline: "none",
    color: "var(--text)", fontFamily: "var(--font-body)", fontSize: "13px", width: "100%",
  };

  const S2 = {
    section: { padding: "5rem 2.5rem", borderTop: "0.5px solid var(--border)" } as React.CSSProperties,
  };

  return (
    <section id="contact" style={S2.section}>
      <div className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.01em", textTransform: "uppercase", color: "var(--white)" }}>CONTACT</h2>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.1em", color: "var(--muted)" }}>06 / 06</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
        <div className="reveal">
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.05, color: "var(--white)", fontWeight: 800 }}>
            Booking.<br />Press.<br />Collabs.<br />
            <a href="mailto:gatorpoweraid@email.com" style={{ color: "var(--accent)", textDecoration: "none", display: "block" }}>
              gatorpoweraid<br />@email.com
            </a>
          </p>
        </div>

        <div className="reveal">
          {status === "sent" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1rem" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "var(--accent)" }}>Received.</div>
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Message logged. I'll get back to you as soon as possible.</p>
              <button
                onClick={() => setStatus("idle")}
                style={{ marginTop: "1rem", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", background: "transparent", border: "0.5px solid var(--border)", padding: "0.7rem 1.5rem", cursor: "crosshair", alignSelf: "flex-start", transition: "border-color 0.3s, color 0.3s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
              >
                Send another →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {(["name", "email", "subject"] as const).map((key) => (
                <div key={key} style={{ borderBottom: "0.5px solid var(--border)", display: "flex", flexDirection: "column", padding: "1rem 0" }}>
                  <label style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: errors[key] ? "#c0392b" : "var(--muted)", marginBottom: "0.5rem" }}>
                    {key}{errors[key] ? ` — ${errors[key][0]}` : ""}
                  </label>
                  <input
                    type={key === "email" ? "email" : "text"}
                    value={form[key]}
                    onChange={set(key)}
                    placeholder={key === "email" ? "your@email.com" : key === "subject" ? "Booking / Press / Collab" : "Your name"}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={{ borderBottom: "0.5px solid var(--border)", display: "flex", flexDirection: "column", padding: "1rem 0" }}>
                <label style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: errors.message ? "#c0392b" : "var(--muted)", marginBottom: "0.5rem" }}>
                  message{errors.message ? ` — ${errors.message[0]}` : ""}
                </label>
                <textarea
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Tell me about it."
                  style={{ ...inputStyle, resize: "none", minHeight: "80px" }}
                />
              </div>
              {status === "error" && Object.keys(errors).length === 0 && (
                <p style={{ fontSize: "11px", color: "#c0392b", marginTop: "0.75rem" }}>Something went wrong. Try again or email directly.</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                style={{ marginTop: "2rem", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#000", background: "var(--accent)", border: "none", padding: "0.9rem 2rem", cursor: status === "sending" ? "wait" : "crosshair", alignSelf: "flex-start", transition: "opacity 0.3s", opacity: status === "sending" ? 0.6 : 1 }}
                onMouseEnter={(e) => { if (status !== "sending") e.currentTarget.style.opacity = "0.7"; }}
                onMouseLeave={(e) => { if (status !== "sending") e.currentTarget.style.opacity = "1"; }}
              >
                {status === "sending" ? "Sending…" : "Send Message →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tracks: TrackCardProps[] = [
    { num: "01", label: "NTS Radio", title: "Gatorpower-Aid NTS Mix", meta: "2024 · DJ Set · 58:12", duration: "58:12" },
    { num: "02", label: "Instrumental", title: "Pixel Cascade", meta: "2024 · Production · 6:44", duration: "6:44" },
    { num: "03", label: "Industrial", title: "Greyzone Protocol", meta: "2024 · Production · 5:18", duration: "5:18" },
    { num: "04", label: "Trap", title: "8-Bit Funeral", meta: "2023 · Production · 7:02", duration: "7:02" },
    { num: "05", label: "Techno", title: "Hydra Loop", meta: "2023 · Production · 9:33", duration: "9:33" },
    { num: "06", label: "Ambient", title: "Static Altar", meta: "2023 · Production · 4:55", duration: "4:55" },
  ];

  const gigs = [
    { date: "JUN 14\n2025", name: "VOID COLLECTIVE", location: "Observatory North Park · San Diego, CA", upcoming: true },
    { date: "APR 20\n2025", name: "NTS LIVE STREAM", location: "NTS Radio · Online", upcoming: true },
    { date: "MAR 08\n2025", name: "WRONG FLOOR", location: "Soda Bar · San Diego, CA", upcoming: false },
    { date: "DEC 21\n2024", name: "STATIC MASS", location: "The Casbah · San Diego, CA", upcoming: false },
    { date: "OCT 05\n2024", name: "NTS BROADCAST", location: "NTS Radio · London / Online", upcoming: false },
    { date: "SEP 14\n2024", name: "LOW FREQUENCY", location: "Brick by Brick · San Diego, CA", upcoming: false },
  ];

  const visualTypes = [0, 1, 2, 3, 1, 0];

  const S: Record<string, React.CSSProperties> = {
    nav: {
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "1.25rem 2.5rem",
      borderBottom: navScrolled ? "0.5px solid var(--border)" : "0.5px solid transparent",
      background: navScrolled ? "rgba(8,8,8,0.93)" : "transparent",
      backdropFilter: navScrolled ? "blur(8px)" : "none",
      transition: "border-color 0.4s, background 0.4s",
      fontFamily: "var(--font-body)",
    },
    navLogo: { fontFamily: "var(--font-display)", fontSize: "1.2rem", letterSpacing: "0.04em", color: "var(--white)", textDecoration: "none", fontWeight: 700 },
    navLinks: { display: "flex", gap: "2rem", listStyle: "none" },
    navLink: { fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--muted)", textDecoration: "none" },
    hero: { position: "relative" as const, height: "100vh", display: "flex", flexDirection: "column" as const, justifyContent: "flex-end", padding: "0 2.5rem 4rem", overflow: "hidden" },
    heroContent: { position: "relative", zIndex: 1 },
    heroLabel: { fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: "0.75rem", fontFamily: "var(--font-body)" },
    heroName: { fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 5.8vw, 6.5rem)", lineHeight: 0.9, letterSpacing: "-0.01em", color: "var(--white)", marginBottom: "2rem", fontWeight: 800, whiteSpace: "nowrap" as const },
    section: { padding: "5rem 2.5rem", borderBottom: "0.5px solid var(--border)" },
    sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3rem", paddingBottom: "1rem", borderBottom: "0.5px solid var(--border)" },
    sectionTitle: { fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "0.02em", color: "var(--white)", lineHeight: 1, fontWeight: 800 },
    sectionIndex: { fontSize: "11px", letterSpacing: "0.1em", color: "var(--muted)" },
  };

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={S.nav}>
        <a href="#hero" style={S.navLogo}>GPA</a>
        <ul style={S.navLinks}>
          {["about", "music", "visuals", "gigs", "press", "contact"].map((link) => (
            <li key={link}>
              <a
                href={`#${link}`}
                style={S.navLink}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* HERO */}
      <section id="hero" style={S.hero}>
        <HeroCanvas />
        <div style={S.heroContent}>
          <p style={S.heroLabel}>San Diego, CA — Experimental Electronic</p>
          <h1 style={S.heroName}>
            GATORPOWER<span style={{ color: "var(--accent)" }}>-</span>AID
          </h1>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "0.5px solid var(--border)", paddingTop: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["Industrial", "Left-Field Techno", "Chiptune Trap", "NTS Radio"].map((tag) => (
                <span key={tag} style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>{tag}</span>
              ))}
            </div>
            <a
              href="https://soundcloud.com/diego-macias-509791571"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#000", background: "var(--accent)", border: "none", padding: "0.7rem 1.5rem", cursor: "crosshair", textDecoration: "none", transition: "opacity 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Latest Set ↓
            
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={S.section}>
        <div className="reveal" style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>ABOUT</h2>
          <span style={S.sectionIndex}>01 / 05</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {[
              <><strong style={{ color: "var(--text)" }}>Gatorpower-Aid</strong> is a San Diego-based producer and DJ operating at the edges of electronic music — where industrial texture meets algorithmic rhythm and pixel-era nostalgia collides with club weight.</>,
              <>Known for dense, hyperlinked DJ sets that treat genre as raw material, their mixes have aired on <strong style={{ color: "var(--text)" }}>NTS Radio</strong> and continue to resist easy categorization.</>,
              <>Works are constructed using step sequencers, drum machines, and Ableton — building percussion architectures that feel both broken and inevitable.</>,
              <span style={{ color: "var(--muted)", fontStyle: "italic" }}>Booking and demos via contact form.</span>,
            ].map((p, i) => (
              <p key={i} style={{ color: "var(--muted)", lineHeight: 1.8 }}>{p}</p>
            ))}
          </div>
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "0.5px solid var(--border)" }}>
            {[
              { num: "NTS", label: "Broadcast History" },
              { num: "∞", label: "BPM Range" },
              { num: "SD", label: "Based in San Diego" },
              { num: "4", label: "Genres Destroyed" },
            ].map((stat, i) => (
              <div key={i} style={{ padding: "1.5rem", borderBottom: i < 2 ? "0.5px solid var(--border)" : "none", borderRight: i % 2 === 0 ? "0.5px solid var(--border)" : "none" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", color: "var(--accent)", lineHeight: 1, marginBottom: "0.25rem", fontWeight: 800 }}>{stat.num}</div>
                <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MUSIC */}
      <section id="music" style={S.section}>
        <div className="reveal" style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>MUSIC</h2>
          <span style={S.sectionIndex}>02 / 05</span>
        </div>
        <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1px", background: "var(--border)", border: "0.5px solid var(--border)" }}>
          {tracks.map((t) => <TrackCard key={t.num} {...t} />)}
        </div>

        {/* STREAM EMBEDS */}
        <div className="reveal" style={{ marginTop: "3rem", display: "flex", flexDirection: "column", gap: "1px", border: "0.5px solid var(--border)" }}>

          {/* SoundCloud */}
          <div style={{ background: "var(--surface)", padding: "1.5rem 1.5rem 0" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>
              Stream — SoundCloud
            </div>
            <iframe
              width="100%"
              height="300"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              style={{ display: "block", border: "none" }}
              src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/diego-macias-509791571&color=%239a9a94&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true"
            />
          </div>

          {/* Mixcloud */}
          <div style={{ background: "var(--surface)", padding: "1.5rem 1.5rem 0" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>
              Mixes — Mixcloud
            </div>
            <iframe
              width="100%"
              height="180"
              frameBorder="no"
              style={{ display: "block", border: "none" }}
              src="https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=0&feed=%2FDJParmesancheese%2F&hide_artwork=0&dark=1"
            />
          </div>

          {/* Bandcamp */}
          <a
            href="https://gatorpower-aid.bandcamp.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", display: "block", background: "var(--surface)", padding: "1.5rem", transition: "background 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  Buy / Download — Bandcamp
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--white)", fontWeight: 700 }}>
                  gatorpower-aid.bandcamp.com
                </div>
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}>
                Visit ↗
              </span>
            </div>
          </a>

        </div>
      </section>

      {/* VISUALS */}
      <section id="visuals" style={S.section}>
        <div className="reveal" style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>VISUALS</h2>
          <span style={S.sectionIndex}>03 / 06</span>
        </div>
        <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)" }}>
          {[
            { id: "v1", label: "Live visuals — 2024" },
            { id: "v2", label: "Cover art — Pixel Cascade" },
            { id: "v3", label: "NTS Session" },
            { id: "v4", label: "Greyzone — still" },
            { id: "v5", label: "8-Bit Funeral — art" },
            { id: "v6", label: "Static Altar — render" },
          ].map((v, i) => (
            <div
              key={v.id}
              style={{ aspectRatio: "1", background: "var(--surface)", overflow: "hidden", position: "relative", cursor: "crosshair" }}
              onMouseEnter={(e) => {
                const label = e.currentTarget.querySelector(".v-label") as HTMLElement;
                if (label) label.style.transform = "translateY(0)";
              }}
              onMouseLeave={(e) => {
                const label = e.currentTarget.querySelector(".v-label") as HTMLElement;
                if (label) label.style.transform = "translateY(100%)";
              }}
            >
              <VisualCanvas id={v.id} type={visualTypes[i]} />
              <div
                className="v-label"
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "0.75rem", fontSize: "10px", letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "var(--muted)",
                  background: "linear-gradient(transparent, rgba(8,8,8,0.85))",
                  transform: "translateY(100%)",
                  transition: "transform 0.4s ease",
                }}
              >
                {v.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GIGS */}
      <section id="gigs" style={S.section}>
        <div className="reveal" style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>GIGS</h2>
          <span style={S.sectionIndex}>04 / 06</span>
        </div>
        <div className="reveal" style={{ display: "flex", flexDirection: "column" }}>
          {gigs.map((gig, i) => (
            <div
              key={i}
              style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px", gap: "2rem", alignItems: "center", padding: "1.25rem 0", borderBottom: "0.5px solid var(--border)", borderTop: i === 0 ? "0.5px solid var(--border)" : "none", transition: "padding-left 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.paddingLeft = "0.5rem")}
              onMouseLeave={(e) => (e.currentTarget.style.paddingLeft = "0")}
            >
              <div style={{ fontSize: "11px", letterSpacing: "0.08em", color: "var(--muted)", whiteSpace: "pre-line" }}>{gig.date}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", letterSpacing: "0.02em", color: "var(--white)", fontWeight: 700 }}>{gig.name}</div>
              <div style={{ fontSize: "11px", color: "var(--muted)" }}>{gig.location}</div>
              <div style={{
                fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "0.3rem 0.6rem", border: gig.upcoming ? "0.5px solid var(--accent)" : "0.5px solid var(--border)",
                color: gig.upcoming ? "var(--accent)" : "var(--muted)",
                textAlign: "center",
              }}>
                {gig.upcoming ? "Upcoming" : "Past"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRESS */}
      <section id="press" style={S.section}>
        <div className="reveal" style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>PRESS</h2>
          <span style={S.sectionIndex}>05 / 06</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>

          {/* Left — bio + facts */}
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Short Bio</div>
              <p style={{ color: "var(--text)", lineHeight: 1.8 }}>
                Gatorpower-Aid is a San Diego-based DJ and producer operating at the edges of electronic music. Drawing from industrial texture, algorithmic rhythm, and pixel-era nostalgia, their DJ sets resist easy categorization — blending genres with surgical precision. A regular on NTS Radio, Gatorpower-Aid has built a reputation for dense, hyperlinked sets that treat genre as raw material.
              </p>
            </div>

            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Key Facts</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "0.5px solid var(--border)" }}>
                {[
                  ["Based", "San Diego, CA"],
                  ["Active", "2022 – Present"],
                  ["Genres", "Industrial · Left-Field Techno · Chiptune Trap"],
                  ["Broadcast", "NTS Radio"],
                  ["Tools", "Ableton · Drum Machines · Step Sequencers"],
                  ["Booking", "gatorpoweraid@email.com"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "grid", gridTemplateColumns: "110px 1fr", borderBottom: "0.5px solid var(--border)", padding: "0.75rem 1rem" }}>
                    <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>{k}</span>
                    <span style={{ fontSize: "12px", color: "var(--text)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — links + download */}
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Profiles</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", border: "0.5px solid var(--border)" }}>
                {[
                  { label: "SoundCloud", url: "https://soundcloud.com/diego-macias-509791571", sub: "soundcloud.com/diego-macias-509791571" },
                  { label: "Bandcamp", url: "https://gatorpower-aid.bandcamp.com/", sub: "gatorpower-aid.bandcamp.com" },
                  { label: "Mixcloud", url: "https://www.mixcloud.com/DJParmesancheese/", sub: "mixcloud.com/DJParmesancheese" },
                  { label: "Instagram", url: "https://www.instagram.com/vsuc/", sub: "instagram.com/vsuc" },
                ].map(({ label, url, sub }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.9rem 1rem", background: "var(--surface)", textDecoration: "none", transition: "background 0.25s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
                  >
                    <div>
                      <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.2rem" }}>{label}</div>
                      <div style={{ fontSize: "11px", color: "var(--text)" }}>{sub}</div>
                    </div>
                    <span style={{ color: "var(--accent)", fontSize: "12px" }}>↗</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>One-Pager EPK</div>
              <a
                href="/epk.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 1.5rem", border: "0.5px solid var(--accent)", background: "transparent", textDecoration: "none", transition: "background 0.3s, color 0.3s", cursor: "crosshair" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; (e.currentTarget.querySelector(".epk-label") as HTMLElement).style.color = "#000"; (e.currentTarget.querySelector(".epk-arrow") as HTMLElement).style.color = "#000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; (e.currentTarget.querySelector(".epk-label") as HTMLElement).style.color = "var(--white)"; (e.currentTarget.querySelector(".epk-arrow") as HTMLElement).style.color = "var(--accent)"; }}
              >
                <div>
                  <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.25rem" }}>Download / Print</div>
                  <div className="epk-label" style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--white)", fontWeight: 700, transition: "color 0.3s" }}>
                    Press Kit — One Pager
                  </div>
                </div>
                <span className="epk-arrow" style={{ fontSize: "1.5rem", color: "var(--accent)", transition: "color 0.3s" }}>↗</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* CONTACT */}
      <ContactSection />

      {/* FOOTER */}
      <footer style={{ padding: "2rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--muted)", fontWeight: 700 }}>GATORPOWER-AID</span>
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--muted)" }}>© 2025 — San Diego, CA</span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {[
            { label: "Bandcamp", url: "https://gatorpower-aid.bandcamp.com/" },
            { label: "SoundCloud", url: "https://soundcloud.com/diego-macias-509791571" },
            { label: "Mixcloud", url: "https://www.mixcloud.com/DJParmesancheese/" },
            { label: "Instagram", url: "https://www.instagram.com/vsuc/" },
          ].map(({ label, url }) => (
            <a
              key={label}
              href={url}
              target={url !== "#" ? "_blank" : undefined}
              rel={url !== "#" ? "noopener noreferrer" : undefined}
              style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none", transition: "color 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
