"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReportSnapshot } from "@/lib/types";

export function SnapshotCharts({
  snapshot,
  dimensions,
}: {
  snapshot: ReportSnapshot;
  dimensions: { key: string; label: string }[];
}) {
  const dimensionData = dimensions.map((d) => ({
    name: d.label,
    score: snapshot.dimension_averages[d.key] ?? 0,
  }));
  const distributionData = [0, 1, 2, 3, 4].map((level) => ({
    name: `L${level}`,
    count: snapshot.maturity_distribution[`L${level}`] ?? 0,
  }));

  const tick = { fontSize: 11, fill: "var(--muted-foreground)" };
  const tooltipStyle = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
    boxShadow: "0 2px 8px rgb(0 0 0 / 0.06)",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dimension scores</CardTitle>
          <CardDescription>Organization average, 0–4 scale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dimensionData} margin={{ top: 4, right: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="name"
                  tick={tick}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                  height={56}
                  stroke="var(--border)"
                />
                <YAxis
                  domain={[0, 4]}
                  ticks={[0, 1, 2, 3, 4]}
                  width={24}
                  tick={tick}
                  stroke="var(--border)"
                />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
                <Bar
                  dataKey="score"
                  fill="var(--teal)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maturity distribution</CardTitle>
          <CardDescription>Participants at each agentic level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 4, right: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis dataKey="name" tick={tick} stroke="var(--border)" />
                <YAxis
                  allowDecimals={false}
                  width={24}
                  tick={tick}
                  stroke="var(--border)"
                />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
                <Bar
                  dataKey="count"
                  fill="var(--foreground)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={56}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
