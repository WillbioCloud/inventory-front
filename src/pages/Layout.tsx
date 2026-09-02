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
} from "lucide-react";

// Nossas rotas oficiais
const NAV_TABS = [
  { path: "/", label: "Visão Geral" },
  { path: "/inventory", label: "Estoque" },
  { path: "/orders", label: "Pedidos" },
  { path: "/analytics", label: "Análises" },
  { path: "/customers", label: "Clientes" },
];

function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
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

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="relative" ref={profileRef}>
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src="https://github.com/shadcn.png"
          alt="Admin"
          className="w-10 h-10 rounded-full border border-zinc-200"
        />
        <div className="hidden sm:block text-sm">
          <div className="font-semibold text-zinc-900 group-hover:text-[#3B5BDB] transition-colors">
            Admin
          </div>
          <div className="text-zinc-500 text-xs flex items-center gap-1">
            admin@empresa.com <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#09090b] text-[#f8fafc] rounded-xl shadow-2xl border border-zinc-800 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-2 py-2 flex gap-3 items-center">
            <img
              src="https://github.com/shadcn.png"
              alt="Admin"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-zinc-100">
                Admin
              </span>
              <span className="text-[12px] text-zinc-400">
                admin@empresa.com
              </span>
            </div>
          </div>

          <div className="h-px bg-zinc-800 my-1 mx-1"></div>

          <div className="px-2 py-1.5 text-[13px] font-medium hover:bg-zinc-800 hover:text-zinc-50 rounded-md cursor-pointer flex items-center gap-2 transition-colors">
            <Sparkles size={16} className="text-zinc-400" /> Fazer Upgrade para
            Pro
          </div>

          <div className="h-px bg-zinc-800 my-1 mx-1"></div>

          <div className="px-2 py-1.5 text-[13px] font-medium bg-zinc-800 text-zinc-50 rounded-md cursor-pointer flex items-center gap-2 transition-colors">
            <BadgeCheck size={16} className="text-zinc-400" /> Conta
          </div>

          <div className="px-2 py-1.5 text-[13px] font-medium hover:bg-zinc-800 hover:text-zinc-50 rounded-md cursor-pointer flex items-center gap-2 transition-colors">
            <CreditCard size={16} className="text-zinc-400" /> Faturamento
          </div>

          <div className="px-2 py-1.5 text-[13px] font-medium hover:bg-zinc-800 hover:text-zinc-50 rounded-md cursor-pointer flex items-center gap-2 transition-colors">
            <Bell size={16} className="text-zinc-400" /> Notificações
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
              <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-600 relative transition-colors">
                <Bell size={20} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
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
