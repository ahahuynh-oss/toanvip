import React, { useState, useMemo } from 'react';
import {
  Network,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { TopicCurriculum, LogicRoadmapNode, KeyLemma, TieredExercise } from '../types/math';
import { MathRenderer } from './MathRenderer';

interface KnowledgeGraphViewProps {
  topic: TopicCurriculum;
  onSelectExercise?: (exerciseId: string) => void;
}

interface GraphNode {
  id: string;
  type: 'prerequisite' | 'core_theorem' | 'key_lemma' | 'technique' | 'generalization' | 'exercise';
  title: string;
  subtitle?: string;
  latex?: string;
  description?: string;
  x: number;
  y: number;
  color: string;
  bgLight: string;
  tier?: string;
}

interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ topic }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterType, setFilterType] = useState<string>('all');

  // Compute graph nodes and links layout
  const { nodes, links } = useMemo(() => {
    const computedNodes: GraphNode[] = [];
    const computedLinks: GraphLink[] = [];

    const startX = 60;
    const colWidth = 200;
    const startY = 120;
    const rowHeight = 90;

    // 1. Roadmap nodes
    topic.step2Roadmap.forEach((rn, idx) => {
      const colors: Record<string, { main: string; light: string }> = {
        prerequisite: { main: '#10b981', light: '#ecfdf5' },
        core_theorem: { main: '#3b82f6', light: '#eff6ff' },
        key_lemma: { main: '#8b5cf6', light: '#f5f3ff' },
        technique: { main: '#f59e0b', light: '#fffbeb' },
        generalization: { main: '#ec4899', light: '#fdf2f8' },
      };

      const c = colors[rn.type] || { main: '#64748b', light: '#f8fafc' };

      computedNodes.push({
        id: rn.id || `rn-${idx}`,
        type: rn.type,
        title: rn.title,
        subtitle: `Chặng ${rn.order || idx + 1}`,
        latex: rn.latexSummary,
        description: rn.description,
        x: startX + idx * colWidth,
        y: startY + (idx % 2 === 0 ? 0 : 30),
        color: c.main,
        bgLight: c.light,
      });

      if (idx > 0) {
        const prevId = topic.step2Roadmap[idx - 1].id || `rn-${idx - 1}`;
        computedLinks.push({
          source: prevId,
          target: rn.id || `rn-${idx}`,
          label: 'Phát triển',
        });
      }
    });

    // 2. Key Lemma nodes
    topic.step3Theory.keyLemmas.forEach((lem, lIdx) => {
      const lemmaNodeId = lem.id || `lem-${lIdx}`;
      const parentRoadmap = topic.step2Roadmap.find((r) => r.type === 'key_lemma') || topic.step2Roadmap[1];

      computedNodes.push({
        id: lemmaNodeId,
        type: 'key_lemma',
        title: lem.name,
        subtitle: 'Bổ đề then chốt',
        latex: lem.statementLatex,
        description: lem.pedagogyNotes,
        x: startX + 2 * colWidth + (lIdx * 40 - 20),
        y: startY + 160 + lIdx * rowHeight,
        color: '#7c3aed',
        bgLight: '#faf5ff',
      });

      if (parentRoadmap) {
        computedLinks.push({
          source: parentRoadmap.id || 'rn-2',
          target: lemmaNodeId,
          label: 'Cụ thể hóa',
        });
      }
    });

    // 3. Exercise nodes
    topic.step4Exercises.slice(0, 5).forEach((ex, eIdx) => {
      const exNodeId = ex.id || `ex-${eIdx}`;
      const lemmaTarget = computedNodes.find((n) => n.type === 'key_lemma') || computedNodes[1];

      computedNodes.push({
        id: exNodeId,
        type: 'exercise',
        title: ex.title,
        subtitle: ex.tier === 'tier_1' ? 'Tầng 1: Cơ bản' : ex.tier === 'tier_2' ? 'Tầng 2: HSG Tỉnh' : 'Tầng 3: VMO',
        latex: ex.statementLatex,
        description: ex.pedagogicalIdea,
        x: startX + 3.5 * colWidth + (eIdx % 2 === 0 ? 0 : 30),
        y: startY + 120 + eIdx * 75,
        color: ex.tier === 'tier_3' ? '#dc2626' : ex.tier === 'tier_2' ? '#2563eb' : '#059669',
        bgLight: ex.tier === 'tier_3' ? '#fef2f2' : '#f0fdf4',
        tier: ex.tier,
      });

      if (lemmaTarget) {
        computedLinks.push({
          source: lemmaTarget.id,
          target: exNodeId,
          label: 'Vận dụng',
        });
      }
    });

    return { nodes: computedNodes, links: computedLinks };
  }, [topic]);

  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return nodes;
    return nodes.filter((n) => n.type === filterType);
  }, [nodes, filterType]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Network className="w-4 h-4" />
            <span>Sơ Đồ Tri Thức & Mạng Liên Kết Bổ Đề</span>
          </div>
          <h2 className="text-lg font-black text-slate-900">
            Bản Đồ Cấu Trúc Khái Niệm & Luồng Suy Luận
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trực quan hóa lộ trình: Kiến thức nền $\to$ Định lý $\to$ Bổ đề $\to$ Kỹ thuật $\to$ Bài tập phân tầng.
          </p>
        </div>

        {/* Controls & Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-hidden"
          >
            <option value="all">Tất cả các nốt ({nodes.length})</option>
            <option value="key_lemma">Bổ đề then chốt</option>
            <option value="technique">Kỹ thuật giải</option>
            <option value="exercise">Bài tập phân tầng</option>
          </select>

          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-slate-600 px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Đặt lại zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl p-4 overflow-hidden relative min-h-[480px] flex items-center justify-center border border-slate-800 shadow-inner">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div
            className="w-full h-full overflow-auto transition-transform duration-150 flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
          >
            <svg
              className="w-[1000px] h-[550px] min-w-[1000px]"
              viewBox="0 0 1000 550"
            >
              {/* Links Lines */}
              <g>
                {links.map((link, idx) => {
                  const sNode = nodes.find((n) => n.id === link.source);
                  const tNode = nodes.find((n) => n.id === link.target);
                  if (!sNode || !tNode) return null;

                  const isHighlighted =
                    selectedNodeId === sNode.id || selectedNodeId === tNode.id;

                  const midX = (sNode.x + tNode.x) / 2;
                  const midY = (sNode.y + tNode.y) / 2;

                  return (
                    <g key={idx}>
                      <path
                        d={`M ${sNode.x + 80} ${sNode.y + 25} C ${midX} ${sNode.y + 25}, ${midX} ${tNode.y + 25}, ${tNode.x} ${tNode.y + 25}`}
                        fill="none"
                        stroke={isHighlighted ? '#60a5fa' : '#334155'}
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        strokeDasharray={isHighlighted ? 'none' : '4 4'}
                        className="transition-all duration-300"
                      />
                      {link.label && (
                        <text
                          x={midX}
                          y={midY}
                          fill="#94a3b8"
                          fontSize="9"
                          textAnchor="middle"
                          className="font-mono select-none"
                        >
                          {link.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Nodes */}
              <g>
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* Node Box */}
                      <rect
                        width="165"
                        height="54"
                        rx="12"
                        fill={isSelected ? '#1e293b' : '#0f172a'}
                        stroke={isSelected ? node.color : '#334155'}
                        strokeWidth={isSelected ? 2.5 : 1}
                        className="transition-all"
                        filter={isSelected ? 'drop-shadow(0 0 10px rgba(96,165,250,0.4))' : 'none'}
                      />

                      {/* Left color bar */}
                      <rect
                        x="0"
                        y="0"
                        width="6"
                        height="54"
                        rx="3"
                        fill={node.color}
                      />

                      {/* Node Subtitle / Badge */}
                      <text
                        x="14"
                        y="18"
                        fill={node.color}
                        fontSize="9"
                        fontWeight="bold"
                        className="uppercase tracking-wider select-none font-sans"
                      >
                        {node.subtitle || node.type}
                      </text>

                      {/* Node Title */}
                      <text
                        x="14"
                        y="36"
                        fill="#f8fafc"
                        fontSize="11"
                        fontWeight="bold"
                        className="select-none font-sans"
                      >
                        {node.title.length > 20 ? node.title.substring(0, 18) + '...' : node.title}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Node Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: selectedNode?.color || '#3b82f6' }}
              />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {selectedNode?.subtitle || selectedNode?.type}
              </span>
            </div>

            <h3 className="text-base font-black text-slate-900 leading-tight">
              {selectedNode?.title}
            </h3>

            {selectedNode?.description && (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-1">💡 Ý nghĩa sư phạm:</span>
                {selectedNode.description}
              </div>
            )}

            {selectedNode?.latex && (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-indigo-700 block uppercase tracking-wider">
                  Công thức trọng tâm:
                </span>
                <div className="text-xs overflow-x-auto py-1">
                  <MathRenderer content={`$$${selectedNode.latex}$$`} />
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Bấm vào từng nút trên sơ đồ để xem chi tiết.</span>
            <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">
              {nodes.length} Nút tri thức
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
