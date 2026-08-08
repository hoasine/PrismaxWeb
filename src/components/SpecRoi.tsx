"use client";

import { useMemo, useState } from "react";
import {
  estimatePaybackDays,
  formatDays,
  formatUsd,
  robotSpecs,
  roiDefaults,
  type RobotSpec,
} from "@/data/robots";

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted">{label}</p>
      <p
        className="mt-1 text-[1.15rem] font-semibold text-fg"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[0.75rem] text-muted">{hint}</p>}
    </div>
  );
}

function RobotCard({
  robot,
  selected,
  onSelect,
  payback,
}: {
  robot: RobotSpec;
  selected: boolean;
  onSelect: () => void;
  payback: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`brand-card w-full !p-5 text-left transition ${
        selected
          ? "!border-[rgba(180,140,255,0.45)] !bg-[rgba(155,106,246,0.12)]"
          : "hover:!border-[rgba(180,140,255,0.3)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-purple">
            {robot.maker}
          </p>
          <h3
            className="mt-1 text-[1.35rem] font-semibold text-fg"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {robot.name}
          </h3>
        </div>
        <span className="badge-pill !border-[rgba(120,200,140,0.35)] !bg-[rgba(60,160,90,0.14)] !py-1 !text-[0.68rem] !text-[#9ef0b4]">
          Validated
        </span>
      </div>
      <div className="robot-fleet-thumb mt-3 overflow-hidden rounded-[var(--radius-sm)] border border-[rgba(180,140,255,0.12)]">
        <img
          src={robot.image}
          alt={robot.name}
          className="mx-auto h-[140px] w-full object-contain p-2"
        />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{robot.tagline}</p>
      <p className="mt-1 font-mono text-[0.72rem] text-[#d2c0ff]">
        {formatUsd(robot.priceUsd)} · {robot.earningsNote}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="DOF" value={robot.dofLabel} />
        <Metric label="Payload" value={`${robot.payloadKg} kg`} />
        <Metric label="Data rate" value={`${robot.episodesPerHour}/hr`} hint="est. episodes" />
        <Metric label="Payback" value={payback} hint="with current inputs" />
      </div>
    </button>
  );
}

export function SpecRoi() {
  const [selectedId, setSelectedId] = useState(robotSpecs[0]?.id ?? "piper");
  const [hoursPerDay, setHoursPerDay] = useState(roiDefaults.hoursPerDay);
  const [rewardUsdPerHour, setRewardUsdPerHour] = useState(roiDefaults.rewardUsdPerHour);
  const [daysPerWeek, setDaysPerWeek] = useState(roiDefaults.daysPerWeek);

  const selected = robotSpecs.find((r) => r.id === selectedId) ?? robotSpecs[0];

  const rows = useMemo(() => {
    return [
      {
        key: "price",
        label: "Price (USD)",
        values: robotSpecs.map((r) => formatUsd(r.priceUsd)),
      },
      {
        key: "dof",
        label: "Degrees of freedom",
        values: robotSpecs.map((r) => r.dofLabel),
      },
      {
        key: "payload",
        label: "Payload",
        values: robotSpecs.map((r) => `${r.payloadKg} kg`),
      },
      {
        key: "reach",
        label: "Reach",
        values: robotSpecs.map((r) => `${r.reachMm} mm`),
      },
      {
        key: "weight",
        label: "Arm weight",
        values: robotSpecs.map((r) => `${r.weightKg} kg`),
      },
      {
        key: "form",
        label: "Form factor",
        values: robotSpecs.map((r) => r.formFactor),
      },
      {
        key: "rate",
        label: "Data / hour (est.)",
        values: robotSpecs.map((r) => `${r.episodesPerHour} episodes`),
      },
      {
        key: "throughput",
        label: "Reward throughput",
        values: robotSpecs.map((r) => `${r.rewardThroughput.toFixed(2)}×`),
      },
      {
        key: "setup",
        label: "Setup complexity",
        values: robotSpecs.map((r) => r.setup),
      },
      {
        key: "payback",
        label: "Payback (est.)",
        values: robotSpecs.map((r) =>
          formatDays(
            estimatePaybackDays(r, hoursPerDay, rewardUsdPerHour, daysPerWeek),
          ),
        ),
      },
    ];
  }, [hoursPerDay, rewardUsdPerHour, daysPerWeek]);

  if (!selected) return null;

  const selectedPayback = estimatePaybackDays(
    selected,
    hoursPerDay,
    rewardUsdPerHour,
    daysPerWeek,
  );
  const dailyEarn = hoursPerDay * rewardUsdPerHour * selected.rewardThroughput;
  const weeklyEarn = dailyEarn * daysPerWeek;

  return (
    <section className="px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.75rem,6vw,4.5rem)]">
      <div className="mx-auto max-w-[78rem]">
        <div className="max-w-2xl">
          <p className="m-0 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-purple">
            Robot decision desk
          </p>
          <h2
            className="mt-2.5 text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Spec & ROI
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
            Compare Piper (Agilex), TOK2 (Airbot), and YAM (I2RT) — three PrismaX-validated
            models — by price, DOF, payload, data collection rate, and payback time using a
            reward-points USD proxy.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {robotSpecs.map((robot) => (
            <RobotCard
              key={robot.id}
              robot={robot}
              selected={robot.id === selected.id}
              onSelect={() => setSelectedId(robot.id)}
              payback={formatDays(
                estimatePaybackDays(robot, hoursPerDay, rewardUsdPerHour, daysPerWeek),
              )}
            />
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="brand-card !overflow-x-auto !p-0">
            <table className="spec-table w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr>
                  <th>Spec</th>
                  {robotSpecs.map((r) => (
                    <th key={r.id} className={r.id === selected.id ? "is-active" : ""}>
                      {r.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    {row.values.map((value, i) => (
                      <td
                        key={`${row.key}-${robotSpecs[i]?.id}`}
                        className={robotSpecs[i]?.id === selected.id ? "is-active" : ""}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="brand-card !p-5 md:!p-6">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-purple">
              ROI calculator · {selected.name}
            </p>
            <p className="mt-2 text-sm text-muted">{selected.bestFor}</p>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-[0.72rem] font-medium uppercase tracking-[0.1em] text-muted">
                Hours / day collecting
              </span>
              <input
                type="range"
                min={1}
                max={12}
                step={0.5}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full accent-[var(--purple-deep)]"
              />
              <span className="mt-1 block font-mono text-sm text-fg">{hoursPerDay}h</span>
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-[0.72rem] font-medium uppercase tracking-[0.1em] text-muted">
                Reward value / hour (USD proxy)
              </span>
              <input
                type="range"
                min={15}
                max={80}
                step={1}
                value={rewardUsdPerHour}
                onChange={(e) => setRewardUsdPerHour(Number(e.target.value))}
                className="w-full accent-[var(--purple-deep)]"
              />
              <span className="mt-1 block font-mono text-sm text-fg">
                {formatUsd(rewardUsdPerHour)}/hr · ×{selected.rewardThroughput} throughput
              </span>
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-[0.72rem] font-medium uppercase tracking-[0.1em] text-muted">
                Active days / week
              </span>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full accent-[var(--purple-deep)]"
              />
              <span className="mt-1 block font-mono text-sm text-fg">{daysPerWeek} days</span>
            </label>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[rgba(180,140,255,0.12)] pt-5">
              <Metric label="Effective / day" value={formatUsd(dailyEarn)} />
              <Metric label="Effective / week" value={formatUsd(weeklyEarn)} />
              <Metric
                label="Capex"
                value={formatUsd(selected.priceUsd)}
                hint={selected.priceNote}
              />
              <Metric
                label="Est. payback"
                value={formatDays(selectedPayback)}
                hint="calendar time"
              />
            </div>

            <p className="mt-5 text-[0.78rem] leading-relaxed text-muted">
              PrismaX does not publish a fixed reward-to-USD rate. This calculator uses USD/hour
              as a proxy (community whitepapers have cited ~$30–50/hr for premium data) × a
              form-factor throughput multiplier. Planning only — not an earnings guarantee.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {robotSpecs.map((robot) => (
            <article key={`detail-${robot.id}`} className="brand-card !p-5">
              <h3
                className="text-[1.1rem] font-semibold text-fg"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                {robot.name} notes
              </h3>
              <p className="mt-2 text-sm text-muted">{robot.payloadNote}</p>
              <p className="mt-2 text-sm text-muted">{robot.priceNote}</p>
              <ul className="mt-3 space-y-1.5">
                {robot.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[0.82rem] text-[#d2c0ff] hover:text-pink"
                    >
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
