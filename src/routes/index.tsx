import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aline & Alan — Convite de Casamento" },
      { name: "description", content: "Convidamos você para celebrar nosso casamento — 10 de Abril." },
      { property: "og:title", content: "Aline & Alan — Convite de Casamento" },
      { property: "og:description", content: "Clique para abrir nosso convite." },
    ],
  }),
  component: Letter,
});

function Letter() {
  const navigate = useNavigate();
  const [opening, setOpening] = useState(false);

  const open = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => navigate({ to: "/convite" }), 900);
  };

  return (
    <main
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-6"
      style={{
        background:
          "linear-gradient(100deg, oklch(0.86 0.025 80) 0%, oklch(0.86 0.025 80) 49%, oklch(0.9 0.022 82) 50%, oklch(0.9 0.022 82) 100%)",
      }}
    >
      <motion.button
        onClick={open}
        aria-label="Abrir convite"
        initial={{ opacity: 0, y: 20 }}
        animate={
          opening
            ? { scale: 8, opacity: 0, rotate: 12 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: opening ? 0.9 : 1.2, ease: "easeInOut" }}
        className="group relative flex flex-col items-center cursor-pointer outline-none"
      >
        <div className="animate-seal-pulse transition-transform duration-500 group-hover:scale-110">
          <Seal />
        </div>

        <svg viewBox="0 0 300 80" className="w-64 mt-3 select-none" aria-hidden>
          <defs>
            <path id="curve" d="M 30,20 Q 150,90 270,20" fill="transparent" />
          </defs>
          <text
            fill="oklch(0.38 0.07 45)"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "20px", letterSpacing: "1px" }}
          >
            <textPath href="#curve" startOffset="50%" textAnchor="middle">
              clique para abrir
            </textPath>
          </text>
        </svg>
      </motion.button>
    </main>
  );
}

function Seal() {
  return (
    <svg width="180" height="180" viewBox="0 0 200 200" aria-hidden>
      <defs>
        <radialGradient id="wax" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="oklch(0.78 0.1 60)" />
          <stop offset="55%" stopColor="oklch(0.62 0.11 50)" />
          <stop offset="100%" stopColor="oklch(0.42 0.09 40)" />
        </radialGradient>
      </defs>
      {/* irregular wax blob */}
      <path
        d="M100 12
           C 130 10, 160 28, 172 52
           C 188 70, 192 110, 172 138
           C 162 164, 130 188, 100 186
           C 66 192, 38 168, 26 142
           C 8 118, 10 80, 28 56
           C 42 28, 70 14, 100 12 Z"
        fill="url(#wax)"
      />
      {/* inner ring */}
      <circle cx="100" cy="100" r="62" fill="none" stroke="oklch(0.45 0.08 45 / 0.5)" strokeWidth="1.5" />
      {/* botanical emboss */}
      <g
        stroke="oklch(0.4 0.08 42 / 0.65)"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M100 140 L100 75" />
        <path d="M100 95 C 90 88, 80 86, 72 90" />
        <path d="M100 105 C 110 98, 120 96, 128 100" />
        <path d="M100 115 C 92 110, 84 110, 78 114" />
        <circle cx="68" cy="88" r="2.5" fill="oklch(0.4 0.08 42 / 0.6)" />
        <circle cx="132" cy="98" r="2.5" fill="oklch(0.4 0.08 42 / 0.6)" />
        <circle cx="74" cy="112" r="2.5" fill="oklch(0.4 0.08 42 / 0.6)" />
        <circle cx="100" cy="72" r="3" fill="oklch(0.4 0.08 42 / 0.6)" />
      </g>
    </svg>
  );
}
