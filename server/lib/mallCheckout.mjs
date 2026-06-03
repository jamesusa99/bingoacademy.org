/** Resolve mall cart line items from Supabase (server-side pricing) */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(id) {
  return typeof id === 'string' && UUID_RE.test(id)
}

function priceToCents(price) {
  if (price == null || price === '') return null
  const n = Number(price)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n * 100)
}

export async function resolveMallCartLineItems(admin, cartItems) {
  if (!admin) return { error: 'Database not configured' }
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { error: 'Cart is empty' }
  }

  const lineItems = []
  const metaItems = []
  let totalCents = 0

  for (const raw of cartItems) {
    const id = raw?.id?.trim?.() || raw?.id
    const source = raw?.source === 'courses' ? 'courses' : 'mall_products'
    const quantity = Math.max(1, parseInt(raw?.quantity, 10) || 1)

    if (!isUuid(id)) {
      return { error: 'One or more items are demo-only and cannot be purchased online. Use seeded mall products.' }
    }

    const { data, error } = await admin
      .from(source)
      .select('id, name, price')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      return { error: `Product not found (${source}:${id})` }
    }

    const amountCents = priceToCents(data.price)
    if (amountCents == null) {
      return { error: `"${data.name}" is not available for online purchase (contact sales).` }
    }

    lineItems.push({
      quantity,
      price_data: {
        currency: 'usd',
        unit_amount: amountCents,
        product_data: {
          name: data.name,
          metadata: {
            mall_source: source,
            mall_product_id: id,
          },
        },
      },
    })

    metaItems.push({
      id,
      source,
      quantity,
      name: data.name,
      amountCents,
    })
    totalCents += amountCents * quantity
  }

  const productName =
    metaItems.length === 1
      ? metaItems[0].name
      : `AI Mall order (${metaItems.length} items)`

  return { lineItems, metaItems, totalCents, productName, currency: 'usd' }
}
