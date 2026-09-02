import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  ShoppingBag,
  Clock,
  Truck,
  MapPin,
  X,
  User,
} from "lucide-react";
import { MetricCard, ColumnDropdown } from "../components/SharedUI";

const getOrderStatusStyle = (status: string) => {
  switch (status) {
    case "Entregue":
      return "bg-emerald-50 text-emerald-600 border-emerald-200/60";
    case "Em Processamento":
      return "bg-orange-50 text-orange-600 border-orange-200/60";
    case "Enviado":
      return "bg-blue-50 text-blue-600 border-blue-200/60";
    case "Cancelado":
      return "bg-red-50 text-red-600 border-red-200/60";
    default:
      return "bg-zinc-100 text-zinc-600 border-zinc-200";
  }
};

const OrderDetailsModal = ({
  order,
  onClose,
}: {
  order: any;
  onClose: () => void;
}) => {
  const [showTracking, setShowTracking] = useState(false);

  useEffect(() => {
    setShowTracking(false);
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-zinc-900">{order.id}</h2>
            <span
              className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider border ${getOrderStatusStyle(order.status)}`}
            >
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTracking(!showTracking)}
              className={`text-[13px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${showTracking ? "bg-[#3B5BDB]/10 text-[#3B5BDB]" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
            >
              <MapPin size={14} />
              {showTracking ? "Voltar aos Detalhes" : "Rastrear Envio"}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-zinc-50/50">
          {!showTracking ? (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <User size={16} className="text-[#3B5BDB]" /> Contato do
                  Cliente
                </h3>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between border-b border-zinc-50 pb-2">
                    <span className="text-zinc-500">Cliente</span>{" "}
                    <span className="font-semibold text-zinc-900">
                      {order.customer}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-50 pb-2">
                    <span className="text-zinc-500">Destino</span>{" "}
                    <span className="font-semibold text-zinc-900">
                      {order.destination}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <MapPin className="mx-auto text-blue-500 mb-4" size={48} />
              <h4 className="text-lg font-bold">
                Módulo de Rastreio em Construção
              </h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("Todos");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    destination: true,
    items: true,
    total: true,
  });

  const tableColumns = [
    { id: "date", label: "Data" },
    { id: "destination", label: "Destino" },
    { id: "items", label: "Itens" },
    { id: "total", label: "Total" },
  ];

  const orders = [
    {
      id: "#ORD-8021",
      date: "15 Ago 2026",
      customer: "TechFlow Solutions",
      destination: "São Paulo, SP",
      items: 24,
      total: "$3,420.00",
      status: "Em Processamento",
    },
    {
      id: "#ORD-8022",
      date: "14 Ago 2026",
      customer: "Global Retail",
      destination: "Rio de Janeiro, RJ",
      items: 12,
      total: "$1,890.50",
      status: "Enviado",
    },
    {
      id: "#ORD-8023",
      date: "14 Ago 2026",
      customer: "Nexus Corp",
      destination: "Belo Horizonte, MG",
      items: 150,
      total: "$12,400.00",
      status: "Entregue",
    },
  ];

  const filteredOrders = orders.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      activeStatus === "Todos" || item.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6 pt-2">
        <div>
          <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight leading-none mb-2">
            Gestão de Pedidos
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Acompanhe, processe e cumpra os pedidos dos clientes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full 2xl:w-auto">
          <MetricCard
            icon={
              <ShoppingBag
                className="text-zinc-700"
                size={24}
                strokeWidth={1.5}
              />
            }
            title="Total de Pedidos"
            value="1,248"
            trend="+12.5%"
            trendUp={true}
          />
          <MetricCard
            icon={
              <Clock className="text-zinc-700" size={24} strokeWidth={1.5} />
            }
            title="Aguardando Envio"
            value="42"
            trend="-4.2%"
            trendUp={false}
          />
          <MetricCard
            icon={
              <Truck className="text-zinc-700" size={24} strokeWidth={1.5} />
            }
            title="Enviados Hoje"
            value="18"
            trend="+2.1%"
            trendUp={true}
          />
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-zinc-200/60 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
            <div className="flex bg-zinc-50 rounded-[12px] p-1 border border-zinc-100 overflow-x-auto no-scrollbar">
              {[
                "Todos",
                "Em Processamento",
                "Enviado",
                "Entregue",
                "Cancelado",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-shadow ${status === activeStatus ? "bg-white shadow-sm text-zinc-900 ring-1 ring-zinc-200/50" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  {status}
                </button>
              ))}
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
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all"
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
                {visibleCols.date && (
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                    Data
                  </th>
                )}
                <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                  Cliente
                </th>
                {visibleCols.destination && (
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                    Destino
                  </th>
                )}
                {visibleCols.items && (
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500 text-center">
                    Itens
                  </th>
                )}
                {visibleCols.total && (
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                    Total
                  </th>
                )}
                <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                  Status
                </th>
                <th className="py-4 pr-6 pl-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80">
              {filteredOrders.map((item, i) => (
                <tr
                  key={i}
                  className="hover:bg-zinc-50/50 transition-colors group"
                >
                  <td className="py-4 pl-6 pr-4 font-bold text-[13px] text-zinc-900">
                    {item.id}
                  </td>
                  {visibleCols.date && (
                    <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                      {item.date}
                    </td>
                  )}
                  <td className="py-4 px-4 text-[13px] font-bold text-zinc-800">
                    {item.customer}
                  </td>
                  {visibleCols.destination && (
                    <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                      {item.destination}
                    </td>
                  )}
                  {visibleCols.items && (
                    <td className="py-4 px-4 text-[13px] font-bold text-zinc-600 text-center">
                      {item.items}
                    </td>
                  )}
                  {visibleCols.total && (
                    <td className="py-4 px-4 text-[13px] font-bold text-zinc-900">
                      {item.total}
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider border ${getOrderStatusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 pr-6 pl-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(item)}
                      className="text-zinc-400 hover:text-[#3B5BDB] p-1.5 rounded-lg hover:bg-[#3B5BDB]/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
