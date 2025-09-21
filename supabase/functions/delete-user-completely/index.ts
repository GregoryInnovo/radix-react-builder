import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteUserRequest {
  userId: string;
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

    const { userId, adminNotes }: DeleteUserRequest = await req.json();

    console.log('Starting complete user deletion:', {
      userId,
      adminNotes
    });

    // Step 1: Delete all user's orders (as both requester and provider)
    const { error: ordenesError } = await supabase
      .from('ordenes')
      .delete()
      .or(`solicitante_id.eq.${userId},proveedor_id.eq.${userId}`);

    if (ordenesError) {
      console.error('Error deleting orders:', ordenesError);
      throw ordenesError;
    }

    // Step 2: Delete all user's ratings (as both rater and rated)
    const { error: calificacionesError } = await supabase
      .from('calificaciones')
      .delete()
      .or(`calificador_id.eq.${userId},calificado_id.eq.${userId}`);

    if (calificacionesError) {
      console.error('Error deleting ratings:', calificacionesError);
      throw calificacionesError;
    }

    // Step 3: Delete all user's order messages
    const { error: mensajesError } = await supabase
      .from('orden_mensajes')
      .delete()
      .eq('usuario_id', userId);

    if (mensajesError) {
      console.error('Error deleting messages:', mensajesError);
      throw mensajesError;
    }

    // Step 4: Delete all user's notifications
    const { error: notificacionesError } = await supabase
      .from('notificaciones')
      .delete()
      .eq('user_id', userId);

    if (notificacionesError) {
      console.error('Error deleting notifications:', notificacionesError);
      throw notificacionesError;
    }

    // Step 5: Delete all user's saved guides
    const { error: guiasGuardadasError } = await supabase
      .from('guias_guardadas')
      .delete()
      .eq('user_id', userId);

    if (guiasGuardadasError) {
      console.error('Error deleting saved guides:', guiasGuardadasError);
      throw guiasGuardadasError;
    }

    // Step 6: Delete all user's lotes
    const { error: lotesError } = await supabase
      .from('lotes')
      .delete()
      .eq('user_id', userId);

    if (lotesError) {
      console.error('Error deleting lotes:', lotesError);
      throw lotesError;
    }

    // Step 7: Delete all user's productos
    const { error: productosError } = await supabase
      .from('productos')
      .delete()
      .eq('user_id', userId);

    if (productosError) {
      console.error('Error deleting productos:', productosError);
      throw productosError;
    }

    // Step 8: Delete user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw profileError;
    }

    // Step 9: Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      throw authError;
    }

    console.log('User deleted completely:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User and all associated data deleted successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in delete-user-completely function:', error);
    
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