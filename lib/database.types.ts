// Hand-written to match supabase/migrations/20260904000000_init_projects_tasks.sql.
// If you have the Supabase CLI linked to a project, prefer regenerating this with:
//   supabase gen types typescript --linked > lib/database.types.ts
// and re-apply the two convenience aliases at the bottom.
//
// IMPORTANT: @supabase/supabase-js's Database generic requires each table to
// have Row/Insert/Update/Relationships, and each schema to have
// Tables/Views/Functions/Enums/CompositeTypes — matching exactly what
// `supabase gen types` outputs. Leaving any of those out doesn't just lose
// type info, it makes every table resolve to `never` (that's why the first
// pass of this file, missing Relationships/Views/Functions/CompositeTypes,
// compiled but silently typed every row as `never`).
//
// Recent supabase-js/postgrest-js versions (2.47+ roughly) also require the
// top-level `__InternalSupabase.PostgrestVersion` marker below to correctly
// resolve insert/update and partial-column-select generics — without it,
// those specific operations resolve to `never` even though `.select("*")`
// still works fine. This is what `supabase gen types` emits automatically;
// it's easy to miss when hand-writing the file.

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskSource = "manual" | "ai_breakdown" | "ai_daily_plan";

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          priority: TaskPriority;
          status: TaskStatus;
          estimated_minutes: number | null;
          deadline: string | null;
          completed_at: string | null;
          source: TaskSource;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          title: string;
          description?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          estimated_minutes?: number | null;
          deadline?: string | null;
          completed_at?: string | null;
          source?: TaskSource;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          title?: string;
          description?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          estimated_minutes?: number | null;
          deadline?: string | null;
          completed_at?: string | null;
          source?: TaskSource;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      task_priority: TaskPriority;
      task_status: TaskStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];
