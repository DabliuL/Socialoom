import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  FileText, 
  ArrowRight,
  CheckSquare,
  DollarSign,
  Edit2
} from 'lucide-react';
import SocialIcon from './SocialIcon';

export default function Dashboard({ 
  clients = [], 
  tasks = [], 
  reminders = [],
  onToggleReminderCompleted,
  userName = 'Social Media',
  onUpdateUserName,
  onNavigate, 
  onAddClient, 
  onAddTask,
  onUpdateTaskStatus 
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
      setIsEditingName(false);
    }
  };
  // Get active clients (status !== 'ended')
  const activeClients = clients.filter(c => c.paymentStatus !== 'ended');
  
  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = activeClients.reduce((acc, c) => acc + (Number(c.paymentValue) || 0), 0);
  
  // Total weekly content pieces
  const totalWeeklyContent = activeClients.reduce((acc, c) => {
    const posts = Number(c.weeklyContent?.posts) || 0;
    const reels = Number(c.weeklyContent?.reels) || 0;
    const stories = Number(c.weeklyContent?.stories) || 0;
    return acc + posts + reels + stories;
  }, 0);

  // Task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Get tasks for today
  const weekdaysMap = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado'
  };
  const todayName = weekdaysMap[new Date().getDay()];
  const todayTasks = tasks.filter(t => t.dayOfWeek === todayName);
  
  // Get clients with overdue payment status
  const overdueClients = clients.filter(c => c.paymentStatus === 'overdue');

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Helper to render client logo or dynamic avatar
  const renderClientLogo = (client) => {
    if (client.logo) {
      return <img src={client.logo} alt={client.name} className="w-8 h-8 rounded-full object-cover border border-glass-border" />;
    }
    // Simple gradient avatar with initials
    const initials = client.name ? client.name.substring(0, 2).toUpperCase() : 'CL';
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
        {initials}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'approval': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo': return 'A Fazer';
      case 'pending': return 'Pendente';
      case 'approval': return 'Em Aprovação';
      case 'urgent': return 'Urgente';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Message */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2">
              <input 
                type="text" 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="text-xl md:text-2xl font-bold tracking-tight text-text-primary bg-black/10 dark:bg-white/10 border border-glass-border rounded-xl px-3 py-1 outline-none focus:border-indigo-500/50"
                maxLength={30}
                autoFocus
              />
              <button 
                type="submit" 
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg transition cursor-pointer"
              >
                Salvar
              </button>
              <button 
                type="button" 
                onClick={() => { setIsEditingName(false); setTempName(userName); }} 
                className="bg-black/5 dark:bg-white/5 border border-glass-border text-text-secondary hover:text-text-primary text-xs px-2.5 py-1.5 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Olá, {userName}! 👋</h2>
              <button 
                onClick={() => { setIsEditingName(true); setTempName(userName); }}
                className="p-1 text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Editar nome"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
          <p className="text-text-secondary text-sm md:text-base mt-1">Aqui está o resumo da sua plataforma de gestão hoje.</p>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-1.5 rounded-lg glass-panel text-text-secondary">
          <Calendar size={16} className="text-indigo-500" />
          <span>{todayName}, {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: MRR */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden transition hover:translate-y-[-2px] hover:shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Faturamento / MRR</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-xl font-bold text-text-primary truncate">{formatCurrency(mrr)}</h3>
            <p className="text-[10px] text-emerald-500 font-medium mt-1">Mensal recorrente ativo</p>
          </div>
        </div>

        {/* Metric 2: Active Clients */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden transition hover:translate-y-[-2px] hover:shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Clientes Ativos</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-2xl font-bold text-text-primary">{activeClients.length}</h3>
            <p className="text-[10px] text-text-secondary mt-1">Gerenciando contratos</p>
          </div>
        </div>

        {/* Metric 3: Weekly Content */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden transition hover:translate-y-[-2px] hover:shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Conteúdo / Semana</span>
            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
              <SocialIcon network="Instagram" size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-2xl font-bold text-text-primary">{totalWeeklyContent}</h3>
            <p className="text-[10px] text-text-secondary mt-1">Posts, Reels & Stories</p>
          </div>
        </div>

        {/* Metric 4: Tasks Progress */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden transition hover:translate-y-[-2px] hover:shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Progresso Tarefas</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-lg font-bold text-text-primary">{completedTasks}/{totalTasks}</h3>
              <span className="text-xs font-semibold text-emerald-500">{taskProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${taskProgressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Tasks & Pending Finances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Today's Tasks */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="text-indigo-500" size={20} />
              <h3 className="text-lg font-bold tracking-tight text-text-primary">Planejamento de Hoje ({todayName})</h3>
            </div>
            <button 
              onClick={() => onNavigate('tasks')}
              className="text-xs font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition cursor-pointer"
            >
              Ver agenda <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
            {todayTasks.length === 0 ? (
              <div className="py-12 text-center text-text-secondary flex flex-col items-center justify-center gap-3">
                <CheckCircle2 size={40} className="text-emerald-500/60" />
                <div>
                  <p className="font-semibold text-sm">Tudo em ordem!</p>
                  <p className="text-xs">Nenhuma tarefa agendada para hoje.</p>
                </div>
                <button 
                  onClick={onAddTask}
                  className="mt-2 text-xs bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Adicionar Tarefa
                </button>
              </div>
            ) : (
              todayTasks.map(task => {
                const client = clients.find(c => c.id === task.clientId);
                return (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border hover:bg-black/10 dark:hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {client ? renderClientLogo(client) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-text-secondary text-[10px] font-bold">
                          Geral
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{task.title}</p>
                        <p className="text-xs text-text-secondary truncate">
                          {client ? `${client.name} (${client.handle})` : 'Tarefa Geral'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        value={task.status} 
                        onChange={(e) => onUpdateTaskStatus(task.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-full border font-semibold outline-none cursor-pointer bg-slate-100 dark:bg-slate-900 ${getStatusColor(task.status)}`}
                      >
                        <option value="todo" className="bg-white dark:bg-slate-900 text-blue-500">A Fazer</option>
                        <option value="pending" className="bg-white dark:bg-slate-900 text-amber-500">Pendente</option>
                        <option value="approval" className="bg-white dark:bg-slate-900 text-orange-500">Em Aprovação</option>
                        <option value="urgent" className="bg-white dark:bg-slate-900 text-red-500">Urgente</option>
                        <option value="completed" className="bg-white dark:bg-slate-900 text-emerald-500">Concluído</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Agenda & Alertas (Right Panel) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Today's Reminders */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-indigo-500" size={20} />
                <h3 className="text-lg font-bold tracking-tight text-text-primary">Agenda de Hoje</h3>
              </div>
              <button 
                onClick={() => onNavigate('agenda')}
                className="text-xs font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition cursor-pointer"
              >
                Ver tudo <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
              {todayReminders.length === 0 ? (
                <div className="py-6 text-center text-text-secondary text-xs flex flex-col items-center justify-center gap-2">
                  <AlertCircle size={24} className="text-indigo-500/30" />
                  <p>Sem compromissos hoje.</p>
                </div>
              ) : (
                todayReminders.map(rem => (
                  <div 
                    key={rem.id} 
                    className={`flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border transition ${rem.completed ? 'opacity-65' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <input 
                        type="checkbox" 
                        checked={rem.completed} 
                        onChange={() => onToggleReminderCompleted(rem.id)}
                        className="w-4 h-4 rounded border-glass-border bg-black/10 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold text-text-primary truncate ${rem.completed ? 'line-through text-text-secondary' : ''}`}>{rem.title}</p>
                        <span className="text-[10px] text-text-secondary">{rem.time || 'Sem hora'} | {rem.type}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Payments */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="text-indigo-500" size={20} />
                <h3 className="text-lg font-bold tracking-tight text-text-primary">Avisos de Cobrança</h3>
              </div>
              <button 
                onClick={() => onNavigate('finance')}
                className="text-xs font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition cursor-pointer"
              >
                Finanças <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
              {overdueClients.length === 0 ? (
                <div className="py-6 text-center text-text-secondary flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 size={24} className="text-emerald-500/60" />
                  <p className="text-xs font-semibold">Tudo em dia!</p>
                </div>
              ) : (
                overdueClients.map(client => (
                  <div 
                    key={client.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {renderClientLogo(client)}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">{client.name}</p>
                        <p className="text-[10px] text-red-400">Venceu dia {client.paymentDay}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-text-primary">{formatCurrency(client.paymentValue)}</p>
                      <span className="text-[9px] font-bold text-red-400 uppercase">Atrasado</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-text-primary">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={onAddClient}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-glass-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition text-center gap-2 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition duration-300">
              <Users size={20} />
            </div>
            <span className="text-xs font-semibold text-text-primary">Novo Cliente</span>
          </button>
          
          <button 
            onClick={onAddTask}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-glass-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition text-center gap-2 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition duration-300">
              <CheckSquare size={20} />
            </div>
            <span className="text-xs font-semibold text-text-primary">Nova Tarefa</span>
          </button>

          <button 
            onClick={() => onNavigate('tasks')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-glass-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition text-center gap-2 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500 group-hover:scale-110 transition duration-300">
              <Calendar size={20} />
            </div>
            <span className="text-xs font-semibold text-text-primary">Ver Calendário</span>
          </button>

          <button 
            onClick={() => onNavigate('finance')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-glass-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition text-center gap-2 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition duration-300">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-semibold text-text-primary">Fluxo de Caixa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
