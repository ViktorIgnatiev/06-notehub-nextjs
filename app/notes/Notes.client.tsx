'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import css from './NotesPage.module.css';
import NoteList from '@/components/NoteList/NoteList';
import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import Modal from '@/components/Modal/Modal';
import NoteForm from '@/components/NoteForm/NoteForm';
import { fetchNotes } from '@/lib/api';
import type { FetchNotesResponse } from '@/types/api';

interface NotesClientProps {
  initialData: FetchNotesResponse;
}

export default function NotesClient({ initialData }: NotesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [debouncedSearchTerm] = useDebounce<string>(searchTerm, 500);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notes', page, debouncedSearchTerm],
    queryFn: () => fetchNotes({ page, perPage: 12, search: debouncedSearchTerm }),
    placeholderData: (previousData) => previousData,
    initialData: page === 1 && !debouncedSearchTerm ? initialData : undefined,
  });


  const handleCreateNote = useCallback((): void => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback((): void => {
    setIsModalOpen(false);
    refetch();
  }, [refetch]);

  const handleSearchChange = useCallback((value: string): void => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((selectedPage: number): void => {
    setPage(selectedPage);
  }, []);

  if (isLoading) {
    return <p>Loading, please wait...</p>;
  }

  if (isError) {
    return <p>Could not fetch the list of notes. {error.message}</p>;
  }

  const hasNotes: boolean = !!data?.data?.length;
  const totalPages: number = data?.totalPages ?? 1;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchTerm} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
        <button className={css.button} onClick={handleCreateNote}>
          Create note +
        </button>
      </header>

      <main className={css.main}>
        {hasNotes ? (
          <NoteList notes={data!.data || []} onNoteDeleted={refetch} />
        ) : (
          <p>No notes found. Create your first note!</p>
        )}
      </main>

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <NoteForm onSuccess={handleCloseModal} />
        </Modal>
      )}
    </div>
  );
}