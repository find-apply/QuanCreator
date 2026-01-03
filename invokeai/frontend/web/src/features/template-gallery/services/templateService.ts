/**
 * Template API Service
 */

import type { PromptTemplate } from 'features/template-gallery/types';

import { convertToApiAssetUrl, joinBackendPath } from './apiConfig';

export interface TemplateCreateRequest {
  name: string;
  name_cn?: string;
  description?: string;
  positivePrompt: string;
  prompt_cn?: string;
  negativePrompt?: string;
  negative_prompt_cn?: string;
  categoryId?: string;
  categoryIds?: string[];
  emoji?: string;
  image?: string;
  isDefault?: boolean;
  assignedUserIds?: string[];
}

export interface TemplateUpdateRequest {
  name?: string;
  name_cn?: string;
  description?: string;
  positivePrompt?: string;
  prompt_cn?: string;
  negativePrompt?: string;
  negative_prompt_cn?: string;
  categoryId?: string | null;
  categoryIds?: string[] | null;
  emoji?: string | null;
  image?: string | null;
  isDefault?: boolean;
  assignedUserIds?: string[];
}

const getAuthHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer 360|ZRJ76h5eHHDICDWPZ6UywR8D8nvjHMf691oSIKZV535d04c8',
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTemplateResponse = (template: any): PromptTemplate => {
  const isSystem = template.user_id === null;

  const categoryIds = template.categories
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      template.categories.map((c: any) => c.id.toString())
    : template.category_id
      ? [template.category_id.toString()]
      : [];

  const categories = template.categories
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      template.categories.map((c: any) => ({
        id: c.id.toString(),
        name: c.name,
        name_cn: c.name_cn,
        description: c.description,
        emoji: c.emoji,
        image: c.image_url || (c.image ? convertToApiAssetUrl(c.image) : undefined),
        type: c.type || (c.user_id === null ? 'official' : 'user'),
      }))
    : [];

  return {
    id: template.id?.toString() || '',
    name: template.name || '',
    name_cn: template.name_cn || undefined,
    description: template.description || '',
    positivePrompt: template.prompt || '',
    prompt_cn: template.prompt_cn || undefined,
    negativePrompt: template.negative_prompt || template.negativePrompt || '',
    negative_prompt_cn: template.negative_prompt_cn || undefined,
    categoryId: template.category_id?.toString() || undefined,
    categoryIds: categoryIds,
    categories: categories,
    emoji: undefined,
    image: template.image ? convertToApiAssetUrl(template.image) : undefined,
    isDefault: isSystem,
    isEditable: !isSystem,
    assignedUserIds: [],
    createdAt: template.created_at ? new Date(template.created_at).getTime() : Date.now(),
    updatedAt: template.updated_at ? new Date(template.updated_at).getTime() : undefined,
  };
};

export const fetchTemplates = async (): Promise<PromptTemplate[]> => {
  const response = await fetch(joinBackendPath('/api/v3/templates'), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let message = 'Failed to load templates';
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === 'string') {
        message = errorBody.message;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error parsing template response:', e);
    }
    throw new Error(message);
  }

  const json = await response.json();
  const data = json.success ? json.data : json;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(mapTemplateResponse);
};

export const createTemplate = async (payload: TemplateCreateRequest): Promise<PromptTemplate> => {
  const response = await fetch(joinBackendPath('/api/v3/templates'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create template');
  }

  const json = await response.json();
  return mapTemplateResponse(json.data || json);
};

export const updateTemplate = async (templateId: string, payload: TemplateUpdateRequest): Promise<PromptTemplate> => {
  const response = await fetch(joinBackendPath(`/api/v3/templates/${templateId}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update template');
  }

  const json = await response.json();
  return mapTemplateResponse(json.data || json);
};

export const deleteTemplate = async (templateId: string): Promise<void> => {
  const response = await fetch(joinBackendPath(`/api/v3/templates/${templateId}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete template');
  }
};

export const duplicateTemplate = async (templateId: string): Promise<PromptTemplate> => {
  // Mock implementation for now

  // eslint-disable-next-line no-console
  console.log('Duplicate template not implemented', templateId);
  await Promise.resolve();
  throw new Error('Duplicate not implemented');
};
