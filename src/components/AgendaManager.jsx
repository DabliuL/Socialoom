import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  Clock, 
  Bell, 
  CheckCircle, 
  Circle,
  Video, 
  Users, 
  FileText,
  AlertCircle
} from 'lucide-react';
import Modal from './Modal';

export default function AgendaManager({ 
  reminders = [], 
  clients = [], 
  onAddReminder, 
  onUpdateReminder, 
  onDeleteReminder,
  onToggleReminderCompleted
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState('Captação'); // Captação, Reunião, Publicação, Outro
  const [notes, setNotes] = useState('');

  // Filter State
  const [filterType, setFilterType] = useState('all');

  const openAddModal = () => {
    setSelectedReminder(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('14:00');
    setClientId('');
    setType('Captação');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (rem, e) => {
    e.stopPropagation();
    setSelectedReminder(rem);
    setTitle(rem.title);
    setDate(rem.date);
    setTime(rem.time || '');
    setClientId(rem.clientId || '');
    setType(rem.type || 'Captação');
    setNotes(rem.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const reminderData = {
      title,
      date,
      time,
      clientId: clientId || null,
      type,
      notes,
      completed: selectedReminder ? selectedReminder.completed : false
    };

    if (selectedReminder) {
      onUpdateReminder(selectedReminder.id, reminderData);
    } else {
      onAddReminder(reminderData);
    }
    setIsModalOpen(false);
  };

  // Helper to render type icon & color
  const getTypeMeta = (t) => {
    switch (t) {
      case 'Captação':
        return { 
          icon: <Video size={14} />, 
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          indicator: 'bg-purple-500'
        };
      case 'Reunião':
        return { 
          icon: <Users size={14} />, 
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          indicator: 'bg-blue-500'
        };
      case 'Publicação':
        return { 
          icon: <Calendar size={14} />, 
          badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
          indicator: 'bg-pink-500'
        };
      default:
        return { 
          icon: <Bell size={14} />, 
          badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          indicator: 'bg-amber-500'
        };
    }
  };

  const renderClientLogo = (client) => {
    if (client && client.logo) {
      return <img src={client.logo} alt={client.name} className="w-5 h-5 rounded-full object-cover border border-glass-border" />;
    }
    const initials = client ? client.name.substring(0, 2).toUpperCase() : 'CL';
    return (
      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold">
        {initials}
      </div>
    );
  };

  // Group reminders by date
  const filteredReminders = reminders
    .filter(r => filterType === 'all' || r.type === filterType)
    .sort((a, b) => {
      // Sort by date first (lexicographical string comparison)
      const dateCompare = (a.date || '').localeCompare(b.date || '');
      if (dateCompare !== 0) return dateCompare;
      // If dates are equal, sort by time (lexicographical string comparison)
      return (a.time || '00:00').localeCompare(b.time || '00:00');
    });

  // Group reminders
  const groupedReminders = filteredReminders.reduce((acc, curr) => {
    const dateStr = curr.date;
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(curr);
    return acc;
  }, {});

  // Date label helper
  const getDateLabel = (dateStr) => {
    if (!dateStr) return 'Sem data';

    // Get local today and tomorrow strings
    const getLocalStr = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const today = getLocalStr(new Date());

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = getLocalStr(tomorrowDate);

    if (dateStr === today) return 'Hoje';
    if (dateStr === tomorrow) return 'Amanhã';

    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        // Create date at local noon to avoid timezone shift
        const parsedDate = new Date(year, month, day, 12, 0, 0);
        if (!isNaN(parsedDate.getTime())) {
          const formatted = parsedDate.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          });
          return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }
      }
    } catch (e) {
      console.error('Erro ao formatar data:', e);
    }

    return dateStr; // fallback
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Agenda de Eventos</h2>
          <p className="text-text-secondary text-sm">Organize gravações, sessões de captação de fotos e reuniões.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-indigo-500 text-black font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20 text-sm cursor-pointer"
        >
          <Plus size={18} /> Novo Evento
        </button>
      </div>

      {/* Stats and filter widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat Widget */}
        <div className="glass-panel p-4 rounded-2xl md:col-span-1 flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Próximos Eventos</span>
          <h3 className="text-2xl font-black text-text-primary">
            {reminders.filter(r => !r.completed).length}
          </h3>
          <span className="text-[9px] text-text-secondary">Compromissos pendentes</span>
        </div>

        {/* Filters and Search */}
        <div className="glass-panel p-4 rounded-2xl md:col-span-3 flex flex-wrap gap-4 items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-text-secondary block">Filtrar por Tipo</span>
            <div className="flex gap-2">
              {['all', 'Captação', 'Reunião', 'Publicação', 'Outro'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${filterType === t ? 'bg-indigo-500 text-black border-indigo-500' : 'bg-black/5 dark:bg-white/5 text-text-secondary border-glass-border'}`}
                >
                  {t === 'all' ? 'Todos' : t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-6">
        {Object.keys(groupedReminders).length === 0 ? (
          <div className="glass-panel p-16 text-center text-text-secondary flex flex-col items-center justify-center gap-4 rounded-2xl border-dashed">
            <Calendar size={48} className="text-indigo-500/40" />
            <div>
              <h3 className="font-bold text-lg text-text-primary">Nenhum compromisso agendado</h3>
              <p className="text-sm">Agende captações de fotos, Reels ou reuniões para ter controle da sua agenda.</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-indigo-500 hover:bg-indigo-600 text-black font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Criar Primeiro Evento
            </button>
          </div>
        ) : (
          Object.keys(groupedReminders).map(dateStr => (
            <div key={dateStr} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-xl">
                  {getDateLabel(dateStr)}
                </span>
                <div className="flex-1 h-px bg-glass-border"></div>
              </div>

              {/* Day's events */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedReminders[dateStr].map(rem => {
                  const client = clients.find(c => c.id === rem.clientId);
                  const meta = getTypeMeta(rem.type);
                  return (
                    <div 
                      key={rem.id}
                      className={`glass-panel p-4 rounded-2xl flex items-start gap-4 transition border group ${rem.completed ? 'opacity-60 bg-slate-900/5' : 'hover:shadow-md'}`}
                    >
                      {/* Checkbox */}
                      <button 
                        onClick={() => onToggleReminderCompleted(rem.id)}
                        className="mt-1 text-text-secondary hover:text-indigo-500 transition cursor-pointer flex-shrink-0"
                      >
                        {rem.completed ? (
                          <CheckCircle className="text-emerald-500" size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>

                      {/* Content details */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${meta.badge}`}>
                            {meta.icon}
                            {rem.type}
                          </span>

                          {rem.time && (
                            <span className="text-[10px] font-bold text-text-secondary flex items-center gap-1">
                              <Clock size={12} className="text-indigo-500" />
                              {rem.time}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className={`text-base font-bold text-text-primary truncate ${rem.completed ? 'line-through text-text-secondary' : ''}`}>
                            {rem.title}
                          </h4>
                          {rem.notes && (
                            <p className="text-xs text-text-secondary mt-1 line-clamp-2">{rem.notes}</p>
                          )}
                        </div>

                        {/* Client Binder */}
                        {client && (
                          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-text-secondary font-medium min-w-0">
                            {renderClientLogo(client)}
                            <span className="truncate">{client.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                        <button 
                          onClick={(e) => openEditModal(rem, e)}
                          className="p-1 text-text-secondary hover:text-indigo-500 rounded hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => onDeleteReminder(rem.id)}
                          className="p-1 text-text-secondary hover:text-red-500 rounded hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal - Cadastro e Edição de Evento */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedReminder ? "Editar Evento" : "Agendar Novo Evento"}
      >
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          {/* Título / Descrição */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Descrição do Evento</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Captação de Reels - Coleção de Inverno"
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Tipo de Compromisso */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Tipo de Evento</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer"
            >
              <option value="Captação">Captação (Fotos/Gravação)</option>
              <option value="Reunião">Reunião com Cliente</option>
              <option value="Publicação">Publicação Especial</option>
              <option value="Outro">Outros Lembretes</option>
            </select>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-3">
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
            <div className="space-y-1">
              <label className="block font-bold text-text-secondary text-xs uppercase">Horário</label>
              <input 
                type="time" 
                value={time || ''}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Vincular Cliente */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Vincular Cliente</label>
            <select 
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer"
            >
              <option value="">Nenhum (Compromisso Geral)</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.handle})</option>
              ))}
            </select>
          </div>

          {/* Notas / Observações */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Notas / Detalhes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Levar câmera, carregar baterias, roteiro de Reels em anexo..."
              rows="3"
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-glass-border">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-black font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/15 cursor-pointer"
            >
              {selectedReminder ? "Salvar Evento" : "Agendar Evento"}
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
