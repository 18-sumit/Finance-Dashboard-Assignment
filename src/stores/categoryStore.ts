import { create } from 'zustand';
import { CategorySpec, DEFAULT_CATEGORIES } from '../lib/categories';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
};

const mapCategoryRow = (row: CategoryRow): CategorySpec => ({
  id: row.id,
  label: row.name,
  iconName: row.icon,
  color: row.color,
});

const seedDefaults = () =>
  Object.values(DEFAULT_CATEGORIES).map((category) => ({
    id: category.id,
    name: category.label,
    color: category.color,
    icon: category.iconName,
  }));

const getUserId = () => useAuthStore.getState().user?.id;

interface CategoryStore {
  categories: Record<string, CategorySpec>;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initializeCategories: () => Promise<(() => void) | void>;
  addCategory: (cat: CategorySpec) => Promise<{ error?: string }>;
  updateCategory: (id: string, updates: Partial<CategorySpec>) => Promise<{ error?: string }>;
  deleteCategory: (id: string) => Promise<{ error?: string }>;
  resetCategories: () => void;
}

export const useCategoryStore = create<CategoryStore>()((set) => ({
  categories: {},
  initialized: false,
  loading: false,
  error: null,

  initializeCategories: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ categories: DEFAULT_CATEGORIES, initialized: true, loading: false, error: 'Supabase env vars are missing.' });
      return;
    }

    const client = supabase;

    const userId = getUserId();
    if (!userId) {
      set({ categories: {}, initialized: true, loading: false, error: null });
      return;
    }

    const loadCategories = async () => {
      const { data, error } = await client
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        set({ error: error.message });
        return;
      }

      const rows = (data as CategoryRow[] | null) ?? [];
      if (rows.length === 0) {
        await client.from('categories').insert(
          seedDefaults().map((category) => ({
            user_id: userId,
            ...category,
          }))
        );

        const { data: seeded } = await client
          .from('categories')
          .select('*')
          .eq('user_id', userId)
          .order('name', { ascending: true });

        set({
          categories: Object.fromEntries(((seeded as CategoryRow[] | null) ?? []).map((row) => [row.id, mapCategoryRow(row)])),
          initialized: true,
          loading: false,
          error: null,
        });
        return;
      }

      set({
        categories: Object.fromEntries(rows.map((row) => [row.id, mapCategoryRow(row)])),
        initialized: true,
        loading: false,
        error: null,
      });
    };

    set({ loading: true, error: null });
    await loadCategories();

    const channel = client
      .channel(`categories:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` }, () => {
        void loadCategories();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  },

  addCategory: async (cat) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    const userId = getUserId();
    if (!userId) {
      const error = 'You must be signed in to add a category.';
      set({ error });
      return { error };
    }

    set({ loading: true, error: null });
    const { data, error } = await client
      .from('categories')
      .insert({
        user_id: userId,
        id: cat.id,
        name: cat.label,
        color: cat.color,
        icon: cat.iconName,
      })
      .select('*')
      .single();

    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      categories: { ...state.categories, [cat.id]: mapCategoryRow(data as CategoryRow) },
      loading: false,
      error: null,
    }));

    return {};
  },

  updateCategory: async (id, updates) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    set({ loading: true, error: null });
    const { data, error } = await client
      .from('categories')
      .update({
        name: updates.label,
        color: updates.color,
        icon: updates.iconName,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      categories: { ...state.categories, [id]: mapCategoryRow(data as CategoryRow) },
      loading: false,
      error: null,
    }));

    return {};
  },

  deleteCategory: async (id) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    set({ loading: true, error: null });
    const { error } = await client.from('categories').delete().eq('id', id);
    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => {
      const next = { ...state.categories };
      delete next[id];
      return { categories: next, loading: false, error: null };
    });

    return {};
  },

  resetCategories: () => set({ categories: {}, initialized: false, loading: false, error: null }),
}));
