export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          hashed_password: string;
          display_name: string | null;
          avatar_url: string | null;
          role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          hashed_password: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      models: {
        Row: {
          id: string;
          title: string;
          slug: string;
          summary: string | null;
          body: string | null;
          tags: string[] | null;
          category: string | null;
          cover_url: string | null;
          audio_url: string | null;
          read_time: number | null;
          status: string | null;
          audio_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          summary?: string | null;
          body?: string | null;
          tags?: string[] | null;
          category?: string | null;
          cover_url?: string | null;
          audio_url?: string | null;
          read_time?: number | null;
          status?: string | null;
          audio_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["models"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      model_categories: {
        Row: {
          model_id: string;
          category_id: string;
        };
        Insert: {
          model_id: string;
          category_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["model_categories"]["Insert"]>;
      };
      model_tags: {
        Row: {
          model_id: string;
          tag_id: string;
        };
        Insert: {
          model_id: string;
          tag_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["model_tags"]["Insert"]>;
      };
      profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      audio_assets: {
        Row: {
          id: string;
          model_id: string | null;
          voice_id: string | null;
          source_text: string | null;
          is_primary: boolean | null;
          status: string | null;
          audio_url: string | null;
          duration_seconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          model_id?: string | null;
          voice_id?: string | null;
          source_text?: string | null;
          is_primary?: boolean | null;
          status?: string | null;
          audio_url?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audio_assets"]["Insert"]>;
      };
    };
  };
}
