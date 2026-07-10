import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Printer, 
  Image as ImageIcon, 
  FileText, 
  Grid, 
  List,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import Modal from './Modal';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Base64 to Blob helper for in-memory conversion (avoids fetch CORS blocks in mobile WebViews)
const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Helper to get days of the month
const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return new Date(year, month - 1, 1).getDay();
};

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const categories = [
  { value: 'reels', label: 'Reels', color: 'bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20', hexColor: '#a855f7', textColor: '#ffffff' },
  { value: 'estatico', label: 'Post Estático', color: 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20', hexColor: '#3b82f6', textColor: '#ffffff' },
  { value: 'carrossel', label: 'Carrossel', color: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20', hexColor: '#eab308', textColor: '#000000' },
  { value: 'stories', label: 'Stories', color: 'bg-pink-500/15 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 border-pink-500/20', hexColor: '#ec4899', textColor: '#ffffff' },
  { value: 'outro', label: 'Outro', color: 'bg-slate-500/15 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border-slate-500/20', hexColor: '#64748b', textColor: '#ffffff' }
];

const statuses = [
  { value: 'rascunho', label: 'Rascunho', color: 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20', activeClass: 'bg-blue-500 text-white border-blue-500', hexColor: '#3b82f6', textColor: '#ffffff' },
  { value: 'producao', label: 'Em Produção', color: 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-400 border-yellow-500/20', activeClass: 'bg-yellow-500 text-black border-yellow-500', hexColor: '#eab308', textColor: '#000000' },
  { value: 'atrasado', label: 'Atrasado', color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20', activeClass: 'bg-red-500 text-white border-red-500', hexColor: '#ef4444', textColor: '#ffffff' },
  { value: 'aprovacao', label: 'Em Aprovação', color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20', activeClass: 'bg-orange-500 text-white border-orange-500', hexColor: '#f97316', textColor: '#ffffff' },
  { value: 'aprovado', label: 'Aprovado', color: 'bg-emerald-700/15 text-emerald-800 dark:text-emerald-400 border-emerald-700/20', activeClass: 'bg-emerald-700 text-white border-emerald-700', hexColor: '#047857', textColor: '#ffffff' },
  { value: 'agendado', label: 'Agendado', color: 'bg-green-400/15 text-green-800 dark:text-green-400 border-green-400/20', activeClass: 'bg-green-400 text-black border-green-400', hexColor: '#4ade80', textColor: '#000000' },
  { value: 'postado', label: 'Postado', color: 'bg-lime-500/15 text-lime-800 dark:text-lime-400 border-lime-500/20', activeClass: 'bg-lime-400 text-black border-lime-400', hexColor: '#84cc16', textColor: '#000000' }
];

export default function CronogramaManager({ 
  clients = [], 
  contentSchedules = {}, 
  onUpdateFoldersData, 
  onUpdateContentSchedules,
  userName = 'Social Media'
}) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [exportedImageSrc, setExportedImageSrc] = useState(null);

  const handleShareNative = async (imgDataUrl, fileName, clientName) => {
    try {
      // 1. Android / iOS Native App Sharing (via Capacitor Plugins)
      if (window.Capacitor) {
        // Extract base64 content from data URL (remove prefix)
        const base64Data = imgDataUrl.split(',')[1];

        // Write file to Cache directory
        const fileResult = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });

        // Share the file URI natively using the files array (recommended for attachments)
        await Share.share({
          title: `Cronograma - ${clientName}`,
          text: `Segue o cronograma de publicações de ${clientName} para o mês de ${selectedMonth}.`,
          files: [fileResult.uri]
        });
        return true;
      }

      // 2. Web Browser Sharing (via Web Share API)
      if (navigator.share && navigator.canShare) {
        const blob = dataURLtoBlob(imgDataUrl);
        const file = new File([blob], fileName, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Cronograma - ${clientName}`,
            text: `Segue o cronograma de publicações de ${clientName} para o mês de ${selectedMonth}.`
          });
          return true;
        }
      }
    } catch (e) {
      console.error('Erro no compartilhamento:', e);
    }
    return false;
  };

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // null means creating
  const [targetDay, setTargetDay] = useState(1);

  // Form States
  const [postTitle, setPostTitle] = useState('');
  const [postTime, setPostTime] = useState('12:00');
  const [postCategory, setPostCategory] = useState('reels');
  const [postPlatform, setPostPlatform] = useState('Instagram');
  const [postNotes, setPostNotes] = useState('');
  const [postStatus, setPostStatus] = useState('rascunho');

  const canvasRef = useRef(null);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Get current client/month posts
  const clientSchedule = selectedClientId ? (contentSchedules[selectedClientId] || {}) : {};
  const monthPosts = clientSchedule[selectedMonth] || [];

  const handleOpenAddModal = (day) => {
    setTargetDay(day);
    setEditingPost(null);
    setPostTitle('');
    setPostTime('12:00');
    setPostCategory('reels');
    setPostPlatform(selectedClient?.socialNetwork || 'Instagram');
    setPostNotes('');
    setPostStatus('rascunho');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post, e) => {
    e.stopPropagation();
    setEditingPost(post);
    setTargetDay(post.day);
    setPostTitle(post.title);
    setPostTime(post.time || '12:00');
    setPostCategory(post.category);
    setPostPlatform(post.platform || 'Instagram');
    setPostNotes(post.notes || '');
    setPostStatus(post.status || 'rascunho');
    setIsModalOpen(true);
  };

  const handleSavePost = (e) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    let updatedPosts = [...monthPosts];

    if (editingPost) {
      // Edit post
      updatedPosts = updatedPosts.map(p => 
        p.id === editingPost.id 
          ? { 
              ...p, 
              title: postTitle, 
              time: postTime, 
              category: postCategory, 
              platform: postPlatform, 
              notes: postNotes, 
              status: postStatus 
            }
          : p
      );
    } else {
      // Create post
      const newPost = {
        id: 'post_' + Date.now(),
        day: targetDay,
        title: postTitle,
        time: postTime,
        category: postCategory,
        platform: postPlatform,
        notes: postNotes,
        status: postStatus
      };
      updatedPosts.push(newPost);
    }

    // Sort by day and time
    updatedPosts.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.time.localeCompare(b.time);
    });

    onUpdateContentSchedules({
      ...contentSchedules,
      [selectedClientId]: {
        ...clientSchedule,
        [selectedMonth]: updatedPosts
      }
    });

    setIsModalOpen(false);
  };

  const handleDeletePost = (postId, e) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir esta postagem do cronograma?')) return;

    const updatedPosts = monthPosts.filter(p => p.id !== postId);

    onUpdateContentSchedules({
      ...contentSchedules,
      [selectedClientId]: {
        ...clientSchedule,
        [selectedMonth]: updatedPosts
      }
    });

    setIsModalOpen(false);
  };

  // Canvas Export to PNG
  const handleExportPNG = async () => {
    if (!selectedClient) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Calendar grid calculations
    const cols = 7;
    const cellWidth = 200;
    const cellHeight = 160;
    const headerHeight = 140;
    const weekdaysBarHeight = 50;

    // Calculate number of rows needed
    const totalCells = firstDayIndex + totalDays;
    const rows = Math.ceil(totalCells / cols);

    const canvasWidth = cols * cellWidth;
    const canvasHeight = headerHeight + weekdaysBarHeight + (rows * cellHeight) + 40;

    // Adjust canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw Title and Header Box
    ctx.fillStyle = '#000000'; // Pure black header
    ctx.fillRect(0, 0, canvasWidth, headerHeight);

    // Title text
    ctx.fillStyle = '#facc15'; // Yellow brand accent
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.fillText(`${userName.toUpperCase()} - CRONOGRAMA DE CONTEÚDOS`, 30, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, Arial, sans-serif';
    const monthName = new Date(year, month - 1, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    ctx.fillText(`CLIENTE: ${selectedClient.name.toUpperCase()}  |  MÊS: ${monthName.toUpperCase()}`, 30, 85);

    // Draw Weekday labels bar
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, headerHeight, canvasWidth, weekdaysBarHeight);
    
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 15px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < cols; i++) {
      ctx.fillText(weekdays[i].toUpperCase(), (i * cellWidth) + (cellWidth / 2), headerHeight + 30);
    }
    ctx.textAlign = 'left'; // Reset

    // Draw Grid Lines & Days
    let dayCount = 1;
    ctx.lineWidth = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellWidth;
        const y = headerHeight + weekdaysBarHeight + (r * cellHeight);

        // Draw Cell Border
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(x, y, cellWidth, cellHeight);

        const cellIndex = (r * cols) + c;
        if (cellIndex >= firstDayIndex && dayCount <= totalDays) {
          const currentDay = dayCount;
          // Draw Day Number
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 15px Inter, Arial, sans-serif';
          ctx.fillText(currentDay.toString(), x + 12, y + 25);

          // Draw Scheduled Posts for this day
          const dayPosts = monthPosts.filter(p => p.day === currentDay).slice(0, 3); // Max 3 items fit in static canvas cell
          let tagY = y + 36;

          dayPosts.forEach(post => {
            const cat = categories.find(c => c.value === post.category) || categories[3];
            const stat = statuses.find(s => s.value === post.status) || statuses[0];
            
            // Draw Tag Background (Status Color)
            ctx.fillStyle = stat.hexColor;
            
            // Round rect draw helper
            const rx = x + 8;
            const ry = tagY;
            const rw = cellWidth - 16;
            const rh = 30;
            const radius = 6;
            
            ctx.beginPath();
            ctx.moveTo(rx + radius, ry);
            ctx.lineTo(rx + rw - radius, ry);
            ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
            ctx.lineTo(rx + rw, ry + rh - radius);
            ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
            ctx.lineTo(rx + radius, ry + rh);
            ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
            ctx.lineTo(rx, ry + radius);
            ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
            ctx.closePath();
            ctx.fill();

            // Draw Tag Text
            ctx.fillStyle = stat.textColor;
            ctx.font = 'bold 11px Inter, Arial, sans-serif';
            ctx.fillText(`[${post.time}]`, rx + 8, ry + 19);

            ctx.font = 'bold 11px Inter, Arial, sans-serif';
            // Wrap text helper for post title (showing category name)
            const maxTextWidth = rw - 54;
            let titleText = `${cat.label}: ${post.title}`;
            const textMetrics = ctx.measureText(titleText);
            if (textMetrics.width > maxTextWidth) {
              // Truncate
              while (ctx.measureText(titleText + '...').width > maxTextWidth && titleText.length > 0) {
                titleText = titleText.substring(0, titleText.length - 1);
              }
              titleText += '...';
            }
            ctx.fillText(titleText, rx + 48, ry + 19);

            tagY += 36;
          });

          // If there are more than 3 posts, draw an indicator
          const dayPostsCount = monthPosts.filter(p => p.day === currentDay).length;
          if (dayPostsCount > 3) {
            ctx.fillStyle = '#475569';
            ctx.font = 'bold 9px Inter, Arial, sans-serif';
            ctx.fillText(`+ ${dayPostsCount - 3} posts`, x + 10, y + cellHeight - 10);
          }

          dayCount++;
        } else {
          // Off-month cells
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
        }
      }
    }

    // Export & Share / Download trigger
    const cleanClientName = selectedClient.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fileName = `cronograma_${cleanClientName}_${selectedMonth}.png`;

    try {
      const url = canvas.toDataURL('image/png');
      
      const isMobile = window.Capacitor || /Android|iPhone|iPad/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Try native sharing first (no fetch blocks since we decode in memory)
        const shared = await handleShareNative(url, fileName, selectedClient.name);
        if (shared) return; // shared successfully!
        
        // Show fallback image preview modal if sharing fails
        setExportedImageSrc(url);
      } else {
        // Desktop: Default Browser Download
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (shareErr) {
      console.error('Erro na exportação:', shareErr);
      const url = canvas.toDataURL('image/png');
      setExportedImageSrc(url);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 print:bg-white print:text-black">
      {/* Header (Hidden in Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Cronograma de Conteúdos</h2>
          <p className="text-text-secondary text-sm">Planeje e visualize as publicações de redes sociais do mês.</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print PDF (Only visible on web browsers, since Capacitor WebView does not support printing) */}
          {!window.Capacitor && (
            <button 
              onClick={handlePrint}
              disabled={!selectedClientId}
              className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-glass-border hover:bg-black/10 dark:hover:bg-white/10 text-text-primary font-bold px-3 py-2 rounded-xl transition text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Imprimir ou Salvar PDF"
            >
              <Printer size={14} /> PDF / Imprimir
            </button>
          )}
          
          {/* Download Image */}
          <button 
            onClick={handleExportPNG}
            disabled={!selectedClientId}
            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-black font-bold px-3 py-2 rounded-xl transition text-xs shadow-md shadow-indigo-500/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exportar imagem PNG"
          >
            <Download size={14} /> Exportar Imagem
          </button>
        </div>
      </div>

      {/* Selectors Bar (Hidden in Print) */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center print:hidden">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Client select */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Cliente</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary text-xs outline-none focus:border-indigo-500/50 cursor-pointer font-semibold"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Month selector */}
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Mês de Referência</label>
            <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary text-xs outline-none focus:border-indigo-500/50 cursor-pointer font-semibold"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 border border-glass-border rounded-xl">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-500 text-black font-bold' : 'text-text-secondary hover:text-text-primary'}`}
            title="Grade de Calendário"
          >
            <Grid size={16} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-indigo-500 text-black font-bold' : 'text-text-secondary hover:text-text-primary'}`}
            title="Linha do Tempo (Lista)"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* No Client view fallback */}
      {!selectedClientId && (
        <div className="glass-panel p-10 text-center text-text-secondary rounded-2xl text-sm border-dashed">
          Por favor, cadastre um cliente na aba "Clientes" antes de criar o cronograma de conteúdos.
        </div>
      )}

      {selectedClientId && (
        <>
          {/* PRINT-ONLY HEADER */}
          <div className="hidden print:block border-b border-slate-300 pb-4 mb-4">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">CRONOGRAMA DE CONTEÚDOS</h1>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">
              Cliente: {selectedClient?.name} ({selectedClient?.handle})  |  
              Mês: {new Date(year, month - 1, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* 1. GRID CALENDAR VIEW */}
          {viewMode === 'grid' && (
            <div className="overflow-x-auto rounded-2xl border border-glass-border print:border-slate-300">
              <div className="min-w-[700px] bg-card-bg/30 dark:bg-card-bg/10 backdrop-blur-md">
                
                {/* Weekdays Labels Bar */}
                <div className="grid grid-cols-7 border-b border-glass-border print:border-slate-300 bg-black/5 dark:bg-white/5">
                  {weekdays.map(day => (
                    <div key={day} className="py-2.5 text-center text-sm font-extrabold uppercase tracking-wider text-text-secondary print:text-slate-600">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid Cells */}
                <div className="grid grid-cols-7">
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="min-h-[120px] p-2 border-r border-b border-glass-border/70 print:border-slate-200 bg-black/2 dark:bg-white/2 opacity-30" />
                  ))}

                  {/* Month days */}
                  {Array.from({ length: totalDays }).map((_, idx) => {
                    const day = idx + 1;
                    const dayPosts = monthPosts.filter(p => p.day === day);

                    return (
                      <div 
                        key={`day-${day}`}
                        onClick={() => handleOpenAddModal(day)}
                        className="min-h-[160px] p-2.5 border-r border-b border-glass-border/70 print:border-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition flex flex-col justify-between group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-text-secondary/80 print:text-slate-600 group-hover:text-text-primary transition">{day}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenAddModal(day); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-indigo-500/10 hover:text-indigo-500 transition text-text-secondary print:hidden"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* List of day posts */}
                        <div className="flex-1 space-y-2 mt-2 overflow-hidden">
                          {dayPosts.map(post => {
                            const cat = categories.find(c => c.value === post.category) || categories[3];
                            const stat = statuses.find(s => s.value === post.status) || statuses[0];
                            return (
                              <div
                                key={post.id}
                                onClick={(e) => handleOpenEditModal(post, e)}
                                className={`p-2 rounded-xl border flex flex-col gap-1 group/item transition cursor-pointer hover:shadow-xs ${stat.color}`}
                                title={`${post.time} - ${cat.label}: ${post.title}`}
                              >
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] font-black opacity-90">{post.time}</span>
                                  <span className="text-[8px] font-black uppercase tracking-wider px-1 py-0.2 bg-black/5 dark:bg-white/15 rounded">
                                    {cat.label === 'Post Estático' ? 'Estático' : cat.label}
                                  </span>
                                </div>
                                <span className="font-bold text-xs text-text-primary leading-snug whitespace-normal break-words">
                                  {post.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty cells after month end to fill grid */}
                  {Array.from({ length: (7 - ((firstDayIndex + totalDays) % 7)) % 7 }).map((_, idx) => (
                    <div key={`empty-end-${idx}`} className="min-h-[120px] p-2 border-r border-b border-glass-border/70 print:border-slate-200 bg-black/2 dark:bg-white/2 opacity-30" />
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* 2. LIST/TIMELINE VIEW (Best for mobile, hidden in print) */}
          {viewMode === 'list' && (
            <div className="glass-panel p-5 rounded-2xl space-y-4 print:hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Linha do Tempo de Conteúdos</h3>
                <button
                  onClick={() => handleOpenAddModal(1)}
                  className="flex items-center gap-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition"
                >
                  <Plus size={12} /> Agendar Post
                </button>
              </div>

              {monthPosts.length === 0 ? (
                <div className="py-16 text-center text-text-secondary text-xs flex flex-col items-center justify-center gap-2 border border-dashed border-glass-border rounded-xl bg-black/5 dark:bg-white/5">
                  <FileText size={24} className="text-text-secondary/30" />
                  <p>Sem postagens agendadas para este mês.</p>
                </div>
              ) : (
                <div className="relative border-l border-glass-border ml-3 pl-5 space-y-6 py-2">
                  {/* Group month posts by day */}
                  {Array.from({ length: totalDays }).map((_, idx) => {
                    const day = idx + 1;
                    const dayPosts = monthPosts.filter(p => p.day === day);
                    if (dayPosts.length === 0) return null;

                    return (
                      <div key={`list-day-${day}`} className="relative space-y-2">
                        {/* Timeline Node dot */}
                        <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-2 border-bg-app flex items-center justify-center shadow-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                        </div>

                        {/* Day indicator */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-text-primary">Dia {day}</h4>
                          <button
                            onClick={() => handleOpenAddModal(day)}
                            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary"
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        {/* List of day posts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {dayPosts.map(post => {
                            const cat = categories.find(c => c.value === post.category) || categories[3];
                            const stat = statuses.find(s => s.value === post.status) || statuses[0];
                            return (
                              <div
                                key={post.id}
                                onClick={(e) => handleOpenEditModal(post, e)}
                                className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer flex flex-col justify-between gap-3 group"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${cat.color}`}>
                                      {cat.label}
                                    </span>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${stat.color}`}>
                                      {stat.label}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-text-primary text-sm truncate mt-1">{post.title}</h5>
                                  {post.notes && (
                                    <p className="text-text-secondary text-xs line-clamp-1 italic">{post.notes}</p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-text-secondary">
                                  <div className="flex items-center gap-1 font-semibold text-xs">
                                    <Clock size={10} />
                                    <span>{post.time}</span>
                                  </div>
                                  {post.platform && <span>{post.platform}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL - Add/Edit Post (Hidden in Print) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPost ? `Editar Conteúdo (Dia ${targetDay})` : `Novo Conteúdo (Dia ${targetDay})`}
      >
        <form onSubmit={handleSavePost} className="space-y-4 text-sm print:hidden">
          {/* Post Title */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Tema / Título do Post</label>
            <input 
              type="text" 
              required
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Ex: Reels dos Bastidores da Produção"
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category / Type */}
            <div className="space-y-1">
              <label className="block font-bold text-text-secondary text-xs uppercase">Categoria</label>
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer text-xs font-semibold"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Post Time */}
            <div className="space-y-1">
              <label className="block font-bold text-text-secondary text-xs uppercase">Horário</label>
              <input 
                type="time"
                required
                value={postTime}
                onChange={(e) => setPostTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Platform */}
            <div className="space-y-1">
              <label className="block font-bold text-text-secondary text-xs uppercase">Rede Social</label>
              <select
                value={postPlatform}
                onChange={(e) => setPostPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 cursor-pointer text-xs font-semibold"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Status Selection Buttons */}
          <div className="space-y-2">
            <label className="block font-bold text-text-secondary text-xs uppercase text-indigo-400">Status / Etapa</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statuses.map(s => {
                const isActive = postStatus === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setPostStatus(s.value)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${isActive ? s.activeClass : 'bg-black/5 dark:bg-white/5 text-text-secondary border-glass-border hover:bg-black/10 dark:hover:bg-white/10'}`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Obs */}
          <div className="space-y-1">
            <label className="block font-bold text-text-secondary text-xs uppercase">Observações / Roteiro / Legenda</label>
            <textarea 
              rows={4}
              value={postNotes}
              onChange={(e) => setPostNotes(e.target.value)}
              placeholder="Digite aqui rascunhos de legendas, ideias de roteiro ou hashtags associadas..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary outline-none focus:border-indigo-500/50 resize-none leading-relaxed text-xs"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-glass-border">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-black font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/15 cursor-pointer"
            >
              {editingPost ? "Salvar Alterações" : "Adicionar ao Cronograma"}
            </button>
            {editingPost && (
              <button
                type="button"
                onClick={(e) => handleDeletePost(editingPost.id, e)}
                className="px-4 py-2.5 bg-red-500/15 text-red-500 font-bold border border-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition cursor-pointer"
                title="Excluir Postagem"
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

      {/* Hidden Canvas used for PNG image drawing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* MODAL - Image Preview & Export (For Mobile / Android) */}
      <Modal
        isOpen={!!exportedImageSrc}
        onClose={() => setExportedImageSrc(null)}
        title="Compartilhar Cronograma"
      >
        <div className="space-y-4 text-center text-sm print:hidden">
          <p className="text-text-secondary text-[11px] leading-relaxed">
            📱 <strong>Para salvar ou enviar:</strong> toque e segure o dedo sobre a imagem abaixo e escolha a opção <strong>"Compartilhar"</strong> ou <strong>"Salvar imagem"</strong>.
          </p>

          <div className="border border-glass-border rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 p-2 max-h-[350px] overflow-y-auto select-auto">
            <img 
              src={exportedImageSrc} 
              alt="Cronograma Exportado" 
              className="w-full h-auto rounded-lg object-contain select-auto"
              style={{
                userSelect: 'auto',
                WebkitUserSelect: 'auto',
                WebkitTouchCallout: 'default'
              }}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleShareNative(exportedImageSrc, `cronograma_${selectedClient?.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${selectedMonth}.png`, selectedClient?.name)}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-black font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/15 cursor-pointer text-xs"
            >
              Compartilhar Novamente
            </button>
            <button
              onClick={() => setExportedImageSrc(null)}
              className="px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-glass-border text-text-primary font-semibold rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
