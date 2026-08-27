import React, { useState, useEffect } from 'react';
import { DEFAULT_TOPICS } from './data/defaultTopics';
import { TopicCurriculum, AppSettings } from './types/math';
import { Navbar, ActiveTab } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StepWorkflowView } from './components/StepWorkflowView';
import { ProblemEvolutionEngine } from './components/ProblemEvolutionEngine';
import { MathAuditVerifier } from './components/MathAuditVerifier';
import { WysiwygLatexEditor } from './components/WysiwygLatexEditor';
import { TopicBankView } from './components/TopicBankView';
import { StudentPracticeQuiz } from './components/StudentPracticeQuiz';
import { FullDocumentPreview } from './components/FullDocumentPreview';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { CreateTopicModal } from './components/CreateTopicModal';
import { ExamResearchModal } from './components/ExamResearchModal';
import { HsgAiCopilot } from './components/HsgAiCopilot';
import { generateFullCurriculumAI } from './services/geminiService';
import { RecommendedTopicProposal } from './types/math';

export function App() {
  // Load topics from LocalStorage or initialize with demo dataset
  const [topics, setTopics] = useState<TopicCurriculum[]>(() => {
    const saved = localStorage.getItem('math_curriculums_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: TopicCurriculum) => ({
            ...t,
            author:
              !t.author ||
              t.author.includes('Nguyễn Văn Toàn') ||
              t.author.includes('Nguyễn Văn Toán') ||
              t.author.includes('Trần Hoàng Lâm') ||
              t.author.includes('Lê Quang Hưng') ||
              t.author.includes('Cô Huỳnh Thị Hà')
                ? 'Huỳnh Thị Hà'
                : t.author,
            school:
              !t.school ||
              t.school.includes('Khoa Học Tự Nhiên') ||
              t.school.includes('Amsterdam') ||
              t.school.includes('Lê Hồng Phong')
                ? 'Trường THPT Hà Huy Tập'
                : t.school,
          }));
        }
      } catch (e) {
        console.error('Failed to parse saved topics', e);
      }
    }
    return DEFAULT_TOPICS;
  });

  const [currentTopicId, setCurrentTopicId] = useState<string>(() => {
    return topics[0]?.id || DEFAULT_TOPICS[0].id;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('workflow_5steps');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Sidebar responsive state
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // App settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('math_app_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          teacherName:
            parsed.teacherName === 'Thầy Nguyễn Văn Toàn' ||
            parsed.teacherName === 'Cô Huỳnh Thị Hà' ||
            !parsed.teacherName
              ? 'Huỳnh Thị Hà'
              : parsed.teacherName,
          schoolName:
            parsed.schoolName === 'Trường THPT Chuyên Khoa Học Tự Nhiên' || !parsed.schoolName
              ? 'Trường THPT Hà Huy Tập'
              : parsed.schoolName,
        };
      } catch {}
    }
    return {
      aiModel: 'gemini-3-flash-preview',
      customApiKey: localStorage.getItem('gemini_api_key') || '',
      latexEngine: 'katex',
      teacherName: 'Huỳnh Thị Hà',
      schoolName: 'Trường THPT Hà Huy Tập',
    };
  });

  // Modal visibility states
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(() => {
    const key = localStorage.getItem('gemini_api_key');
    return !key;
  });
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showExamResearchModal, setShowExamResearchModal] = useState<boolean>(false);

  // Sync topics to LocalStorage
  useEffect(() => {
    localStorage.setItem('math_curriculums_v1', JSON.stringify(topics));
  }, [topics]);

  // Current active topic
  const currentTopic = topics.find((t) => t.id === currentTopicId) || topics[0];

  // Update current topic
  const handleUpdateTopic = (updated: TopicCurriculum) => {
    setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Delete topic
  const handleDeleteTopic = (id: string) => {
    const next = topics.filter((t) => t.id !== id);
    if (next.length > 0) {
      setTopics(next);
      if (currentTopicId === id) {
        setCurrentTopicId(next[0].id);
      }
    }
  };

  // Clone topic
  const handleCloneTopic = (toClone: TopicCurriculum) => {
    const cloned: TopicCurriculum = {
      ...toClone,
      id: 'topic-' + Date.now(),
      code: toClone.code + '-COPY',
      title: toClone.title + ' (Bản sao)',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };
    setTopics((prev) => [cloned, ...prev]);
    setCurrentTopicId(cloned.id);
  };

  // Import / Merge topics from JSON backup
  const handleImportTopics = (imported: TopicCurriculum[], mode: 'merge' | 'replace' = 'merge') => {
    if (mode === 'replace') {
      setTopics(imported);
      if (imported.length > 0) setCurrentTopicId(imported[0].id);
    } else {
      setTopics((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newItems = imported.filter((t) => !existingIds.has(t.id));
        return [...newItems, ...prev];
      });
      if (imported.length > 0) setCurrentTopicId(imported[0].id);
    }
  };

  // Create topic directly from Exam Research Proposal
  const handleCreateTopicFromProposal = async (
    proposal: RecommendedTopicProposal,
    autoDesign5Steps: boolean
  ) => {
    const vettedTechniques =
      proposal.selectedCoreTechniques && proposal.selectedCoreTechniques.length > 0
        ? proposal.selectedCoreTechniques
        : proposal.coreTechniques || [];

    const vettedLemmas =
      proposal.selectedUnderlyingLemmas && proposal.selectedUnderlyingLemmas.length > 0
        ? proposal.selectedUnderlyingLemmas
        : proposal.underlyingLemmas || [];

    const rationale =
      proposal.aiPedagogicalInference?.whyIncludedRationale ||
      (proposal as any).whyIncludedRationale ||
      'Bồi dưỡng năng lực tư duy cốt lõi và phương pháp biến đổi từ đề thi.';

    const newTopic: TopicCurriculum = {
      id: 'topic-' + Date.now(),
      code: proposal.code || 'CD-' + Math.floor(100 + Math.random() * 900),
      title: proposal.title,
      mathBranch: proposal.mathBranch,
      grade: proposal.grade,
      targetLevel: proposal.targetLevel,
      author: settings.teacherName || 'Huỳnh Thị Hà',
      school: settings.schoolName || 'Trường THPT Hà Huy Tập',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      step1Pedagogy: {
        cognitiveLevels: {
          knowledge: vettedLemmas,
          understanding: vettedTechniques,
          application: [`Vận dụng vào dạng toán ${proposal.title}`],
          highApplication: [`Giải quyết bài toán phân loại trong đề thi`],
          creativeOlympiad: [`Sáng tạo các biến thể bất biến & đảo`],
        },
        keyCompetencies: vettedTechniques,
        estimatedHours: proposal.estimatedHours || 6,
        prerequisites: vettedLemmas,
      },
      step2Roadmap: [
        {
          id: 'node-1',
          title: 'Xuất phát từ Đề thi & Khơi dậy Động cơ',
          type: 'prerequisite',
          description: 'Phân tích các bài toán trong đề thi để học sinh thấy sự cần thiết của chuyên đề.',
          order: 1,
        },
        {
          id: 'node-2',
          title: 'Xây dựng Bổ đề & Kỹ thuật Cốt lõi',
          type: 'key_lemma',
          description: 'Chứng minh chặt chẽ các bổ đề nền tảng và trang bị kỹ thuật then chốt.',
          order: 2,
        },
        {
          id: 'node-3',
          title: 'Nâng cao Thực chiến & Sáng tạo Biến thể',
          type: 'generalization',
          description: 'Giải quyết các bài toán cấp độ VMO / Olympic và phát triển tư duy đảo / tổng quát.',
          order: 3,
        },
      ],
      step3Theory: {
        overviewMarkdown: `### Tổng quan chuyên đề: ${proposal.title}\n\n**Luận giải sư phạm:**\n${rationale}\n\n${
          proposal.teacherNotes ? `**Ghi chú của Giáo viên:**\n${proposal.teacherNotes}\n\n` : ''
        }**Căn cứ đề thi thực tế:**\n${
          proposal.factualExamEvidence?.exactProblemExcerpt || 'Trích đoạn đề thi đối soát'
        }`,
        coreTheoremsLatex: vettedTechniques.join('\n\n'),
        keyLemmas: vettedLemmas.map((lem, idx) => ({
          id: `lem-${idx + 1}`,
          name: lem,
          statementLatex: lem,
          proofLatex: 'Chứng minh bằng quy nạp đại số hoặc các bất đẳng thức cơ bản đã biết.',
          pedagogyNotes: 'Giáo viên nhấn mạnh điều kiện xảy ra đẳng thức và phạm vi áp dụng.',
          commonTraps: proposal.studentCommonPitfalls || ['Học sinh hay quên điều kiện các biến dương hoặc tính đồng bậc.'],
        })),
      },
      step4Exercises: (proposal.seedExamQuestions || []).map((q, idx) => ({
        id: `seed-ex-${idx + 1}`,
        title: `Bài Toán Trích Từ Đề Thi: ${q.source}`,
        tier: 'tier_2' as const,
        source: q.source,
        statementLatex: q.contentLatex,
        pedagogicalIdea: q.analysisNote || 'Định hướng tiếp cận từ đề thi thực chiến',
        hints: [
          'Gợi ý 1: Xem xét cấu trúc đối xứng hoặc tính đơn điệu của biểu thức.',
          'Gợi ý 2: Áp dụng bổ đề nền tảng đã trang bị ở Bước 3.',
        ],
        solutionLatex: `**Lời giải chi tiết:**\n\nPhân tích sư phạm: ${q.analysisNote}\n\nÁp dụng kỹ thuật cốt lõi để biến đổi và đi đến kết luận.`,
        equalityCaseLatex: 'Dấu đẳng thức xảy ra khi các biến thỏa mãn điều kiện đối xứng.',
        generalizationNotes: 'Có thể mở rộng cho trường hợp n biến.',
      })),
      step5Evolutions: [],
      auditReports: [],
      traceback: proposal.traceback,
    };

    setTopics((prev) => [newTopic, ...prev]);
    setCurrentTopicId(newTopic.id);
    setActiveTab('workflow_5steps');
    setActiveWorkflowStep(1);

    if (autoDesign5Steps) {
      try {
        setIsAiProcessing(true);
        const generated = await generateFullCurriculumAI(
          newTopic.title,
          newTopic.grade,
          newTopic.mathBranch,
          newTopic.targetLevel
        );

        const finalizedTopic: TopicCurriculum = {
          ...newTopic,
          step1Pedagogy: generated.step1Pedagogy || newTopic.step1Pedagogy,
          step2Roadmap: generated.step2Roadmap || newTopic.step2Roadmap,
          step3Theory: generated.step3Theory || newTopic.step3Theory,
          step4Exercises:
            generated.step4Exercises && generated.step4Exercises.length > 0
              ? generated.step4Exercises
              : newTopic.step4Exercises,
          updatedAt: new Date().toISOString(),
        };

        setTopics((prev) => prev.map((t) => (t.id === finalizedTopic.id ? finalizedTopic : t)));
      } catch (err: any) {
        console.error('Error in auto designing 5 steps for proposal', err);
      } finally {
        setIsAiProcessing(false);
      }
    }
  };

  // Create new topic manually and optionally auto-design with AI
  const handleCreateTopic = async (newTopic: TopicCurriculum, triggerAi: boolean) => {
    let finalTopic = newTopic;
    setTopics((prev) => [finalTopic, ...prev]);
    setCurrentTopicId(finalTopic.id);
    setActiveTab('workflow_5steps');
    setActiveWorkflowStep(1);

    if (triggerAi) {
      try {
        setIsAiProcessing(true);
        const generated = await generateFullCurriculumAI(
          newTopic.title,
          newTopic.grade,
          newTopic.mathBranch,
          newTopic.targetLevel
        );

        finalTopic = {
          ...newTopic,
          step1Pedagogy: generated.step1Pedagogy || newTopic.step1Pedagogy,
          step2Roadmap: generated.step2Roadmap || newTopic.step2Roadmap,
          step3Theory: generated.step3Theory || newTopic.step3Theory,
          step4Exercises: generated.step4Exercises || newTopic.step4Exercises,
          updatedAt: new Date().toISOString(),
        };

        setTopics((prev) => prev.map((t) => (t.id === finalTopic.id ? finalTopic : t)));
      } catch (err: any) {
        console.error('Error auto-generating topic', err);
      } finally {
        setIsAiProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Bảng Điều Khiển Danh Mục Dọc Bên Trái (Vertical Sidebar) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        topics={topics}
        currentTopic={currentTopic}
        onSelectTopic={(t) => setCurrentTopicId(t.id)}
        onOpenNewTopicModal={() => setShowCreateModal(true)}
        onOpenExamResearchModal={() => setShowExamResearchModal(true)}
        onOpenExportModal={() => setShowExportModal(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
        onDeleteTopic={handleDeleteTopic}
        settings={settings}
        isAiProcessing={isAiProcessing}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeStep={activeWorkflowStep}
        onSelectStep={(step) => setActiveWorkflowStep(step)}
      />

      {/* Main Content Area with Dynamic Padding matching Left Sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          topics={topics}
          currentTopic={currentTopic}
          onSelectTopic={(t) => setCurrentTopicId(t.id)}
          onOpenNewTopicModal={() => setShowCreateModal(true)}
          onOpenExamResearchModal={() => setShowExamResearchModal(true)}
          onOpenExportModal={() => setShowExportModal(true)}
          onOpenSettingsModal={() => setShowSettingsModal(true)}
          settings={settings}
          isAiProcessing={isAiProcessing}
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
        />

        {/* View Contents */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
          {activeTab === 'workflow_5steps' && (
            <StepWorkflowView
              topic={currentTopic}
              onUpdateTopic={handleUpdateTopic}
              onNavigateToTab={(tab) => setActiveTab(tab as ActiveTab)}
              isAiProcessing={isAiProcessing}
              setIsAiProcessing={setIsAiProcessing}
              activeStep={activeWorkflowStep}
              onStepChange={setActiveWorkflowStep}
            />
          )}

          {activeTab === 'evolution_engine' && (
            <ProblemEvolutionEngine
              topic={currentTopic}
              onUpdateTopic={handleUpdateTopic}
              isAiProcessing={isAiProcessing}
              setIsAiProcessing={setIsAiProcessing}
            />
          )}

          {activeTab === 'logic_audit' && (
            <MathAuditVerifier
              topic={currentTopic}
              onUpdateTopic={handleUpdateTopic}
              isAiProcessing={isAiProcessing}
              setIsAiProcessing={setIsAiProcessing}
            />
          )}

          {activeTab === 'wysiwyg_editor' && (
            <WysiwygLatexEditor
              topic={currentTopic}
              onUpdateTopic={handleUpdateTopic}
              isAiProcessing={isAiProcessing}
              setIsAiProcessing={setIsAiProcessing}
            />
          )}

          {activeTab === 'topic_bank' && (
            <TopicBankView
              topics={topics}
              currentTopic={currentTopic}
              onSelectTopic={(t) => {
                setCurrentTopicId(t.id);
                setActiveTab('workflow_5steps');
              }}
              onDeleteTopic={handleDeleteTopic}
              onCloneTopic={handleCloneTopic}
              onOpenNewTopicModal={() => setShowCreateModal(true)}
              onOpenExamResearchModal={() => setShowExamResearchModal(true)}
              onImportTopics={handleImportTopics}
            />
          )}

          {activeTab === 'student_quiz' && (
            <StudentPracticeQuiz
              topic={currentTopic}
              isAiProcessing={isAiProcessing}
              setIsAiProcessing={setIsAiProcessing}
            />
          )}

          {activeTab === 'latex_preview' && (
            <FullDocumentPreview
              topic={currentTopic}
              onOpenExportModal={() => setShowExportModal(true)}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              <strong>MathOlympiad Studio</strong> • Bảng điều khiển danh mục chuyên đề & Bồi dưỡng HSG Toán THPT
            </span>
            <span className="text-slate-400">
              Phiên bản 2.5 • Chuẩn KaTeX, Overleaf, Word, Excel & Google Gemini AI
            </span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {showExportModal && (
        <ExportModal topic={currentTopic} onClose={() => setShowExportModal(false)} />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSaveSettings={setSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateTopicModal
          onClose={() => setShowCreateModal(false)}
          onCreateTopic={handleCreateTopic}
          onOpenExamResearchModal={() => setShowExamResearchModal(true)}
          teacherName={settings.teacherName}
          schoolName={settings.schoolName}
        />
      )}

      {showExamResearchModal && (
        <ExamResearchModal
          onClose={() => setShowExamResearchModal(false)}
          onCreateTopicFromProposal={handleCreateTopicFromProposal}
          onOpenManualCreate={() => setShowCreateModal(true)}
          teacherName={settings.teacherName}
          schoolName={settings.schoolName}
        />
      )}

      {/* 🤖 Hộp AI Trợ Lý HSG ở góc phải dưới cùng */}
      <HsgAiCopilot
        currentTopic={currentTopic}
        allTopics={topics}
        onUpdateTopic={handleUpdateTopic}
        isGlobalAiProcessing={isAiProcessing}
      />
    </div>
  );
}

export default App;
