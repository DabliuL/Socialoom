import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Filter, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2
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
  const [filterWeekday, setFilterWeekday] = useState('all');

  const weekdays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const statuses = ['todo', 'pending', 'approval', 'urgent', 'completed'];

  // Mobile View Active Status Tab (Default: todo)
  const [activeMobileStatus, setActiveMobileStatus] = useState('todo');

  const openAddModal = (colStatus = 'todo') => {
    setSelectedTask(null);
    setTitle('');
    setDayOfWeek('Segunda');
    setClientId('');
    setStatus(colStatus);
    setIsModalOpen(true);
  };

  const openEditModal = (task, e) => {
    e.stopPropagation();
    setSelectedTask(task);
    setTitle(task.title);
    setDayOfWeek(task.dayOfWeek || 'Segunda');
    setClientId(task.clientId || '');
    setStatus(task.status || 'todo');
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

  const getStatusColumnColor = (s) => {
    switch (s) {
      case 'todo': return 'border-blue-500/20 bg-blue-500/[0.02] text-blue-500';
      case 'pending': return 'border-yellow-500/20 bg-yellow-500/[0.02] text-yellow-600 dark:text-yellow-400';
      case 'approval': return 'border-orange-500/20 bg-orange-500/[0.02] text-orange-500';
      case 'urgent': return 'border-red-500/20 bg-red-500/[0.02] text-red-400';
      case 'completed': return 'border-green-500/20 bg-green-500/[0.02] text-green-600 dark:text-green-400';
      default: return 'border-glass-border bg-black/5 text-text-secondary';
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

  const getStatusTextColor = (s) => {
    switch (s) {
      case 'todo': return 'text-blue-500';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'approval': return 'text-orange-500';
      case 'urgent': return 'text-red-500';
      case 'completed': return 'text-green-600 dark:text-green-400';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBorderColor = (s) => {
    switch (s) {
      case 'todo': return 'border-t-blue-500';
      case 'pending': return 'border-t-yellow-500';
      case 'approval': return 'border-t-orange-500';
      case 'urgent': return 'border-t-red-500';
      case 'completed': return 'border-t-green-500';
      default: return 'border-t-glass-border';
    }
  };

  const getStatusBadgeColor = (s) => {
    switch (s) {
      case 'todo': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'approval': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
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
    const matchWeekday = filterWeekday === 'all' || task.dayOfWeek === filterWeekday;
    return matchClient && matchWeekday;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Quadro de Tarefas</h2>
          <p className="text-text-secondary text-sm">Gerencie o fluxo de aprovação e execução dos seus conteúdos.</p>
        </div>
        <button
          onClick={() => openAddModal(activeMobileStatus)}
          className="flex items-center gap-1.5 bg-indigo-500 text-black font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20 text-sm cursor-pointer"
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

          {/* Weekday Filter */}
          <select 
            value={filterWeekday}
            onChange={(e) => setFilterWeekday(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-xs text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="all">Qualquer Dia</option>
            {weekdays.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MOBILE STATUS TABS (Screens < md) */}
      <div className="block md:hidden space-y-4">
        {/* Navigation buttons */}
        <div className={`flex items-center justify-between border rounded-xl p-1 ${getStatusColumnColor(activeMobileStatus)}`}>
          <button 
            onClick={() => {
              const currentIdx = statuses.indexOf(activeMobileStatus);
              const prevIdx = currentIdx === 0 ? statuses.length - 1 : currentIdx - 1;
              setActiveMobileStatus(statuses[prevIdx]);
            }}
            className="p-2 text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="font-bold text-sm text-text-primary">{getStatusLabel(activeMobileStatus)}</span>
          
          <button 
            onClick={() => {
              const currentIdx = statuses.indexOf(activeMobileStatus);
              const nextIdx = currentIdx === statuses.length - 1 ? 0 : currentIdx + 1;
              setActiveMobileStatus(statuses[nextIdx]);
            }}
            className="p-2 text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Quick select buttons */}
        <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setActiveMobileStatus(st)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${activeMobileStatus === st ? 'bg-indigo-500 text-black border-indigo-500' : 'bg-black/5 dark:bg-white/5 text-text-secondary border-glass-border'}`}
            >
              {getStatusLabel(st)}
            </button>
          ))}
        </div>

        {/* Mobile tasks list for activeMobileStatus */}
        <div className="glass-panel p-4 rounded-2xl min-h-[300px] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-glass-border">
            <span className={`font-bold text-xs uppercase ${getStatusTextColor(activeMobileStatus)}`}>{getStatusLabel(activeMobileStatus)}</span>
            <button
              onClick={() => openAddModal(activeMobileStatus)}
              className="p-1 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition cursor-pointer"
              title="Nova tarefa nesta coluna"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredTasks.filter(t => t.status === activeMobileStatus).length === 0 ? (
              <div className="py-12 text-center text-text-secondary text-xs flex flex-col items-center gap-2">
                <Sparkles size={24} className="text-indigo-500/40" />
                <p>Nenhuma tarefa nesta etapa do fluxo.</p>
              </div>
            ) : (
              filteredTasks
                .filter(t => t.status === activeMobileStatus)
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
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Deseja realmente excluir esta tarefa?')) {
                                onDeleteTask(task.id);
                              }
                            }} 
                            className="text-text-secondary hover:text-red-500 p-1 cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 size={12} />
                          </button>
                          <button onClick={(e) => openEditModal(task, e)} className="text-text-secondary hover:text-indigo-500 p-1 cursor-pointer" title="Editar"><Edit2 size={12} /></button>
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

                        <span className="px-2 py-0.5 rounded-full border border-glass-border bg-black/5 dark:bg-white/5 text-[10px] font-semibold text-text-secondary flex items-center gap-1">
                          <Calendar size={10} className="text-indigo-500" />
                          {task.dayOfWeek || 'Segunda'}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP STATUS KANBAN BOARD (Screens >= md) */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4 no-scrollbar items-start">
        {statuses.map(st => {
          const statusTasks = filteredTasks.filter(t => t.status === st);
          return (
            <div 
              key={st}
              className={`flex-shrink-0 w-72 glass-panel p-4 rounded-2xl flex flex-col max-h-[550px] overflow-hidden border-t-4 ${getStatusBorderColor(st)}`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <span className={`font-bold text-xs uppercase tracking-wider ${getStatusTextColor(st)}`}>{getStatusLabel(st)}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getStatusBadgeColor(st)}`}>{statusTasks.length}</span>
              </div>

              {/* Tasks scroll container */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mt-3 pr-0.5 py-1">
                {statusTasks.length === 0 ? (
                  <div className="py-8 text-center text-text-secondary/70 text-xs border border-dashed border-glass-border rounded-xl bg-black/5 dark:bg-white/5">
                    Sem tarefas
                  </div>
                ) : (
                  statusTasks.map(task => {
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
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (confirm('Deseja realmente excluir esta tarefa?')) {
                                onDeleteTask(task.id); 
                              }
                            }} 
                            className="text-text-secondary hover:text-red-500 opacity-50 group-hover:opacity-100 p-0.5 rounded transition cursor-pointer"
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

                          <span className="px-2 py-0.5 rounded-full border border-glass-border bg-black/5 dark:bg-white/5 text-[9px] font-semibold text-text-secondary flex items-center gap-1">
                            <Calendar size={10} className="text-indigo-500" />
                            {task.dayOfWeek || 'Segunda'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add task shortcut bottom */}
              <button
                onClick={() => openAddModal(st)}
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
                <option key={day} value={day}>{day}</option>
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
            <label className="block font-bold text-text-secondary text-xs uppercase">Status / Etapa</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer"
            >
              <option value="todo">A Fazer</option>
              <option value="pending">Pendente</option>
              <option value="approval">Em Aprovação</option>
              <option value="urgent">Urgente</option>
              <option value="completed">Concluído</option>
            </select>
          </div>

          <div className="flex gap-3 pt-3 border-t border-glass-border">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-black font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/15 cursor-pointer"
            >
              {selectedTask ? "Salvar Alterações" : "Criar Tarefa"}
            </button>
            {selectedTask && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente excluir esta tarefa?')) {
                    onDeleteTask(selectedTask.id);
                    setIsModalOpen(false);
                  }
                }}
                className="px-4 py-2.5 bg-red-500/15 text-red-500 font-bold border border-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition cursor-pointer"
                title="Excluir Tarefa"
              >
                <Trash2 size={16} />
              </button>
            )}
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
