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
  Box,
  Plus,
  Trash2,
  Loader2,
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

  const getProgressStep = (status: string) => {
    if (status === "Entregue") return 4;
    if (status === "Enviado") return 3;
    if (status === "Em Processamento") return 2;
    if (status === "Cancelado") return -1;
    return 1;
  };

  const currentStep = getProgressStep(order.status);

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
          {showTracking ? (
            <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-8 max-w-lg mx-auto my-4">
              <h3 className="text-lg font-bold text-zinc-900 mb-8 text-center">
                Status de Entrega
              </h3>

              {currentStep === -1 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 mb-1">
                    Pedido Cancelado
                  </h4>
                  <p className="text-zinc-500 text-sm">
                    Este pedido foi cancelado e não será enviado.
                  </p>
                </div>
              ) : (
                <div className="relative pl-2">
                  <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-zinc-100 z-0">
                    <div
                      className="w-full bg-[#3B5BDB] transition-all duration-500"
                      style={{
                        height: `${(Math.max(0, currentStep - 1) / 3) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="space-y-10 relative z-10">
                    <div className="flex items-start gap-6">
                      <div
                        className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center shrink-0 bg-white transition-colors duration-500 ${currentStep >= 1 ? "border-[#3B5BDB] text-[#3B5BDB]" : "border-zinc-200 text-zinc-300"}`}
                      >
                        <ShoppingBag size={16} />
                      </div>
                      <div className="pt-1">
                        <h4
                          className={`text-sm font-bold ${currentStep >= 1 ? "text-zinc-900" : "text-zinc-500"}`}
                        >
                          Pedido Realizado
                        </h4>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                          Recebemos o seu pedido
                        </p>
                        {currentStep >= 1 && (
                          <span className="text-[11px] font-bold text-zinc-400 mt-1 block">
                            {order.date}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-6">
                      <div
                        className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center shrink-0 bg-white transition-colors duration-500 ${currentStep >= 2 ? "border-[#3B5BDB] text-[#3B5BDB]" : "border-zinc-200 text-zinc-300"}`}
                      >
                        <Box size={16} />
                      </div>
                      <div className="pt-1">
                        <h4
                          className={`text-sm font-bold ${currentStep >= 2 ? "text-zinc-900" : "text-zinc-500"}`}
                        >
                          Em Processamento
                        </h4>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                          O pedido está sendo embalado no armazém
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-6">
                      <div
                        className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center shrink-0 bg-white transition-colors duration-500 ${currentStep >= 3 ? "border-[#3B5BDB] text-[#3B5BDB]" : "border-zinc-200 text-zinc-300"}`}
                      >
                        <Truck size={16} />
                      </div>
                      <div className="pt-1">
                        <h4
                          className={`text-sm font-bold ${currentStep >= 3 ? "text-zinc-900" : "text-zinc-500"}`}
                        >
                          Enviado
                        </h4>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                          O pedido está a caminho de {order.destination}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-6">
                      <div
                        className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center shrink-0 bg-white transition-colors duration-500 ${currentStep >= 4 ? "border-[#3B5BDB] text-[#3B5BDB]" : "border-zinc-200 text-zinc-300"}`}
                      >
                        <MapPin size={16} />
                      </div>
                      <div className="pt-1">
                        <h4
                          className={`text-sm font-bold ${currentStep >= 4 ? "text-zinc-900" : "text-zinc-500"}`}
                        >
                          Entregue
                        </h4>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                          O pedido foi entregue com sucesso
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm">
                  <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <User size={16} className="text-[#3B5BDB]" /> Contato do
                    Cliente
                  </h3>
                  <div className="space-y-3 text-[13px]">
                    <div className="flex justify-between border-b border-zinc-50 pb-2">
                      <span className="text-zinc-500">Cliente</span>
                      <span className="font-semibold text-zinc-900">
                        {order.customer}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-50 pb-2">
                      <span className="text-zinc-500">Pessoa de Contato</span>
                      <span className="font-semibold text-zinc-900">
                        {order.contact?.name || "Jane Doe"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-50 pb-2">
                      <span className="text-zinc-500">Email</span>
                      <span className="font-semibold text-zinc-900">
                        {order.contact?.email || "contact@example.com"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Telefone</span>
                      <span className="font-semibold text-zinc-900">
                        {order.contact?.phone || "+1 555-0192"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col">
                  <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-[#3B5BDB]" /> Endereço de
                    Entrega
                  </h3>
                  <p className="text-[13px] text-zinc-600 leading-relaxed font-medium flex-1">
                    {order.address ||
                      "Av. Empresarial 123, Sala 400\nDistrito Logístico\n" +
                        order.destination}
                  </p>
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[12px] text-zinc-500">
                      Zona de Destino
                    </span>
                    <span className="text-[12px] font-bold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md">
                      {order.destination}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Itens do Pedido
                  </h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[12px] text-zinc-500">
                      <th className="py-3 px-5 font-bold">Nome do Produto</th>
                      <th className="py-3 px-5 font-bold">SKU</th>
                      <th className="py-3 px-5 font-bold text-center">Qtd</th>
                      <th className="py-3 px-5 font-bold">Preço</th>
                      <th className="py-3 px-5 font-bold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {order.products ? (
                      order.products.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-zinc-50/30">
                          <td className="py-3 px-5 text-[13px] font-bold text-zinc-900">
                            {item.name}
                          </td>
                          <td className="py-3 px-5 text-[13px] text-zinc-500">
                            {item.sku}
                          </td>
                          <td className="py-3 px-5 text-[13px] font-bold text-zinc-600 text-center">
                            {item.qty}
                          </td>
                          <td className="py-3 px-5 text-[13px] text-zinc-600">
                            {item.price}
                          </td>
                          <td className="py-3 px-5 text-[13px] font-bold text-zinc-900 text-right">
                            {item.total}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3 px-5 text-[13px] font-bold text-zinc-900">
                          Pacote de Preenchimento Padrão
                        </td>
                        <td className="py-3 px-5 text-[13px] text-zinc-500">
                          BNDL-001
                        </td>
                        <td className="py-3 px-5 text-[13px] font-bold text-zinc-600 text-center">
                          {order.items}
                        </td>
                        <td className="py-3 px-5 text-[13px] text-zinc-600">
                          -
                        </td>
                        <td className="py-3 px-5 text-[13px] font-bold text-zinc-900 text-right">
                          {order.total}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-zinc-100 bg-white flex justify-end z-10">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-semibold text-zinc-900">
                {order.subtotal || order.total}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-zinc-500">Impostos (0%)</span>
              <span className="font-semibold text-zinc-900">
                {order.tax || "$0.00"}
              </span>
            </div>
            <div className="border-t border-zinc-100 pt-2 mt-2 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-900">
                Total Geral
              </span>
              <span className="text-xl font-bold text-[#3B5BDB]">
                {order.total}
              </span>
            </div>
          </div>
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

  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerEmail: "",
    destination: "",
    items: [{ productId: "", quantity: 1 }],
  });

  const tableColumns = [
    { id: "date", label: "Data" },
    { id: "destination", label: "Destino" },
    { id: "items", label: "Itens" },
    { id: "total", label: "Total" },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, productsRes, customersRes] = await Promise.all([
          api.get("/orders"),
          api.get("/products"),
          api.get("/customers"),
        ]);
        const currency = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });
        const formattedOrders = ordersRes.data.map((order: any) => ({
          id: `#ORD-${order.id.toString().padStart(4, "0")}`,
          date: new Date(order.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          customer: order.customerName,
          destination: order.destination,
          items: order.items.reduce(
            (total: number, item: any) => total + item.quantity,
            0,
          ),
          total: currency.format(order.totalAmount),
          status:
            order.status === "PROCESSING"
              ? "Em Processamento"
              : order.status === "SHIPPED"
                ? "Enviado"
                : order.status === "DELIVERED"
                  ? "Entregue"
                  : "Cancelado",
          products: order.items.map((item: any) => ({
            name: item.product.name,
            sku: item.product.sku,
            qty: item.quantity,
            price: currency.format(item.unitPrice),
            total: currency.format(item.subTotal),
          })),
        }));
        setDbOrders(formattedOrders.reverse());
        setProductsList(productsRes.data);
        setCustomersList(customersRes.data);
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { productId: "", quantity: 1 }],
    });
  };

  const removeOrderItem = (index: number) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const updateOrderItem = (index: number, field: string, value: string) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === "quantity" ? parseInt(value) || 1 : value,
    };
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const handleCreateOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);
    try {
      await api.post("/orders", newOrder);
      setIsModalOpen(false);
      setNewOrder({
        customerName: "",
        customerEmail: "",
        destination: "",
        items: [{ productId: "", quantity: 1 }],
      });
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(
        "Erro ao criar o pedido. Verifique se há estoque suficiente para os itens solicitados.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const filteredOrders = dbOrders.filter((item) => {
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
        <div className="flex items-center gap-3">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger className="h-10 px-5 rounded-[14px] bg-[#3B5BDB] text-white flex items-center gap-2 hover:bg-[#324fc2] font-bold text-[13px] shadow-sm shadow-[#3B5BDB]/30 transition-colors cursor-pointer">
              <Plus size={18} strokeWidth={2.5} /> Novo Pedido
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-white rounded-[24px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-zinc-900">
                  Registrar Novo Pedido
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleCreateOrder}
                className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto px-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                      Cliente Cadastrado
                    </label>
                    <select
                      required
                      value={newOrder.customerName}
                      onChange={(event) => {
                        const selectedName = event.target.value;
                        const customer = customersList.find(
                          (item) => item.company === selectedName,
                        );
                        setNewOrder({
                          ...newOrder,
                          customerName: selectedName,
                          customerEmail: customer ? customer.email : "",
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Selecione um cliente...
                      </option>
                      {customersList.map((customer) => (
                        <option key={customer.id} value={customer.company}>
                          {customer.company} ({customer.contact})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      required
                      value={newOrder.customerEmail}
                      onChange={(event) =>
                        setNewOrder({
                          ...newOrder,
                          customerEmail: event.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Destino (Cidade, UF)
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrder.destination}
                    onChange={(event) =>
                      setNewOrder({
                        ...newOrder,
                        destination: event.target.value,
                      })
                    }
                    placeholder="Ex: São Paulo, SP"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                  />
                </div>
                <div className="pt-2 border-t border-zinc-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[13px] font-bold text-zinc-700">
                      Produtos (Carrinho)
                    </label>
                    <button
                      type="button"
                      onClick={addOrderItem}
                      className="text-[#3B5BDB] text-[12px] font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Adicionar Item
                    </button>
                  </div>
                  {newOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-2 mb-2 items-center bg-zinc-50 p-2 rounded-xl border border-zinc-200/50"
                    >
                      <select
                        required
                        value={item.productId}
                        onChange={(event) =>
                          updateOrderItem(
                            index,
                            "productId",
                            event.target.value,
                          )
                        }
                        className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none"
                      >
                        <option value="" disabled>
                          Selecione um produto...
                        </option>
                        {productsList.map((product) => (
                          <option
                            key={product.id}
                            value={product.id}
                            disabled={product.quantity <= 0}
                          >
                            {product.name} (Estoque: {product.quantity || 0})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(event) =>
                          updateOrderItem(index, "quantity", event.target.value)
                        }
                        className="w-20 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 outline-none"
                        placeholder="Qtd"
                      />
                      {newOrder.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOrderItem(index)}
                          className="text-zinc-400 hover:text-red-500 p-2"
                          aria-label="Remover item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
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
                    {isCreating && (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    )}{" "}
                    Finalizar Venda
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-sm text-zinc-500"
                  >
                    Carregando pedidos...
                  </td>
                </tr>
              ) : (
                filteredOrders.map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedOrder(item)}
                    className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
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
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(item);
                        }}
                        className="text-zinc-400 hover:text-[#3B5BDB] p-1.5 rounded-lg hover:bg-[#3B5BDB]/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
