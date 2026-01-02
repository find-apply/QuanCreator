import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SliceConfig } from 'app/store/types';
import type { PromptTemplate } from 'features/template-gallery/types';
import { z } from 'zod';

export type TemplateSource = 'default' | 'user';

export interface Template extends PromptTemplate {
  userId?: string;
  source?: TemplateSource;
}

interface TemplateLoadingState {
  templates: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface TemplateGalleryState {
  templates: Template[];
  loading: TemplateLoadingState;
  error: string | null;
  activeTemplateId: string | null;
  lastFetchTime: number | null;
}

const initialLoadingState: TemplateLoadingState = {
  templates: false,
  create: false,
  update: false,
  delete: false,
};

const initialState: TemplateGalleryState = {
  templates: [],
  loading: initialLoadingState,
  error: null,
  activeTemplateId: null,
  lastFetchTime: null,
};

const zTemplateGalleryState = z.object({
  templates: z.array(z.any()), // Simplified for now
  loading: z.object({
    templates: z.boolean(),
    create: z.boolean(),
    update: z.boolean(),
    delete: z.boolean(),
  }),
  error: z.string().nullable(),
  activeTemplateId: z.string().nullable(),
  lastFetchTime: z.number().nullable(),
});

export const templateGallerySlice = createSlice({
  name: 'templateGallery',
  initialState,
  reducers: {
    setTemplates: (state, action: PayloadAction<Template[]>) => {
      state.templates = action.payload;
    },
    setLoading: (state, action: PayloadAction<Partial<TemplateLoadingState>>) => {
      state.loading = { ...state.loading, ...action.payload };
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setActiveTemplateId: (state, action: PayloadAction<string | null>) => {
      state.activeTemplateId = action.payload;
    },
    setLastFetchTime: (state, action: PayloadAction<number | null>) => {
      state.lastFetchTime = action.payload;
    },
    addTemplate: (state, action: PayloadAction<Template>) => {
      state.templates.unshift(action.payload);
    },
    updateTemplateInState: (state, action: PayloadAction<Template>) => {
      const index = state.templates.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    removeTemplateFromState: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setTemplates,
  setLoading,
  setError,
  setActiveTemplateId,
  setLastFetchTime,
  addTemplate,
  updateTemplateInState,
  removeTemplateFromState,
} = templateGallerySlice.actions;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selectTemplateGallerySlice = (state: any): TemplateGalleryState => state.templateGallery;

export const templateGallerySliceConfig: SliceConfig<typeof templateGallerySlice> = {
  slice: templateGallerySlice,
  schema: zTemplateGalleryState,
  getInitialState: () => initialState,
};

export default templateGallerySlice.reducer;
