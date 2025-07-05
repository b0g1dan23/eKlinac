import { createRouter } from "@/lib/create-app";
import * as routes from '@/routes/auth/auth.routes'
import * as handlers from '@/routes/auth/auth.handlers';

const authRouter = createRouter()
    .openapi(routes.loginRoute, handlers.loginHandler)

export default authRouter;