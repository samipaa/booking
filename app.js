import { Hono } from "https://deno.land/x/hono/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";
import { register, register_view } from "./routes/register.js";
import { login, login_view } from "./routes/login.js";
import { index_view } from "./routes/index.js";

const app = new Hono();

app.use('*', async (c, next) => {
	const csp = `
		default-src 'self';
		script-src 'self';
		style-src 'self';
		img-src 'self' data:;
		connect-src 'self';
		font-src 'self';
		frame-src 'none';
		frame-ancestors 'none';
		form-action 'self';
	`;

	c.header("Content-Security-Policy", csp);
	c.header("X-Content-Type-Options", "nosniff");
	c.header("X-Frame-Options", "DENY"); // added

	await next();
});

app.use('/static/*', serveStatic({ root: './' }));

app.get('/', async (c) => {
    return index_view(c);
});

app.get('/register', async (c) => {
	return register_view(c);
});

app.post('/register', async (c) => {
	return register(c);
});

app.get('/login', async (c) => {
	return login_view(c);
});

app.post('/login', async (c) => {
	return login(c);
});

await serve(app.fetch, { port: 8000 });
