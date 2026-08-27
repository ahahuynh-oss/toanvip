import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Timer,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Award,
  ChevronRight,
  ArrowRight,
  Lightbulb,
  Zap,
  BookOpen,
  Trophy,
  Flame,
  Download,
  GraduationCap,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, TopicCurriculum } from '../types/math';
import { MathRenderer } from './MathRenderer';
import { DEMO_QUIZ_QUESTIONS } from '../data/defaultTopics';
import { getAITutorHintAI } from '../services/geminiService';
import { downloadMoodleXml, downloadGiftFile } from '../services/lmsExportService';

interface StudentPracticeQuizProps {
  topic: TopicCurriculum;
  isAiProcessing: boolean;
  setIsAiProcessing: (status: boolean) => void;
}

export const StudentPracticeQuiz: React.FC<StudentPracticeQuizProps> = ({
  topic,
  isAiProcessing,
  setIsAiProcessing,
}) => {
  // Extract questions from topic or default
  const questions: QuizQuestion[] = React.useMemo(() => {
    // Generate questions from topic exercises if any
    if (topic.step4Exercises.length > 0) {
      return topic.step4Exercises.map((ex, idx) => ({
        id: 'q-' + ex.id,
        topicId: topic.id,
        title: `Câu ${idx + 1}: ${ex.title}`,
        contentLatex: ex.statementLatex,
        tier: ex.tier,
        type: 'multiple_choice' as const,
        options: [
          { id: 'opt-1', latex: ex.equalityCaseLatex || 'Đẳng thức đạt được khi các biến thỏa mãn điều kiện biên', isCorrect: true },
          { id: 'opt-2', latex: 'Không tồn tại dấu đẳng thức', isCorrect: false },
          { id: 'opt-3', latex: 'Đẳng thức đạt được khi tất cả các biến bằng nhau', isCorrect: false },
          { id: 'opt-4', latex: 'Biểu thức không bị chặn trên hoặc dưới', isCorrect: false },
        ],
        correctAnswerLatex: ex.equalityCaseLatex || 'Đẳng thức đạt được',
        explanationLatex: ex.solutionLatex,
        hints: ex.hints || ['Phân tích điểm rơi của bài toán.'],
      }));
    }
    return DEMO_QUIZ_QUESTIONS;
  }, [topic]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(1800); // 30 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [activeHintLevel, setActiveHintLevel] = useState<number>(0);
  const [aiTutorResponse, setAiTutorResponse] = useState<string | null>(null);

  // Gamification state
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isSubmitted || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted, timeRemaining]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionId,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    let streak = 0;
    let peakStreak = 0;

    questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      const correctOpt = q.options?.find((o) => o.isCorrect);
      if (chosen === correctOpt?.id) {
        correct++;
        streak++;
        if (streak > peakStreak) peakStreak = streak;
      } else if (chosen !== undefined) {
        streak = 0;
      }
    });

    const percent = Math.round((correct / (questions.length || 1)) * 100);
    const totalScorePoints = correct * 100 + peakStreak * 50;

    let medal = { title: 'Tập Sự Olympic', icon: '🌱', color: 'text-slate-600 bg-slate-100' };
    if (percent >= 90) {
      medal = { title: 'Giải Nhất Olympic VMO', icon: '🥇', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    } else if (percent >= 75) {
      medal = { title: 'Giải Nhì HSG', icon: '🥈', color: 'text-slate-800 bg-slate-200 border-slate-300' };
    } else if (percent >= 50) {
      medal = { title: 'Giải Ba Khuyến Khích', icon: '🥉', color: 'text-orange-800 bg-orange-100 border-orange-300' };
    }

    return {
      correct,
      total: questions.length,
      percent,
      totalScorePoints,
      peakStreak,
      medal,
    };
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    setIsTimerRunning(false);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  // Request AI Tutor hint
  const handleAskAITutor = async (level: number) => {
    try {
      setIsAiProcessing(true);
      setActiveHintLevel(level);
      const res = await getAITutorHintAI(currentQ.contentLatex, currentQ.explanationLatex, level);
      setAiTutorResponse(res);
    } catch (err: any) {
      alert('Lỗi AI Tutor: ' + err.message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const scoreStats = calculateScore();

  return (
    <div className="space-y-6">
      {/* Header Banner - Gamified Arena Design */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Đấu Trường Luyện Đề Olympic & Trợ Giảng AI Tutor</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Khảo Sát Năng Lực Toán Học & Luyện Thi Phân Tầng
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-3xl">
              Thử thách thời gian thực với gợi ý Socratic phân tầng (Hint 1 $\to$ Hint 2 $\to$ Lời giải) và hệ thống chấm điểm HSG.
            </p>
          </div>

          {/* Gamified Widgets (Timer + LMS Export) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-white font-mono font-bold text-base">
              <Timer className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>

            <button
              onClick={() => downloadMoodleXml(topic, questions)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
              title="Xuất sang Moodle LMS"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>Xuất Moodle XML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            {/* Question Progress Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {currentIndex + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{currentQ.title}</h3>
                  <span className="text-[11px] font-semibold text-rose-600">
                    {currentQ.tier === 'tier_1'
                      ? 'Tầng 1: Nền tảng chuyên'
                      : currentQ.tier === 'tier_2'
                      ? 'Tầng 2: HSG Tỉnh/Thành'
                      : 'Tầng 3: Vận dụng cao (VMO / Olympic)'}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-400">
                Câu {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Question Latex Statement */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner">
              <span className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                Nội Dung Bài Toán:
              </span>
              <MathRenderer content={currentQ.contentLatex} />
            </div>

            {/* Options List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Chọn Kết Luận / Đẳng Thức Chính Xác:
              </span>
              {currentQ.options?.map((opt, oi) => {
                const isSelected = selectedAnswers[currentIndex] === opt.id;
                const isCorrect = opt.isCorrect;
                let optBorder = 'border-slate-200 hover:border-rose-300 bg-white hover:bg-slate-50/50';

                if (isSubmitted) {
                  if (isCorrect) {
                    optBorder = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20';
                  } else if (isSelected && !isCorrect) {
                    optBorder = 'border-rose-500 bg-rose-50 text-rose-900';
                  }
                } else if (isSelected) {
                  optBorder = 'border-rose-500 bg-rose-50/50 text-rose-950 ring-2 ring-rose-500/20';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer select-none ${optBorder}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : 'border-slate-300 text-slate-600 bg-slate-50'
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}
                    </div>
                    <div className="flex-1 text-xs">
                      <MathRenderer content={opt.latex} />
                    </div>
                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation box after submit */}
            {isSubmitted && (
              <div className="bg-emerald-50/60 border border-emerald-300 rounded-2xl p-5 space-y-2 animate-in fade-in">
                <span className="text-xs font-bold text-emerald-900 uppercase block tracking-wider flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  Lời Giải Chi Tiết & Bình Luận Sư Phạm:
                </span>
                <MathRenderer content={currentQ.explanationLatex} />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                  setAiTutorResponse(null);
                  setActiveHintLevel(0);
                }}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40"
              >
                Câu Trước
              </button>

              <div className="flex items-center space-x-2">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    Nộp Bài & Chấm Điểm
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setSelectedAnswers({});
                      setTimeRemaining(1800);
                      setIsTimerRunning(true);
                      setAiTutorResponse(null);
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Làm Lại Bài Thi</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                    setAiTutorResponse(null);
                    setActiveHintLevel(0);
                  }}
                  disabled={currentIndex === questions.length - 1}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  Câu Tiếp Theo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Tutor Panel & Question Grid (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Box 1: Gamified Score & Trophy Card */}
          {isSubmitted && (
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-300 rounded-3xl p-5 shadow-xs space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center">
                  <Trophy className="w-4 h-4 mr-1.5 text-amber-500" />
                  Thành Tích Đạt Được
                </span>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${scoreStats.medal.color}`}>
                  {scoreStats.medal.icon} {scoreStats.medal.title}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-3 bg-white rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Tỷ Lệ Đúng</span>
                  <span className="text-xl font-black text-emerald-600">{scoreStats.percent}%</span>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Điểm Olympic</span>
                  <span className="text-xl font-black text-amber-600">{scoreStats.totalScorePoints} pts</span>
                </div>
              </div>
            </div>
          )}

          {/* Box 2: Question Navigator Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <Award className="w-4 h-4 mr-1 text-rose-500" />
                Danh Sách Câu Hỏi
              </span>
              <span className="text-xs font-bold text-slate-500">
                {Object.keys(selectedAnswers).length}/{questions.length} đã làm
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, qIndex) => {
                const isCurrent = currentIndex === qIndex;
                const hasAnswer = selectedAnswers[qIndex] !== undefined;

                return (
                  <button
                    key={qIndex}
                    onClick={() => {
                      setCurrentIndex(qIndex);
                      setAiTutorResponse(null);
                      setActiveHintLevel(0);
                    }}
                    className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-rose-600 text-white ring-2 ring-rose-500/30 shadow-xs'
                        : hasAnswer
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {qIndex + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Box 3: AI Math Tutor (Socratic Hints) */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-white to-white border border-indigo-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                AI Math Tutor - Trợ Giảng Socratic
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Bạn đang gặp khó khăn ở câu hỏi này? Chọn mức độ gợi ý từng nấc để kích hoạt tư duy giải quyết vấn đề:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAskAITutor(1)}
                disabled={isAiProcessing}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                  activeHintLevel === 1
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                Gợi ý 1 (Ý tưởng)
              </button>
              <button
                onClick={() => handleAskAITutor(2)}
                disabled={isAiProcessing}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                  activeHintLevel === 2
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                Gợi ý 2 (Bổ đề)
              </button>
              <button
                onClick={() => handleAskAITutor(3)}
                disabled={isAiProcessing}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                  activeHintLevel === 3
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                Gợi ý 3 (Từng bước)
              </button>
            </div>

            {/* AI Tutor Response Display */}
            {isAiProcessing && (
              <div className="p-4 bg-indigo-50 rounded-2xl flex items-center justify-center space-x-2 text-indigo-700 text-xs font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Thầy AI đang soạn gợi ý Socratic cho bạn...</span>
              </div>
            )}

            {aiTutorResponse && !isAiProcessing && (
              <div className="p-4 bg-white border border-indigo-200 rounded-2xl space-y-2 animate-in fade-in duration-200 shadow-xs">
                <span className="text-[11px] font-bold text-indigo-900 block flex items-center">
                  <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  Gợi ý từ Thầy AI (Mức {activeHintLevel}):
                </span>
                <MathRenderer content={aiTutorResponse} className="text-xs" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
