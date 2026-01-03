/**
 * Category API Service
 * Handles all category-related API calls
 */

import type { PromptCategory } from 'features/template-gallery/types';

import { buildJsonHeaders, convertToApiAssetUrl, joinBackendPath } from './apiConfig';
import { fetchWithAuth } from './fetchWithAuth';

const USER_CATEGORY_V3_PATH = '/api/v3/categories';
const USER_CATEGORY_PATH = '/api/v1/user/categories';

export interface CategoryBaseRequest {
  name?: string;
  isActive?: boolean;
  image?: string | null;
  emoji?: string | null;
  parentId?: string | null;
}

export interface CategoryCreateRequest extends CategoryBaseRequest {
  name: string;
  parentType?: 'user' | 'official';
  type?: 'official' | 'private' | 'trial' | 'user';
}

export interface CategoryUpdateRequest extends CategoryBaseRequest {
  parentType?: 'user' | 'official';
}

const buildAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Authorization: 'Bearer 360|ZRJ76h5eHHDICDWPZ6UywR8D8nvjHMf691oSIKZV535d04c8',
  };
  // TODO: Integrate with QuanCreator auth
  return headers;
};

const generateCategoryId = () => `category_${Math.random().toString(36).slice(2, 10)}`;

const parseTimestamp = (value?: string | number | null): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }
  return Date.now();
};

const mapCategoryResponse = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category: any,
  overrides: Partial<PromptCategory> = {}
): PromptCategory => {
  const imageUrl = category?.image_url
    ? category.image_url
    : category?.image
      ? convertToApiAssetUrl(category.image)
      : overrides.image;

  return {
    id: category?.id?.toString() ?? generateCategoryId(),
    name: category?.name ?? '',
    name_cn: category?.name_cn,
    description: category?.description ?? '',
    emoji: category?.emoji ?? overrides.emoji ?? undefined,
    image: imageUrl,
    createdAt: parseTimestamp(category?.created_at ?? category?.createdAt),
    updatedAt: parseTimestamp(category?.updated_at ?? category?.updatedAt),
    isDefault: overrides.isDefault ?? Boolean(category?.is_default ?? category?.isDefault ?? false),
    type: category?.type ?? overrides.type ?? undefined,
    order: category?.order,
    parentId:
      category?.parent_id !== null && category?.parent_id !== undefined
        ? String(category.parent_id)
        : category?.system_parent_id !== null && category?.system_parent_id !== undefined
          ? String(category.system_parent_id)
          : category?.parentId !== null && category?.parentId !== undefined
            ? String(category.parentId)
            : undefined,
  };
};

const parseJsonSafely = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    // console.error('[CategoryService] Failed to parse JSON response', error);
    return null;
  }
};

const buildCategoryFormData = (category: CategoryCreateRequest | CategoryUpdateRequest): FormData => {
  const formData = new FormData();

  if (typeof category.name === 'string' && category.name.trim().length > 0) {
    formData.append('name', category.name.trim());
  }
  if (typeof category.isActive === 'boolean') {
    formData.append('is_active', category.isActive ? '1' : '0');
  }
  if (category.image !== undefined) {
    formData.append('image', category.image || '');
  }
  if (category.emoji !== undefined) {
    formData.append('emoji', category.emoji || '');
  }
  if (category.parentId !== undefined) {
    formData.append('parent_id', category.parentId ?? '');
  }

  if ((category as CategoryCreateRequest).type) {
    formData.append('type', (category as CategoryCreateRequest).type!);
  } else if ((category as CategoryCreateRequest | CategoryUpdateRequest).parentType) {
    const pType = (category as CategoryCreateRequest | CategoryUpdateRequest).parentType;
    if (pType === 'official') {
      formData.append('type', 'official');
    } else {
      formData.append('type', 'user');
    }
  }

  return formData;
};

export const fetchCategories = async (): Promise<PromptCategory[]> => {
  const url = joinBackendPath(USER_CATEGORY_V3_PATH);
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      ...buildJsonHeaders(),
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errorPayload = await parseJsonSafely(response);
    const errorMessage = errorPayload?.message || response.statusText || 'Failed to fetch categories';
    throw new Error(errorMessage);
  }

  const json = await parseJsonSafely(response);
  const rawCategories = json?.data || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawCategories.map((cat: any) => {
    const isSystem = cat.user_id === null;
    return mapCategoryResponse(cat, {
      isDefault: isSystem,
      type: cat.type || (isSystem ? 'official' : 'user'),
    });
  });
};

export const createCategory = async (category: CategoryCreateRequest): Promise<PromptCategory> => {
  const url = joinBackendPath(USER_CATEGORY_V3_PATH);
  const formData = buildCategoryFormData(category);

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await parseJsonSafely(response);
    const errorMessage = errorPayload?.message || 'Failed to create category';
    throw new Error(errorMessage);
  }

  const json = await parseJsonSafely(response);
  const result = json?.success ? json.data : json;
  if (!result) {
    throw new Error('Category API response is empty');
  }

  return mapCategoryResponse(result);
};

export const updateCategory = async (id: string, category: CategoryUpdateRequest): Promise<PromptCategory> => {
  const url = joinBackendPath(`${USER_CATEGORY_V3_PATH}/${id}`);
  const formData = buildCategoryFormData(category);
  formData.append('_method', 'PUT');

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await parseJsonSafely(response);
    const errorMessage = errorPayload?.message || 'Failed to update category';
    throw new Error(errorMessage);
  }

  const json = await parseJsonSafely(response);
  const result = json?.success ? json.data : json;
  if (!result) {
    throw new Error('Category API response is empty');
  }

  return mapCategoryResponse(result);
};

export const deleteCategory = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(joinBackendPath(`${USER_CATEGORY_V3_PATH}/${id}`), {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errorPayload = await parseJsonSafely(response);
    const errorMessage = errorPayload?.message || 'Failed to delete category';
    throw new Error(errorMessage);
  }
};

export const getCategory = async (id: string): Promise<PromptCategory> => {
  const response = await fetchWithAuth(joinBackendPath(`${USER_CATEGORY_V3_PATH}/${id}`), {
    method: 'GET',
    headers: {
      ...buildJsonHeaders(),
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errorPayload = await parseJsonSafely(response);
    const errorMessage = errorPayload?.message || response.statusText || 'Failed to fetch category';
    throw new Error(errorMessage);
  }

  const json = await parseJsonSafely(response);
  const result = json?.success ? json.data : json;
  if (!result) {
    throw new Error('Category API response is empty');
  }
  return mapCategoryResponse(result);
};

export const fetchCategoryTrialUsers = async (categoryId: string): Promise<number[]> => {
  const url = joinBackendPath(`${USER_CATEGORY_PATH}/${categoryId}/trial-users`);
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: buildJsonHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    const errorPayload = await parseJsonSafely(response);
    const errorMessage = errorPayload?.message || 'Failed to fetch trial users';
    throw new Error(errorMessage);
  }

  const json = await parseJsonSafely(response);
  const data = json?.success ? json.data : json;
  return Array.isArray(data) ? data : [];
};

export const updateCategoryTrialUsers = async (categoryId: string, userIds: number[]): Promise<void> => {
  const url = joinBackendPath(`${USER_CATEGORY_PATH}/${categoryId}/trial-users`);
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      ...buildJsonHeaders(),
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ user_ids: userIds }),
  });

  if (!response.ok) {
    const errorPayload = await parseJsonSafely(response);
    const errorMessage = errorPayload?.message || 'Failed to update trial users';
    throw new Error(errorMessage);
  }
};
