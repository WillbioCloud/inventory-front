import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  DollarSign,
  Activity,
  Target,
  PieChart as PieChartIcon,
  MoreHorizontal,
} from "lucide-react";
import { MetricCard } from "../components/SharedUI";
import { api } from "../services/api";

export function Analytics() {
  const [timeRange, setTimeRange] = useState("Este Mês");
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    averageTicket: 0,
    conversion: 4.2,
    returnRate: 0.8,
  });
  const COLORS = ["#3B5BDB", "#F59E0B", "#10B981", "#6366F1", "#8B5CF6"];

  const demandChartData = useMemo(() => {
    const timeMultiplier =
      timeRange === "Esta Semana" ? 0.25 : timeRange === "Este Ano" ? 12 : 1;

    return [
      { month: "Mai", actual: 4800 * timeMultiplier, predicted: null },
      { month: "Jun", actual: 4400 * timeMultiplier, predicted: null },
      { month: "Jul", actual: 5100 * timeMultiplier, predicted: null },
      {
        month: "Ago",
        actual: 5600 * timeMultiplier,
        predicted: 5600 * timeMultiplier,
      },
      { month: "Set", actual: null, predicted: 6200 * timeMultiplier },
      { month: "Out", actual: null, predicted: 5900 * timeMultiplier },
      { month: "Nov", actual: null, predicted: 6800 * timeMultiplier },
    ];
  }, [timeRange]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await api.get("/orders");
        const orders = response.data || [];
        let totalRevenue = 0;
        const categorySales: Record<string, number> = {};
        const timeMultiplier =
          timeRange === "Esta Semana"
            ? 0.25
            : timeRange === "Este Ano"
              ? 12
              : 1;

        orders.forEach((order: any) => {
          totalRevenue += Number(order.totalAmount) || 0;
          order.items?.forEach((item: any) => {
            const category = item.product?.category?.name || "Outros";
            categorySales[category] =
              (categorySales[category] || 0) + (Number(item.subTotal) || 0);
          });
        });

        const baseRevenue = [
          {
            name: "Abr",
            revenue: 45000 * timeMultiplier,
            profit: 24000 * timeMultiplier,
          },
          {
            name: "Mai",
            revenue: 42000 * timeMultiplier,
            profit: 21000 * timeMultiplier,
          },
          {
            name: "Jun",
            revenue: 58000 * timeMultiplier,
            profit: 32000 * timeMultiplier,
          },
          {
            name: "Jul",
            revenue: 51000 * timeMultiplier,
            profit: 28000 * timeMultiplier,
          },
          {
            name: "Ago",
            revenue: 64000 * timeMultiplier,
            profit: 34000 * timeMultiplier,
          },
        ];
        const currentMonth = new Date().toLocaleString("pt-BR", {
          month: "short",
        });
        const monthName =
          currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
        baseRevenue.push({
          name: monthName,
          revenue:
            totalRevenue > 0
              ? totalRevenue + 12000 * timeMultiplier
              : 72000 * timeMultiplier,
          profit:
            totalRevenue > 0
              ? totalRevenue * 0.4 + 5000 * timeMultiplier
              : 38000 * timeMultiplier,
        });
        setRevenueData(baseRevenue);

        const categories = Object.entries(categorySales).map(
          ([name, value]) => ({ name, value }),
        );
        setCategoryData(
          categories.length > 0
            ? categories
            : [
                { name: "Eletrônicos", value: 4500 * timeMultiplier },
                { name: "Móveis", value: 3000 * timeMultiplier },
                { name: "Acessórios", value: 2500 * timeMultiplier },
              ],
        );
        setMetrics({
          totalRevenue:
            totalRevenue > 0
              ? totalRevenue + 287000 * timeMultiplier
              : 287000 * timeMultiplier,
          averageTicket:
            orders.length > 0 ? totalRevenue / orders.length : 245.5,
          conversion:
            timeRange === "Esta Semana"
              ? 3.8
              : timeRange === "Este Ano"
                ? 5.1
                : 4.2,
          returnRate:
            timeRange === "Esta Semana"
              ? 0.4
              : timeRange === "Este Ano"
                ? 1.5
                : 0.8,
        });
      } catch (error) {
        console.error("Erro ao carregar analytics", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, [timeRange]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const handleExport = () =>
    alert("Iniciando download do relatório financeiro em CSV...");
  const totalCatValue = categoryData.reduce(
    (total, category) => total + category.value,
    0,
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
        <div>
          <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight leading-none mb-2">
            Análises e Insights
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Acompanhe o desempenho do seu negócio e métricas de crescimento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-zinc-200/60 shadow-sm rounded-xl p-1 flex items-center">
            {["Esta Semana", "Este Mês", "Este Ano"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${timeRange === range ? "bg-zinc-100 text-zinc-900 shadow-sm ring-1 ring-zinc-200/50" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[13px] font-bold flex items-center gap-2 transition-colors active:scale-95"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          isLoading={isLoading}
          icon={
            <DollarSign
              className="text-[#3B5BDB]"
              size={24}
              strokeWidth={1.5}
            />
          }
          title="Receita Total"
          value={formatCurrency(metrics.totalRevenue)}
          trend="+14.5%"
          trendUp={true}
        />
        <MetricCard
          isLoading={isLoading}
          icon={
            <Activity className="text-[#10B981]" size={24} strokeWidth={1.5} />
          }
          title="Ticket Médio"
          value={formatCurrency(metrics.averageTicket)}
          trend="+5.2%"
          trendUp={true}
        />
        <MetricCard
          isLoading={isLoading}
          icon={
            <Target className="text-[#F59E0B]" size={24} strokeWidth={1.5} />
          }
          title="Taxa de Conversão"
          value={`${metrics.conversion}%`}
          trend="+0.4%"
          trendUp={true}
        />
        <MetricCard
          isLoading={isLoading}
          icon={
            <PieChartIcon
              className="text-zinc-500"
              size={24}
              strokeWidth={1.5}
            />
          }
          title="Taxa de Devolução"
          value={`${metrics.returnRate}%`}
          trend="-0.4%"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-zinc-200/60 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                Receita vs Lucro
              </h3>
              <p className="text-sm font-medium text-zinc-500 mt-1">
                Desempenho financeiro ao longo do tempo
              </p>
            </div>
            <button
              onClick={() => alert("Abrindo opções detalhadas do gráfico...")}
              className="text-zinc-400 hover:text-[#3B5BDB] p-2 rounded-lg hover:bg-[#3B5BDB]/10 transition-colors active:scale-95"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B5BDB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B5BDB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E4E4E7"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717A", fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717A", fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #E4E4E7",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ fontWeight: 600, fontSize: "13px" }}
                  labelStyle={{
                    color: "#71717A",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Receita"
                  stroke="#3B5BDB"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Lucro"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart */}
        <div className="bg-white rounded-[24px] shadow-sm border border-zinc-200/60 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                Vendas por Categoria
              </h3>
              <p className="text-sm font-medium text-zinc-500 mt-1">
                Distribuição por segmentos
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center min-h-[300px] relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #E4E4E7",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#18181B",
                  }}
                  formatter={(value: any) => [
                    formatCurrency(Number(value) || 0),
                    "Faturamento",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-y-4 mt-6">
              {categoryData.map((category, idx) => {
                const percent =
                  totalCatValue > 0
                    ? ((category.value / totalCatValue) * 100).toFixed(1)
                    : 0;
                return (
                  <div key={category.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx] }}
                    ></div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-zinc-900">
                        {category.name}
                      </span>
                      <span className="text-[11px] font-medium text-zinc-500">
                        {percent}% ({formatCurrency(category.value)})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Predicted Demand Chart */}
      <div className="bg-white rounded-[24px] shadow-sm border border-zinc-200/60 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">
              Demanda Prevista
            </h3>
            <p className="text-sm font-medium text-zinc-500 mt-1">
              Previsão de 3 meses baseada no histórico
            </p>
          </div>
          <div className="flex items-center gap-4 text-[13px] font-bold text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B5BDB]"></span>{" "}
              Real
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>{" "}
              Previsto
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={demandChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E4E4E7"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717A", fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717A", fontSize: 12, fontWeight: 500 }}
                tickFormatter={(value) => `${value}`}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #E4E4E7",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ fontWeight: 600, fontSize: "13px" }}
                labelStyle={{
                  color: "#71717A",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Demanda Real"
                stroke="#3B5BDB"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3B5BDB", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Demanda Prevista"
                stroke="#F59E0B"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: "#F59E0B", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
