import { api, apiUpload, BASE_URL } from './api';

export type ResourceType = 'Book' | 'Article' | 'YouTube' | 'Documentary';
export type ResourceStatus = 'Plan to Do' | 'In Progress' | 'Completed';
export type ResourceCategory = 'Productivity' | 'Focus' | 'Finance' | 'Philosophy';

export interface EpubProgress {
  cfi: string;
  percentage: number;
  updatedAt: string;
}

export interface AttachmentMetadata {
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  epubProgress?: EpubProgress;
}

export interface Resource {
  _id: string;
  user?: string;
  title: string;
  type: ResourceType;
  author?: string;
  link?: string;
  status: ResourceStatus;
  category?: ResourceCategory;
  pages?: number;
  currentPage: number;
  summary?: string;
  rating?: number;
  progress: number;
  attachment?: AttachmentMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ResourcesResponse {
  resources: Resource[];
  totalPages: number;
  currentPage: number;
  totalResources: number;
}

export interface CreateResourceInput {
  title: string;
  type: ResourceType;
  author?: string;
  link?: string;
  status?: ResourceStatus;
  category?: ResourceCategory;
  pages?: number;
  currentPage?: number;
  summary?: string;
  rating?: number;
}

export type UpdateResourceInput = Partial<CreateResourceInput>;

export interface NoteResource {
  _id: string;
  title: string;
  author?: string;
}

export interface Note {
  _id: string;
  user?: string;
  title?: string;
  content: string;
  quote?: string;
  tags: string[];
  resource?: NoteResource;
  habit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesResponse {
  notes: Note[];
  totalPages: number;
  currentPage: number;
  totalNotes: number;
}

export interface CreateNoteInput {
  title?: string;
  content?: string;
  quote?: string;
  tags?: string[];
  resourceId?: string;
  habitId?: string;
}

export type UpdateNoteInput = Partial<CreateNoteInput>;

// -------------------------------------------------------------
// Resource API Operations
// -------------------------------------------------------------

export async function fetchResources(params: {
  type?: ResourceType;
  status?: ResourceStatus;
  category?: ResourceCategory;
  q?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ResourcesResponse> {
  const query = new URLSearchParams();

  if (params.type) query.set('type', params.type);
  if (params.status) query.set('status', params.status);
  if (params.category) query.set('category', params.category);
  if (params.q) query.set('q', params.q);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const path = qs ? `/resources?${qs}` : '/resources';
  return api<ResourcesResponse>(path);
}

export async function fetchBooks(limit = 50): Promise<ResourcesResponse> {
  return fetchResources({ type: 'Book', limit });
}

export async function createResource(data: CreateResourceInput): Promise<Resource> {
  return api<Resource>('/resources', {
    method: 'POST',
    body: data,
  });
}

export async function updateResource(
  id: string,
  data: UpdateResourceInput,
): Promise<Resource> {
  return api<Resource>(`/resources/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

export async function deleteResource(id: string): Promise<void> {
  return api<void>(`/resources/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadBookAttachment(
  id: string,
  file: File,
): Promise<Resource> {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<Resource>(`/resources/${id}/attachment`, formData, {
    method: 'POST',
  });
}

export async function deleteBookAttachment(id: string): Promise<Resource> {
  return api<Resource>(`/resources/${id}/attachment`, {
    method: 'DELETE',
  });
}

export async function updateEpubReadingProgress(
  id: string,
  data: { cfi: string; percentage: number },
): Promise<Resource> {
  return api<Resource>(`/resources/${id}/attachment/progress`, {
    method: 'PATCH',
    body: data,
  });
}

export function getBookAttachmentStreamUrl(id: string): string {
  return `${BASE_URL}/resources/${id}/attachment`;
}

// -------------------------------------------------------------
// Note API Operations
// -------------------------------------------------------------

export async function fetchNotes(params: {
  tag?: string;
  resourceId?: string;
  habitId?: string;
  page?: number;
  limit?: number;
} = {}): Promise<NotesResponse> {
  const query = new URLSearchParams();

  if (params.tag) query.set('tag', params.tag);
  if (params.resourceId) query.set('resourceId', params.resourceId);
  if (params.habitId) query.set('habitId', params.habitId);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const path = qs ? `/notes?${qs}` : '/notes';
  return api<NotesResponse>(path);
}

export async function createNote(data: CreateNoteInput): Promise<Note> {
  return api<Note>('/notes', {
    method: 'POST',
    body: data,
  });
}

export async function updateNote(
  id: string,
  data: UpdateNoteInput,
): Promise<Note> {
  return api<Note>(`/notes/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

export async function deleteNote(id: string): Promise<void> {
  return api<void>(`/notes/${id}`, {
    method: 'DELETE',
  });
}
