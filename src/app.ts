import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { secureHeaders } from 'hono/secure-headers'
import { serveAssets } from './assets/serve-assets'
import { currentUser } from './middleware/current-user'
import { renderMiddleware } from './middleware/render'
import { authRoutes } from './routes/auth'
import { dashboardRoutes } from './routes/dashboard'
import { homeRoutes } from './routes/home'

export const app = new Hono()

app.use(secureHeaders())

app.get('/assets/:version/*', serveAssets)

app.use(csrf())
app.use(currentUser)
app.use(renderMiddleware)

app.route('/', homeRoutes)
app.route('/', authRoutes)
app.route('/', dashboardRoutes)
