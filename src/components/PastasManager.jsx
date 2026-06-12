import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen,
  Image as ImageIcon, 
  FileText, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Eye, 
  Edit3,
  Calendar,
  X
} from 'lucide-react';
import Modal from './Modal';

// Base64 Image Compressor to preserve localStorage limits
const compressImage = (base64Str, maxWidth = 900, maxHeight = 900, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export default function PastasManager({ 
  clients = [], 
  foldersData = {}, 
  onUpdateFoldersData 
}) {
  const [selectedClientId, setSelectedClientId] = useState(null);
  
  // Modal states
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // null means adding new
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  // Image preview state
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  
  // Get current folder data
  const currentFolder = selectedClientId ? (foldersData[selectedClientId] || { images: [], notes: [] }) : { images: [], notes: [] };

  const handleBack = () => {
    setSelectedClientId(null);
  };

  // Image actions
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Str = event.target.result;
      
      // Compress the image before saving
      const compressedStr = await compressImage(base64Str);
      
      const newImage = {
        id: 'img_' + Date.now(),
        name: file.name,
        url: compressedStr,
        createdAt: new Date().toISOString()
      };

      const clientFolder = foldersData[selectedClientId] || { images: [], notes: [] };
      const updatedFolder = {
        ...clientFolder,
        images: [...(clientFolder.images || []), newImage]
      };

      onUpdateFoldersData({
        ...foldersData,
        [selectedClientId]: updatedFolder
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleDeleteImage = (imgId) => {
    if (!confirm('Deseja realmente excluir esta imagem?')) return;
    
    const clientFolder = foldersData[selectedClientId] || { images: [], notes: [] };
    const updatedFolder = {
      ...clientFolder,
      images: (clientFolder.images || []).filter(img => img.id !== imgId)
    };

    onUpdateFoldersData({
      ...foldersData,
      [selectedClientId]: updatedFolder
    });
  };

  // Note actions
  const handleOpenNoteModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
    } else {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
    }
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const clientFolder = foldersData[selectedClientId] || { images: [], notes: [] };
    let updatedNotes;

    if (editingNote) {
      // Edit existing
      updatedNotes = (clientFolder.notes || []).map(n => 
        n.id === editingNote.id 
          ? { ...n, title: noteTitle, content: noteContent, updatedAt: new Date().toISOString() }
          : n
      );
    } else {
      // Add new
      const newNote = {
        id: 'note_' + Date.now(),
        title: noteTitle,
        content: noteContent,
        createdAt: new Date().toISOString()
      };
      updatedNotes = [...(clientFolder.notes || []), newNote];
    }

    const updatedFolder = {
      ...clientFolder,
      notes: updatedNotes
    };

    onUpdateFoldersData({
      ...foldersData,
      [selectedClientId]: updatedFolder
    });

    setIsNoteModalOpen(false);
    setNoteTitle('');
    setNoteContent('');
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId, e) => {
    e.stopPropagation(); // Stop opening the edit modal
    if (!confirm('Deseja realmente excluir esta anotação?')) return;

    const clientFolder = foldersData[selectedClientId] || { images: [], notes: [] };
    const updatedFolder = {
      ...clientFolder,
      notes: (clientFolder.notes || []).filter(n => n.id !== noteId)
    };

    onUpdateFoldersData({
      ...foldersData,
      [selectedClientId]: updatedFolder
    });
  };

  const renderClientLogo = (client) => {
    if (client.logo) {
      return <img src={client.logo} alt={client.name} className="w-10 h-10 rounded-xl object-cover border border-glass-border shadow-sm" />;
    }
    const initials = client.name ? client.name.substring(0, 2).toUpperCase() : 'CL';
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
        {initials}
      </div>
    );
  };

  // 1. DIRECTORY LIST VIEW
  if (!selectedClientId) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Pastas de Clientes</h2>
          <p className="text-text-secondary text-sm">Organize inspirações, ideias de posts futuros e briefings para cada cliente.</p>
        </div>

        {clients.length === 0 ? (
          <div className="glass-panel p-10 text-center text-text-secondary rounded-2xl text-sm border-dashed">
            Nenhum cliente cadastrado. Cadastre um cliente na aba "Clientes" para habilitar sua pasta de conteúdos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clients.map(client => {
              const folderInfo = foldersData[client.id] || { images: [], notes: [] };
              const numImages = folderInfo.images?.length || 0;
              const numNotes = folderInfo.notes?.length || 0;

              return (
                <div 
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className="glass-panel p-5 rounded-2xl border border-glass-border hover:border-indigo-500/35 hover:shadow-lg transition hover:translate-y-[-2px] cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl group-hover:scale-105 transition">
                      <Folder size={26} className="fill-indigo-500/20" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-text-primary truncate">{client.name}</h3>
                      <span className="text-[10px] text-text-secondary block truncate">{client.handle}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-glass-border flex items-center justify-between text-[11px] text-text-secondary font-medium">
                    <span className="flex items-center gap-1">
                      <ImageIcon size={12} /> {numImages} {numImages === 1 ? 'Imagem' : 'Imagens'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> {numNotes} {numNotes === 1 ? 'Nota' : 'Notas'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 2. CLIENT FOLDER VIEW
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
            title="Voltar para Pastas"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-3">
            {renderClientLogo(selectedClient)}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-secondary font-medium">Pastas /</span>
                <h2 className="text-lg font-bold text-text-primary">{selectedClient.name}</h2>
              </div>
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{selectedClient.handle}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Images (Briefing/Future Posts) - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={18} className="text-indigo-500" />
              <h3 className="text-base font-bold text-text-primary">Imagens & Criativos</h3>
            </div>
            <label className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-black font-bold px-3 py-1.5 rounded-xl transition text-xs shadow-md shadow-indigo-500/15 cursor-pointer">
              <Plus size={14} /> Adicionar Imagem
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </label>
          </div>

          <div className="glass-panel p-5 rounded-2xl min-h-[350px]">
            {currentFolder.images?.length === 0 ? (
              <div className="py-24 text-center text-text-secondary text-xs flex flex-col items-center justify-center gap-2 border border-dashed border-glass-border rounded-2xl bg-black/5 dark:bg-white/5">
                <ImageIcon size={32} className="text-text-secondary/20" />
                <p>Nenhuma imagem ou ideia adicionada a esta pasta.</p>
                <p className="text-[10px] text-text-secondary/60">Faça upload de fotos ou prints de inspirações.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentFolder.images.map(img => (
                  <div 
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-glass-border bg-slate-900 group shadow"
                  >
                    <img 
                      src={img.url} 
                      alt={img.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <button 
                        onClick={() => setPreviewImageUrl(img.url)}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
                        title="Visualizar"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Text Notes / Briefings - 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              <h3 className="text-base font-bold text-text-primary">Notas & Briefing</h3>
            </div>
            <button 
              onClick={() => handleOpenNoteModal(null)}
              className="flex items-center gap-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <Plus size={14} /> Nova Nota
            </button>
          </div>

          <div className="glass-panel p-5 rounded-2xl min-h-[350px]">
            {currentFolder.notes?.length === 0 ? (
              <div className="py-24 text-center text-text-secondary text-xs flex flex-col items-center justify-center gap-2 border border-dashed border-glass-border rounded-2xl bg-black/5 dark:bg-white/5">
                <FileText size={32} className="text-text-secondary/20" />
                <p>Nenhuma anotação nesta pasta.</p>
                <p className="text-[10px] text-text-secondary/60">Guarde anotações de briefing, estratégias, hashtags etc.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 no-scrollbar">
                {currentFolder.notes.map(note => (
                  <div 
                    key={note.id}
                    onClick={() => handleOpenNoteModal(note)}
                    className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-text-primary text-sm line-clamp-1 group-hover:text-indigo-500 transition">{note.title}</h4>
                        <button 
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="text-text-secondary hover:text-red-500 p-1 rounded hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                          title="Excluir anotação"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-text-secondary text-xs whitespace-pre-line line-clamp-3 leading-relaxed">{note.content}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-text-secondary/70">
                      <Calendar size={10} />
                      <span>{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal - Add/Edit Note */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={editingNote ? "Editar Anotação" : "Nova Anotação"}
      >
        <form onSubmit={handleSaveNote} className="space-y-4 text-sm">
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Título</label>
            <input 
              type="text" 
              required
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Ex: Hashtags de moda, Ementa de Conteúdo"
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Conteúdo / Texto</label>
            <textarea 
              required
              rows={6}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Digite aqui as estratégias do cliente, legendas de rascunho, briefings de gravação..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-glass-border">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-black font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/15 cursor-pointer"
            >
              {editingNote ? "Salvar Alterações" : "Criar Nota"}
            </button>
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(false)}
              className="px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary font-semibold rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Lightbox Preview Modal */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setPreviewImageUrl(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition cursor-pointer"
            onClick={() => setPreviewImageUrl(null)}
          >
            <X size={20} />
          </button>
          <img 
            src={previewImageUrl} 
            alt="Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in duration-200" 
            onClick={(e) => e.stopPropagation()} // Stop propagation to prevent closing
          />
        </div>
      )}
    </div>
  );
}
