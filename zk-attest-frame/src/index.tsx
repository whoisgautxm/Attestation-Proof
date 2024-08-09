import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: 'Frog Frame',
})

app.use('/*', serveStatic({ root: './public' }))

app.frame('/', (c) => {
  return c.res({
    action: '/picker',
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Create ZKPs of Attestations
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter UID..." />,
      <Button value="a">Create ZKP</Button>
    ],
  })
})

app.frame('/picker', (c) => {
  const {inputText, status } = c
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Create ZKPs of Attestations
      </div>
    ),
  })
})

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000
console.log(`Server is running on port ${port}`)

devtools(app, { serveStatic })

Promise.resolve(serve({
  fetch: app.fetch,
  port,
})).catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})