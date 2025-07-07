import { createRouter } from "@/lib/create-app";
import * as routes from '@/routes/auth/auth.routes'
import * as handlers from '@/routes/auth/auth.handlers';

const authRouter = createRouter()
    .openapi(routes.loginRoute, handlers.loginHandler)
    .openapi(routes.logoutRoute, handlers.logoutHandler)
    .openapi(routes.refreshRoute, handlers.refreshHandler)
    .openapi(routes.registerRoute, handlers.registerHandler)
    .openapi(routes.adminLoginRoute, handlers.adminLoginHandler)
    .openapi(routes.createTeacherRoute, handlers.createTeacherHandler)

export default authRouter;