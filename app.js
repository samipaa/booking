import { Hono } from "https://deno.land/x/hono/mod.ts";
import client from "./db/db.js";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

const app = new Hono();

// restrict content to same origin

const csp = `
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  connect-src 'self';
  font-src 'self';
  frame-src 'none';
  base-uri 'self';
  form-action 'self';
`;


app.use('*', async (c, next) => {
  c.header("Content-Security-Policy", csp);
  c.header("X-Content-Type-Options", "nosniff");
  await next();
});

app.use('/static/*', serveStatic({ root: './' }));

app.get('/register', async (c) => {
	return c.html(await Deno.readTextFile('./views/register.html'));
});

const register_schema = z.object({
	username: z.string().min(3, "Username is too short").max(50, "Username is too long"),
	password: z.string().min(8, "Password is too short"),
	birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid birthdate format"),
	role: z.enum(['reserver', 'administrator']),
});

app.post('/register', async (c) => {
	const body = await c.req.parseBody();

	try {
		const validatedBody = register_schema.parse(body);

		const { username, password, birthdate, role } = validatedBody;

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const result = await client.queryArray(
			`INSERT INTO lfw2se_users (username, password_hash, role, birthdate)
				VALUES ($1, $2, $3, $4)`,
			username,
			hashedPassword,
			role,
			birthdate
		);

		return c.text('User registered successfully!');
	}
	catch (error) {
		if (error instanceof z.ZodError) {
			return c.text(`${error.errors.map(e => e.message).join(", ")}`, 400);
		}

		console.error(error);
		return c.text('Error during registration', 500);
	}
});

serve(app.fetch);
