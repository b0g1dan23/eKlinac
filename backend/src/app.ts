import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { createApp } from './lib/create-app';
import configureOpenAPI from './lib/configure-open-api';
import authRouter from './routes/auth/auth.index';
import configureCORS from './lib/configure-cors';
import teachersRouter from './routes/teachers/teachers.index';

expand(config());

const app = createApp();

const routes = [
    authRouter,
    teachersRouter,
]

configureCORS(app);
configureOpenAPI(app);
routes.forEach(route => app.route("/api/v1/", route));

app.get('/', c => {
    return c.json({ message: 'Hello, World!' }, 200);
})

export default app;