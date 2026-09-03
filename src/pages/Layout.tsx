import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  BadgeCheck,
  CreditCard,
  LogOut,
  LayoutTemplate,
  Settings,
  AlertTriangle,
  Package,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { api } from "../services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NAV_TABS = [
  { path: "/", label: "Visão Geral" },
  { path: "/inventory", label: "Estoque" },
  { path: "/orders", label: "Pedidos" },
  { path: "/analytics", label: "Análises" },
  { path: "/customers", label: "Clientes" },
];

function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-600 relative transition-colors"
        aria-label="Notificações"
      >
        <Bell size={20} />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-zinc-200/80 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-zinc-900 text-sm">Notificações</h3>
            <span className="text-[11px] font-bold text-[#3B5BDB] bg-[#3B5BDB]/10 px-2 py-0.5 rounded-full">
              2 Novas
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex gap-3 items-start p-2.5 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer border border-transparent hover:border-zinc-100 group">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100 group-hover:scale-105 transition-transform">
                <AlertTriangle size={14} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-zinc-900 font-bold leading-none mb-1">
                  Estoque Baixo
                </p>
                <p className="text-[12px] text-zinc-500 leading-snug">
                  O produto "Monitor 4K 27" atingiu o limite mínimo de estoque
                  (0 unid).
                </p>
                <span className="text-[10px] text-zinc-400 font-bold mt-1.5 inline-block">
                  Há 5 min
                </span>
              </div>
            </div>
            <div className="flex gap-3 items-start p-2.5 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer border border-transparent hover:border-zinc-100 group">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                <Package size={14} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-zinc-900 font-bold leading-none mb-1">
                  Novo Pedido Recebido
                </p>
                <p className="text-[12px] text-zinc-500 leading-snug">
                  A empresa Nexus Corp acabou de registrar o pedido #ORD-8024.
                </p>
                <span className="text-[10px] text-zinc-400 font-bold mt-1.5 inline-block">
                  Há 2 horas
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 text-center">
            <button className="text-[12px] font-bold text-[#3B5BDB] hover:text-[#2A43A6] transition-colors">
              Marcar todas como lidas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Carregando...",
    email: "...",
  });
  const [formData, setFormData] = useState({ name: "", password: "" });
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    api
      .get("/users/me")
      .then((response) => {
        setCurrentUser(response.data);
        setFormData({ name: response.data.name, password: "" });
      })
      .catch((error) => console.error("Erro ao buscar perfil:", error));
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put("/users/me", formData);
      setCurrentUser(response.data);
      setFormData({ name: response.data.name, password: "" });
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      alert("Erro ao atualizar o perfil. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative" ref={profileRef}>
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-10 h-10 rounded-full border border-zinc-200 bg-[#3B5BDB] text-white flex items-center justify-center font-bold">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-sm">
          <div className="font-semibold text-zinc-900 group-hover:text-[#3B5BDB] transition-colors">
            {currentUser.name}
          </div>
          <div className="text-zinc-500 text-xs flex items-center gap-1">
            {currentUser.email} <ChevronDown size={14} />
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#09090b] text-[#f8fafc] rounded-xl shadow-2xl border border-zinc-800 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-2 py-2 flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-[#3B5BDB] text-white flex items-center justify-center font-bold shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-zinc-100">
                {currentUser.name}
              </span>
              <span className="text-[12px] text-zinc-400">
                {currentUser.email}
              </span>
            </div>
          </div>

          <div className="h-px bg-zinc-800 my-1 mx-1"></div>

          <div className="px-2 py-1.5 text-[13px] font-medium hover:bg-zinc-800 hover:text-zinc-50 rounded-md cursor-pointer flex items-center gap-2 transition-colors">
            <Sparkles size={16} className="text-zinc-400" /> Fazer Upgrade para
            Pro
          </div>

          <div className="h-px bg-zinc-800 my-1 mx-1"></div>

          <div
            onClick={() => {
              setIsOpen(false);
              setIsProfileModalOpen(true);
            }}
            className="px-2 py-1.5 text-[13px] font-medium bg-zinc-800 text-zinc-50 rounded-md cursor-pointer flex items-center gap-2 transition-colors"
          >
            <BadgeCheck size={16} className="text-zinc-400" /> Conta
          </div>

          <div className="px-2 py-1.5 text-[13px] font-medium hover:bg-zinc-800 hover:text-zinc-50 rounded-md cursor-pointer flex items-center gap-2 transition-colors">
            <CreditCard size={16} className="text-zinc-400" /> Faturamento
          </div>

          <div className="px-2 py-1.5 text-[13px] font-medium hover:bg-zinc-800 hover:text-zinc-50 rounded-md cursor-pointer flex items-center gap-2 transition-colors">
            <Settings size={16} className="text-zinc-400" /> Configurações
          </div>

          <div className="h-px bg-zinc-800 my-1 mx-1"></div>

          <div
            onClick={handleLogout}
            className="px-2 py-1.5 text-[13px] font-medium hover:bg-zinc-800 hover:text-red-400 text-red-500 rounded-md cursor-pointer flex items-center gap-2 transition-colors"
          >
            <LogOut size={16} /> Sair
          </div>
        </div>
      )}
      <Dialog
        open={isProfileModalOpen}
        onOpenChange={(open) => {
          setIsProfileModalOpen(open);
          if (!open) {
            setIsEditing(false);
            setFormData({ name: currentUser.name, password: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px] bg-white rounded-[24px] p-0 overflow-hidden shadow-2xl border-0">
          <div className="bg-gradient-to-r from-[#3B5BDB] to-[#6366F1] h-28 w-full relative">
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white bg-zinc-100 flex items-center justify-center text-3xl font-bold text-[#3B5BDB] shadow-md">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="pt-14 pb-6 px-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900">
                Minha Conta
              </DialogTitle>
            </DialogHeader>
            {!isEditing ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#3B5BDB] text-white flex items-center justify-center text-2xl font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-extrabold text-zinc-900 truncate">
                      {currentUser.name}
                    </h2>
                    <p className="text-[13px] text-zinc-500 font-medium truncate">
                      {currentUser.email} • Administrador
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-left">
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/60 flex items-center gap-3 hover:border-[#3B5BDB]/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                      <UserIcon size={14} className="text-zinc-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Nome de Exibição
                      </div>
                      <div className="text-[13px] font-bold text-zinc-900 truncate">
                        {currentUser.name}
                      </div>
                    </div>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/60 flex items-center gap-3 hover:border-[#3B5BDB]/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                      <Settings size={14} className="text-zinc-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Acesso
                      </div>
                      <div className="text-[13px] font-bold text-zinc-900">
                        Administrador Global
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-100 flex justify-center gap-3">
                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-[13px] rounded-xl transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-[#3B5BDB] hover:bg-[#324fc2] text-white font-bold text-[13px] rounded-xl shadow-sm shadow-[#3B5BDB]/20 transition-all active:scale-95"
                  >
                    Editar Perfil
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSaveProfile}
                className="text-left space-y-4 animate-in fade-in slide-in-from-right-4 duration-200"
              >
                <div>
                  <label className="block text-[12px] font-bold text-zinc-700 mb-1.5 ml-1">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({ ...formData, name: event.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-zinc-700 mb-1.5 ml-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData({ ...formData, password: event.target.value })
                    }
                    placeholder="Deixe em branco para manter a atual"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] placeholder:text-zinc-400"
                  />
                </div>
                <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-[13px] rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#3B5BDB] hover:bg-[#324fc2] text-white font-bold text-[13px] rounded-xl flex items-center shadow-sm shadow-[#3B5BDB]/20 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {isSaving && (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    )}{" "}
                    Salvar
                  </button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-zinc-900 font-sans selection:bg-[#3B5BDB]/20">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
        {/* TopNav */}
        <div className="flex items-center justify-between bg-white rounded-[20px] px-6 py-4 shadow-sm border border-zinc-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#3B5BDB] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <LayoutTemplate size={20} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">
              Quantara
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-zinc-500">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${location.pathname === tab.path ? "text-zinc-900 bg-zinc-100 shadow-sm" : "hover:text-zinc-900 hover:bg-zinc-50"}`}
              >
                {location.pathname === tab.path && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB]"></div>
                )}
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 pr-4 border-r border-zinc-200/80">
              <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-600 transition-colors">
                <Search size={20} />
              </button>
              <NotificationsPanel />
            </div>
            <UserProfile />
          </div>
        </div>

        {/* Onde as páginas (Dashboard, Inventory, etc) vão aparecer */}
        <main className="animate-in fade-in zoom-in-95 duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
