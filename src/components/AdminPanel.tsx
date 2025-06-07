import React, { useState } from 'react';
import { Settings, Plus, Upload, Download, Save, Trash2, Edit3, Calendar, Mail } from 'lucide-react';
import { FAQ, AppData, MeetingDate } from '../types';
import { exportData, importData } from '../utils/storage';
import { extractTextFromDocx, extractTextFromPdf, parseQuestionsFromText } from '../utils/fileProcessing';

interface AdminPanelProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ data, onDataChange }) => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'settings' | 'import'>('faqs');
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    category: '',
    keywords: ''
  });
  const [tempSettings, setTempSettings] = useState(data.settings);
  const [isImporting, setIsImporting] = useState(false);

  const handleAddFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      alert('Veuillez remplir au moins la question et la réponse.');
      return;
    }

    const faq: FAQ = {
      id: Date.now().toString(),
      question: newFaq.question.trim(),
      answer: newFaq.answer.trim(),
      category: newFaq.category || 'Général',
      keywords: newFaq.keywords.split(',').map(k => k.trim()).filter(k => k),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onDataChange({
      ...data,
      faqs: [...data.faqs, faq]
    });

    setNewFaq({ question: '', answer: '', category: '', keywords: '' });
  };

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq({
      ...faq,
      keywords: faq.keywords
    });
  };

  const handleSaveEdit = () => {
    if (!editingFaq) return;

    const updatedFaq: FAQ = {
      ...editingFaq,
      keywords: typeof editingFaq.keywords === 'string' 
        ? editingFaq.keywords.split(',').map(k => k.trim()).filter(k => k)
        : editingFaq.keywords,
      updatedAt: new Date().toISOString()
    };

    onDataChange({
      ...data,
      faqs: data.faqs.map(faq => faq.id === editingFaq.id ? updatedFaq : faq)
    });

    setEditingFaq(null);
  };

  const handleDeleteFaq = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette FAQ ?')) {
      onDataChange({
        ...data,
        faqs: data.faqs.filter(faq => faq.id !== id)
      });
    }
  };

  const handleSaveSettings = () => {
    onDataChange({
      ...data,
      settings: tempSettings
    });
    alert('Paramètres sauvegardés !');
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      let text = '';
      
      if (file.name.endsWith('.docx')) {
        text = await extractTextFromDocx(file);
      } else if (file.name.endsWith('.pdf')) {
        text = await extractTextFromPdf(file);
      } else if (file.name.endsWith('.json')) {
        await importData(file);
        window.location.reload();
        return;
      } else {
        alert('Format de fichier non supporté. Utilisez .docx, .pdf ou .json');
        return;
      }

      const parsedQAs = parseQuestionsFromText(text);
      
      if (parsedQAs.length === 0) {
        alert('Aucune question/réponse détectée dans le fichier.');
        return;
      }

      const newFaqs: FAQ[] = parsedQAs.map((qa, index) => ({
        id: `import-${Date.now()}-${index}`,
        question: qa.question,
        answer: qa.answer,
        category: 'Importé',
        keywords: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      onDataChange({
        ...data,
        faqs: [...data.faqs, ...newFaqs]
      });

      alert(`${newFaqs.length} questions importées avec succès !`);
    } catch (error) {
      console.error('Import error:', error);
      alert('Erreur lors de l\'importation du fichier.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const addMeetingDate = () => {
    const newDate: MeetingDate = {
      type: 'CPUE',
      unit: '7 CCL',
      date: new Date().toISOString().split('T')[0]
    };
    setTempSettings({
      ...tempSettings,
      meetingDates: [...tempSettings.meetingDates, newDate]
    });
  };

  const updateMeetingDate = (index: number, field: keyof MeetingDate, value: string) => {
    const updatedDates = [...tempSettings.meetingDates];
    updatedDates[index] = { ...updatedDates[index], [field]: value };
    setTempSettings({
      ...tempSettings,
      meetingDates: updatedDates
    });
  };

  const removeMeetingDate = (index: number) => {
    setTempSettings({
      ...tempSettings,
      meetingDates: tempSettings.meetingDates.filter((_, i) => i !== index)
    });
  };

  const categories = Array.from(new Set(data.faqs.map(faq => faq.category)));

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Admin Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900">Administration</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'faqs', label: 'Gestion FAQ', icon: Plus },
            { id: 'settings', label: 'Paramètres', icon: Settings },
            { id: 'import', label: 'Import/Export', icon: Upload }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* FAQ Management Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-8">
            {/* Add New FAQ */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter une nouvelle FAQ</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                  <textarea
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Réponse *</label>
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <input
                    type="text"
                    value={newFaq.category}
                    onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: RH, Plannings..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mots-clés</label>
                  <input
                    type="text"
                    value={newFaq.keywords}
                    onChange={(e) => setNewFaq({ ...newFaq, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Séparés par des virgules"
                  />
                </div>
              </div>
              <button
                onClick={handleAddFaq}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter la FAQ</span>
              </button>
            </div>

            {/* Existing FAQs */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">FAQs existantes ({data.faqs.length})</h3>
              <div className="space-y-4">
                {data.faqs.map(faq => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                    {editingFaq?.id === faq.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                          <textarea
                            value={editingFaq.question}
                            onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Réponse</label>
                          <textarea
                            value={editingFaq.answer}
                            onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                            <input
                              type="text"
                              value={editingFaq.category}
                              onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mots-clés</label>
                            <input
                              type="text"
                              value={Array.isArray(editingFaq.keywords) ? editingFaq.keywords.join(', ') : editingFaq.keywords}
                              onChange={(e) => setEditingFaq({ ...editingFaq, keywords: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={() => setEditingFaq(null)}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{faq.question}</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditFaq(faq)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{faq.answer}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">{faq.category}</span>
                          <span>Créé: {new Date(faq.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Basic Settings */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres généraux</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={tempSettings.contactEmail}
                    onChange={(e) => setTempSettings({ ...tempSettings, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code administrateur</label>
                  <input
                    type="password"
                    value={tempSettings.adminCode}
                    onChange={(e) => setTempSettings({ ...tempSettings, adminCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Meeting Dates */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Dates des réunions
                </h3>
                <button
                  onClick={addMeetingDate}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              <div className="space-y-3">
                {tempSettings.meetingDates.map((meeting, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <select
                      value={meeting.type}
                      onChange={(e) => updateMeetingDate(index, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="CPUE">CPUE</option>
                      <option value="CPC">CPC</option>
                    </select>
                    <select
                      value={meeting.unit}
                      onChange={(e) => updateMeetingDate(index, 'unit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {data.companies.map(company => (
                        <option key={company.id} value={company.name}>{company.name}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={meeting.date}
                      onChange={(e) => updateMeetingDate(index, 'date', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeMeetingDate(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Sauvegarder les paramètres</span>
            </button>
          </div>
        )}

        {/* Import/Export Tab */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            {/* File Import */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Importer des questions</h3>
              <p className="text-gray-600 mb-4">
                Importez des questions/réponses depuis des fichiers Word (.docx), PDF (.pdf) ou des sauvegardes JSON.
              </p>
              <div className="flex items-center space-x-4">
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>{isImporting ? 'Importation...' : 'Choisir un fichier'}</span>
                  <input
                    type="file"
                    accept=".docx,.pdf,.json"
                    onChange={handleFileImport}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
                {isImporting && <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Formats supportés: .docx, .pdf, .json
              </p>
            </div>

            {/* Export */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Exporter les données</h3>
              <p className="text-gray-600 mb-4">
                Téléchargez toutes vos données au format JSON pour créer une sauvegarde.
              </p>
              <button
                onClick={exportData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger la sauvegarde</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;