
import { Note, NoteTag } from "./note";

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface FetchNotesResponse {
  page: number;
  data: Note[];
  totalPages: number;
  perPage: number;
  total: number;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}