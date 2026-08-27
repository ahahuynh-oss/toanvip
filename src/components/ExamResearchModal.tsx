import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Target,
  FileText,
  Upload,
  Layers,
  Award,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Zap,
  HelpCircle,
  BrainCircuit,
  Filter,
  ShieldCheck,
  CheckSquare,
  Square,
  Plus,
  Edit3,
  Flame,
  Info,
} from 'lucide-react';
import {
  TopicCurriculum,
  MathBranch,
  TargetLevel,
  RecommendedTopicProposal,
  ExamResearchAnalysisResult,
} from '../types/math';
import { analyzeExamAndRecommendTopics, FileAttachment } from '../services/geminiService';
import { MathRenderer } from './MathRenderer';

interface ExamResearchModalProps {
  onClose: () => void;
  onCreateTopicFromProposal: (proposal: RecommendedTopicProposal, autoDesign5Steps: boolean) => void;
  onOpenManualCreate: () => void;
  teacherName: string;
  schoolName: string;
}

const SAMPLE_EXAMS = [
  {
    title: 'Đề Thi HSG TP Hà Nội & Chuyên KHTN (Bất Đẳng Thức & Phương Trình)',
    grade: '10' as const,
    targetLevel: 'provincial_hsg' as const,
    mathBranch: 'algebra' as const,
    content: `Bài 1 (4.0 điểm): Giải phương trình trên tập số thực:
$$\\sqrt{3x^2 - 5x + 7} + \\sqrt{3x^2 + 7x + 2} = 6x - 1$$

Bài 2 (5.0 điểm): Cho các số thực dương $a, b, c$ thỏa mãn $ab + bc + ca = 3$.
Chứng minh rằng:
$$\\frac{a}{\\sqrt{b^3 + 1}} + \\frac{b}{\\sqrt{c^3 + 1}} + \\frac{c}{\\sqrt{a^3 + 1}} \\ge \\frac{3}{\\sqrt{2}}$$

Bài 3 (4.0 điểm): Tìm tất cả các cặp số nguyên $(x, y)$ thỏa mãn:
$$x^3 + y^3 = (x+y)^2 + 2(xy - 1)$$`,
  },
  {
    title: 'Đề Thi Chọn Đội Tuyển Olympic / VMO (Tổ Hợp & Số Học Chuyên Sâu)',
    grade: '11' as const,
    targetLevel: 'national_vmo' as const,
    mathBranch: 'combinatorics' as const,
    content: `Bài 1 (5.0 điểm): Cho tập hợp $S = \\{1, 2, 3, \\dots, 2024\\}$. Hỏi có thể chia tập $S$ thành hai tập con rời nhau $A$ và $B$ sao cho trong mỗi tập không chứa 3 phần tử nào lập thành một cấp số cộng?

Bài 2 (5.0 điểm): Cho số nguyên tố $p > 3$. Chứng minh rằng tử số của phân số:
$$H = 1 + \\frac{1}{2} + \\frac{1}{3} + \\dots + \\frac{1}{p-1}$$
khi viết dưới dạng phân số tối giản thì chia hết cho $p^2$ (Định lý Wolstenholme).

Bài 3 (5.0 điểm): Trên một bảng ô vuông kích thước $n \\times n$, mỗi ô được điền một số thực sao cho tổng các số trên mỗi hàng và mỗi cột đều bằng 1. Chứng minh tồn tại cấu hình...`,
  },
  {
    title: 'Đề Thi Tuyển Chọn Olympic Hình Học Phẳng (Hàng Điểm Điều Hòa & Điểm Cố Định)',
    grade: '10' as const,
    targetLevel: 'national_vmo' as const,
    mathBranch: 'geometry' as const,
    content: `Bài 1 (6.0 điểm): Cho tam giác nhọn $ABC$ có trực tâm $H$ và đường tròn ngoại tiếp $(O)$. Đường tròn nội tiếp $(I)$ tiếp xúc với $BC, CA, AB$ lần lượt tại $D, E, F$. Đường thẳng qua $D$ vuông góc với $EF$ cắt lại $(I)$ tại $K$. Tiếp tuyến của $(I)$ tại $K$ cắt $BC$ tại $T$.
a) Chứng minh rằng $T, E, F$ thẳng hàng.
b) Chứng minh chùm đường thẳng $(TD, TK; TE, TF)$ là chùm điều hòa.

Bài 2 (4.0 điểm): Cho đường tròn $(O)$ và dây cung $BC$ cố định. Điểm $A$ di động trên cung lớn $BC$. Chứng minh tâm đường tròn Euler của tam giác $ABC$ luôn thuộc một đường tròn cố định.`,
  },
  {
    title: 'Đề Tuyển Chọn HSG (Số Học: Phương Trình Nghiệm Nguyên & Đồng Dư)',
    grade: '10' as const,
    targetLevel: 'provincial_hsg' as const,
    mathBranch: 'number_theory' as const,
    content: `Đề năm 2022 — Câu 3: Tìm tất cả các cặp số nguyên $(x, y)$ thỏa mãn phương trình:
$$x^3 + y^3 = (x+y)^2 + 2(xy - 1)$$

Đề năm 2023 — Câu 4: Tìm tất cả các nghiệm nguyên dương của phương trình:
$$3^x + 1 = 2^y$$

Đề năm 2025 — Câu 2: Tìm tất cả các cặp số nguyên dương $(x, y)$ thỏa mãn:
$$x^2 - 3xy + 2y^2 = 7$$`,
  },
];

export const ExamResearchModal: React.FC<ExamResearchModalProps> = ({
  onClose,
  onCreateTopicFromProposal,
  onOpenManualCreate,
  teacherName,
  schoolName,
}) => {
  const [examInputText, setExamInputText] = useState<string>(SAMPLE_EXAMS[0].content);
  const [grade, setGrade] = useState<'10' | '11' | '12' | 'all'>('10');
  const [targetLevel, setTargetLevel] = useState<TargetLevel>('provincial_hsg');
  const [mathBranchFilter, setMathBranchFilter] = useState<MathBranch | 'all'>('all');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ExamResearchAnalysisResult | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'input' | 'results'>('input');
  const [vettingFilter, setVettingFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [tracebackProposal, setTracebackProposal] = useState<RecommendedTopicProposal | null>(null);
  
  // Custom inputs added by teacher
  const [newCustomTechnique, setNewCustomTechnique] = useState<string>('');
  const [newCustomLemma, setNewCustomLemma] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onload = () => {
          const resultStr = reader.result as string;
          const base64Data = resultStr.split(',')[1] || '';
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              mimeType: file.type,
              size: file.size,
              dataUrl: resultStr,
              data: base64Data,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          const text = reader.result as string;
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              mimeType: file.type,
              size: file.size,
              text: text,
            },
          ]);
          if (!examInputText.trim()) {
            setExamInputText(text);
          }
        };
        reader.readAsText(file);
      }
    });
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSelectSample = (sample: typeof SAMPLE_EXAMS[0]) => {
    setExamInputText(sample.content);
    setGrade(sample.grade);
    setTargetLevel(sample.targetLevel);
    setMathBranchFilter(sample.mathBranch);
  };

  const handleRunAnalysis = async () => {
    if (!examInputText.trim() && attachments.length === 0) {
      alert('Vui lòng nhập/dán đề thi hoặc chọn đề mẫu để tiến hành nghiên cứu!');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setActiveTab('results');
    try {
      const result = await analyzeExamAndRecommendTopics(
        examInputText,
        targetLevel,
        grade,
        mathBranchFilter,
        attachments
      );
      setAnalysisResult(result);
      if (result.recommendedTopics && result.recommendedTopics.length > 0) {
        setSelectedProposalId(result.recommendedTopics[0].id);
      }
    } catch (err: any) {
      console.error('Analysis failed', err);
      setAnalysisError(err.message || 'Lỗi kết nối Gemini AI / 429 RESOURCE_EXHAUSTED');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentSelectedProposal = analysisResult?.recommendedTopics.find(
    (p) => p.id === selectedProposalId
  );

  // Update proposal state helper
  const updateProposal = (updated: Partial<RecommendedTopicProposal>) => {
    if (!analysisResult || !currentSelectedProposal) return;
    const newTopics = analysisResult.recommendedTopics.map((item) =>
      item.id === currentSelectedProposal.id ? { ...item, ...updated } : item
    );
    setAnalysisResult({ ...analysisResult, recommendedTopics: newTopics });
  };

  // Toggle Technique Selection by Teacher
  const toggleTechnique = (tech: string) => {
    if (!currentSelectedProposal) return;
    const current = currentSelectedProposal.selectedCoreTechniques || currentSelectedProposal.coreTechniques || [];
    const updated = current.includes(tech)
      ? current.filter((t) => t !== tech)
      : [...current, tech];
    updateProposal({ selectedCoreTechniques: updated });
  };

  // Add Custom Technique by Teacher
  const addCustomTechnique = () => {
    if (!newCustomTechnique.trim() || !currentSelectedProposal) return;
    const currentList = currentSelectedProposal.coreTechniques || [];
    const currentSelected = currentSelectedProposal.selectedCoreTechniques || currentList;
    updateProposal({
      coreTechniques: [...currentList, newCustomTechnique.trim()],
      selectedCoreTechniques: [...currentSelected, newCustomTechnique.trim()],
    });
    setNewCustomTechnique('');
  };

  // Toggle Lemma Selection by Teacher
  const toggleLemma = (lemma: string) => {
    if (!currentSelectedProposal) return;
    const current = currentSelectedProposal.selectedUnderlyingLemmas || currentSelectedProposal.underlyingLemmas || [];
    const updated = current.includes(lemma)
      ? current.filter((l) => l !== lemma)
      : [...current, lemma];
    updateProposal({ selectedUnderlyingLemmas: updated });
  };

  // Add Custom Lemma by Teacher
  const addCustomLemma = () => {
    if (!newCustomLemma.trim() || !currentSelectedProposal) return;
    const currentList = currentSelectedProposal.underlyingLemmas || [];
    const currentSelected = currentSelectedProposal.selectedUnderlyingLemmas || currentList;
    updateProposal({
      underlyingLemmas: [...currentList, newCustomLemma.trim()],
      selectedUnderlyingLemmas: [...currentSelected, newCustomLemma.trim()],
    });
    setNewCustomLemma('');
  };

  // Change Vetting Status for Current Proposal
  const setVettingStatus = (status: 'approved' | 'rejected' | 'pending') => {
    updateProposal({ vettingStatus: status });
  };

  // Confirm and create topic
  const handleApplyProposal = (proposal: RecommendedTopicProposal) => {
    // Pass the vetted version (with teacher's selected techniques and lemmas)
    const vettedProposal: RecommendedTopicProposal = {
      ...proposal,
      vettingStatus: 'approved',
      coreTechniques:
        proposal.selectedCoreTechniques && proposal.selectedCoreTechniques.length > 0
          ? proposal.selectedCoreTechniques
          : proposal.coreTechniques,
      underlyingLemmas:
        proposal.selectedUnderlyingLemmas && proposal.selectedUnderlyingLemmas.length > 0
          ? proposal.selectedUnderlyingLemmas
          : proposal.underlyingLemmas,
    };
    onCreateTopicFromProposal(vettedProposal, true);
    onClose();
  };

  // Filtered proposals for left panel
  const filteredProposals = (analysisResult?.recommendedTopics || []).filter((p) => {
    if (vettingFilter === 'all') return true;
    return p.vettingStatus === vettingFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl text-slate-900 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 tracking-wider">
                  Trợ Lý Nghiên Cứu & Bóc Tách Đề Thi
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-xs text-slate-600 font-semibold hidden sm:inline">
                  Định hướng chương trình từ đề thi thực chiến
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
                <span>🔬 NGHIÊN CỨU ĐỀ THI</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">XÂY DỰNG CHUYÊN ĐỀ</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PEDAGOGICAL SAFETY & CORE PHILOSOPHY NOTICE */}
        <div className="bg-amber-50/80 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-2 text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-600 font-medium hidden lg:inline">Nguyên tắc kiểm duyệt:</span>
            <span className="text-slate-800 font-medium text-[11px] sm:text-xs">
              Hệ thống <b>phân biệt rõ ràng giữa dữ liệu thực tế đề thi và suy luận của AI</b>. Thầy/Cô giữ toàn quyền chấp nhận, chỉnh sửa hoặc từ chối từng đề xuất.
            </span>
          </div>

          {analysisResult && (
            <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-xs shrink-0">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                  activeTab === 'input' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Đề Thi Đầu Vào
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                  activeTab === 'results' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Bóc Tách & Duyệt Đề Xuất ({analysisResult.recommendedTopics.length})
              </button>
            </div>
          )}
        </div>

        {/* BODY AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
          {activeTab === 'input' ? (
            /* TAB 1: INPUT & EXAM UPLOAD */
            <div className="space-y-4">
              {/* Quick Preset Samples */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    Chọn Nhanh Bộ Đề Thi HSG Mẫu Thực Chiến Để Thử Nghiệm:
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    (Hoặc tự nhập/dán đề thi của Thầy/Cô phía dưới)
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {SAMPLE_EXAMS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(s)}
                      className="p-3 text-left rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                          {s.targetLevel === 'national_vmo' ? 'VMO / Olympic' : 'HSG Cấp Tỉnh'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Khối {s.grade}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                        {s.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Input Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center">
                    <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
                    Dữ Liệu Đề Thi Cần Nghiên Cứu (Ground Truth):
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Hỗ trợ dán toàn bộ đề, nhiều câu hỏi, công thức LaTeX, ký hiệu toán
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={examInputText}
                  onChange={(e) => setExamInputText(e.target.value)}
                  placeholder="Dán nội dung đề thi HSG Tỉnh, đề tuyển chọn, đề VMO hoặc các bài toán phân loại tại đây...
Ví dụ:
Bài 1: Giải phương trình sqrt(3x^2 - 5x + 7) + sqrt(3x^2 + 7x + 2) = 6x - 1...
Bài 2: Cho a, b, c > 0 thỏa mãn ab+bc+ca = 3. Chứng minh rằng..."
                  className="w-full text-xs font-mono p-3.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y leading-relaxed shadow-inner"
                />
              </div>

              {/* File / Image Attachment Support */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Đính kèm hình ảnh đề thi (Chụp sách, đề viết tay) hoặc tệp .tex/.txt:</span>
                  </div>
                  <label className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center space-x-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tải Lên Tệp / Ảnh Đề</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.txt,.tex,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-xs"
                      >
                        {att.dataUrl ? (
                          <img
                            src={att.dataUrl}
                            alt="preview"
                            className="w-5 h-5 rounded object-cover"
                          />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span className="truncate max-w-[140px] font-mono text-[11px] font-medium">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Target & Grade Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Khối Lớp Mục Tiêu:
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as any)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
                  >
                    <option value="10">Khối 10 Chuyên</option>
                    <option value="11">Khối 11 Chuyên</option>
                    <option value="12">Khối 12 Chuyên</option>
                    <option value="all">Toàn Cấp THPT</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Cấp Độ Kỳ Thi:
                  </label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as any)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
                  >
                    <option value="school_team">HSG Cấp Trường / Vòng Chọn</option>
                    <option value="provincial_hsg">HSG Cấp Tỉnh / Thành Phố</option>
                    <option value="national_vmo">HSG Quốc Gia (VMO)</option>
                    <option value="tst_olympiad">Tuyển Chọn Đội Tuyển Olympic</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Phân Môn Ưu Tiên:
                  </label>
                  <select
                    value={mathBranchFilter}
                    onChange={(e) => setMathBranchFilter(e.target.value as any)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
                  >
                    <option value="all">Tất cả các phân môn</option>
                    <option value="algebra">Đại số & BĐT</option>
                    <option value="geometry">Hình học phẳng</option>
                    <option value="number_theory">Số học</option>
                    <option value="combinatorics">Tổ hợp & Rời rạc</option>
                    <option value="calculus_sequences">Dãy số & Giải tích</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: RESULTS VIEW & TEACHER VETTING */
            <div className="space-y-5">
              {isAnalyzing ? (
                <div className="py-16 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                    <Sparkles className="w-6 h-6 text-blue-600 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">
                      Đang Nghiên Cứu Đề Thi & Bóc Tách Khung Sư Phạm...
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Hệ thống đang trích xuất dữ liệu thực tế từ đề thi, phân tích bổ đề ẩn, và đưa ra gợi ý sư phạm để Thầy/Cô kiểm duyệt.
                    </p>
                  </div>
                </div>
              ) : analysisError ? (
                <div className="py-12 px-6 bg-rose-50 border-2 border-rose-300 rounded-2xl text-center space-y-4 max-w-xl mx-auto animate-in zoom-in-95">
                  <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-black text-rose-900 uppercase">
                      Đã dừng do lỗi (API / Quota)
                    </h4>
                    <div className="p-3 bg-white border border-rose-200 rounded-xl text-xs font-mono text-rose-800 text-left overflow-x-auto">
                      {analysisError}
                    </div>
                    <p className="text-xs text-slate-600">
                      Nếu gặp lỗi <code>429 RESOURCE_EXHAUSTED</code>, vui lòng lấy API Key mới miễn phí tại{' '}
                      <a
                        href="https://aistudio.google.com/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-bold underline"
                      >
                        aistudio.google.com/api-keys
                      </a>{' '}
                      và dán vào mục Cài đặt.
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-3 pt-2">
                    <button
                      onClick={() => setActiveTab('input')}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Quay Lại Đề Thi
                    </button>
                    <button
                      onClick={handleRunAnalysis}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
                    >
                      Thử Lại Ngay
                    </button>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-5">
                  
                  {/* DISCLAIMER & SCIENTIFIC STATEMENTS BANNER */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-amber-900 uppercase tracking-wide">
                        Lưu Ý Sư Phạm & Cam Kết Khoa Học Giáo Dục:
                      </span>
                      <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
                        {analysisResult.disclaimerNotice} Thầy/Cô giữ vai trò hội đồng chuyên môn: có quyền <b className="text-slate-900">chấp thuận, loại bỏ hoặc hiệu chỉnh từng kỹ thuật/bổ đề</b> trước khi đưa vào giáo án.
                      </p>
                    </div>
                  </div>

                  {/* 1. FACTUAL SUMMARY & AI REASONING BANNER */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* FACTUAL SUMMARY (DỮ LIỆU ĐỐI SOÁT THỰC TẾ) */}
                    <div className="md:col-span-5 p-4 rounded-xl bg-cyan-50/50 border border-cyan-200 shadow-xs space-y-2">
                      <div className="flex items-center space-x-2 text-cyan-900 font-bold text-xs uppercase tracking-wider">
                        <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300 font-mono text-[10px]">
                          📌 DỮ LIỆU THỰC TẾ ĐỀ THI
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {analysisResult.examOverview}
                      </p>
                      <div className="pt-2 border-t border-cyan-200/60 text-[11px] text-slate-600 space-y-0.5">
                        <div>• Số bài toán bóc tách: <b className="text-cyan-900">{analysisResult.factualSummary.totalProblemsExtracted} bài</b></div>
                        <div>• Phân môn: <b className="text-slate-800">{analysisResult.factualSummary.branchesCovered.join(', ')}</b></div>
                        <div>• Phân bố độ khó: <b className="text-slate-800">{analysisResult.factualSummary.difficultyDistribution}</b></div>
                      </div>
                    </div>

                    {/* AI PEDAGOGICAL INFERENCE (SUY LUẬN & ĐỀ XUẤT CỦA AI) */}
                    <div className="md:col-span-7 p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 shadow-xs space-y-2">
                      <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-300 font-mono text-[10px] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          🤖 SUY LUẬN & ĐỀ XUẤT SƯ PHẠM CỦA AI
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {analysisResult.whyThisCurriculumMatter}
                      </p>
                      {analysisResult.pedagogicalAdvice && analysisResult.pedagogicalAdvice.length > 0 && (
                        <div className="pt-2 border-t border-indigo-200/60 text-[11px] text-slate-700 space-y-0.5">
                          <span className="font-bold text-indigo-950">Khuyến nghị phương pháp giảng dạy:</span>
                          <p className="italic text-slate-600">"{analysisResult.pedagogicalAdvice[0]}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. FREQUENT TOPIC PATTERNS */}
                  {analysisResult.patterns && analysisResult.patterns.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                        <Target className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                        Ma Trận Dạng Toán & Kỹ Thuật Trọng Điểm Xuất Hiện Trong Đề:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {analysisResult.patterns.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{p.topicArea}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  p.frequency === 'high'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : p.frequency === 'medium'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {p.frequency === 'high' ? 'Trọng Tâm Cao' : 'Phổ Biến'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">{p.description}</p>
                            <div className="pt-1 flex flex-wrap gap-1">
                              {p.keyMethods.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. RECOMMENDED TOPIC PROPOSALS & TEACHER VETTING WORKSPACE */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center">
                          <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                          Danh Mục Chuyên Đề Đề Xuất & Quyền Duyệt Chuyên Môn:
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">({analysisResult.recommendedTopics.length} chuyên đề)</span>
                      </div>

                      {/* Vetting Filter Tabs */}
                      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                        <button
                          type="button"
                          onClick={() => setVettingFilter('all')}
                          className={`px-2.5 py-0.5 rounded font-semibold cursor-pointer transition-all ${
                            vettingFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Tất cả ({analysisResult.recommendedTopics.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setVettingFilter('approved')}
                          className={`px-2.5 py-0.5 rounded font-semibold cursor-pointer transition-all ${
                            vettingFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          Đã duyệt ({analysisResult.recommendedTopics.filter((t) => t.vettingStatus === 'approved').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setVettingFilter('pending')}
                          className={`px-2.5 py-0.5 rounded font-semibold cursor-pointer transition-all ${
                            vettingFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
                          }`}
                        >
                          Chờ duyệt ({analysisResult.recommendedTopics.filter((t) => t.vettingStatus === 'pending').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setVettingFilter('rejected')}
                          className={`px-2.5 py-0.5 rounded font-semibold cursor-pointer transition-all ${
                            vettingFilter === 'rejected' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          Đã loại ({analysisResult.recommendedTopics.filter((t) => t.vettingStatus === 'rejected').length})
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Left: Topic List Selection with Vetting Badges */}
                      <div className="lg:col-span-4 space-y-2">
                        {filteredProposals.map((prop, pIdx) => {
                          const isSelected = selectedProposalId === prop.id;
                          return (
                            <div
                              key={prop.id || pIdx}
                              onClick={() => setSelectedProposalId(prop.id)}
                              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 relative overflow-hidden ${
                                isSelected
                                  ? 'bg-blue-50/90 border-2 border-blue-600 shadow-sm'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                              } ${prop.vettingStatus === 'rejected' ? 'opacity-50' : ''}`}
                            >
                              {isSelected && (
                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-600" />
                              )}
                              
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                                  {prop.code}
                                </span>
                                
                                {/* Vetting Status Badge */}
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    prop.vettingStatus === 'approved'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : prop.vettingStatus === 'rejected'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {prop.vettingStatus === 'approved' ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Đã Duyệt
                                    </>
                                  ) : prop.vettingStatus === 'rejected' ? (
                                    <>
                                      <XCircle className="w-3 h-3 text-rose-600" />
                                      Đã Loại
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      Chờ Duyệt
                                    </>
                                  )}
                                </span>
                              </div>

                              <h5 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                                {prop.title}
                              </h5>
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                                {prop.aiPedagogicalInference?.whyIncludedRationale}
                              </p>

                              {/* TRACEBACK BUTTON (TRUY NGƯỢC NGUỒN) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTracebackProposal(prop);
                                }}
                                className="mt-2.5 w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 hover:text-indigo-900 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Vì sao AI đề xuất?</span>
                              </button>
                            </div>
                          );
                        })}

                        {filteredProposals.length === 0 && (
                          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                            Không có chuyên đề nào ở trạng thái lọc này.
                          </div>
                        )}
                      </div>

                      {/* Right: Detailed Topic View & Teacher Vetting Controls */}
                      <div className="lg:col-span-8 bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                        {currentSelectedProposal ? (
                          <>
                            {/* Header of selected topic & Teacher Vetting Action Bar */}
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-xs text-slate-500">
                                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                                    {currentSelectedProposal.code}
                                  </span>
                                  <span>Khối {currentSelectedProposal.grade}</span>
                                  <span>•</span>
                                  <span className="text-slate-800 font-semibold">
                                    {currentSelectedProposal.targetLevel === 'national_vmo'
                                      ? 'HSG Quốc Gia (VMO)'
                                      : 'HSG Cấp Tỉnh'}
                                  </span>
                                  <span>•</span>
                                  <span>{currentSelectedProposal.estimatedHours} giờ bồi dưỡng</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 leading-snug">
                                  {currentSelectedProposal.title}
                                </h3>
                              </div>

                              {/* Teacher Vetting Buttons & Traceback */}
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setTracebackProposal(currentSelectedProposal)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs"
                                >
                                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Vì sao AI đề xuất?</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setVettingStatus('approved')}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center space-x-1.5 ${
                                    currentSelectedProposal.vettingStatus === 'approved'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-300'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Duyệt Chuyên Đề</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setVettingStatus('rejected')}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center space-x-1.5 ${
                                    currentSelectedProposal.vettingStatus === 'rejected'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-300'
                                  }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Từ Chối</span>
                                </button>
                              </div>
                            </div>

                            {/* DUAL COMPARISON: FACTUAL EXAM EVIDENCE vs AI INFERENCE */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {/* 1. FACTUAL EXAM EVIDENCE */}
                              <div className="p-3.5 bg-white rounded-xl border border-cyan-200 shadow-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1.5 text-cyan-900 font-bold text-[11px] uppercase tracking-wider">
                                    <FileText className="w-3.5 h-3.5 text-cyan-600" />
                                    <span>1. Căn Cứ Đề Thi Thực Tế (Ground Truth)</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setTracebackProposal(currentSelectedProposal)}
                                    className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                                  >
                                    <HelpCircle className="w-3 h-3 text-indigo-500" />
                                    <span>Truy ngược</span>
                                  </button>
                                </div>
                                <div className="text-xs bg-slate-50 p-2.5 rounded-lg text-slate-900 border border-slate-200 font-mono">
                                  <MathRenderer
                                    content={currentSelectedProposal.factualExamEvidence.exactProblemExcerpt}
                                  />
                                </div>
                                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                                  <span>Nguồn: <b className="text-slate-800">{currentSelectedProposal.factualExamEvidence.sourceExamName}</b></span>
                                  <span className="text-emerald-700 font-semibold">✓ Đã xác thực</span>
                                </div>
                              </div>

                              {/* 2. AI PEDAGOGICAL INFERENCE */}
                              <div className="p-3.5 bg-white rounded-xl border border-indigo-200 shadow-xs space-y-2">
                                <div className="flex items-center space-x-1.5 text-indigo-900 font-bold text-[11px] uppercase tracking-wider">
                                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>2. Luận Giải & Đề Xuất Của AI</span>
                                </div>
                                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                  {currentSelectedProposal.aiPedagogicalInference.whyIncludedRationale}
                                </p>
                                <div className="p-2 bg-indigo-50/60 rounded border border-indigo-100 text-[11px] text-indigo-900">
                                  <b>Giả thiết sư phạm:</b> {currentSelectedProposal.aiPedagogicalInference.pedagogicalHypothesis}
                                </div>
                              </div>
                            </div>

                            {/* TEACHER VETTING: SELECT / DESELECT TECHNIQUES & LEMMAS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              
                              {/* CORE TECHNIQUES SELECTION */}
                              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-blue-900 flex items-center">
                                    <Zap className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                    Kỹ Thuật Cốt Lõi (Thầy/Cô Tích Chọn):
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {(currentSelectedProposal.selectedCoreTechniques || []).length}/
                                    {(currentSelectedProposal.coreTechniques || []).length}
                                  </span>
                                </div>

                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {currentSelectedProposal.coreTechniques.map((tech, tIdx) => {
                                    const isChecked = (
                                      currentSelectedProposal.selectedCoreTechniques ||
                                      currentSelectedProposal.coreTechniques
                                    ).includes(tech);
                                    return (
                                      <div
                                        key={tIdx}
                                        onClick={() => toggleTechnique(tech)}
                                        className={`flex items-start space-x-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                          isChecked
                                            ? 'bg-blue-50 border border-blue-200 text-blue-950 font-medium'
                                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        <div className="mt-0.5">
                                          {isChecked ? (
                                            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                                          ) : (
                                            <Square className="w-3.5 h-3.5 text-slate-400" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <MathRenderer content={tech} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Add Custom Technique by Teacher */}
                                <div className="flex items-center space-x-1.5 pt-1">
                                  <input
                                    type="text"
                                    value={newCustomTechnique}
                                    onChange={(e) => setNewCustomTechnique(e.target.value)}
                                    placeholder="+ Thêm kỹ thuật của Thầy/Cô..."
                                    className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomTechnique()}
                                  />
                                  <button
                                    type="button"
                                    onClick={addCustomTechnique}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                                  >
                                    Thêm
                                  </button>
                                </div>
                              </div>

                              {/* UNDERLYING LEMMAS SELECTION */}
                              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-emerald-900 flex items-center">
                                    <Award className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                    Bổ Đề Ẩn / Tiền Đề (Thầy/Cô Tích Chọn):
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {(currentSelectedProposal.selectedUnderlyingLemmas || []).length}/
                                    {(currentSelectedProposal.underlyingLemmas || []).length}
                                  </span>
                                </div>

                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {currentSelectedProposal.underlyingLemmas.map((lem, lIdx) => {
                                    const isChecked = (
                                      currentSelectedProposal.selectedUnderlyingLemmas ||
                                      currentSelectedProposal.underlyingLemmas
                                    ).includes(lem);
                                    return (
                                      <div
                                        key={lIdx}
                                        onClick={() => toggleLemma(lem)}
                                        className={`flex items-start space-x-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                          isChecked
                                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium'
                                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        <div className="mt-0.5">
                                          {isChecked ? (
                                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                          ) : (
                                            <Square className="w-3.5 h-3.5 text-slate-400" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <MathRenderer content={lem} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Add Custom Lemma by Teacher */}
                                <div className="flex items-center space-x-1.5 pt-1">
                                  <input
                                    type="text"
                                    value={newCustomLemma}
                                    onChange={(e) => setNewCustomLemma(e.target.value)}
                                    placeholder="+ Thêm bổ đề của Thầy/Cô..."
                                    className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomLemma()}
                                  />
                                  <button
                                    type="button"
                                    onClick={addCustomLemma}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                                  >
                                    Thêm
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* TEACHER PERSONAL NOTES */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-800 flex items-center">
                                <Edit3 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                Ghi Chú Sư Phạm & Lưu Ý Riêng Của Thầy/Cô Khi Giảng Dạy:
                              </label>
                              <textarea
                                rows={2}
                                value={currentSelectedProposal.teacherNotes || ''}
                                onChange={(e) => updateProposal({ teacherNotes: e.target.value })}
                                placeholder="Nhập lưu ý phương pháp, phân hóa học sinh hoặc định hướng giảng dạy riêng của Thầy/Cô tại đây..."
                                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                              />
                            </div>

                            {/* PRIMARY CTA: ACCEPT & AUTO DESIGN 5 STEPS */}
                            <div className="pt-2">
                              <button
                                onClick={() => handleApplyProposal(currentSelectedProposal)}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.99]"
                              >
                                <Sparkles className="w-4 h-4 fill-white" />
                                <span>PHÊ DUYỆT CHUYÊN ĐỀ & TỰ ĐỘNG XÂY DỰNG 5 BƯỚC SƯ PHẠM</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                              <p className="text-[11px] text-center text-slate-500 mt-1.5 font-medium">
                                Hệ thống sẽ sử dụng chính xác các kỹ thuật và bổ đề Thầy/Cô đã tích chọn ở trên để xây dựng giáo án.
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="py-16 text-center text-slate-400 text-xs">
                            Chọn một chuyên đề ở danh sách bên trái để xem căn cứ thực tế và kiểm duyệt sư phạm
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-left leading-tight text-xs text-slate-600">
            <div className="font-bold text-slate-900">{teacherName || 'Huỳnh Thị Hà'}</div>
            <div className="text-[11px] text-slate-500">{schoolName || 'Trường THPT Hà Huy Tập'}</div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenManualCreate();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Nhập Tiêu Đề Thủ Công
            </button>

            {activeTab === 'input' ? (
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 fill-white" />
                )}
                <span>Bắt Đầu Nghiên Cứu & Đề Xuất Chuyên Đề</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('input')}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Nhập Lại Đề Thi Khác
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TRACEBACK MODAL DIALOG (TRUY NGƯỢC NGUỒN) */}
      {tracebackProposal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl text-slate-900 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* HEADER */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                      Truy Ngược Nguồn Gốc Đề Xuất
                    </span>
                    <span className="text-xs text-slate-600 font-semibold">• Đối soát thực tế</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    CƠ SỞ ĐỀ XUẤT CHUYÊN ĐỀ
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTracebackProposal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Topic Title Banner */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Chuyên đề:</span>
                  <h4 className="text-sm sm:text-base font-bold text-blue-900">
                    {tracebackProposal.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 bg-white text-slate-800 rounded border border-slate-300 font-bold shadow-xs">
                  {tracebackProposal.code}
                </span>
              </div>

              {/* 1. CITATION LIST FROM EXAMS */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-900 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Căn Cứ Dữ Liệu Thực Tế Từ Đề Thi Đã Cung Cấp:
                </h5>
                <div className="space-y-2">
                  {(tracebackProposal.traceback?.matchedExamCitations && tracebackProposal.traceback.matchedExamCitations.length > 0
                    ? tracebackProposal.traceback.matchedExamCitations
                    : (tracebackProposal.seedExamQuestions || []).map((q, idx) => ({
                        examYearOrName: q.source || 'Đề thi cung cấp',
                        questionLabel: `Câu ${idx + 1}`,
                        excerptLatex: q.contentLatex,
                        keyRelevance: q.analysisNote,
                      }))
                  ).map((cite, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors space-y-1.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 font-bold text-slate-900">
                          <span className="text-emerald-600 font-black text-sm">✓</span>
                          <span className="text-blue-700 font-bold">{cite.examYearOrName}</span>
                          <span className="text-slate-400">—</span>
                          <span className="text-slate-800 font-semibold">{cite.questionLabel}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          Dữ liệu thực tế
                        </span>
                      </div>

                      {cite.excerptLatex && (
                        <div className="text-xs p-2.5 bg-white rounded border border-slate-200 text-slate-900 font-mono shadow-inner">
                          <MathRenderer content={cite.excerptLatex} />
                        </div>
                      )}

                      {cite.keyRelevance && (
                        <div className="text-[11px] text-slate-600 flex items-center space-x-1.5">
                          <span className="text-slate-500 font-medium">Mục tiêu rèn luyện:</span>
                          <span className="text-slate-800 font-medium">{cite.keyRelevance}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. RELATED CONCEPTS / NỘI DUNG LIÊN QUAN */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center">
                  <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
                  Các Nội Dung & Phương Pháp Liên Quan:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {(tracebackProposal.traceback?.relatedConcepts || tracebackProposal.coreTechniques || [
                    'Đồng dư',
                    'Ước số',
                    'Đánh giá',
                    'Phương trình nghiệm nguyên',
                  ]).map((concept, kIdx) => (
                    <span
                      key={kIdx}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center space-x-1 shadow-xs"
                    >
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{concept}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. SCIENTIFIC STATISTICAL OBSERVATION / NHẬN ĐỊNH */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs space-y-1 shadow-xs">
                <div className="font-bold text-indigo-900 flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Nhận Định Thống Kê Sư Phạm:</span>
                </div>
                <p className="text-slate-800 font-semibold leading-relaxed">
                  {tracebackProposal.traceback?.dataObservationSummary ||
                    `Chủ đề xuất hiện trong 3/5 bộ đề được phân tích.`}
                </p>
              </div>

              {/* 4. MANDATORY PEDAGOGICAL DISCLAIMER */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950">
                <div className="flex items-center space-x-1.5 font-bold text-amber-900 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cam Kết Minh Bạch Học Thuật:</span>
                </div>
                <p className="font-bold text-amber-900 leading-relaxed text-[12px]">
                  {tracebackProposal.traceback?.disclaimer ||
                    '⚠ Đây là thống kê trên dữ liệu đã cung cấp, không phải dự đoán đề thi tương lai.'}
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                  Hệ thống cung cấp cơ sở dữ liệu đối soát để giáo viên biết chính xác tại sao AI đưa ra đề xuất, đảm bảo vai trò kiểm duyệt chuyên môn cao nhất thay vì phải tin AI một cách mù quáng.
                </p>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTracebackProposal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Đóng
              </button>

              <div className="flex items-center space-x-2">
                {tracebackProposal.vettingStatus !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...tracebackProposal, vettingStatus: 'approved' as const };
                      if (analysisResult) {
                        setAnalysisResult({
                          ...analysisResult,
                          recommendedTopics: analysisResult.recommendedTopics.map((t) =>
                            t.id === updated.id ? updated : t
                          ),
                        });
                      }
                      setTracebackProposal(null);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center space-x-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Duyệt Chuyên Đề Này</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const proposalToApply = tracebackProposal;
                    setTracebackProposal(null);
                    handleApplyProposal(proposalToApply);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center space-x-1.5 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  <span>Xây Dựng 5 Bước Sư Phạm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
