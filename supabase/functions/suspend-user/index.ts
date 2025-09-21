import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuspendUserRequest {
  userId: string;
  action: 'suspend' | 'restore';
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

    const { userId, action, adminNotes }: SuspendUserRequest = await req.json();

    console.log('Processing user suspension:', {
      userId,
      action,
      adminNotes
    });

    // Update user profile status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_active: action === 'restore' })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    if (action === 'suspend') {
      // Force sign out the user by updating their auth metadata
      // This will invalidate their current session
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          user_metadata: { 
            suspended: true,
            suspended_at: new Date().toISOString()
          }
        }
      );

      if (authError) {
        console.error('Error updating user auth metadata:', authError);
        // Don't throw here - profile update succeeded, this is just additional
      }

      // Create notification for the suspended user
      const { error: notificationError } = await supabase
        .from('notificaciones')
        .insert({
          user_id: userId,
          titulo: 'Cuenta suspendida',
          mensaje: `Tu cuenta ha sido suspendida por un administrador.${adminNotes ? ` Motivo: ${adminNotes}` : ''}`,
          tipo: 'admin_action',
          metadata: {
            action: 'suspend',
            adminNotes
          }
        });

      if (notificationError) {
        console.error('Error creating suspension notification:', notificationError);
        // Don't throw - this is not critical
      }
    }

    console.log(`User ${action === 'suspend' ? 'suspended' : 'restored'} successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${action === 'suspend' ? 'suspended' : 'restored'} successfully` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in suspend-user function:', error);
    
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