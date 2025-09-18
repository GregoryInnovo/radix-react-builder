import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderNotificationRequest {
  ordenId: string
  newStatus: string
  oldStatus?: string
  notificationType: 'new_request' | 'status_change' | 'completed' | 'new_rating'
  userId?: string // For new_rating notifications
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

    const { ordenId, newStatus, oldStatus, notificationType, userId }: OrderNotificationRequest = await req.json()

    console.log(`Order notification: ${notificationType} for order ${ordenId}`)

    // Get order details
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes')
      .select('*')
      .eq('id', ordenId)
      .single()

    if (ordenError) {
      console.error('Failed to fetch order:', ordenError)
      throw ordenError
    }

    // Get solicitante profile
    const { data: solicitanteProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', orden.solicitante_id)
      .single()

    // Get proveedor profile
    const { data: proveedorProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', orden.proveedor_id)
      .single()

    // Add profile data to orden object
    const ordenWithProfiles = {
      ...orden,
      solicitante: solicitanteProfile || { full_name: 'Usuario', email: '' },
      proveedor: proveedorProfile || { full_name: 'Usuario', email: '' }
    }

    let notifications = []

    switch (notificationType) {
      case 'new_request':
        // Notify provider about new request
        notifications.push({
          user_id: ordenWithProfiles.proveedor_id,
          titulo: 'Nueva solicitud de intercambio',
          mensaje: `${ordenWithProfiles.solicitante.full_name} solicita intercambio de tu ${ordenWithProfiles.tipo_item}`,
          tipo: 'orden',
          entity_type: 'orden',
          entity_id: ordenId,
          redirect_url: '/ordenes',
          metadata: {
            orden_id: ordenId,
            solicitante_name: ordenWithProfiles.solicitante.full_name,
            tipo_item: ordenWithProfiles.tipo_item,
            cantidad: ordenWithProfiles.cantidad_solicitada
          }
        })
        break

      case 'status_change':
        const targetUserId = newStatus === 'aceptada' || newStatus === 'rechazada' 
          ? ordenWithProfiles.solicitante_id 
          : ordenWithProfiles.proveedor_id

        const statusMessages = {
          aceptada: `${ordenWithProfiles.proveedor.full_name} aceptó tu solicitud de intercambio`,
          rechazada: `${ordenWithProfiles.proveedor.full_name} rechazó tu solicitud de intercambio`,
          cancelada: newStatus === 'cancelada' && oldStatus === 'pendiente' 
            ? `${ordenWithProfiles.proveedor.full_name} rechazó tu solicitud de intercambio`
            : 'La orden ha sido cancelada'
        }

        notifications.push({
          user_id: targetUserId,
          titulo: `Orden ${newStatus}`,
          mensaje: statusMessages[newStatus] || `El estado de tu orden cambió a ${newStatus}`,
          tipo: 'orden',
          entity_type: 'orden',
          entity_id: ordenId,
          redirect_url: '/ordenes',
          metadata: {
            orden_id: ordenId,
            old_status: oldStatus,
            new_status: newStatus,
            tipo_item: ordenWithProfiles.tipo_item
          }
        })
        break

      case 'completed':
        // Notify requester that order is completed
        notifications.push({
          user_id: ordenWithProfiles.solicitante_id,
          titulo: 'Orden completada',
          mensaje: `${ordenWithProfiles.proveedor.full_name} marcó como completada tu orden de ${ordenWithProfiles.tipo_item}`,
          tipo: 'orden',
          entity_type: 'orden',
          entity_id: ordenId,
          redirect_url: '/ordenes',
          metadata: {
            orden_id: ordenId,
            proveedor_name: ordenWithProfiles.proveedor.full_name,
            tipo_item: ordenWithProfiles.tipo_item,
            can_rate: true
          }
        })
        break

      case 'new_rating':
        // Notify the rated user
        const ratedUserId = userId === ordenWithProfiles.solicitante_id ? ordenWithProfiles.proveedor_id : ordenWithProfiles.solicitante_id
        const raterName = userId === ordenWithProfiles.solicitante_id ? ordenWithProfiles.solicitante.full_name : ordenWithProfiles.proveedor.full_name

        notifications.push({
          user_id: ratedUserId,
          titulo: 'Nueva calificación recibida',
          mensaje: `${raterName} te ha calificado por la orden de ${ordenWithProfiles.tipo_item}`,
          tipo: 'calificacion',
          entity_type: 'orden',
          entity_id: ordenId,
          redirect_url: '/profile',
          metadata: {
            orden_id: ordenId,
            rater_name: raterName,
            tipo_item: ordenWithProfiles.tipo_item
          }
        })
        break
    }

    // Insert all notifications
    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('notificaciones')
        .insert(notifications)

      if (notificationError) {
        throw notificationError
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order notifications sent successfully',
        notifications_sent: notifications.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in notify-order-status function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})