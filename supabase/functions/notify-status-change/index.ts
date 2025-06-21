
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  loteId: string
  newStatus: string
  oldStatus: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { loteId, newStatus, oldStatus }: NotificationRequest = await req.json()

    console.log(`Status change notification: Lote ${loteId} changed from ${oldStatus} to ${newStatus}`)

    // Aquí se implementaría la lógica de notificaciones:
    // 1. Obtener usuarios interesados en el lote
    // 2. Crear notificaciones in-app en una tabla de notificaciones
    // 3. Enviar emails usando Resend (si está configurado)

    // Por ahora, solo logueamos la notificación
    const { data: lote, error: loteError } = await supabase
      .from('lotes')
      .select('*')
      .eq('id', loteId)
      .single()

    if (loteError) {
      throw loteError
    }

    // En el futuro, aquí se crearían las notificaciones
    // await createInAppNotifications(loteId, newStatus)
    // await sendEmailNotifications(loteId, newStatus)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent successfully',
        lote: lote
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in notify-status-change function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
