import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Trash2, 
  Calendar,
  AlertTriangle,
  Receipt,
  PiggyBank
} from 'lucide-react';
import Modal from './Modal';

export default function FinanceManager({ 
  clients = [], 
  transactions = [], 
  onUpdateClientStatus,
  onAddTransaction,
  onDeleteTransaction
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for custom transactions
  const [description, setDescription] = useState('');
  const [type, setType] = useState('outflow'); // 'inflow' or 'outflow'
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter transactions by Month
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // 1. Client Contract Totals
  const activeClients = clients.filter(c => c.paymentStatus !== 'ended');
  const totalContractMRR = activeClients.reduce((acc, c) => acc + (Number(c.paymentValue) || 0), 0);
  
  // Total client payments marked "Em dia" (actually paid this month)
  const paidContractsTotal = clients
    .filter(c => c.paymentStatus === 'paid')
    .reduce((acc, c) => acc + (Number(c.paymentValue) || 0), 0);

  // 2. Custom Transactions Calculations (Filtered by month)
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(filterMonth));

  const customInflowTotal = monthlyTransactions
    .filter(t => t.type === 'inflow')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const customOutflowTotal = monthlyTransactions
    .filter(t => t.type === 'outflow')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // 3. Cash Flow Calculations
  // Inflow = Paid Contracts + Custom Inflow
  const totalInflow = paidContractsTotal + customInflowTotal;
  // Outflow = Custom Outflow/Expenses
  const totalOutflow = customOutflowTotal;
  // Net Balance
  const netBalance = totalInflow - totalOutflow;

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    onAddTransaction({
      description,
      type,
      amount: Number(amount),
      date
    });

    setIsModalOpen(false);
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const renderClientLogo = (client) => {
    if (client.logo) {
      return <img src={client.logo} alt={client.name} className="w-8 h-8 rounded-full object-cover border border-glass-border shadow" />;
    }
    const initials = client.name ? client.name.substring(0, 2).toUpperCase() : 'CL';
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Gerenciador Financeiro</h2>
          <p className="text-text-secondary text-sm">Controle as mensalidades dos clientes e gerencie o fluxo de caixa.</p>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Período:</span>
          <input 
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-xs text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer font-semibold"
          />
        </div>
      </div>

      {/* Cash Flow Index Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Inflow */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden transition hover:translate-y-[-2px] hover:shadow-lg">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Entradas (Faturamento)</span>
            <h3 className="text-xl md:text-2xl font-black text-emerald-500">{formatCurrency(totalInflow)}</h3>
            <p className="text-[10px] text-text-secondary">
              Contratos Pagos: {formatCurrency(paidContractsTotal)} + Avulsos: {formatCurrency(customInflowTotal)}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <ArrowUpRight size={24} />
          </div>
        </div>

        {/* Card 2: Outflow */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden transition hover:translate-y-[-2px] hover:shadow-lg">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Saídas (Despesas)</span>
            <h3 className="text-xl md:text-2xl font-black text-red-500">{formatCurrency(totalOutflow)}</h3>
            <p className="text-[10px] text-text-secondary">Assinaturas e custos do período</p>
          </div>
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
            <ArrowDownRight size={24} />
          </div>
        </div>

        {/* Card 3: Balance */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden transition hover:translate-y-[-2px] hover:shadow-lg">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Saldo Líquido</span>
            <h3 className={`text-xl md:text-2xl font-black ${netBalance >= 0 ? 'text-indigo-400' : 'text-rose-500'}`}>
              {formatCurrency(netBalance)}
            </h3>
            <p className="text-[10px] text-text-secondary">
              Projeção MRR Ativa: {formatCurrency(totalContractMRR)}
            </p>
          </div>
          <div className={`p-3 rounded-2xl ${netBalance >= 0 ? 'bg-indigo-500/10 text-indigo-500' : 'bg-red-500/10 text-red-500'}`}>
            <PiggyBank size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Client payments boxes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary">Mensalidades por Cliente</h3>
            <span className="text-xs text-text-secondary font-semibold">Total de contratos ativos: {activeClients.length}</span>
          </div>

          {clients.length === 0 ? (
            <div className="glass-panel p-10 text-center text-text-secondary rounded-2xl text-sm border-dashed">
              Nenhum cliente cadastrado para exibir pagamentos.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clients.map(client => {
                const isEnded = client.paymentStatus === 'ended';
                return (
                  <div 
                    key={client.id}
                    className={`glass-panel p-4 rounded-2xl border transition relative flex flex-col justify-between h-44 ${isEnded ? 'opacity-60 bg-slate-900/10 border-slate-500/10' : 'border-glass-border hover:shadow-md'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {renderClientLogo(client)}
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-text-primary truncate">{client.name}</h4>
                          <span className="text-[10px] text-text-secondary block truncate">{client.handle}</span>
                        </div>
                      </div>

                      <select 
                        value={client.paymentStatus} 
                        onChange={(e) => onUpdateClientStatus(client.id, e.target.value)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border outline-none cursor-pointer bg-slate-100 dark:bg-slate-900 ${client.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : client.paymentStatus === 'overdue' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}
                      >
                        <option value="paid" className="bg-white dark:bg-slate-900 text-emerald-500">Em Dia</option>
                        <option value="overdue" className="bg-white dark:bg-slate-900 text-red-500">Atrasado</option>
                        <option value="ended" className="bg-white dark:bg-slate-900 text-slate-500">Contrato Encerrado</option>
                      </select>
                    </div>

                    <div className="mt-4 pt-3 border-t border-glass-border grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-text-secondary text-[10px] block">Mensalidade</span>
                        <span className="font-bold text-text-primary">{formatCurrency(client.paymentValue)}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary text-[10px] block">Dia Vencimento</span>
                        <span className="font-semibold text-text-primary">Dia {client.paymentDay}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-text-secondary flex items-center gap-1">
                      <Calendar size={12} className="text-indigo-500" />
                      <span>Início: {client.startDate ? new Date(client.startDate).toLocaleDateString('pt-BR') : 'Sem data'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 3: Custom Transaction list (Inflow/Outflow) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary">Transações Extras</h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
            >
              <Plus size={14} /> Lançamento
            </button>
          </div>

          <div className="glass-panel p-4 rounded-2xl space-y-4 min-h-[350px] flex flex-col justify-between">
            {/* List */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar flex-1">
              {monthlyTransactions.length === 0 ? (
                <div className="py-16 text-center text-text-secondary text-xs flex flex-col items-center justify-center gap-2 border border-dashed border-glass-border rounded-xl">
                  <Receipt size={24} className="text-text-secondary/30" />
                  <p>Sem lançamentos extras para este mês.</p>
                </div>
              ) : (
                monthlyTransactions.map(t => (
                  <div 
                    key={t.id}
                    className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border flex items-center justify-between gap-2 text-xs hover:bg-black/10 dark:hover:bg-white/10 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-text-primary truncate">{t.description}</p>
                      <span className="text-[10px] text-text-secondary">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`font-bold ${t.type === 'inflow' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {t.type === 'inflow' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                      <button 
                        onClick={() => onDeleteTransaction(t.id)}
                        className="text-text-secondary hover:text-red-500 p-1 rounded hover:bg-red-500/10 transition cursor-pointer"
                        title="Remover transação"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Summary block bottom */}
            {monthlyTransactions.length > 0 && (
              <div className="pt-3 border-t border-glass-border flex justify-between text-[10px] text-text-secondary">
                <span>Receitas Extras: <strong className="text-emerald-500">{formatCurrency(customInflowTotal)}</strong></span>
                <span>Despesas Extras: <strong className="text-red-500">{formatCurrency(customOutflowTotal)}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal - Adicionar Transação */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Novo Lançamento Extra"
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4 text-sm">
          {/* Tipo de Lançamento */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('inflow')}
                className={`py-2 rounded-xl font-semibold border transition text-xs flex items-center justify-center gap-1 cursor-pointer ${type === 'inflow' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-black/5 dark:bg-white/5 text-text-secondary border-glass-border'}`}
              >
                <ArrowUpRight size={14} /> Receita (Entrada)
              </button>
              <button
                type="button"
                onClick={() => setType('outflow')}
                className={`py-2 rounded-xl font-semibold border transition text-xs flex items-center justify-center gap-1 cursor-pointer ${type === 'outflow' ? 'bg-red-500 text-white border-red-500' : 'bg-black/5 dark:bg-white/5 text-text-secondary border-glass-border'}`}
              >
                <ArrowDownRight size={14} /> Despesa (Saída)
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Descrição</label>
            <input 
              type="text" 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Licença Canva Pro, Assinatura Adobe Premiere"
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Valor */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Valor (R$)</label>
            <input 
              type="number" 
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 55,00"
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Data */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Data</label>
            <input 
              type="date" 
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-glass-border">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-black font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/15 cursor-pointer"
            >
              Registrar Lançamento
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary font-semibold rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
