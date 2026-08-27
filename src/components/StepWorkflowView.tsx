import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  Network,
  BookMarked,
  Layers,
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Save,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BookOpen,
  Award,
  Zap,
  Check,
  HelpCircle,
  CheckCircle2,
  Palette,
  LayoutList,
} from 'lucide-react';
import { TopicCurriculum, TieredExercise, KeyLemma, LogicRoadmapNode } from '../types/math';
import { MathRenderer } from './MathRenderer';
import { generateFullCurriculumAI } from '../services/geminiService';
import { KnowledgeGraphView } from './KnowledgeGraphView';
import { VisualMathSandbox } from './VisualMathSandbox';

interface StepWorkflowViewProps {
  topic: TopicCurriculum;
  onUpdateTopic: (updated: TopicCurriculum) => void;
  onNavigateToTab: (tabName: string) => void;
  isAiProcessing: boolean;
  setIsAiProcessing: (status: boolean) => void;
  activeStep?: number;
  onStepChange?: (step: number) => void;
}

export const StepWorkflowView: React.FC<StepWorkflowViewProps> = ({
  topic,
  onUpdateTopic,
  onNavigateToTab,
  isAiProcessing,
  setIsAiProcessing,
  activeStep: externalActiveStep,
  onStepChange,
}) => {
  const [internalActiveStep, setInternalActiveStep] = useState<number>(1);
  const activeStep = externalActiveStep !== undefined ? externalActiveStep : internalActiveStep;
  const setActiveStep = (step: number) => {
    setInternalActiveStep(step);
    if (onStepChange) onStepChange(step);
  };
  const [step2ViewMode, setStep2ViewMode] = useState<'graph' | 'list'>('graph');
  const [showMathSandbox, setShowMathSandbox] = useState<boolean>(false);
  const [aiGenPromptModal, setAiGenPromptModal] = useState<boolean>(false);
  const [customGenNotes, setCustomGenNotes] = useState<string>('');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    topic.step4Exercises[0]?.id || null
  );
  const [showAddLemmaModal, setShowAddLemmaModal] = useState<boolean>(false);
  const [newLemma, setNewLemma] = useState<Partial<KeyLemma>>({
    name: '',
    statementLatex: '',
    proofLatex: '',
    pedagogyNotes: '',
    commonTraps: [''],
  });

  // Handle Full AI Auto-Design for 5 steps
  const handleAutoDesign5Steps = async () => {
    try {
      setIsAiProcessing(true);
      const generated = await generateFullCurriculumAI(
        topic.title,
        topic.grade,
        topic.mathBranch,
        topic.targetLevel,
        customGenNotes
      );

      const updated: TopicCurriculum = {
        ...topic,
        step1Pedagogy: generated.step1Pedagogy || topic.step1Pedagogy,
        step2Roadmap: generated.step2Roadmap || topic.step2Roadmap,
        step3Theory: generated.step3Theory || topic.step3Theory,
        step4Exercises: generated.step4Exercises || topic.step4Exercises,
        updatedAt: new Date().toISOString(),
      };

      onUpdateTopic(updated);
      setAiGenPromptModal(false);
    } catch (err: any) {
      alert('Lỗi khi thiết kế bằng AI: ' + (err.message || 'Vui lòng thử lại.'));
    } finally {
      setIsAiProcessing(false);
    }
  };

  const stepsHeader = [
    { num: 1, title: 'Mục Tiêu Sư Phạm', fullTitle: 'Thiết Lập Mục Tiêu Sư Phạm & Chuẩn Đầu Ra', icon: <Target className="w-4 h-4" /> },
    { num: 2, title: 'Khung Logic Toán', fullTitle: 'Xây Dựng Khung Logic & Bản Đồ Kiến Thức', icon: <Network className="w-4 h-4" /> },
    { num: 3, title: 'Lý Thuyết & Bổ Đề', fullTitle: 'Biên Soạn Lý Thuyết & Bổ Đề Then Chốt', icon: <BookMarked className="w-4 h-4" /> },
    { num: 4, title: 'Bài Tập Phân Tầng', fullTitle: 'Hệ Thống Bài Tập Phân Tầng & Lời Giải', icon: <Layers className="w-4 h-4" /> },
    { num: 5, title: 'Biến Thể & Thẩm Định', fullTitle: 'Phát Triển Biến Thể & Thẩm Định Toàn Diện', icon: <CheckSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Header Banner - Compact & Eye-friendly Light Design */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-4.5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-bold tracking-wide text-[11px]">
                Chuyên đề: {topic.code}
              </span>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                Khối {topic.grade} Chuyên
              </span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                {topic.targetLevel === 'provincial_hsg'
                  ? 'HSG Cấp Tỉnh/Thành'
                  : topic.targetLevel === 'national_vmo'
                  ? 'HSG Quốc Gia (VMO)'
                  : topic.targetLevel === 'school_team'
                  ? 'HSG Cấp Trường'
                  : 'Đội Tuyển Olympic'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              {topic.title}
            </h1>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex items-center">
            <button
              onClick={() => setAiGenPromptModal(true)}
              disabled={isAiProcessing}
              className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              {isAiProcessing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
              )}
              <span>AI Tự Động Thiết Kế 5 Bước</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Step Progress Bar Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {stepsHeader.map((st) => {
          const isActive = activeStep === st.num;
          const isDone = activeStep > st.num;
          return (
            <button
              key={st.num}
              onClick={() => setActiveStep(st.num)}
              className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-blue-50/95 border-blue-600 text-blue-950 shadow-md ring-2 ring-blue-500/20'
                  : isDone
                  ? 'bg-emerald-50/40 border-emerald-300 text-slate-800 hover:bg-emerald-50/80 hover:border-emerald-400'
                  : 'bg-white border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {/* Active Indicator Top Accent */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
              )}

              {/* Number / Status Icon Badge */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : isDone
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : st.num}
              </div>

              {/* Step Label & Title */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? 'text-blue-700'
                        : isDone
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    Bước {st.num}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold block truncate ${
                    isActive ? 'text-blue-950' : 'text-slate-700'
                  }`}
                  title={st.fullTitle}
                >
                  {st.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* STEP 1: Thiết Lập Mục Tiêu Sư Phạm */}
      {activeStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bước 1: Thiết Lập Mục Tiêu Sư Phạm & Chuẩn Đầu Ra
                </h2>
                <p className="text-xs text-slate-500">
                  Định hình thang đo Bloom, năng lực tư duy toán học chuyên sâu và thời lượng giảng dạy
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              Thời lượng dự kiến: {topic.step1Pedagogy.estimatedHours} tiết
            </span>
          </div>

          {/* TRACEBACK EVIDENCE SECTION (NẾU CHUYÊN ĐỀ ĐƯỢC BÓC TÁCH TỪ ĐỀ THI) */}
          {topic.traceback && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-indigo-950 font-bold text-sm">
                      CƠ SỞ ĐỀ XUẤT (TRUY NGƯỢC NGUỒN DỮ LIỆU ĐỀ THI)
                    </h4>
                    <span className="text-slate-600 text-[11px] font-medium">
                      {topic.traceback.dataObservationSummary}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Dữ liệu đối soát
                </span>
              </div>

              {/* Citations list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                {topic.traceback.matchedExamCitations.map((cite, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                      <span className="text-emerald-600 font-black">✓</span>
                      <span className="text-blue-700">{cite.examYearOrName}</span>
                      <span className="text-slate-400">—</span>
                      <span className="text-amber-700">{cite.questionLabel}</span>
                    </div>
                    {cite.excerptLatex && (
                      <div className="text-[11px] p-1.5 bg-slate-50 rounded text-slate-700 font-mono">
                        <MathRenderer content={cite.excerptLatex} />
                      </div>
                    )}
                    {cite.keyRelevance && (
                      <p className="text-[10px] text-slate-500 italic">
                        {cite.keyRelevance}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Related Concepts & Disclaimer */}
              <div className="pt-2 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span className="text-slate-500 font-semibold text-[11px]">Nội dung liên quan:</span>
                  {topic.traceback.relatedConcepts.map((con, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-200"
                    >
                      {con}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-amber-800 font-medium bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  {topic.traceback.disclaimer}
                </div>
              </div>
            </div>
          )}

          {/* Cognitive Bloom Levels Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center">
              <Award className="w-4 h-4 mr-1.5 text-amber-500" />
              Mục Tiêu Theo Thang Bậc Nhận Thức (Bloom)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Nhận biết */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase">1. Nhận Biết</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold">
                    Cơ bản
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  {topic.step1Pedagogy.cognitiveLevels.knowledge.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </div>

              {/* Thông hiểu */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 uppercase">2. Thông Hiểu</span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold">
                    Bản chất
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  {topic.step1Pedagogy.cognitiveLevels.understanding.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>

              {/* Vận dụng */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-800 uppercase">3. Vận Dụng</span>
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-semibold">
                    HSG Trường
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  {topic.step1Pedagogy.cognitiveLevels.application.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              {/* Vận dụng cao */}
              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-800 uppercase">4. Vận Dụng Cao</span>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-semibold">
                    HSG Tỉnh
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  {topic.step1Pedagogy.cognitiveLevels.highApplication.map((ha, i) => (
                    <li key={i}>{ha}</li>
                  ))}
                </ul>
              </div>

              {/* Sáng tạo Olympic */}
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase flex items-center">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
                    5. Tư Duy Sáng Tạo & Bứt Phá Olympic
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold">
                    VMO / TST
                  </span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  {topic.step1Pedagogy.cognitiveLevels.creativeOlympiad.map((co, i) => (
                    <li key={i}>{co}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Key Competencies & Prerequisites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Năng Lực Toán Học Cốt Lõi Cần Bồi Dưỡng
              </h3>
              <div className="flex flex-wrap gap-2">
                {topic.step1Pedagogy.keyCompetencies.map((comp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Kiến Thức Tiền Đề Cần Ôn Tập Trước
              </h3>
              <div className="flex flex-wrap gap-2">
                {topic.step1Pedagogy.prerequisites.map((pre, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    {pre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setActiveStep(2)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <span>Chuyển Sang Bước 2: Khung Logic</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Xây Dựng Khung Logic & Bản Đồ Khái Niệm */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Bước 2: Xây Dựng Khung Logic & Bản Đồ Khái Niệm Chuyên Đề
                  </h2>
                  <p className="text-xs text-slate-500">
                    Chuỗi liên kết các mắt xích: Tiền đề $\to$ Định lý trọng tâm $\to$ Bổ đề $\to$ Kỹ thuật $\to$ Mở rộng
                  </p>
                </div>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setStep2ViewMode('graph')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    step2ViewMode === 'graph'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Sơ Đồ Tri Thức D3</span>
                </button>
                <button
                  onClick={() => setStep2ViewMode('list')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    step2ViewMode === 'list'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Danh Sách Thẻ</span>
                </button>
              </div>
            </div>

            {/* Render Graph or Cards */}
            {step2ViewMode === 'graph' ? (
              <KnowledgeGraphView topic={topic} />
            ) : (
              <div className="space-y-4">
                {topic.step2Roadmap.map((node, idx) => {
                  const typeColor =
                    node.type === 'prerequisite'
                      ? 'border-slate-300 bg-slate-50 text-slate-700'
                      : node.type === 'core_theorem'
                      ? 'border-blue-300 bg-blue-50 text-blue-900'
                      : node.type === 'key_lemma'
                      ? 'border-purple-300 bg-purple-50 text-purple-900'
                      : node.type === 'technique'
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-900';

                  const typeBadge =
                    node.type === 'prerequisite'
                      ? 'Kiến thức nền'
                      : node.type === 'core_theorem'
                      ? 'Định lý trọng tâm'
                      : node.type === 'key_lemma'
                      ? 'Bổ đề then chốt'
                      : node.type === 'technique'
                      ? 'Kỹ thuật giải'
                      : 'Tổng quát hóa';

                  return (
                    <div key={node.id} className="relative">
                      {idx < topic.step2Roadmap.length - 1 && (
                        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-200 -z-0" />
                      )}
                      <div className={`flex items-start space-x-4 p-4 rounded-xl border ${typeColor} relative z-10`}>
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800 shrink-0 mt-0.5">
                          {node.order}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-bold">{node.title}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/80 rounded border border-current">
                              {typeBadge}
                            </span>
                          </div>
                          <p className="text-xs opacity-90">{node.description}</p>
                          {node.latexSummary && (
                            <div className="bg-white/90 p-2.5 rounded-lg border border-slate-200/80 mt-2">
                              <MathRenderer content={node.latexSummary} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Quay Lại Bước 1
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                <span>Chuyển Sang Bước 3: Lý Thuyết & Bổ Đề</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Biên Soạn Lý Thuyết Chuyên Sâu & Bổ Đề */}
      {activeStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                  <BookMarked className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Bước 3: Biên Soạn Lý Thuyết Chuyên Sâu & Bổ Đề Then Chốt
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lập luận toán học chặt chẽ, chứng minh mẫu bằng LaTeX và lưu ý các bẫy học sinh hay mắc
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMathSandbox(!showMathSandbox)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    showMathSandbox
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>{showMathSandbox ? 'Đóng Sandbox Hình Vẽ' : 'Vẽ Hình & Cấu Hình SVG'}</span>
                </button>
                <button
                  onClick={() => setShowAddLemmaModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Bổ Đề Mới</span>
                </button>
              </div>
            </div>

            {/* Embedded Math Sandbox */}
            {showMathSandbox && <VisualMathSandbox topic={topic} />}

          {/* Overview Theory */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tổng Quan & Bản Chất Phương Pháp
            </h3>
            <MathRenderer content={topic.step3Theory.overviewMarkdown} />
          </div>

          {/* Key Lemmas List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <Lightbulb className="w-4 h-4 mr-1.5 text-amber-500" />
              Hệ Thống Bổ Đề Then Chốt & Chứng Minh Mẫu
            </h3>

            {topic.step3Theory.keyLemmas.map((lem, idx) => (
              <div key={lem.id} className="border border-purple-200 bg-purple-50/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-purple-900">
                    Bổ đề {idx + 1}: {lem.name}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold">
                    Chuẩn HSG
                  </span>
                </div>

                {/* Statement */}
                <div className="bg-white p-3.5 rounded-lg border border-purple-200 shadow-xs">
                  <span className="text-[11px] font-bold text-purple-700 block mb-1">Phát biểu:</span>
                  <MathRenderer content={lem.statementLatex} />
                </div>

                {/* Proof */}
                <div className="bg-white/80 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    Chứng minh chi tiết bằng LaTeX:
                  </span>
                  <MathRenderer content={lem.proofLatex} />
                </div>

                {/* Pedagogy Notes & Common Traps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                    <span className="font-bold flex items-center mb-1">
                      <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      Ý nghĩa sư phạm:
                    </span>
                    <p>{lem.pedagogyNotes}</p>
                  </div>

                  <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-3 text-xs text-rose-900">
                    <span className="font-bold flex items-center mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                      Bẫy học sinh hay mắc:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {lem.commonTraps.map((tr, i) => (
                        <li key={i}>{tr}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Quay Lại Bước 2
            </button>
            <button
              onClick={() => setActiveStep(4)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <span>Chuyển Sang Bước 4: Bài Tập Phân Tầng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )}

      {/* STEP 4: Hệ Thống Bài Tập Phân Tầng (Tier 1 -> Tier 3) */}
      {activeStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bước 4: Hệ Thống Bài Tập Phân Tầng Kèm Lời Giải Chuẩn LaTeX
                </h2>
                <p className="text-xs text-slate-500">
                  Phân hóa sâu theo 3 tầng nhận thức: Tầng 1 (Nền tảng) $\to$ Tầng 2 (HSG Tỉnh) $\to$ Tầng 3 (VMO/Quốc Gia)
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('wysiwyg_editor')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Mở Trình Soạn Thảo LaTeX</span>
            </button>
          </div>

          {/* Tiered Exercises List */}
          <div className="space-y-4">
            {topic.step4Exercises.map((ex, idx) => {
              const isExpanded = expandedExerciseId === ex.id;
              const tierBadge =
                ex.tier === 'tier_1'
                  ? { label: 'Tầng 1: Nền Tảng Chuyên', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
                  : ex.tier === 'tier_2'
                  ? { label: 'Tầng 2: Vận Dụng HSG Tỉnh', color: 'bg-blue-100 text-blue-800 border-blue-300' }
                  : { label: 'Tầng 3: Vận Dụng Cao (VMO/Olympic)', color: 'bg-rose-100 text-rose-800 border-rose-300' };

              return (
                <div
                  key={ex.id}
                  className="border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-blue-300 transition-colors"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                    className="flex items-center justify-between p-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{ex.title}</h4>
                        {ex.source && <span className="text-[11px] text-slate-500">Nguồn: {ex.source}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${tierBadge.color}`}>
                        {tierBadge.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  {isExpanded && (
                    <div className="p-5 space-y-4 bg-white border-t border-slate-100">
                      {/* Problem Statement */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                          Đề Bài:
                        </span>
                        <MathRenderer content={ex.statementLatex} />
                      </div>

                      {/* Pedagogical Idea */}
                      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900">
                        <span className="font-bold flex items-center mb-1">
                          <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Định hướng tiếp cận sư phạm:
                        </span>
                        <p>{ex.pedagogicalIdea}</p>
                      </div>

                      {/* Hints */}
                      {ex.hints && ex.hints.length > 0 && (
                        <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg text-xs text-blue-900">
                          <span className="font-bold flex items-center mb-1">
                            <Zap className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            Gợi ý phân tầng cho học sinh:
                          </span>
                          <ol className="list-decimal list-inside space-y-1">
                            {ex.hints.map((h, hi) => (
                              <li key={hi}>
                                <MathRenderer content={h} className="inline" />
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Detailed LaTeX Solution */}
                      <div className="p-4 bg-emerald-50/20 border border-emerald-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-emerald-900 block uppercase tracking-wider">
                          Lời Giải Chi Tiết Từng Bước (LaTeX):
                        </span>
                        <MathRenderer content={ex.solutionLatex} />

                        {ex.equalityCaseLatex && (
                          <div className="mt-3 pt-3 border-t border-emerald-100 text-xs font-semibold text-emerald-800">
                            <span>Dấu đẳng thức xảy ra khi: </span>
                            <MathRenderer content={ex.equalityCaseLatex} className="inline font-mono" />
                          </div>
                        )}
                      </div>

                      {/* Action to Evolve or Audit this specific problem */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => onNavigateToTab('evolution_engine')}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Phát Triển Biến Thể Bài Này</span>
                        </button>
                        <button
                          onClick={() => onNavigateToTab('logic_audit')}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Rà Soát Logic & Bẫy Sai Sót</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Quay Lại Bước 3
            </button>
            <button
              onClick={() => setActiveStep(5)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <span>Chuyển Sang Bước 5: Biến Thể & Thẩm Định</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Phát Triển Biến Thể & Thẩm Định Toàn Diện */}
      {activeStep === 5 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bước 5: Phát Triển Biến Thể Tư Duy Sâu & Thẩm Định Sư Phạm
                </h2>
                <p className="text-xs text-slate-500">
                  Hai tính năng đột phá độc quyền: Sáng tạo biến thể không thay số và Rà soát 7 tiêu chí logic toán học
                </p>
              </div>
            </div>
          </div>

          {/* Quick Hub for 2 Breakthroughs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Deep Problem Evolution */}
            <div className="border border-purple-200 bg-gradient-to-br from-purple-50/60 via-white to-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-purple-950">Phát Triển Bài Toán Tư Duy Sâu</h3>
                  <span className="text-xs text-purple-700 font-medium">
                    {topic.step5Evolutions.length} bộ biến thể đã tạo
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự động tạo các bài toán phái sinh bằng 6 chiến lược: Tổng quát hóa $n$ biến, Bài toán đối ngẫu, Đổi cấu trúc Đại-Hình, Ghép bổ đề liên môn, Điểm rơi bất đối xứng.
              </p>
              <button
                onClick={() => onNavigateToTab('evolution_engine')}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
              >
                <span>Mở Công Cụ Phát Triển Biến Thể</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Box 2: Math Logic Auditor */}
            <div className="border border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950">Kiểm Tra Toán & Rà Soát Logic</h3>
                  <span className="text-xs text-emerald-700 font-medium">
                    {topic.auditReports.length > 0
                      ? `Độ chặt chẽ: ${topic.auditReports[0].rigorScore}/100`
                      : 'Chưa chạy kiểm tra'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rà soát tự động 7 tiêu chí toán học: Miền xác định, điểm rơi cực trị, tính ngộ nhận chứng minh, giả thiết thừa/thiếu, tính đối xứng và cú pháp LaTeX.
              </p>
              <button
                onClick={() => onNavigateToTab('logic_audit')}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
              >
                <span>Mở Bảng Rà Soát & Thẩm Định Logic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Quay Lại Bước 4
            </button>
            <button
              onClick={() => onNavigateToTab('latex_preview')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
            >
              <span>Xem Báo Cáo Xuất Bản Toàn Diện</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: AI Prompt Auto-Design */}
      {aiGenPromptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3 text-blue-700">
              <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
              <h3 className="text-base font-bold text-slate-900">AI Thiết Kế Tự Động Trọn Bộ 5 Bước</h3>
            </div>
            <p className="text-xs text-slate-600">
              Hệ thống sẽ tổng hợp khung mục tiêu, sơ đồ logic, lý thuyết chuyên sâu, hệ thống bài tập 3 tầng và các bổ đề hoàn chỉnh bằng LaTeX cho chuyên đề:
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800">
              "{topic.title}" (Lớp {topic.grade} - {topic.targetLevel})
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Yêu cầu bổ sung của Thầy/Cô (Không bắt buộc):
              </label>
              <textarea
                value={customGenNotes}
                onChange={(e) => setCustomGenNotes(e.target.value)}
                placeholder="Ví dụ: Tập trung vào kỹ thuật Cô-si ngược dấu, bổ sung thêm 2 bài tập có điều kiện ràng buộc tích abc=1..."
                rows={3}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setAiGenPromptModal(false)}
                disabled={isAiProcessing}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleAutoDesign5Steps}
                disabled={isAiProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isAiProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Bắt Đầu Khởi Tạo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
