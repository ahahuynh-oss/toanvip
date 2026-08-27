import React, { useState } from 'react';
import {
  Settings,
  Key,
  Cpu,
  User,
  School,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AppSettings } from '../types/math';
import { AI_MODELS } from '../services/geminiService';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (updated: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  const handleTestConnection = async () => {
    if (!formData.customApiKey) {
      setTestStatus('error');
      setTestMessage('Vui lòng nhập API Key để kiểm tra kết nối.');
      return;
    }

    try {
      setIsTestingKey(true);
      setTestStatus('idle');

      const directRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${formData.aiModel || 'gemini-3-flash-preview'}:generateContent?key=${formData.customApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello! Reply OK.' }] }],
          }),
        }
      );

      if (directRes.ok) {
        setTestStatus('success');
        setTestMessage('Kết nối thành công! API Key hợp lệ và sẵn sàng hoạt động.');
      } else {
        const errJson = await directRes.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(
          `Lỗi API [${directRes.status}]: ${errJson?.error?.message || 'API Key không hợp lệ hoặc hết hạn mức.'}`
        );
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Không thể kết nối tới Google AI: ${err.message || 'Lỗi mạng'}`);
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', formData.customApiKey || '');
    localStorage.setItem('math_app_settings', JSON.stringify(formData));
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3 text-slate-800">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Thiết Lập Model AI & API Key</h3>
              <p className="text-xs text-slate-500">Cấu hình mô hình Gemini AI, Google API Key và thông tin tác giả</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* API Key Input Section with Prominent Warning & Guide */}
          <div className="space-y-2 p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-300 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 flex items-center">
                <Key className="w-4 h-4 mr-1.5 text-amber-600" />
                Google Gemini API Key:
              </label>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:underline flex items-center"
              >
                <span>🔑 Lấy API Key miễn phí tại đây</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.customApiKey}
                onChange={(e) => setFormData({ ...formData, customApiKey: e.target.value })}
                placeholder="Dán mã API Key của bạn (bắt đầu bằng AIzaSy...)"
                className="w-full text-xs font-mono pl-3 pr-10 py-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-900 font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1 pt-1">
              <p className="font-semibold text-slate-800">
                📌 <strong>Hướng dẫn 3 bước lấy API Key:</strong>
              </p>
              <ol className="list-decimal list-inside text-slate-600 space-y-0.5 pl-1">
                <li>Truy cập <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">Google AI Studio</a>.</li>
                <li>Đăng nhập tài khoản Google $\to$ Bấm <strong>Create API key</strong>.</li>
                <li>Sao chép mã Key và dán vào ô trên, sau đó bấm <strong>Lưu Cài Đặt</strong>.</li>
              </ol>
            </div>
          </div>

          {/* AI Model Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center">
              <Cpu className="w-4 h-4 mr-1.5 text-blue-600" />
              Chọn Mô Hình Gemini AI Mặc Định:
            </label>
            
            <div className="grid grid-cols-1 gap-2.5">
              {AI_MODELS.map((m) => {
                const isSelected = (formData.aiModel || 'gemini-3-flash-preview') === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setFormData({ ...formData, aiModel: m.id })}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                        {m.tag && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                              m.tag === 'Default'
                                ? 'bg-blue-100 text-blue-800'
                                : m.tag === 'High Reasoning'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {m.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{m.desc}</p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Họ và Tên Giáo Viên:
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center">
                <School className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Trường / Đơn Vị Công Tác:
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Test Status Indicator */}
          {testStatus === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center space-x-2 text-xs text-rose-800 font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTestingKey}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {isTestingKey ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>Kiểm Tra Kết Nối</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Lưu Cài Đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
