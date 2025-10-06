
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

    // Get lote details
    const { data: lote, error: loteError } = await supabase
      .from('lotes')
      .select('*')
      .eq('id', loteId)
      .single()

    if (loteError) {
      throw loteError
    }

    // Get tipo_residuo name if exists
    let tipoResiduoNombre = 'residuo'
    if (lote.tipo_residuo_id) {
      const { data: tipoResiduo } = await supabase
        .from('tipos_residuo')
        .select('nombre')
        .eq('id', lote.tipo_residuo_id)
        .single()
      
      if (tipoResiduo) {
        tipoResiduoNombre = tipoResiduo.nombre
      }
    }

    // Create notification for lote owner
    let titulo = ''
    let mensaje = ''

    if (newStatus === 'aprobado') {
      titulo = 'Lote aprobado'
      mensaje = `Tu lote de ${tipoResiduoNombre} ha sido aprobado y ya está visible para otros usuarios`
    } else if (newStatus === 'rechazado') {
      titulo = 'Lote rechazado'
      mensaje = `Tu lote de ${tipoResiduoNombre} ha sido rechazado. ${adminNotes ? `Razón: ${adminNotes}` : ''}`
    } else if (newStatus === 'pendiente') {
      titulo = 'Lote en revisión'
      mensaje = `Tu lote de ${tipoResiduoNombre} está siendo revisado por un administrador`
    }

    const notification = {
      user_id: lote.user_id,
      titulo,
      mensaje,
      tipo: 'lote',
      entity_type: 'lote',
      entity_id: loteId,
      redirect_url: `/lotes?lote_id=${loteId}`,
      metadata: {
        lote_id: loteId,
        old_status: oldStatus,
        new_status: newStatus,
        peso_estimado: lote.peso_estimado,
        tipo_residuo: tipoResiduoNombre,
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
