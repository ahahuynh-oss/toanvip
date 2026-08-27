import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function geminiDevApiPlugin(): Plugin {
  return {
    name: 'gemini-dev-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', hasServerKey: !!process.env.GEMINI_API_KEY }));
          return;
        }

        if (req.url === '/api/gemini/generate' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { prompt, systemInstruction, model, apiKey: clientApiKey, temperature } = data;
              const key = clientApiKey || process.env.GEMINI_API_KEY;

              if (!key) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: 'Chưa có GEMINI_API_KEY. Vui lòng cấu hình biến môi trường hoặc nhập API Key trong phần Cài đặt.',
                }));
                return;
              }

              const ai = new GoogleGenAI({
                apiKey: key,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

              const selectedModel = model || 'gemini-3.7-flash';

              const response = await ai.models.generateContent({
                model: selectedModel,
                contents: prompt,
                config: {
                  systemInstruction: systemInstruction || 'Bạn là chuyên gia Toán học THPT và chuyên viên bồi dưỡng học sinh giỏi Toán (HSG/VMO). Hãy trả lời với tư duy sư phạm sâu sắc, lập luận chặt chẽ, sử dụng định dạng LaTeX chuẩn cho tất cả công thức toán học.',
                  temperature: typeof temperature === 'number' ? temperature : 0.7,
                },
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: response.text || '' }));
            } catch (err: any) {
              console.error('Vite dev server Gemini error:', err);
              res.statusCode = err?.status || 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Lỗi khi kết nối Gemini AI' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiDevApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
