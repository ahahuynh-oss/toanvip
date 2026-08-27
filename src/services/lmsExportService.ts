import { QuizQuestion, TopicCurriculum } from '../types/math';

/**
 * Service to export questions and exercises to standard LMS formats:
 * - Moodle XML
 * - GIFT format
 * - Aiken format
 */

export function exportToMoodleXml(topic: TopicCurriculum, quizQuestions?: QuizQuestion[]): string {
  const questions = quizQuestions && quizQuestions.length > 0 
    ? quizQuestions 
    : topic.step4Exercises.map((ex, idx) => ({
        id: ex.id,
        topicId: topic.id,
        title: `Bài ${idx + 1}: ${ex.title}`,
        contentLatex: ex.statementLatex,
        tier: ex.tier,
        type: 'multiple_choice' as const,
        options: [
          { id: 'opt-1', latex: ex.equalityCaseLatex || 'Thỏa mãn dấu đẳng thức điều kiện biên', isCorrect: true },
          { id: 'opt-2', latex: 'Không tồn tại nghiệm thỏa mãn', isCorrect: false },
          { id: 'opt-3', latex: 'Đẳng thức đạt được khi tất cả các biến bằng nhau', isCorrect: false },
          { id: 'opt-4', latex: 'Biểu thức không bị chặn trên hoặc dưới', isCorrect: false },
        ],
        correctAnswerLatex: ex.equalityCaseLatex || 'Thỏa mãn dấu đẳng thức điều kiện biên',
        explanationLatex: ex.solutionLatex,
        hints: ex.hints || [],
      }));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n`;
  xml += `  <question type="category">\n    <category>\n      <text>$course$/HSG_Toan/${topic.code}_${topic.title.replace(/[^a-zA-Z0-9_-]/g, '_')}</text>\n    </category>\n  </question>\n\n`;

  questions.forEach((q, idx) => {
    xml += `  <question type="multichoice">\n`;
    xml += `    <name>\n      <text>[${topic.code}] ${q.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>\n    </name>\n`;
    xml += `    <questiontext format="html">\n      <text><![CDATA[<p><strong>${q.title}</strong></p><p>$$${q.contentLatex}$$</p>]]></text>\n    </questiontext>\n`;
    xml += `    <generalfeedback format="html">\n      <text><![CDATA[<p><strong>Lời giải chi tiết:</strong></p><p>${q.explanationLatex}</p>]]></text>\n    </generalfeedback>\n`;
    xml += `    <defaultgrade>1.0000000</defaultgrade>\n`;
    xml += `    <penalty>0.3333333</penalty>\n`;
    xml += `    <single>true</single>\n`;
    xml += `    <shuffleanswers>true</shuffleanswers>\n`;
    xml += `    <answernumbering>abc</answernumbering>\n`;

    if (q.options && q.options.length > 0) {
      q.options.forEach((opt) => {
        const fraction = opt.isCorrect ? '100' : '0';
        xml += `    <answer fraction="${fraction}" format="html">\n`;
        xml += `      <text><![CDATA[$$${opt.latex}$$]]></text>\n`;
        xml += `      <feedback format="html">\n        <text><![CDATA[${opt.isCorrect ? 'Chính xác!' : 'Chưa chính xác.'}]]></text>\n      </feedback>\n`;
        xml += `    </answer>\n`;
      });
    }

    xml += `  </question>\n\n`;
  });

  xml += `</quiz>`;
  return xml;
}

export function exportToGiftFormat(topic: TopicCurriculum, quizQuestions?: QuizQuestion[]): string {
  const questions = quizQuestions && quizQuestions.length > 0 
    ? quizQuestions 
    : topic.step4Exercises.map((ex, idx) => ({
        id: ex.id,
        topicId: topic.id,
        title: `Bài ${idx + 1}: ${ex.title}`,
        contentLatex: ex.statementLatex,
        tier: ex.tier,
        type: 'multiple_choice' as const,
        options: [
          { id: 'opt-1', latex: ex.equalityCaseLatex || 'Thỏa mãn dấu đẳng thức điều kiện biên', isCorrect: true },
          { id: 'opt-2', latex: 'Không tồn tại nghiệm thỏa mãn', isCorrect: false },
          { id: 'opt-3', latex: 'Đẳng thức đạt được khi tất cả các biến bằng nhau', isCorrect: false },
        ],
        correctAnswerLatex: ex.equalityCaseLatex || 'Thỏa mãn',
        explanationLatex: ex.solutionLatex,
        hints: ex.hints || [],
      }));

  let gift = `// Ngân hàng câu hỏi HSG Toán - Chuyên đề: ${topic.title} (${topic.code})\n\n`;

  questions.forEach((q) => {
    gift += `::${q.title}:: [html]<p>$$${q.contentLatex}$$</p> {\n`;
    q.options?.forEach((opt) => {
      if (opt.isCorrect) {
        gift += `  =$$${opt.latex}$$ #Chính xác!\n`;
      } else {
        gift += `  ~$$${opt.latex}$$ #Chưa đúng\n`;
      }
    });
    gift += `}\n\n`;
  });

  return gift;
}

export function downloadMoodleXml(topic: TopicCurriculum, questions?: QuizQuestion[]) {
  const xml = exportToMoodleXml(topic, questions);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${topic.code}_Moodle_Quiz.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadGiftFile(topic: TopicCurriculum, questions?: QuizQuestion[]) {
  const gift = exportToGiftFormat(topic, questions);
  const blob = new Blob([gift], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${topic.code}_GIFT_Quiz.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
