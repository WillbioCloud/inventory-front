import { useState, useEffect, useRef } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronDown,
  Box,
  Layers,
  PackageX,
  MessageSquare,
  MapPin,
  Maximize2,
  Minus,
  Settings2,
  Loader2,
} from "lucide-react";
import { api } from "../services/api";

// Imports do Modal do Shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- COMPONENTES MENORES (Layout/UI) ---

const MetricCard = ({ icon, title, value, trend, trendUp }: any) => (
  <div className="bg-white rounded-3xl p-5 flex items-center gap-5 shadow-sm border border-zinc-200/60 flex-1 min-w-[260px]">
    <div className="w-14 h-14 rounded-[18px] border border-zinc-100 flex items-center justify-center bg-zinc-50 shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <div className="text-[13px] font-semibold text-zinc-500 mb-1 tracking-wide">
        {title}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-[28px] font-bold text-zinc-900 tracking-tight leading-none">
          {value}
        </span>
        <span
          className={`text-[13px] font-bold flex items-center ${trendUp ? "text-emerald-500" : "text-red-500"}`}
        >
          {trendUp ? (
            <ArrowUpRight size={14} className="mr-0.5" strokeWidth={2.5} />
          ) : (
            <ArrowDownRight size={14} className="mr-0.5" strokeWidth={2.5} />
          )}
          {trend}
        </span>
      </div>
    </div>
  </div>
);

const ColumnDropdown = ({ columns, visibleCols, setVisibleCols }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:text-zinc-900 transition-colors"
      >
        <Settings2 size={16} />
        Personalizar Colunas
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200/80 rounded-xl shadow-lg z-[50] py-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2 border-b border-zinc-100 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Alternar Colunas
            </span>
          </div>
          <div className="max-h-[300px] overflow-y-auto no-scrollbar">
            {columns.map((col: any) => (
              <label
                key={col.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visibleCols[col.id]}
                  onChange={() =>
                    setVisibleCols({
                      ...visibleCols,
                      [col.id]: !visibleCols[col.id],
                    })
                  }
                  className="w-4 h-4 rounded border-zinc-300 text-[#3B5BDB] focus:ring-[#3B5BDB] transition-all"
                />
                <span className="text-[13px] font-medium text-zinc-700 select-none">
                  {col.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- SEÇÕES PRINCIPAIS DO DASHBOARD ---

const HeaderSection = () => {
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    lowStock: 0,
    totalValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [prodRes, lowStockRes, valueRes] = await Promise.all([
          api.get("/products"),
          api.get("/products/low-stock"),
          api.get("/products/total-value"),
        ]);

        const totalQtd = prodRes.data.reduce(
          (acc: number, item: any) => acc + (item.quantity || 0),
          0,
        );

        setMetrics({
          totalItems: totalQtd,
          lowStock: lowStockRes.data.length,
          totalValue: valueRes.data || 0,
        });
      } catch (error) {
        console.error("Erro ao carregar métricas", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(metrics.totalValue);

  return (
    <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6 pt-2">
      <div>
        <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight leading-none mb-2">
          Visão Geral
        </h1>
        <p className="text-zinc-500 text-sm font-medium">
          Insights em tempo real do seu negócio
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full 2xl:w-auto">
        <MetricCard
          icon={<Box className="text-zinc-700" size={24} strokeWidth={1.5} />}
          title="Total de Itens em Estoque"
          value={isLoading ? "..." : metrics.totalItems}
          trend="Atualizado"
          trendUp={true}
        />
        <MetricCard
          icon={
            <Layers className="text-zinc-700" size={24} strokeWidth={1.5} />
          }
          title="Alertas de Baixo Estoque"
          value={isLoading ? "..." : metrics.lowStock}
          trend="Abaixo de 10"
          trendUp={false}
        />
        <MetricCard
          icon={
            <PackageX className="text-zinc-700" size={24} strokeWidth={1.5} />
          }
          title="Valor Total em Estoque"
          value={isLoading ? "..." : formattedValue}
          trend="Financeiro"
          trendUp={true}
        />
      </div>
    </div>
  );
};

const ControlsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [movement, setMovement] = useState({
    productId: "",
    type: "ENTRY",
    quantity: "",
    reason: "",
  });

  useEffect(() => {
    if (isModalOpen && products.length === 0) {
      api
        .get("/products")
        .then((res) => setProducts(res.data))
        .catch(console.error);
    }
  }, [isModalOpen]);

  async function handleCreateMovement(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/movements", {
        product: { id: parseInt(movement.productId) },
        type: movement.type,
        quantity: parseInt(movement.quantity),
        reason: movement.reason,
      });
      setIsModalOpen(false);
      setMovement({ productId: "", type: "ENTRY", quantity: "", reason: "" });
      window.location.reload();
    } catch (error: any) {
      alert(
        "Erro ao registrar movimentação. Verifique se há saldo suficiente no estoque.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white rounded-[20px] p-3 shadow-sm border border-zinc-200/60">
      <div className="flex items-center gap-4 mb-4 lg:mb-0 pl-2">
        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/50">
          <Box size={20} className="text-zinc-700" strokeWidth={1.5} />
        </div>
        <div>
          <div className="text-[14px] font-bold text-zinc-900 leading-tight">
            Visão Geral de Estoque
          </div>
          <div className="text-[13px] font-medium text-zinc-500 capitalize">
            Hoje – {today}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="h-6 w-px bg-zinc-200 hidden sm:block mr-1"></div>
        <button
          onClick={() => window.location.reload()}
          className="h-10 px-4 rounded-[14px] border border-[#3B5BDB]/20 text-[#3B5BDB] flex items-center gap-2 hover:bg-[#3B5BDB]/5 font-bold text-[13px] transition-colors"
        >
          <RefreshCw size={16} strokeWidth={2.5} />
          Atualizar
        </button>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger className="h-10 px-5 rounded-[14px] bg-[#3B5BDB] text-white flex items-center gap-2 hover:bg-[#324fc2] font-bold text-[13px] shadow-sm shadow-[#3B5BDB]/30 transition-colors cursor-pointer">
            <Plus size={18} strokeWidth={2.5} />
            Adicionar Estoque
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900">
                Registrar Movimentação
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMovement} className="space-y-4 mt-4">
              <div>
                <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                  Produto
                </label>
                <select
                  required
                  value={movement.productId}
                  onChange={(e) =>
                    setMovement({ ...movement, productId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Selecione um produto...
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Estoque atual: {p.quantity || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Tipo
                  </label>
                  <select
                    required
                    value={movement.type}
                    onChange={(e) =>
                      setMovement({ ...movement, type: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="ENTRY">Entrada (+)</option>
                    <option value="EXIT">Saída (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movement.quantity}
                    onChange={(e) =>
                      setMovement({ ...movement, quantity: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                    placeholder="Ex: 50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                  Motivo / Fornecedor
                </label>
                <input
                  type="text"
                  required
                  value={movement.reason}
                  onChange={(e) =>
                    setMovement({ ...movement, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                  placeholder="Ex: Compra de lote, Venda, Reposição..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#3B5BDB] text-white text-[13px] font-bold rounded-xl hover:bg-[#324fc2] transition-colors disabled:opacity-70 flex items-center"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : null}
                  Confirmar
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const AnalyticView = () => {
  const [stats, setStats] = useState({ min: 0, avg: 0, max: 0 });

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        const products = res.data;
        if (products.length > 0) {
          const quantities = products.map((p: any) => p.quantity || 0);
          const min = Math.min(...quantities);
          const max = Math.max(...quantities);
          const avg = Math.round(
            quantities.reduce((a: number, b: number) => a + b, 0) /
              quantities.length,
          );
          setStats({ min, avg, max });
        }
      })
      .catch(console.error);
  }, []);

  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const heatmapData = Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) => {
      const intensityMap = [
        [0, 1, 2, 0, 1, 2, 2, 0, 1, 0, 2, 1],
        [0, 2, 2, 1, 2, 1, 3, 0, 2, 1, 3, 2],
        [1, 3, 1, 1, 0, 3, 3, 2, 0, 0, 1, 3],
        [3, 0, 3, 3, 1, 0, 0, 2, 3, 0, 2, 3],
      ];
      return intensityMap[row][col];
    }),
  );

  return (
    <div className="bg-white rounded-[24px] p-7 shadow-sm border border-zinc-200/60 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[17px] font-bold text-zinc-900 tracking-tight">
          Visão Analítica
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-50 rounded-[10px] p-1 border border-zinc-100">
            {["Dia", "Semana", "Mês", "Tri", "Ano", "Todos"].map((filter) => (
              <button
                key={filter}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-shadow ${filter === "Ano" ? "bg-white shadow-sm text-zinc-900 ring-1 ring-zinc-200/50" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                {filter === "Ano" && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3B5BDB] mr-1.5 mb-[1px]"></span>
                )}
                {filter}
              </button>
            ))}
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors">
            <ArrowUpRight size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-[32px] font-bold text-zinc-900 tracking-tight leading-none">
              {stats.min}
            </span>
            <ArrowUpRight
              size={18}
              className="text-zinc-400"
              strokeWidth={2.5}
            />
          </div>
          <div className="text-[13px] font-medium text-zinc-500">
            Estoque Mínimo
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-[32px] font-bold text-zinc-900 tracking-tight leading-none">
              {stats.avg}
            </span>
            <ArrowUpRight
              size={18}
              className="text-zinc-400"
              strokeWidth={2.5}
            />
          </div>
          <div className="text-[13px] font-medium text-zinc-500">
            Estoque Médio
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-[32px] font-bold text-zinc-900 tracking-tight leading-none">
              {stats.max}
            </span>
            <ArrowUpRight
              size={18}
              className="text-zinc-400"
              strokeWidth={2.5}
            />
          </div>
          <div className="text-[13px] font-medium text-zinc-500">
            Estoque Máximo
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex gap-3 relative">
          <div className="flex flex-col justify-between pr-3 py-1.5 text-[12px] text-zinc-400 font-semibold h-[184px]">
            <span>4</span>
            <span>3</span>
            <span>2</span>
            <span>1</span>
          </div>

          <div className="flex-1 flex flex-col gap-[10px] h-[184px]">
            {heatmapData.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-[10px] flex-1">
                {row.map((val, colIndex) => {
                  let bgColor = "bg-zinc-100";
                  if (val === 1) bgColor = "bg-[#C7D2FE]";
                  if (val === 2) bgColor = "bg-[#6366F1]";
                  if (val === 3) bgColor = "bg-[#3B5BDB]";

                  return (
                    <div
                      key={colIndex}
                      className={`flex-1 rounded-[6px] ${bgColor} transition-all hover:scale-105 hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 cursor-pointer`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex pl-8 mt-4">
          {months.map((month) => (
            <div
              key={month}
              className="flex-1 text-center text-[12px] text-zinc-400 font-semibold"
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-6 mt-8 text-[12px] font-semibold text-zinc-500 border-t border-zinc-100 pt-6">
          <span className="text-zinc-900">Estoque de Transação</span>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-[4px] bg-zinc-100"></div>
            (0 - 200)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#C7D2FE]"></div>
            (200 - 1,000)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#6366F1]"></div>
            (1,000 - 2,000)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#3B5BDB]"></div>
            (2,000 - 3,000)
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryHistory = () => {
  const [latestMovement, setLatestMovement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const response = await api.get("/movements");
        if (response.data && response.data.length > 0) {
          setLatestMovement(response.data[response.data.length - 1]);
        }
      } catch (error) {
        console.error("Erro ao buscar histórico recente", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLatest();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] p-7 shadow-sm border border-zinc-200/60 h-full flex items-center justify-center text-zinc-500 text-sm font-medium">
        Carregando histórico...
      </div>
    );
  }

  if (!latestMovement) {
    return (
      <div className="bg-white rounded-[24px] p-7 shadow-sm border border-zinc-200/60 h-full flex items-center justify-center text-zinc-500 text-sm font-medium">
        Nenhum histórico recente.
      </div>
    );
  }

  const product = latestMovement.product || {};
  const dateFormatted = new Date(latestMovement.createdAt).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
  const isEntry = latestMovement.type === "ENTRY";

  return (
    <div className="bg-white rounded-[24px] p-7 shadow-sm border border-zinc-200/60 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[17px] font-bold text-zinc-900 tracking-tight">
          Histórico Recente
        </h2>
        <button className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors">
          <ArrowUpRight size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="bg-zinc-50/80 rounded-[14px] p-4 mb-7 flex items-center justify-between border border-zinc-200/60 cursor-pointer hover:bg-zinc-100 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-medium text-zinc-500">Item:</span>
          <span className="text-[14px] font-bold text-zinc-900 truncate max-w-[150px]">
            {product.name || "Desconhecido"}
          </span>
        </div>
        <ChevronDown size={18} className="text-zinc-400" />
      </div>

      <div className="space-y-5 flex-1">
        <div className="flex justify-between items-center border-b border-zinc-100/80 pb-4">
          <span className="text-[13px] text-zinc-500 font-medium">
            Última Movimentação:
          </span>
          <span className="text-[13px] font-bold text-zinc-900">
            {dateFormatted}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-zinc-100/80 pb-4">
          <span className="text-[13px] text-zinc-500 font-medium">
            Categoria:
          </span>
          <span className="text-[13px] font-bold text-zinc-900 truncate max-w-[120px]">
            {product.category?.name || "Sem Categoria"}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-zinc-100/80 pb-4">
          <span className="text-[13px] text-zinc-500 font-medium">
            Ação (Qtd):
          </span>
          <span
            className={`text-[13px] font-bold ${isEntry ? "text-emerald-600" : "text-orange-600"}`}
          >
            {isEntry ? "+" : "-"}
            {latestMovement.quantity} unid.
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-zinc-500 font-medium">
            Estoque Restante:
          </span>
          <span className="text-[13px] font-bold text-zinc-900">
            {product.quantity || 0} unid.
          </span>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB] font-bold text-lg">
            {latestMovement.reason
              ? latestMovement.reason.charAt(0).toUpperCase()
              : "S"}
          </div>
          <div>
            <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">
              Motivo / Origem
            </div>
            <div className="text-[14px] font-bold text-zinc-900 leading-none truncate max-w-[120px]">
              {latestMovement.reason || "Sistema"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-[38px] h-[38px] rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors">
            <MessageSquare size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MapView = () => (
  <div className="bg-white rounded-[24px] shadow-sm border border-zinc-200/60 h-full relative overflow-hidden flex flex-col group min-h-[350px]">
    <div className="absolute inset-0 bg-[#F9FAFB] opacity-80">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <path
          d="M -50 80 Q 150 50 250 200 T 500 250"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 100 -50 Q 150 150 50 400"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 300 0 Q 250 200 400 400"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>

    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg
        className="w-full h-full max-w-[300px] max-h-[300px]"
        viewBox="0 0 200 250"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M 40 40 L 60 90 L 120 110 L 140 160 L 160 170 L 170 210"
          fill="none"
          stroke="#3B5BDB"
          strokeWidth="3.5"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
        <circle cx="40" cy="40" r="5" fill="#10B981" />
        <circle
          cx="40"
          cy="40"
          r="12"
          fill="#10B981"
          opacity="0.2"
          className="animate-pulse"
        />
        <circle cx="120" cy="110" r="3.5" fill="#3B5BDB" />
        <circle
          cx="170"
          cy="210"
          r="6"
          fill="#3B5BDB"
          stroke="white"
          strokeWidth="2.5"
        />
        <circle
          cx="170"
          cy="210"
          r="14"
          fill="#3B5BDB"
          opacity="0.2"
          className="animate-ping"
          style={{ animationDuration: "3s" }}
        />
      </svg>
    </div>

    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-zinc-200/60 shadow-sm cursor-pointer hover:bg-white transition-colors">
      <div className="text-zinc-600">
        <Maximize2 size={16} />
      </div>
    </div>

    <div className="absolute bottom-24 right-5 flex flex-col bg-white/90 backdrop-blur-md rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden">
      <button className="w-9 h-9 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border-b border-zinc-100 transition-colors">
        <Plus size={16} />
      </button>
      <button className="w-9 h-9 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors">
        <Minus size={16} />
      </button>
    </div>

    <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg shadow-zinc-200/50 border border-zinc-100 flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB] shrink-0">
        <MapPin size={18} fill="currentColor" className="text-white" />
      </div>
      <div>
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
          Localização
        </div>
        <div className="text-[14px] font-bold text-zinc-900 truncate leading-none">
          Armazém A - São Paulo
        </div>
      </div>
    </div>
  </div>
);

const RecentActivities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");

  const [visibleCols, setVisibleCols] = useState({
    category: true,
    stock: true,
    warehouse: true,
    date: true,
    type: true,
    supplier: true,
  });

  const tableColumns = [
    { id: "category", label: "Categoria" },
    { id: "stock", label: "Nível de Estoque" },
    { id: "warehouse", label: "Armazém" },
    { id: "date", label: "Data da Última Movimentação" },
    { id: "type", label: "Tipo" },
    { id: "supplier", label: "Fornecedor" },
  ];

  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMovements() {
      try {
        const response = await api.get("/movements");

        const formattedMovements = response.data.map((mov: any) => ({
          id: `#MOV-${mov.id?.toString().padStart(4, "0")}`,
          category: mov.product?.category?.name || "Geral",
          stock: `${mov.quantity} unid.`,
          warehouse: "Armazém Principal",
          date: new Date(mov.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          type: mov.type === "ENTRY" ? "Entrada" : "Saída",
          supplier: mov.reason || "Manual",
          status: "Concluído",
        }));

        setActivities(formattedMovements.reverse());
      } catch (error) {
        console.error("Erro ao buscar movimentações", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMovements();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Entregue":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200/60";
      case "Pendente":
        return "bg-zinc-100 text-zinc-600 border border-zinc-200";
      case "Recebido":
        return "bg-purple-50 text-purple-600 border border-purple-200/60";
      case "Em Trânsito":
        return "bg-blue-50 text-blue-600 border border-blue-200/60";
      default:
        return "bg-zinc-100 text-zinc-600 border border-zinc-200";
    }
  };

  const filteredActivities = activities.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.id.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    const matchesFilter =
      activeFilter === "Todos" || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-zinc-200/60 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-zinc-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
          <h2 className="text-[17px] font-bold text-zinc-900 shrink-0">
            Atividades Recentes
          </h2>
          <div className="flex bg-zinc-50 rounded-[12px] p-1 border border-zinc-100 overflow-x-auto no-scrollbar">
            {["Todos", "Entregue", "Em Trânsito", "Pendente", "Recebido"].map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-[13px] font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition-shadow ${filter === activeFilter ? "bg-white shadow-sm text-zinc-900 ring-1 ring-zinc-200/50" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  {filter === activeFilter && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB]"></span>
                  )}
                  {filter}
                </button>
              ),
            )}
          </div>
          <div className="relative flex-1 max-w-sm ml-auto sm:ml-0 xl:ml-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-5 text-[13px] font-bold text-zinc-500 shrink-0 mt-4 xl:mt-0 xl:pl-4 xl:border-l xl:border-zinc-200">
          <ColumnDropdown
            columns={tableColumns}
            visibleCols={visibleCols}
            setVisibleCols={setVisibleCols}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="py-4 pl-6 pr-4 text-[12px] font-bold text-zinc-500">
                ID do Pedido
              </th>
              {visibleCols.category && (
                <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                  Categoria
                </th>
              )}
              {visibleCols.stock && (
                <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                  Estoque
                </th>
              )}
              {visibleCols.warehouse && (
                <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                  Armazém
                </th>
              )}
              {visibleCols.date && (
                <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                  Data
                </th>
              )}
              {visibleCols.type && (
                <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                  Tipo
                </th>
              )}
              {visibleCols.supplier && (
                <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                  Fornecedor
                </th>
              )}
              <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                Status
              </th>
              <th className="py-4 pr-6 pl-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100/80">
            {isLoading ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-8 text-center text-[13px] font-medium text-zinc-500"
                >
                  Carregando atividades...
                </td>
              </tr>
            ) : filteredActivities.length > 0 ? (
              filteredActivities.map((item, i) => (
                <tr
                  key={i}
                  className="hover:bg-zinc-50/50 transition-colors group"
                >
                  <td className="py-4 pl-6 pr-4 font-bold text-[13px] text-zinc-900">
                    {item.id}
                  </td>
                  {visibleCols.category && (
                    <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                      {item.category}
                    </td>
                  )}
                  {visibleCols.stock && (
                    <td className="py-4 px-4 text-[13px] font-bold text-zinc-800">
                      {item.stock}
                    </td>
                  )}
                  {visibleCols.warehouse && (
                    <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                      {item.warehouse}
                    </td>
                  )}
                  {visibleCols.date && (
                    <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                      {item.date}
                    </td>
                  )}
                  {visibleCols.type && (
                    <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                      {item.type}
                    </td>
                  )}
                  {visibleCols.supplier && (
                    <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                      {item.supplier}
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider ${getStatusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 pr-6 pl-4 text-right">
                    <button className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="py-8 text-center text-[13px] font-medium text-zinc-500"
                >
                  Nenhuma atividade encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- PAGINA OFICIAL ---

export function Dashboard() {
  return (
    <div className="space-y-6">
      <HeaderSection />
      <ControlsSection />

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-6 lg:col-span-2">
          <AnalyticView />
        </div>
        <div className="xl:col-span-3 lg:col-span-1">
          <InventoryHistory />
        </div>
        <div className="xl:col-span-3 lg:col-span-3">
          <MapView />
        </div>
      </div>

      <RecentActivities />
    </div>
  );
}
