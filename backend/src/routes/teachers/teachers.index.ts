import { createRouter } from "@/lib/create-app";
import * as routes from '@/routes/teachers/teachers.routes'
import * as handlers from '@/routes/teachers/teachers.handlers'

const teachersRouter = createRouter()
    .openapi(routes.listAllTeachersRoute, handlers.listAllTeachersHandler)
    .openapi(routes.listAllStudentsForTeacherRoute, handlers.listAllStudentsForTeacherHandler);

export default teachersRouter;