import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import sealImg from "@/assets/seal.png";

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

type Stage = "idle" | "press" | "seal" | "flap" | "letter" | "exit";

function Letter() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("idle");

  const open = () => {
    if (stage !== "idle") return;
    setStage("press");
    // chain the cinematic sequence
    setTimeout(() => setStage("seal"), 220);
    setTimeout(() => setStage("flap"), 900);
    setTimeout(() => setStage("letter"), 1700);
    setTimeout(() => setStage("exit"), 2900);
    setTimeout(() => navigate({ to: "/convite" }), 3500);
  };

  const opening = stage !== "idle";
  const sealGone = stage === "seal" || stage === "flap" || stage === "letter" || stage === "exit";
  const flapOpen = stage === "flap" || stage === "letter" || stage === "exit";
  const letterOut = stage === "letter" || stage === "exit";

  return (
    <main
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-6"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.92 0.022 82) 0%, oklch(0.84 0.028 78) 70%, oklch(0.78 0.03 70) 100%)",
      }}
    >
      {/* soft glow that intensifies as the letter opens */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: letterOut ? 1 : 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(1 0 0 / 0.55), transparent 55%)",
        }}
      />

      <motion.div
        animate={
          stage === "exit"
            ? { scale: 1.35, opacity: 0 }
            : stage === "press"
              ? { scale: 0.98 }
              : { scale: 1, opacity: 1 }
        }
        transition={{ duration: stage === "exit" ? 0.6 : 0.25, ease: "easeOut" }}
        className="relative"
        style={{ perspective: 1400 }}
      >
        {/* Inner letter that slides up from the envelope */}
        <motion.div
          className="absolute left-1/2 bottom-[40%] w-[260px] sm:w-[320px] h-[200px] sm:h-[240px] -translate-x-1/2 origin-bottom rounded-sm"
          initial={{ y: 40, opacity: 0 }}
          animate={
            letterOut
              ? { y: -180, opacity: 1 }
              : flapOpen
                ? { y: -20, opacity: 1 }
                : { y: 40, opacity: 0 }
          }
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background:
              "repeating-linear-gradient(0deg, oklch(0.97 0.015 85) 0px, oklch(0.955 0.018 85) 2px, oklch(0.97 0.015 85) 4px)",
            boxShadow:
              "0 18px 40px -10px oklch(0.3 0.05 50 / 0.35), 0 2px 0 oklch(0.85 0.03 75) inset",
            zIndex: 1,
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p
              className="text-3xl sm:text-4xl text-primary"
              style={{ fontFamily: "var(--font-script)" }}
            >
              Aline &amp; Alan
            </p>
            <div className="mt-2 h-px w-16 bg-primary/40" />
            <p
              className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.35em] text-primary/70"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              10 · Abril
            </p>
          </div>
        </motion.div>

        {/* Envelope */}
        <button
          onClick={open}
          aria-label="Abrir convite"
          disabled={opening}
          className="relative block outline-none cursor-pointer"
          style={{ width: 320, height: 220 }}
        >
          {/* envelope body */}
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              background:
                "linear-gradient(160deg, oklch(0.82 0.035 78) 0%, oklch(0.76 0.04 72) 100%)",
              boxShadow:
                "0 24px 60px -18px oklch(0.3 0.05 50 / 0.45), inset 0 0 0 1px oklch(0.6 0.05 60 / 0.25)",
              zIndex: 2,
            }}
          />

          {/* front pocket triangles (V shape) */}
          <svg
            viewBox="0 0 320 220"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 3 }}
            aria-hidden
          >
            <path
              d="M0 220 L160 120 L320 220 Z"
              fill="oklch(0.78 0.04 74)"
              stroke="oklch(0.55 0.05 55 / 0.35)"
              strokeWidth="0.8"
            />
            <path
              d="M0 0 L160 110 L0 110 Z"
              fill="oklch(0.8 0.04 76)"
              opacity="0.6"
            />
            <path
              d="M320 0 L160 110 L320 110 Z"
              fill="oklch(0.8 0.04 76)"
              opacity="0.6"
            />
          </svg>

          {/* top flap — rotates open */}
          <motion.div
            className="absolute left-0 right-0 top-0 origin-top"
            animate={{ rotateX: flapOpen ? -178 : 0 }}
            transition={{ duration: 0.95, ease: [0.7, 0, 0.3, 1] }}
            style={{
              height: 130,
              transformStyle: "preserve-3d",
              zIndex: flapOpen ? 1 : 4,
            }}
          >
            <svg
              viewBox="0 0 320 130"
              className="w-full h-full"
              style={{ filter: flapOpen ? "drop-shadow(0 8px 12px oklch(0.3 0.05 50 / 0.25))" : undefined }}
              aria-hidden
            >
              <path
                d="M0 0 L320 0 L160 120 Z"
                fill="oklch(0.84 0.035 78)"
                stroke="oklch(0.55 0.05 55 / 0.35)"
                strokeWidth="0.8"
              />
            </svg>
          </motion.div>

          {/* Wax seal — sits over the flap closing line */}
          <AnimatePresence>
            {!sealGone && (
              <motion.div
                key="seal"
                className="absolute left-1/2 top-[105px] -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: 5 }}
                initial={{ opacity: 1, scale: 1 }}
                animate={
                  stage === "press"
                    ? { scale: 0.92 }
                    : { scale: 1, opacity: 1 }
                }
                exit={{
                  scale: 1.25,
                  opacity: 0,
                  rotate: 18,
                  y: 14,
                  transition: { duration: 0.55, ease: "easeOut" },
                }}
              >
                <div className="animate-seal-pulse">
                  <Seal />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* "clique para abrir" */}
          <AnimatePresence>
            {!opening && (
              <motion.svg
                key="cta"
                viewBox="0 0 300 80"
                className="absolute left-1/2 -translate-x-1/2 -bottom-16 w-64 select-none"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                aria-hidden
              >
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
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        {/* particles when seal breaks */}
        <AnimatePresence>
          {stage === "seal" && (
            <div
              className="pointer-events-none absolute left-1/2 top-[105px] -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 6 }}
            >
              {Array.from({ length: 10 }).map((_, i) => {
                const angle = (i / 10) * Math.PI * 2;
                const dist = 60 + Math.random() * 30;
                return (
                  <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(angle) * dist,
                      y: Math.sin(angle) * dist + 20,
                      opacity: 0,
                      scale: 0.4,
                    }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="absolute block w-1.5 h-1.5 rounded-full"
                    style={{ background: "oklch(0.55 0.11 45)" }}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

function Seal() {
  return (
    <img
      src={sealImg}
      alt="Selo de cera A&A"
      width={130}
      height={130}
      draggable={false}
      className="w-[130px] h-[130px] sm:w-[140px] sm:h-[140px] select-none transition-transform duration-300 hover:scale-110"
      style={{
        filter:
          "drop-shadow(0 6px 10px oklch(0.3 0.05 40 / 0.45)) drop-shadow(0 2px 2px oklch(0.3 0.05 40 / 0.35))",
      }}
    />
  );
}
