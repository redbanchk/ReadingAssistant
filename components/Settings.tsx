import React from 'react';
import { LogOut, Bell, Play } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const handleToggleAllReminders = () => {
    // In a real app, this would update a 'profiles' table in Supabase
    // For this frontend-only scope, we mock the alert
    alert("在正式环境中，这将切换你数据库中的 '启用所有提醒' 开关。");
  };

  const handleTriggerReminders = async () => {
    try {
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes?.session?.access_token;
      if (!token) {
        alert('请先登录后再触发提醒函数（需要用户令牌）');
        return;
      }
      const { data, error } = await supabase.functions.invoke('send-reminders', {
        headers: {
          'X-Force': 'true',
          'Authorization': `Bearer ${token}`
        },
        body: {}
      });
      if (error) {
        alert(`触发失败：${error.message}`);
        return;
      }
      const count = (data as any)?.count ?? 0;
      alert(`已触发提醒函数（调试模式），尝试发送 ${count} 封邮件，请查收并稍后在 Edge Functions 日志查看详情。`);
    } catch (e: any) {
      alert(`触发失败：${e?.message || String(e)}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pt-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">个人设置</h2>

      <div className="space-y-6">
        
        {/* Reminder Toggle */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2 rounded-full text-blue-600">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">邮件提醒总开关</p>
              <p className="text-xs text-slate-500">一键开启或关闭所有书籍提醒</p>
            </div>
          </div>
          <button 
            onClick={handleToggleAllReminders}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            管理
          </button>
        </div>

        {/* Data Backup component removed as requested */}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut size={18} />
          <span>退出登录</span>
        </button>

        {/* Debug trigger */}
        <button
          onClick={handleTriggerReminders}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          <Play size={18} />
          <span>立即触发提醒（调试）</span>
        </button>

        <p className="text-center text-xs text-slate-300 pt-8">
          阅读助手 v1.0 <br/>
          数据仅你可见
        </p>

      </div>
    </div>
  );
};

export default Settings;
