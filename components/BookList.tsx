import React, { useState, useMemo } from 'react';
import { Book, BookStatus, FilterState } from '../types';
import { Edit2, Trash2, BookOpen, CheckCircle, Circle, Star, Calendar, Plus, Library } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface BookListProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onRefresh: () => void;
  onAdd: () => void; // New prop to trigger add form
  isDemo?: boolean;
}

const BookList: React.FC<BookListProps> = ({ books, onEdit, onRefresh, onAdd, isDemo }) => {
  const [filter, setFilter] = useState<FilterState>({ status: 'all', rating: 'all' });

  // Filter Logic
  const filteredBooks = useMemo(() => {
    return books
      .filter(book => {
        if (filter.status !== 'all' && book.status !== filter.status) return false;
        if (filter.rating !== 'all' && (book.rating || 0) !== filter.rating) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [books, filter]);

  const handleDelete = async (id: string) => {
    if (window.confirm("确定要删除这本书吗？删除后无法恢复。")) {
      if (isDemo) {
          // DEMO MODE: LocalStorage
          const stored = localStorage.getItem('demo_books');
          if (stored) {
              const currentBooks = JSON.parse(stored);
              const updated = currentBooks.filter((b: Book) => b.id !== id);
              localStorage.setItem('demo_books', JSON.stringify(updated));
              onRefresh();
          }
      } else {
          // REAL MODE: Supabase
          const { error } = await supabase.from('books').delete().eq('id', id);
          if (error) {
            alert("删除失败");
          } else {
            onRefresh();
          }
      }
    }
  };

  const StatusIcon = ({ status }: { status: BookStatus }) => {
    switch (status) {
      case BookStatus.FINISHED: return <CheckCircle size={16} className="text-green-500" />;
      case BookStatus.READING: return <BookOpen size={16} className="text-blue-500" />;
      default: return <Circle size={16} className="text-slate-400" />;
    }
  };

  const getStatusLabel = (status: BookStatus) => {
    switch (status) {
      case BookStatus.FINISHED: return '已读完';
      case BookStatus.READING: return '在读';
      default: return '未读';
    }
  };

  // Helper to calculate percentage
  const getProgressPercentage = (book: Book) => {
      if (book.status === BookStatus.FINISHED) return 100;
      if (!book.total_pages || book.total_pages === 0) return 0;
      const current = book.current_page || 0;
      return Math.min(100, Math.round((current / book.total_pages) * 100));
  };

  // 1. True Empty State (No books at all)
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in px-4">
        <div className="bg-slate-100 p-8 rounded-full mb-6 text-slate-400 shadow-inner">
          <Library size={64} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3 text-center">你的书架空空如也</h3>
        <p className="text-slate-500 mb-8 text-center max-w-sm leading-relaxed">
          这里还是空白的。无论是正在读的书，还是计划读的书，现在就添加一本，开始记录你的阅读旅程吧！
        </p>
        <button 
          onClick={onAdd}
          className="bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          添加第一本书
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      
      {/* Filters */}
      <div className="sticky top-0 bg-[#f8fafc]/95 backdrop-blur-sm z-10 py-4 mb-4 flex gap-3 overflow-x-auto no-scrollbar border-b border-slate-200">
        <select
          value={filter.status}
          onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any }))}
          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-full px-4 py-2 outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <option value="all">全部状态</option>
          <option value={BookStatus.UNREAD}>未读</option>
          <option value={BookStatus.READING}>在读</option>
          <option value={BookStatus.FINISHED}>已读完</option>
        </select>

        <select
          value={filter.rating}
          onChange={(e) => setFilter(prev => ({ ...prev, rating: e.target.value === 'all' ? 'all' : Number(e.target.value) as any }))}
          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-full px-4 py-2 outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <option value="all">全部评分</option>
          <option value={5}>5 星</option>
          <option value={4}>4 星</option>
          <option value={3}>3 星</option>
          <option value={2}>2 星</option>
          <option value={1}>1 星</option>
        </select>
      </div>

      {/* Book List Grid */}
      <div className="space-y-4">
        {/* 2. Filter Empty State (Books exist, but none match filter) */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p className="mb-2 font-medium">没有找到符合条件的书籍</p>
            <button 
              onClick={() => setFilter({ status: 'all', rating: 'all' })}
              className="text-sm text-blue-500 hover:underline mt-2"
            >
              清除筛选条件
            </button>
          </div>
        ) : (
          filteredBooks.map((book) => {
            const percent = getProgressPercentage(book);
            return (
              <div key={book.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col sm:flex-row transition-all hover:shadow-md group">
                {/* Cover */}
                <div className="w-full sm:w-32 h-48 sm:h-auto bg-slate-100 flex-shrink-0 relative">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col">
                        <BookOpen size={24} className="mb-2 opacity-50"/>
                        <span className="text-xs">无封面</span>
                    </div>
                  )}
                  {/* Overlay Gradient on Mobile for text readability if needed, but we use card layout */}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{book.title}</h3>
                        {/* Status Badge */}
                        <div className={`flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-full inline-flex mb-3 ${
                            book.status === BookStatus.FINISHED ? 'bg-green-50 text-green-700' :
                            book.status === BookStatus.READING ? 'bg-blue-50 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                          <StatusIcon status={book.status} />
                          <span>{getStatusLabel(book.status)}</span>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(book)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="编辑">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(book.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="删除">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 mb-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                            <span>阅读进度</span>
                            <span>{percent}% <span className="text-slate-300 mx-1">|</span> {book.current_page || 0} / {book.total_pages || '-'} 页</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${book.status === BookStatus.FINISHED ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    {/* Rating & Review - Only if finished or rated */}
                    {book.rating ? (
                        <div className="mb-2 bg-yellow-50/50 p-2.5 rounded-lg border border-yellow-100/50">
                            <div className="flex items-center text-orange-400 text-xs mb-1">
                                {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < book.rating! ? "currentColor" : "none"} className={i < book.rating! ? "" : "text-slate-200"} />
                                ))}
                                <span className="ml-2 text-orange-600/70 font-medium">{book.rating}.0</span>
                            </div>
                            {book.review && (
                                <p className="text-sm text-slate-600 italic line-clamp-2">
                                "{book.review}"
                                </p>
                            )}
                        </div>
                    ) : null}
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 mt-2">
                      <span className="flex items-center">
                          <Calendar size={12} className="mr-1.5" />
                          添加于 {new Date(book.created_at).toLocaleDateString()}
                      </span>
                      {book.reminder_enabled && book.status !== BookStatus.FINISHED && (
                          <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
                              提醒开启
                          </span>
                      )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BookList;