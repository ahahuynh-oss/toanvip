import React from 'react';
import {
  Menu,
  Sparkles,
  Download,
  Settings,
  PlusCircle,
  CheckCircle2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { TopicCurriculum, AppSettings } from '../types/math';

export type ActiveTab =
  | 'workflow_5steps'
  | 'evolution_engine'
  | 'logic_audit'
  | 'wysiwyg_editor'
  | 'topic_bank'
  | 'student_quiz'
  | 'latex_preview';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  topics: TopicCurriculum[];
  currentTopic: TopicCurriculum;
  onSelectTopic: (topic: TopicCurriculum) => void;
  onOpenNewTopicModal: () => void;
  onOpenExamResearchModal?: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  settings: AppSettings;
  isAiProcessing: boolean;
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  topics,
  currentTopic,
  onSelectTopic,
  onOpenNewTopicModal,
  onOpenExamResearchModal,
  onOpenExportModal,
  onOpenSettingsModal,
  settings,
  isAiProcessing,
  onOpenMobileSidebar,
}) => {
  const hasCustomKey = !!settings.customApiKey;

  const tabLabels: Record<ActiveTab, { title: string; subtitle: string }> = {
    workflow_5steps: {
      title: 'Quy Trình 5 Bước Sư Phạm',
      subtitle: 'Định hình mục tiêu, khung logic, bổ đề, bài tập 3 tầng & thẩm định',
    },
    evolution_engine: {
      title: 'Deep Problem Evolution Engine',
      subtitle: 'Phát triển bài toán tư duy sâu không thay số bằng 6 chiến lược toán học',
    },
    logic_audit: {
      title: 'Math Logic & Hypothesis Verifier',
      subtitle: 'Rà soát 7 tiêu chí toán học, phát hiện bẫy ngộ nhận và tối ưu lập luận',
    },
    wysiwyg_editor: {
      title: 'Trình Soạn Thảo LaTeX Trực Quan',
      subtitle: 'Soạn thảo thời gian thực KaTeX với mẫu khung sư phạm và gợi ý AI',
    },
    topic_bank: {
      title: 'Ngân Hàng Chuyên Đề Bồi Dưỡng',
      subtitle: 'Kho lưu trữ chuyên đề HSG các phân môn Đại số, Hình, Số, Tổ hợp, Dãy số',
    },
    student_quiz: {
      title: 'Khảo Sát & Luyện Tập Học Sinh',
      subtitle: 'Chế độ thi trực quan có bấm giờ và trợ giảng AI Tutor giải thích từng nấc',
    },
    latex_preview: {
      title: 'Xem Toàn Bộ Tài Liệu Chuyên Đề',
      subtitle: 'Bản in chuẩn Bộ GD&ĐT và mã nguồn LaTeX Overleaf sẵn sàng xuất bản',
    },
  };

  const activeMeta = tabLabels[activeTab] || {
    title: 'MathOlympiad Studio',
    subtitle: 'Hệ thống thiết kế chuyên đề bồi dưỡng HSG',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & Breadcrumb / Current View title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Mở bảng điều khiển danh mục"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {activeMeta.title}
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 truncate">
                  {currentTopic.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block truncate max-w-xl">
                {activeMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Topic Selector Dropdown (Hidden on smaller screens since sidebar has it) */}
            <div className="hidden xl:flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <span className="text-xs font-medium text-slate-500 px-2 flex items-center">
                <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                CĐ:
              </span>
              <select
                className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px] truncate"
                value={currentTopic.id}
                onChange={(e) => {
                  const selected = topics.find((t) => t.id === e.target.value);
                  if (selected) onSelectTopic(selected);
                }}
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.code}] {t.title}
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenNewTopicModal}
                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Tạo chuyên đề mới"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Prominent Nghiên Cứu Đề Thi Action */}
            {onOpenExamResearchModal && (
              <button
                onClick={onOpenExamResearchModal}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-950 border border-amber-300/80 hover:bg-amber-100 hover:border-amber-400 shadow-xs transition-all cursor-pointer"
                title="Nghiên cứu đề thi → Đề xuất & Xây dựng chuyên đề bồi dưỡng"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span>🔬 Nghiên Cứu Đề Thi</span>
              </button>
            )}

            {/* Prominent API Key / Settings Action with Red Attention Text */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onOpenSettingsModal}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                  hasCustomKey
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 animate-pulse'
                }`}
                title="Cấu hình Google Gemini API Key"
              >
                {hasCustomKey ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="hidden sm:inline font-bold">API Key OK</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
                    <span className="text-rose-600 font-extrabold">Cần gắn API Key</span>
                  </>
                )}
              </button>

              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="hidden lg:inline-flex items-center space-x-1 text-[11px] font-extrabold text-rose-600 hover:text-rose-700 hover:underline bg-rose-50/80 px-2.5 py-1.5 rounded-xl border border-rose-200"
                title="Mở Google AI Studio để lấy API Key miễn phí"
              >
                <span>🔑 Lấy API key để sử dụng app</span>
              </a>
            </div>

            {/* Export Action */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất Bản</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettingsModal}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
              title="Cài đặt hệ thống"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
