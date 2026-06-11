import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Filter, 
  CheckCircle,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Modal from './Modal';

export default function TaskManager({ 
  tasks = [], 
  clients = [], 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Segunda');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('todo');

  // Filters State
  const [filterClient, setFilterClient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mobile View Active Day (Default: Today's weekday)
  const weekdays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const getTodayIndex = () => {
    const day = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    const indexMap = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
    return indexMap[day] ?? 0;
  };
  const [activeMobileDay, setActiveMobileDay] = useState(weekdays[getTodayIndex()]);

  const openAddModal = (day = 'Segunda') => {
    setSelectedTask(null);
    setTitle('');
    setDayOfWeek(day);
    setClientId('');
    setStatus('todo');
    setIsModalOpen(true);
  };

  const openEditModal = (task, e) => {
    e.stopPropagation();
    setSelectedTask(task);
    setTitle(task.title);
    setDayOfWeek(task.dayOfWeek);
    setClientId(task.clientId || '');
    setStatus(task.status);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title,
      dayOfWeek,
      clientId: clientId || null,
      status
    };

    if (selectedTask) {
      onUpdateTask(selectedTask.id, taskData);
    } else {
      onAddTask(taskData);
    }
    setIsModalOpen(false);
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'todo': return 'bg-blue-500/15 text-blue-500 border-blue-500/25';
      case 'pending': return 'bg-amber-500/15 text-amber-500 border-amber-500/25';
      case 'approval': return 'bg-orange-500/15 text-orange-500 border-orange-500/25';
      case 'urgent': return 'bg-red-500/15 text-red-400 border-red-500/25';
      case 'completed': return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/25';
    }
  };

  const getStatusLabel = (s) => {
    switch (s) {
      case 'todo': return 'A Fazer';
      case 'pending': return 'Pendente';
      case 'approval': return 'Em Aprovação';
      case 'urgent': return 'Urgente';
      case 'completed': return 'Concluído';
      default: return s;
    }
  };

  const renderClientLogo = (client) => {
    if (client && client.logo) {
      return <img src={client.logo} alt={client.name} className="w-5 h-5 rounded-full object-cover border border-glass-border" />;
    }
    const initials = client ? client.name.substring(0, 2).toUpperCase() : 'CL';
    return (
      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
        {initials}
      </div>
    );
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchClient = filterClient === 'all' || task.clientId === filterClient;
    const matchStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchClient && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Gerenciador de Tarefas</h2>
          <p className="text-text-secondary text-sm">Organize suas demandas de publicações divididas pelos dias da semana.</p>
        </div>
        <button
          onClick={() => openAddModal(activeMobileDay)}
          className="flex items-center gap-1.5 bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20 text-sm cursor-pointer"
        >
          <Plus size={18} /> Nova Tarefa
        </button>
      </div>

      {/* Filters bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wider">
          <Filter size={16} className="text-indigo-500" />
          <span>Filtros Rápidos</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Client Filter */}
          <select 
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-xs text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="all">Todos os Clientes</option>
            <option value="general">Geral (Sem Vínculo)</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-xs text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="todo">A Fazer</option>
            <option value="pending">Pendente</option>
            <option value="approval">Em Aprovação</option>
            <option value="urgent">Urgente</option>
            <option value="completed">Concluído</option>
          </select>
        </div>
      </div>

      {/* MOBILE WEEK TABS (Screens < md) */}
      <div className="block md:hidden space-y-4">
        {/* Navigation buttons */}
        <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 border border-glass-border rounded-xl p-1">
          <button 
            onClick={() => {
              const currentIdx = weekdays.indexOf(activeMobileDay);
              const prevIdx = currentIdx === 0 ? 6 : currentIdx - 1;
              setActiveMobileDay(weekdays[prevIdx]);
            }}
            className="p-2 text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="font-bold text-sm text-text-primary">{activeMobileDay}</span>
          
          <button 
            onClick={() => {
              const currentIdx = weekdays.indexOf(activeMobileDay);
              const nextIdx = currentIdx === 6 ? 0 : currentIdx + 1;
              setActiveMobileDay(weekdays[nextIdx]);
            }}
            className="p-2 text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Quick select buttons */}
        <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
          {weekdays.map(day => (
            <button
              key={day}
              onClick={() => setActiveMobileDay(day)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${activeMobileDay === day ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-black/5 dark:bg-white/5 text-text-secondary border-glass-border'}`}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>

        {/* Mobile tasks list for activeMobileDay */}
        <div className="glass-panel p-4 rounded-2xl min-h-[300px] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-glass-border">
            <span className="font-bold text-xs text-text-secondary uppercase">{activeMobileDay}</span>
            <button
              onClick={() => openAddModal(activeMobileDay)}
              className="p-1 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition cursor-pointer"
              title="Nova tarefa"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredTasks.filter(t => t.dayOfWeek === activeMobileDay).length === 0 ? (
              <div className="py-12 text-center text-text-secondary text-xs flex flex-col items-center gap-2">
                <Sparkles size={24} className="text-indigo-500/40" />
                <p>Nenhuma demanda agendada para hoje.</p>
              </div>
            ) : (
              filteredTasks
                .filter(t => t.dayOfWeek === activeMobileDay)
                .map(task => {
                  const client = clients.find(c => c.id === task.clientId);
                  return (
                    <div 
                      key={task.id}
                      className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border flex flex-col gap-2 text-xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-text-primary text-sm leading-tight">{task.title}</span>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => onDeleteTask(task.id)} className="text-text-secondary hover:text-red-500 p-1 cursor-pointer"><Trash2 size={12} /></button>
                          <button onClick={(e) => openEditModal(task, e)} className="text-text-secondary hover:text-indigo-500 p-1 cursor-pointer"><Edit2 size={12} /></button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        {client ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-text-secondary font-medium min-w-0">
                            {renderClientLogo(client)}
                            <span className="truncate">{client.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-text-secondary font-medium">Geral</span>
                        )}

                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP WEEK BOARD (Screens >= md) */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4 no-scrollbar items-start">
        {weekdays.map(day => {
          const dayTasks = filteredTasks.filter(t => t.dayOfWeek === day);
          return (
            <div 
              key={day}
              className="flex-shrink-0 w-72 glass-panel p-4 rounded-2xl flex flex-col max-h-[550px] overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <span className="font-bold text-xs text-text-secondary uppercase tracking-wider">{day}</span>
                <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-full border border-indigo-500/10">{dayTasks.length}</span>
              </div>

              {/* Tasks scroll container */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mt-3 pr-0.5 py-1">
                {dayTasks.length === 0 ? (
                  <div className="py-8 text-center text-text-secondary/70 text-xs border border-dashed border-glass-border rounded-xl bg-black/5 dark:bg-white/5">
                    Sem tarefas
                  </div>
                ) : (
                  dayTasks.map(task => {
                    const client = clients.find(c => c.id === task.clientId);
                    return (
                      <div 
                        key={task.id}
                        onClick={(e) => openEditModal(task, e)}
                        className="p-3 rounded-xl bg-black/10 dark:bg-white/5 border border-glass-border hover:bg-black/20 dark:hover:bg-white/10 transition cursor-pointer group flex flex-col gap-2 text-xs"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-text-primary text-sm leading-tight">{task.title}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} 
                            className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 p-0.5 rounded transition cursor-pointer"
                            title="Remover"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          {client ? (
                            <div className="flex items-center gap-1.5 text-[10px] text-text-secondary font-medium min-w-0">
                              {renderClientLogo(client)}
                              <span className="truncate max-w-[100px]">{client.name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-text-secondary font-medium">Geral</span>
                          )}

                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add task shortcut bottom */}
              <button
                onClick={() => openAddModal(day)}
                className="mt-3 py-2 bg-black/5 dark:bg-white/5 border border-dashed border-glass-border hover:border-indigo-500/50 hover:bg-indigo-500/5 text-text-secondary hover:text-indigo-500 font-semibold rounded-xl flex items-center justify-center gap-1 transition text-xs cursor-pointer"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal - Cadastro e Edição de Tarefas */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedTask ? "Editar Tarefa" : "Criar Nova Tarefa"}
      >
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          {/* Título / Descrição */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Descrição da Tarefa</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Criar post de carrossel de dicas"
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Dia da Semana */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Dia da Semana</label>
            <select 
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer"
            >
              {weekdays.map(day => (
                <option key={day} value={day} className="bg-slate-100 dark:bg-slate-900 text-text-primary">{day}</option>
              ))}
            </select>
          </div>

          {/* Vincular Cliente */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Vincular Cliente</label>
            <select 
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer"
            >
              <option value="">Nenhum (Tarefa Geral)</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.handle})</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Status Inicial</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer"
            >
              <option value="todo" className="bg-slate-100 dark:bg-slate-900 text-blue-500">A Fazer (Azul)</option>
              <option value="pending" className="bg-slate-100 dark:bg-slate-900 text-amber-500">Pendente (Amarelo)</option>
              <option value="approval" className="bg-slate-100 dark:bg-slate-900 text-orange-500">Em Aprovação (Laranja)</option>
              <option value="urgent" className="bg-slate-100 dark:bg-slate-900 text-red-500">Urgente (Vermelho)</option>
              <option value="completed" className="bg-slate-100 dark:bg-slate-900 text-emerald-500">Concluído (Verde Claro)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-3 border-t border-glass-border">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/10 cursor-pointer"
            >
              {selectedTask ? "Salvar Alterações" : "Criar Tarefa"}
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
