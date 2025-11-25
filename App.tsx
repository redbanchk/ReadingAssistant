import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { ViewState, Book, BookStatus } from './types';
import Login from './components/Login';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import Settings from './components/Settings';
import { Plus, Settings as SettingsIcon, Book as BookIcon } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [view, setView] = useState<ViewState>('list');
  const [books, setBooks] = useState<Book[]>([]);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchBooks();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsDemo(false);
        fetchBooks();
        setView('list');
      } else if (!isDemo) {
        setBooks([]);
        setView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  // General Fetch Logic
  const fetchBooks = async () => {
    setLoadingBooks(true);
    
    if (isDemo) {
      // Demo Mode: Fetch from LocalStorage
      const stored = localStorage.getItem('demo_books');
      if (stored) {
        setBooks(JSON.parse(stored));
      } else {
        setBooks([]);
      }
      setLoadingBooks(false);
      return;
    }

    // Real Mode: Fetch from Supabase (do not depend on local session state timing)
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } else {
      setBooks((data as Book[]) || []);
    }
    setLoadingBooks(false);
  };

  // Ensure books are fetched whenever session becomes available (e.g., after reload)
  useEffect(() => {
    if (session && !isDemo) {
      fetchBooks();
    }
  }, [session]);

  const handleAddBook = () => {
    setEditingBook(undefined);
    setView('add');
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setView('edit');
  };

  const handleSaveBook = () => {
    fetchBooks();
    setView('list');
  };

  const handleGuestLogin = () => {
    setIsDemo(true);
    
    // Explicitly load data immediately to ensure UI updates instantly
    const stored = localStorage.getItem('demo_books');
    if (stored) {
      setBooks(JSON.parse(stored));
    } else {
      setBooks([]);
    }
    
    setView('list');
  };

  const handleLogout = () => {
    setIsDemo(false);
    setBooks([]);
    setView('login');
  };
  
  const handleGoToRegister = () => {
      setIsDemo(false);
      setView('login');
  };

  if (!session && !isDemo) {
    return <Login onGuestLogin={handleGuestLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900 pb-20">
      
      {/* Header - Simple & Clean */}
      {(view === 'list' || view === 'settings') && (
        <header className="bg-white border-b border-slate-100 pt-6 pb-4 px-4 sticky top-0 z-20 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md shadow-slate-200">阅</div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">阅读助手 {isDemo && <span className="text-[10px] font-normal text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full ml-2 align-middle">访客模式</span>}</h1>
            </div>
            {view === 'list' ? (
              <button onClick={() => setView('settings')} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200">
                <SettingsIcon size={22} className="text-slate-600" />
              </button>
            ) : (
              <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200">
                <BookIcon size={22} className="text-slate-600" />
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="animate-fade-in">
        {view === 'list' && (
          <>
            {loadingBooks ? (
               <div className="flex justify-center items-center h-64 text-slate-400">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-4 bg-slate-300 rounded-full mb-2"></div>
                    <span className="text-sm">加载书架...</span>
                  </div>
               </div>
            ) : (
               <BookList books={books} onEdit={handleEditBook} onRefresh={fetchBooks} onAdd={handleAddBook} isDemo={isDemo} />
            )}
            
            {/* Floating Action Button (FAB) for Add Book - Only show if we have books, otherwise the Empty State CTA is primary */}
            {books.length > 0 && (
              <div className="fixed bottom-6 right-6 z-30 animate-scale-in">
                <button
                  onClick={handleAddBook}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-xl shadow-slate-300 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                >
                  <Plus size={24} />
                </button>
              </div>
            )}
          </>
        )}

        {(view === 'add' || view === 'edit') && (
          <BookForm
            initialData={editingBook}
            onSave={handleSaveBook}
            onCancel={() => setView('list')}
            isDemo={isDemo}
            onRegister={handleGoToRegister}
          />
        )}

        {view === 'settings' && (
          <Settings onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
};

export default App;
