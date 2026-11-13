import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import Pusher from 'pusher'

function attachQuestionDataPlugin() {
  return {
    name: 'attach-question-data-to-sfc',
    transform(code, id) {
      if (!id.endsWith('.vue') || id.includes('?')) return null
      if (!/\bexport\s+(?:const|let|var)\s+questionData\b/.test(code)) return null
      if (!code.includes('_sfc_main')) return null

      const patched = code.replace(
        /\bexport\s+default\s+/,
        'if (typeof questionData !== "undefined") { _sfc_main.questionData = questionData }\nexport default '
      )
      if (patched === code) return null
      return { code: patched, map: null }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      attachQuestionDataPlugin(),
      Components({
        dirs: ['src/components', 'src/steps'],
        deep: true,
        dts: false
      }),
      {
        name: 'pusher-dev-server-trigger',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/pusher/trigger' && req.method === 'POST') {
              let body = ''
              req.on('data', (chunk) => {
                body += chunk
              })
              req.on('end', async () => {
                try {
                  const parsed = body ? JSON.parse(body) : {}
                  const { channel, event, data } = parsed

                  const appId = env.PUSHER_APP_ID || env.VITE_PUSHER_APP_ID
                  const key = env.PUSHER_KEY || env.VITE_PUSHER_KEY
                  const secret = env.PUSHER_SECRET || env.VITE_PUSHER_SECRET
                  const cluster = env.PUSHER_CLUSTER || env.VITE_PUSHER_CLUSTER || 'mt1'

                  if (appId && key && secret && !key.includes('your_pusher')) {
                    const pusher = new Pusher({
                      appId: String(appId).trim(),
                      key: String(key).trim(),
                      secret: String(secret).trim(),
                      cluster: String(cluster).trim(),
                      useTLS: true,
                    })
                    await pusher.trigger(channel, event, data)
                  }

                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ success: true }))
                } catch (err) {
                  console.error('[Pusher Dev Trigger Error]', err?.status || '', err?.message || err, err?.body || '')
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: err?.message || 'Pusher trigger failed' }))
                }
              })
              return
            }
            next()
          })
        }
      }
    ],
    server: {
      port: 3000,
      host: true
    }
  }
})
