"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── Scroll-fade observer hook ─── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-6");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      className={cn(
        "opacity-0 translate-y-6 transition-all duration-700 ease-out",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─── SVG Illustrations ─── */

function AiChatbotSvg() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="h-28 w-28">
      <defs>
        <linearGradient id="gc1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Chat bubble */}
      <rect x="10" y="20" width="80" height="50" rx="14" fill="url(#gc1)" opacity="0.15" />
      <rect x="10" y="20" width="80" height="50" rx="14" stroke="url(#gc1)" strokeWidth="2" fill="none" />
      {/* Tail */}
      <path d="M30 70 L24 82 L42 70" fill="url(#gc1)" opacity="0.15" />
      <path d="M30 70 L24 82 L42 70" stroke="url(#gc1)" strokeWidth="2" fill="none" />
      {/* Sparkle */}
      <circle cx="90" cy="18" r="3" fill="#ec4899" />
      <path d="M90 10 L90 26 M82 18 L98 18" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="102" cy="30" r="2" fill="#6366f1" />
      <path d="M102 25 L102 35 M97 30 L107 30" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Text lines */}
      <rect x="24" y="34" width="36" height="4" rx="2" fill="#6366f1" opacity="0.5" />
      <rect x="24" y="43" width="52" height="4" rx="2" fill="#6366f1" opacity="0.35" />
      <rect x="24" y="52" width="28" height="4" rx="2" fill="#6366f1" opacity="0.25" />
    </svg>
  );
}

function LiveChatSvg() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="h-28 w-28">
      <defs>
        <linearGradient id="gc2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Bot bubble */}
      <rect x="5" y="15" width="50" height="32" rx="10" fill="#6366f1" opacity="0.15" />
      <rect x="5" y="15" width="50" height="32" rx="10" stroke="#6366f1" strokeWidth="2" fill="none" />
      <circle cx="22" cy="31" r="4" fill="#6366f1" opacity="0.4" />
      <rect x="30" y="27" width="18" height="3" rx="1.5" fill="#6366f1" opacity="0.4" />
      <rect x="30" y="33" width="12" height="3" rx="1.5" fill="#6366f1" opacity="0.3" />
      {/* Arrow */}
      <path d="M58 45 L72 55" stroke="url(#gc2)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M67 52 L73 56 L66 58" stroke="url(#gc2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Person bubble */}
      <rect x="65" y="50" width="50" height="32" rx="10" fill="#ec4899" opacity="0.15" />
      <rect x="65" y="50" width="50" height="32" rx="10" stroke="#ec4899" strokeWidth="2" fill="none" />
      {/* Person icon */}
      <circle cx="82" cy="63" r="4" fill="#ec4899" opacity="0.4" />
      <path d="M76 74 a6 5 0 0 1 12 0" fill="#ec4899" opacity="0.3" />
      <rect x="90" y="62" width="18" height="3" rx="1.5" fill="#ec4899" opacity="0.4" />
      <rect x="90" y="68" width="12" height="3" rx="1.5" fill="#ec4899" opacity="0.3" />
    </svg>
  );
}

function InsightsSvg() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="h-28 w-28">
      <defs>
        <linearGradient id="gc3" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Bars */}
      <rect x="15" y="60" width="14" height="25" rx="4" fill="url(#gc3)" opacity="0.3" />
      <rect x="35" y="40" width="14" height="45" rx="4" fill="url(#gc3)" opacity="0.5" />
      <rect x="55" y="25" width="14" height="60" rx="4" fill="url(#gc3)" opacity="0.7" />
      <rect x="75" y="45" width="14" height="40" rx="4" fill="url(#gc3)" opacity="0.5" />
      {/* Clock */}
      <circle cx="102" cy="22" r="12" stroke="#6366f1" strokeWidth="2" fill="#6366f1" opacity="0.1" />
      <circle cx="102" cy="22" r="12" stroke="#6366f1" strokeWidth="2" fill="none" />
      <path d="M102 16 L102 22 L107 25" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
      {/* Baseline */}
      <line x1="10" y1="88" x2="95" y2="88" stroke="#6366f1" strokeWidth="1.5" opacity="0.3" />
    </svg>
  );
}

function ReportingSvg() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="h-28 w-28">
      <defs>
        <linearGradient id="gc4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Dashboard frame */}
      <rect x="10" y="10" width="100" height="75" rx="10" fill="url(#gc4)" opacity="0.08" />
      <rect x="10" y="10" width="100" height="75" rx="10" stroke="url(#gc4)" strokeWidth="2" fill="none" />
      {/* Top bar */}
      <rect x="10" y="10" width="100" height="16" rx="10" fill="url(#gc4)" opacity="0.12" />
      <circle cx="24" cy="18" r="3" fill="#6366f1" opacity="0.4" />
      <circle cx="34" cy="18" r="3" fill="#ec4899" opacity="0.4" />
      {/* Line graph */}
      <polyline points="22,55 38,45 52,52 68,38 82,42 98,32" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="22,55 38,45 52,52 68,38 82,42 98,32 98,72 22,72" fill="#6366f1" opacity="0.08" />
      {/* Metric boxes */}
      <rect x="22" y="62" width="22" height="14" rx="3" fill="#ec4899" opacity="0.15" />
      <rect x="50" y="62" width="22" height="14" rx="3" fill="#6366f1" opacity="0.15" />
      <rect x="78" y="62" width="22" height="14" rx="3" fill="#ec4899" opacity="0.15" />
    </svg>
  );
}

function BrandingSvg() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="h-28 w-28">
      <defs>
        <linearGradient id="gc5" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Palette shape */}
      <path
        d="M60 15 C30 15 10 35 10 55 C10 75 30 88 55 88 C60 88 63 84 63 80 C63 76 60 73 60 69 C60 62 66 58 74 58 L80 58 C98 58 110 46 110 32 C110 20 88 15 60 15Z"
        fill="url(#gc5)"
        opacity="0.1"
        stroke="url(#gc5)"
        strokeWidth="2"
      />
      {/* Color dots */}
      <circle cx="42" cy="38" r="7" fill="#6366f1" opacity="0.7" />
      <circle cx="62" cy="32" r="7" fill="#ec4899" opacity="0.7" />
      <circle cx="82" cy="38" r="7" fill="#8b5cf6" opacity="0.7" />
      <circle cx="34" cy="58" r="7" fill="#a78bfa" opacity="0.7" />
      <circle cx="52" cy="62" r="5" fill="#f472b6" opacity="0.5" />
    </svg>
  );
}

function IntegrationSvg() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="h-28 w-28">
      <defs>
        <linearGradient id="gc6" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Code block */}
      <rect x="10" y="15" width="100" height="65" rx="10" fill="url(#gc6)" opacity="0.08" />
      <rect x="10" y="15" width="100" height="65" rx="10" stroke="url(#gc6)" strokeWidth="2" fill="none" />
      {/* Window dots */}
      <circle cx="24" cy="26" r="3" fill="#ec4899" opacity="0.5" />
      <circle cx="34" cy="26" r="3" fill="#6366f1" opacity="0.4" />
      <circle cx="44" cy="26" r="3" fill="#a78bfa" opacity="0.3" />
      {/* Code lines */}
      <text x="20" y="48" fontFamily="monospace" fontSize="9" fill="#6366f1" opacity="0.7">&lt;script&gt;</text>
      <rect x="28" y="53" width="60" height="4" rx="2" fill="#ec4899" opacity="0.3" />
      <text x="20" y="70" fontFamily="monospace" fontSize="9" fill="#6366f1" opacity="0.7">&lt;/script&gt;</text>
    </svg>
  );
}

function LeadsSvg() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="h-28 w-28">
      <defs>
        <linearGradient id="gc7" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Envelope body */}
      <rect x="15" y="30" width="75" height="50" rx="8" fill="url(#gc7)" opacity="0.12" />
      <rect x="15" y="30" width="75" height="50" rx="8" stroke="url(#gc7)" strokeWidth="2" fill="none" />
      {/* Envelope flap */}
      <path d="M15 36 L52 58 L90 36" stroke="url(#gc7)" strokeWidth="2" fill="none" strokeLinejoin="round" />
      {/* Plus circle */}
      <circle cx="95" cy="28" r="16" fill="#ec4899" opacity="0.15" stroke="#ec4899" strokeWidth="2" />
      <path d="M95 21 L95 35 M88 28 L102 28" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Feature section data ─── */
const features = [
  {
    title: "AI-chatbot som faktisk forstår bedriften din",
    value: "Spar timer daglig på repetitive spørsmål",
    details:
      "Tren chatboten med din egen kunnskapsbase, og den svarer basert på din informasjon. Når den ikke vet svaret, faller den elegant tilbake til kontaktinfo — ingen frustrerte kunder.",
    Illustration: AiChatbotSvg,
    flip: false,
  },
  {
    title: "Live chat — når mennesker trengs",
    value: "Sømløs overgang fra AI til menneske",
    details:
      "Automatisk handoff når kunden trenger en ekte person. Komplett med kø-system, typing-indikatorer og hurtigsvar — så agentene dine jobber effektivt.",
    Illustration: LiveChatSvg,
    flip: true,
  },
  {
    title: "Innsikt i kundehenvendelser",
    value: "Forstå hva kundene lurer på — dag for dag, time for time",
    details:
      "Se mest stilte spørsmål, ubesvarte henvendelser og peak-tider. Se om mandager kl 10 er rush-hour, eller om fredager er stille — og planlegg ressursene deretter.",
    Illustration: InsightsSvg,
    flip: false,
  },
  {
    title: "Rapportering og statistikk",
    value: "Mål effekten av chatboten din",
    details:
      "Følg med på antall samtaler, svarprosent, gjennomsnittlig responstid og leads generert. Alt du trenger for å vise ROI til sjefen.",
    Illustration: ReportingSvg,
    flip: true,
  },
  {
    title: "Tilpasset ditt brand",
    value: "Chatboten ser ut som en del av nettsiden din",
    details:
      "Velg farger, last opp logo, tilpass velkomstmelding og språk. Kundene dine merker ikke at det er et eksternt verktøy.",
    Illustration: BrandingSvg,
    flip: false,
  },
  {
    title: "Enkel integrasjon",
    value: "Klar på 5 minutter",
    details:
      "Embed chatboten med én enkel kodelinje. Fungerer på alle nettsider — WordPress, Shopify, Squarespace, eller din egen kode.",
    Illustration: IntegrationSvg,
    flip: true,
  },
  {
    title: "Leads-fangst",
    value: "Fang opp interesserte kunder automatisk",
    details:
      "Når AI-en ikke kan svare, samler den inn e-post fra kunden — så du får en ny lead rett i dashboardet. Ingen henvendelse går tapt.",
    Illustration: LeadsSvg,
    flip: false,
  },
];

/* ─── Main page component ─── */
export function FeaturesPage(): React.ReactNode {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
          <div className="absolute -bottom-20 right-1/4 h-[300px] w-[500px] rounded-full bg-accent/5 blur-3xl dark:bg-accent/10" />
        </div>

        <FadeIn className="relative z-10 mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Alt du trenger for{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              smartere kundeservice
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Spar tid, få bedre innsikt og gi kundene dine svar — på sekunder, ikke timer. ChatPulse samler alt du trenger i én enkel løsning.
          </p>

          <div className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Kom i gang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto"
              )}
            >
              Se priser
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ─── Feature sections ─── */}
      {features.map((f, i) => (
        <section
          key={f.title}
          className={cn(
            "border-t px-4 py-16 sm:px-6 sm:py-24",
            i % 2 === 0 ? "bg-card/50 dark:bg-card/20" : ""
          )}
        >
          <FadeIn className="mx-auto max-w-5xl">
            <div
              className={cn(
                "flex flex-col items-center gap-10 md:flex-row md:gap-16",
                f.flip ? "md:flex-row-reverse" : ""
              )}
            >
              {/* Illustration */}
              <div className="flex shrink-0 items-center justify-center">
                <div className="flex h-44 w-44 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10">
                  <f.Illustration />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {f.value}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  {f.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {f.details}
                </p>
              </div>
            </div>
          </FadeIn>
        </section>
      ))}

      {/* ─── Bottom CTA ─── */}
      <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-28">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        <FadeIn className="relative z-10 mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Klar til å spare tid på kundeservice?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
            Se hva ChatPulse kan gjøre for din bedrift.
          </p>

          <div className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full bg-white text-primary hover:bg-white/90 sm:w-auto"
              )}
            >
              Kom i gang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
              )}
            >
              Se priser
            </Link>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
