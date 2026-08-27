import React, { useState } from 'react';
import {
  Download,
  FileCode,
  FileText,
  FileSpreadsheet,
  Copy,
  CheckCircle2,
  X,
  Printer,
  Presentation,
  GraduationCap,
  Sparkles,
  Share2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TopicCurriculum } from '../types/math';
import { downloadWordDocument } from '../services/docxExportService';
import { downloadPptxPresentation } from '../services/pptxExportService';
import { downloadMoodleXml, downloadGiftFile } from '../services/lmsExportService';
import { FullDocumentPreview } from './FullDocumentPreview';

declare global {
  interface Window {
    html2pdf: any;
  }
}

interface ExportModalProps {
  topic: TopicCurriculum;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ topic, onClose }) => {
  const [copiedTex, setCopiedTex] = useState<boolean>(false);
  const [copiedGift, setCopiedGift] = useState<boolean>(false);

  // Generate full standalone LaTeX (.tex) document
  const generateTexCode = (): string => {
    return `% =========================================================================
% TÀI LIỆU CHUYÊN ĐỀ BỒI DƯỠNG HỌC SINH GIỎI TOÁN THPT
% Tên chuyên đề: ${topic.title}
% Mã chuyên đề: ${topic.code} | Khối: ${topic.grade} | Tác giả: ${topic.author}
% Trường: ${topic.school}
% Được tạo tự động bởi MathOlympiad Studio
% =========================================================================

\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath, amssymb, amsfonts, amsthm}
\\usepackage{geometry}
\\geometry{a4paper, left=20mm, right=20mm, top=20mm, bottom=20mm}
\\usepackage{tcolorbox}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\usepackage{enumitem}

\\newtheorem{theorem}{Định lý}
\\newtheorem{lemma}{Bổ đề}
\\newtheorem{problem}{Bài toán}
\\newtheorem{example}{Ví dụ}
\\newtheorem{remark}{Nhận xét}

\\tcolorboxenvironment{problem}{
  colback=blue!5!white,
  colframe=blue!75!black,
  arc=3mm,
  title=\\textbf{Bài toán},
  fonttitle=\\bfseries
}

\\tcolorboxenvironment{lemma}{
  colback=purple!5!white,
  colframe=purple!75!black,
  arc=3mm
}

\\begin{document}

\\begin{center}
  {\\large \\textbf{SỞ GIÁO DỤC VÀ ĐÀO TẠO}}\\\\
  {\\large \\textbf{${topic.school}}}\\\\
  \\textbf{TỔ CHUYÊN MÔN TOÁN}\\\\[0.5cm]
  
  {\\Large \\textbf{CHUYÊN ĐỀ BỒI DƯỠNG HSG TOÁN THPT}}\\\\[0.3cm]
  {\\LARGE \\textbf{${topic.title.toUpperCase()}}}\\\\[0.4cm]
  
  \\textit{Giáo viên biên soạn: ${topic.author}} --- \\textit{Mã số: ${topic.code}}
\\end{center}

\\vspace{0.5cm}
\\hrule
\\vspace{0.8cm}

\\section*{I. MỤC TIÊU SƯ PHẠM}
\\begin{itemize}
${topic.step1Pedagogy.cognitiveLevels.understanding.map((u) => `  \\item ${u}`).join('\n')}
${topic.step1Pedagogy.cognitiveLevels.highApplication.map((ha) => `  \\item ${ha}`).join('\n')}
\\end{itemize}

\\section*{II. LÝ THUYẾT CHUYÊN SÂU \\& BỔ ĐỀ}
${topic.step3Theory.keyLemmas
  .map(
    (lem, idx) => `
\\begin{lemma}[${lem.name}]
${lem.statementLatex}
\\end{lemma}
\\begin{proof}
${lem.proofLatex}
\\end{proof}
\\textbf{Ý nghĩa sư phạm:} ${lem.pedagogyNotes}
`
  )
  .join('\n')}

\\section*{III. HỆ THỐNG BÀI TẬP PHÂN TẦNG}
${topic.step4Exercises
  .map(
    (ex, idx) => `
\\begin{problem}[${ex.title}]
${ex.statementLatex}
\\end{problem}
\\textbf{💡 Định hướng tiếp cận:} ${ex.pedagogicalIdea}\\\\
\\textbf{Lời giải:}\\\\
${ex.solutionLatex}
${ex.equalityCaseLatex ? `\\\\\\textbf{Đẳng thức xảy ra khi:} $${ex.equalityCaseLatex}$` : ''}
`
  )
  .join('\n')}

\\vspace{1cm}
\\begin{flushright}
  \\textit{Ngày biên tập: ${new Date().toLocaleDateString('vi-VN')}}\\\\
  \\textbf{Người biên soạn}\\\\[1.5cm]
  \\textbf{${topic.author}}
\\end{flushright}

\\end{document}
`;
  };

  const handleDownloadTex = () => {
    const tex = generateTexCode();
    const blob = new Blob([tex], { type: 'text/x-tex;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${topic.code}_${topic.title.replace(/\s+/g, '_')}.tex`;
    link.click();
  };

  const handleCopyTex = () => {
    navigator.clipboard.writeText(generateTexCode());
    setCopiedTex(true);
    setTimeout(() => setCopiedTex(false), 2000);
  };

  // Export to Excel / CSV via SheetJS
  const handleExportExcel = () => {
    const data = topic.step4Exercises.map((ex, i) => ({
      STT: i + 1,
      Mã_Chuyên_Đề: topic.code,
      Tiêu_Đề: ex.title,
      Phân_Tầng: ex.tier,
      Đề_Bài_LaTeX: ex.statementLatex,
      Hướng_Dẫn_Sư_Phạm: ex.pedagogicalIdea,
      Lời_Giải_LaTeX: ex.solutionLatex,
      Dấu_Đẳng_Thức: ex.equalityCaseLatex || '',
      Nguồn: ex.source || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'NganHangBaiTap');
    XLSX.writeFile(workbook, `${topic.code}_NganHangBaiTap.xlsx`);
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(topic, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${topic.code}_Backup.json`;
    link.click();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('hidden-pdf-content');
    if (!element || !window.html2pdf) return;

    // We temporarily make it visible but position off-screen so html2pdf can render it correctly
    element.style.display = 'block';
    
    const opt = {
      margin:       10,
      filename:     `${topic.code}_${topic.title.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await window.html2pdf().set(opt).from(element).save();
    } finally {
      element.style.display = 'none';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Hidden PDF Content */}
      <div 
        id="hidden-pdf-content" 
        style={{ display: 'none', width: '800px', backgroundColor: 'white', padding: '20px' }}
      >
        <FullDocumentPreview topic={topic} />
      </div>

      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3 text-blue-700">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Trung Tâm Xuất Bản Giáo Dục Đa Định Dạng</h3>
              <p className="text-xs text-slate-500">
                Chuyên đề: [{topic.code}] {topic.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Format Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Option 1: Word Document (.doc / .docx) */}
          <div className="p-4 bg-gradient-to-br from-blue-50/60 to-white border border-blue-200 hover:border-blue-500 rounded-2xl space-y-3 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Microsoft Word (.doc)</h4>
                <p className="text-[11px] text-slate-500">Khung Bổ đề, Bài toán & Ma trận Bloom</p>
              </div>
            </div>
            <button
              onClick={() => downloadWordDocument(topic)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer text-center"
            >
              Tải file Word (.doc)
            </button>
          </div>

          {/* Option 2: PowerPoint Slides (.pptx / HTML Slideshow) */}
          <div className="p-4 bg-gradient-to-br from-purple-50/60 to-white border border-purple-200 hover:border-purple-500 rounded-2xl space-y-3 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Slide Bài Giảng (.pptx)</h4>
                <p className="text-[11px] text-slate-500">Slide trình chiếu 16:9 cho giáo viên</p>
              </div>
            </div>
            <button
              onClick={() => downloadPptxPresentation(topic)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer text-center"
            >
              Tải Slide Bài Giảng
            </button>
          </div>

          {/* Option 3: LaTeX (.tex) */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-200 hover:border-indigo-500 rounded-2xl space-y-3 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Mã Nguồn LaTeX (.tex)</h4>
                <p className="text-[11px] text-slate-500">Chuẩn Overleaf / TeXLive</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadTex}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                Tải file .tex
              </button>
              <button
                onClick={handleCopyTex}
                className="p-2.5 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                title="Sao chép mã TeX"
              >
                {copiedTex ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Option 4: Moodle LMS XML */}
          <div className="p-4 bg-gradient-to-br from-amber-50/60 to-white border border-amber-200 hover:border-amber-500 rounded-2xl space-y-3 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Moodle LMS & GIFT</h4>
                <p className="text-[11px] text-slate-500">Nhập vào Moodle / Canvas Quiz</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => downloadMoodleXml(topic)}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                Moodle XML
              </button>
              <button
                onClick={() => downloadGiftFile(topic)}
                className="py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                GIFT
              </button>
            </div>
          </div>

          {/* Option 5: Print / PDF A4 */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-slate-400 rounded-2xl space-y-3 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">In Ấn & Lưu PDF (A4)</h4>
                <p className="text-[11px] text-slate-500">Trình bày trang bìa sư phạm</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer text-center"
            >
              Tải xuống file PDF
            </button>
          </div>

          {/* Option 6: Excel Bank (.xlsx) */}
          <div className="p-4 bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200 hover:border-emerald-500 rounded-2xl space-y-3 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Bảng Excel Ngân Hàng</h4>
                <p className="text-[11px] text-slate-500">Quản lý câu hỏi & phân tầng</p>
              </div>
            </div>
            <button
              onClick={handleExportExcel}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer text-center"
            >
              Tải Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* JSON Backup footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 text-xs gap-3">
          <span className="text-slate-500 flex items-center">
            <Share2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Chia sẻ và đồng bộ dữ liệu chuyên đề với đồng nghiệp:
          </span>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-200 transition-colors"
          >
            Sao lưu dữ liệu JSON (.json)
          </button>
        </div>
      </div>
    </div>
  );
};
