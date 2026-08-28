import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Layers,
  Award,
  Sparkles,
  Search,
  Filter,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { TopicCurriculum, MathBranch, TargetLevel } from '../types/math';

interface TopicBankViewProps {
  topics: TopicCurriculum[];
  currentTopic: TopicCurriculum;
  onSelectTopic: (topic: TopicCurriculum) => void;
  onDeleteTopic: (id: string) => void;
  onCloneTopic: (topic: TopicCurriculum) => void;
  onOpenNewTopicModal: () => void;
  onOpenExamResearchModal?: () => void;
  onImportTopics?: (imported: TopicCurriculum[], mode: 'merge' | 'replace') => void;
}

export const TopicBankView: React.FC<TopicBankViewProps> = ({
  topics,
  currentTopic,
  onSelectTopic,
  onDeleteTopic,
  onCloneTopic,
  onOpenNewTopicModal,
  onOpenExamResearchModal,
  onImportTopics,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const filteredTopics = topics.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBranch = selectedBranch === 'all' || t.mathBranch === selectedBranch;
    const matchLevel = selectedLevel === 'all' || t.targetLevel === selectedLevel;
    return matchSearch && matchBranch && matchLevel;
  });

  const getBranchName = (b: MathBranch) => {
    switch (b) {
      case 'algebra':
        return 'Đại Số & Bất Đẳng Thức';
      case 'geometry':
        return 'Hình Học Phẳng & Xạ Ảnh';
      case 'number_theory':
        return 'Số Học Chuyên Sâu';
      case 'combinatorics':
        return 'Tổ Hợp & Rời Rạc';
      case 'calculus_sequences':
        return 'Dãy Số & Giải Tích';
      default:
        return 'Toán Học';
    }
  };

  const getLevelBadge = (l: TargetLevel) => {
    switch (l) {
      case 'provincial_hsg':
        return { label: 'HSG Cấp Tỉnh', color: 'bg-blue-100 text-blue-800' };
      case 'thpt_qg_vdc':
        return { label: 'THPT Quốc Gia VDC', color: 'bg-rose-100 text-rose-800' };
      case 'national_vmo':
        return { label: 'HSG Quốc Gia (VMO)', color: 'bg-purple-100 text-purple-800' };
      case 'tst_olympiad':
        return { label: 'Tuyển Chọn Olympic', color: 'bg-amber-100 text-amber-900' };
      default:
        return { label: 'HSG Trường', color: 'bg-slate-100 text-slate-800' };
    }
  };

  // Bulk JSON export
  const handleBulkExport = () => {
    const jsonStr = JSON.stringify(topics, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MathOlympiad_Studio_ToanBoNganHang_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Handle JSON file import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        let validList: TopicCurriculum[] = [];

        if (Array.isArray(parsed)) {
          validList = parsed;
        } else if (parsed && typeof parsed === 'object' && parsed.title) {
          validList = [parsed];
        }

        if (validList.length > 0) {
          if (onImportTopics) {
            onImportTopics(validList, 'merge');
            setImportNotification(`Đã nhập thành công ${validList.length} chuyên đề vào ngân hàng!`);
            setTimeout(() => setImportNotification(null), 4000);
          }
        } else {
          alert('Tệp JSON không chứa cấu trúc chuyên đề hợp lệ.');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: Tệp bị hỏng hoặc sai định dạng.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Notification banner */}
      {importNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-900 font-bold text-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importNotification}</span>
          </div>
          <button onClick={() => setImportNotification(null)} className="text-emerald-700 hover:underline">
            Đóng
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Ngân Hàng Tài Liệu Chuyên Môn</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Kho Chuyên Đề Bồi Dưỡng Học Sinh Giỏi Toán THPT
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-3xl">
              Quản lý toàn bộ {topics.length} chuyên đề chuẩn 5 bước sư phạm, hỗ trợ đồng bộ, gộp ngân hàng JSON và xuất bản đa định dạng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenExamResearchModal && (
              <button
                type="button"
                onClick={onOpenExamResearchModal}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl shadow-lg hover:shadow-amber-500/25 transition-all duration-200 cursor-pointer border border-amber-300/50 text-xs sm:text-sm active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>🔬 NGHIÊN CỨU ĐỀ THI → XÂY DỰNG CHUYÊN ĐỀ</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold rounded-2xl shadow-xs transition-all cursor-pointer text-xs backdrop-blur-xs"
              title="Nhập chuyên đề từ file JSON"
            >
              <Upload className="w-4 h-4" />
              <span>Nhập JSON</span>
            </button>

            <button
              onClick={handleBulkExport}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold rounded-2xl shadow-xs transition-all cursor-pointer text-xs backdrop-blur-xs"
              title="Tải về toàn bộ kho chuyên đề"
            >
              <Download className="w-4 h-4" />
              <span>Sao Lưu Toàn Bộ</span>
            </button>

            <button
              onClick={onOpenNewTopicModal}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-2xl shadow-md transition-all cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên chuyên đề, mã số, tác giả..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">Tất cả phân môn</option>
              <option value="algebra">Đại số & BĐT</option>
              <option value="geometry">Hình học phẳng</option>
              <option value="number_theory">Số học</option>
              <option value="combinatorics">Tổ hợp & Rời rạc</option>
              <option value="calculus_sequences">Dãy số & Giải tích</option>
            </select>
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">Tất cả cấp độ</option>
            <option value="provincial_hsg">HSG Cấp Tỉnh / Thành Phố</option>
            <option value="school_team">HSG Cấp Trường / Cụm Trường</option>
            <option value="thpt_qg_vdc">THPT Quốc Gia VDC</option>
          </select>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((item) => {
          const isSelected = item.id === currentTopic.id;
          const levelBadge = getLevelBadge(item.targetLevel);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                    {item.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${levelBadge.color}`}>
                    {levelBadge.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {item.title}
                </h3>

                {/* Meta details */}
                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-700">Phân môn:</span> {getBranchName(item.mathBranch)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Tác giả:</span> {item.author} ({item.school})
                  </p>
                </div>

                {/* Stats badge */}
                <div className="flex items-center space-x-3 pt-2 text-[11px] text-slate-600 border-t border-slate-100">
                  <span className="flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {item.step4Exercises.length} Bài tập
                  </span>
                  <span className="flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-500" />
                    {item.step5Evolutions.length} Bộ biến thể
                  </span>
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onCloneTopic(item)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Nhân bản chuyên đề"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {topics.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa chuyên đề "${item.title}"?`)) {
                          onDeleteTopic(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa chuyên đề"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onSelectTopic(item)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  <span>{isSelected ? 'Đang Biên Soạn' : 'Chọn Chuyên Đề'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
