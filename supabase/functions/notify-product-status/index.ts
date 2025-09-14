import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  productId: string
  newStatus: string
  oldStatus: string
  adminNotes?: string
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

    const { productId, newStatus, oldStatus, adminNotes }: NotificationRequest = await req.json()

    console.log(`Product status change notification: Product ${productId} changed from ${oldStatus} to ${newStatus}`)

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError) {
      console.error('Error fetching product:', productError)
      throw productError
    }

    // Get owner profile separately
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', product.user_id)
      .single()

    // Add profile data to product object for backward compatibility
    const productWithOwner = {
      ...product,
      profiles: ownerProfile || { full_name: 'Usuario', email: '' }
    }

    if (!product) {
      throw new Error('Product not found')
    }

    // Create notification message based on status change
    let titulo = ''
    let mensaje = ''

    switch (newStatus) {
      case 'aprobado':
        titulo = '¡Producto aprobado!'
        mensaje = `Tu producto "${product.nombre}" ha sido aprobado y ya está visible públicamente.`
        break
      case 'rechazado':
        titulo = 'Producto rechazado'
        mensaje = `Lo sentimos, tu producto "${product.nombre}" fue rechazado.${adminNotes ? ` Motivo: ${adminNotes}` : ''}`
        break
      case 'suspendido':
        titulo = 'Producto suspendido'
        mensaje = `Tu producto "${product.nombre}" se ha dado de baja.${adminNotes ? ` Motivo: ${adminNotes}` : ''}`
        break
      default:
        titulo = 'Estado de producto actualizado'
        mensaje = `El estado de tu producto "${product.nombre}" ha sido actualizado a ${newStatus}.`
    }

    // Create notification in database
    const { error: notificationError } = await supabase
      .from('notificaciones')
      .insert({
        user_id: product.user_id,
        titulo,
        mensaje,
        tipo: 'producto',
        entity_type: 'producto',
        entity_id: productId,
        redirect_url: '/productos',
        metadata: {
          product_id: productId,
          product_name: product.nombre,
          old_status: oldStatus,
          new_status: newStatus,
          admin_notes: adminNotes
        }
      })

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      throw notificationError
    }

    console.log(`Notification created for user ${product.user_id}: ${titulo}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Product status notification sent successfully',
        product: product,
        notification: { titulo, mensaje }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in notify-product-status function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})