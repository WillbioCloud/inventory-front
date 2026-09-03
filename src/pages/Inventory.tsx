import { useState, useEffect } from "react";
import {
  Download,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Box,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  Edit,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { ColumnDropdown } from "../components/SharedUI";
import { api } from "../services/api";

// Imports do Modal do Shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [visibleCols, setVisibleCols] = useState({
    category: true,
    price: true,
    stock: true,
    warehouse: true,
  });

  // Estados da API
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados do Modal de Criação de Produto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Modal de Detalhes
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<any>(null);

  // Controle do menu Dropdown de ações da tabela
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    // Fecha o menu de ações se o usuário clicar em qualquer lugar fora dele
    const closeMenu = () => setOpenDropdownId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    categoryId: "",
    price: "",
    quantity: "",
    imageUrl: "",
  });

  // Novos Estados para Categorias
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const tableColumns = [
    { id: "category", label: "Categoria" },
    { id: "price", label: "Preço" },
    { id: "stock", label: "Estoque" },
    { id: "warehouse", label: "Armazém" },
  ];

  // GET: Buscar Produtos
  async function fetchProducts() {
    try {
      setIsLoading(true);
      const response = await api.get("/products");

      const formattedData = response.data.map((item: any) => ({
        realId: item.id,
        displayId: `#PRD-${item.id?.toString().padStart(4, "0") || "0000"}`,
        name: item.name,
        category: item.category?.name || "Sem Categoria",
        sku: item.sku || `SKU-${item.id}`,
        stock: item.quantity || item.stock || 0,
        priceFormatted: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(item.price || 0),
        price: item.price || 0,
        status:
          (item.quantity || item.stock) > 10
            ? "Em Estoque"
            : (item.quantity || item.stock) > 0
              ? "Estoque Baixo"
              : "Sem Estoque",
        warehouse: item.warehouse || "Armazém Principal",
        imageUrl: item.imagemUrl || item.imageUrl || "",
      }));

      setInventoryItems(formattedData);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar os produtos do servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    const selectedCat = categories.find((c) => c.id.toString() === catId);
    const prefix = selectedCat
      ? selectedCat.name.substring(0, 3).toUpperCase()
      : "PRD";

    // 1. Pega todos os SKUs carregados do banco que começam com esse prefixo
    const existingSkus = inventoryItems
      .map((item) => item.sku)
      .filter((sku) => sku && sku.startsWith(`${prefix}-`));

    let nextNum = 1;
    if (existingSkus.length > 0) {
      // 2. Extrai a parte numérica (ex: "001" vira 1), filtra os inválidos e acha o maior
      const numbers = existingSkus.map((sku) => {
        const parts = sku.split("-");
        return parts.length > 1 ? parseInt(parts[1], 10) : 0;
      });
      const maxNum = Math.max(...numbers.filter((n) => !isNaN(n)));
      nextNum = maxNum + 1; // 3. Soma +1 ao maior número encontrado
    }

    // 4. Formata com zeros à esquerda (ex: 1 vira "001", 15 vira "015")
    const formattedNum = nextNum.toString().padStart(3, "0");

    setNewProduct({
      ...newProduct,
      categoryId: catId,
      sku: `${prefix}-${formattedNum}`,
    });
  };

  async function handleDelete(realId: number) {
    if (
      !window.confirm(
        "Tem certeza que deseja apagar este produto permanentemente?",
      )
    ) {
      return;
    }

    try {
      await api.delete(`/products/${realId}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(
        "Erro ao apagar. Certifique-se de que este produto não possui histórico de movimentações atrelado a ele.",
      );
    }
  }

  function handleOpenDetails(product: any) {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  }

  function handleOpenEdit(product: any) {
    const catId =
      categories.find((c) => c.name === product.category)?.id?.toString() || "";

    setEditingProduct({
      ...product,
      categoryId: catId,
      quantity: product.stock,
      price: product.price,
    });
    setIsEditModalOpen(true);
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await api.put(`/products/${editingProduct.realId}`, {
        name: editingProduct.name,
        sku: editingProduct.sku,
        category: editingProduct.categoryId
          ? { id: parseInt(editingProduct.categoryId, 10) }
          : null,
        price: parseFloat(editingProduct.price),
        quantity: parseInt(editingProduct.quantity, 10),
        imagemUrl: editingProduct.imageUrl || "",
      });

      setIsEditModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error("Erro ao atualizar produto:", err);
      alert("Erro ao atualizar produto. Verifique os dados e tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  }

  // POST: Criar Produto
  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);

    try {
      await api.post("/products", {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.categoryId
          ? { id: parseInt(newProduct.categoryId, 10) }
          : null,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity, 10),
        imagemUrl: newProduct.imageUrl || "",
      });

      setIsModalOpen(false);
      setNewProduct({
        name: "",
        sku: "",
        categoryId: "",
        price: "",
        quantity: "",
        imageUrl: "",
      });
      fetchProducts();
    } catch (err) {
      console.error("Erro ao criar produto:", err);
      alert("Erro ao criar produto. Verifique os dados e tente novamente.");
    } finally {
      setIsCreating(false);
    }
  }

  // POST: Criar Categoria
  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setIsCreatingCategory(true);
    try {
      const response = await api.post("/categories", {
        name: newCategoryName,
        description: "Criado via Painel",
      });
      await fetchCategories();
      setNewProduct({ ...newProduct, categoryId: response.data.id.toString() });
      setIsCategoryModalOpen(false);
      setNewCategoryName("");
    } catch (err) {
      console.error("Erro ao criar categoria:", err);
      alert("Erro ao criar categoria.");
    } finally {
      setIsCreatingCategory(false);
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Em Estoque":
        return "bg-emerald-50 text-emerald-600 border-emerald-200/60";
      case "Estoque Baixo":
        return "bg-orange-50 text-orange-600 border-orange-200/60";
      case "Sem Estoque":
        return "bg-red-50 text-red-600 border-red-200/60";
      default:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query);
    const matchesCategory =
      activeCategory === "Todos" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6 pt-2">
        <div>
          <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight leading-none mb-2">
            Gestão de Estoque
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Gerencie e acompanhe todo o seu catálogo de produtos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-[14px] border border-zinc-200 text-zinc-600 flex items-center gap-2 hover:bg-zinc-50 font-bold text-[13px] transition-colors">
            <Download size={16} strokeWidth={2.5} />
            Exportar CSV
          </button>

          {/* Modal de Criação de Produto */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger className="h-10 px-5 rounded-[14px] bg-[#3B5BDB] text-white flex items-center gap-2 hover:bg-[#324fc2] font-bold text-[13px] shadow-sm shadow-[#3B5BDB]/30 transition-colors cursor-pointer">
              <Plus size={18} strokeWidth={2.5} />
              Adicionar Produto
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-[24px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-zinc-900">
                  Novo Produto
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateProduct} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                    placeholder="Ex: Teclado Mecânico"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                      Categoria
                    </label>
                    <div className="flex gap-2">
                      <select
                        required
                        value={newProduct.categoryId}
                        onChange={handleCategoryChange}
                        className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Selecione...
                        </option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="w-[38px] shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl flex items-center justify-center border border-zinc-200 transition-colors"
                        title="Nova Categoria"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                      SKU (Auto/Manual)
                    </label>
                    <input
                      type="text"
                      required
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, sku: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all font-mono"
                      placeholder="Ex: TEC-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                      Preço ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                      placeholder="99.90"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newProduct.quantity}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          quantity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                      placeholder="150"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    URL da Imagem do Produto (Opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <ImageIcon size={16} />
                    </div>
                    <input
                      type="url"
                      value={newProduct.imageUrl}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          imageUrl: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                      placeholder="https://i.imgur.com/sua-imagem.png"
                    />
                  </div>
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
                    disabled={isCreating}
                    className="px-5 py-2 bg-[#3B5BDB] text-white text-[13px] font-bold rounded-xl hover:bg-[#324fc2] transition-colors disabled:opacity-70 flex items-center"
                  >
                    {isCreating ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : null}
                    {isCreating ? "Salvando..." : "Salvar Produto"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal Dinâmico de Nova Categoria */}
          <Dialog
            open={isCategoryModalOpen}
            onOpenChange={setIsCategoryModalOpen}
          >
            <DialogContent className="sm:max-w-[350px] bg-white rounded-[24px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-zinc-900">
                  Nova Categoria
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="space-y-4 mt-2">
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                    placeholder="Ex: Monitores"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 text-[13px] font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCategory}
                    className="px-5 py-2 bg-[#3B5BDB] text-white text-[13px] font-bold rounded-xl hover:bg-[#324fc2] transition-colors disabled:opacity-70 flex items-center"
                  >
                    {isCreatingCategory ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : null}
                    Adicionar
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-zinc-200/60 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
            <div className="flex bg-zinc-50 rounded-[12px] p-1 border border-zinc-100 overflow-x-auto no-scrollbar">
              {["Todos", ...categories.map((c) => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-[13px] font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition-shadow ${cat === activeCategory ? "bg-white shadow-sm text-zinc-900 ring-1 ring-zinc-200/50" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  {cat === activeCategory && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB]"></span>
                  )}
                  {cat}
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
                placeholder="Buscar por Nome ou SKU..."
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
            <div className="flex items-center gap-3 border-l border-zinc-200 pl-5">
              <span>
                1-{Math.min(filteredItems.length, 10)} de {filteredItems.length}
              </span>
              <div className="flex gap-1.5">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px] pb-32">
          {isLoading ? (
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-zinc-100/80">
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="py-4 pl-6 pr-4 flex items-center gap-4">
                      <div className="w-4 h-4 rounded bg-zinc-200/60" />
                      <div className="w-10 h-10 rounded-lg bg-zinc-200/60 shrink-0" />
                      <div className="h-4 w-32 bg-zinc-200/60 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-20 bg-zinc-200/60 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-zinc-200/60 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-16 bg-zinc-200/60 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-12 bg-zinc-200/60 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-24 bg-zinc-200/60 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-zinc-200/60 rounded-md" />
                    </td>
                    <td className="py-4 pr-6 pl-4">
                      <div className="h-6 w-8 bg-zinc-200/60 rounded-md ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-red-500">
              <AlertTriangle className="h-8 w-8 mb-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="py-4 pl-6 pr-4 text-[12px] font-bold text-zinc-500 flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-zinc-300 text-[#3B5BDB] focus:ring-[#3B5BDB]"
                    />
                    Nome do Produto{" "}
                    <ChevronDown size={14} className="opacity-50 ml-1" />
                  </th>
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                    SKU
                  </th>
                  {visibleCols.category && (
                    <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                      Categoria
                    </th>
                  )}
                  {visibleCols.price && (
                    <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                      Preço
                    </th>
                  )}
                  {visibleCols.stock && (
                    <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                      Estoque
                    </th>
                  )}
                  <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                    Status
                  </th>
                  {visibleCols.warehouse && (
                    <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">
                      Armazém
                    </th>
                  )}
                  <th className="py-4 pr-6 pl-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100/80">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, i) => (
                    <tr
                      key={i}
                      onClick={() => handleOpenDetails(item)}
                      className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 pl-6 pr-4 flex items-center gap-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-zinc-300 text-[#3B5BDB] focus:ring-[#3B5BDB]"
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center border border-zinc-200/50 overflow-hidden shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Box size={18} className="text-zinc-400" />
                            )}
                          </div>
                          <span className="font-bold text-[13px] text-zinc-900">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[13px] font-bold text-zinc-600">
                        {item.sku}
                      </td>
                      {visibleCols.category && (
                        <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                          {item.category}
                        </td>
                      )}
                      {visibleCols.price && (
                        <td className="py-4 px-4 text-[13px] font-bold text-zinc-900">
                          {item.price}
                        </td>
                      )}
                      {visibleCols.stock && (
                        <td className="py-4 px-4 text-[13px] font-bold text-zinc-800">
                          {item.stock}
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider border ${getStatusStyle(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {visibleCols.warehouse && (
                        <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">
                          {item.warehouse}
                        </td>
                      )}
                      <td className="py-4 pr-6 pl-4 text-right relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(
                              openDropdownId === item.realId
                                ? null
                                : item.realId,
                            );
                          }}
                          className="text-zinc-400 hover:text-[#3B5BDB] p-1.5 rounded-lg hover:bg-[#3B5BDB]/10 transition-all"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {/* Dropdown de Ações */}
                        {openDropdownId === item.realId && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-8 top-8 mt-1 w-44 bg-white border border-zinc-200/80 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] z-[999] py-1.5 animate-in fade-in zoom-in-95 duration-100 flex flex-col"
                          >
                            <button
                              onClick={() => {
                                handleOpenEdit(item);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-[13px] font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 transition-colors"
                            >
                              <Edit size={16} className="text-orange-500" />{" "}
                              Editar
                            </button>
                            <div className="h-px bg-zinc-100 my-1 mx-2"></div>
                            <button
                              onClick={() => {
                                handleDelete(item.realId);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={16} /> Apagar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-[13px] font-medium text-zinc-500"
                    >
                      Nenhum produto cadastrado no banco de dados ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Produto */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900">
              Detalhes do Produto
            </DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="mt-4 space-y-5">
              {viewingProduct.imageUrl ? (
                <div className="w-full h-40 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200">
                  <img
                    src={viewingProduct.imageUrl}
                    alt={viewingProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-zinc-50 rounded-xl flex flex-col items-center justify-center border border-zinc-200 text-zinc-400">
                  <Box size={40} strokeWidth={1} className="mb-2 opacity-50" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Sem Imagem
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-[18px] font-bold text-zinc-900 leading-tight">
                  {viewingProduct.name}
                </h3>
                <p className="text-[13px] font-medium text-zinc-500 mt-1">
                  {viewingProduct.displayId} • {viewingProduct.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    SKU
                  </div>
                  <div className="text-[14px] font-bold text-zinc-900 font-mono">
                    {viewingProduct.sku}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Preço Unitário
                  </div>
                  <div className="text-[14px] font-bold text-zinc-900">
                    {viewingProduct.priceFormatted}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Estoque Atual
                  </div>
                  <div className="text-[14px] font-bold text-zinc-900">
                    {viewingProduct.stock} unidades
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Status
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider border inline-block mt-0.5 ${getStatusStyle(viewingProduct.status)}`}
                  >
                    {viewingProduct.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Produto */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900">
              Editar Produto
            </DialogTitle>
          </DialogHeader>

          {editingProduct && (
            <form onSubmit={handleUpdateProduct} className="space-y-4 mt-4">
              <div>
                <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Categoria
                  </label>
                  <select
                    required
                    value={editingProduct.categoryId}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Selecione...
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sku: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Preço ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.quantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-zinc-700 mb-1">
                  URL da Imagem
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <ImageIcon size={16} />
                  </div>
                  <input
                    type="url"
                    value={editingProduct.imageUrl || ""}
                    placeholder="https://imgur.com/sua-imagem.png"
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#3B5BDB] text-white text-[13px] font-bold rounded-xl hover:bg-[#324fc2] transition-colors disabled:opacity-70 flex items-center"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : null}
                  Atualizar Produto
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
