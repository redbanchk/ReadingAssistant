import React, { useState, useEffect } from 'react';
import { Book, BookStatus, ReminderFrequency, ReminderTime } from '../types';
import { getCoverFromISBN, getPagesFromISBN } from '../utils/helpers';
import { Loader2, Upload, ChevronLeft, Save, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface BookFormProps {
  initialData?: Book;
  onSave: () => void;
  onCancel: () => void;
  isDemo?: boolean;
  onRegister?: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ initialData, onSave, onCancel, isDemo, onRegister }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingCover, setFetchingCover] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    isbn: '',
    status: BookStatus.UNREAD,
    total_pages: 0,
    current_page: 0,
    rating: 0,
    review: '',
    reminder_enabled: false,
    reminder_frequency: ReminderFrequency.WEEKLY,
    reminder_time: ReminderTime.PM7,
    cover_url: '',
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.cover_url) setPreviewUrl(initialData.cover_url);
    }
  }, [initialData]);

  // ISBN Auto-fetch Logic
  useEffect(() => {
    const fetchMeta = async () => {
      if (formData.isbn && formData.isbn.length >= 10 && !coverFile) {
        setFetchingCover(true);
        // Cover
        if (!initialData?.cover_url && !formData.cover_url) {
          const url = await getCoverFromISBN(formData.isbn!);
          if (url) {
            setFormData(prev => ({ ...prev, cover_url: url }));
            setPreviewUrl(url);
          }
        }
        // Pages
        const pages = await getPagesFromISBN(formData.isbn!);
        if (pages && (!formData.total_pages || formData.total_pages === 0)) {
          setFormData(prev => ({ ...prev, total_pages: pages }));
        }
        setFetchingCover(false);
      }
    };

    // Debounce slightly
    const timer = setTimeout(fetchMeta, 1000);
    return () => clearTimeout(timer);
  }, [formData.isbn, coverFile, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, cover_url: '' })); // Clear auto-fetched URL if manual upload
    }
  };

  const uploadCover = async (userId: string): Promise<string | null> => {
    if (!coverFile) return formData.cover_url || null;

    if (isDemo) {
        // Mock upload for demo
        return URL.createObjectURL(coverFile);
    }

    const fileExt = coverFile.name.split('.').pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(filePath, coverFile);

    if (uploadError) {
      console.error('Upload error', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userId = 'demo';
      
      if (!isDemo) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        userId = user.id;
      }

      const finalCoverUrl = await uploadCover(userId);

      const payload = {
        ...formData,
        user_id: userId,
        cover_url: finalCoverUrl,
        rating: formData.rating || 0,
      };

      if (isDemo) {
          // DEMO MODE: Save to LocalStorage
          const stored = localStorage.getItem('demo_books');
          const books = stored ? JSON.parse(stored) : [];
          
          if (initialData?.id) {
              const index = books.findIndex((b: Book) => b.id === initialData.id);
              if (index !== -1) books[index] = { ...books[index], ...payload };
          } else {
              books.unshift({ ...payload, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() });
          }
          
          localStorage.setItem('demo_books', JSON.stringify(books));
          await new Promise(r => setTimeout(r, 500)); // Fake delay
      } else {
          // REAL MODE: Supabase
          if (initialData?.id) {
            const { error } = await supabase
              .from('books')
              .update(payload)
              .eq('id', initialData.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('books')
              .insert([payload]);
            if (error) throw error;
          }
      }

      onSave();
    } catch (err: any) {
      alert(`保存书籍出错: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white min-h-screen sm:min-h-0 sm:mt-6 sm:rounded-lg sm:shadow-sm animate-fade-in">
      <div className="flex items-center mb-6">
        <button onClick={onCancel} className="mr-4 p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-800">{initialData ? '编辑书籍' : '添加新书'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">书名 *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder="例如：百年孤独"
            />
          </div>
          
          <div>
            {/* Explicitly Optional Label */}
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ISBN <span className="text-slate-400 font-normal">(可选，填入后自动获取封面并补全页数)</span>
              <a
                href={`https://book.douban.com/subject_search?search_text=${encodeURIComponent(formData.title || formData.isbn || '')}&cat=1001`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-xs text-blue-600 hover:underline"
              >
                豆瓣读书
              </a>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.isbn}
                onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400"
                placeholder="例如：978-7-5442-1096-0"
              />
              {fetchingCover && <div className="absolute right-3 top-3"><Loader2 className="animate-spin text-blue-500" size={20}/></div>}
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">封面图片</label>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-32 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {previewUrl ? (
                <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 text-xs text-center px-1">无封面</span>
              )}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Upload size={16} className="mr-2" />
                手动上传
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <p className="mt-2 text-xs text-slate-500">或输入 ISBN 自动获取。</p>
            </div>
          </div>
        </div>

        {/* Status & Progress - UNLOCKED for Guests */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-100">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">阅读状态 *</label>
                <select
                value={formData.status}
                onChange={e => {
                    const newStatus = e.target.value as BookStatus;
                    // If switching to finished, auto-set current page to total if available
                    let newCurrent = formData.current_page;
                    if (newStatus === BookStatus.FINISHED && formData.total_pages) {
                        newCurrent = formData.total_pages;
                    }
                    setFormData({ ...formData, status: newStatus, current_page: newCurrent });
                }}
                className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                <option value={BookStatus.UNREAD}>未读</option>
                <option value={BookStatus.READING}>在读</option>
                <option value={BookStatus.FINISHED}>已读完</option>
                </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">书籍总页数</label>
                    <input
                        type="number"
                        min="0"
                        value={formData.total_pages || ''}
                        onChange={e => setFormData({ ...formData, total_pages: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                    />
                </div>
                {formData.status !== BookStatus.UNREAD && (
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">当前读到第几页</label>
                    <input
                        type="number"
                        min="0"
                        max={formData.total_pages || undefined}
                        value={formData.current_page || ''}
                        onChange={e => setFormData({ ...formData, current_page: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                    />
                    </div>
                )}
            </div>
        </div>

        {/* Rating & Review - Only if Finished */}
        {formData.status === BookStatus.FINISHED ? (
            <div className="animate-fade-in">
                <label className="block text-sm font-medium text-slate-700 mb-1">评分</label>
                <div className="flex space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={`text-2xl transition-transform hover:scale-110 ${
                        (formData.rating || 0) >= star ? 'text-orange-400' : 'text-slate-200'
                        }`}
                    >
                        ★
                    </button>
                    ))}
                </div>

                <label className="block text-sm font-medium text-slate-700 mb-1">简短评价 (限 100 字)</label>
                <textarea
                    maxLength={100}
                    value={formData.review}
                    onChange={e => setFormData({ ...formData, review: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    placeholder="写下你的想法..."
                />
            </div>
        ) : (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-500 text-center">
                只有已读完的书籍才能进行评分和评价。
            </div>
        )}

        {/* Reminders - LOCKED for Guests */}
        {formData.status !== BookStatus.FINISHED && (
          <div className="relative rounded-lg overflow-hidden">
             
             {/* Guest Lock Overlay for Reminders */}
             {isDemo && (
                <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-blue-200 rounded-lg">
                    <div className="bg-white p-3 rounded-full shadow-sm mb-2 text-blue-500">
                        <Lock size={20} />
                    </div>
                    <p className="text-slate-900 font-semibold mb-1">仅注册用户可用</p>
                    <p className="text-xs text-slate-500 mb-4 max-w-[200px] leading-relaxed">
                        邮件自动提醒功能是注册会员专属。
                    </p>
                    <button 
                        type="button"
                        onClick={onRegister} 
                        className="bg-slate-900 text-white text-xs px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 font-medium active:scale-95"
                    >
                        免费注册解锁
                    </button>
                </div>
            )}

            <div className={`bg-blue-50 p-4 rounded-lg border border-blue-100 ${isDemo ? 'opacity-40 pointer-events-none filter blur-[0.5px]' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-slate-700">邮件提醒</label>
                <input
                    type="checkbox"
                    checked={formData.reminder_enabled}
                    onChange={e => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                </div>

                {formData.reminder_enabled && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">频率</label>
                    <select
                        value={formData.reminder_frequency}
                        onChange={e => setFormData({ ...formData, reminder_frequency: e.target.value as ReminderFrequency })}
                        className="w-full p-2 text-sm border border-blue-200 rounded bg-white outline-none"
                    >
                        <option value={ReminderFrequency.WEEKLY}>每周 1 次</option>
                        <option value={ReminderFrequency.THREE_DAYS}>每 3 天 1 次</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">时间</label>
                    <select
                        value={formData.reminder_time}
                        onChange={e => setFormData({ ...formData, reminder_time: e.target.value as ReminderTime })}
                        className="w-full p-2 text-sm border border-blue-200 rounded bg-white outline-none"
                    >
                        <option value={ReminderTime.PM7}>晚 7 点</option>
                        <option value={ReminderTime.PM8}>晚 8 点</option>
                        <option value={ReminderTime.PM9}>晚 9 点</option>
                    </select>
                    </div>
                </div>
                )}
            </div>
          </div>
        )}

        {/* Sticky Save Button (Mobile optimized) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 sm:static sm:bg-transparent sm:border-0 sm:p-0 z-10">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all active:scale-[0.98] flex justify-center items-center disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
            {initialData ? '保存修改' : '添加书籍'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
