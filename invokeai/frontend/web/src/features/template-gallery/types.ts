export interface PromptCategory {
  id: string;
  name: string;
  name_cn?: string;
  name_en?: string;
  description?: string;
  emoji?: string;
  image?: string;
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
  type?: 'official' | 'private' | 'trial' | 'user';
  parentId?: string | null;
  order?: number;
  isUserCreated?: boolean;
  validated_by_admin?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  name_cn?: string;
  emoji?: string;
  image?: string;
  positivePrompt: string;
  prompt_cn?: string;
  negativePrompt?: string;
  negative_prompt_cn?: string;
  description?: string;
  isDefault?: boolean;
  isEditable?: boolean; // true for user templates, false for admin templates
  assignedUserIds?: string[];
  createdAt: number;
  updatedAt?: number;
  categoryId?: string;
  categoryIds?: string[];
  categories?: PromptCategory[];
}
