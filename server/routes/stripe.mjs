import express from 'express'
import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { upsertOrderFromStripe } from './admin.mjs'

export function registerStripeWebhook(app) {
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    const sig = req.headers['stripe-signature']
    const rawBody = req.body

    if (!secret) {
      console.warn('[stripe] STRIPE_WEBHOOK_SECRET not set — accepting payload without verification (dev only)')
    } else if (!sig) {
      return res.status(400).send('Missing stripe-signature')
    }

    let event
    try {
      if (secret && sig) {
        const stripe = await import('stripe')
        const client = new stripe.default(process.env.STRIPE_SECRET_KEY)
        event = client.webhooks.constructEvent(rawBody, sig, secret)
      } else {
        event = JSON.parse(rawBody.toString('utf8'))
      }
    } catch (err) {
      console.error('[stripe webhook]', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    try {
      if (event.type === 'checkout.session.completed') {
        await upsertOrderFromStripe(event.data.object)
      }
      if (event.type === 'payment_intent.succeeded') {
        const admin = getSupabaseAdmin()
        const pi = event.data.object
        if (admin && pi.id) {
          await admin
            .from('orders')
            .update({ status: 'paid', stripe_payment_intent_id: pi.id, updated_at: new Date().toISOString() })
            .eq('stripe_payment_intent_id', pi.id)
        }
      }
    } catch (err) {
      console.error('[stripe handler]', err)
      return res.status(500).json({ error: 'Handler failed' })
    }

    res.json({ received: true })
  })
}
