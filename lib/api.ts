import axios from "axios";
import type { FetchNotesParams, FetchNotesResponse, CreateNoteParams } from "@/types/api";
import { Note } from "../types/note";

const API_BASE_URL = 'https://notehub-public.goit.study/api';
const token = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;

if (!token) {
  console.error('NEXT_PUBLIC_NOTEHUB_TOKEN is not defined. Please set your NoteHub API token in your .env file.');
  throw new Error('NEXT_PUBLIC_NOTEHUB_TOKEN is not defined. Please check your .env configuration.');
}

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

axios.interceptors.request.use(config => {
  console.log('Making request to:', config.url);
  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

interface RawFetchNotesResponse {
  notes: Note[];
  totalPages: number;
  total: number;
}

export const fetchNotes = async ({
  page = 1,
  perPage = 12,
  search
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const requestParams: {
  page: number;
  perPage: number;
  search?: string;
} = {
  page,
  perPage,
};

  if (search) {
    requestParams.search = search;
  }

  const response = await axios.get<RawFetchNotesResponse>('/notes', {
    params: requestParams,
  });

  return {
    page,
    perPage,
    data: response.data.notes,
    totalPages: response.data.totalPages,
    total: response.data.total,
  };
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response = await axios.get<Note>(`/notes/${id}`);
  return response.data;
};

export const createNote = async (noteData: CreateNoteParams): Promise<Note> => {
  const response = await axios.post<Note>('/notes', noteData);
  return response.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response = await axios.delete<Note>(`/notes/${id}`);
  return response.data;
};

