import { useState } from 'react';
import { Search, ChevronDown, Download, Plus, User, Activity, DollarSign, MoreHorizontal } from 'lucide-react';
import { MetricCard, ColumnDropdown } from '../components/SharedUI';

export function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('Todos');
  
  const [visibleCols, setVisibleCols] = useState({
    contact: true, email: true, orders: true, ltv: true, activity: true
  });
  
  const tableColumns = [
    { id: 'contact', label: 'Pessoa de Contato' },
    { id: 'email', label: 'Email' },
    { id: 'orders', label: 'Total de Pedidos' },
    { id: 'ltv', label: 'Valor Vitalício' },
    { id: 'activity', label: 'Atividade Recente' }
  ];

  const customers = [
    { id: '#CST-1001', company: 'TechFlow Solutions', contact: 'Sarah Jenkins', email: 'sarah.j@techflow.io', orders: 124, ltv: '$42,500', status: 'Ativo', activity: 'Há 2 horas' },
    { id: '#CST-1002', company: 'Global Retail', contact: 'Marcus Chen', email: 'm.chen@globalretail.com', orders: 86, ltv: '$28,400', status: 'Ativo', activity: 'Ontem' },
    { id: '#CST-1003', company: 'Nexus Corp', contact: 'Elena Rodriguez', email: 'erodriguez@nexus.corp', orders: 12, ltv: '$4,100', status: 'Inativo', activity: 'Há 3 meses' },
    { id: '#CST-1004', company: 'Alpha Industries', contact: 'James Wilson', email: 'j.wilson@alphaind.com', orders: 54, ltv: '$18,900', status: 'Ativo', activity: 'Há 5 dias' },
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          customer.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          customer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeStatus === 'Todos' || customer.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight leading-none mb-2">Clientes</h1>
          <p className="text-zinc-500 text-sm font-medium">Gerencie sua base de clientes e acompanhe o valor vitalício</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm">
            <Download size={16} />
            Exportar CSV
          </button>
          <button className="h-10 px-4 bg-[#3B5BDB] hover:bg-[#2A43A6] text-white rounded-xl text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={16} />
            Adicionar Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={<User className="text-[#3B5BDB]" size={24} strokeWidth={1.5} />} title="Total de Clientes" value="2,408" trend="+12" trendUp={true} />
        <MetricCard icon={<Activity className="text-[#10B981]" size={24} strokeWidth={1.5} />} title="Clientes Ativos" value="1,842" trend="+5.2%" trendUp={true} />
        <MetricCard icon={<DollarSign className="text-[#F59E0B]" size={24} strokeWidth={1.5} />} title="Valor Vitalício Médio" value="$14,250" trend="+8.4%" trendUp={true} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/60 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar clientes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 bg-zinc-50 border border-zinc-200/80 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all w-full sm:w-[280px]"
              />
            </div>
            <div className="hidden sm:flex bg-zinc-50 border border-zinc-200/80 rounded-xl p-1">
              {['Todos', 'Ativo', 'Inativo'].map(status => (
                <button 
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`px-4 py-1.5 text-[13px] font-bold rounded-lg transition-all ${activeStatus === status ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-5 text-[13px] font-bold text-zinc-500 shrink-0 mt-4 xl:mt-0 xl:pl-4 xl:border-l xl:border-zinc-200">
            <ColumnDropdown columns={tableColumns} visibleCols={visibleCols} setVisibleCols={setVisibleCols} />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="py-4 px-6 text-[12px] font-bold text-zinc-500 whitespace-nowrap">
                  <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-[#3B5BDB] focus:ring-[#3B5BDB] mr-3 align-middle" />
                  Empresa <ChevronDown size={14} className="inline opacity-50 ml-1" />
                </th>
                {visibleCols.contact && <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">Pessoa de Contato</th>}
                {visibleCols.email && <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">Email</th>}
                {visibleCols.orders && <th className="py-4 px-4 text-[12px] font-bold text-zinc-500 text-center">Total de Pedidos</th>}
                {visibleCols.ltv && <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">Valor Vitalício</th>}
                {visibleCols.activity && <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">Atividade Recente</th>}
                <th className="py-4 px-4 text-[12px] font-bold text-zinc-500">Status</th>
                <th className="py-4 pr-6 pl-4 text-[12px] font-bold text-zinc-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredCustomers.map((customer, i) => (
                <tr key={i} className="hover:bg-zinc-50/30 transition-colors cursor-pointer group">
                  <td className="py-4 px-6 flex items-center gap-3">
                     <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-[#3B5BDB] focus:ring-[#3B5BDB]" />
                     <div className="flex flex-col">
                       <span className="font-bold text-[13px] text-zinc-900">{customer.company}</span>
                       <span className="text-[11px] font-medium text-zinc-400">{customer.id}</span>
                     </div>
                  </td>
                  {visibleCols.contact && <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">{customer.contact}</td>}
                  {visibleCols.email && <td className="py-4 px-4 text-[13px] font-medium text-zinc-600">{customer.email}</td>}
                  {visibleCols.orders && <td className="py-4 px-4 text-[13px] font-bold text-zinc-600 text-center">{customer.orders}</td>}
                  {visibleCols.ltv && <td className="py-4 px-4 text-[13px] font-bold text-zinc-900">{customer.ltv}</td>}
                  {visibleCols.activity && <td className="py-4 px-4 text-[13px] font-medium text-zinc-500">{customer.activity}</td>}
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider border ${customer.status === 'Ativo' ? 'text-emerald-700 bg-emerald-50 border-emerald-200/50' : 'text-zinc-600 bg-zinc-100 border-zinc-200/80'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-4 pr-6 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="text-[12px] font-bold text-[#3B5BDB] hover:text-[#2A43A6] px-3 py-1.5 rounded-lg hover:bg-[#3B5BDB]/5 transition-colors">
                        Ver Perfil
                      </button>
                      <button className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}