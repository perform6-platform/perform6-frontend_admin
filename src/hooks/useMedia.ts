import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import {
  deleteMediaAsset,
  getLibrarySummary,
  getMediaAsset,
  getMediaAssets,
  updateMediaAsset,
  uploadMedia,
} from '../services/media.api';
import type { MediaListQuery, UpdateMediaPayload, UploadMediaPayload } from '../types/media';

/** GET /media?libraryType=&status=&page=&limit= */
export function useMediaAssets(query: MediaListQuery = {}) {
  return useQuery({
    queryKey: queryKeys.media.list(query),
    queryFn: () => getMediaAssets(query),
  });
}

/** GET /media/library-summary */
export function useLibrarySummary() {
  return useQuery({
    queryKey: queryKeys.media.librarySummary,
    queryFn: getLibrarySummary,
  });
}

/** GET /media/:id */
export function useMediaAsset(id: string | null) {
  return useQuery({
    queryKey: queryKeys.media.detail(id ?? ''),
    queryFn: () => getMediaAsset(id as string),
    enabled: Boolean(id),
  });
}

/** POST /media/upload */
export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadMediaPayload) => uploadMedia(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

/** PATCH /media/:id */
export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: UpdateMediaPayload }) =>
      updateMediaAsset(vars.id, vars.payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}

/** DELETE /media/:id */
export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMediaAsset(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}
