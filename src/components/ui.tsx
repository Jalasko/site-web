import Link from "next/link";
import type { ReactNode } from "react";
import { cn, countryName, formatDate, ROLE_COLORS, TIER_COLORS } from "@/lib/utils";
import type { Team, Tier } from "@/lib/types";
import { ArrowIcon } from "./Icons";

export function PageHeader({ kicker, title, description, children }: { kicker?: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 skew-x-[-18deg] bg-accent/5" />
      <div className="container-x relative py-12 md:py-16">
        {kicker && <p className="label mb-3 text-accent">{kicker}</p>}
        <h1 className="h-display text-5xl md:text-7xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-muted md:text-lg">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHeading({ title, kicker, href, linkLabel = "Tout voir", className }: { title: string; kicker?: string; href?: string; linkLabel?: string; className?: string }) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div>
        {kicker && <p className="label mb-1 text-accent">{kicker}</p>}
        <h2 className="h-display text-3xl md:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group flex shrink-0 items-center gap-1 text-sm font-semibold uppercase tracking-wider text-muted transition hover:text-accent">
          {linkLabel}
          <ArrowIcon width={16} height={16} className="transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export function Flag({ code, className }: { code: string; className?: string }) {
  const c = code.toLowerCase();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${c}.png`}
      srcSet={`https://flagcdn.com/w80/${c}.png 2x`}
      alt={countryName(code)}
      title={countryName(code)}
      width={20}
      height={15}
      loading="lazy"
      className={cn("inline-block h-[15px] w-5 object-cover", className)}
    />
  );
}

export function TeamBadge({ team, size = 40, className }: { team?: Team; size?: number; className?: string }) {
  if (!team) {
    return (
      <span className={cn("clip-corner inline-flex items-center justify-center bg-surface-2 font-display text-muted", className)} style={{ width: size, height: size, fontSize: size * 0.35 }}>
        ?
      </span>
    );
  }
  if (team.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={team.logo} alt={team.name} width={size} height={size} className={cn("object-contain", className)} />;
  }
  return (
    <span
      className={cn("clip-corner inline-flex shrink-0 items-center justify-center font-display tracking-wider text-white", className)}
      style={{ width: size, height: size, fontSize: size * (team.tag.length > 3 ? 0.28 : 0.38), background: `linear-gradient(135deg, ${team.color}, #0F1923 140%)` }}
      aria-label={team.name}
      title={team.name}
    >
      {team.tag}
    </span>
  );
}

export function TeamName({ slug, teams, withBadge = true }: { slug: string; teams: Record<string, Team>; withBadge?: boolean }) {
  const t = teams[slug];
  if (slug === "TBD") return <span className="text-muted">À déterminer</span>;
  const name = t?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const inner = (
    <span className="inline-flex items-center gap-2">
      {withBadge && <TeamBadge team={t} size={24} />}
      <span>{name}</span>
    </span>
  );
  return t ? (
    <Link href={`/esport/equipes/${t.slug}`} className="transition hover:text-accent">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function PlayerAvatar({ ign, photo, color = "#FF4655", size = 96, className }: { ign: string; photo?: string; color?: string; size?: number; className?: string }) {
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={ign} width={size} height={size} className={cn("object-cover", className)} />;
  }
  return (
    <span
      className={cn("relative inline-flex items-center justify-center overflow-hidden font-display text-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.42, background: `linear-gradient(150deg, ${color} 0%, #0F1923 85%)` }}
      aria-hidden
    >
      <span className="absolute -left-1/4 top-0 h-full w-1/2 skew-x-[-20deg] bg-white/10" />
      <span className="relative">{ign.slice(0, 2).toUpperCase()}</span>
    </span>
  );
}

export function RoleBadge({ role, icon }: { role: string; icon?: string }) {
  const color = ROLE_COLORS[role] ?? "#7F8C99";
  return (
    <span className="chip" style={{ borderColor: `${color}66`, color }}>
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" width={12} height={12} className="h-3 w-3 dark:invert-0 invert" />
      ) : (
        <span className="h-1.5 w-1.5" style={{ background: color }} />
      )}
      {role}
    </span>
  );
}

export function TierBadge({ tier, size = "md" }: { tier: Tier; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-6 w-6 text-base", md: "h-9 w-9 text-xl", lg: "h-14 w-14 text-4xl" }[size];
  return (
    <span className={cn("clip-corner inline-flex shrink-0 items-center justify-center font-display text-white", s)} style={{ background: TIER_COLORS[tier] }}>
      {tier}
    </span>
  );
}

export function StatTile({ label, value, sub, highlight }: { label: string; value: ReactNode; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn("card clip-corner p-4", highlight && "border-accent/50")}>
      <p className="label">{label}</p>
      <p className={cn("mt-1 font-display text-3xl", highlight && "text-accent")}>{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function RateBar({ value, max = 100, color = "#FF4655", label, showValue = true }: { value: number; max?: number; color?: string; label?: string; showValue?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="w-24 shrink-0 truncate text-sm">{label}</span>}
      <div className="h-2 flex-1 bg-surface-2">
        <div className="h-full transition-all duration-700" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
      </div>
      {showValue && <span className="w-14 shrink-0 text-right text-sm tabular-nums">{value.toFixed(1).replace(".", ",")} %</span>}
    </div>
  );
}

export function UpdatedAt({ date, label = "Dernière mise à jour" }: { date: string; label?: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-xs text-muted">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
      {label} : <time dateTime={date}>{formatDate(date)}</time>
    </p>
  );
}

export function ApiUnavailable({ what }: { what: string }) {
  return (
    <div className="card clip-corner p-8 text-center">
      <p className="h-display text-2xl">Données indisponibles</p>
      <p className="mt-2 text-sm text-muted">
        Impossible de charger {what} depuis valorant-api.com pour le moment. La page sera régénérée automatiquement — réessayez dans quelques minutes.
      </p>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="border border-dashed border-line p-8 text-center text-sm text-muted">{children}</div>;
}
