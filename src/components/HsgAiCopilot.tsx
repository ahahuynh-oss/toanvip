import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  Trash2,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  BookOpen,
  HelpCircle,
  BarChart3,
  Copy,
  Check,
  RotateCcw,
  MessageSquarePlus,
  ShieldCheck,
  Plus,
  Compass,
  Paperclip,
  Image as ImageIcon,
  FileText,
  FileCode,
  UploadCloud,
  Eye,
  ZoomIn,
  FileUp,
} from 'lucide-react';
import { TopicCurriculum, TieredExercise, KeyLemma } from '../types/math';
import { MathRenderer } from './MathRenderer';
import {
  askHsgAiCopilot,
  CopilotResponse,
  CopilotActionProposal,
  FileAttachment,
} from '../services/geminiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  attachments?: FileAttachment[];
  keyInsights?: string[];
  actionProposal?: CopilotActionProposal;
  isApplied?: boolean;
}

interface HsgAiCopilotProps {
  currentTopic: TopicCurriculum;
  allTopics: TopicCurriculum[];
  onUpdateTopic: (updated: TopicCurriculum) => void;
  isGlobalAiProcessing?: boolean;
}

const PRESET_QUESTIONS = [
  {
    icon: '🔍',
    text: 'Chuyên đề này còn thiếu gì?',
    desc: 'Phân tích thiếu sót mục tiêu Bloom, bổ đề & dạng bài',
  },
  {
    icon: '💡',
    text: 'Bài tập trong chuyên đề có thể phát triển theo hướng nào?',
    desc: 'Đề xuất 6 chiến lược mở rộng tư duy sâu không thay số',
  },
  {
    icon: '🎯',
    text: 'Hãy đề xuất bài khó hơn nhưng vẫn dùng kiến thức này.',
    desc: 'Tạo bài tập cấp VMO/TST phát triển từ bổ đề hiện có',
  },
  {
    icon: '⚖️',
    text: 'Các chuyên đề của tôi có bị trùng không?',
    desc: 'So sánh toàn bộ ngân hàng để tìm điểm giao thoa',
  },
  {
    icon: '📊',
    text: 'Hãy kiểm tra sự cân bằng của chương trình.',
    desc: 'Đánh giá tỷ lệ 3 tầng bài tập và độ bao phủ ma trận',
  },
];

const ATTACHMENT_SUGGESTIONS = [
  '📸 Nhận diện đề bài trong ảnh & trích xuất mã LaTeX chuẩn',
  '💡 Phân tích ý tưởng sư phạm & giải chi tiết bài toán trong ảnh/file',
  '🚀 Phát triển bài này thành 3 biến thể thi HSG Tỉnh / VMO',
  '🛡️ Kiểm tra bẫy sai lầm & tính chặt chẽ của lời giải',
];

const PERSONAS = [
  { id: 'advisor', name: 'Cố vấn Tổng quát', icon: '🤖', promptPrefix: '' },
  { id: 'auditor', name: 'Thẩm định Logic', icon: '🛡️', promptPrefix: '[CHẾ ĐỘ: THẨM ĐỊNH VIÊN LOGIC NGHIÊM NGẶT - Kiểm tra kỹ miền xác định, dấu đẳng thức, điều kiện biên và lập luận] ' },
  { id: 'mutator', name: 'Sáng tác Biến thể', icon: '💡', promptPrefix: '[CHẾ ĐỘ: CHUYÊN GIA SÁNG TÁC BIẾN THỂ OLYMPIC - Đề xuất mở rộng n biến, đối ngẫu, đổi cấu trúc] ' },
  { id: 'socratic', name: 'Trợ giảng Socratic', icon: '🎓', promptPrefix: '[CHẾ ĐỘ: TRỢ GIẢNG SOCRATIC - Đặt câu hỏi gợi mở từng bước dẫn dắt tư duy] ' },
];

export const HsgAiCopilot: React.FC<HsgAiCopilotProps> = ({
  currentTopic,
  allTopics,
  onUpdateTopic,
  isGlobalAiProcessing = false,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<string>('advisor');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isCopilotThinking, setIsCopilotThinking] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  
  // Attachments state (images / files attached to current prompt)
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Proposal confirmation modal state
  const [proposalConfirmation, setProposalConfirmation] = useState<{
    msgId: string;
    proposal: CopilotActionProposal;
  } | null>(null);

  // Chat message history initialized with welcoming topic context
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `👋 **Kính chào Thầy/Cô!** Tôi là **Trợ lý HSG** - Cố vấn chuyên môn sư phạm hỗ trợ thiết kế và bồi dưỡng Học sinh Giỏi Toán THPT.

Hiện Thầy/Cô đang mở chuyên đề: **${currentTopic.title}** (${currentTopic.code}, Khối ${currentTopic.grade} - ${currentTopic.targetLevel}).

Thầy/Cô có thể chọn các gợi ý nhanh phía trên, đặt câu hỏi hoặc gửi ảnh/tệp đề bài để cùng phân tích!`,
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Helper to process File objects into FileAttachment
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newAttachments: FileAttachment[] = [];

    for (const file of fileArray) {
      if (file.type.startsWith('image/')) {
        // Handle Image
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Strip data:image/...;base64, prefix for API
        const base64Data = dataUrl.split(',')[1];

        newAttachments.push({
          name: file.name,
          type: file.type,
          mimeType: file.type,
          size: file.size,
          dataUrl,
          data: base64Data,
        });
      } else if (file.type === 'application/pdf') {
        // Handle PDF
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64Data = dataUrl.split(',')[1];

        newAttachments.push({
          name: file.name,
          type: file.type,
          mimeType: file.type,
          size: file.size,
          dataUrl,
          data: base64Data,
        });
      } else {
        // Handle text-based files (.tex, .txt, .md, .json, .csv, etc.)
        const textContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        newAttachments.push({
          name: file.name,
          type: file.type || 'text/plain',
          mimeType: file.type || 'text/plain',
          size: file.size,
          text: textContent,
        });
      }
    }

    if (newAttachments.length > 0) {
      setAttachedFiles((prev) => [...prev, ...newAttachments]);
    }
  }, []);

  // Handle Clipboard Paste Event (Ctrl+V / Cmd+V)
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            // Give pasted image a clean timestamped name
            const file = new File([blob], `anh-dan-${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.png`, {
              type: blob.type || 'image/png',
            });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        processFiles(imageFiles);
      }
    },
    [processFiles]
  );

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Remove an attachment
  const removeAttachment = (indexToRemove: number) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle asking a question (from presets, attachments or input text)
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    const currentAttachments = [...attachedFiles];

    if (!textToSend && currentAttachments.length === 0) return;
    if (isCopilotThinking) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: textToSend || (currentAttachments.length > 0 ? 'Phân tích tệp / hình ảnh đính kèm' : ''),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setAttachedFiles([]);
    setIsCopilotThinking(true);

    try {
      // Build conversation context
      const conversationHistory = messages.slice(-4).map((m) => ({
        role: m.sender,
        text: m.content,
      }));

      const personaObj = PERSONAS.find((p) => p.id === selectedPersona);
      const queryWithPersona = personaObj?.promptPrefix ? `${personaObj.promptPrefix}${textToSend}` : textToSend;

      const res: CopilotResponse = await askHsgAiCopilot(
        queryWithPersona,
        currentTopic,
        allTopics,
        conversationHistory,
        currentAttachments
      );

      const botMessage: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: res.answerMarkdown,
        keyInsights: res.keyInsights,
        actionProposal: res.actionProposal?.type !== 'none' ? res.actionProposal : undefined,
        isApplied: false,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Error in Copilot conversation:', err);
      const errorMessage: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content:
          '⚠️ Có lỗi xảy ra khi kết nối tới Trợ lý HSG. Vui lòng kiểm tra lại kết nối mạng hoặc API Key trong Cài đặt.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  // Copy message content
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Clear conversation history
  const handleClearHistory = () => {
    if (confirm('Thầy/Cô có chắc chắn muốn xóa toàn bộ lịch sử trao đổi với Trợ lý HSG?')) {
      setMessages([]);
    }
  };

  // Apply proposed action to current topic safely
  const handleConfirmApplyProposal = () => {
    if (!proposalConfirmation) return;
    const { msgId, proposal } = proposalConfirmation;

    if (proposal.type === 'add_exercise' && proposal.payload) {
      const newEx: TieredExercise = {
        id: 'ex-ai-' + Date.now(),
        tier: proposal.payload.tier || 'tier_2',
        title: proposal.payload.title || 'Bài tập phát triển (AI Copilot)',
        statementLatex: proposal.payload.statementLatex || '',
        pedagogicalIdea: proposal.payload.pedagogicalIdea || 'Định hướng tiếp cận sư phạm',
        hints: proposal.payload.hints || ['Gợi ý 1'],
        solutionLatex: proposal.payload.solutionLatex || '',
        equalityCaseLatex: proposal.payload.equalityCaseLatex || '',
        generalizationNotes: proposal.payload.generalizationNotes || '',
        source: proposal.payload.source || 'Đề xuất bởi Trợ lý HSG',
      };

      const updatedTopic: TopicCurriculum = {
        ...currentTopic,
        step4Exercises: [...currentTopic.step4Exercises, newEx],
        updatedAt: new Date().toISOString(),
      };

      onUpdateTopic(updatedTopic);
    } else if (proposal.type === 'add_lemma' && proposal.payload) {
      const newLemma: KeyLemma = {
        id: 'lem-ai-' + Date.now(),
        name: proposal.payload.name || 'Bổ đề then chốt mới',
        statementLatex: proposal.payload.statementLatex || '',
        proofLatex: proposal.payload.proofLatex || '',
        pedagogyNotes: proposal.payload.pedagogyNotes || 'Ý nghĩa sư phạm',
        commonTraps: proposal.payload.commonTraps || [],
      };

      const updatedTopic: TopicCurriculum = {
        ...currentTopic,
        step3Theory: {
          ...currentTopic.step3Theory,
          keyLemmas: [...currentTopic.step3Theory.keyLemmas, newLemma],
        },
        updatedAt: new Date().toISOString(),
      };

      onUpdateTopic(updatedTopic);
    }

    // Mark proposal message as applied
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isApplied: true } : m))
    );

    setProposalConfirmation(null);
  };

  return (
    <>
      {/* 1. FLOATING COPILOT LAUNCHER BUTTON (Góc phải dưới cùng) */}
      <div className="fixed bottom-5 right-5 z-40 no-print">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center space-x-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 hover:from-blue-800 hover:to-amber-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            title="Mở Trợ lý HSG - Hỗ trợ dán ảnh & tệp"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <Bot className="w-5 h-5 text-amber-300 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>

            <div className="text-left pr-1">
              <div className="text-xs font-black tracking-tight flex items-center space-x-1">
                <span>🤖 Trợ lý HSG</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </div>
              <p className="text-[10px] text-blue-100 font-medium hidden sm:block">
                Dán ảnh đề bài & Tư vấn sư phạm
              </p>
            </div>
          </button>
        )}
      </div>

      {/* 2. CHATBOX MODAL / DRAWER (EXPANDABLE) */}
      {isOpen && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={`fixed bottom-4 right-4 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ease-out no-print ${
            isExpanded
              ? 'w-[95vw] sm:w-[720px] h-[88vh] max-h-[850px]'
              : 'w-[92vw] sm:w-[480px] h-[640px] max-h-[92vh]'
          }`}
        >
          {/* Drag Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-50 bg-indigo-600/90 text-white backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
              <UploadCloud className="w-14 h-14 mb-3 animate-bounce text-amber-300" />
              <h3 className="text-lg font-bold">Thả tệp hoặc hình ảnh vào đây!</h3>
              <p className="text-xs text-indigo-100 mt-1 max-w-xs">
                Hỗ trợ ảnh đề bài (.png, .jpg), file LaTeX (.tex), PDF (.pdf) hoặc tài liệu văn bản.
              </p>
            </div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-white shadow-md shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-extrabold text-sm text-white tracking-tight truncate">
                    🤖 Trợ lý HSG
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-semibold uppercase">
                    Multimodal AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate max-w-[260px]">
                  Đang phân tích: <strong>{currentTopic.title}</strong>
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center space-x-1 text-slate-300">
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:text-rose-300 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                title="Xóa đoạn chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex p-1.5 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? 'Thu nhỏ cửa sổ' : 'Phóng to cửa sổ'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                title="Đóng hộp Trợ lý HSG"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Persona Mode Switcher Ribbon */}
          <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 shrink-0 overflow-x-auto scrollbar-none">
            <div className="flex items-center space-x-1.5 min-w-max">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-1">
                Vai trò AI:
              </span>
              {PERSONAS.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-xs ring-1 ring-amber-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Suggestions Carousel / Presets */}
          <div className="bg-slate-50 border-b border-slate-200 p-2.5 shrink-0 overflow-x-auto scrollbar-none">
            <div className="flex items-center space-x-1.5 min-w-max">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Gợi ý nhanh:
              </span>
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  disabled={isCopilotThinking}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-full text-xs font-semibold transition-all shadow-2xs whitespace-nowrap cursor-pointer disabled:opacity-50"
                  title={q.desc}
                >
                  <span>{q.icon}</span>
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/50 scrollbar-thin scrollbar-thumb-slate-300">
            {messages.length === 0 && !isCopilotThinking && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-xs">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700">Trợ Lý HSG Đã Sẵn Sàng</h4>
                  <p className="text-[11px] text-slate-500 max-w-[280px] leading-relaxed">
                    Chọn gợi ý nhanh ở trên, dán ảnh đề bài (<strong>Ctrl+V</strong>) hoặc nhập câu hỏi bên dưới.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                } animate-in fade-in duration-200`}
              >
                {/* Assistant Avatar on the Left */}
                {msg.sender === 'assistant' && (
                  <div className="shrink-0 flex flex-col items-center pt-0.5">
                    <div className="relative group">
                      <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 border border-white/40 ring-2 ring-indigo-100">
                        <Bot className="w-4 h-4 text-amber-200 animate-pulse" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                  </div>
                )}

                {/* Message Content Container */}
                <div
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  } max-w-[88%] sm:max-w-[84%]`}
                >
                  {/* Sender Tag */}
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1 px-1">
                    {msg.sender === 'assistant' ? (
                      <span className="font-bold text-indigo-700 flex items-center space-x-1">
                        <span>🤖 Trợ lý HSG</span>
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-600">Thầy/Cô</span>
                    )}
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`relative w-full rounded-2xl p-3.5 shadow-xs text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none font-medium shadow-md shadow-blue-500/10'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none space-y-2.5 shadow-sm'
                    }`}
                  >
                    {/* Attached media inside user's message bubble */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-2.5 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {msg.attachments.map((att, attIdx) => (
                            <div key={attIdx} className="group relative">
                              {att.dataUrl && att.type.startsWith('image/') ? (
                                <div
                                  onClick={() => setLightboxImageUrl(att.dataUrl!)}
                                  className="relative rounded-xl overflow-hidden border-2 border-white/40 shadow-sm cursor-zoom-in max-w-[200px] max-h-[140px] bg-black/20"
                                >
                                  <img
                                    src={att.dataUrl}
                                    alt={att.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                    <ZoomIn className="w-5 h-5" />
                                  </div>
                                </div>
                              ) : att.type === 'application/pdf' || att.name.endsWith('.pdf') ? (
                                <div className="flex items-center space-x-2 bg-white/15 px-3 py-2 rounded-lg border border-white/25 text-white text-[11px]">
                                  <div className="w-7 h-7 rounded-md bg-rose-500/30 flex items-center justify-center text-rose-200 font-mono font-bold text-[9px] border border-rose-400/40 shrink-0">
                                    PDF
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold truncate block max-w-[140px]">
                                      {att.name}
                                    </span>
                                    <span className="text-[9px] opacity-75">
                                      {(att.size / 1024).toFixed(0)}KB • Đã gửi để AI phân tích
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 bg-white/15 px-3 py-1.5 rounded-lg border border-white/25 text-white text-[11px]">
                                  {att.name.endsWith('.tex') ? (
                                    <FileCode className="w-4 h-4 text-amber-300" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-blue-200" />
                                  )}
                                  <span className="font-semibold truncate max-w-[140px]">
                                    {att.name}
                                  </span>
                                  <span className="text-[9px] opacity-75">
                                    ({(att.size / 1024).toFixed(0)}KB)
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content with LaTeX & Markdown rendering */}
                    {msg.sender === 'assistant' ? (
                      <div>
                        <MathRenderer content={msg.content} className="text-xs" />

                        {/* Key Insights Chips */}
                        {msg.keyInsights && msg.keyInsights.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center">
                              <Lightbulb className="w-3 h-3 mr-1 text-amber-500" />
                              Điểm Sư Phạm Then Chốt:
                            </span>
                            <ul className="space-y-1">
                              {msg.keyInsights.map((insight, i) => (
                                <li
                                  key={i}
                                  className="text-[11px] text-slate-600 flex items-start space-x-1.5 bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/60"
                                >
                                  <span className="text-amber-600 font-bold">•</span>
                                  <span>{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* ACTION PROPOSAL CARD (Thầy cô xác nhận trước khi áp dụng) */}
                        {msg.actionProposal && (
                          <div className="mt-3 p-3 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-dashed border-indigo-300 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center">
                                <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                                Đề Xuất Sư Phạm Cần Xác Nhận
                              </span>
                              {msg.isApplied && (
                                <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                  <Check className="w-3 h-3 mr-1" />
                                  Đã Áp Dụng
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-bold text-indigo-950">
                              {msg.actionProposal.title}
                            </div>
                            <p className="text-[11px] text-slate-600">
                              {msg.actionProposal.description}
                            </p>

                            {!msg.isApplied && (
                              <div className="pt-1 flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    setProposalConfirmation({
                                      msgId: msg.id,
                                      proposal: msg.actionProposal!,
                                    })
                                  }
                                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Xem & Xác Nhận Áp Dụng Vào Chuyên Đề</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message Actions */}
                        <div className="pt-1 flex items-center justify-end space-x-2 text-slate-400">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer text-[10px] flex items-center space-x-1"
                            title="Sao chép nội dung"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Đã sao chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>{msg.content}</div>
                    )}
                  </div>
                </div>

                {/* User Avatar on the Right */}
                {msg.sender === 'user' && (
                  <div className="shrink-0 flex flex-col items-center pt-0.5">
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-sm border border-slate-600">
                      GV
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Loading indicator */}
            {isCopilotThinking && (
              <div className="flex items-start space-x-2 animate-in fade-in duration-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-xs space-y-1.5">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-700">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                    <span>Trợ lý HSG đang phân tích hình ảnh/tệp & chuyên đề...</span>
                  </div>
                  <div className="flex space-x-1.5 items-center pl-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>



          {/* PENDING ATTACHMENTS TRAY */}
          {attachedFiles.length > 0 && (
            <div className="p-2.5 bg-indigo-50/70 border-t border-indigo-100 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                <span className="flex items-center">
                  <ImageIcon className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                  Đã đính kèm ({attachedFiles.length} tệp/ảnh):
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedFiles([])}
                  className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Attachment Preview Chips */}
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                {attachedFiles.map((att, index) => (
                  <div
                    key={index}
                    className="group relative flex items-center space-x-2 bg-white border border-indigo-200 rounded-xl p-1.5 pr-2 shadow-xs"
                  >
                    {att.dataUrl && att.type.startsWith('image/') ? (
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                    ) : att.type === 'application/pdf' || att.name.endsWith('.pdf') ? (
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-mono font-bold text-[10px] border border-rose-200">
                        PDF
                      </div>
                    ) : att.name.endsWith('.tex') ? (
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-mono font-bold text-[10px]">
                        TEX
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}

                    <div className="min-w-0 max-w-[120px]">
                      <div className="text-[11px] font-semibold text-slate-800 truncate">
                        {att.name}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {(att.size / 1024).toFixed(0)} KB
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
                      title="Xóa tệp này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick suggestions for attached files */}
              <div className="pt-1 flex flex-wrap gap-1">
                {ATTACHMENT_SUGGESTIONS.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => setInputQuery(sug)}
                    className="text-[10px] px-2 py-0.5 bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-md font-medium transition-colors cursor-pointer truncate max-w-full"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input & Action Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2"
          >
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.tex,.txt,.md,.json,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processFiles(e.target.files);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />

            <div className="relative flex items-center space-x-1.5">
              {/* File / Image Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer shrink-0"
                title="Tải ảnh đề bài hoặc tệp (.png, .jpg, .tex, .txt)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Dedicated PDF Upload Button */}
              <button
                type="button"
                onClick={() => {
                  const pdfInput = document.createElement('input');
                  pdfInput.type = 'file';
                  pdfInput.accept = '.pdf,application/pdf';
                  pdfInput.multiple = true;
                  pdfInput.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files.length > 0) {
                      processFiles(target.files);
                    }
                  };
                  pdfInput.click();
                }}
                className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer shrink-0"
                title="Tải file PDF đề thi để AI phân tích"
              >
                <FileUp className="w-4 h-4" />
              </button>

              {/* Main Input Textarea with Paste listener */}
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    attachedFiles.length > 0
                      ? 'Nhập yêu cầu phân tích ảnh/tệp hoặc chọn gợi ý phía trên...'
                      : 'Hỏi Trợ lý HSG hoặc nhấn Ctrl+V để dán ảnh đề bài...'
                  }
                  className="w-full text-xs p-3 pr-10 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none max-h-24 text-slate-900 placeholder:text-slate-400 font-medium"
                />

                <button
                  type="submit"
                  disabled={(!inputQuery.trim() && attachedFiles.length === 0) || isCopilotThinking}
                  className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg shadow transition-all cursor-pointer disabled:cursor-not-allowed"
                  title="Gửi câu hỏi"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick LaTeX Formula snippet helpers & Keyboard Hint */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-400 font-bold">Chèn nhanh:</span>
                <button
                  type="button"
                  onClick={() => setInputQuery((prev) => prev + ' $x \\ge 0$ ')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono cursor-pointer"
                >
                  $x \ge 0$
                </button>
                <button
                  type="button"
                  onClick={() => setInputQuery((prev) => prev + ' \\frac{a}{b} ')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono cursor-pointer"
                >
                  \frac
                </button>
                <button
                  type="button"
                  onClick={() => setInputQuery((prev) => prev + ' \\sum_{i=1}^n ')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono cursor-pointer"
                >
                  \sum
                </button>
              </div>

              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Nhấn <strong>Enter</strong> để gửi
              </span>
            </div>
          </form>
        </div>
      )}

      {/* 3. LIGHTBOX IMAGE MODAL (Xem ảnh độ nét cao) */}
      {lightboxImageUrl && (
        <div
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-150"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl p-2 shadow-2xl border border-white/20">
            <button
              onClick={() => setLightboxImageUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImageUrl}
              alt="Ảnh phóng to"
              className="max-h-[85vh] max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* 4. PROPOSAL CONFIRMATION MODAL (Xác nhận an toàn trước khi thay đổi dữ liệu) */}
      {proposalConfirmation && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-indigo-700">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Xác Nhận Áp Dụng Đề Xuất Sư Phạm
                  </h3>
                  <p className="text-xs text-slate-500">
                    Trợ lý HSG sẽ cập nhật nội dung này vào chuyên đề hiện tại
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProposalConfirmation(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proposal Details Preview */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-indigo-900">
                {proposalConfirmation.proposal.title}
              </div>
              <p className="text-xs text-slate-600">
                {proposalConfirmation.proposal.description}
              </p>

              {/* Render Payload preview if it is an exercise */}
              {proposalConfirmation.proposal.type === 'add_exercise' &&
                proposalConfirmation.proposal.payload && (
                  <div className="mt-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <div className="font-semibold text-slate-800">
                      {proposalConfirmation.proposal.payload.title}
                    </div>
                    <div className="bg-slate-50 p-2 rounded text-slate-700 font-mono text-[11px]">
                      <MathRenderer
                        content={proposalConfirmation.proposal.payload.statementLatex || ''}
                      />
                    </div>
                  </div>
                )}

              {/* Render Payload preview if it is a lemma */}
              {proposalConfirmation.proposal.type === 'add_lemma' &&
                proposalConfirmation.proposal.payload && (
                  <div className="mt-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <div className="font-semibold text-slate-800">
                      {proposalConfirmation.proposal.payload.name}
                    </div>
                    <div className="bg-slate-50 p-2 rounded text-slate-700 text-[11px]">
                      <MathRenderer
                        content={proposalConfirmation.proposal.payload.statementLatex || ''}
                      />
                    </div>
                  </div>
                )}
            </div>

            {/* Confirmation actions */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setProposalConfirmation(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmApplyProposal}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Đồng Ý & Bổ Sung Vào Chuyên Đề</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

