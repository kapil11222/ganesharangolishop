import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Play, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const BADGES = [
  "Ready to Use",
  "Reusable",
  "Premium Quality",
  "Easy to Apply",
  "A4 & A3 Sizes",
  "Pan India Delivery",
];

const RANGOLI_IMAGE =
  "https://images.unsplash.com/photo-1604595287233-3da3fb05fc15?w=1200&q=80&auto=format&fit=crop";

/** Golden sparkles floating around the rangoli */
function Sparkle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.span
      aria-hidden
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background:
          "radial-gradient(circle, oklch(0.92 0.16 85) 0%, oklch(0.86 0.18 70 / 0.6) 40%, transparent 70%)",
        filter: "blur(0.5px)",
        willChange: "transform, opacity",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [0, -20, -40],
      }}
      transition={{ duration: 3.5, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

/** Slow drifting flower petal */
function Petal({ delay, x, hue }: { delay: number; x: number; hue: number }) {
  return (
    <motion.span
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: "-5%",
        fontSize: 18,
        willChange: "transform, opacity",
        color: `oklch(0.75 0.18 ${hue})`,
      }}
      initial={{ y: -30, opacity: 0, rotate: 0 }}
      animate={{
        y: ["-5%", "110%"],
        x: [0, 30, -20, 15, 0],
        opacity: [0, 1, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 14 + (delay % 6),
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
    >
      ✿
    </motion.span>
  );
}

export function RangoliShowcase() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Mouse tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 15 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 15 });

  // Lazy-load decorative assets only when the section is close to viewport
  useEffect(() => {
    if (!wrapRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setIsVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        delay: (i * 0.35) % 4,
        x: 8 + Math.random() * 84,
        y: 8 + Math.random() * 84,
        size: 4 + Math.random() * 8,
      })),
    [],
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        delay: i * 1.4,
        x: (i * 11 + 5) % 95,
        hue: [30, 45, 60, 20, 350][i % 5],
      })),
    [],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(px);
    my.set(py);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      ref={wrapRef}
      aria-label="Premium Ready-to-Use Rangoli showcase"
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 700px at 50% 40%, oklch(0.98 0.02 80) 0%, oklch(1 0 0) 55%, oklch(0.99 0.01 80) 100%)",
      }}
    >
      {/* Decorative background rays */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, transparent 0deg, oklch(0.94 0.08 80 / 0.25) 60deg, transparent 120deg, oklch(0.94 0.08 80 / 0.2) 200deg, transparent 260deg, oklch(0.94 0.08 80 / 0.22) 320deg, transparent 360deg)",
          filter: "blur(60px)",
        }}
      />

      <div className="container-luxe relative z-10 grid lg:grid-cols-2 gap-10 items-center py-16 md:py-24">
        {/* LEFT: copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur border border-secondary/30 px-4 py-1.5 text-xs font-medium shadow-sm">
            <Sparkles className="size-3.5 text-secondary" />
            <span className="text-muted-foreground">Hand-crafted in India · 10,000+ homes</span>
          </div>

          <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
            Premium{" "}
            <span className="gradient-text">Ready-to-Use</span>
            <br />
            Rangoli
          </h1>

          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
            Beautiful festive Rangoli designs that are easy to place, reusable, and
            perfect for every celebration.
          </p>

          {/* Feature badges */}
          <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl">
            {BADGES.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
                className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-border px-3 py-1.5 text-xs font-medium shadow-sm"
              >
                <span className="grid place-items-center size-4 rounded-full gradient-festive text-white shrink-0">
                  <Check className="size-2.5" strokeWidth={3.5} />
                </span>
                <span className="truncate">{b}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/shop">
              <Button
                size="lg"
                className="h-13 px-8 rounded-full gradient-festive border-0 shadow-glow text-base font-semibold"
              >
                Shop Now <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-8 rounded-full text-base font-semibold bg-white/70 backdrop-blur"
              >
                <Play className="mr-2 size-4 fill-current" /> Watch Demo
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* RIGHT: 3D rangoli showcase */}
        <motion.div
          className="relative w-full max-w-[560px] mx-auto aspect-square"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ perspective: 1200 }}
        >
          {/* Petals layer */}
          {isVisible && !reduce && (
            <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
              {petals.map((p) => (
                <Petal key={p.id} delay={p.delay} x={p.x} hue={p.hue} />
              ))}
            </div>
          )}

          {/* Golden glow */}
          <div
            aria-hidden
            className="absolute inset-6 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.9 0.19 80 / 0.55) 0%, oklch(0.85 0.2 65 / 0.35) 40%, transparent 72%)",
              filter: "blur(30px)",
            }}
          />

          {/* Soft blurred halo */}
          <motion.div
            aria-hidden
            className="absolute inset-10 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.95 0.14 75 / 0.7), transparent 65%)",
              filter: "blur(40px)",
            }}
            animate={reduce ? undefined : { opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Rotating decorative rings */}
          <motion.div
            aria-hidden
            className="absolute inset-4 rounded-full border-2 border-dashed pointer-events-none"
            style={{ borderColor: "oklch(0.85 0.16 80 / 0.5)" }}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-14 rounded-full border pointer-events-none"
            style={{ borderColor: "oklch(0.7 0.2 45 / 0.35)" }}
            animate={reduce ? undefined : { rotate: -360 }}
            transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
          />

          {/* Sparkles */}
          {isVisible && !reduce && (
            <div aria-hidden className="absolute inset-0 pointer-events-none">
              {sparkles.map((s) => (
                <Sparkle key={s.id} delay={s.delay} x={s.x} y={s.y} size={s.size} />
              ))}
            </div>
          )}

          {/* The rangoli itself: tilt + float + rotate */}
          <motion.div
            className="absolute inset-0 grid place-items-center"
            style={{
              rotateX: reduce ? 0 : rx,
              rotateY: reduce ? 0 : ry,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <motion.div
              className="relative w-[78%] h-[78%]"
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              style={{ willChange: "transform" }}
            >
              {/* Circular ground shadow */}
              <div
                aria-hidden
                className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-[70%] h-6 rounded-[50%] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, oklch(0.2 0.02 60 / 0.35), transparent 70%)",
                  filter: "blur(10px)",
                }}
              />

              <motion.div
                className="relative w-full h-full rounded-full overflow-hidden"
                style={{
                  boxShadow:
                    "0 20px 60px -10px oklch(0.7 0.2 45 / 0.35), 0 0 0 6px oklch(1 0 0 / 0.9), 0 0 0 8px oklch(0.86 0.18 75 / 0.6), 0 0 60px oklch(0.86 0.2 70 / 0.5)",
                  willChange: "transform",
                }}
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              >
                <img
                  src={RANGOLI_IMAGE}
                  alt="Premium hand-crafted Ganesha Rangoli"
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
                {/* premium light sweep */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none mix-blend-overlay"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 25%, oklch(1 0 0 / 0.6), transparent 40%)",
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Glassmorphism info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 w-[88%] max-w-sm"
          >
            <div
              className="rounded-2xl px-4 py-3 border border-white/60 shadow-xl flex items-center gap-3"
              style={{
                background: "oklch(1 0 0 / 0.55)",
                backdropFilter: "blur(16px) saturate(140%)",
              }}
            >
              <div className="size-10 rounded-full gradient-festive grid place-items-center shrink-0 shadow-glow">
                <Sparkles className="size-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Premium Collection
                </div>
                <div className="font-display font-bold text-sm leading-tight truncate">
                  Reusable · A4 & A3 · Pan-India Delivery
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
