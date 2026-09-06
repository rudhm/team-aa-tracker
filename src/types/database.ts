export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      video_tasks: {
        Row: {
          id: string
          created_at: string
          client: string
          sub_client: string | null
          video_title: string
          editor: string
          start_date: string | null
          complete_date: string | null
          status: string
          link: string | null
          delivered_at: string | null
          payroll_locked: boolean
          duration: string | null
          is_urgent: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          client: string
          sub_client?: string | null
          video_title: string
          editor: string
          start_date?: string | null
          complete_date?: string | null
          status?: string
          link?: string | null
          delivered_at?: string | null
          payroll_locked?: boolean
          duration?: string | null
          is_urgent?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          client?: string
          sub_client?: string | null
          video_title?: string
          editor?: string
          start_date?: string | null
          complete_date?: string | null
          status?: string
          link?: string | null
          delivered_at?: string | null
          payroll_locked?: boolean
          duration?: string | null
          is_urgent?: boolean
        }
        Relationships: []
      }
      feedback: {
        Row: {
          id: string
          created_at: string
          type: string
          name: string | null
          description: string
        }
        Insert: {
          id?: string
          created_at?: string
          type: string
          name?: string | null
          description: string
        }
        Update: {
          id?: string
          created_at?: string
          type?: string
          name?: string | null
          description?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
