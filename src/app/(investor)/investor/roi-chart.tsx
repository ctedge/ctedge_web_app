"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNGN } from "@/lib/money";

export function ROIChart({ data }: { data: { month: number; value: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tickFormatter={(m) => `M${m}`} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `₦${(v / 1_000_000).toFixed(1)}m`} tick={{ fontSize: 11 }} width={72} />
          <Tooltip formatter={(v) => formatNGN(Number(v))} labelFormatter={(m) => `Month ${m}`} />
          <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} fill="url(#gradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
