export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
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