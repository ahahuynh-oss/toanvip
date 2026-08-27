import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server client
const getAiClient = (customKey?: string) => {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Route for Gemini AI calls
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, contents, attachments, systemInstruction, model, apiKey: clientApiKey, temperature } = req.body;

    const ai = getAiClient(clientApiKey);
    if (!ai) {
      return res.status(400).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng kiểm tra biến môi trường hoặc cung cấp API Key.',
      });
    }

    const selectedModel = model || 'gemini-3.7-flash';

    // Build contents payload (supports text string, structured parts, or multimodal attachments)
    let payloadContents: any = prompt;

    if (contents) {
      payloadContents = contents;
    } else if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const parts: any[] = [];
      
      // Add text prompt first if present
      if (prompt && typeof prompt === 'string') {
        parts.push({ text: prompt });
      }

      // Add inline media attachments
      for (const att of attachments) {
        if (att.mimeType && att.data) {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data,
            },
          });
        } else if (att.text) {
          parts.push({
            text: `\n--- NỘI DUNG TẬP TIN [${att.name || 'document'}] ---\n${att.text}\n--- HẾT TẬP TIN ---\n`,
          });
        }
      }

      payloadContents = [{ role: 'user', parts }];
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: payloadContents,
      config: {
        systemInstruction:
          systemInstruction ||
          'Bạn là chuyên gia Toán học THPT và chuyên viên bồi dưỡng học sinh giỏi Toán (HSG/VMO). Hãy trả lời với tư duy sư phạm sâu sắc, lập luận chặt chẽ, sử dụng định dạng LaTeX chuẩn ($...$ hoặc $$...$$) cho tất cả công thức toán học.',
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      },
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const status = error?.status || 500;
    const message = error?.message || 'Đã xảy ra lỗi khi kết nối với Gemini AI.';
    res.status(status).json({ error: message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasServerKey: !!process.env.GEMINI_API_KEY });
});

// Serve static files in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
