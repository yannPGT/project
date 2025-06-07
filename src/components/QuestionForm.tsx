import React, { useState } from 'react';
import { Send, Mail, CheckCircle } from 'lucide-react';
import { Company } from '../types';

interface QuestionFormProps {
  companies: Company[];
  contactEmail: string;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ companies, contactEmail }) => {
  const [formData, setFormData] = useState({
    company: '',
    question: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company || !formData.question.trim()) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const company = companies.find(c => c.id === formData.company);
    const subject = `Nouvelle question - ${company?.name}`;
    const body = `Compagnie: ${company?.name}\n\nQuestion:\n${formData.question}`;
    
    const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    setIsSubmitted(true);
    setFormData({ company: '', question: '' });
    
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Question envoyée !</h3>
          <p className="text-gray-600">
            Votre question a été transmise à l'équipe administrative. 
            Vous recevrez une réponse dans les plus brefs délais.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Mail className="h-6 w-6 text-red-600" />
        <h2 className="text-xl font-semibold text-gray-900">Poser une question</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Selection */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            Compagnie d'affectation *
          </label>
          <select
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionnez votre compagnie</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* Question Input */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            Votre question *
          </label>
          <textarea
            id="question"
            rows={6}
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Décrivez votre question de manière détaillée..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Send className="h-5 w-5" />
          <span>Envoyer la question</span>
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-500">
        <p>* Champs obligatoires</p>
        <p>Votre question sera envoyée par e-mail à l'équipe administrative.</p>
      </div>
    </div>
  );
};

export default QuestionForm;