import React, { useState, useEffect, useMemo } from 'react';
import { loadData, saveData } from './utils/storage';
import { AppData } from './types';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FAQList from './components/FAQList';
import QuestionForm from './components/QuestionForm';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';

function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeView, setActiveView] = useState<'faq' | 'submit' | 'admin'>('faq');

  // Save data whenever it changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(data.faqs.map(faq => faq.category))).sort();
  }, [data.faqs]);

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    return data.faqs.filter(faq => {
      const matchesSearch = !searchTerm || 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesCategory = !selectedCategory || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [data.faqs, searchTerm, selectedCategory]);

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setActiveView('faq');
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLogin = (code: string) => {
    if (code === data.settings.adminCode) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setActiveView('admin');
    } else {
      alert('Code administrateur incorrect.');
    }
  };

  const handleDataChange = (newData: AppData) => {
    setData(newData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        meetingDates={data.settings.meetingDates} 
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        {!isAdmin && (
          <div className="mb-8">
            <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveView('faq')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeView === 'faq'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Consulter les FAQ
              </button>
              <button
                onClick={() => setActiveView('submit')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeView === 'submit'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Poser une question
              </button>
            </nav>
          </div>
        )}

        {/* Content */}
        {activeView === 'faq' && (
          <div>
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
            />
            <FAQList faqs={filteredFaqs} />
          </div>
        )}

        {activeView === 'submit' && (
          <QuestionForm
            companies={data.companies}
            contactEmail={data.settings.contactEmail}
          />
        )}

        {activeView === 'admin' && isAdmin && (
          <AdminPanel
            data={data}
            onDataChange={handleDataChange}
          />
        )}
      </main>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}

export default App;