import { TopicCurriculum } from '../types/math';

/**
 * Service to generate PowerPoint presentation slides (.pptx/.html slideshow)
 * for teaching Olympiad Math topics.
 */

export function generatePptxHtmlBlob(topic: TopicCurriculum): Blob {
  const branchLabels: Record<string, string> = {
    algebra: 'Đại số & Giải tích',
    geometry: 'Hình học phẳng & Không gian',
    number_theory: 'Số học & Đồng dư',
    combinatorics: 'Tổ hợp & Rời rạc',
    calculus_sequences: 'Giải tích & Dãy số',
  };

  const currentBranch = branchLabels[topic.mathBranch] || topic.mathBranch;

  const slidesHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Bài Giảng: ${topic.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      overflow-x: hidden;
    }
    .slide-deck {
      max-width: 1100px;
      margin: 0 auto;
      padding: 30px 15px;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    .slide {
      background: #1e293b;
      border-radius: 16px;
      padding: 40px 50px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      border: 1px solid #334155;
      min-height: 580px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }
    .slide::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    }
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      border-bottom: 1px solid #334155;
      padding-bottom: 16px;
    }
    .slide-title {
      font-size: 24px;
      font-weight: 800;
      color: #60a5fa;
      letter-spacing: -0.5px;
    }
    .slide-tag {
      background: #3b82f620;
      color: #93c5fd;
      border: 1px solid #3b82f650;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .slide-body {
      flex: 1;
      font-size: 16px;
      line-height: 1.7;
      color: #cbd5e1;
    }
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      border-top: 1px solid #334155;
      padding-top: 12px;
      font-size: 12px;
      color: #64748b;
    }
    .hero-slide {
      text-align: center;
      justify-content: center;
      align-items: center;
      background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
    }
    .hero-title {
      font-size: 36px;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 16px;
      line-height: 1.3;
      background: linear-gradient(135deg, #ffffff 0%, #93c5fd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 18px;
      color: #94a3b8;
      margin-bottom: 30px;
    }
    .meta-badges {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px;
    }
    .card-header {
      font-weight: 700;
      color: #e2e8f0;
      margin-bottom: 8px;
      font-size: 15px;
    }
    .formula-box {
      background: #090d16;
      border-left: 4px solid #3b82f6;
      padding: 12px 16px;
      border-radius: 6px;
      font-family: 'Cambria Math', monospace;
      color: #38bdf8;
      margin: 12px 0;
      font-size: 15px;
    }
    .hint-box {
      background: #854d0e20;
      border: 1px solid #eab30840;
      color: #fde047;
      padding: 12px;
      border-radius: 8px;
      margin-top: 12px;
      font-size: 14px;
    }
    @media print {
      body { background: white; color: black; }
      .slide { box-shadow: none; border: 1px solid #ccc; page-break-after: always; min-height: 100vh; }
      .slide-deck { padding: 0; gap: 0; }
    }
  </style>
</head>
<body>
  <div class="slide-deck">

    <!-- Slide 1: Bìa Bài Giảng -->
    <div class="slide hero-slide">
      <div class="slide-tag" style="margin-bottom: 20px;">BÀI GIẢNG CHUYÊN ĐỀ BỒI DƯỠNG HSG TOÁN THPT</div>
      <h1 class="hero-title">${topic.title.toUpperCase()}</h1>
      <p class="hero-subtitle">Mã chuyên đề: <strong>${topic.code}</strong> • Phân môn: <strong>${currentBranch}</strong> • Lớp <strong>${topic.grade}</strong></p>
      
      <div class="meta-badges">
        <span class="slide-tag">👨‍🏫 Giảng viên: ${topic.author}</span>
        <span class="slide-tag">🏫 Đơn vị: ${topic.school}</span>
        <span class="slide-tag">⏱ Thời lượng: ${topic.step1Pedagogy.estimatedHours || 6} tiết</span>
      </div>
      
      <div class="slide-footer" style="width: 100%; border: none;">
        <span>MathOlympiad Studio</span>
        <span>${new Date().toLocaleDateString('vi-VN')}</span>
      </div>
    </div>

    <!-- Slide 2: Mục Tiêu Sư Phạm -->
    <div class="slide">
      <div class="slide-header">
        <h2 class="slide-title">1. Mục Tiêu Sư Phạm & Khung Năng Lực</h2>
        <span class="slide-tag">Thang Bloom</span>
      </div>
      <div class="slide-body">
        <div class="card-grid">
          <div class="card" style="border-top: 3px solid #10b981;">
            <div class="card-header" style="color: #34d399;">🌱 Nhận Biết & Thông Hiểu</div>
            <ul style="padding-left: 20px; font-size: 14px;">
              ${topic.step1Pedagogy.cognitiveLevels.understanding.map(u => `<li>${u}</li>`).join('')}
            </ul>
          </div>
          <div class="card" style="border-top: 3px solid #3b82f6;">
            <div class="card-header" style="color: #60a5fa;">⚡ Vận Dụng & Vận Dụng Cao</div>
            <ul style="padding-left: 20px; font-size: 14px;">
              ${topic.step1Pedagogy.cognitiveLevels.highApplication.map(ha => `<li>${ha}</li>`).join('')}
            </ul>
          </div>
          <div class="card" style="border-top: 3px solid #ec4899;">
            <div class="card-header" style="color: #f472b6;">🏆 Sáng Tạo Olympic</div>
            <ul style="padding-left: 20px; font-size: 14px;">
              ${topic.step1Pedagogy.cognitiveLevels.creativeOlympiad?.map(co => `<li>${co}</li>`).join('') || '<li>Sáng tạo bài toán mới và mở rộng không gian n biến</li>'}
            </ul>
          </div>
        </div>
      </div>
      <div class="slide-footer">
        <span>${topic.title}</span>
        <span>Slide 2</span>
      </div>
    </div>

    <!-- Slide 3: Bản Đồ Logic -->
    <div class="slide">
      <div class="slide-header">
        <h2 class="slide-title">2. Bản Đồ Logic & 5 Chặng Tiếp Cận</h2>
        <span class="slide-tag">Lộ Trình Tư Duy</span>
      </div>
      <div class="slide-body">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${topic.step2Roadmap.map((node, i) => `
            <div style="display: flex; align-items: center; gap: 16px; background: #0f172a; padding: 12px 18px; border-radius: 10px; border-left: 4px solid #8b5cf6;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: #8b5cf630; color: #c084fc; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                ${node.order || i + 1}
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 700; color: #f1f5f9; font-size: 15px;">${node.title}</div>
                <div style="font-size: 13px; color: #94a3b8;">${node.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="slide-footer">
        <span>${topic.title}</span>
        <span>Slide 3</span>
      </div>
    </div>

    <!-- Slide 4+: Các Bổ Đề Then Chốt -->
    ${topic.step3Theory.keyLemmas.map((lemma, idx) => `
      <div class="slide">
        <div class="slide-header">
          <h2 class="slide-title">3.${idx + 1}. Bổ Đề Then Chốt: ${lemma.name}</h2>
          <span class="slide-tag">Bổ Đề #${idx + 1}</span>
        </div>
        <div class="slide-body">
          <div style="font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Phát biểu bổ đề:</div>
          <div class="formula-box">${lemma.statementLatex}</div>
          
          <div style="font-weight: 700; color: #cbd5e1; margin-top: 14px; margin-bottom: 6px;">Điểm mấu chốt sư phạm:</div>
          <p style="font-size: 14px; color: #94a3b8;">${lemma.pedagogyNotes || 'Nhận diện điểm mấu chốt để áp dụng trong các kỳ thi học sinh giỏi.'}</p>
          
          ${lemma.commonTraps && lemma.commonTraps.length > 0 ? `
            <div class="hint-box" style="background: #ef444415; border-color: #ef444440; color: #fca5a5;">
              <strong>⚠ Bẫy học sinh hay mắc:</strong> ${lemma.commonTraps.join('; ')}
            </div>
          ` : ''}
        </div>
        <div class="slide-footer">
          <span>Lý thuyết chuyên sâu</span>
          <span>Slide ${4 + idx}</span>
        </div>
      </div>
    `).join('')}

    <!-- Slide Exercises: Bài Tập Phân Tầng -->
    ${topic.step4Exercises.map((ex, idx) => `
      <div class="slide">
        <div class="slide-header">
          <h2 class="slide-title">Bài ${idx + 1}: ${ex.title}</h2>
          <span class="slide-tag" style="background: ${ex.tier === 'tier_3' ? '#ef444420' : '#3b82f620'}; color: ${ex.tier === 'tier_3' ? '#fca5a5' : '#93c5fd'};">
            ${ex.tier === 'tier_1' ? 'Tầng 1: Nền tảng' : ex.tier === 'tier_2' ? 'Tầng 2: HSG Tỉnh' : 'Tầng 3: Olympic VMO'}
          </span>
        </div>
        <div class="slide-body">
          <div style="font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Đề bài toán:</div>
          <div class="formula-box">${ex.statementLatex}</div>
          
          <div style="font-weight: 700; color: #38bdf8; margin-top: 12px;">💡 Định hướng tiếp cận:</div>
          <p style="font-size: 14px; color: #cbd5e1;">${ex.pedagogicalIdea || 'Phân tích các đối tượng toán học và điều kiện biên.'}</p>
          
          ${ex.hints && ex.hints.length > 0 ? `
            <div class="hint-box">
              <strong>Gợi ý giải bài:</strong>
              <ul style="padding-left: 18px; margin-top: 4px;">
                ${ex.hints.map(h => `<li>${h}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        <div class="slide-footer">
          <span>Hệ thống bài tập phân tầng</span>
          <span>Bài ${idx + 1} / ${topic.step4Exercises.length}</span>
        </div>
      </div>
    `).join('')}

  </div>
</body>
</html>
  `;

  return new Blob([slidesHtml], { type: 'text/html;charset=utf-8;' });
}

export function downloadPptxPresentation(topic: TopicCurriculum) {
  const blob = generatePptxHtmlBlob(topic);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${topic.code || 'CD'}_Slide_BaiGiang_${topic.title.replace(/[\s/\\:*?"<>|]/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
