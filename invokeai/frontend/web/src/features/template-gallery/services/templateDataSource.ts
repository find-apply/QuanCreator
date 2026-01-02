import type { PromptCategory, PromptTemplate } from 'features/template-gallery/types';

import {
  type CategoryCreateRequest,
  type CategoryUpdateRequest,
  createCategory as createCategoryApi,
  deleteCategory as deleteCategoryApi,
  fetchCategories as fetchCategoriesApi,
  updateCategory as updateCategoryApi,
} from './categoryService';
import {
  createTemplate as createTemplateApi,
  deleteTemplate as deleteTemplateApi,
  duplicateTemplate as duplicateTemplateApi,
  fetchTemplates as fetchTemplatesApi,
  type TemplateCreateRequest,
  type TemplateUpdateRequest,
  updateTemplate as updateTemplateApi,
} from './templateService';

export const USE_MOCK_TEMPLATE_API = true;

const NETWORK_DELAY_MS = 450;

const buildUnsplashUrl = (query: string) => `https://images.unsplash.com/${query}?auto=format&fit=crop&w=300&q=80`;

const initialMockCategories: PromptCategory[] = [
  {
    id: 'cat-branding',
    name: 'Branding Kits',
    description: 'Logos, social avatars, and hero banners',
    emoji: ':art:',
    image: buildUnsplashUrl('photo-1526481280695-3c46979f7b51'),
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    isDefault: true,
  },
  {
    id: 'cat-product',
    name: 'Product Launch',
    description: 'Studio-grade packshots and lifestyle visuals',
    emoji: ':rocket:',
    image: buildUnsplashUrl('photo-1498050108023-c5249f4df085'),
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
    isDefault: true,
  },
  {
    id: 'cat-fashion',
    name: 'Fashion Editorial',
    description: 'High-end editorials for lookbooks and campaigns',
    emoji: ':fashion:',
    image: buildUnsplashUrl('photo-1524504388940-b1c1722653e1'),
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 30,
    isDefault: false,
  },
  {
    id: 'cat-ui',
    name: 'UI Concepts',
    description: 'Landing sections, hero shots, and mock devices',
    emoji: ':idea:',
    image: buildUnsplashUrl('photo-1461749280684-dccba630e2f6'),
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 15,
    isDefault: false,
  },
];

const initialMockTemplates: PromptTemplate[] = [
  {
    id: 'tpl-lux-watch',
    name: 'Luxury Watch Spotlight',
    description: 'Dramatic studio lighting over brushed metal surfaces for a premium watch hero shot.',
    positivePrompt:
      'ultra sharp macro photography of a swiss watch on brushed steel stand, dramatic rim lighting, volumetric fog, F1.2 bokeh, Hasselblad H6D style, cinematic teal and amber color grade',
    negativePrompt:
      'text, logo watermark, lowres, motion blur, hands, people, grainy, cartoon, duplicate object, disfigured',
    categoryId: 'cat-product',
    emoji: ':watch:',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80',
    isDefault: true,
    isEditable: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: 'tpl-cyber-portrait',
    name: 'Neon Cyber Portrait',
    description: 'Cyberpunk-inspired portrait with neon reflections and depth.',
    positivePrompt:
      'hyperreal portrait of a young woman, cyberpunk tokyo alley, reflective rain, neon holograms, teal and magenta glow, cinematic lighting, sony a7r iv, 85mm lens, ultradetail skin',
    negativePrompt: 'old, low detail, grainy, anatomical errors, text overlay, double face, distortion, makeup smudge',
    categoryId: 'cat-fashion',
    emoji: ':robot:',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    isDefault: true,
    isEditable: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    updatedAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'tpl-minimal-brand',
    name: 'Minimal Brand Grid',
    description: 'Clean desktop layout showcasing three digital product cards.',
    positivePrompt:
      'minimalist ui landing page, glassmorphism cards, pastel gradient background, isometric layout, soft drop shadows, figma render, 8k, crisp typography, responsive web hero',
    negativePrompt: 'photograph, people, cluttered, overcrowded, noisy texture, saturated red, text paragraphs',
    categoryId: 'cat-ui',
    emoji: ':panel:',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    isDefault: true,
    isEditable: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 20,
  },
  {
    id: 'tpl-summer-lookbook',
    name: 'Summer Lookbook Duo',
    description: 'Two-panel editorial featuring airy fabrics under natural light.',
    positivePrompt:
      'fashion editorial photo of two models, flowing linen outfits, rooftop golden hour, shallow depth of field, kodak portra 800, airy color grading, magazine layout split composition',
    negativePrompt: 'crowd, harsh shadows, motion blur, low contrast, studio background, winter clothing',
    categoryId: 'cat-fashion',
    emoji: ':sunny:',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    isDefault: true,
    isEditable: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    updatedAt: Date.now() - 1000 * 60 * 10,
  },
];

let mockCategories = [...initialMockCategories];
let mockTemplates = [...initialMockTemplates];
let mockTemplateCounter = mockTemplates.length + 1;
let mockCategoryCounter = mockCategories.length + 1;

const nextMockTemplateId = () => `user_mock_${mockTemplateCounter++}`;
const nextMockCategoryId = () => `cat_mock_${mockCategoryCounter++}`;

const buildTemplateFromPayload = (
  payload: TemplateCreateRequest,
  overrides: Partial<PromptTemplate> = {}
): PromptTemplate => {
  const timestamp = Date.now();
  return {
    id: overrides.id ?? nextMockTemplateId(),
    name: payload.name,
    name_cn: payload.name_cn,
    description: payload.description || '',
    positivePrompt: payload.positivePrompt,
    prompt_cn: payload.prompt_cn,
    negativePrompt: payload.negativePrompt || '',
    negative_prompt_cn: payload.negative_prompt_cn,
    categoryId: payload.categoryId || undefined,
    emoji: payload.emoji,
    image: payload.image,
    isDefault: false,
    isEditable: true,
    createdAt: overrides.createdAt ?? timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
};

const simulateRequest = async <T>(payload: T, signal?: AbortSignal): Promise<T> => {
  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      try {
        const cloned = JSON.parse(JSON.stringify(payload));
        resolve(cloned);
      } catch {
        resolve(payload);
      }
    }, NETWORK_DELAY_MS);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
};

export const fetchTemplateData = async (signal?: AbortSignal): Promise<PromptTemplate[]> => {
  if (USE_MOCK_TEMPLATE_API) {
    return await simulateRequest(mockTemplates, signal);
  }
  return await fetchTemplatesApi();
};

export const fetchCategoryData = async (signal?: AbortSignal): Promise<PromptCategory[]> => {
  if (USE_MOCK_TEMPLATE_API) {
    return await simulateRequest(mockCategories, signal);
  }
  return await fetchCategoriesApi();
};

export const createTemplateData = async (
  payload: TemplateCreateRequest,
  signal?: AbortSignal
): Promise<PromptTemplate> => {
  if (USE_MOCK_TEMPLATE_API) {
    const template = buildTemplateFromPayload(payload);
    mockTemplates = [template, ...mockTemplates];
    return await simulateRequest(template, signal);
  }
  return await createTemplateApi(payload);
};

export const updateTemplateData = async (
  templateId: string,
  payload: TemplateUpdateRequest,
  signal?: AbortSignal
): Promise<PromptTemplate> => {
  if (USE_MOCK_TEMPLATE_API) {
    const idx = mockTemplates.findIndex((template) => template.id === templateId);
    if (idx === -1) {
      throw new Error('Template not found');
    }

    const mergedPayload: TemplateCreateRequest = {
      name: payload.name ?? mockTemplates[idx]!.name,
      name_cn: payload.name_cn ?? mockTemplates[idx]!.name_cn,
      description: payload.description ?? mockTemplates[idx]!.description,
      positivePrompt: payload.positivePrompt ?? mockTemplates[idx]!.positivePrompt,
      prompt_cn: payload.prompt_cn ?? mockTemplates[idx]!.prompt_cn,
      negativePrompt: payload.negativePrompt ?? mockTemplates[idx]!.negativePrompt,
      negative_prompt_cn: payload.negative_prompt_cn ?? mockTemplates[idx]!.negative_prompt_cn,
      categoryId: payload.categoryId === undefined ? mockTemplates[idx]!.categoryId : payload.categoryId || undefined,
      emoji: payload.emoji ?? mockTemplates[idx]!.emoji,
      image: payload.image ?? mockTemplates[idx]!.image,
      isDefault: payload.isDefault ?? mockTemplates[idx]!.isDefault,
    };

    const updatedTemplate = buildTemplateFromPayload(mergedPayload, {
      id: templateId,
      createdAt: mockTemplates[idx]!.createdAt,
      isDefault: mergedPayload.isDefault,
    });

    mockTemplates = [...mockTemplates.slice(0, idx), updatedTemplate, ...mockTemplates.slice(idx + 1)];

    return simulateRequest(updatedTemplate, signal);
  }

  return await updateTemplateApi(templateId, payload);
};

export const duplicateTemplateData = async (templateId: string, signal?: AbortSignal): Promise<PromptTemplate> => {
  if (USE_MOCK_TEMPLATE_API) {
    const original = mockTemplates.find((template) => template.id === templateId);
    if (!original) {
      throw new Error('Template not found');
    }

    const duplicated = buildTemplateFromPayload(
      {
        name: `${original.name} (Copy)`,
        description: original.description,
        positivePrompt: original.positivePrompt,
        negativePrompt: original.negativePrompt,
        categoryId: original.categoryId,
        emoji: original.emoji,
        image: original.image,
      },
      {
        isDefault: false,
        isEditable: true,
      }
    );

    mockTemplates = [duplicated, ...mockTemplates];
    return await simulateRequest(duplicated, signal);
  }

  return await duplicateTemplateApi(templateId);
};

export const deleteTemplateData = async (templateId: string, signal?: AbortSignal): Promise<void> => {
  if (USE_MOCK_TEMPLATE_API) {
    const idx = mockTemplates.findIndex((template) => template.id === templateId);
    if (idx === -1) {
      throw new Error('Template not found');
    }

    if (mockTemplates[idx]!.isDefault) {
      throw new Error('Cannot delete default templates');
    }

    mockTemplates = [...mockTemplates.slice(0, idx), ...mockTemplates.slice(idx + 1)];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await simulateRequest(undefined as any, signal);
  }

  return await deleteTemplateApi(templateId);
};

export const createCategoryData = async (
  payload: CategoryCreateRequest,
  signal?: AbortSignal
): Promise<PromptCategory> => {
  if (USE_MOCK_TEMPLATE_API) {
    const category: PromptCategory = {
      id: nextMockCategoryId(),
      name: payload.name,
      emoji: ':folder:',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: false,
      parentId: payload.parentId,
    };
    mockCategories = [...mockCategories, category];
    return await simulateRequest(category, signal);
  }
  return await createCategoryApi(payload);
};

export const updateCategoryData = async (
  id: string,
  payload: CategoryUpdateRequest,
  signal?: AbortSignal
): Promise<PromptCategory> => {
  if (USE_MOCK_TEMPLATE_API) {
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error('Category not found');
    }

    const updated: PromptCategory = {
      ...mockCategories[idx]!,
      ...payload,
      image: payload.image ?? mockCategories[idx]!.image,
      emoji: payload.emoji ?? mockCategories[idx]!.emoji,
      parentId: payload.parentId ?? mockCategories[idx]!.parentId,
      updatedAt: Date.now(),
    };
    mockCategories = [...mockCategories.slice(0, idx), updated, ...mockCategories.slice(idx + 1)];
    return await simulateRequest(updated, signal);
  }
  return await updateCategoryApi(id, payload);
};

export const deleteCategoryData = async (id: string, signal?: AbortSignal): Promise<void> => {
  if (USE_MOCK_TEMPLATE_API) {
    mockCategories = mockCategories.filter((c) => c.id !== id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await simulateRequest(undefined as any, signal);
  }
  return await deleteCategoryApi(id);
};

export interface TemplateType {
  id: 'all' | 'official' | 'mine';
  label: string;
}

export const fetchTemplateTypes = async (): Promise<TemplateType[]> => {
  return await Promise.resolve([
    { id: 'all', label: 'All' },
    { id: 'official', label: 'Official' },
    { id: 'mine', label: 'My Templates' },
  ]);
};
