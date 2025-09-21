import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteNotificationRequest {
  entityType: 'lote' | 'producto';
  entityId: string;
  ownerId: string;
  entityTitle: string;
  adminNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { entityType, entityId, ownerId, entityTitle, adminNotes }: DeleteNotificationRequest = await req.json();

    console.log('Creating delete notification:', {
      entityType,
      entityId,
      ownerId,
      entityTitle,
      adminNotes
    });

    // Create notification for the entity owner
    const notification = {
      user_id: ownerId,
      entity_type: entityType,
      entity_id: entityId,
      titulo: `${entityType === 'lote' ? 'Lote' : 'Producto'} eliminado`,
      mensaje: `Tu ${entityType === 'lote' ? 'lote' : 'producto'} "${entityTitle}" ha sido eliminado por un administrador.${adminNotes ? ` Motivo: ${adminNotes}` : ''}`,
      tipo: 'admin_action',
      metadata: {
        action: 'delete',
        entityType,
        entityId,
        adminNotes
      }
    };

    const { error: insertError } = await supabase
      .from('notificaciones')
      .insert(notification);

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      throw insertError;
    }

    console.log('Delete notification sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in notify-delete-entity function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);