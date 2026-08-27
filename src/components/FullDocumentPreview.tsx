import React from 'react';
import {
  Printer,
  FileCode,
  Download,
  BookOpen,
  Award,
  Layers,
  Lightbulb,
  CheckSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { TopicCurriculum } from '../types/math';
import { MathRenderer } from './MathRenderer';

interface FullDocumentPreviewProps {
  topic: TopicCurriculum;
  onOpenExportModal: () => void;
}

export const FullDocumentPreview: React.FC<FullDocumentPreviewProps> = ({
  topic,
  onOpenExportModal,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header - Hidden during print */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Xem Toàn Bộ Tài Liệu Chuyên Đề</h2>
          <p className="text-xs text-slate-500">
            Xem trước bố cục in ấn A4 chuẩn mực sư phạm trước khi xuất file PDF, LaTeX hoặc Word
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In / Lưu PDF (A4)</span>
          </button>
          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tùy Chọn Xuất File</span>
          </button>
        </div>
      </div>

      {/* The Printable A4 Document Sheet */}
      <div className="print-container bg-white border border-slate-200 shadow-md rounded-2xl p-8 sm:p-12 max-w-4xl mx-auto space-y-8 font-serif leading-relaxed text-slate-900">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-600 font-sans">
            <span>SỞ GIÁO DỤC VÀ ĐÀO TẠO</span>
            <span>KỲ THI HỌC SINH GIỎI THPT</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 font-sans">
            <span>{topic.school}</span>
            <span>TỔ CHUYÊN MÔN TOÁN</span>
          </div>
          <div className="h-4"></div>
          <span className="text-xs font-bold font-sans uppercase px-3 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-300">
            TÀI LIỆU CHUYÊN ĐỀ BỒI DƯỠNG HSG TOÁN
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-slate-900 uppercase pt-2">
            {topic.title}
          </h1>
          <p className="text-xs font-sans text-slate-600">
            Mã chuyên đề: <strong>{topic.code}</strong> | Khối lớp: <strong>Lớp {topic.grade}</strong> | Tác giả: <strong>{topic.author}</strong>
          </p>
        </div>

        {/* Section 1: Mục Tiêu Sư Phạm */}
        <div className="space-y-3 avoid-break">
          <h2 className="text-base font-bold font-sans uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 flex items-center">
            <span className="mr-2">I.</span> MỤC TIÊU SƯ PHẠM & CHUẨN ĐẦU RA
          </h2>
          <div className="text-xs font-sans text-slate-700 space-y-2">
            <p><strong>1. Kiến thức & Kỹ năng cốt lõi:</strong></p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              {topic.step1Pedagogy.cognitiveLevels.understanding.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
              {topic.step1Pedagogy.cognitiveLevels.highApplication.map((ha, i) => (
                <li key={i}>{ha}</li>
              ))}
            </ul>
            <p className="pt-1">
              <strong>2. Năng lực toán học chuyên sâu:</strong> {topic.step1Pedagogy.keyCompetencies.join(', ')}.
            </p>
          </div>
        </div>

        {/* Section 2: Khung Logic & Bản Đồ Khái Niệm */}
        <div className="space-y-3 avoid-break">
          <h2 className="text-base font-bold font-sans uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 flex items-center">
            <span className="mr-2">II.</span> KHUNG LOGIC & MẮT XÍCH KIẾN THỨC
          </h2>
          <div className="space-y-2">
            {topic.step2Roadmap.map((r, ri) => (
              <div key={r.id} className="text-xs font-sans p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900">
                  {ri + 1}. {r.title}
                </span>
                <p className="text-slate-600 mt-0.5">{r.description}</p>
                {r.latexSummary && (
                  <div className="mt-1">
                    <MathRenderer content={`$$${r.latexSummary}$$`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Lý Thuyết Chuyên Sâu & Bổ Đề */}
        <div className="space-y-4 avoid-break">
          <h2 className="text-base font-bold font-sans uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 flex items-center">
            <span className="mr-2">III.</span> LÝ THUYẾT CHUYÊN SÂU & HỆ THỐNG BỔ ĐỀ
          </h2>
          <div className="text-xs font-sans space-y-4">
            <MathRenderer content={topic.step3Theory.overviewMarkdown} />

            {topic.step3Theory.keyLemmas.map((lem, li) => (
              <div key={lem.id} className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900">
                  Bổ đề {li + 1}: {lem.name}
                </h4>
                <div className="bg-white p-3 rounded border border-slate-200">
                  <MathRenderer content={`$$${lem.statementLatex}$$`} />
                </div>
                <div className="text-slate-800">
                  <span className="font-semibold block mb-1">Chứng minh:</span>
                  <MathRenderer content={lem.proofLatex} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Hệ Thống Bài Tập Phân Tầng */}
        <div className="space-y-6">
          <h2 className="text-base font-bold font-sans uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 flex items-center">
            <span className="mr-2">IV.</span> HỆ THỐNG BÀI TẬP PHÂN TẦNG & LỜI GIẢI CHI TIẾT
          </h2>

          <div className="space-y-6 font-sans">
            {topic.step4Exercises.map((ex, ei) => (
              <div key={ex.id} className="border border-slate-300 rounded-xl p-5 space-y-3 avoid-break">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Bài {ei + 1}: {ex.title}
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                    {ex.tier === 'tier_1'
                      ? 'Tầng 1: Nền tảng'
                      : ex.tier === 'tier_2'
                      ? 'Tầng 2: HSG Tỉnh'
                      : 'Tầng 3: HSG Quốc Gia (VMO)'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold block mb-1">Đề bài:</span>
                  <MathRenderer content={`$$${ex.statementLatex}$$`} />
                </div>

                <div className="text-xs text-slate-700 bg-amber-50/50 p-2.5 rounded border border-amber-200">
                  <span className="font-bold text-amber-900">💡 Hướng dẫn tiếp cận: </span>
                  <span>{ex.pedagogicalIdea}</span>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">Lời giải chi tiết:</span>
                  <MathRenderer content={ex.solutionLatex} />
                </div>

                {ex.equalityCaseLatex && (
                  <div className="text-xs text-emerald-900 font-semibold pt-1">
                    <span>Dấu đẳng thức: </span>
                    <MathRenderer content={`$${ex.equalityCaseLatex}$`} className="inline" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Biến Thể Sáng Tạo */}
        {topic.step5Evolutions.length > 0 && topic.step5Evolutions[0]?.variants?.length > 0 && (
          <div className="space-y-4 avoid-break font-sans">
            <h2 className="text-base font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 flex items-center">
              <span className="mr-2">V.</span> PHÁT TRIỂN BIẾN THỂ TƯ DUY SÂU & MỞ RỘNG
            </h2>
            <div className="space-y-4">
              {topic.step5Evolutions[0].variants.map((v, vi) => (
                <div key={v.id || vi} className="p-4 bg-purple-50/40 border border-purple-200 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-purple-950 block">
                    Biến thể {vi + 1}: {v.strategyName}
                  </span>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <MathRenderer content={`$$${v.statementLatex}$$`} />
                  </div>
                  <MathRenderer content={v.solutionLatex} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Signature */}
        <div className="pt-8 border-t-2 border-slate-900 flex justify-between text-xs font-sans avoid-break">
          <div className="text-center space-y-1">
            <span className="font-bold uppercase">DUYỆT CỦA TỔ CHUYÊN MÔN</span>
          </div>

          <div className="text-center space-y-1">
            <span className="font-bold uppercase">GIÁO VIÊN BIÊN SOẠN</span>
            <p className="font-semibold text-slate-800 pt-8">{topic.author}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
