import React, { useState } from 'react';
import {
  Edit3,
  Eye,
  Sparkles,
  Copy,
  CheckCircle2,
  BookOpen,
  Code2,
  Zap,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { TopicCurriculum } from '../types/math';
import { MathRenderer } from './MathRenderer';
import { callGemini } from '../services/geminiService';

interface WysiwygLatexEditorProps {
  topic: TopicCurriculum;
  onUpdateTopic: (updated: TopicCurriculum) => void;
  isAiProcessing: boolean;
  setIsAiProcessing: (status: boolean) => void;
}

const MATH_SNIPPETS = [
  { label: '\\frac{a}{b}', code: '\\frac{a}{b}' },
  { label: '\\sqrt{x}', code: '\\sqrt{x}' },
  { label: '\\sqrt[n]{x}', code: '\\sqrt[n]{x}' },
  { label: '\\sum_{i=1}^n', code: '\\sum_{i=1}^n ' },
  { label: '\\prod_{i=1}^n', code: '\\prod_{i=1}^n ' },
  { label: '\\int_{a}^b', code: '\\int_{a}^b f(x)\\,dx' },
  { label: '\\lim_{x \\to x_0}', code: '\\lim_{x \\to x_0} ' },
  { label: '\\le', code: '\\le ' },
  { label: '\\ge', code: '\\ge ' },
  { label: '\\iff', code: '\\iff ' },
  { label: '\\implies', code: '\\implies ' },
  { label: '\\vec{v}', code: '\\vec{v}' },
  { label: '\\equiv \\pmod m', code: 'a \\equiv b \\pmod m' },
  { label: '\\angle ABC', code: '\\angle ABC' },
  { label: '\\Delta ABC', code: '\\Delta ABC' },
  { label: '\\in \\mathbb{R}', code: 'x \\in \\mathbb{R}' },
  { label: '\\forall x > 0', code: '\\forall x > 0' },
  { label: '\\exists y', code: '\\exists y' },
  { label: 'Hệ PT', code: '\\begin{cases} x + y = 2 \\\\ x - y = 0 \\end{cases}' },
  { label: 'Ma trận', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
];

const PEDAGOGY_SNIPPETS = [
  {
    title: 'Khung Đề Bài',
    text: `### Bài Toán:\nCho $a, b, c > 0$ thỏa mãn $a + b + c = 3$.\nChứng minh rằng: $$\\frac{a}{1+b^2} + \\frac{b}{1+c^2} + \\frac{c}{1+a^2} \\ge \\frac{3}{2}$$`,
  },
  {
    title: 'Phân Tích Sư Phạm',
    text: `> **💡 Phân tích sư phạm & Hướng tiếp cận:**\n> Quan sát vế trái, các biến xuất hiện ở mẫu số bậc 2. Nếu áp dụng trực tiếp Bổ đề Engel sẽ làm tăng bậc của mẫu. Ta sử dụng kỹ thuật Cô-si ngược dấu: $\\frac{a}{1+b^2} = a - \\frac{ab^2}{1+b^2}$.`,
  },
  {
    title: 'Bổ Đề Phụ',
    text: `**Bổ đề then chốt:**\nCho $x_1, x_2, \\dots, x_n > 0$. Khi đó:\n$$\\sum_{i=1}^n \\frac{a_i^2}{x_i} \\ge \\frac{(\\sum a_i)^2}{\\sum x_i}$$\n*Chứng minh:* Áp dụng bất đẳng thức Cauchy-Schwarz cho hai bộ số...`,
  },
  {
    title: 'Lời Giải Chi Tiết',
    text: `**Lời giải:**\nÁp dụng bất đẳng thức AM-GM cho mẫu số: $1 + b^2 \\ge 2b$.\nSuy ra: $$\\frac{ab^2}{1+b^2} \\le \\frac{ab^2}{2b} = \\frac{ab}{2}$$\nDo đó: $$\\frac{a}{1+b^2} = a - \\frac{ab^2}{1+b^2} \\ge a - \\frac{ab}{2}$$\nCộng tương tự ba phân thức ta có điều phải chứng minh. $\\blacksquare$`,
  },
  {
    title: 'Dấu Đẳng Thức & Nhận Xét',
    text: `**Đẳng thức xảy ra:** $\\iff a = b = c = 1$.\n\n**Nhận xét & Mở rộng:**\nBài toán có thể tổng quát cho $n$ biến và số mũ bất kỳ: $\\sum_{i=1}^n \\frac{x_i}{1+x_{i+1}^k}$.`,
  },
];

export const WysiwygLatexEditor: React.FC<WysiwygLatexEditorProps> = ({
  topic,
  onUpdateTopic,
  isAiProcessing,
  setIsAiProcessing,
}) => {
  const [editorContent, setEditorContent] = useState<string>(
    topic.step3Theory.overviewMarkdown ||
      `### Chuyên Đề: Bất Đẳng Thức & Cực Trị HSG THPT\n\n$$\\sum_{i=1}^n \\frac{a_i^2}{x_i} \\ge \\frac{\\left(\\sum_{i=1}^n a_i\\right)^2}{\\sum_{i=1}^n x_i}$$\n\n`
  );
  const [copied, setCopied] = useState<boolean>(false);

  const insertSnippet = (snippetText: string) => {
    setEditorContent((prev) => prev + snippetText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // AI Polish & Optimize Pedagogical text
  const handleAIPolish = async () => {
    if (!editorContent.trim()) return;
    try {
      setIsAiProcessing(true);
      const prompt = `Bạn là biên tập viên sách chuyên đề Toán THPT chuyên nghiệp.
Hãy hiệu đính, tối ưu hóa câu chữ sư phạm và chuẩn hóa toàn bộ công thức LaTeX trong đoạn văn bản sau:

${editorContent}

Yêu cầu:
- Giữ nguyên cấu trúc logic toán học.
- Chuẩn hóa các công thức toán học sang cú pháp KaTeX/LaTeX đẹp mắt ($...$ cho inline, $$...$$ cho display).
- Diễn đạt mạch lạc, chuẩn mực sư phạm cho kỳ thi HSG.`;

      const polished = await callGemini(
        prompt,
        'Bạn là biên tập viên Toán học THPT chuyên nghiệp.',
        'gemini-3.6-flash',
        0.5
      );
      setEditorContent(polished);
    } catch (err: any) {
      alert('Lỗi AI hiệu đính: ' + err.message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // AI Continue proof writing
  const handleAIContinueWriting = async () => {
    if (!editorContent.trim()) return;
    try {
      setIsAiProcessing(true);
      const prompt = `Bạn là giáo viên dạy đội tuyển Toán HSG Quốc gia.
Dựa trên nội dung đang biên soạn dở sau:

${editorContent}

Hãy viết tiếp phần lập luận toán học chi tiết, chứng minh chặt chẽ hoặc mở rộng sư phạm tiếp theo. Viết bằng tiếng Việt và công thức LaTeX chuẩn.`;

      const continuation = await callGemini(
        prompt,
        'Bạn là giáo viên bồi dưỡng HSG Toán.',
        'gemini-3.6-flash',
        0.7
      );
      setEditorContent((prev) => prev + '\n\n' + continuation);
    } catch (err: any) {
      alert('Lỗi AI viết tiếp: ' + err.message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSaveToTopicOverview = () => {
    const updated: TopicCurriculum = {
      ...topic,
      step3Theory: {
        ...topic.step3Theory,
        overviewMarkdown: editorContent,
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateTopic(updated);
    alert('Đã lưu nội dung vào Tổng quan Lý thuyết Chuyên đề (Bước 3)!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Edit3 className="w-4 h-4" />
              <span>WYSIWYG & LaTeX Studio</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Soạn Thảo Trực Quan & Render Toán Học Thời Gian Thực
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-3xl">
              Palette ký hiệu toán học chuyên dụng (Giải tích, Hình học, Số học, Tổ hợp, Bất đẳng thức), mẫu cấu trúc sư phạm dựng sẵn và công cụ trợ lý AI hỗ trợ viết tiếp, hiệu đính lời giải.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveToTopicOverview}
              className="flex items-center space-x-1.5 px-4 py-2 bg-white text-slate-900 font-bold rounded-xl text-xs shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Lưu Vào Chuyên Đề</span>
            </button>
          </div>
        </div>
      </div>

      {/* Math Palette Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <Code2 className="w-4 h-4 mr-1.5 text-amber-600" />
            Bảng Ký Hiệu & Phép Toán Nhanh (Click để chèn)
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAIPolish}
              disabled={isAiProcessing}
              className="flex items-center space-x-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isAiProcessing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>AI Hiệu Đính Sư Phạm</span>
            </button>
            <button
              onClick={handleAIContinueWriting}
              disabled={isAiProcessing}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Viết Tiếp Lời Giải</span>
            </button>
          </div>
        </div>

        {/* Symbol buttons */}
        <div className="flex flex-wrap gap-1.5">
          {MATH_SNIPPETS.map((sn, idx) => (
            <button
              key={idx}
              onClick={() => insertSnippet(sn.code)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs rounded-lg transition-colors cursor-pointer border border-slate-200"
              title={sn.code}
            >
              {sn.label}
            </button>
          ))}
        </div>

        {/* Pedagogy Template Snippets */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Khung Sư Phạm:</span>
          {PEDAGOGY_SNIPPETS.map((ps, pi) => (
            <button
              key={pi}
              onClick={() => insertSnippet('\n\n' + ps.text)}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium rounded-lg border border-amber-200 transition-colors cursor-pointer"
            >
              + {ps.title}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Pane Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane: Code / Markdown Input */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[580px]">
          <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Khung Soạn Thảo (Markdown + LaTeX)
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-xs transition-colors"
            >
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>
          </div>
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Nhập nội dung chuyên đề, lý thuyết, công thức LaTeX $ ... $ hoặc $$ ... $$..."
            className="flex-1 w-full p-4 text-xs font-mono bg-white focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Right Pane: Live Rendered Output */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[580px]">
          <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              Kết Quả Hiển Thị Thời Gian Thực (KaTeX Sắc Nét)
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Chuẩn In Ấn A4</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/40">
            <MathRenderer content={editorContent} />
          </div>
        </div>
      </div>
    </div>
  );
};
