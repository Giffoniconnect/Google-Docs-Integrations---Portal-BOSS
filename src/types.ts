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
}
