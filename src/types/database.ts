export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
};

export type CategoryRow = {
  slug: string;
  name: string;
  sort_order: number;
};

export type AnimationMetaRow = {
  slug: string;
  display_name: string;
  category: string | null;
  sort_order: number;
  thumbnail_video_path: string | null;
  poster_path: string | null;
  description_override: string | null;
  is_new: boolean;
  is_published: boolean;
  updated_at: string;
  updated_by: string | null;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string; email: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: CategoryRow;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      animation_meta: {
        Row: AnimationMetaRow;
        Insert: Partial<AnimationMetaRow> & { slug: string; display_name: string };
        Update: Partial<AnimationMetaRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
