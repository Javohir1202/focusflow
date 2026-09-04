// Hand-written to match
// supabase/migrations/20260904010000_pivot_to_serviceflow.sql.
// If you have the Supabase CLI linked to a project, prefer regenerating this with:
//   supabase gen types typescript --linked > lib/database.types.ts
// and re-apply the convenience aliases at the bottom.
//
// IMPORTANT: @supabase/supabase-js's Database generic requires each table to
// have Row/Insert/Update/Relationships, and each schema to have
// Tables/Views/Functions/Enums/CompositeTypes — matching exactly what
// `supabase gen types` outputs. Leaving any of those out doesn't just lose
// type info, it makes every table resolve to `never`.
//
// Recent supabase-js/postgrest-js versions (2.47+ roughly) also require the
// top-level `__InternalSupabase.PostgrestVersion` marker below to correctly
// resolve insert/update and partial-column-select generics.

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";
export type CustomerStatus = "prospect" | "active" | "inactive";
export type LeadSource = "website" | "referral" | "cold_call" | "social_media" | "event" | "other";
export type LeadStatus = "new" | "contacted" | "qualified" | "quoted" | "won" | "lost";
export type JobStatus = "new" | "scheduled" | "in_progress" | "on_hold" | "completed" | "cancelled";
export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled";
export type ActivityEntityType = "customer" | "lead" | "job" | "task" | "appointment";

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company: string | null;
          phone: string | null;
          email: string | null;
          status: CustomerStatus;
          source: LeadSource;
          tags: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          company?: string | null;
          phone?: string | null;
          email?: string | null;
          status?: CustomerStatus;
          source?: LeadSource;
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          company?: string | null;
          phone?: string | null;
          email?: string | null;
          status?: CustomerStatus;
          source?: LeadSource;
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string | null;
          contact_name: string;
          company: string | null;
          email: string | null;
          phone: string | null;
          source: LeadSource;
          status: LeadStatus;
          value: number | null;
          assigned_to: string | null;
          notes: string | null;
          next_follow_up_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id?: string | null;
          contact_name: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          source?: LeadSource;
          status?: LeadStatus;
          value?: number | null;
          assigned_to?: string | null;
          notes?: string | null;
          next_follow_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string | null;
          contact_name?: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          source?: LeadSource;
          status?: LeadStatus;
          value?: number | null;
          assigned_to?: string | null;
          notes?: string | null;
          next_follow_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string;
          title: string;
          status: JobStatus;
          priority: TaskPriority;
          deadline: string | null;
          assigned_to: string | null;
          price: number | null;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id: string;
          title: string;
          status?: JobStatus;
          priority?: TaskPriority;
          deadline?: string | null;
          assigned_to?: string | null;
          price?: number | null;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string;
          title?: string;
          status?: JobStatus;
          priority?: TaskPriority;
          deadline?: string | null;
          assigned_to?: string | null;
          price?: number | null;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          job_id: string | null;
          customer_id: string | null;
          title: string;
          description: string | null;
          priority: TaskPriority;
          status: TaskStatus;
          assignee: string | null;
          estimated_minutes: number | null;
          deadline: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id?: string | null;
          customer_id?: string | null;
          title: string;
          description?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          assignee?: string | null;
          estimated_minutes?: number | null;
          deadline?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string | null;
          customer_id?: string | null;
          title?: string;
          description?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          assignee?: string | null;
          estimated_minutes?: number | null;
          deadline?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string;
          job_id: string | null;
          title: string;
          scheduled_at: string;
          duration_minutes: number;
          status: AppointmentStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id: string;
          job_id?: string | null;
          title: string;
          scheduled_at: string;
          duration_minutes?: number;
          status?: AppointmentStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string;
          job_id?: string | null;
          title?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          status?: AppointmentStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string;
          entity_type: ActivityEntityType;
          entity_id: string;
          action: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: ActivityEntityType;
          entity_id: string;
          action: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: ActivityEntityType;
          entity_id?: string;
          action?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
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
      customer_status: CustomerStatus;
      lead_source: LeadSource;
      lead_status: LeadStatus;
      job_status: JobStatus;
      appointment_status: AppointmentStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];

export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
export type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
export type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

export type ActivityLogEntry = Database["public"]["Tables"]["activity_log"]["Row"];
export type ActivityLogInsert = Database["public"]["Tables"]["activity_log"]["Insert"];
