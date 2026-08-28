/**
 * Types & Data Schemas for MathOlympiad Studio
 */

export type MathBranch = 'algebra' | 'geometry' | 'number_theory' | 'combinatorics' | 'calculus_sequences';

export type TargetLevel = 'school_team' | 'provincial_hsg' | 'thpt_qg_vdc' | 'national_vmo' | 'tst_olympiad';

export type ExerciseTier = 'tier_1' | 'tier_2' | 'tier_3'; // Tier 1: Nền tảng chuyên | Tier 2: Vận dụng HSG Trường | Tier 3: Vận dụng cao HSG Tỉnh / THPT VDC

export interface PedagogicalTarget {
  cognitiveLevels: {
    knowledge: string[];
    understanding: string[];
    application: string[];
    highApplication: string[];
    creativeOlympiad: string[];
  };
  keyCompetencies: string[]; // e.g., 'Tư duy trừu tượng', 'Phân tích điểm rơi', 'Quy nạp toán học'
  estimatedHours: number;
  prerequisites: string[];
}

export interface LogicRoadmapNode {
  id: string;
  title: string;
  type: 'prerequisite' | 'core_theorem' | 'key_lemma' | 'technique' | 'generalization';
  description: string;
  latexSummary?: string;
  order: number;
}

export interface KeyLemma {
  id: string;
  name: string;
  statementLatex: string;
  proofLatex: string;
  pedagogyNotes: string; // Ý nghĩa sư phạm & điểm mấu chốt
  commonTraps: string[]; // Bẫy học sinh hay mắc
}

export interface TieredExercise {
  id: string;
  tier: ExerciseTier;
  title: string;
  statementLatex: string;
  pedagogicalIdea: string; // Định hướng tiếp cận sư phạm
  hints: string[]; // Gợi ý phân tầng (Hint 1 -> Hint 2)
  solutionLatex: string; // Lời giải chi tiết chặt chẽ
  equalityCaseLatex?: string; // Dấu bằng xảy ra
  generalizationNotes?: string; // Khai thác & mở rộng
  source?: string; // e.g. "Đề thi HSG TP Hà Nội 2024", "VMO 2023"
}

export interface EvolutionVariant {
  id: string;
  strategy: 'generalization' | 'dual_inverse' | 'structural_morph' | 'relaxation_bounding' | 'inter_topic_fusion' | 'asymmetry_traps';
  strategyName: string;
  statementLatex: string;
  solutionLatex: string;
  pedagogyRationale: string; // Vì sao biến thể này nâng cao tư duy
  difficultyScore: number; // 1-10
  equalityCondition?: string;
}

export interface ProblemEvolution {
  id: string;
  originalProblem: string;
  originalSolution?: string;
  mathBranch: MathBranch;
  targetLevel: TargetLevel;
  variants: EvolutionVariant[];
}

export interface MathAuditCheckItem {
  id: string;
  category: 'domain_conditions' | 'equality_extremum' | 'logical_rigor' | 'redundancy_conflict' | 'symmetry_invariance' | 'latex_syntax' | 'pedagogy_feasibility';
  name: string;
  status: 'passed' | 'warning' | 'error';
  details: string;
  suggestedFix?: string;
}

export interface MathAuditReport {
  id: string;
  timestamp: string;
  rigorScore: number; // 0-100
  overallVerdict: 'excellent' | 'needs_minor_revision' | 'critical_flaws';
  summary: string;
  items: MathAuditCheckItem[];
  repairedProblemLatex?: string;
  repairedSolutionLatex?: string;
}

export interface TopicCurriculum {
  id: string;
  title: string;
  code: string;
  grade: '10' | '11' | '12' | 'all';
  mathBranch: MathBranch;
  targetLevel: TargetLevel;
  author: string;
  school: string;
  createdAt: string;
  updatedAt: string;
  step1Pedagogy: PedagogicalTarget;
  step2Roadmap: LogicRoadmapNode[];
  step3Theory: {
    overviewMarkdown: string;
    coreTheoremsLatex: string;
    keyLemmas: KeyLemma[];
  };
  step4Exercises: TieredExercise[];
  step5Evolutions: ProblemEvolution[];
  auditReports: MathAuditReport[];
  traceback?: SourceTraceback;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  title: string;
  contentLatex: string;
  tier: ExerciseTier;
  type: 'multiple_choice' | 'short_answer' | 'essay_proof';
  options?: {
    id: string;
    latex: string;
    isCorrect: boolean;
  }[];
  correctAnswerLatex: string;
  explanationLatex: string;
  hints: string[];
}

export interface QuizSession {
  id: string;
  topicId: string;
  studentName: string;
  startTime: string;
  endTime?: string;
  timeSpentSeconds: number;
  score: number;
  totalQuestions: number;
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    usedHintsCount: number;
  }[];
}

export interface ExamCitation {
  examYearOrName: string; // e.g. "Đề năm 2022" hoặc "HSG TP Hà Nội 2023"
  questionLabel: string; // e.g. "Câu 3" hoặc "Bài 2 (5.0 điểm)"
  excerptLatex?: string; // Đoạn trích bài toán
  keyRelevance?: string; // Điểm chạm kiến thức trực tiếp
}

export interface SourceTraceback {
  matchedExamCitations: ExamCitation[]; // Danh sách các đề thi và câu hỏi thực tế chứa dạng toán này
  relatedConcepts: string[]; // Các nội dung toán học liên quan (Đồng dư, Ước số, Đánh giá,...)
  dataObservationSummary: string; // Nhận định thống kê: "Chủ đề xuất hiện trong 3/5 bộ đề được phân tích."
  disclaimer: string; // "⚠ Đây là thống kê trên dữ liệu đã cung cấp, không phải dự đoán đề thi tương lai."
}

export interface RecommendedTopicProposal {
  id: string;
  title: string;
  code: string;
  mathBranch: MathBranch;
  grade: '10' | '11' | '12' | 'all';
  targetLevel: TargetLevel;
  // Truy Ngược Nguồn (Traceability Ground Truth & Citations)
  traceback: SourceTraceback;
  // Factual Ground Truth from Exam Data (Dữ liệu thực tế đối soát từ đề thi)
  factualExamEvidence: {
    exactProblemExcerpt: string; // Trích đoạn đề thi gốc được cung cấp
    sourceExamName: string; // Tên kỳ thi/nguồn bài toán
    observedPatterns: string[]; // Các đối tượng toán học/dạng thức có mặt thực tế trong đề
  };
  // AI Pedagogical Inference & Proposal (Suy luận & Đề xuất sư phạm từ AI)
  aiPedagogicalInference: {
    whyIncludedRationale: string; // Luận giải sư phạm tại sao nên đưa vào chương trình
    pedagogicalHypothesis: string; // Giả thiết sư phạm về năng lực học sinh cần bù đắp
    suggestedScope: string; // Phạm vi kiến thức đề xuất
  };
  // Teacher Vetting & Customization (Quyền kiểm duyệt và điều chỉnh của Giáo viên)
  vettingStatus: 'pending' | 'approved' | 'rejected';
  teacherNotes?: string;
  coreTechniques: string[]; // Danh sách kỹ thuật đề xuất
  selectedCoreTechniques?: string[]; // Kỹ thuật giáo viên đã duyệt chọn
  underlyingLemmas: string[]; // Danh sách bổ đề đề xuất
  selectedUnderlyingLemmas?: string[]; // Bổ đề giáo viên đã duyệt chọn
  studentCommonPitfalls: string[]; // Sai lầm thường gặp
  seedExamQuestions: {
    source: string;
    contentLatex: string;
    analysisNote: string;
    isVerifiedFact: boolean; // Khẳng định bài toán có thật trong đề thi cung cấp
  }[];
  estimatedHours: number;
}

export interface ExamKnowledgePattern {
  topicArea: string;
  frequency: 'high' | 'medium' | 'emerging';
  factualFrequencyCount?: number; // Số lần xuất hiện thực tế trong đề thi
  description: string;
  keyMethods: string[];
}

export interface ExamResearchAnalysisResult {
  examOverview: string; // Dữ liệu thực tế quan sát được từ đề thi
  whyThisCurriculumMatter: string; // Luận giải sư phạm của AI
  factualSummary: {
    totalProblemsExtracted: number;
    branchesCovered: string[];
    difficultyDistribution: string;
  };
  patterns: ExamKnowledgePattern[];
  recommendedTopics: RecommendedTopicProposal[];
  pedagogicalAdvice: string[];
  disclaimerNotice: string; // Tuyên bố khoa học sư phạm: Phân tích phục vụ bồi dưỡng năng lực, KHÔNG dự đoán đề thi/học tủ
}

export interface AppSettings {
  teacherName: string;
  schoolName: string;
  customApiKey: string;
  aiModel: string;
  theme: 'light' | 'dark';
  autoSave: boolean;
  soundEnabled: boolean;
}

