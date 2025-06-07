import React from 'react';
import { MessageCircle, Tag, Calendar } from 'lucide-react';
import { FAQ } from '../types';

interface FAQListProps {
  faqs: FAQ[];
  searchTerm?: string;
}

const FAQList: React.FC<FAQListProps> = ({ faqs, searchTerm }) => {
  if (faqs.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune question trouvée avec ces critères.</p>
      </div>
    );
  }

  const highlight = (text: string) => {
    if (!searchTerm) return text;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6">
      {searchTerm && (
        <p className="text-sm text-gray-600">
          {faqs.length} résultat{faqs.length > 1 ? 's' : ''}
        </p>
      )}
      {faqs.map((faq) => (
        <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
                {highlight(faq.question)}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Tag className="h-4 w-4" />
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {faq.category}
                </span>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              {faq.answer.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {highlight(paragraph)}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Créé le {new Date(faq.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                {faq.updatedAt !== faq.createdAt && (
                  <div className="flex items-center space-x-1">
                    <span>Modifié le {new Date(faq.updatedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
              
              {faq.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {faq.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQList;