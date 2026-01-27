import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  baseFontSize: string;
}

export interface Branding {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
}

export interface HeaderSettings {
  showTopBar: boolean;
  topBarText: string;
  showSearch: boolean;
  showCart: boolean;
}

export interface FooterSettings {
  copyrightText: string;
  showSocialLinks: boolean;
  socialLinks: Record<string, string>;
}

interface SiteSetting {
  id: string;
  key: string;
  value: Json;
  category: string;
  description: string | null;
}

export function useSiteSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  const getSetting = <T,>(key: string): T | null => {
    const setting = settings?.find((s) => s.key === key);
    return setting ? (setting.value as T) : null;
  };

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, unknown> }) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: value as Json })
        .eq('key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Setting updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update setting: ' + error.message);
    },
  });

  const createSettingMutation = useMutation({
    mutationFn: async ({ key, value, category, description }: { 
      key: string; 
      value: Record<string, unknown>; 
      category: string;
      description?: string;
    }) => {
      const { error } = await supabase
        .from('site_settings')
        .insert({ key, value: value as Json, category, description });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Setting created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create setting: ' + error.message);
    },
  });

  return {
    settings,
    isLoading,
    error,
    getSetting,
    updateSetting: updateSettingMutation.mutate,
    createSetting: createSettingMutation.mutate,
    isUpdating: updateSettingMutation.isPending,
  };
}

export function usePageContent(pageSlug?: string) {
  const queryClient = useQueryClient();

  const { data: pageContent, isLoading, error } = useQuery({
    queryKey: ['page-content', pageSlug],
    queryFn: async () => {
      let query = supabase
        .from('page_content')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (pageSlug) {
        query = query.eq('page_slug', pageSlug);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ pageSlug, sectionId, content }: { 
      pageSlug: string; 
      sectionId: string; 
      content: Record<string, unknown>;
    }) => {
      const { error } = await supabase
        .from('page_content')
        .upsert(
          { 
            page_slug: pageSlug, 
            section_id: sectionId, 
            content: content as Json 
          }, 
          { onConflict: 'page_slug,section_id' }
        );
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-content'] });
      toast.success('Content updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update content: ' + error.message);
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('page_content')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-content'] });
      toast.success('Content deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete content: ' + error.message);
    },
  });

  return {
    pageContent,
    isLoading,
    error,
    updateContent: updateContentMutation.mutate,
    deleteContent: deleteContentMutation.mutate,
    isUpdating: updateContentMutation.isPending,
  };
}
