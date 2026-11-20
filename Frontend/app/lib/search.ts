import { api } from './api';

export type GlobalSearchKind = 'habit' | 'resource' | 'journal' | 'note';

export interface GlobalSearchResult {
  id: string;
  kind: GlobalSearchKind;
  title: string;
  subtitle: string;
}

export function searchEverything(query: string) {
  const params = new URLSearchParams({ q: query });
  return api<GlobalSearchResult[]>(`/search?${params.toString()}`);
}
