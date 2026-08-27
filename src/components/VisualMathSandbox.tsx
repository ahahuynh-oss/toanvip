import React, { useState } from 'react';
import {
  Palette,
  Shapes,
  Grid,
  TrendingUp,
  Download,
  Copy,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { TopicCurriculum } from '../types/math';

interface VisualMathSandboxProps {
  topic: TopicCurriculum;
}

export const VisualMathSandbox: React.FC<VisualMathSandboxProps> = ({ topic }) => {
  const [selectedTool, setSelectedTool] = useState<'geometry' | 'combinatorics' | 'sequences' | 'inequality'>('geometry');
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);

  // Geometry state
  const [triangleType, setTriangleType] = useState<'acute' | 'right' | 'obtuse'>('acute');
  const [showIncircle, setShowIncircle] = useState<boolean>(true);
  const [showCircumcircle, setShowCircumcircle] = useState<boolean>(true);
  const [showHarmonicBundle, setShowHarmonicBundle] = useState<boolean>(true);

  // Combinatorics grid state
  const [gridSize, setGridSize] = useState<number>(5);
  const [selectedCells, setSelectedCells] = useState<Record<string, boolean>>({});

  // Sequence Cobweb state
  const [sequenceFunc, setSequenceFunc] = useState<'sqrt' | 'logistic' | 'linear'>('sqrt');
  const [initialX, setInitialX] = useState<number>(0.2);

  const toggleCell = (r: number, c: number) => {
    const key = `${r}-${c}`;
    setSelectedCells((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopySvg = () => {
    const svgEl = document.getElementById('visual-math-svg');
    if (svgEl) {
      navigator.clipboard.writeText(svgEl.outerHTML);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-pink-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>Visual Math Sandbox & Algorithmic Art</span>
          </div>
          <h2 className="text-lg font-black text-slate-900">
            Bộ Tạo Minh Họa Toán Học & Cấu Hình Trực Quan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sinh hình vẽ vector SVG cho Hình học phẳng, Bất biến tổ hợp, Đồ thị tiếp tuyến và Mạng nhện dãy số.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setSelectedTool('geometry')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTool === 'geometry'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shapes className="w-3.5 h-3.5" />
            <span>Hình Học Phẳng</span>
          </button>
          <button
            onClick={() => setSelectedTool('combinatorics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTool === 'combinatorics'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Lưới Tổ Hợp</span>
          </button>
          <button
            onClick={() => setSelectedTool('sequences')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTool === 'sequences'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Dãy Số Cobweb</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Area (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] border border-slate-800 relative">
          {/* SVG Canvas */}
          <div className="w-full flex items-center justify-center">
            {selectedTool === 'geometry' && (
              <svg
                id="visual-math-svg"
                viewBox="0 0 500 350"
                className="w-full max-w-[480px] h-[320px]"
              >
                {/* Circumcircle */}
                {showCircumcircle && (
                  <circle
                    cx="250"
                    cy="185"
                    r="125"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Triangle ABC */}
                <polygon
                  points="250,60 140,270 380,270"
                  fill="rgba(59, 130, 246, 0.08)"
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                />

                {/* Incircle */}
                {showIncircle && (
                  <circle
                    cx="250"
                    cy="210"
                    r="55"
                    fill="rgba(236, 72, 153, 0.1)"
                    stroke="#ec4899"
                    strokeWidth="2"
                  />
                )}

                {/* Harmonic tangents */}
                {showHarmonicBundle && (
                  <g>
                    <line x1="250" y1="60" x2="60" y2="270" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="60" y1="270" x2="380" y2="270" stroke="#fbbf24" strokeWidth="1.5" />
                    <circle cx="60" cy="270" r="4" fill="#fbbf24" />
                    <text x="50" y="290" fill="#fde047" fontSize="12" fontWeight="bold">T (Giao tiếp tuyến)</text>
                  </g>
                )}

                {/* Vertices labels */}
                <circle cx="250" cy="60" r="5" fill="#ffffff" />
                <text x="245" y="45" fill="#ffffff" fontSize="14" fontWeight="bold">A</text>

                <circle cx="140" cy="270" r="5" fill="#ffffff" />
                <text x="120" y="285" fill="#ffffff" fontSize="14" fontWeight="bold">B</text>

                <circle cx="380" cy="270" r="5" fill="#ffffff" />
                <text x="390" y="285" fill="#ffffff" fontSize="14" fontWeight="bold">C</text>

                <circle cx="250" cy="210" r="4" fill="#ec4899" />
                <text x="258" y="215" fill="#f472b6" fontSize="12" fontWeight="bold">I (Tâm nội tiếp)</text>
              </svg>
            )}

            {selectedTool === 'combinatorics' && (
              <svg
                id="visual-math-svg"
                viewBox="0 0 400 320"
                className="w-full max-w-[400px] h-[300px]"
              >
                {Array.from({ length: gridSize }).map((_, r) =>
                  Array.from({ length: gridSize }).map((_, c) => {
                    const isFilled = selectedCells[`${r}-${c}`];
                    const isEven = (r + c) % 2 === 0;
                    const cellSize = 280 / gridSize;
                    const x = 60 + c * cellSize;
                    const y = 20 + r * cellSize;

                    return (
                      <g key={`${r}-${c}`} onClick={() => toggleCell(r, c)} className="cursor-pointer">
                        <rect
                          x={x}
                          y={y}
                          width={cellSize - 4}
                          height={cellSize - 4}
                          rx="6"
                          fill={
                            isFilled
                              ? '#ec4899'
                              : isEven
                              ? '#1e293b'
                              : '#0f172a'
                          }
                          stroke="#334155"
                          strokeWidth="1.5"
                          className="transition-colors hover:stroke-pink-500"
                        />
                        {isFilled && (
                          <circle
                            cx={x + (cellSize - 4) / 2}
                            cy={y + (cellSize - 4) / 2}
                            r={cellSize / 4}
                            fill="#ffffff"
                          />
                        )}
                      </g>
                    );
                  })
                )}
              </svg>
            )}

            {selectedTool === 'sequences' && (
              <svg
                id="visual-math-svg"
                viewBox="0 0 450 320"
                className="w-full max-w-[450px] h-[300px]"
              >
                {/* Axes */}
                <line x1="50" y1="270" x2="400" y2="270" stroke="#475569" strokeWidth="2" />
                <line x1="50" y1="270" x2="50" y2="30" stroke="#475569" strokeWidth="2" />

                {/* Diagonal line y = x */}
                <line x1="50" y1="270" x2="350" y2="50" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="360" y="55" fill="#94a3b8" fontSize="11">y = x</text>

                {/* Curve y = f(x) */}
                <path
                  d="M 50 270 Q 150 90 350 70"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
                <text x="360" y="80" fill="#38bdf8" fontSize="11" fontWeight="bold">y = f(x)</text>

                {/* Cobweb iteration steps */}
                <path
                  d="M 100 270 L 100 200 L 140 200 L 140 150 L 200 150 L 200 110 L 250 110 L 250 90 L 280 90"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                />
                <circle cx="100" cy="270" r="4" fill="#f43f5e" />
                <text x="95" y="290" fill="#fda4af" fontSize="11" fontWeight="bold">x₀</text>

                <circle cx="280" cy="90" r="4" fill="#10b981" />
                <text x="290" y="95" fill="#34d399" fontSize="12" fontWeight="bold">L (Điểm tụ)</text>
              </svg>
            )}
          </div>

          {/* Copy SVG Action */}
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleCopySvg}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedSvg ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã sao chép SVG</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép mã SVG</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Controls Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Tùy Chỉnh Cấu Hình Toán Học
          </h3>

          {selectedTool === 'geometry' && (
            <div className="space-y-3">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-700 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <span>Đường tròn ngoại tiếp (O)</span>
                <input
                  type="checkbox"
                  checked={showCircumcircle}
                  onChange={(e) => setShowCircumcircle(e.target.checked)}
                  className="rounded text-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold text-slate-700 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <span>Đường tròn nội tiếp (I)</span>
                <input
                  type="checkbox"
                  checked={showIncircle}
                  onChange={(e) => setShowIncircle(e.target.checked)}
                  className="rounded text-pink-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold text-slate-700 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <span>Chùm tiếp tuyến & Hàng điều hòa</span>
                <input
                  type="checkbox"
                  checked={showHarmonicBundle}
                  onChange={(e) => setShowHarmonicBundle(e.target.checked)}
                  className="rounded text-amber-600 cursor-pointer"
                />
              </label>
            </div>
          )}

          {selectedTool === 'combinatorics' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Kích thước bảng ô vuông: {gridSize}x{gridSize}</span>
                <div className="flex space-x-1">
                  {[3, 4, 5, 6].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setGridSize(sz)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        gridSize === sz ? 'bg-purple-600 text-white' : 'bg-white border text-slate-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Nhấp chuột trực tiếp vào từng ô để tô màu cấu hình bất biến hoặc thiết lập quân cờ/điểm cực hạn.
              </p>
            </div>
          )}

          {selectedTool === 'sequences' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700">Dạng hàm truy hồi:</span>
                <select
                  value={sequenceFunc}
                  onChange={(e: any) => setSequenceFunc(e.target.value)}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="sqrt">Hàm căn thức: x_(n+1) = √(2 + x_n)</option>
                  <option value="logistic">Hàm Logistic: x_(n+1) = r.x_n(1 - x_n)</option>
                  <option value="linear">Hàm phân thức: x_(n+1) = (a.x_n + b) / (c.x_n + d)</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500">
                Biểu đồ mạng nhện (Cobweb diagram) giúp học sinh trực quan hóa giới hạn điểm tụ của dãy số đơn điệu và bị chặn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
