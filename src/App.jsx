import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  DollarSign, 
  Moon, 
  Sun, 
  Download, 
  Upload,
  Sparkles,
  Menu,
  X,
  Calendar,
  FolderOpen
} from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import ClientManager from './components/ClientManager';
import TaskManager from './components/TaskManager';
import FinanceManager from './components/FinanceManager';
import AgendaManager from './components/AgendaManager';
import PastasManager from './components/PastasManager';
import Modal from './components/Modal';

import logoImg from './assets/logo.jpg';

const DEFAULT_CLIENTS = [
  {
    id: 'c1',
    name: 'Padaria Pão Quente',
    logo: '',
    socialNetwork: 'Instagram',
    handle: '@padariapaoquente',
    startDate: '2026-01-10',
    paymentDay: 10,
    paymentValue: 1200,
    weeklyContent: { posts: 3, reels: 1, stories: 7 },
    paymentStatus: 'paid'
  },
  {
    id: 'c2',
    name: 'Clínica Sorriso',
    logo: '',
    socialNetwork: 'Facebook',
    handle: '@clinicasorrisoodonto',
    startDate: '2026-03-05',
    paymentDay: 5,
    paymentValue: 2000,
    weeklyContent: { posts: 4, reels: 2, stories: 5 },
    paymentStatus: 'overdue'
  }
];

const DEFAULT_TASKS = [
  { id: 't1', title: 'Post Carrossel: Dicas de pães', dayOfWeek: 'Segunda', clientId: 'c1', status: 'completed' },
  { id: 't2', title: 'Reels: Bastidores da cozinha', dayOfWeek: 'Quarta', clientId: 'c1', status: 'approval' },
  { id: 't3', title: 'Story informativo: Horário feriado', dayOfWeek: 'Sexta', clientId: 'c1', status: 'todo' },
  { id: 't4', title: 'Post estático: Prevenção tártaro', dayOfWeek: 'Terça', clientId: 'c2', status: 'pending' },
  { id: 't5', title: 'Reels: Depoimento de paciente', dayOfWeek: 'Quinta', clientId: 'c2', status: 'urgent' }
];

const DEFAULT_TRANSACTIONS = [
  { id: 'tr1', description: 'Assinatura Canva Pro', type: 'outflow', amount: 34.90, date: new Date().toISOString().split('T')[0] },
  { id: 'tr2', description: 'Assinatura CapCut Pro', type: 'outflow', amount: 49.90, date: new Date().toISOString().split('T')[0] }
];

const DEFAULT_REMINDERS = [
  { id: 'rem1', title: 'Captação de Reels - Padaria Pão Quente', date: new Date().toISOString().split('T')[0], time: '14:00', clientId: 'c1', type: 'Captação', notes: 'Levar tripé, luzes e estabilizador de celular.', completed: false },
  { id: 'rem2', title: 'Reunião de Briefing - Sorriso', date: new Date().toISOString().split('T')[0], time: '10:00', clientId: 'c2', type: 'Reunião', notes: 'Definir posts da próxima semana e alinhar datas de aprovação.', completed: false }
];

export default function App() {
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [foldersData, setFoldersData] = useState({});
  const [userName, setUserName] = useState('Social Media');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  
  // Backup modal state
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [pasteText, setPasteText] = useState('');

  // Shortcut states to trigger child modal forms
  const [taskManagerRef, setTaskManagerRef] = useState(null);
  const [clientManagerRef, setClientManagerRef] = useState(null);

  const openBackupModal = () => {
    const data = JSON.stringify({ clients, tasks, transactions, userName, reminders, foldersData });
    setBackupText(data);
    setPasteText('');
    setIsBackupModalOpen(true);
  };

  // 1. Initial Load
  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('socialoom_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load data
    const savedData = localStorage.getItem('socialoom_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setClients(parsed.clients || []);
        setTasks(parsed.tasks || []);
        setTransactions(parsed.transactions || []);
        setUserName(parsed.userName || 'Social Media');
        setReminders(parsed.reminders || []);
        setFoldersData(parsed.foldersData || {});
      } catch (e) {
        console.error('Erro ao ler localStorage', e);
        loadDefaultMockData();
      }
    } else {
      loadDefaultMockData();
    }
  }, []);

  // 2. Save Data on changes
  useEffect(() => {
    if (clients.length > 0 || tasks.length > 0 || transactions.length > 0 || reminders.length > 0 || Object.keys(foldersData).length > 0 || userName !== 'Social Media') {
      try {
        localStorage.setItem('socialoom_data', JSON.stringify({
          clients,
          tasks,
          transactions,
          userName,
          reminders,
          foldersData
        }));
      } catch (err) {
        console.error('Erro ao salvar dados no localStorage (cota excedida?):', err);
      }
    }
  }, [clients, tasks, transactions, userName, reminders]);

  const loadDefaultMockData = () => {
    setClients(DEFAULT_CLIENTS);
    setTasks(DEFAULT_TASKS);
    setTransactions(DEFAULT_TRANSACTIONS);
    setReminders(DEFAULT_REMINDERS);
  };

  // 3. Theme switch handler
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('socialoom_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 4. Global Action Handlers
  // Clients CRUD
  const handleAddClient = (newClient) => {
    const client = { ...newClient, id: `c_${Date.now()}` };
    setClients(prev => [...prev, client]);
  };
  
  const handleUpdateClient = (id, updatedClient) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedClient } : c));
  };
  
  const handleDeleteClient = (id) => {
    // Delete client
    setClients(prev => prev.filter(c => c.id !== id));
    // Remove tasks associated with this client
    setTasks(prev => prev.filter(t => t.clientId !== id));
  };

  const handleUpdateClientStatus = (id, newStatus) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, paymentStatus: newStatus } : c));
  };

  // Tasks CRUD
  const handleAddTask = (newTask) => {
    const task = { ...newTask, id: `t_${Date.now()}` };
    setTasks(prev => [...prev, task]);
  };

  const handleUpdateTask = (id, updatedTask) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedTask } : t));
  };

  const handleUpdateTaskStatus = (id, nextStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Transactions CRUD
  const handleAddTransaction = (newTransaction) => {
    const trans = { ...newTransaction, id: `tr_${Date.now()}` };
    setTransactions(prev => [trans, ...prev]);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Reminders CRUD
  const handleAddReminder = (newReminder) => {
    const rem = { ...newReminder, id: `rem_${Date.now()}` };
    setReminders(prev => [...prev, rem]);
  };

  const handleUpdateReminder = (id, updatedReminder) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updatedReminder } : r));
  };

  const handleDeleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleReminderCompleted = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  // Backup handlers inside the Backup Modal
  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(backupText);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `loom_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleShareBackup = async () => {
    if (navigator.share) {
      try {
        const file = new File(
          [backupText], 
          `loom_backup_${new Date().toISOString().split('T')[0]}.json`, 
          { type: 'application/json' }
        );
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Loom Backup',
            text: 'Backup dos dados do Loom.'
          });
        } else {
          await navigator.share({
            title: 'Loom Backup Code',
            text: backupText
          });
        }
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
        handleCopyBackupCode();
      }
    } else {
      handleCopyBackupCode();
    }
  };

  const handleCopyBackupCode = () => {
    navigator.clipboard.writeText(backupText);
    alert('Código de backup copiado para a área de transferência!');
  };

  const handleImportTextBackup = () => {
    if (!pasteText.trim()) {
      alert('Por favor, cole um código de backup válido.');
      return;
    }
    try {
      const parsed = JSON.parse(pasteText);
      if (parsed.clients || parsed.tasks || parsed.transactions || parsed.userName || parsed.reminders || parsed.foldersData) {
        setClients(parsed.clients || []);
        setTasks(parsed.tasks || []);
        setTransactions(parsed.transactions || []);
        setUserName(parsed.userName || 'Social Media');
        setReminders(parsed.reminders || []);
        setFoldersData(parsed.foldersData || {});
        alert("Backup restaurado com sucesso!");
        setIsBackupModalOpen(false);
      } else {
        alert("Código de backup inválido.");
      }
    } catch (err) {
      alert("Erro ao decodificar código JSON. Certifique-se de que copiou o código completo.");
    }
  };

  const handleImportFileBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.clients || parsed.tasks || parsed.transactions || parsed.userName || parsed.reminders || parsed.foldersData) {
          setClients(parsed.clients || []);
          setTasks(parsed.tasks || []);
          setTransactions(parsed.transactions || []);
          setUserName(parsed.userName || 'Social Media');
          setReminders(parsed.reminders || []);
          setFoldersData(parsed.foldersData || {});
          alert("Backup restaurado com sucesso!");
          setIsBackupModalOpen(false);
        } else {
          alert("Arquivo de backup inválido.");
        }
      } catch (err) {
        alert("Erro ao decodificar arquivo JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  };

  // Nav Items Helper
  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={18} /> },
    { id: 'clients', label: 'Clientes', icon: <Users size={18} /> },
    { id: 'tasks', label: 'Tarefas', icon: <CheckSquare size={18} /> },
    { id: 'agenda', label: 'Agenda', icon: <Calendar size={18} /> },
    { id: 'pastas', label: 'Pastas', icon: <FolderOpen size={18} /> },
    { id: 'finance', label: 'Finanças', icon: <DollarSign size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-bg-app text-text-primary flex flex-col">
      
      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 1. SIDEBAR (Desktop Fixed / Mobile Drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-glass-border p-6 flex flex-col justify-between h-full transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:fixed md:flex`}>
        <div className="space-y-8">
          {/* Logo Brand & Close button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="Logo" className="w-9 h-9 rounded-xl object-cover bg-white p-0.5 border border-glass-border shadow-md" />
              <div>
                <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-yellow-300 bg-clip-text text-transparent leading-none mb-1">Loom</h1>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Gestão de Mídias</span>
              </div>
            </div>
            
            {/* Close Button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${currentTab === item.id ? 'bg-indigo-500 text-black shadow-lg shadow-indigo-500/15' : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4 pt-4 border-t border-glass-border">
          {/* Backup utility */}
          <button 
            onClick={openBackupModal}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/25 hover:border-indigo-500/40 transition font-semibold cursor-pointer text-xs"
            title="Gestão de Backups"
          >
            <Download size={14} /> Gestão de Backups
          </button>

          {/* Theme & Profile Panel */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border">
            <span className="text-xs font-semibold text-text-secondary ml-1">Tema</span>
            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary bg-glass-bg border border-glass-border transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-500" />}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. HEADER BAR (Mobile always / Desktop when sidebar is closed) */}
      <header className={`${isSidebarOpen ? 'md:hidden' : ''} glass-panel border-b border-glass-border p-3 sticky top-0 z-40 flex items-center justify-between w-full`}>
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button (prominent style) */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-indigo-500 text-black hover:bg-indigo-600 transition cursor-pointer flex items-center justify-center shadow-md shadow-indigo-500/15"
            title="Abrir Menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="w-7 h-7 rounded-lg object-cover bg-white p-0.5 border border-glass-border shadow-sm" />
            <div>
              <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-yellow-300 bg-clip-text text-transparent leading-none">Loom</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Backup Action */}
          <button 
            onClick={openBackupModal} 
            className="p-1.5 text-text-secondary hover:text-text-primary cursor-pointer flex items-center justify-center" 
            title="Gestão de Backups"
          >
            <Download size={16} />
          </button>
          <div className="w-px h-4 bg-glass-border mx-1"></div>
          
          {/* Theme switcher */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary bg-black/5 dark:bg-white/5 transition cursor-pointer flex items-center justify-center"
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-500" />}
          </button>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE */}
      <main className={`flex-1 p-4 md:p-8 pb-20 md:pb-8 max-w-7xl min-w-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        {currentTab === 'dashboard' && (
          <Dashboard 
            clients={clients}
            tasks={tasks}
            reminders={reminders}
            onToggleReminderCompleted={handleToggleReminderCompleted}
            userName={userName}
            onUpdateUserName={setUserName}
            onNavigate={setCurrentTab}
            onAddClient={() => {
              setCurrentTab('clients');
              setTimeout(() => {
                const btn = document.querySelector('button[class*="bg-indigo-500"]');
                if (btn) btn.click();
              }, 100);
            }}
            onAddTask={() => {
              setCurrentTab('tasks');
              setTimeout(() => {
                const btn = document.querySelector('button[class*="bg-indigo-500"]');
                if (btn) btn.click();
              }, 100);
            }}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        )}

        {currentTab === 'clients' && (
          <ClientManager 
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskManager 
            tasks={tasks}
            clients={clients}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {currentTab === 'agenda' && (
          <AgendaManager 
            reminders={reminders}
            clients={clients}
            onAddReminder={handleAddReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
            onToggleReminderCompleted={handleToggleReminderCompleted}
          />
        )}

        {currentTab === 'pastas' && (
          <PastasManager 
            clients={clients}
            foldersData={foldersData}
            onUpdateFoldersData={setFoldersData}
          />
        )}

        {currentTab === 'finance' && (
          <FinanceManager 
            clients={clients}
            transactions={transactions}
            onUpdateClientStatus={handleUpdateClientStatus}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
      </main>

      {/* 4. BOTTOM NAVIGATION BAR (Mobile only - md down) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-glass-border p-2 px-6 flex justify-between items-center rounded-t-2xl">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition cursor-pointer ${currentTab === item.id ? 'text-indigo-500' : 'text-text-secondary'}`}
          >
            {item.icon}
            <span className="text-[9px] font-bold uppercase">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 5. BACKUP & RESTORE MODAL */}
      <Modal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        title="Gestão de Backups"
      >
        <div className="space-y-6 text-sm">
          {/* Seção de Exportação */}
          <div className="space-y-3 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider text-indigo-400">Exportar Backup</h4>
            <p className="text-xs text-text-secondary">Salve seus clientes, tarefas e financeiro para não perder nada.</p>
            <div className="flex flex-col gap-2 pt-1">
              <button 
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-black font-semibold transition cursor-pointer text-xs shadow-md shadow-indigo-500/15"
              >
                <Download size={14} /> Baixar Arquivo JSON (PC/Web)
              </button>
              {navigator.share && (
                <button 
                  onClick={handleShareBackup}
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition cursor-pointer text-xs shadow-md shadow-purple-500/10"
                >
                  <Upload size={14} /> Compartilhar Backup (Android/Mobile)
                </button>
              )}
              <button 
                onClick={handleCopyBackupCode}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-black/10 dark:bg-white/5 border border-glass-border text-text-primary hover:bg-black/20 dark:hover:bg-white/10 font-semibold transition cursor-pointer text-xs"
              >
                Copiar Código de Backup (Texto)
              </button>
            </div>
          </div>

          {/* Seção de Importação */}
          <div className="space-y-3 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider text-indigo-400">Importar Backup</h4>
            <p className="text-xs text-text-secondary">Restaure seus dados a partir de um arquivo JSON ou de um código copiado.</p>
            
            <div className="flex flex-col gap-3 pt-1">
              {/* Arquivo */}
              <label 
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-black/10 dark:bg-white/5 border border-glass-border text-text-primary hover:bg-black/20 dark:hover:bg-white/10 font-semibold transition cursor-pointer text-xs"
              >
                <Upload size={14} /> Selecionar Arquivo JSON
                <input type="file" accept=".json" className="hidden" onChange={handleImportFileBackup} />
              </label>
              
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-glass-border"></div>
                <span className="flex-shrink mx-3 text-text-secondary text-[10px] uppercase font-bold">Ou via código</span>
                <div className="flex-grow border-t border-glass-border"></div>
              </div>

              {/* Área de texto */}
              <div className="space-y-1.5">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Cole o código JSON do seu backup aqui..."
                  rows="3"
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 text-xs font-mono"
                />
                <button 
                  onClick={handleImportTextBackup}
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-black font-bold rounded-xl transition cursor-pointer text-xs shadow-lg shadow-indigo-500/15"
                >
                  Restaurar via Código
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
