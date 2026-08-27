import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  GitFork,
  ShieldCheck,
  Edit3,
  BookOpen,
  HelpCircle,
  Download,
  Settings,
  PlusCircle,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Layers,
  Target,
  Network,
  BookMarked,
  CheckSquare,
  FileCode,
  FolderOpen,
  Filter,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Sigma,
  Shapes,
  Binary,
  Compass,
  TrendingUp,
  X,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { TopicCurriculum, AppSettings, MathBranch } from '../types/math';
import { ActiveTab } from './Navbar';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  topics: TopicCurriculum[];
  currentTopic: TopicCurriculum;
  onSelectTopic: (topic: TopicCurriculum) => void;
  onOpenNewTopicModal: () => void;
  onOpenExamResearchModal: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  onDeleteTopic?: (id: string) => void;
  settings: AppSettings;
  isAiProcessing: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeStep?: number;
  onSelectStep?: (step: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  topics,
  currentTopic,
  onSelectTopic,
  onOpenNewTopicModal,
  onOpenExamResearchModal,
  onOpenExportModal,
  onOpenSettingsModal,
  onDeleteTopic,
  settings,
  isAiProcessing,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  setIsCollapsed,
  activeStep = 1,
  onSelectStep,
}) => {
  const [isStepsOpen, setIsStepsOpen] = useState<boolean>(true);
  const [isBranchesOpen, setIsBranchesOpen] = useState<boolean>(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<MathBranch | 'all'>('all');

  const branches: { key: MathBranch; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'algebra', label: 'Đại số & BĐT', icon: <Sigma className="w-3.5 h-3.5" />, color: 'text-blue-600' },
    { key: 'geometry', label: 'Hình học phẳng', icon: <Compass className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
    { key: 'number_theory', label: 'Số học', icon: <Binary className="w-3.5 h-3.5" />, color: 'text-amber-600' },
    { key: 'combinatorics', label: 'Tổ hợp & Rời rạc', icon: <Shapes className="w-3.5 h-3.5" />, color: 'text-purple-600' },
    { key: 'calculus_sequences', label: 'Dãy số & Giải tích', icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-rose-600' },
  ];

  const filteredTopics = selectedBranchFilter === 'all'
    ? topics
    : topics.filter((t) => t.mathBranch === selectedBranchFilter);

  const stepSubItems = [
    { num: 1, label: 'Bước 1: Mục tiêu Bloom', icon: <Target className="w-3.5 h-3.5 text-blue-500" /> },
    { num: 2, label: 'Bước 2: Khung Logic', icon: <Network className="w-3.5 h-3.5 text-indigo-500" /> },
    { num: 3, label: 'Bước 3: Lý thuyết & Bổ đề', icon: <BookMarked className="w-3.5 h-3.5 text-purple-500" /> },
    { num: 4, label: 'Bước 4: Bài tập phân tầng', icon: <Layers className="w-3.5 h-3.5 text-amber-500" /> },
    { num: 5, label: 'Bước 5: Biến thể & Thẩm định', icon: <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> },
  ];

  const handleStepClick = (stepNum: number) => {
    setActiveTab('workflow_5steps');
    if (onSelectStep) {
      onSelectStep(stepNum);
    }
    if (isOpenMobile) onCloseMobile();
  };

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (isOpenMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out no-print ${
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Sidebar Header / Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0 bg-slate-950/40">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <h1 className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent truncate">
                  MathOlympiad Studio
                </h1>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  Bảng Điều Khiển Chuyên Đề
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Mobile Close Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Mở rộng thanh điều khiển' : 'Thu gọn thanh điều khiển'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {/* ACTIVE TOPIC CARD */}
          {!isCollapsed ? (
            <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-800 to-slate-800/80 border border-slate-700/80 shadow-md space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider flex items-center text-blue-400">
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  Chuyên Đề Hiện Tại
                </span>
                <span className="font-mono text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50">
                  {currentTopic.code}
                </span>
              </div>

              {/* Topic Select Dropdown */}
              <div className="relative">
                <select
                  value={currentTopic.id}
                  onChange={(e) => {
                    const selected = topics.find((t) => t.id === e.target.value);
                    if (selected) onSelectTopic(selected);
                  }}
                  className="w-full text-xs font-bold text-slate-100 bg-slate-900 border border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate cursor-pointer"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
                      [{t.code}] {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Badges & Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                    Khối {currentTopic.grade}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/50 font-medium truncate max-w-[100px]">
                    {currentTopic.targetLevel === 'national_vmo'
                      ? 'VMO QG'
                      : currentTopic.targetLevel === 'provincial_hsg'
                      ? 'HSG Tỉnh'
                      : 'Tuyển Chọn'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {/* Xóa chuyên đề */}
                  {onDeleteTopic && topics.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`⚠️ Bạn có chắc muốn xóa chuyên đề "${currentTopic.title}"?\n\nHành động này không thể hoàn tác!`)) {
                          onDeleteTopic(currentTopic.id);
                        }
                      }}
                      className="flex items-center text-[11px] text-slate-400 hover:text-rose-400 font-medium transition-colors cursor-pointer p-1 rounded-lg hover:bg-rose-500/10"
                      title="Xóa chuyên đề hiện tại"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {/* Tạo mới */}
                  <button
                    onClick={onOpenNewTopicModal}
                    className="flex items-center text-[11px] text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                    title="Tạo chuyên đề mới"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    + Mới
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={onOpenNewTopicModal}
                className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-md"
                title={`Chuyên đề: ${currentTopic.title} (+ Tạo mới)`}
              >
                <BookOpen className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* PRIMARY ACTION: NGHIÊN CỨU ĐỀ THI -> XÂY DỰNG CHUYÊN ĐỀ */}
          {!isCollapsed ? (
            <div className="space-y-1">
              <button
                type="button"
                onClick={onOpenExamResearchModal}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-blue-600 hover:from-amber-400 hover:via-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg hover:shadow-amber-500/25 transition-all duration-200 cursor-pointer flex items-center justify-between group border border-amber-400/50 active:scale-[0.98] text-left"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-1.5 bg-amber-400 text-slate-950 rounded-lg group-hover:scale-105 transition-transform shadow-xs shrink-0">
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-black tracking-tight text-amber-200 group-hover:text-white uppercase truncate flex items-center gap-1">
                      <span>🔬 NGHIÊN CỨU ĐỀ THI</span>
                      <ArrowRight className="w-3 h-3 text-amber-300 shrink-0" />
                    </div>
                    <div className="text-[10px] text-blue-100 font-bold truncate">
                      XÂY DỰNG CHUYÊN ĐỀ
                    </div>
                  </div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 opacity-80 group-hover:opacity-100 shrink-0 ml-1" />
              </button>
              <p className="text-[10px] text-slate-400 px-1 italic">
                “Dựa trên đề thi, dạng toán & phương pháp nào đáng đưa vào CT?”
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onOpenExamResearchModal}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-indigo-600 text-slate-950 font-bold flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer border border-amber-300/40"
                title="🔬 NGHIÊN CỨU ĐỀ THI → XÂY DỰNG CHUYÊN ĐỀ"
              >
                <Sparkles className="w-5 h-5 fill-slate-950" />
              </button>
            </div>
          )}

          {/* MAIN CATEGORY MENU (DANH MỤC ĐIỀU KHIỂN CHÍNH) */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Danh Mục Tính Năng</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                  {topics.length} CĐ
                </span>
              </div>
            )}

            {/* 1. QUY TRÌNH 5 BƯỚC (WITH COLLAPSIBLE SUB-STEPS) */}
            <div className="rounded-xl overflow-hidden">
              <div
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'workflow_5steps'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Quy Trình 5 Bước Sư Phạm"
              >
                <button
                  type="button"
                  onClick={() => handleNavClick('workflow_5steps')}
                  className="flex items-center space-x-2.5 min-w-0 flex-1 text-left cursor-pointer focus:outline-none"
                >
                  <Sparkles
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === 'workflow_5steps' ? 'text-amber-300' : 'text-blue-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Quy Trình 5 Bước Sư Phạm</span>}
                </button>
                {!isCollapsed && (
                  <div className="flex items-center space-x-1 shrink-0 ml-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-400/30 select-none">
                      Cốt lõi
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsStepsOpen(!isStepsOpen);
                      }}
                      className="p-1 hover:bg-black/20 rounded text-slate-300 cursor-pointer transition-colors"
                      title={isStepsOpen ? 'Thu gọn các bước' : 'Mở rộng các bước'}
                    >
                      {isStepsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Sub-steps 1 -> 5 */}
              {!isCollapsed && isStepsOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-slate-700/80 space-y-1 py-1">
                  {stepSubItems.map((step) => {
                    const isStepActive = activeTab === 'workflow_5steps' && activeStep === step.num;
                    return (
                      <button
                        key={step.num}
                        onClick={() => handleStepClick(step.num)}
                        className={`w-full flex items-center space-x-2 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-left ${
                          isStepActive
                            ? 'bg-blue-500/20 text-blue-300 font-bold border-l-2 border-blue-400'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        {step.icon}
                        <span className="truncate">{step.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. PHÁT TRIỂN BÀI TOÁN TƯ DUY SÂU */}
            <button
              onClick={() => handleNavClick('evolution_engine')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'evolution_engine'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Phát Triển Bài Toán (Evolution Engine)"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <GitFork
                  className={`w-4 h-4 shrink-0 ${
                    activeTab === 'evolution_engine' ? 'text-amber-300' : 'text-purple-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Phát Triển Biến Thể</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800">
                  Đột phá
                </span>
              )}
            </button>

            {/* 3. KIỂM TRA & RÀ SOÁT LOGIC */}
            <button
              onClick={() => handleNavClick('logic_audit')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'logic_audit'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Kiểm Tra & Rà Soát Logic Sư Phạm"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <ShieldCheck
                  className={`w-4 h-4 shrink-0 ${
                    activeTab === 'logic_audit' ? 'text-emerald-200' : 'text-emerald-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Thẩm Định & Rà Soát</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                  7 Tiêu chí
                </span>
              )}
            </button>

            {/* 4. SOẠN THẢO LATEX */}
            <button
              onClick={() => handleNavClick('wysiwyg_editor')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'wysiwyg_editor'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Soạn Thảo LaTeX & KaTeX"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Edit3
                  className={`w-4 h-4 shrink-0 ${
                    activeTab === 'wysiwyg_editor' ? 'text-amber-200' : 'text-amber-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Soạn Thảo LaTeX</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-400">
                  KaTeX
                </span>
              )}
            </button>

            {/* 5. NGÂN HÀNG CHUYÊN ĐỀ */}
            <button
              onClick={() => handleNavClick('topic_bank')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'topic_bank'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Ngân Hàng Chuyên Đề Bồi Dưỡng"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <BookOpen
                  className={`w-4 h-4 shrink-0 ${
                    activeTab === 'topic_bank' ? 'text-indigo-200' : 'text-indigo-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Ngân Hàng Chuyên Đề</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {topics.length}
                </span>
              )}
            </button>

            {/* 6. LUYỆN TẬP & KHẢO SÁT */}
            <button
              onClick={() => handleNavClick('student_quiz')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'student_quiz'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Luyện Tập & Khảo Sát Học Sinh"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <HelpCircle
                  className={`w-4 h-4 shrink-0 ${
                    activeTab === 'student_quiz' ? 'text-rose-200' : 'text-rose-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Luyện Tập & AI Tutor</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-rose-950 text-rose-300 border border-rose-800">
                  Bấm giờ
                </span>
              )}
            </button>

            {/* 7. XEM TOÀN BỘ TÀI LIỆU */}
            <button
              onClick={() => handleNavClick('latex_preview')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'latex_preview'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Xem Toàn Bộ Tài Liệu Chuyên Đề"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <FileCode
                  className={`w-4 h-4 shrink-0 ${
                    activeTab === 'latex_preview' ? 'text-cyan-200' : 'text-cyan-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Tài Liệu Toàn Văn</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Preview
                </span>
              )}
            </button>
          </div>

          {/* DANH MỤC PHÂN MÔN TOÁN HỌC (MATH BRANCHES FILTER) */}
          {!isCollapsed && (
            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={() => setIsBranchesOpen(!isBranchesOpen)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-1.5">
                  <Filter className="w-3 h-3 text-amber-500" />
                  <span>Phân Môn Chuyên Sâu</span>
                </div>
                {isBranchesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {isBranchesOpen && (
                <div className="space-y-1 mt-1.5">
                  <button
                    onClick={() => {
                      setSelectedBranchFilter('all');
                      setActiveTab('topic_bank');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      selectedBranchFilter === 'all'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <span>Tất cả phân môn</span>
                    <span className="text-[10px] text-slate-500 font-mono">({topics.length})</span>
                  </button>

                  {branches.map((b) => {
                    const count = topics.filter((t) => t.mathBranch === b.key).length;
                    const isSelected = selectedBranchFilter === b.key;
                    return (
                      <button
                        key={b.key}
                        onClick={() => {
                          setSelectedBranchFilter(b.key);
                          setActiveTab('topic_bank');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={b.color}>{b.icon}</span>
                          <span>{b.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* QUICK SYSTEM ACTIONS */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Hệ Thống & Xuất Bản
              </div>
            )}

            {/* Export */}
            <button
              onClick={onOpenExportModal}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Xuất Bản Tài Liệu (LaTeX, PDF, Word, Excel)"
            >
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              {!isCollapsed && <span>Xuất Bản Đa Định Dạng</span>}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettingsModal}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Cài Đặt Hệ Thống & Gemini API Key"
            >
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>Cài Đặt & AI Model</span>}
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Teacher Profile & AI Status */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-200 truncate">
                    {settings.teacherName || 'Giáo viên Toán HSG'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {settings.schoolName || 'THPT Chuyên'}
                  </div>
                </div>
              </div>

              {/* Status pill */}
              <div className="flex items-center justify-between text-[10px] px-1 text-slate-400">
                <span className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      isAiProcessing
                        ? 'bg-amber-400 animate-ping'
                        : settings.customApiKey
                        ? 'bg-emerald-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  {isAiProcessing
                    ? 'AI đang xử lý...'
                    : settings.customApiKey
                    ? 'Gemini 3.7 Pro (Key riêng)'
                    : 'Gemini Auto'}
                </span>
                <span className="font-mono text-slate-500">v2.5</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={onOpenSettingsModal}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
                title={`${settings.teacherName} - ${settings.schoolName}`}
              >
                <UserCheck className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
