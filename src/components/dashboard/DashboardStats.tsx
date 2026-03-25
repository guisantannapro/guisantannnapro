import { useMemo } from "react";
import { Users, Crown, Flame, Dumbbell, AlertTriangle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Profile {
  id: string;
  full_name: string | null;
  plan: string | null;
  plan_expires_at: string | null;
  plan_duration: string | null;
}

interface ClientData {
  plan?: string | null;
  profile?: Profile;
}

interface DashboardStatsProps {
  clients: ClientData[];
  getClientStatus: (profile?: Profile) => "expired" | "expiring" | "active" | null;
}

const planConfig: Record<string, { label: string; color: string }> = {
  base: { label: "Base", color: "hsl(43, 74%, 49%)" },
  transformacao: { label: "Transformação", color: "hsl(25, 95%, 53%)" },
  elite: { label: "Elite", color: "hsl(0, 84%, 60%)" },
};

const DashboardStats = ({ clients, getClientStatus }: DashboardStatsProps) => {
  const stats = useMemo(() => {
    const planCounts: Record<string, number> = { base: 0, transformacao: 0, elite: 0 };
    let expiring = 0;
    let expired = 0;

    clients.forEach((c) => {
      const plan = c.plan || c.profile?.plan;
      if (plan && plan in planCounts) planCounts[plan]++;
      const status = getClientStatus(c.profile);
      if (status === "expiring") expiring++;
      if (status === "expired") expired++;
    });
    return { planCounts, expiring, expired };
  }, [clients, getClientStatus]);

  const chartData = useMemo(() => {
    return Object.entries(planConfig).map(([key, config]) => ({
      name: config.label,
      value: stats.planCounts[key] || 0,
      color: config.color,
    })).filter((d) => d.value > 0);
  }, [stats]);

  const cards = [
    { label: "Total de Clientes", value: clients.length, icon: Users },
    { label: "Plano Base", value: stats.planCounts.base, icon: Dumbbell },
    { label: "Transformação", value: stats.planCounts.transformacao, icon: Flame },
    { label: "Elite", value: stats.planCounts.elite, icon: Crown },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Alert banners */}
      {(stats.expiring > 0 || stats.expired > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {stats.expiring > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 flex-1">
              <Clock className="w-4 h-4 text-yellow-600 shrink-0" />
              <span className="text-sm text-yellow-600 font-medium">
                {stats.expiring} cliente{stats.expiring > 1 ? "s" : ""} com plano vencendo em até 7 dias
              </span>
            </div>
          )}
          {stats.expired > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/10 flex-1">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <span className="text-sm text-destructive font-medium">
                {stats.expired} cliente{stats.expired > 1 ? "s" : ""} com plano vencido
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center gap-2"
            >
              <card.icon className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{card.value}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {card.label}
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Distribuição por Plano
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 8%)",
                    border: "1px solid hsl(0, 0%, 15%)",
                    borderRadius: "8px",
                    color: "hsl(0, 0%, 95%)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-8">Sem dados</p>
          )}
          <div className="flex gap-4 mt-2">
            {Object.entries(planConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
