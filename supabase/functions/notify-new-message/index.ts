import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MessageNotificationRequest {
  ordenId: string
  senderId: string
  mensaje: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { ordenId, senderId, mensaje }: MessageNotificationRequest = await req.json()

    console.log(`New message notification for order ${ordenId} from user ${senderId}`)

    // Get order details with profiles
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes')
      .select(`
        *,
        solicitante:profiles!ordenes_solicitante_id_fkey(full_name, email),
        proveedor:profiles!ordenes_proveedor_id_fkey(full_name, email)
      `)
      .eq('id', ordenId)
      .single()

    if (ordenError) {
      throw ordenError
    }

    // Determine recipient (the other party in the order)
    const recipientId = senderId === orden.solicitante_id ? orden.proveedor_id : orden.solicitante_id
    const senderName = senderId === orden.solicitante_id ? orden.solicitante.full_name : orden.proveedor.full_name

    // Create notification
    const notification = {
      user_id: recipientId,
      titulo: 'Nuevo mensaje en orden',
      mensaje: `${senderName} envió un mensaje: "${mensaje.length > 50 ? mensaje.substring(0, 50) + '...' : mensaje}"`,
      tipo: 'mensaje',
      entity_type: 'orden',
      entity_id: ordenId,
      redirect_url: '/ordenes',
      metadata: {
        orden_id: ordenId,
        sender_id: senderId,
        sender_name: senderName,
        message_preview: mensaje.substring(0, 100),
        tipo_item: orden.tipo_item
      }
    }

    const { error: notificationError } = await supabase
      .from('notificaciones')
      .insert([notification])

    if (notificationError) {
      throw notificationError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message notification sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in notify-new-message function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})