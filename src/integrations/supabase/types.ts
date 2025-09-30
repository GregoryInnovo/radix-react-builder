export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      auditoria_admin: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          new_status: string | null
          notes: string | null
          previous_status: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
        }
        Relationships: []
      }
      calificaciones: {
        Row: {
          calificado_id: string
          calificador_id: string
          comentario: string | null
          created_at: string
          id: string
          oculta: boolean
          orden_id: string
          producto_id: string | null
          puntuacion: number
          reportada: boolean
          updated_at: string
        }
        Insert: {
          calificado_id: string
          calificador_id: string
          comentario?: string | null
          created_at?: string
          id?: string
          oculta?: boolean
          orden_id: string
          producto_id?: string | null
          puntuacion: number
          reportada?: boolean
          updated_at?: string
        }
        Update: {
          calificado_id?: string
          calificador_id?: string
          comentario?: string | null
          created_at?: string
          id?: string
          oculta?: boolean
          orden_id?: string
          producto_id?: string | null
          puntuacion?: number
          reportada?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      guias: {
        Row: {
          activa: boolean
          autor_id: string
          categoria: string
          contenido: string
          created_at: string
          descripcion: string
          destacada: boolean
          id: string
          imagenes: string[] | null
          nivel: string
          portada_url: string | null
          tags: string[] | null
          tiempo_lectura: number | null
          tipo: string
          titulo: string
          updated_at: string
          video_url: string | null
          vistas: number
        }
        Insert: {
          activa?: boolean
          autor_id: string
          categoria: string
          contenido: string
          created_at?: string
          descripcion: string
          destacada?: boolean
          id?: string
          imagenes?: string[] | null
          nivel?: string
          portada_url?: string | null
          tags?: string[] | null
          tiempo_lectura?: number | null
          tipo: string
          titulo: string
          updated_at?: string
          video_url?: string | null
          vistas?: number
        }
        Update: {
          activa?: boolean
          autor_id?: string
          categoria?: string
          contenido?: string
          created_at?: string
          descripcion?: string
          destacada?: boolean
          id?: string
          imagenes?: string[] | null
          nivel?: string
          portada_url?: string | null
          tags?: string[] | null
          tiempo_lectura?: number | null
          tipo?: string
          titulo?: string
          updated_at?: string
          video_url?: string | null
          vistas?: number
        }
        Relationships: []
      }
      guias_guardadas: {
        Row: {
          created_at: string
          guia_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guia_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          guia_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guias_guardadas_guia_id_fkey"
            columns: ["guia_id"]
            isOneToOne: false
            referencedRelation: "guias"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          descripcion: string | null
          direccion: string | null
          estado: Database["public"]["Enums"]["batch_status"]
          fecha_disponible: string | null
          fecha_vencimiento: string | null
          id: string
          imagenes: string[]
          peso_estimado: number
          status: string | null
          tipo_residuo_id: string | null
          titulo: string
          ubicacion_lat: number
          ubicacion_lng: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          direccion?: string | null
          estado?: Database["public"]["Enums"]["batch_status"]
          fecha_disponible?: string | null
          fecha_vencimiento?: string | null
          id?: string
          imagenes?: string[]
          peso_estimado: number
          status?: string | null
          tipo_residuo_id?: string | null
          titulo?: string
          ubicacion_lat: number
          ubicacion_lng: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          direccion?: string | null
          estado?: Database["public"]["Enums"]["batch_status"]
          fecha_disponible?: string | null
          fecha_vencimiento?: string | null
          id?: string
          imagenes?: string[]
          peso_estimado?: number
          status?: string | null
          tipo_residuo_id?: string | null
          titulo?: string
          ubicacion_lat?: number
          ubicacion_lng?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lotes_tipo_residuo"
            columns: ["tipo_residuo_id"]
            isOneToOne: false
            referencedRelation: "tipos_residuo"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes_historial: {
        Row: {
          created_at: string
          estado_anterior: Database["public"]["Enums"]["batch_status"] | null
          estado_nuevo: Database["public"]["Enums"]["batch_status"]
          id: string
          lote_id: string
          notas: string | null
          usuario_accion_id: string | null
        }
        Insert: {
          created_at?: string
          estado_anterior?: Database["public"]["Enums"]["batch_status"] | null
          estado_nuevo: Database["public"]["Enums"]["batch_status"]
          id?: string
          lote_id: string
          notas?: string | null
          usuario_accion_id?: string | null
        }
        Update: {
          created_at?: string
          estado_anterior?: Database["public"]["Enums"]["batch_status"] | null
          estado_nuevo?: Database["public"]["Enums"]["batch_status"]
          id?: string
          lote_id?: string
          notas?: string | null
          usuario_accion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lotes_historial_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          leida: boolean
          mensaje: string
          metadata: Json | null
          orden_id: string | null
          redirect_url: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          leida?: boolean
          mensaje: string
          metadata?: Json | null
          orden_id?: string | null
          redirect_url?: string | null
          tipo?: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          leida?: boolean
          mensaje?: string
          metadata?: Json | null
          orden_id?: string | null
          redirect_url?: string | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
        ]
      }
      orden_mensajes: {
        Row: {
          created_at: string
          id: string
          mensaje: string
          orden_id: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mensaje: string
          orden_id: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mensaje?: string
          orden_id?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: []
      }
      ordenes: {
        Row: {
          cantidad_solicitada: number
          created_at: string
          direccion_contacto: string | null
          estado: Database["public"]["Enums"]["order_status"]
          fecha_propuesta_retiro: string | null
          hora_propuesta_retiro: string | null
          id: string
          item_id: string
          mensaje_respuesta: string | null
          mensaje_solicitud: string | null
          modalidad_entrega: string | null
          proveedor_id: string
          solicitante_id: string
          telefono_contacto: string | null
          tipo_item: Database["public"]["Enums"]["item_type"]
          updated_at: string
        }
        Insert: {
          cantidad_solicitada?: number
          created_at?: string
          direccion_contacto?: string | null
          estado?: Database["public"]["Enums"]["order_status"]
          fecha_propuesta_retiro?: string | null
          hora_propuesta_retiro?: string | null
          id?: string
          item_id: string
          mensaje_respuesta?: string | null
          mensaje_solicitud?: string | null
          modalidad_entrega?: string | null
          proveedor_id: string
          solicitante_id: string
          telefono_contacto?: string | null
          tipo_item: Database["public"]["Enums"]["item_type"]
          updated_at?: string
        }
        Update: {
          cantidad_solicitada?: number
          created_at?: string
          direccion_contacto?: string | null
          estado?: Database["public"]["Enums"]["order_status"]
          fecha_propuesta_retiro?: string | null
          hora_propuesta_retiro?: string | null
          id?: string
          item_id?: string
          mensaje_respuesta?: string | null
          mensaje_solicitud?: string | null
          modalidad_entrega?: string | null
          proveedor_id?: string
          solicitante_id?: string
          telefono_contacto?: string | null
          tipo_item?: Database["public"]["Enums"]["item_type"]
          updated_at?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          categoria_funcionalidad: string[] | null
          categoria_tipo: string[] | null
          costo_domicilio: number | null
          created_at: string
          descripcion: string
          direccion_vendedor: string | null
          disponible: boolean
          id: string
          imagenes: string[]
          incluye_domicilio: boolean | null
          nombre: string
          origen_roa: string | null
          precio_unidad: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria_funcionalidad?: string[] | null
          categoria_tipo?: string[] | null
          costo_domicilio?: number | null
          created_at?: string
          descripcion: string
          direccion_vendedor?: string | null
          disponible?: boolean
          id?: string
          imagenes?: string[]
          incluye_domicilio?: boolean | null
          nombre: string
          origen_roa?: string | null
          precio_unidad?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria_funcionalidad?: string[] | null
          categoria_tipo?: string[] | null
          costo_domicilio?: number | null
          created_at?: string
          descripcion?: string
          direccion_vendedor?: string | null
          disponible?: boolean
          id?: string
          imagenes?: string[]
          incluye_domicilio?: boolean | null
          nombre?: string
          origen_roa?: string | null
          precio_unidad?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          is_verified: boolean | null
          location_lat: number | null
          location_lng: number | null
          phone: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          is_verified?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          phone?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          is_verified?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          phone?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      test: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      tipos_residuo: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_average_rating: {
        Args: { user_id: string }
        Returns: number
      }
      get_user_rating_count: {
        Args: { user_id: string }
        Returns: number
      }
      increment_guia_views: {
        Args: { guia_id: string }
        Returns: undefined
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      batch_status:
        | "disponible"
        | "reservado"
        | "recogido"
        | "cancelado"
        | "no_disponible"
      item_type: "lote" | "producto"
      order_status: "pendiente" | "aceptada" | "completada" | "cancelada"
      roa_type:
        | "cascara_fruta"
        | "posos_cafe"
        | "restos_vegetales"
        | "cascara_huevo"
        | "restos_cereales"
        | "otros"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      batch_status: [
        "disponible",
        "reservado",
        "recogido",
        "cancelado",
        "no_disponible",
      ],
      item_type: ["lote", "producto"],
      order_status: ["pendiente", "aceptada", "completada", "cancelada"],
      roa_type: [
        "cascara_fruta",
        "posos_cafe",
        "restos_vegetales",
        "cascara_huevo",
        "restos_cereales",
        "otros",
      ],
    },
  },
} as const
