import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, Mail, ArrowRight, LogIn, User } from 'lucide-react';

interface LoginProps {
  onGuestLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onGuestLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isRegister, setIsRegister] = useState(false); // Controls the View Mode

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      
      setMessage(
        isRegister 
          ? '注册验证链接已发送！请查收邮件完成注册。' 
          : '登录链接已发送！请查收邮件进入应用。'
      );
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (mode: 'login' | 'register') => {
    setIsRegister(mode === 'register');
    setMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-sm w-full transition-all duration-300">
        
        {/* Logo & Dynamic Header */}
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 mb-4">
            <span className="font-bold text-xl">阅</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isRegister ? '创建新账号' : '欢迎回来'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {isRegister 
              ? '开启你的阅读记录之旅。' 
              : '输入邮箱以访问你的书架。'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-slate-100 p-1 rounded-lg flex mb-6 relative">
          <button
            type="button"
            onClick={() => toggleMode('login')}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all duration-200 flex items-center justify-center ${
              !isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => toggleMode('register')}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all duration-200 flex items-center justify-center ${
              isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            注册
          </button>
        </div>

        {message ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm mb-6 animate-fade-in flex items-start border border-green-100">
             <div className="mr-3 mt-0.5 text-green-500 shrink-0">
               <Mail size={16} />
             </div>
             <div>{message}</div>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                邮箱地址
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-lg transition-all active:scale-[0.98] flex justify-center items-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isRegister ? (
                    <span className="flex items-center">免费注册 <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/></span>
                  ) : (
                    <span className="flex items-center">登录 <LogIn size={16} className="ml-2"/></span>
                  )}
                </>
              )}
            </button>
          </form>
        )}
        
        {!message && (
             <div className="mt-6 text-center space-y-4">
               <p className="text-xs text-slate-400">
                 {isRegister 
                   ? '已有账号？ ' 
                   : "还没有账号？ "}
                 <button 
                   onClick={() => toggleMode(isRegister ? 'login' : 'register')}
                   className="text-slate-900 font-semibold hover:underline"
                 >
                   {isRegister ? '去登录' : '去注册'}
                 </button>
               </p>

               <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400">或者</span>
                  </div>
               </div>

               <button
                  onClick={onGuestLogin}
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-lg transition-all flex justify-center items-center"
               >
                 <User size={16} className="mr-2"/>
                 访客试用 (无需登录)
               </button>
             </div>
        )}
      </div>
    </div>
  );
};

export default Login;