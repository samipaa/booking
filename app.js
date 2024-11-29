import { Hono } from "https://deno.land/x/hono/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { register, register_view } from "./routes/register.js";
import { login, login_view } from "./routes/login.js";
import { index_view } from "./routes/index.js";
import { serve_static_file } from "./helpers.js";

const app = new Hono();

async function handler(c) {
	const url = new URL(c.req.url);

	if (url.pathname.startsWith("/static/")) {
		return await serve_static_file(`.${url.pathname}`, "text/css");
	}

	if (c.req.method === "GET") {
		if (url.pathname === "/") {
			return await index_view();
		}
		else if (url.pathname === "/register") {
			return await register_view();
		}
		else if (url.pathname === "/login") {
			return await login_view();	
		}
	}
	else if (c.req.method === "POST") {
		if (url.pathname === "/register") {
			return await register(c.req);
		}
		else if (url.pathname === "/login") {
			return await login(c.req);
		}
	}

	return new Response("not found", { status: 404 });
}

app.all('*', async (c) => {
	const res = await handler(c);

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

	res.headers.set("Content-Security-Policy", csp);
	res.headers.set("X-Content-Type-Options", "nosniff");
	res.headers.set("X-Frame-Options", "DENY"); // added
	
	return res;
});

await serve(app.fetch, { port: 8000 });