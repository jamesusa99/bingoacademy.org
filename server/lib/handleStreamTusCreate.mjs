function cloudflareStreamErrorMessage(cfJson) {
  return (
    cfJson?.messages?.[0]?.message ||
    cfJson?.errors?.[0]?.message ||
    'Cloudflare API error'
  )
}

function readHeader(req, name) {
  const key = name.toLowerCase()
  if (typeof req.headers?.get === 'function') {
    return req.headers.get(name) || req.headers.get(key) || ''
  }
  return req.headers?.[key] || req.headers?.[name] || ''
}

/**
 * Create a Cloudflare Stream tus upload and return 201 + Location header.
 * Used by Express (local/Railway) and Vercel serverless entry.
 */
export async function handleStreamTusCreate(req, res, { verifyAdminUser }) {
  const auth = await verifyAdminUser(req)
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error })
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  if (!accountId || !apiToken) {
    return res.status(503).json({ error: 'Cloudflare Stream not configured' })
  }

  const uploadLength = readHeader(req, 'upload-length')
  if (!uploadLength) {
    return res.status(400).json({ error: 'Upload-Length header is required' })
  }

  let uploadMetadata = String(readHeader(req, 'upload-metadata') || '').trim()
  const maxDuration = readHeader(req, 'x-stream-max-duration')
  if (maxDuration) {
    const encoded = Buffer.from(String(maxDuration).trim()).toString('base64')
    const part = `maxDurationSeconds ${encoded}`
    uploadMetadata = uploadMetadata ? `${uploadMetadata},${part}` : part
  }

  const cfRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Tus-Resumable': '1.0.0',
        'Upload-Length': String(uploadLength),
        ...(uploadMetadata ? { 'Upload-Metadata': uploadMetadata } : {}),
      },
    }
  )

  const location = cfRes.headers.get('Location')
  if (!cfRes.ok || !location) {
    const detail = await cfRes.text().catch(() => '')
    console.error('[stream tus-create]', cfRes.status, detail.slice(0, 300))
    return res.status(502).json({
      error: cloudflareStreamErrorMessage(
        detail ? { errors: [{ message: detail.slice(0, 200) }] } : {}
      ),
    })
  }

  res.setHeader('Access-Control-Expose-Headers', 'Location')
  res.setHeader('Location', location)
  return res.status(201).end()
}

export function setStreamTusCreateCors(res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, Upload-Length, Upload-Metadata, Upload-Offset, Tus-Resumable, X-Stream-Max-Duration'
  )
  res.setHeader('Access-Control-Expose-Headers', 'Location')
}

export function registerStreamTusCreateRoutes(app, { verifyAdminUser }) {
  app.options('/api/admin/stream/tus-create', (req, res) => {
    setStreamTusCreateCors(res)
    return res.status(204).end()
  })

  app.post('/api/admin/stream/tus-create', (req, res) =>
    handleStreamTusCreate(req, res, { verifyAdminUser })
  )
}
