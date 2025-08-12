import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import getQueryClient from '@/utils/getQueryClient';
import { fetchNotes } from '@/lib/api';
import NotesClient from './Notes.client';
// import type { FetchNotesResponse } from '@/types/api';

export default async function NotesPage() {
  const queryClient = getQueryClient();
  
  const initialData = await fetchNotes({ page: 1, perPage: 12 });

  await queryClient.prefetchQuery({
    queryKey: ['notes', 1, ''],
    queryFn: () => initialData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient initialData={initialData} />
    </HydrationBoundary>
  );
}