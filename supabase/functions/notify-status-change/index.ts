
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoteNotificationRequest {
  loteId: string
  newStatus: string
  oldStatus?: string
  adminNotes?: string
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

    const { loteId, newStatus, oldStatus, adminNotes }: LoteNotificationRequest = await req.json()

    console.log(`Lote status change notification: ${loteId} changed from ${oldStatus} to ${newStatus}`)

    // Get lote details with user profile
    const { data: lote, error: loteError } = await supabase
      .from('lotes')
      .select(`
        *,
        user:profiles!lotes_user_id_fkey(full_name, email),
        tipo_residuo:tipos_residuo(nombre)
      `)
      .eq('id', loteId)
      .single()

    if (loteError) {
      throw loteError
    }

    // Create notification for lote owner
    let titulo = ''
    let mensaje = ''

    if (newStatus === 'aprobado') {
      titulo = 'Lote aprobado'
      mensaje = `Tu lote de ${lote.tipo_residuo?.nombre || 'residuo'} ha sido aprobado y ya está visible para otros usuarios`
    } else if (newStatus === 'rechazado') {
      titulo = 'Lote rechazado'
      mensaje = `Tu lote de ${lote.tipo_residuo?.nombre || 'residuo'} ha sido rechazado. ${adminNotes ? `Razón: ${adminNotes}` : ''}`
    } else if (newStatus === 'pendiente') {
      titulo = 'Lote en revisión'
      mensaje = `Tu lote de ${lote.tipo_residuo?.nombre || 'residuo'} está siendo revisado por un administrador`
    }

    const notification = {
      user_id: lote.user_id,
      titulo,
      mensaje,
      tipo: 'lote',
      entity_type: 'lote',
      entity_id: loteId,
      redirect_url: '/lotes',
      metadata: {
        lote_id: loteId,
        old_status: oldStatus,
        new_status: newStatus,
        peso_estimado: lote.peso_estimado,
        tipo_residuo: lote.tipo_residuo?.nombre,
        admin_notes: adminNotes
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
        message: 'Lote notification sent successfully',
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
