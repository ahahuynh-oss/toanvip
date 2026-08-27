import { TopicCurriculum } from '../types/math';

/**
 * Service to generate rich, professional Microsoft Word documents (.doc/.docx)
 * Formatted with educational typography, callout boxes, headers, footers, and tables.
 */

export function generateWordDocumentBlob(topic: TopicCurriculum): Blob {
  const branchLabels: Record<string, string> = {
    algebra: 'Đại số & Giải tích',
    geometry: 'Hình học phẳng & Không gian',
    number_theory: 'Số học & Đồng dư',
    combinatorics: 'Tổ hợp & Rời rạc',
    calculus_sequences: 'Giải tích & Dãy số',
  };

  const levelLabels: Record<string, string> = {
    school_team: 'Học sinh Giỏi Cấp Trường',
    provincial_hsg: 'Học sinh Giỏi Cấp Tỉnh/Thành phố',
    thpt_qg_vdc: 'Ôn thi THPT Quốc Gia (Mức độ Vận Dụng Cao)',
    national_vmo: 'Học sinh Giỏi Quốc Gia (VMO)',
    tst_olympiad: 'Tuyển chọn Đội tuyển Olympic (TST)',
  };

  const currentBranch = branchLabels[topic.mathBranch] || topic.mathBranch;
  const currentLevel = levelLabels[topic.targetLevel] || topic.targetLevel;

  const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${topic.title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4;
      margin: 20mm 20mm 20mm 20mm;
      mso-header-margin: 36pt;
      mso-footer-margin: 36pt;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.5;
      color: #1e293b;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20pt;
    }
    .header-table td {
      border: none;
      vertical-align: top;
      font-size: 11pt;
    }
    .doc-title {
      text-align: center;
      color: #1e3a8a;
      font-size: 20pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 15pt 0 5pt 0;
    }
    .doc-subtitle {
      text-align: center;
      color: #475569;
      font-size: 13pt;
      font-style: italic;
      margin-bottom: 20pt;
    }
    .meta-box {
      background-color: #f8fafc;
      border: 1.5pt solid #cbd5e1;
      padding: 10pt;
      margin-bottom: 20pt;
      border-radius: 4pt;
    }
    .meta-box table {
      width: 100%;
      border-collapse: collapse;
    }
    .meta-box td {
      border: none;
      padding: 3pt 6pt;
      font-size: 11pt;
    }
    h2 {
      color: #1e3a8a;
      font-size: 14pt;
      text-transform: uppercase;
      border-bottom: 2pt solid #1e3a8a;
      padding-bottom: 3pt;
      margin-top: 20pt;
      margin-bottom: 10pt;
    }
    h3 {
      color: #0f172a;
      font-size: 13pt;
      margin-top: 14pt;
      margin-bottom: 6pt;
    }
    .box-lemma {
      background-color: #faf5ff;
      border-left: 4pt solid #7c3aed;
      border-top: 1pt solid #e9d5ff;
      border-right: 1pt solid #e9d5ff;
      border-bottom: 1pt solid #e9d5ff;
      padding: 10pt;
      margin: 12pt 0;
    }
    .box-problem {
      background-color: #f0f9ff;
      border-left: 4pt solid #0284c7;
      border-top: 1pt solid #bae6fd;
      border-right: 1pt solid #bae6fd;
      border-bottom: 1pt solid #bae6fd;
      padding: 10pt;
      margin: 14pt 0;
    }
    .box-evolution {
      background-color: #fdf2f8;
      border-left: 4pt solid #db2777;
      border-top: 1pt solid #fbcfe8;
      border-right: 1pt solid #fbcfe8;
      border-bottom: 1pt solid #fbcfe8;
      padding: 10pt;
      margin: 12pt 0;
    }
    .badge {
      display: inline-block;
      font-size: 10pt;
      font-weight: bold;
      padding: 2pt 6pt;
      border-radius: 3pt;
      color: white;
    }
    .badge-tier1 { background-color: #0d9488; }
    .badge-tier2 { background-color: #2563eb; }
    .badge-tier3 { background-color: #dc2626; }
    .table-custom {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0;
    }
    .table-custom th {
      background-color: #1e3a8a;
      color: white;
      font-weight: bold;
      border: 1pt solid #1e3a8a;
      padding: 6pt;
      text-align: left;
      font-size: 11pt;
    }
    .table-custom td {
      border: 1pt solid #cbd5e1;
      padding: 6pt;
      font-size: 11pt;
    }
    .table-custom tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .math-formula {
      font-family: 'Cambria Math', 'Times New Roman', serif;
      background-color: #f1f5f9;
      padding: 4pt 8pt;
      display: block;
      margin: 5pt 0;
      border-radius: 3pt;
    }
    .footer-sign {
      margin-top: 30pt;
      width: 100%;
    }
    .footer-sign td {
      border: none;
      vertical-align: top;
      text-align: center;
      font-size: 12pt;
    }
  </style>
</head>
<body>

  <!-- Bìa đầu tài liệu -->
  <table class="header-table">
    <tr>
      <td style="width: 50%; text-align: center;">
        <strong>SỞ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>
        <strong>${topic.school ? topic.school.toUpperCase() : 'TRƯỜNG THPT CHUYÊN'}</strong><br/>
        <strong>TỔ CHUYÊN MÔN TOÁN</strong><br/>
        ---------------------
      </td>
      <td style="width: 50%; text-align: center;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
        <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
        ---------------------
      </td>
    </tr>
  </table>

  <div class="doc-title">TÀI LIỆU CHUYÊN ĐỀ BỒI DƯỠNG HSG TOÁN THPT</div>
  <div class="doc-subtitle">Chuyên đề: <strong>${topic.title}</strong></div>

  <!-- Hộp thông tin chuyên đề -->
  <div class="meta-box">
    <table>
      <tr>
        <td style="width: 50%;"><strong>Mã Chuyên Đề:</strong> ${topic.code}</td>
        <td style="width: 50%;"><strong>Khối Lớp:</strong> Lớp ${topic.grade}</td>
      </tr>
      <tr>
        <td><strong>Phân Môn:</strong> ${currentBranch}</td>
        <td><strong>Cấp Độ Bồi Dưỡng:</strong> ${currentLevel}</td>
      </tr>
      <tr>
        <td><strong>Giáo Viên Biên Soạn:</strong> ${topic.author}</td>
        <td><strong>Thời Lượng Dự Kiến:</strong> ${topic.step1Pedagogy.estimatedHours || 6} tiết</td>
      </tr>
    </table>
  </div>

  <!-- PHẦN I: MỤC TIÊU SƯ PHẠM VÀ BẢN ĐỒ TRI THỨC -->
  <h2>I. MỤC TIÊU SƯ PHẠM VÀ MA TRẬN NĂNG LỰC</h2>
  <p>Chuyên đề được thiết kế theo thang đo nhận thức và chuẩn phát triển năng lực tư duy toán học:</p>
  
  <table class="table-custom">
    <thead>
      <tr>
        <th style="width: 25%;">Cấp Độ Nhận Thức</th>
        <th style="width: 75%;">Mục Tiêu Năng Lực Cần Đạt</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Nhận biết</strong></td>
        <td>${topic.step1Pedagogy.cognitiveLevels.knowledge.join('; ') || 'Nắm vững định nghĩa và các điều kiện cơ bản.'}</td>
      </tr>
      <tr>
        <td><strong>2. Thông hiểu</strong></td>
        <td>${topic.step1Pedagogy.cognitiveLevels.understanding.join('; ') || 'Hiểu bản chất chứng minh và nhận diện mô hình.'}</td>
      </tr>
      <tr>
        <td><strong>3. Vận dụng</strong></td>
        <td>${topic.step1Pedagogy.cognitiveLevels.application.join('; ') || 'Áp dụng vào các bài toán phân loại cấp trường/tỉnh.'}</td>
      </tr>
      <tr>
        <td><strong>4. Vận dụng cao</strong></td>
        <td>${topic.step1Pedagogy.cognitiveLevels.highApplication.join('; ') || 'Xử lý các tình huống phức tạp trong đề thi HSG Quốc gia.'}</td>
      </tr>
      <tr>
        <td><strong>5. Sáng tạo Olympic</strong></td>
        <td>${topic.step1Pedagogy.cognitiveLevels.creativeOlympiad?.join('; ') || 'Phát triển bài toán mới, tìm kiếm bất biến và mở rộng n biến.'}</td>
      </tr>
    </tbody>
  </table>

  <!-- PHẦN II: LỘ TRÌNH TƯ DUY 5 CHẶNG -->
  <h2>II. BẢN ĐỒ LOGIC & LỘ TRÌNH TIẾP CẬN</h2>
  <table class="table-custom">
    <thead>
      <tr>
        <th style="width: 10%; text-align: center;">Chặng</th>
        <th style="width: 30%;">Nội Dung Trọng Tâm</th>
        <th style="width: 60%;">Mô Tả Sư Phạm & Điểm Nhấn</th>
      </tr>
    </thead>
    <tbody>
      ${topic.step2Roadmap
        .map(
          (node, idx) => `
        <tr>
          <td style="text-align: center;"><strong>${node.order || idx + 1}</strong></td>
          <td><strong>${node.title}</strong><br/><small style="color:#64748b;">(${node.type})</small></td>
          <td>${node.description} ${node.latexSummary ? `<br/><span class="math-formula">${node.latexSummary}</span>` : ''}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <!-- PHẦN III: LÝ THUYẾT CHUYÊN SÂU & HỆ THỐNG BỔ ĐỀ -->
  <h2>III. LÝ THUYẾT CHUYÊN SÂU & HỆ THỐNG BỔ ĐỀ THEN CHỐT</h2>
  <div style="margin-bottom: 12pt;">
    ${topic.step3Theory.overviewMarkdown ? `<p>${topic.step3Theory.overviewMarkdown.replace(/\n/g, '<br/>')}</p>` : ''}
    ${topic.step3Theory.coreTheoremsLatex ? `<div class="math-formula"><strong>Định lý trọng tâm:</strong><br/>${topic.step3Theory.coreTheoremsLatex}</div>` : ''}
  </div>

  ${topic.step3Theory.keyLemmas
    .map(
      (lemma, i) => `
    <div class="box-lemma">
      <h3 style="color:#6b21a8; margin-top:0;">Bổ đề ${i + 1}: ${lemma.name}</h3>
      <p><strong>Phát biểu:</strong></p>
      <div class="math-formula">${lemma.statementLatex}</div>
      <p><strong>Chứng minh:</strong></p>
      <p>${lemma.proofLatex ? lemma.proofLatex.replace(/\n/g, '<br/>') : 'Học sinh tự chứng minh như bài tập rèn luyện.'}</p>
      <p><strong>Ý nghĩa sư phạm:</strong> ${lemma.pedagogyNotes || 'Nhận diện điểm mấu chốt để phân tích đề thi.'}</p>
      ${
        lemma.commonTraps && lemma.commonTraps.length > 0
          ? `<p><strong style="color:#b91c1c;">⚠ Bẫy học sinh hay mắc:</strong> ${lemma.commonTraps.join('; ')}</p>`
          : ''
      }
    </div>
  `
    )
    .join('')}

  <!-- PHẦN IV: HỆ THỐNG BÀI TẬP PHÂN TẦNG -->
  <h2>IV. HỆ THỐNG BÀI TẬP PHÂN TẦNG VÀ LỜI GIẢI CHI TIẾT</h2>
  ${topic.step4Exercises
    .map((ex, idx) => {
      const tierBadge =
        ex.tier === 'tier_1'
          ? '<span class="badge badge-tier1">Tầng 1: Nền tảng chuyên</span>'
          : ex.tier === 'tier_2'
          ? '<span class="badge badge-tier2">Tầng 2: HSG Tỉnh/Thành</span>'
          : '<span class="badge badge-tier3">Tầng 3: Vận dụng cao (VMO)</span>';

      return `
      <div class="box-problem">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6pt;">
          <h3 style="color:#0369a1; margin:0;">Bài ${idx + 1}: ${ex.title}</h3>
          ${tierBadge}
        </div>
        ${ex.source ? `<p style="font-size:10pt; color:#64748b; margin-top:0;"><em>Nguồn bài: ${ex.source}</em></p>` : ''}
        <p><strong>Đề bài:</strong></p>
        <div class="math-formula">${ex.statementLatex}</div>
        
        <p><strong>💡 Định hướng tiếp cận sư phạm:</strong> ${ex.pedagogicalIdea || 'Phân tích các yếu tố đối xứng và bất biến.'}</p>
        
        ${
          ex.hints && ex.hints.length > 0
            ? `<p><strong>Gợi ý phân tầng:</strong></p>
               <ul>${ex.hints.map((h) => `<li>${h}</li>`).join('')}</ul>`
            : ''
        }

        <p><strong>Lời giải chi tiết:</strong></p>
        <div style="background-color:#ffffff; border:1pt solid #e2e8f0; padding:8pt; border-radius:3pt;">
          ${ex.solutionLatex ? ex.solutionLatex.replace(/\n/g, '<br/>') : 'Đang hoàn thiện...'}
        </div>

        ${ex.equalityCaseLatex ? `<p style="margin-top:6pt;"><strong>Đẳng thức đạt được khi:</strong> <span class="math-formula">${ex.equalityCaseLatex}</span></p>` : ''}
        ${ex.generalizationNotes ? `<p><strong>Khai thác & Mở rộng:</strong> ${ex.generalizationNotes}</p>` : ''}
      </div>
    `;
    })
    .join('')}

  <!-- PHẦN V: BIẾN THỂ PHÁT TRIỂN TƯ DUY SÂU -->
  ${
    topic.step5Evolutions && topic.step5Evolutions.length > 0
      ? `
    <h2>V. BIẾN THỂ PHÁT TRIỂN TƯ DUY SÂU (EVOLUTION ENGINE)</h2>
    ${topic.step5Evolutions
      .map(
        (evo, eIdx) => `
      <div style="margin-bottom: 15pt;">
        <h3>Mô hình phát triển ${eIdx + 1}: Bài toán gốc</h3>
        <div class="math-formula">${evo.originalProblem}</div>
        ${evo.variants
          .map(
            (v, vIdx) => `
          <div class="box-evolution">
            <h4 style="color:#be185d; margin:0 0 4pt 0;">Biến thể ${vIdx + 1} (${v.strategyName || v.strategy}) - Điểm khó: ${v.difficultyScore || 8}/10</h4>
            <p><strong>Đề bài biến thể:</strong></p>
            <div class="math-formula">${v.statementLatex}</div>
            <p><strong>Ý nghĩa sư phạm:</strong> ${v.pedagogyRationale || 'Kích thích năng lực mô hình hóa toán học.'}</p>
            <p><strong>Lời giải tóm tắt:</strong> ${v.solutionLatex ? v.solutionLatex.replace(/\n/g, '<br/>') : ''}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `
      )
      .join('')}
  `
      : ''
  }

  <!-- CHỮ KÝ VÀ NGÀY THÁNG -->
  <table class="footer-sign">
    <tr>
      <td style="width: 50%;">
        <em>Phê duyệt của Tổ Chuyên Môn</em><br/>
        (Ký và ghi rõ họ tên)<br/><br/><br/><br/>
        <strong>................................................</strong>
      </td>
      <td style="width: 50%;">
        <em>Ngày ...... tháng ...... năm 202...</em><br/>
        <strong>Giáo viên biên soạn</strong><br/><br/><br/><br/>
        <strong>${topic.author}</strong>
      </td>
    </tr>
  </table>

</body>
</html>
`;

  return new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8;',
  });
}

export function downloadWordDocument(topic: TopicCurriculum) {
  const blob = generateWordDocumentBlob(topic);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${topic.code || 'CD'}_${topic.title.replace(/[\s/\\:*?"<>|]/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
