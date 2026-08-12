"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { HonorExplorer } from "@/components/HonorExplorer";
import { PrismaXLogo } from "@/components/PrismaXLogo";
import { SpecRoi } from "@/components/SpecRoi";
import { XAvatar } from "@/components/XAvatar";

const McapPreview = dynamic(
  () => import("@/components/McapPreview").then((m) => m.McapPreview),
  {
    ssr: false,
    loading: () => (
      <section className="px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.75rem,6vw,4.5rem)]">
        <div className="mx-auto max-w-[78rem]">
          <p className="text-sm text-muted">Loading MCAP Preview…</p>
        </div>
      </section>
    ),
  },
);

const MediaStudio = dynamic(
  () => import("@/components/MediaStudio").then((m) => m.MediaStudio),
  {
    ssr: false,
    loading: () => (
      <section className="px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.75rem,6vw,4.5rem)]">
        <div className="mx-auto max-w-[78rem]">
          <p className="text-sm text-muted">Loading Media Studio…</p>
        </div>
      </section>
    ),
  },
);
import {
  rewardRules,
  siteCopy,
  teamProfiles,
} from "@/data/spotlights";
import {
  DEFAULT_SITE_NAV,
  resolveSiteNavId,
  siteNav,
  toolSections,
  type SiteNavId,
} from "@/lib/siteNav";

function NavLink({
  id,
  label,
  active,
  onSelect,
}: {
  id: SiteNavId;
  label: string;
  active: boolean;
  onSelect: (id: SiteNavId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-current={active ? "page" : undefined}
      className={`rounded-[var(--radius-pill)] px-3.5 py-2 text-[0.82rem] font-medium transition ${
        active
          ? "bg-[rgba(155,106,246,0.22)] text-fg"
          : "text-muted hover:bg-[rgba(180,140,255,0.1)] hover:text-fg"
      }`}
    >
      {label}
    </button>
  );
}

function ToolPanel({
  tool,
}: {
  tool: (typeof toolSections)[number];
}) {
  return (
    <section className="px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.75rem,6vw,4.5rem)]">
      <div className="mx-auto max-w-[78rem]">
        <div className="max-w-2xl">
          <p className="m-0 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-purple">
            {tool.eyebrow}
          </p>
          <h2
            className="mt-2.5 text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {tool.title}
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
            {tool.description}
          </p>
        </div>

        <div className="tool-scaffold mt-8">
          <ul className="grid gap-3 sm:grid-cols-3">
            {tool.bullets.map((bullet) => (
              <li key={bullet} className="brand-card !p-4 text-sm leading-relaxed text-muted">
                {bullet}
              </li>
            ))}
          </ul>
          <div className="tool-scaffold-panel mt-5">
            <p
              className="text-[1.15rem] font-semibold text-fg"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Coming next
            </p>
            <p className="mt-2 max-w-xl text-sm text-muted">
              This tool scaffold is in progress — pick it again from the nav when the build continues.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AppShell() {
  const [activeId, setActiveId] = useState<SiteNavId>(DEFAULT_SITE_NAV);

  /** Instant jump past the hero — keeps landing intact, skips slow smooth scroll. */
  const jumpToWorkspace = () => {
    const el = document.getElementById("workspace");
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    if (!el) {
      window.scrollTo(0, 0);
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo(0, Math.max(0, top));
    }
    root.style.scrollBehavior = prev;
  };

  const selectPanel = (id: SiteNavId) => {
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
    requestAnimationFrame(jumpToWorkspace);
  };

  const goHome = () => {
    setActiveId(DEFAULT_SITE_NAV);
    window.history.replaceState(null, "", window.location.pathname);
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = prev;
  };

  useEffect(() => {
    const applyHash = (scroll: boolean) => {
      const hash = window.location.hash.replace("#", "");
      setActiveId(resolveSiteNavId(hash));
      if (scroll && hash) {
        requestAnimationFrame(jumpToWorkspace);
      }
    };
    applyHash(true);
    const onHash = () => applyHash(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  let panel: ReactNode = null;
  if (activeId === "vinh-danh") {
    panel = (
      <>
        <HonorExplorer />
        <section
          id="nominate"
          className="section-alt px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(3rem,7vw,5rem)]"
        >
          <div className="mx-auto grid max-w-[78rem] gap-10 lg:grid-cols-2">
            <div>
              <p className="m-0 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-purple">
                How recognition works
              </p>
              <h2
                className="mt-2.5 text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                Reward rules
              </h2>
              <ol className="mt-8 space-y-4">
                {rewardRules.map((rule, i) => (
                  <li key={rule} className="flex gap-4">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(180,140,255,0.22)] bg-[rgba(180,140,255,0.14)] text-[0.74rem] font-semibold text-[#d2c0ff]">
                      {i + 1}
                    </span>
                    <p className="text-[0.95rem] leading-relaxed text-muted">{rule}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="cta-band flex flex-col justify-center text-left lg:text-center">
              <p className="m-0 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-purple">
                Get recognized
              </p>
              <h3
                className="mt-3 text-[clamp(1.5rem,3vw,2.1rem)] font-semibold tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                Nominate a contributor
              </h3>
              <p className="mx-auto mt-3.5 max-w-[34rem] text-[0.95rem] text-[rgba(244,242,250,0.82)]">
                Know a strong Teleop or Validation post? Submit through the official showcase
                form.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 lg:justify-center">
                <a
                  href="https://forms.gle/EZCKpz5NGBfb3fa86"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-lg"
                >
                  Showcase form
                </a>
                <a
                  href="https://discord.com/invite/prismaxai"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-lg"
                >
                  Discord
                </a>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  } else if (activeId === "spec-roi") {
    panel = <SpecRoi />;
  } else if (activeId === "mcap-preview") {
    panel = <McapPreview />;
  } else if (activeId === "media-studio") {
    panel = <MediaStudio />;
  } else {
    const tool = toolSections.find((t) => t.id === activeId);
    if (tool) panel = <ToolPanel tool={tool} />;
  }

  return (
    <div className="min-h-full">
      <header className="site-nav">
        <div className="mx-auto flex w-full max-w-[78rem] items-center gap-4 px-[clamp(1.25rem,4vw,3.5rem)] py-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              goHome();
            }}
            className="prismax-logo-link"
          >
            <PrismaXLogo />
          </a>

          <nav className="ml-2 hidden flex-1 items-center justify-center gap-1 lg:flex">
            {siteNav.map((item) => (
              <NavLink
                key={item.id}
                id={item.id}
                label={item.label}
                active={activeId === item.id}
                onSelect={selectPanel}
              />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <a
              href="https://app.prismax.ai/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-brand btn-nav-cta"
            >
              Open app
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <path d="M3 8h9" />
                <path d="M8.5 3.5 13 8l-4.5 4.5" />
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-[rgba(180,140,255,0.08)] px-[clamp(1.25rem,4vw,3.5rem)] py-2 lg:hidden">
          <div className="mx-auto flex max-w-[78rem] gap-2 overflow-x-auto pb-1">
            {siteNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectPanel(item.id)}
                className={`badge-pill shrink-0 !py-1.5 whitespace-nowrap ${
                  activeId === item.id ? "!border-[rgba(180,140,255,0.45)] !bg-[rgba(155,106,246,0.2)]" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-[clamp(1.25rem,4vw,3.5rem)] pb-10 pt-[clamp(3rem,8vw,5.5rem)] text-center">
          <span className="hero-orb hero-orb-a" aria-hidden />
          <span className="hero-orb hero-orb-b" aria-hidden />

          <div className="relative z-[1] mx-auto max-w-[78rem]">
            <p
              className="rise text-[clamp(1.6rem,4vw,2.4rem)] font-semibold tracking-[-0.03em] text-fg"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              PrismaX{" "}
              <span className="text-gradient">{siteCopy.name}</span>
            </p>

            <h1
              className="rise rise-d1 mx-auto mt-5 max-w-[16ch] text-[clamp(2.5rem,6vw,4.2rem)] font-semibold leading-[1.05] tracking-[-0.035em]"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              People behind the{" "}
              <span className="text-gradient">spotlights</span>
            </h1>

            <p className="rise rise-d2 mx-auto mt-5 max-w-[28rem] text-[1.05rem] leading-relaxed text-muted">
              {siteCopy.heroSupport}
            </p>

            <div className="honor-wall rise rise-d3 mx-auto mt-10">
              {teamProfiles.map((member) => (
                <a
                  key={member.handle}
                  href={member.url}
                  target="_blank"
                  rel="noreferrer"
                  className="honor-wall-avatar"
                  title={`${member.name} · ${member.role} · ${member.handle}`}
                >
                  <XAvatar handle={member.handle} name={member.name} size={64} ring />
                </a>
              ))}
            </div>
            <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted">
              PrismaX team on X
            </p>

            <div className="rise rise-d3 mt-10">
              <button
                type="button"
                className="btn btn-brand btn-lg"
                onClick={() => selectPanel("vinh-danh")}
              >
                Explore Hall of Honor
              </button>
            </div>
          </div>
        </section>

        <div id="workspace" className="scroll-mt-24">
          {panel}
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-[78rem] flex-col gap-4 border-t border-[rgba(180,140,255,0.08)] px-[clamp(1.25rem,4vw,3.5rem)] py-8 text-[0.85rem] text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <span>{siteCopy.name} · PrismaX community</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.82rem]">
            <a
              href={siteCopy.contact.xUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted transition hover:text-fg"
            >
              X · {siteCopy.contact.xHandle}
            </a>
            <span className="text-muted">
              Discord · <span className="text-fg">{siteCopy.contact.discord}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {siteNav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectPanel(item.id)}
              className={`rounded-[var(--radius-pill)] px-2.5 py-1 transition ${
                activeId === item.id ? "text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </footer>
      <p className="mx-auto max-w-[78rem] px-[clamp(1.25rem,4vw,3.5rem)] pb-8 text-xs text-muted">
        {siteCopy.disclaimer}{" "}
        <a href="/admin" className="text-muted underline-offset-2 hover:text-fg hover:underline">
          Spotlight intake
        </a>
      </p>
    </div>
  );
}
