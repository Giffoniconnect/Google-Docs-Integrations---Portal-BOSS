export type Page = 'central' | 'detail';

export interface DocCard {
  id: string;
  title: string;
  badge: string;
  description: string;
  status: 'active' | 'development';
  icon: string;
  category: 'pf' | 'pj';
  route: string;
  configRoute: string;
  documentType: string;
}

export type GoogleDocsCard = DocCard;

export interface GdiLogEntry {
  timestamp: string;
  step: string;
  status: 'success' | 'failed';
  message: string;
  details?: string;
}
