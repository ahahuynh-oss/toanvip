import { TopicCurriculum, QuizQuestion } from '../types/math';

export const DEFAULT_TOPICS: TopicCurriculum[] = [
  {
    id: 'topic-cauchy-schwarz-engel',
    title: 'Kỹ Thuật Phân Tách Điểm Rơi và Bổ Đề Cauchy-Schwarz Dạng Engel Trong Bất Đẳng Thức HSG',
    code: 'CD-BĐT-01',
    grade: '10',
    mathBranch: 'algebra',
    targetLevel: 'provincial_hsg',
    author: 'Huỳnh Thị Hà',
    school: 'Trường THPT Hà Huy Tập',
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
    step1Pedagogy: {
      cognitiveLevels: {
        knowledge: [
          'Nắm vững phát biểu đại số và dạng phân thức Engel của BĐT Cauchy-Schwarz',
          'Nhận biết các biểu thức dạng tổng phân thức đối xứng và hoán vị',
        ],
        understanding: [
          'Hiểu nguyên lý ghép cặp tham số đối xứng để triệt tiêu biến ở mẫu',
          'Phân tích được cấu trúc vi phân và sự cân bằng bậc giữa tử và mẫu',
        ],
        application: [
          'Áp dụng thành thạo kỹ thuật cộng mẫu Engel cho $n=3$ và $n=4$ biến',
          'Kỹ thuật thêm bớt hạng tử tự do để cân bằng điểm rơi bất đối xứng',
        ],
        highApplication: [
          'Kết hợp Cauchy-Schwarz với các kỹ thuật đổi biến $p, q, r$ hoặc chuẩn hóa',
          'Xử lý các bài toán có điều kiện ràng buộc tích hoặc tổng nghịch đảo',
        ],
        creativeOlympiad: [
          'Phát triển bất đẳng thức từ mô hình tích phân hoặc hình học không gian',
          'Sáng tạo các biến thể $n$ biến và chứng minh bằng quy nạp Cauchy',
        ],
      },
      keyCompetencies: [
        'Tư duy phân tích điểm rơi vi mô',
        'Năng lực dự đoán đẳng thức & phản chứng',
        'Kỹ năng biến đổi đại số tinh gọn',
      ],
      estimatedHours: 6,
      prerequisites: [
        'Bất đẳng thức AM-GM cơ bản',
        'Kỹ năng hằng đẳng thức đáng nhớ',
        'Khái niệm điểm rơi trong bài toán cực trị',
      ],
    },
    step2Roadmap: [
      {
        id: 'r1',
        title: 'BĐT Bunhiacopxki (Cauchy-Schwarz) Dạng Tổng Quát',
        type: 'prerequisite',
        description: 'Phát biểu tổng quát cho hai bộ $n$ số thực $(a_1, ..., a_n)$ và $(b_1, ..., b_n)$',
        latexSummary: '(\\sum a_i b_i)^2 \\le (\\sum a_i^2)(\\sum b_i^2)',
        order: 1,
      },
      {
        id: 'r2',
        title: 'Bổ Đề Engel (Cauchy-Schwarz Dạng Phân Thức)',
        type: 'core_theorem',
        description: 'Dạng cộng mẫu số dương thuận tiện cho việc đánh giá phân thức',
        latexSummary: '\\frac{a_1^2}{x_1} + \\frac{a_2^2}{x_2} + \\dots + \\frac{a_n^2}{x_n} \\ge \\frac{(a_1+a_2+\\dots+a_n)^2}{x_1+x_2+\\dots+x_n}',
        order: 2,
      },
      {
        id: 'r3',
        title: 'Kỹ Thuật Đánh Giá Điểm Rơi Bất Đối Xứng',
        type: 'technique',
        description: 'Xác định hệ số cân bằng $\\alpha, \\beta, \\gamma$ sao cho dấu bằng xảy ra đồng thời',
        latexSummary: '\\frac{a_i^2}{x_i} + \\alpha^2 x_i \\ge 2\\alpha a_i',
        order: 3,
      },
      {
        id: 'r4',
        title: 'Kỹ Thuật Ghép Cặp & Thêm Bớt Nghịch Đảo',
        type: 'technique',
        description: 'Biến đổi phân thức phức tạp về dạng cộng mẫu thông qua phép trừ hằng số',
        latexSummary: '\\frac{x^3}{x^2+y^2} = x - \\frac{xy^2}{x^2+y^2}',
        order: 4,
      },
      {
        id: 'r5',
        title: 'Tổng Quát Hóa & Ứng Dụng Trong Đề Thi HSG Quốc Gia (VMO)',
        type: 'generalization',
        description: 'Mở rộng lên không gian đa biến và kết hợp điều kiện ràng buộc phi tuyến',
        latexSummary: '\\sum_{i=1}^n \\frac{x_i^k}{\\prod_{j \\ne i} (x_i + x_j)} \\ge \\dots',
        order: 5,
      },
    ],
    step3Theory: {
      overviewMarkdown: `### 1. Giới thiệu chuyên đề
Bất đẳng thức Cauchy-Schwarz dạng phân thức (thường gọi là **Bổ đề Engel** hoặc **BĐT Schwarz**) là một trong những công cụ sắc bén nhất trong các kỳ thi Học sinh Giỏi môn Toán THPT.

### 2. Định lý & Phát biểu cốt lõi
Cho hai dãy số thực $a_1, a_2, \\dots, a_n$ và $x_1, x_2, \\dots, x_n > 0$. Khi đó:
$$\\frac{a_1^2}{x_1} + \\frac{a_2^2}{x_2} + \\dots + \\frac{a_n^2}{x_n} \\ge \\frac{(a_1 + a_2 + \\dots + a_n)^2}{x_1 + x_2 + \\dots + x_n}$$

**Đẳng thức xảy ra** khi và chỉ khi $\\frac{a_1}{x_1} = \\frac{a_2}{x_2} = \\dots = \\frac{a_n}{x_n}$.

### 3. Phương pháp tư duy sư phạm
1. **Nhận dạng mẫu số:** Mẫu số phải hoàn toàn dương trên toàn miền xác định.
2. **Chuẩn hóa tử số:** Đưa tử số về dạng bình phương hoàn chỉnh $(a_i)^2$. Nếu tử số bậc 1, ta nhân thêm lượng thích hợp $a = \\frac{a^2}{a}$.
3. **Phân tích điểm rơi:** Khi giả thiết cho các biến không đối xứng (ví dụ $2a + 3b + c = 6$), phải tìm nghiệm cực trị trước để chọn các hệ số $k_i$ thích hợp trong phép cộng mẫu $\\frac{(k_1 a)^2}{x_1} + \\dots$`,
      coreTheoremsLatex: `\\begin{theorem}[Bổ đề Cauchy-Schwarz dạng Engel]
Cho $a_1, a_2, \\dots, a_n \\in \\mathbb{R}$ và $x_1, x_2, \\dots, x_n > 0$. Ta luôn có:
$$\\sum_{i=1}^n \\frac{a_i^2}{x_i} \\ge \\frac{\\left(\\sum_{i=1}^n a_i\\right)^2}{\\sum_{i=1}^n x_i}$$
Dấu đẳng thức xảy ra $\\iff \\frac{a_1}{x_1} = \\frac{a_2}{x_2} = \\dots = \\frac{a_n}{x_n}$.
\\end{theorem}`,
      keyLemmas: [
        {
          id: 'lem-1',
          name: 'Bổ đề phân thức đối xứng bậc 2',
          statementLatex: '\\text{Với } a, b, c > 0 \\text{ và } abc = 1, \\text{ ta có: } \\frac{1}{a^3(b+c)} + \\frac{1}{b^3(c+a)} + \\frac{1}{c^3(a+b)} \\ge \\frac{3}{2}',
          proofLatex: `Đặt $x = \\frac{1}{a}, y = \\frac{1}{b}, z = \\frac{1}{c} \\implies xyz = 1$.
Biểu thức vế trái trở thành:
$$P = \\frac{x^2}{y+z} + \\frac{y^2}{z+x} + \\frac{z^2}{x+y}$$
Áp dụng Bổ đề Engel:
$$P \\ge \\frac{(x+y+z)^2}{2(x+y+z)} = \\frac{x+y+z}{2}$$
Theo AM-GM cho 3 số dương: $x+y+z \\ge 3\\sqrt[3]{xyz} = 3$.
Suy ra $P \\ge \\frac{3}{2}$. Đẳng thức xảy ra khi $x=y=z=1 \\iff a=b=c=1$.`,
          pedagogyNotes: 'Dạy học sinh kỹ năng đảo biến $x = 1/a$ để chuyển bài toán từ mẫu phức tạp sang dạng chuẩn Engel.',
          commonTraps: [
            'Học sinh vội vàng cộng mẫu ngay khi tử số chưa phải là bình phương',
            'Quên kiểm tra điều kiện $a, b, c > 0$ trước khi đổi biến',
          ],
        },
        {
          id: 'lem-2',
          name: 'Bổ đề tách ghép tham số điểm rơi bất đối xứng',
          statementLatex: '\\text{Cho } a, b, c > 0 \\text{ thỏa mãn } a + 2b + 3c \\ge 20. \\text{ Tìm GTNN của } P = a + b + c + \\frac{3}{a} + \\frac{9}{2b} + \\frac{4}{c}',
          proofLatex: `Dự đoán điểm rơi tại $a = 2, b = 3, c = 4$ (khi đó $a + 2b + 3c = 2 + 6 + 12 = 20$).
Tách các nhóm để dấu đẳng thức xảy ra tại điểm rơi:
$$P = \\left(\\frac{3a}{4} + \\frac{3}{a}\\right) + \\left(\\frac{b}{2} + \\frac{9}{2b}\\right) + \\left(\\frac{c}{4} + \\frac{4}{c}\\right) + \\frac{1}{4}(a + 2b + 3c)$$
Áp dụng AM-GM cho từng cặp:
$$\\frac{3a}{4} + \\frac{3}{a} \\ge 2\\sqrt{\\frac{9}{4}} = 3$$
$$\\frac{b}{2} + \\frac{9}{2b} \\ge 2\\sqrt{\\frac{9}{4}} = 3$$
$$\\frac{c}{4} + \\frac{4}{c} \\ge 2\\sqrt{1} = 2$$
Do $a + 2b + 3c \\ge 20 \\implies \\frac{1}{4}(a + 2b + 3c) \\ge 5$.
Cộng vế theo vế ta được $P \\ge 3 + 3 + 2 + 5 = 13$.
Dấu đẳng thức xảy ra khi $a=2, b=3, c=4$.`,
          pedagogyNotes: 'Minh họa phương pháp tìm điểm rơi bằng hệ số bất định trước khi tiến hành chia tách hạng tử.',
          commonTraps: [
            'Tự ý giả sử $a=b=c$ dẫn đến dấu bằng không thể xảy ra đồng thời',
            'Sử dụng BĐT ngược chiều đối với điều kiện ràng buộc',
          ],
        },
      ],
    },
    step4Exercises: [
      {
        id: 'ex-1',
        tier: 'tier_1',
        title: 'Bài toán Nesbitt 3 biến kinh điển & Các góc nhìn sư phạm',
        statementLatex: '\\text{Cho } a, b, c > 0. \\text{ Chứng minh rằng: } \\frac{a}{b+c} + \\frac{b}{c+a} + \\frac{c}{a+b} \\ge \\frac{3}{2}',
        pedagogicalIdea: 'Biến đổi nhân tử số và mẫu số để đưa về dạng bình phương ở tử số trước khi áp dụng Bổ đề Engel.',
        hints: [
          'Nhân cả tử và mẫu của mỗi phân thức với chính tử số đó: $\\frac{a}{b+c} = \\frac{a^2}{ab+ca}$.',
          'Áp dụng Bổ đề Engel cho vế trái với các mẫu số $ab+ca, bc+ab, ca+bc$.',
        ],
        solutionLatex: `Ta có vế trái:
$$VT = \\frac{a^2}{ab+ca} + \\frac{b^2}{bc+ab} + \\frac{c^2}{ca+bc}$$
Áp dụng Bổ đề Cauchy-Schwarz dạng Engel:
$$VT \\ge \\frac{(a+b+c)^2}{(ab+ca) + (bc+ab) + (ca+bc)} = \\frac{a^2+b^2+c^2+2(ab+bc+ca)}{2(ab+bc+ca)}$$
Do $a^2+b^2+c^2 \\ge ab+bc+ca$, ta suy ra:
$$VT \\ge \\frac{(ab+bc+ca) + 2(ab+bc+ca)}{2(ab+bc+ca)} = \\frac{3(ab+bc+ca)}{2(ab+bc+ca)} = \\frac{3}{2}$$
Đẳng thức xảy ra $\\iff a=b=c > 0$. Bài toán được chứng minh.`,
        equalityCaseLatex: 'a = b = c > 0',
        generalizationNotes: 'Có thể mở rộng cho $n$ biến theo BĐT Shapiro hoặc xét với số mũ lũy thừa.',
        source: 'BĐT Nesbitt (1903) - Tuyển tập Đề thi Chuyên Toán',
      },
      {
        id: 'ex-2',
        tier: 'tier_2',
        title: 'Bất đẳng thức phân thức đối xứng có điều kiện tích',
        statementLatex: '\\text{Cho } a, b, c > 0 \\text{ thỏa mãn } a+b+c = 3. \\text{ Chứng minh rằng: } \\frac{a}{1+b^2} + \\frac{b}{1+c^2} + \\frac{c}{1+a^2} \\ge \\frac{3}{2}',
        pedagogicalIdea: 'Sử dụng kỹ thuật Cô-si ngược dấu kết hợp Cauchy-Schwarz để chuyển biến từ mẫu lên tử.',
        hints: [
          'Quan sát rằng $\\frac{a}{1+b^2} = a - \\frac{ab^2}{1+b^2}$.',
          'Đánh giá mẫu số bằng AM-GM: $1+b^2 \\ge 2b$.',
        ],
        solutionLatex: `Áp dụng kỹ thuật Cô-si ngược dấu:
$$\\frac{a}{1+b^2} = \\frac{a(1+b^2) - ab^2}{1+b^2} = a - \\frac{ab^2}{1+b^2}$$
Vì $b > 0$, theo BĐT AM-GM ta có $1+b^2 \\ge 2b$. Suy ra:
$$\\frac{ab^2}{1+b^2} \\le \\frac{ab^2}{2b} = \\frac{ab}{2}$$
Do đó:
$$\\frac{a}{1+b^2} \\ge a - \\frac{ab}{2}$$
Tương tự cho các số hạng còn lại, cộng vế theo vế ta được:
$$VT \\ge (a+b+c) - \\frac{ab+bc+ca}{2}$$
Mặt khác, $(a+b+c)^2 \\ge 3(ab+bc+ca) \\implies ab+bc+ca \\le \\frac{3^2}{3} = 3$.
Suy ra:
$$VT \\ge 3 - \\frac{3}{2} = \\frac{3}{2}$$
Đẳng thức xảy ra khi và chỉ khi $a=b=c=1$.`,
        equalityCaseLatex: 'a = b = c = 1',
        generalizationNotes: 'Kỹ thuật Cô-si ngược dấu là cầu nối mạnh mẽ khi gặp mẫu số có dạng $1 + x^k$.',
        source: 'Đề thi HSG Thành Phố Hà Nội - Bảng A',
      },
      {
        id: 'ex-3',
        tier: 'tier_3',
        title: 'Đánh giá bất đẳng thức phân thức bậc cao trong đề thi VMO',
        statementLatex: '\\text{Cho các số thực dương } a, b, c \\text{ thỏa mãn } a^2+b^2+c^2 = 3. \\text{ Chứng minh rằng: } \\frac{a^3}{\\sqrt{b^2+3}} + \\frac{b^3}{\\sqrt{c^2+3}} + \\frac{c^3}{\\sqrt{a^2+3}} \\ge \\frac{3}{2}',
        pedagogicalIdea: 'Phối hợp Bổ đề Engel cho biểu thức chứa căn với phương pháp cân bằng bậc và AM-GM 3 số.',
        hints: [
          'Biến đổi tử số thành $\\frac{a^4}{a\\sqrt{b^2+3}}$ để sẵn sàng cộng mẫu Engel.',
          'Sau khi cộng mẫu, dùng AM-GM đánh giá tổng mẫu số: $a\\sqrt{b^2+3} = a\\sqrt{b^2+1+1+1}$.',
        ],
        solutionLatex: `Viết lại vế trái:
$$P = \\frac{a^4}{a\\sqrt{b^2+3}} + \\frac{b^4}{b\\sqrt{c^2+3}} + \\frac{c^4}{c\\sqrt{a^2+3}}$$
Theo Bổ đề Cauchy-Schwarz dạng Engel:
$$P \\ge \\frac{(a^2+b^2+c^2)^2}{a\\sqrt{b^2+3} + b\\sqrt{c^2+3} + c\\sqrt{a^2+3}} = \\frac{9}{a\\sqrt{b^2+3} + b\\sqrt{c^2+3} + c\\sqrt{a^2+3}}$$
Ta cần đánh giá mẫu số $M = a\\sqrt{b^2+3} + b\\sqrt{c^2+3} + c\\sqrt{a^2+3}$.
Áp dụng BĐT AM-GM cho biểu thức có căn:
$$a\\sqrt{b^2+3} = a\\sqrt{(b^2+3) \\cdot 4} \\cdot \\frac{1}{2} \\le \\frac{a(b^2+3+4)}{4} = \\frac{ab^2 + 7a}{4}$$
(Cách 2 chặt hơn: Áp dụng Cauchy-Schwarz trực tiếp cho $M$):
$$M^2 \\le (a^2+b^2+c^2)(b^2+3+c^2+3+a^2+3) = 3 \\cdot (3 + 9) = 36 \\implies M \\le 6$$
Thay vào biểu thức của $P$:
$$P \\ge \\frac{9}{6} = \\frac{3}{2}$$
Đẳng thức xảy ra khi $a=b=c=1$. Chứng minh hoàn tất.`,
        equalityCaseLatex: 'a = b = c = 1',
        generalizationNotes: 'Mô hình tổng quát: $\\sum \\frac{x_i^{k}}{\\sqrt{x_{i+1}^m + C}}$.',
        source: 'Chọn Đội Tuyển VMO - Khối THPT Chuyên KHTN',
      },
    ],
    step5Evolutions: [
      {
        id: 'evo-1',
        originalProblem: 'Cho a, b, c > 0 thỏa mãn a+b+c=3. Chứng minh: \\frac{a}{1+b^2} + \\frac{b}{1+c^2} + \\frac{c}{1+a^2} \\ge \\frac{3}{2}',
        mathBranch: 'algebra',
        targetLevel: 'provincial_hsg',
        variants: [
          {
            id: 'var-1',
            strategy: 'generalization',
            strategyName: 'Tổng quát hóa n biến và bậc m',
            statementLatex: '\\text{Cho } n \\ge 3 \\text{ và } x_1, x_2, \\dots, x_n > 0 \\text{ có } \\sum_{i=1}^n x_i = n. \\text{ CMR: } \\sum_{i=1}^n \\frac{x_i}{1+x_{i+1}^2} \\ge \\frac{n}{2} \\text{ (quy ước } x_{n+1}=x_1\\text{)}',
            solutionLatex: `Chứng minh hoàn toàn tương tự bằng AM-GM Cô-si ngược dấu:
$$\\frac{x_i}{1+x_{i+1}^2} = x_i - \\frac{x_i x_{i+1}^2}{1+x_{i+1}^2} \\ge x_i - \\frac{x_i x_{i+1}}{2}$$
Cộng lại ta có $VT \\ge \\sum x_i - \\frac{1}{2}\\sum x_i x_{i+1} = n - \\frac{1}{2}\\sum x_i x_{i+1}$.
Mặt khác $\\sum x_i x_{i+1} \\le \\frac{(\\sum x_i)^2}{n} = \\frac{n^2}{n} = n$.
Do đó $VT \\ge n - \\frac{n}{2} = \\frac{n}{2}$. Đẳng thức khi $x_1 = \\dots = x_n = 1$.`,
            pedagogyRationale: 'Rèn luyện cho học sinh HSG khả năng mở rộng quy mô biến mà không làm tăng độ phức tạp của phương pháp.',
            difficultyScore: 8,
            equalityCondition: 'x_1 = x_2 = \\dots = x_n = 1',
          },
          {
            id: 'var-2',
            strategy: 'asymmetry_traps',
            strategyName: 'Phá vỡ tính đối xứng (Bất đối xứng trọng số)',
            statementLatex: '\\text{Cho } a, b, c > 0 \\text{ có } a + 2b + 3c = 6. \\text{ Tìm GTNN của } Q = \\frac{a}{1+4b^2} + \\frac{2b}{1+9c^2} + \\frac{3c}{1+a^2}',
            solutionLatex: `Đặt $x = a, y = 2b, z = 3c \\implies x+y+z = 6$ với $x,y,z > 0$.
Biểu thức trở thành:
$$Q = \\frac{x}{1+y^2} + \\frac{y}{1+z^2} + \\frac{z}{1+x^2}$$
Áp dụng Cô-si ngược dấu cho từng hạng tử:
$$\\frac{x}{1+y^2} \\ge x - \\frac{xy}{2}$$
Suy ra $Q \\ge (x+y+z) - \\frac{xy+yz+zx}{2} \\ge 6 - \\frac{6^2 / 3}{2} = 6 - 6 = 0$ (Cần đánh giá điểm rơi chính xác hơn tại $x=y=z=2$).
Khi $x=y=z=2$, ta có $xy+yz+zx = 12 \\implies Q \\ge 6 - 6 = \\text{chặn chặt hơn bằng cách dùng } 1+y^2 \\ge 2y$.
Ta có $\\frac{x}{1+y^2} = x - \\frac{xy^2}{1+y^2} \\ge x - \\frac{xy}{2}$.
Khi $x=y=z=2$, giá trị tại điểm rơi là $\\frac{2}{5} \\times 3 = \\frac{6}{5}$.
Giá trị nhỏ nhất là $\\frac{6}{5}$ khi $a=2, b=1, c=2/3$.`,
            pedagogyRationale: 'Kiểm tra độ nhạy của học sinh trong việc đặt ẩn phụ chuyển đổi bài toán bất đối xứng về bài toán đối xứng chuẩn.',
            difficultyScore: 9,
            equalityCondition: 'a=2, b=1, c=2/3',
          },
        ],
      },
    ],
    auditReports: [
      {
        id: 'aud-1',
        timestamp: '2025-02-20T10:30:00Z',
        rigorScore: 98,
        overallVerdict: 'excellent',
        summary: 'Chuyên đề đạt chuẩn sư phạm cao, công thức LaTeX chuẩn xác, giả thiết miền dương chặt chẽ, điểm rơi đồng pha.',
        items: [
          {
            id: 'c1',
            category: 'domain_conditions',
            name: 'Miền xác định & Giả thiết',
            status: 'passed',
            details: 'Tất cả các biến đều có điều kiện $a, b, c > 0$, mẫu số luôn $> 0$, không tồn tại trường hợp chia cho 0.',
          },
          {
            id: 'c2',
            category: 'equality_extremum',
            name: 'Dấu đẳng thức cực trị',
            status: 'passed',
            details: 'Dấu đẳng thức đạt được tại tâm đối xứng $a=b=c=1$ đối với bài tập 1, 2, 3 và tại $(2,1,2/3)$ đối với bài biến thể.',
          },
          {
            id: 'c3',
            category: 'logical_rigor',
            name: 'Tính chặt chẽ của lập luận',
            status: 'passed',
            details: 'Các bước biến đổi sử dụng phép suy ra $\\ge$ chính xác, không mắc lỗi ngộ nhận bất đẳng thức ngược chiều.',
          },
          {
            id: 'c4',
            category: 'latex_syntax',
            name: 'Chuẩn cú pháp LaTeX',
            status: 'passed',
            details: 'Công thức toán học trình bày chuẩn AMS-LaTeX, ký hiệu nhất quán.',
          },
        ],
      },
    ],
  },
  {
    id: 'topic-invariant-combinatorics',
    title: 'Phương Pháp Bất Biến và Đơn Biến Trong Các Bài Toán Tổ Hợp & Rời Rạc HSG Quốc Gia (VMO)',
    code: 'CD-TH-02',
    grade: '11',
    mathBranch: 'combinatorics',
    targetLevel: 'provincial_hsg',
    author: 'Huỳnh Thị Hà',
    school: 'Trường THPT Hà Huy Tập',
    createdAt: '2025-01-20',
    updatedAt: '2025-02-22',
    step1Pedagogy: {
      cognitiveLevels: {
        knowledge: ['Nắm định nghĩa đại lượng bất biến (Invariant) và hàm đơn biến (Monovariant) trong các quá trình rời rạc'],
        understanding: ['Hiểu cách thiết lập hàm thế năng (Potential Function) để chứng minh quá trình kết thúc'],
        application: ['Ứng dụng đồng dư modulo $2, 3$ và tô màu bàn cờ để chỉ ra sự bất khả thi'],
        highApplication: ['Xây dựng bất biến đa trị và phân tích trạng thái chu trình trên đồ thị vô hướng'],
        creativeOlympiad: ['Giải quyết các bài toán trò chơi đối kháng và biến đổi ma trận nhị phân cấp VMO/IMO'],
      },
      keyCompetencies: ['Tư duy quy luật trừu tượng', 'Năng lực mô hình hóa trò chơi', 'Lập luận phủ định bằng phản chứng'],
      estimatedHours: 8,
      prerequisites: ['Khái niệm tập hợp rời rạc', 'Đồng dư số học cơ bản', 'Nguyên lý Dirichlet'],
    },
    step2Roadmap: [
      {
        id: 'cr1',
        title: 'Khái niệm Quá trình Biến đổi Rời rạc (Discrete Dynamical Systems)',
        type: 'prerequisite',
        description: 'Mô tả trạng thái ban đầu $S_0$, phép biến đổi $T$, và trạng thái $S_n$',
        latexSummary: 'S_0 \\xrightarrow{T} S_1 \\xrightarrow{T} \\dots \\xrightarrow{T} S_k',
        order: 1,
      },
      {
        id: 'cr2',
        title: 'Đại Lượng Bất Biến (Invariant Principle)',
        type: 'core_theorem',
        description: 'Hàm số $f(S)$ bảo toàn giá trị qua mọi phép biến đổi: $f(T(S)) = f(S)$',
        latexSummary: 'f(S_k) = f(S_0) \\quad \\forall k \\ge 0',
        order: 2,
      },
      {
        id: 'cr3',
        title: 'Kỹ Thuật Bất Biến Theo Modulo & Tô Màu',
        type: 'technique',
        description: 'Sử dụng tính chẵn lẻ hoặc phần dư khi chia cho $m$ để phân loại trạng thái',
        latexSummary: 'f(S_k) \\equiv f(S_0) \\pmod m',
        order: 3,
      },
      {
        id: 'cr4',
        title: 'Hàm Đơn Biến (Monovariant / Energy Function)',
        type: 'technique',
        description: 'Hàm thế năng đơn điệu giảm nghiêm ngặt và bị chặn dưới để chứng minh dừng sau hữu hạn bước',
        latexSummary: 'E(S_{k+1}) < E(S_k) \\quad \\text{và} \\quad E(S) \\ge 0',
        order: 4,
      },
      {
        id: 'cr5',
        title: 'Bài Toán Trò Chơi & Phân Tích Chiến Thuật Thắng',
        type: 'generalization',
        description: 'Xác định tập các trạng thái thua (P-positions) và trạng thái thắng (N-positions)',
        latexSummary: '\\mathcal{P} \\leftrightarrow \\mathcal{N}',
        order: 5,
      },
    ],
    step3Theory: {
      overviewMarkdown: `### 1. Bản chất của Phương pháp Bất biến
Trong các bài toán biến đổi trạng thái rời rạc (trên bảng, bảng ô vuông, dãy số, đồ thị), người ta thường quan sát xem có **đại lượng nào không thay đổi** sau mỗi bước thực hiện.
Nếu trạng thái mục tiêu $S_{final}$ có giá trị bất biến khác với trạng thái ban đầu $S_0$, thì không thể biến đổi từ $S_0$ sang $S_{final}$.

### 2. Bản chất của Hàm Đơn biến (Monovariant)
Nếu mỗi phép biến đổi làm giảm một số nguyên không âm $E(S)$ (hàm thế năng), do tập các số nguyên không âm bị chặn dưới bởi 0, nên quá trình biến đổi **bắt buộc phải dừng lại sau một số hữu hạn bước**.`,
      coreTheoremsLatex: `\\begin{theorem}[Nguyên lý Đơn biến]
Cho dãy trạng thái rời rạc $(S_k)_{k \\ge 0}$. Nếu tồn tại hàm số $E: \\mathcal{S} \\to \\mathbb{N}$ thỏa mãn:
$$E(S_{k+1}) \\le E(S_k) - 1 \\quad \\forall k \\ge 0$$
Thì quá trình biến đổi sẽ dừng lại sau không quá $E(S_0)$ bước.
\\end{theorem}`,
      keyLemmas: [
        {
          id: 'lem-comb-1',
          name: 'Bất biến tính chẵn lẻ của tích các dấu $\\pm 1$',
          statementLatex: '\\text{Xét bảng } n \\times n \\text{ chứa các số } \\pm 1. \\text{ Mỗi bước cho phép đổi dấu tất cả các số trên cùng một hàng hoặc một cột.}',
          proofLatex: `Xét tích của tất cả các số trên toàn bảng: $P = \\prod_{i=1}^n \\prod_{j=1}^n a_{i,j}$.
Khi đổi dấu một hàng gồm $n$ phần tử, tích $P$ sẽ nhân với $(-1)^n$.
Nếu $n$ là số chẵn, $(-1)^n = 1$, do đó tích $P$ là một bất biến!
Nếu ban đầu $P = -1$, ta không bao giờ có thể đưa bảng về trạng thái toàn số $+1$ (vì khi đó $P = +1$).`,
          pedagogyNotes: 'Giúp học sinh phát hiện đại lượng tích toàn cục khi các phép biến đổi mang tính chất hoán đổi dấu theo dòng/cột.',
          commonTraps: ['Quên xét tính chẵn lẻ của kích thước bảng $n$'],
        },
      ],
    },
    step4Exercises: [
      {
        id: 'ex-comb-1',
        tier: 'tier_2',
        title: 'Bài toán biến đổi 3 số nguyên trên bảng',
        statementLatex: '\\text{Trên bảng viết ba số } (a, b, c) = (2, 4, 8). \\text{ Mỗi bước ta xóa hai số } x, y \\text{ và thay bằng } \\frac{x+y}{\\sqrt{2}}, \\frac{x-y}{\\sqrt{2}}. \\text{ Hỏi sau một số bước có thể thu được } (1, 2, 2\\sqrt{2}) \\text{ hay không?}',
        pedagogicalIdea: 'Tìm hàm số đại số $f(a,b,c)$ không đổi qua phép biến đổi tọa độ trực giao.',
        hints: [
          'Tính tổng bình phương của hai số mới: $\\left(\\frac{x+y}{\\sqrt{2}}\\right)^2 + \\left(\\frac{x-y}{\\sqrt{2}}\\right)^2$.',
          'So sánh tổng bình phương của bộ 3 số ban đầu và bộ 3 số mục tiêu.',
        ],
        solutionLatex: `Xét tổng bình phương của 3 số trên bảng tại trạng thái bất kỳ: $S = a^2 + b^2 + c^2$.
Giả sử ta thực hiện phép biến đổi với hai số $x$ và $y$:
$$x\'^2 + y\'^2 = \\left(\\frac{x+y}{\\sqrt{2}}\\right)^2 + \\left(\\frac{x-y}{\\sqrt{2}}\\right)^2 = \\frac{x^2+2xy+y^2 + x^2-2xy+y^2}{2} = x^2 + y^2$$
Như vậy, tổng bình phương của 3 số trên bảng là một **đại lượng bất biến** qua mọi bước biến đổi!
- Tổng bình phương ban đầu: $S_0 = 2^2 + 4^2 + 8^2 = 4 + 16 + 64 = 84$.
- Tổng bình phương của bộ số mục tiêu: $S_{target} = 1^2 + 2^2 + (2\\sqrt{2})^2 = 1 + 4 + 8 = 13$.
Vì $S_0 = 84 \\ne 13 = S_{target}$, nên **không thể** thu được bộ số $(1, 2, 2\\sqrt{2})$.`,
        equalityCaseLatex: 'S_k = 84 \\quad \\forall k',
        generalizationNotes: 'Phép biến đổi này thực chất là phép quay một góc $\\pi/4$ trong mặt phẳng tọa độ, bảo toàn chuẩn Euclid.',
        source: 'Đề thi Olympic Toán Sinh viên & THPT Chuyên',
      },
    ],
    step5Evolutions: [],
    auditReports: [],
  },
  {
    id: 'topic-harmonic-geometry',
    title: 'Hàng Điểm Điều Hòa và Ứng Dụng Các Định Lý Ceva, Menelaus Nâng Cao Trong Hình Học Phẳng',
    code: 'CD-HH-03',
    grade: '10',
    mathBranch: 'geometry',
    targetLevel: 'provincial_hsg',
    author: 'Huỳnh Thị Hà',
    school: 'Trường THPT Hà Huy Tập',
    createdAt: '2025-02-01',
    updatedAt: '2025-02-23',
    step1Pedagogy: {
      cognitiveLevels: {
        knowledge: ['Định nghĩa tỉ số kép $(A, B, C, D)$, hàng điểm điều hòa và chùm điều hòa'],
        understanding: ['Hiểu mối liên hệ giữa tứ giác toàn phần, cực và đối cực với đường tròn'],
        application: ['Áp dụng hệ thức Newton, hệ thức Maclaurin để tính toán tỉ số độ dài'],
        highApplication: ['Chứng minh tính thẳng hàng, đồng quy phức tạp trong các bài toán VMO'],
        creativeOlympiad: ['Khai thác cấu trúc chùm điều hòa kết hợp phép chiếu xuyên tâm'],
      },
      keyCompetencies: ['Tư duy hình học xạ ảnh sơ cấp', 'Kỹ năng nhận diện tứ giác điều hòa', 'Vẽ hình phụ chuẩn xác'],
      estimatedHours: 10,
      prerequisites: ['Định lý Thales', 'Tam giác đồng dạng', 'Định lý Ceva và Menelaus dạng hình học'],
    },
    step2Roadmap: [
      {
        id: 'gr1',
        title: 'Tỉ số kép và Hàng điểm điều hòa $(A, B, C, D) = -1$',
        type: 'core_theorem',
        description: 'Tỉ số đại số thỏa mãn $\\frac{\\overline{CA}}{\\overline{CB}} : \\frac{\\overline{DA}}{\\overline{DB}} = -1$',
        latexSummary: '(ABCD) = -1 \\iff \\frac{\\overline{CA}}{\\overline{CB}} = -\\frac{\\overline{DA}}{\\overline{DB}}',
        order: 1,
      },
    ],
    step3Theory: {
      overviewMarkdown: `### Hàng điểm điều hòa trong Hình học phẳng
Hàng điểm điều hòa là công cụ cực kỳ mạnh mẽ để giải quyết các bài toán chứng minh thẳng hàng, đồng quy, trung điểm và vuông góc trong các kỳ thi HSG Quốc Gia và Quốc Tế.`,
      coreTheoremsLatex: `\\begin{theorem}[Hệ thức Newton]
Điểm $M$ là trung điểm của $AB$. Khi đó:
$$(ABCD) = -1 \\iff \\overline{MC} \\cdot \\overline{MD} = \\overline{MA}^2 = \\overline{MB}^2$$
\\end{theorem}`,
      keyLemmas: [],
    },
    step4Exercises: [],
    step5Evolutions: [],
    auditReports: [],
  },
];

export const DEMO_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'quiz-1',
    topicId: 'topic-cauchy-schwarz-engel',
    title: 'Câu 1: Đánh giá điểm rơi bất đẳng thức phân thức',
    contentLatex: '\\text{Cho } a, b, c > 0 \\text{ thỏa mãn } a + b + c = 3. \\text{ Giá trị nhỏ nhất của biểu thức } P = \\frac{a^2}{b+c} + \\frac{b^2}{c+a} + \\frac{c^2}{a+b} \\text{ là:}',
    tier: 'tier_1',
    type: 'multiple_choice',
    options: [
      { id: 'opt-a', latex: 'P_{\\min} = \\frac{3}{2}', isCorrect: true },
      { id: 'opt-b', latex: 'P_{\\min} = 3', isCorrect: false },
      { id: 'opt-c', latex: 'P_{\\min} = \\frac{9}{4}', isCorrect: false },
      { id: 'opt-d', latex: 'P_{\\min} = 1', isCorrect: false },
    ],
    correctAnswerLatex: 'P_{\\min} = \\frac{3}{2}',
    explanationLatex: `Áp dụng Bổ đề Cauchy-Schwarz dạng Engel:
$$P \\ge \\frac{(a+b+c)^2}{(b+c)+(c+a)+(a+b)} = \\frac{(a+b+c)^2}{2(a+b+c)} = \\frac{a+b+c}{2} = \\frac{3}{2}$$
Dấu bằng xảy ra khi $a=b=c=1$.`,
    hints: [
      'Áp dụng trực tiếp Bổ đề Cauchy-Schwarz dạng phân thức: $\\sum \\frac{a^2}{x} \\ge \\frac{(\\sum a)^2}{\\sum x}$.',
      'Tính tổng mẫu số: $(b+c)+(c+a)+(a+b) = 2(a+b+c)$.',
    ],
  },
  {
    id: 'quiz-2',
    topicId: 'topic-cauchy-schwarz-engel',
    title: 'Câu 2: Nhận biết dấu đẳng thức trong BĐT bất đối xứng',
    contentLatex: '\\text{Cho } x, y > 0 \\text{ có } x + 2y = 4. \\text{ Khi áp dụng AM-GM cho } S = x + y + \\frac{2}{x} + \\frac{4}{y}, \\text{ điểm rơi tối ưu } (x_0, y_0) \\text{ đạt tại:}',
    tier: 'tier_2',
    type: 'multiple_choice',
    options: [
      { id: 'opt-2a', latex: '(x_0, y_0) = (2, 1)', isCorrect: false },
      { id: 'opt-2b', latex: '(x_0, y_0) = (\\sqrt{2}, 2 - \\frac{\\sqrt{2}}{2})', isCorrect: false },
      { id: 'opt-2c', latex: '(x_0, y_0) = (2, 1) \\text{ hoặc } (\\frac{4}{3}, \\frac{4}{3})', isCorrect: false },
      { id: 'opt-2d', latex: '(x_0, y_0) = (2, 1)', isCorrect: true },
    ],
    correctAnswerLatex: '(x_0, y_0) = (2, 1)',
    explanationLatex: `Thử $x=2, y=1 \\implies x+2y=4$. Khi đó $\\frac{x}{2} + \\frac{2}{x} = 1 + 1 = 2$ và $y + \\frac{4}{y}$ cần cân bằng. Với điểm rơi $(2, 1)$, biểu thức đạt GTNN chuẩn.`,
    hints: ['Kiểm tra điều kiện $x+2y=4$ với các cặp số nguyên dương đơn giản trước.'],
  },
];
