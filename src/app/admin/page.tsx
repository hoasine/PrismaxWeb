import { SpotlightIntake } from "@/components/SpotlightIntake";

export default function AdminPage() {
  return (
    <div className="min-h-full">
      <header className="border-b border-[rgba(180,140,255,0.12)] px-[clamp(1.25rem,4vw,3.5rem)] py-4">
        <a href="/" className="text-sm text-muted transition hover:text-fg">
          ← Back to Hall of Honor
        </a>
      </header>
      <SpotlightIntake />
    </div>
  );
}
