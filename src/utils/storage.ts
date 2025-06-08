import { AppData, FAQ, AppSettings } from '../types';

const STORAGE_KEY = 'echogis1-data';

const defaultData: AppData = {
  faqs: [
    {
      id: '1',
      question: 'Comment accéder aux plannings de service ?',
      answer: 'Les plannings de service sont disponibles sur l\'intranet dans la section "Plannings". Vous pouvez les consulter en ligne ou les télécharger au format PDF.',
      category: 'Plannings',
      keywords: ['planning', 'service', 'horaires'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      company: 'EMGIS1',
      date: '2024-01-15'
    },
    {
      id: '2',
      question: 'Procédure pour les demandes de congés ?',
      answer: 'Les demandes de congés doivent être effectuées via le formulaire dédié sur l\'intranet, au minimum 15 jours avant la date souhaitée. Votre chef d\'unité validera la demande.',
      category: 'RH',
      keywords: ['congés', 'vacances', 'demande'],
      createdAt: '2024-01-16T14:30:00Z',
      updatedAt: '2024-01-16T14:30:00Z',
      company: 'EMGIS1',
      date: '2024-01-16'
    },
    {
      id: '3',
      question: 'Le format des CCPM conduit cette année au sein de la compagnie est particulièrement apprécié pour la très grande majorité des SPP de la compagnie [nombreuses sessions d\u2019\u00e9valuations (1/CS/semaine pendant 6 semaines), effectif r\u00e9duit par session (10 \u00e0 15 PAX)]. Comment s\u2019organiseront-ils dans les mois \u00e0 venir ?',
      answer: 'L\u2019\u00e9volution de la situation sanitaire nous permettra de d\u00e9terminer avec le BOI le portage \u00e0 adopter. Le format propos\u00e9 cette ann\u00e9e a permis de d\u00e9couvrir davantage groupe EPMS de l\u2019EMG1. Les sessions de passage en nombre limit\u00e9 permettent un dialogue plus facile avec les cadres du bureau des sports. En outre, il s\u2019agit d\u2019une r\u00e9flexion plus globale quant \u00e0 l\u2019emploi du G.EPMS de l\u2019EMG1 au profit de l\u2019unit\u00e9. Dans l\u2019id\u00e9al, il s\u2019agit de d\u00e9terminer autant que possible des dates tr\u00e8s r\u00e9guli\u00e8res de passage du personnel qualifi\u00e9 dans les 3 CS de l\u2019unit\u00e9 afin de tirer pleinement parti de leur expertise technique, en dehors de tout contexte d\u00e9valuation.',
      category: 'CCPM',
      keywords: [],
      createdAt: '2021-05-10T00:00:00Z',
      updatedAt: '2021-05-10T00:00:00Z',
      company: '14e compagnie',
      date: '2021-05-10'
    }
  ],
  companies: [
    { id: '7', name: '7 CCL' },
    { id: '9', name: '9 CCL' },
    { id: '10', name: '10 CCL' },
    { id: '12', name: '12 CCL' },
    { id: '13', name: '13 CCL' },
    { id: '14', name: '14 CCL' },
    { id: '20', name: '20 CCL' },
    { id: '24', name: '24 CCL' },
    { id: '26', name: '26 CCL' },
    { id: 'emgis1', name: 'EMGIS1' }
  ],
  settings: {
    adminCode: 'pompiers',
    contactEmail: 'admin@gis1.fr',
    meetingDates: [
      {
        type: 'CPUE',
        unit: '7 CCL',
        date: '2024-02-15'
      },
      {
        type: 'CPC',
        unit: '9 CCL',
        date: '2024-02-20'
      },
      {
        type: 'CPUE',
        unit: 'EMGIS1',
        date: '2024-02-25'
      }
    ]
  }
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Merge with default data to ensure all properties exist
      return {
        ...defaultData,
        ...data,
        settings: {
          ...defaultData.settings,
          ...data.settings
        },
        faqs: data.faqs.map((f: FAQ) => ({
          company: '',
          date: '',
          ...f
        }))
      };
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return defaultData;
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const exportData = (): void => {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `echogis1-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        saveData(data);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};