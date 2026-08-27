import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  Wrench,
} from 'lucide-react';
import { TopicCurriculum, MathAuditReport, TieredExercise } from '../types/math';
import { MathRenderer } from './MathRenderer';
import { auditMathProblemAI } from '../services/geminiService';

interface MathAuditVerifierProps {
  topic: TopicCurriculum;
  onUpdateTopic: (updated: TopicCurriculum) => void;
  isAiProcessing: boolean;
  setIsAiProcessing: (status: boolean) => void;
}

export const MathAuditVerifier: React.FC<MathAuditVerifierProps> = ({
  topic,
  onUpdateTopic,
  isAiProcessing,
  setIsAiProcessing,
}) => {
  const [problemLatex, setProblemLatex] = useState<string>(
    topic.step4Exercises[0]?.statementLatex ||
      '\\text{Cho } a, b, c > 0. \\text{ Chứng minh: } \\frac{a}{b+c} + \\frac{b}{c+a} + \\frac{c}{a+b} \\ge \\frac{3}{2}'
  );
  const [solutionLatex, setSolutionLatex] = useState<string>(
    topic.step4Exercises[0]?.solutionLatex || ''
  );
  const [currentReport, setCurrentReport] = useState<MathAuditReport | null>(
    topic.auditReports[0] || null
  );

  // Load sample exercise from topic
  const handleSelectSample = (ex: TieredExercise) => {
    setProblemLatex(ex.statementLatex);
    setSolutionLatex(ex.solutionLatex);
  };

  // Run AI Math Audit
  const handleRunAudit = async () => {
    if (!problemLatex.trim() || !solutionLatex.trim()) {
      alert('Vui lòng nhập cả Đề bài và Lời giải cần kiểm tra logic!');
      return;
    }

    try {
      setIsAiProcessing(true);
      const report = await auditMathProblemAI(problemLatex, solutionLatex);
      setCurrentReport(report);

      const updated: TopicCurriculum = {
        ...topic,
        auditReports: [report, ...topic.auditReports],
        updatedAt: new Date().toISOString(),
      };
      onUpdateTopic(updated);
    } catch (err: any) {
      alert('Lỗi khi thẩm định logic: ' + (err.message || 'Vui lòng thử lại.'));
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Apply auto-repaired problem & solution
  const handleApplyRepair = () => {
    if (!currentReport?.repairedProblemLatex && !currentReport?.repairedSolutionLatex) return;

    if (currentReport.repairedProblemLatex) {
      setProblemLatex(currentReport.repairedProblemLatex);
    }
    if (currentReport.repairedSolutionLatex) {
      setSolutionLatex(currentReport.repairedSolutionLatex);
    }
    alert('Đã áp dụng bản sửa đổi chuẩn xác vào khung soạn thảo!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Đột Phá 2: Math Logic & Hypothesis Verifier</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Kiểm Tra Toán & Rà Soát Logic Sư Phạm Toàn Diện
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-3xl">
              Hệ thống thẩm định chuyên sâu dựa trên 7 tiêu chí toán học chuẩn mực: Miền xác định, điểm rơi cực trị, tính chặt chẽ của lập luận, giả thiết mâu thuẫn, tính đối xứng và cú pháp LaTeX. Loại bỏ hoàn toàn các lỗi sai sót trước khi xuất bản tài liệu.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Problem & Solution (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <BookOpen className="w-4 h-4 mr-1.5 text-emerald-600" />
                Đề Bài Cần Rà Soát
              </span>
              {topic.step4Exercises.length > 0 && (
                <select
                  className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  onChange={(e) => {
                    const found = topic.step4Exercises.find((x) => x.id === e.target.value);
                    if (found) handleSelectSample(found);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Tải từ bài tập có sẵn...
                  </option>
                  {topic.step4Exercises.map((ex, i) => (
                    <option key={ex.id} value={ex.id}>
                      Bài {i + 1}: {ex.title.substring(0, 25)}...
                    </option>
                  ))}
                </select>
              )}
            </div>

            <textarea
              rows={3}
              value={problemLatex}
              onChange={(e) => setProblemLatex(e.target.value)}
              placeholder="Nhập đề bài toán (LaTeX)..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Lời Giải & Chứng Minh Cần Thẩm Định:
              </span>
              <textarea
                rows={7}
                value={solutionLatex}
                onChange={(e) => setSolutionLatex(e.target.value)}
                placeholder="Nhập toàn bộ các bước lập luận, chứng minh bằng LaTeX..."
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRunAudit}
              disabled={isAiProcessing}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isAiProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
              )}
              <span>Chạy Kiểm Tra & Rà Soát Logic AI</span>
            </button>
          </div>

          {/* 7 Rigorous Criteria Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-slate-700">
            <span className="font-bold text-slate-800 uppercase block tracking-wider">
              7 Tiêu Chí Thẩm Định Cốt Lõi:
            </span>
            <ul className="space-y-1 text-[11px] list-disc list-inside">
              <li>1. Miền xác định & Giả thiết (Mẫu $\ne 0$, căn $\ge 0$)</li>
              <li>2. Dấu đẳng thức & Điểm rơi cực trị</li>
              <li>3. Tính chặt chẽ của lập luận (Không ngộ nhận)</li>
              <li>4. Giả thiết thừa / thiếu / mâu thuẫn nội tại</li>
              <li>5. Tính đối xứng, hoán vị & tính bất biến</li>
              <li>6. Chuẩn cú pháp LaTeX hiển thị</li>
              <li>7. Tính khả thi sư phạm trong phòng thi HSG</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Audit Report & Itemized Checklist (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              Báo Cáo Thẩm Định Chuyên Môn
            </h3>
            {currentReport && (
              <span className="text-xs text-slate-500">
                {new Date(currentReport.timestamp).toLocaleTimeString('vi-VN')}
              </span>
            )}
          </div>

          {!currentReport ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa Chạy Thẩm Định Logic</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Nhập Đề bài và Lời giải vào khung bên trái, sau đó nhấn "Chạy Kiểm Tra & Rà Soát Logic AI" để nhận bảng đánh giá chi tiết.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score Meter Banner */}
              <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Chỉ Số Chặt Chẽ Toán Học (Rigor Index)
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-black text-emerald-700">
                      {currentReport.rigorScore}
                      <span className="text-sm font-normal text-slate-400">/100</span>
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        currentReport.overallVerdict === 'excellent'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : currentReport.overallVerdict === 'needs_minor_revision'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {currentReport.overallVerdict === 'excellent'
                        ? '🟢 Xuất Sắc - Chuẩn Tuyệt Đối'
                        : currentReport.overallVerdict === 'needs_minor_revision'
                        ? '🟡 Cần Bổ Sung Nhỏ'
                        : '🔴 Phát Hiện Sai Sót Logic'}
                    </span>
                  </div>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                  <Award className="w-8 h-8" />
                </div>
              </div>

              {/* Summary text */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">
                  Nhận xét của Hội đồng Thẩm định:
                </span>
                <p>{currentReport.summary}</p>
              </div>

              {/* Itemized 7 Criteria Checklist */}
              <div className="space-y-2">
                {currentReport.items.map((item) => {
                  const statusIcon =
                    item.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : item.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    );

                  const cardBg =
                    item.status === 'passed'
                      ? 'bg-white border-slate-200'
                      : item.status === 'warning'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-rose-50/40 border-rose-200';

                  return (
                    <div key={item.id} className={`p-3.5 rounded-xl border ${cardBg} space-y-1`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {statusIcon}
                          <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.status === 'passed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status === 'passed'
                            ? 'Đạt'
                            : item.status === 'warning'
                            ? 'Cảnh báo'
                            : 'Không đạt'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 pl-6 leading-relaxed">{item.details}</p>
                      {item.suggestedFix && (
                        <div className="ml-6 mt-1 p-2 bg-white/90 border border-slate-200 rounded text-[11px] text-amber-900">
                          <span className="font-semibold">Đề xuất hoàn thiện: </span>
                          <span>{item.suggestedFix}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Repaired Version Box (if available) */}
              {(currentReport.repairedProblemLatex || currentReport.repairedSolutionLatex) && (
                <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 uppercase flex items-center">
                      <Sparkles className="w-4 h-4 mr-1 text-emerald-600" />
                      Phương Án Sửa Chữa Tối Ưu Đã Hoàn Thiện
                    </span>
                    <button
                      onClick={handleApplyRepair}
                      className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Áp Dụng Bản Sửa Này</span>
                    </button>
                  </div>

                  {currentReport.repairedProblemLatex && (
                    <div className="bg-white p-3 rounded-lg border border-emerald-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Đề bài đã chuẩn hóa:
                      </span>
                      <MathRenderer content={`$$${currentReport.repairedProblemLatex}$$`} />
                    </div>
                  )}

                  {currentReport.repairedSolutionLatex && (
                    <div className="bg-white p-3 rounded-lg border border-emerald-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Lời giải chuẩn xác không tì vết:
                      </span>
                      <MathRenderer content={currentReport.repairedSolutionLatex} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
