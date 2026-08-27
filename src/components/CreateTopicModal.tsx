import React, { useState } from 'react';
import { Plus, X, Sparkles, BookOpen, Layers, Award } from 'lucide-react';
import { TopicCurriculum, MathBranch, TargetLevel } from '../types/math';

interface CreateTopicModalProps {
  onClose: () => void;
  onCreateTopic: (newTopic: TopicCurriculum, triggerAiAutoDesign: boolean, imageBase64?: string, mimeType?: string) => void;
  onOpenExamResearchModal?: () => void;
  teacherName: string;
  schoolName: string;
}

export const CreateTopicModal: React.FC<CreateTopicModalProps> = ({
  onClose,
  onCreateTopic,
  onOpenExamResearchModal,
  teacherName,
  schoolName,
}) => {
  const [title, setTitle] = useState<string>('');
  const [code, setCode] = useState<string>('CD-' + Math.floor(100 + Math.random() * 900));
  const [grade, setGrade] = useState<'10' | '11' | '12' | 'all'>('10');
  const [mathBranch, setMathBranch] = useState<MathBranch>('algebra');
  const [targetLevel, setTargetLevel] = useState<TargetLevel>('provincial_hsg');
  const [triggerAi, setTriggerAi] = useState<boolean>(true);
  
  // Image Upload State
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result?.toString().split(',')[1];
      if (base64Data) {
        setImageBase64(base64Data);
        setImageMimeType(file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên chuyên đề!');
      return;
    }

    const newTopic: TopicCurriculum = {
      id: 'topic-' + Date.now(),
      title: title.trim(),
      code: code.trim(),
      grade,
      mathBranch,
      targetLevel,
      author: teacherName || 'Giáo viên Toán',
      school: schoolName || 'Trường THPT Chuyên',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      step1Pedagogy: {
        cognitiveLevels: {
          knowledge: ['Nắm vững định nghĩa và tiền đề lý thuyết cơ bản'],
          understanding: ['Hiểu bản chất tư duy và điều kiện áp dụng định lý'],
          application: ['Giải quyết các bài tập vận dụng cấp trường và khu vực'],
          highApplication: ['Xử lý các bài toán phối hợp đa kỹ thuật cấp Tỉnh/Thành'],
          creativeOlympiad: ['Sáng tạo biến thể và tổng quát hóa cấp VMO'],
        },
        keyCompetencies: [
          'Tư duy phân tích & tổng hợp',
          'Năng lực mô hình hóa toán học',
          'Lập luận phản chứng & quy nạp',
        ],
        estimatedHours: 6,
        prerequisites: ['Kiến thức THPT trọng tâm', 'Kỹ năng biến đổi đại số'],
      },
      step2Roadmap: [
        {
          id: 'r1',
          title: 'Tiền đề & Bổ đề cơ sở',
          type: 'prerequisite',
          description: 'Hệ thống hóa kiến thức nền tảng',
          order: 1,
        },
        {
          id: 'r2',
          title: 'Định lý trọng tâm',
          type: 'core_theorem',
          description: 'Phát biểu và chứng minh kết quả cốt lõi',
          order: 2,
        },
        {
          id: 'r3',
          title: 'Kỹ thuật giải chuyên sâu',
          type: 'technique',
          description: 'Phân tích các hướng biến đổi đặc trưng',
          order: 3,
        },
      ],
      step3Theory: {
        overviewMarkdown: `### ${title}\nTổng quan lý thuyết chuyên sâu và các kỹ thuật bồi dưỡng HSG...`,
        coreTheoremsLatex: '',
        keyLemmas: [],
      },
      step4Exercises: [],
      step5Evolutions: [],
      auditReports: [],
    };

    onCreateTopic(newTopic, triggerAi, imageBase64 || undefined, imageMimeType || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3 text-blue-700">
            <div className="p-2 bg-blue-100 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Thiết Kế Chuyên Đề Mới</h3>
              <p className="text-xs text-slate-500">Khởi tạo khung chuyên đề bồi dưỡng HSG chuẩn sư phạm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recommendation to try Exam Research */}
        {onOpenExamResearchModal && (
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-300 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-400 text-slate-950 rounded-lg shadow-xs shrink-0">
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Chưa biết nên chọn chuyên đề gì?
                </p>
                <p className="text-[11px] text-slate-600">
                  Dùng AI nghiên cứu đề thi thực chiến để tự động đề xuất dạng toán then chốt.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenExamResearchModal();
              }}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-lg transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Nghiên Cứu Đề
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tên Chuyên Đề Bồi Dưỡng:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Kỹ thuật đặt ẩn phụ đối xứng trong Phương trình vô tỷ..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-900"
            />
          </div>

          {/* Code & Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mã Chuyên Đề:</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Khối Lớp:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="10">Lớp 10 Chuyên</option>
                <option value="11">Lớp 11 Chuyên</option>
                <option value="12">Lớp 12 Chuyên</option>
                <option value="all">Toàn cấp THPT</option>
              </select>
            </div>
          </div>

          {/* Math Branch & Target Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phân Môn:</label>
              <select
                value={mathBranch}
                onChange={(e) => setMathBranch(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="algebra">Đại số & BĐT</option>
                <option value="geometry">Hình học phẳng</option>
                <option value="number_theory">Số học</option>
                <option value="combinatorics">Tổ hợp & Rời rạc</option>
                <option value="calculus_sequences">Dãy số & Giải tích</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Cấp Độ Mục Tiêu:</label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="school_team">HSG Cấp Trường (Tầng 1)</option>
                <option value="provincial_hsg">HSG Cấp Tỉnh/Thành (Tầng 2)</option>
                <option value="thpt_qg_vdc">Ôn thi THPT Quốc Gia VD-VDC (Câu 40-50)</option>
                <option value="national_vmo">HSG Quốc Gia (VMO) (Tầng 3)</option>
                <option value="tst_olympiad">Tuyển Chọn Olympic (TST)</option>
              </select>
            </div>
          </div>

          {/* Reverse Engineering Image Upload */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-900 block">Tạo chuyên đề 5 bước từ Ảnh (Reverse Engineering)</span>
                <span className="text-[10px] text-indigo-700">Chụp một câu VD/VDC trong đề thi THPT, AI sẽ tự phân rã và thiết kế 5 bước.</span>
              </div>
            </div>
            
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleUploadImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="w-full text-xs p-3 bg-white border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl font-semibold text-slate-600 flex justify-center items-center">
                {imageFileName ? (
                  <span className="text-indigo-700 truncate max-w-full px-2">Đã chọn: {imageFileName}</span>
                ) : (
                  <span>Tải lên ảnh chụp đề bài (Tùy chọn)</span>
                )}
              </div>
            </div>
          </div>

          {/* AI Auto Design Checkbox */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center space-x-3">
            <input
              type="checkbox"
              id="triggerAi"
              checked={triggerAi}
              onChange={(e) => setTriggerAi(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="triggerAi" className="text-xs text-amber-950 font-medium cursor-pointer">
              <span className="font-bold flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Tự động dùng AI thiết kế trọn bộ 5 bước ngay sau khi tạo
              </span>
            </label>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Tạo Chuyên Đề
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
