import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { createApp } from './lib/create-app';
import configureOpenAPI from './lib/configure-open-api';
import extractRoutes from './routes/extract/extract.index';
import index from './routes/index.route';
import contactsRouter from './routes/contacts/contacts.index';
import configureCORS from './lib/configure-cors';

expand(config());

const app = createApp();

const routes = [
    index,
    extractRoutes,
    contactsRouter
]

configureCORS(app);
configureOpenAPI(app);
routes.forEach(route => app.route("/v1/", route));

app.get('/', c => {
    return c.json({ message: 'Hello, World!' }, 200);
})

export default app;