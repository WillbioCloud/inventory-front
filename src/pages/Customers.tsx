import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Download,
  Plus,
  User,
  Activity,
  DollarSign,
  Loader2,
  Edit,
  Trash2,
  Mail,
} from "lucide-react";
import { MetricCard, ColumnDropdown } from "../components/SharedUI";
import { api } from "../services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("Todos");

  const [visibleCols, setVisibleCols] = useState({
    contact: true,
    email: true,
    orders: true,
    ltv: true,
    activity: true,
  });

  const tableColumns = [
    { id: "contact", label: "Pessoa de Contato" },
    { id: "email", label: "Email" },
    { id: "orders", label: "Total de Pedidos" },
    { id: "ltv", label: "Valor Vitalício" },
    { id: "activity", label: "Atividade Recente" },
  ];

  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({
    company: "",
    contact: "",
    email: "",
    phone: "",
  });

  async function loadCustomers() {
    try {
      setIsLoading(true);
      const res = await api.get("/customers");
      const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      const formatted = res.data.map((customer: any) => ({
        realId: customer.id,
        id: `#CST-${customer.id.toString().padStart(4, "0")}`,
        company: customer.company,
        contact: customer.contact,
        email: customer.email,
        phone: customer.phone,
        orders: customer.totalOrders || 0,
        ltv: currency.format(customer.ltv || 0),
        status: customer.status,
        activity: new Date(customer.createdAt).toLocaleDateString("pt-BR"),
      }));
      setDbCustomers(formatted.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleCreateCustomer(event: React.FormEvent) {
    event.preventDefault();
    setIsCreating(true);
    try {
      await api.post("/customers", newCustomer);
      setIsModalOpen(false);
      setNewCustomer({ company: "", contact: "", email: "", phone: "" });
      await loadCustomers();
    } catch (error) {
      console.error(error);
      alert("Erro ao criar cliente.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateCustomer(event: React.FormEvent) {
    event.preventDefault();
    setIsUpdating(true);
    try {
      await api.put(`/customers/${editingCustomer.realId}`, {
        company: editingCustomer.company,
        contact: editingCustomer.contact,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
      });
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      await loadCustomers();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert("Erro ao atualizar cliente.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(realId: number) {
    if (!window.confirm("Deseja apagar este cliente?")) return;
    try {
      await api.delete(`/customers/${realId}`);
      await loadCustomers();
    } catch (error) {
      console.error(error);
      alert("Erro ao apagar. Ele pode ter pedidos atrelados.");
    }
  }

  const filteredCustomers = dbCustomers.filter((customer) => {
    const matchesSearch =
      customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      activeStatus === "Todos" || customer.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight leading-none mb-2">
            Clientes
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Gerencie sua base de clientes e acompanhe o valor vitalício
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm">
            <Download size={16} />
            Exportar CSV
          </button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger className="h-10 px-4 bg-[#3B5BDB] hover:bg-[#2A43A6] text-white rounded-xl text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
              <Plus size={16} /> Adicionar Cliente
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-[24px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-zinc-900">
                  Novo Cliente B2B
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCustomer} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Empresa / Razão Social
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomer.company}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        company: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                    placeholder="Ex: TechFlow Solutions"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Nome do Contato Principal
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomer.contact}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        contact: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      required
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                      placeholder="joao@techflow.br"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-[13px] font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2 bg-[#3B5BDB] text-white text-[13px] font-bold rounded-xl hover:bg-[#324fc2] transition-colors disabled:opacity-70 flex items-center"
                  >
                    {isCreating ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : null}{" "}
                    Cadastrar
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          isLoading={isLoading}
          icon={<User className="text-[#3B5BDB]" size={24} strokeWidth={1.5} />}
          title="Total de Clientes"
          value="2,408"
          trend="+12"
          trendUp={true}
        />
        <MetricCard
          isLoading={isLoading}
          icon={
            <Activity className="text-[#10B981]" size={24} strokeWidth={1.5} />
          }
          title="Clientes Ativos"
          value="1,842"
          trend="+5.2%"
          trendUp={true}
        />
        <MetricCard
          isLoading={isLoading}
          icon={
            <DollarSign
              className="text-[#F59E0B]"
              size={24}
              strokeWidth={1.5}
            />
          }
          title="Valor Vitalício Médio"
          value="$14,250"
          trend="+8.4%"
          trendUp={true}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/60 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 bg-zinc-50 border border-zinc-200/80 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all w-full sm:w-[280px]"
              />
            </div>
            <div className="hidden sm:flex bg-zinc-50 border border-zinc-200/80 rounded-xl p-1">
              {["Todos", "Ativo", "Inativo"].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`px-4 py-1.5 text-[13px] font-bold rounded-lg transition-all ${activeStatus === status ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  {status}
                </button>
              ))}
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

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="py-4 px-6 text-[12px] font-bold text-zinc-500 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-zinc-300 text-[#3B5BDB] focus:ring-[#3B5BDB] mr-3 align-middle"
                  />
                  Empresa{" "}
                  <ChevronDown size={14} className="inline opacity-50 ml-1" />
                </th>
                {visibleCols.contact && (
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                    Pessoa de Contato
                  </th>
                )}
                {visibleCols.email && (
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                    Email
                  </th>
                )}
                {visibleCols.orders && (
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500 text-center">
                    Total de Pedidos
                  </th>
                )}
                {visibleCols.ltv && (
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                    Valor Vitalício
                  </th>
                )}
                {visibleCols.activity && (
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                    Atividade Recente
                  </th>
                )}
                <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                  Status
                </th>
                <th className="py-4 pr-6 pl-4 text-[12px] font-bold text-zinc-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="py-5 px-6 flex items-center gap-3"><div className="w-4 h-4 rounded bg-zinc-200/60" /><div className="space-y-2"><div className="h-4 w-32 bg-zinc-200/60 rounded-md" /><div className="h-3 w-16 bg-zinc-200/60 rounded-md" /></div></td>
                    <td className="py-5 px-4"><div className="h-4 w-24 bg-zinc-200/60 rounded-md" /></td>
                    <td className="py-5 px-4"><div className="h-4 w-32 bg-zinc-200/60 rounded-md" /></td>
                    <td className="py-5 px-4"><div className="h-4 w-12 bg-zinc-200/60 rounded-md mx-auto" /></td>
                    <td className="py-5 px-4"><div className="h-4 w-20 bg-zinc-200/60 rounded-md" /></td>
                    <td className="py-5 px-4"><div className="h-4 w-24 bg-zinc-200/60 rounded-md" /></td>
                    <td className="py-5 px-4"><div className="h-6 w-16 bg-zinc-200/60 rounded-md" /></td>
                    <td className="py-5 pr-6 pl-4"><div className="h-6 w-20 bg-zinc-200/60 rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-[13px] font-medium text-zinc-500"
                  >
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, i) => (
                  <tr
                    key={i}
                    className="hover:bg-zinc-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-zinc-300 text-[#3B5BDB] focus:ring-[#3B5BDB]"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-[13px] text-zinc-900">
                          {customer.company}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-400">
                          {customer.id}
                        </span>
                      </div>
                    </td>
                    {visibleCols.contact && (
                      <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                        {customer.contact}
                      </td>
                    )}
                    {visibleCols.email && (
                      <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                        {customer.email}
                      </td>
                    )}
                    {visibleCols.orders && (
                      <td className="py-4 px-4 text-[13px] font-bold text-zinc-600 text-center">
                        {customer.orders}
                      </td>
                    )}
                    {visibleCols.ltv && (
                      <td className="py-4 px-4 text-[13px] font-bold text-zinc-900">
                        {customer.ltv}
                      </td>
                    )}
                    {visibleCols.activity && (
                      <td className="py-4 px-4 text-[13px] font-medium text-zinc-500">
                        {customer.activity}
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider border ${customer.status === "Ativo" ? "text-emerald-700 bg-emerald-50 border-emerald-200/50" : "text-zinc-600 bg-zinc-100 border-zinc-200/80"}`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <a
                          href={`mailto:${customer.email}`}
                          title="Enviar E-mail"
                          className="text-zinc-400 hover:text-[#3B5BDB] p-1.5 rounded-lg hover:bg-[#3B5BDB]/10 transition-colors cursor-pointer"
                        >
                          <Mail size={18} />
                        </a>
                        <button
                          onClick={() => {
                            setEditingCustomer(customer);
                            setIsEditModalOpen(true);
                          }}
                          title="Editar Cliente"
                          className="text-zinc-400 hover:text-orange-500 p-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(customer.realId);
                          }}
                          title="Apagar Cliente"
                          className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900">
              Editar Cliente
            </DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <form onSubmit={handleUpdateCustomer} className="space-y-4 mt-4">
              <div>
                <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                  Empresa / Razão Social
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.company}
                  onChange={(event) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      company: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                  Nome do Contato Principal
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.contact}
                  onChange={(event) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      contact: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={editingCustomer.email}
                    onChange={(event) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        email: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.phone}
                    onChange={(event) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        phone: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#3B5BDB] text-white text-[13px] font-bold rounded-xl disabled:opacity-70 flex items-center"
                >
                  {isUpdating && (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  )}
                  Atualizar Cliente
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
