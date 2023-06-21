import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'

const port = 3333
const host = process.env.HOST || '192.168.0.10' || 'localhost' // '0.0.0.0', // para dar acesso externo ao mobile
const app = fastify()

app.register(cors, {
  origin: ['http://localhost:3000'],
})

app.register(jwt, {
  secret: 'gfghdkjhrtyrfhskdjgf',
})

app.register(authRoutes)
app.register(memoriesRoutes)

app
  .listen({
    port,
    host,
  })
  .then(() => {
    console.log(`🚀 HTTP Server running on http://${host}:${port}`)
  })
