export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  /** Optional company/unit associated with the question */
  company?: string;
  /** Optional date provided in imported data */
  date?: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface MeetingDate {
  type: 'CPUE' | 'CPC';
  unit: string;
  date: string;
}

export interface AppSettings {
  adminCode: string;
  contactEmail: string;
  meetingDates: MeetingDate[];
}

export interface AppData {
  faqs: FAQ[];
  companies: Company[];
  settings: AppSettings;
}