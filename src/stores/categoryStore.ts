import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CategorySpec, DEFAULT_CATEGORIES } from '../lib/categories';

interface CategoryStore {
  categories: Record<string, CategorySpec>;
  addCategory: (cat: CategorySpec) => void;
  updateCategory: (id: string, updates: Partial<CategorySpec>) => void;
  deleteCategory: (id: string) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: DEFAULT_CATEGORIES,
      addCategory: (cat) => set((state) => ({
        categories: { ...state.categories, [cat.id]: cat }
      })),
      updateCategory: (id, updates) => set((state) => ({
        categories: {
          ...state.categories,
          [id]: { ...state.categories[id], ...updates }
        }
      })),
      deleteCategory: (id) => set((state) => {
        const newCats = { ...state.categories };
        delete newCats[id];
        return { categories: newCats };
      })
    }),
    { name: 'finance-category-storage' }
  )
);
