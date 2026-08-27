import React, { useState } from 'react';
import {
  Sparkles,
  GitFork,
  Lightbulb,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Copy,
  BookOpen,
  Send,
  Zap,
} from 'lucide-react';
import { TopicCurriculum, EvolutionVariant, ProblemEvolution, TieredExercise } from '../types/math';
import { MathRenderer } from './MathRenderer';
import { evolveMathProblemAI } from '../services/geminiService';

interface ProblemEvolutionEngineProps {
  topic: TopicCurriculum;
  onUpdateTopic: (updated: TopicCurriculum) => void;
  isAiProcessing: boolean;
  setIsAiProcessing: (status: boolean) => void;
}

const STRATEGIES = [
  {
    id: 'generalization',
    name: '1. Tổng Quát Hóa (n biến / d chiều)',
    desc: 'Mở rộng bài toán từ 3 biến lên n biến, nâng bậc đa thức hoặc không gian đa chiều.',
    icon: '🌐',
  },
  {
    id: 'asymmetry_traps',
    name: '2. Bất Đối Xứng & Điểm Rơi Lệch',
    desc: 'Phá vỡ tính đối xứng hoán vị, đưa vào các trọng số nhằm rèn luyện kỹ năng tìm điểm rơi vi mô.',
    icon: '⚖️',
  },
  {
    id: 'dual_inverse',
    name: '3. Đối Ngẫu & Bài Toán Đảo',
    desc: 'Đổi vai trò giữa giả thiết và kết luận, xét bài toán cực trị ngược hướng (Max <-> Min).',
    icon: '🔄',
  },
  {
    id: 'structural_morph',
    name: '4. Chuyển Đổi Cấu Trúc (Đại <-> Hình)',
    desc: 'Chuyển bài toán bất đẳng thức sang mô hình tọa độ/vectơ/hình học hoặc ngược lại.',
    icon: '📐',
  },
  {
    id: 'inter_topic_fusion',
    name: '5. Ghép Nối Bổ Đề Liên Môn',
    desc: 'Kết hợp bất đẳng thức với dãy số truy hồi, tích phân hoặc tính chất số học.',
    icon: '🧩',
  },
  {
    id: 'relaxation_bounding',
    name: '6. Thắt Chặt & Mở Rộng Biên',
    desc: 'Tìm hằng số tốt nhất (Best Constant) hoặc nới lỏng giả thiết từ số dương sang số thực.',
    icon: '🎯',
  },
];

export const ProblemEvolutionEngine: React.FC<ProblemEvolutionEngineProps> = ({
  topic,
  onUpdateTopic,
  isAiProcessing,
  setIsAiProcessing,
}) => {
  const [originalProblem, setOriginalProblem] = useState<string>(
    topic.step4Exercises[0]?.statementLatex ||
      '\\text{Cho } a, b, c > 0 \\text{ có } a+b+c=3. \\text{ Chứng minh: } \\frac{a}{1+b^2} + \\frac{b}{1+c^2} + \\frac{c}{1+a^2} \\ge \\frac{3}{2}'
  );
  const [originalSolution, setOriginalSolution] = useState<string>(
    topic.step4Exercises[0]?.solutionLatex || ''
  );
  const [selectedStrategy, setSelectedStrategy] = useState<string>('generalization');
  const [targetTier, setTargetTier] = useState<string>('thpt_qg_vdc');
  const [generatedVariants, setGeneratedVariants] = useState<EvolutionVariant[]>(
    topic.step5Evolutions[0]?.variants || []
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pick sample problems from topic
  const handleSelectSampleProblem = (ex: TieredExercise) => {
    setOriginalProblem(ex.statementLatex);
    setOriginalSolution(ex.solutionLatex);
  };

  // Generate Evolution AI
  const handleGenerateEvolution = async () => {
    if (!originalProblem.trim()) {
      alert('Vui lòng nhập bài toán gốc cần phát triển!');
      return;
    }

    try {
      setIsAiProcessing(true);
      const variants = await evolveMathProblemAI(
        originalProblem,
        originalSolution,
        selectedStrategy,
        targetTier,
        topic.mathBranch
      );

      setGeneratedVariants(variants);

      // Save into topic state
      const newEvolution: ProblemEvolution = {
        id: 'evo-' + Date.now(),
        originalProblem,
        originalSolution,
        mathBranch: topic.mathBranch,
        targetLevel: topic.targetLevel,
        variants,
      };

      const updated: TopicCurriculum = {
        ...topic,
        step5Evolutions: [newEvolution, ...topic.step5Evolutions],
        updatedAt: new Date().toISOString(),
      };

      onUpdateTopic(updated);
    } catch (err: any) {
      alert('Lỗi khi phát triển biến thể: ' + (err.message || 'Vui lòng thử lại.'));
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Add a variant as a new tiered exercise to Step 4
  const handleAddVariantToExercises = (variant: EvolutionVariant) => {
    const newExercise: TieredExercise = {
      id: 'ex-' + Date.now(),
      tier: variant.difficultyScore >= 9 ? 'tier_3' : 'tier_2',
      title: `[Biến thể] ${variant.strategyName}`,
      statementLatex: variant.statementLatex,
      pedagogicalIdea: variant.pedagogyRationale,
      hints: ['Khai thác từ mô hình bài toán gốc với kỹ thuật tư duy tương ứng.'],
      solutionLatex: variant.solutionLatex,
      equalityCaseLatex: variant.equalityCondition,
      generalizationNotes: `Phát triển theo chiến lược: ${variant.strategyName}`,
      source: 'MathOlympiad Studio AI Evolution',
    };

    const updated: TopicCurriculum = {
      ...topic,
      step4Exercises: [...topic.step4Exercises, newExercise],
      updatedAt: new Date().toISOString(),
    };

    onUpdateTopic(updated);
    alert('Đã thêm thành công biến thể này vào Danh sách Bài tập phân tầng (Bước 4)!');
  };

  const handleCopyLatex = (latex: string, id: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Đột Phá 1: Deep Problem Evolution Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Phát Triển Bài Toán Gốc Thành Biến Thể Tư Duy Sâu
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-3xl">
              Nói KHÔNG với việc thay số cơ học! Hệ thống AI phân tích cấu trúc toán học cốt lõi, áp dụng 6 chiến lược sáng tạo đề thi chuyên sâu để tạo ra các bài toán có chiều sâu tư duy, liên kết bổ đề và rèn luyện năng lực giải toán cho học sinh giỏi.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input & Strategy Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Box 1: Original Problem Input */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <BookOpen className="w-4 h-4 mr-1.5 text-purple-600" />
                1. Bài Toán Gốc (LaTeX)
              </span>
              {/* Quick load from topic */}
              {topic.step4Exercises.length > 0 && (
                <div className="dropdown relative">
                  <select
                    className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    onChange={(e) => {
                      const found = topic.step4Exercises.find((x) => x.id === e.target.value);
                      if (found) handleSelectSampleProblem(found);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Chọn từ bài tập có sẵn...
                    </option>
                    {topic.step4Exercises.map((ex, i) => (
                      <option key={ex.id} value={ex.id}>
                        Bài {i + 1}: {ex.title.substring(0, 25)}...
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <textarea
              rows={4}
              value={originalProblem}
              onChange={(e) => setOriginalProblem(e.target.value)}
              placeholder="Nhập đề bài toán gốc (hỗ trợ công thức LaTeX, ví dụ: \frac{a}{b+c} + ...)"
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />

            {/* Live preview of original */}
            {originalProblem && (
              <div className="p-3 bg-purple-50/40 border border-purple-200 rounded-xl">
                <span className="text-[10px] font-bold text-purple-800 uppercase block mb-1">
                  Hiển thị công thức xem trước:
                </span>
                <MathRenderer content={originalProblem} />
              </div>
            )}

            {/* Optional Original Solution */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Lời giải gốc (Không bắt buộc - giúp AI hiểu rõ cốt lõi):
              </span>
              <textarea
                rows={2}
                value={originalSolution}
                onChange={(e) => setOriginalSolution(e.target.value)}
                placeholder="Tóm tắt ý tưởng hoặc lời giải gốc..."
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Box 2: 6 Evolution Strategies */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <Sliders className="w-4 h-4 mr-1.5 text-purple-600" />
              2. Chọn Chiến Lược Phát Triển Tư Duy
            </span>

            <div className="space-y-2">
              {STRATEGIES.map((st) => {
                const isSelected = selectedStrategy === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStrategy(st.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 text-purple-950'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{st.icon}</span>
                      <span className="text-xs font-bold">{st.name}</span>
                    </div>
                    <p className="text-[11px] opacity-80 mt-1 pl-6 leading-tight">{st.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Target Tier Selection */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Cấp độ phân hóa mục tiêu:
              </label>
              <select
                value={targetTier}
                onChange={(e) => setTargetTier(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="provincial_hsg">HSG Cấp Tỉnh / Thành Phố (Tầng 2)</option>
                <option value="thpt_qg_vdc">Ôn thi THPT Quốc Gia VD-VDC (Câu 45-50)</option>
                <option value="national_vmo">Học Sinh Giỏi Quốc Gia - VMO (Tầng 3)</option>
                <option value="tst_olympiad">Tuyển Chọn Đội Tuyển Quốc Tế - TST/IMO</option>
              </select>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleGenerateEvolution}
              disabled={isAiProcessing}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isAiProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-amber-300" />
              )}
              <span>Kích Hoạt AI Phát Triển Biến Thể</span>
            </button>
          </div>
        </div>

        {/* Right Column: Generated Deep Variants Display (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <GitFork className="w-4 h-4 mr-1.5 text-purple-600" />
              Kết Quả Các Biến Thể Tư Duy Sâu ({generatedVariants.length})
            </h3>
            {generatedVariants.length > 0 && (
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                Chuẩn Sư Phạm HSG
              </span>
            )}
          </div>

          {generatedVariants.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa Có Biến Thể Nào Được Sinh</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Chọn bài toán gốc và chiến lược bên trái, sau đó nhấn "Kích Hoạt AI Phát Triển Biến Thể" để hệ thống tạo các bài toán nâng cao.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedVariants.map((variant, idx) => (
                <div
                  key={variant.id || idx}
                  className="bg-white border border-purple-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  {/* Variant Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-purple-950">{variant.strategyName}</h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                        Độ khó: {variant.difficultyScore}/10
                      </span>
                      <button
                        onClick={() => handleCopyLatex(variant.statementLatex, variant.id)}
                        className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors"
                        title="Sao chép đề bài LaTeX"
                      >
                        {copiedId === variant.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                      Đề bài biến thể mới:
                    </span>
                    <MathRenderer content={variant.statementLatex} />
                  </div>

                  {/* Pedagogical Rationale */}
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <span className="font-bold flex items-center">
                      <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      Phân tích giá trị sư phạm:
                    </span>
                    <p className="leading-relaxed">{variant.pedagogyRationale}</p>
                  </div>

                  {/* Rigorous Solution */}
                  <div className="p-4 bg-purple-50/20 border border-purple-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-purple-900 uppercase block">
                      Lời giải chi tiết & Lập luận chặt chẽ:
                    </span>
                    <MathRenderer content={variant.solutionLatex} />

                    {variant.equalityCondition && (
                      <div className="pt-2 text-xs font-semibold text-purple-800 border-t border-purple-100">
                        <span>Dấu đẳng thức / Nghiệm cực trị: </span>
                        <MathRenderer
                          content={`$${variant.equalityCondition}$`}
                          className="inline font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action to Save / Push into Curriculum */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleAddVariantToExercises(variant)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Đưa Vào Bộ Bài Tập Chuyên Đề (Bước 4)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
