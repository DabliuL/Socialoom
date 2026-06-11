import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Video, 
  FileText,
  Upload,
  UserCheck,
  Globe
} from 'lucide-react';
import SocialIcon from './SocialIcon';
import Modal from './Modal';

export default function ClientManager({ 
  clients = [], 
  onAddClient, 
  onUpdateClient, 
  onDeleteClient 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [socialNetwork, setSocialNetwork] = useState('Instagram');
  const [handle, setHandle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [paymentDay, setPaymentDay] = useState(5);
  const [paymentValue, setPaymentValue] = useState('');
  const [posts, setPosts] = useState(3);
  const [reels, setReels] = useState(1);
  const [stories, setStories] = useState(5);

  // Detail View State
  const [detailClient, setDetailClient] = useState(null);

  // Convert uploaded image to base64
  // Convert uploaded image to base64 with canvas compression
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 128;
        const MAX_HEIGHT = 128;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setLogo(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setSelectedClient(null);
    setName('');
    setLogo('');
    setSocialNetwork('Instagram');
    setHandle('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setPaymentDay(5);
    setPaymentValue('');
    setPosts(3);
    setReels(1);
    setStories(5);
    setIsModalOpen(true);
  };

  const openEditModal = (client, e) => {
    e.stopPropagation(); // Avoid opening detail view
    setSelectedClient(client);
    setName(client.name);
    setLogo(client.logo || '');
    setSocialNetwork(client.socialNetwork || 'Instagram');
    setHandle(client.handle || '');
    setStartDate(client.startDate || '');
    setPaymentDay(client.paymentDay || 5);
    setPaymentValue(client.paymentValue || '');
    setPosts(client.weeklyContent?.posts || 0);
    setReels(client.weeklyContent?.reels || 0);
    setStories(client.weeklyContent?.stories || 0);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const clientData = {
      name,
      logo,
      socialNetwork,
      handle: handle.startsWith('@') || socialNetwork === 'Outro' ? handle : `@${handle}`,
      startDate,
      paymentDay: Number(paymentDay),
      paymentValue: Number(paymentValue),
      weeklyContent: {
        posts: Number(posts),
        reels: Number(reels),
        stories: Number(stories)
      },
      paymentStatus: selectedClient ? selectedClient.paymentStatus : 'paid' // default active
    };

    if (selectedClient) {
      onUpdateClient(selectedClient.id, clientData);
    } else {
      onAddClient(clientData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, name, e) => {
    e.stopPropagation();
    if (confirm(`Tem certeza de que deseja remover o cliente "${name}"?`)) {
      onDeleteClient(id);
      if (detailClient && detailClient.id === id) {
        setDetailClient(null);
      }
    }
  };

  // Render social network icon helper
  const getSocialIcon = (net, size = 16) => {
    if (net === 'TikTok') {
      return <Video size={size} className="text-purple-400" />;
    }
    return <SocialIcon network={net} size={size} />;
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Logo rendering helper
  const renderLogo = (logoUrl, nameString, sizeClass = "w-12 h-12") => {
    if (logoUrl) {
      return <img src={logoUrl} alt={nameString} className={`${sizeClass} rounded-full object-cover border border-glass-border shadow`} />;
    }
    const initials = nameString ? nameString.substring(0, 2).toUpperCase() : 'CL';
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Gestão de Clientes</h2>
          <p className="text-text-secondary text-sm">Adicione, edite e monitore os dados dos seus clientes gerenciados.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-indigo-500 text-black font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20 text-sm cursor-pointer"
        >
          <Plus size={18} /> Cadastrar Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main list of clients */}
        <div className="lg:col-span-2 space-y-4">
          {clients.length === 0 ? (
            <div className="glass-panel p-12 text-center text-text-secondary flex flex-col items-center justify-center gap-4 rounded-2xl">
              <UserCheck size={48} className="text-indigo-500/40" />
              <div>
                <h3 className="font-bold text-lg text-text-primary">Nenhum cliente cadastrado</h3>
                <p className="text-sm">Cadastre seu primeiro cliente de Social Media para começar.</p>
              </div>
              <button
                onClick={openAddModal}
                className="bg-indigo-500 hover:bg-indigo-600 text-black font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cadastrar Agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clients.map(client => (
                <div 
                  key={client.id}
                  onClick={() => setDetailClient(client)}
                  className={`glass-panel p-5 rounded-2xl flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-lg transition cursor-pointer border ${detailClient && detailClient.id === client.id ? 'border-indigo-500/50 bg-indigo-500/[0.03]' : 'border-glass-border'}`}
                >
                  <div className="flex items-start gap-4">
                    {renderLogo(client.logo, client.name)}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-text-primary truncate">{client.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-secondary min-w-0">
                        {getSocialIcon(client.socialNetwork, 14)}
                        <span className="truncate">{client.handle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-glass-border flex justify-between items-center text-xs">
                    <div>
                      <span className="text-text-secondary">Mensalidade: </span>
                      <span className="font-bold text-text-primary">{formatCurrency(client.paymentValue)}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => openEditModal(client, e)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-indigo-500 hover:bg-indigo-500/10 transition cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(client.id, client.name, e)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                        title="Deletar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side details view */}
        <div className="lg:col-span-1">
          {detailClient ? (
            <div className="glass-panel p-5 rounded-2xl space-y-6 sticky top-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {renderLogo(detailClient.logo, detailClient.name, "w-14 h-14")}
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{detailClient.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-text-secondary">
                      {getSocialIcon(detailClient.socialNetwork)}
                      <span>{detailClient.handle}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${detailClient.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : detailClient.paymentStatus === 'overdue' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                  {detailClient.paymentStatus === 'paid' ? 'Em dia' : detailClient.paymentStatus === 'overdue' ? 'Atrasado' : 'Encerrado'}
                </span>
              </div>

              {/* Contract Information */}
              <div className="space-y-3 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-glass-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Contrato e Finanças</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-text-secondary block">Valor Mensal:</span>
                    <span className="font-bold text-text-primary text-sm flex items-center gap-0.5"><DollarSign size={14} className="text-indigo-500" />{formatCurrency(detailClient.paymentValue)}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Dia de Pagamento:</span>
                    <span className="font-bold text-text-primary text-sm flex items-center gap-0.5"><Calendar size={14} className="text-indigo-500" />Dia {detailClient.paymentDay}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-secondary block">Início do Contrato:</span>
                    <span className="font-semibold text-text-primary">{detailClient.startDate ? new Date(detailClient.startDate).toLocaleDateString('pt-BR') : 'Não cadastrado'}</span>
                  </div>
                </div>
              </div>

              {/* Weekly Deliverables */}
              <div className="space-y-3 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-glass-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Entregáveis Semanais</h4>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                    <span className="text-[10px] text-text-secondary block">Posts</span>
                    <span className="text-lg font-bold text-indigo-400">{detailClient.weeklyContent?.posts || 0}</span>
                  </div>
                  <div className="bg-purple-500/5 p-2 rounded-lg border border-purple-500/10">
                    <span className="text-[10px] text-text-secondary block">Reels</span>
                    <span className="text-lg font-bold text-purple-400">{detailClient.weeklyContent?.reels || 0}</span>
                  </div>
                  <div className="bg-pink-500/5 p-2 rounded-lg border border-pink-500/10">
                    <span className="text-[10px] text-text-secondary block">Stories</span>
                    <span className="text-lg font-bold text-pink-400">{detailClient.weeklyContent?.stories || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => openEditModal(detailClient, e)}
                  className="flex-1 bg-black/10 dark:bg-white/10 text-text-primary font-semibold py-2 rounded-xl border border-glass-border hover:bg-black/20 dark:hover:bg-white/20 transition text-xs cursor-pointer"
                >
                  Editar Dados
                </button>
                <button
                  onClick={() => setDetailClient(null)}
                  className="px-3 bg-transparent text-text-secondary hover:text-text-primary transition text-xs cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex glass-panel p-8 rounded-2xl text-center text-text-secondary flex-col items-center justify-center gap-2 h-64 sticky top-4 border-dashed border-glass-border">
              <FileText size={28} className="text-text-secondary/40" />
              <p className="font-semibold text-sm">Nenhum cliente selecionado</p>
              <p className="text-xs">Clique em um card de cliente para visualizar seus dados contratuais e entregáveis.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Cadastro e Edição */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedClient ? "Editar Cliente" : "Cadastrar Novo Cliente"}
      >
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          {/* Logo upload and Preview */}
          <div className="flex items-center gap-4 py-2 border-b border-glass-border">
            <div className="relative group cursor-pointer">
              {renderLogo(logo, name || 'CL', "w-16 h-16")}
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Upload size={16} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
            <div>
              <span className="block font-bold text-text-primary text-xs">Foto ou Logo</span>
              <span className="text-[10px] text-text-secondary block mt-0.5">Clique no círculo para fazer upload.</span>
            </div>
          </div>

          {/* Nome do Cliente */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Nome / Marca</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Café Gourmet"
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Rede Social & Handle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-text-secondary text-xs uppercase">Rede Social</label>
              <select 
                value={socialNetwork}
                onChange={(e) => setSocialNetwork(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Twitter/X">Twitter/X</option>
                <option value="YouTube">YouTube</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-text-secondary text-xs uppercase">Identificador (@)</label>
              <input 
                type="text" 
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Ex: cafegourmet"
                className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Data de início e dia de pagamento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-text-secondary text-xs uppercase">Início do Contrato</label>
              <input 
                type="date" 
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-text-secondary text-xs uppercase">Dia de Vencimento</label>
              <input 
                type="number" 
                required
                min="1"
                max="31"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                placeholder="Ex: 5"
                className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Valor Mensal */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Valor Pago (R$ Mensal)</label>
            <input 
              type="number" 
              required
              min="0"
              step="0.01"
              value={paymentValue}
              onChange={(e) => setPaymentValue(e.target.value)}
              placeholder="Ex: 1500"
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Frequência de Conteúdo Semanal */}
          <div className="space-y-2 border-t border-glass-border pt-3">
            <label className="block font-bold text-text-secondary text-xs uppercase tracking-wider">Conteúdo Semanal</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Posts (Feed)</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={posts}
                  onChange={(e) => setPosts(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Reels</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={reels}
                  onChange={(e) => setReels(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Stories / Dia</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={stories}
                  onChange={(e) => setStories(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 text-center"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-glass-border">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-black font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/15 cursor-pointer"
            >
              {selectedClient ? "Salvar Alterações" : "Cadastrar Cliente"}
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
