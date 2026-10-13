"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Couleurs de séries validées (contraste + daltonisme) en thème clair et sombre. */
export const SERIES = ["#FF4655", "#4C8DFF"];

const tooltipStyle = {
  background: "rgb(var(--c-surface))",
  border: "1px solid rgb(var(--c-line))",
  borderRadius: 0,
  color: "rgb(var(--c-fg))",
  fontSize: 12,
};

export interface RadarDatum {
  stat: string;
  [series: string]: number | string;
}

/**
 * Radar de comparaison : les valeurs sont normalisées (0-100) pour partager un
 * seul axe ; les valeurs brutes sont affichées dans l'infobulle.
 */
export function RadarCompare({ data, series, raw }: { data: RadarDatum[]; series: string[]; raw: Record<string, Record<string, string>> }) {
  return (
    <div className="h-[360px] w-full text-muted">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="currentColor" strokeOpacity={0.25} />
          <PolarAngleAxis dataKey="stat" tick={{ fill: "currentColor", fontSize: 12 }} />
          {series.map((s, i) => (
            <Radar key={s} name={s} dataKey={s} stroke={SERIES[i]} strokeWidth={2} fill={SERIES[i]} fillOpacity={0.18} dot={{ r: 4, fill: SERIES[i], strokeWidth: 0 }} isAnimationActive />
          ))}
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(_v, name, item) => [raw[String(name)]?.[(item.payload as RadarDatum).stat] ?? "", name]}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} formatter={(value) => <span style={{ color: "rgb(var(--c-fg))" }}>{value}</span>} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBarChart({ data, unit = "%", height = 280, color = SERIES[0], valueLabel = "Valeur" }: { data: { label: string; value: number; color?: string }[]; unit?: string; height?: number; color?: string; valueLabel?: string }) {
  return (
    <div className="w-full text-muted" style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }} barCategoryGap="18%">
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.15} />
          <XAxis dataKey="label" tick={{ fill: "currentColor", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={{ fill: "currentColor", fontSize: 11 }} axisLine={false} tickLine={false} unit={unit === "%" ? " %" : ""} />
          <Tooltip
            cursor={{ fill: "currentColor", fillOpacity: 0.08 }}
            contentStyle={tooltipStyle}
            formatter={(v) => [`${Number(v).toLocaleString("fr-FR")}${unit === "%" ? " %" : unit ? ` ${unit}` : ""}`, valueLabel]}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.color ?? color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
