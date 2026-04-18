import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_ORIGINS = ['http://localhost:8080', 'http://3.34.140.204:8080'] as const

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-fallback-proxy',
      configureServer(server) {
        server.middlewares.use('/api', async (req, res) => {
          const method = req.method ?? 'GET'
          const path = req.originalUrl ?? req.url ?? '/api'
          const headers = new Headers()

          for (const [key, value] of Object.entries(req.headers)) {
            if (!value || key.toLowerCase() === 'host') continue
            if (Array.isArray(value)) {
              value.forEach(item => headers.append(key, item))
            } else {
              headers.set(key, value)
            }
          }

          const body =
            method === 'GET' || method === 'HEAD'
              ? undefined
              : await new Promise<Buffer>((resolve, reject) => {
                  const chunks: Buffer[] = []
                  req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
                  req.on('end', () => resolve(Buffer.concat(chunks)))
                  req.on('error', reject)
                })

          let lastError: unknown = null

          for (const origin of API_ORIGINS) {
            try {
              const response = await fetch(new URL(path, origin), {
                method,
                headers,
                body,
              })

              res.statusCode = response.status
              response.headers.forEach((value, key) => {
                if (key.toLowerCase() === 'transfer-encoding') return
                res.setHeader(key, value)
              })
              res.end(Buffer.from(await response.arrayBuffer()))
              return
            } catch (error) {
              lastError = error
            }
          }

          const message = lastError instanceof Error ? lastError.message : 'API 서버에 연결할 수 없어요.'
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ detail: message }))
        })
      },
    },
  ],
  server: {
    proxy: {},
  },
})
