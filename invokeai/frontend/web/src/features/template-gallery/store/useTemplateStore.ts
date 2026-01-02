import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import * as templateDataSource from 'features/template-gallery/services/templateDataSource';
import type * as templateService from 'features/template-gallery/services/templateService';
import { useCallback } from 'react';

import {
  addTemplate,
  removeTemplateFromState,
  selectTemplateGallerySlice,
  setActiveTemplateId,
  setError,
  setLastFetchTime,
  setLoading,
  setTemplates,
  type Template,
  updateTemplateInState,
} from './templateGallerySlice';

export const useTemplateStore = () => {
  const dispatch = useAppDispatch();
  const { templates, loading, error, activeTemplateId, lastFetchTime } = useAppSelector(selectTemplateGallerySlice);

  const fetchTemplates = useCallback(async () => {
    dispatch(setLoading({ templates: true }));
    dispatch(setError(null));
    try {
      const data = await templateDataSource.fetchTemplateData();
      // Cast to Template[] as the service returns PromptTemplate[]
      dispatch(setTemplates(data as Template[]));
      dispatch(setLastFetchTime(Date.now()));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch templates';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading({ templates: false }));
    }
  }, [dispatch]);

  const refreshTemplates = useCallback(async () => {
    await fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(
    async (payload: templateService.TemplateCreateRequest) => {
      dispatch(setLoading({ create: true }));
      dispatch(setError(null));
      try {
        const newTemplate = await templateDataSource.createTemplateData(payload);
        dispatch(addTemplate(newTemplate as Template));
        return newTemplate as Template;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create template';
        dispatch(setError(message));
        throw err;
      } finally {
        dispatch(setLoading({ create: false }));
      }
    },
    [dispatch]
  );

  const updateTemplate = useCallback(
    async (id: string, payload: templateService.TemplateUpdateRequest) => {
      dispatch(setLoading({ update: true }));
      dispatch(setError(null));
      try {
        const updatedTemplate = await templateDataSource.updateTemplateData(id, payload);
        dispatch(updateTemplateInState(updatedTemplate as Template));
        return updatedTemplate as Template;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update template';
        dispatch(setError(message));
        throw err;
      } finally {
        dispatch(setLoading({ update: false }));
      }
    },
    [dispatch]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      dispatch(setLoading({ delete: true }));
      dispatch(setError(null));
      try {
        await templateDataSource.deleteTemplateData(id);
        dispatch(removeTemplateFromState(id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete template';
        dispatch(setError(message));
        throw err;
      } finally {
        dispatch(setLoading({ delete: false }));
      }
    },
    [dispatch]
  );

  const setActiveTemplate = useCallback(
    (id: string | null) => {
      dispatch(setActiveTemplateId(id));
    },
    [dispatch]
  );

  const invalidateCache = useCallback(() => {
    dispatch(setLastFetchTime(null));
  }, [dispatch]);

  return {
    templates,
    loading,
    error,
    activeTemplateId,
    lastFetchTime,
    fetchTemplates,
    refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setActiveTemplate,
    invalidateCache,
  };
};
