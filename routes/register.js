import { z } from "https://deno.land/x/zod/mod.ts";
import client from "../db/db.js";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { serve_static_file } from "../helpers.js";

const register_schema = z.object({
	email: z.string().min(6, "email is too short").max(256, "email is too long").email("invalid email format"),
	password: z.string().min(8, "password is too short").max(256, "password is too long"),
    birthdate: z.string().refine((date) => { const temp = new Date(date); return !isNaN(temp.getTime()); }, { message: "invalid birthdate" }),
	role: z.enum(['reserver', 'administrator']),
});

export async function register_view(c) {
    return await serve_static_file("./views/register.html", "text/html");
}

export async function register(req, info) {
    try {
		const form = await req.formData();
		const data = Object.fromEntries(form.entries());
		const { email, password, birthdate, role } = register_schema.parse(data);

		const salt = await bcrypt.genSalt(10);

		const result = await client.queryArray(
			`INSERT INTO lfw2se_users (email, password_hash, role, birthdate)
				VALUES ($1, $2, $3, $4)`,
			email,
            await bcrypt.hash(password, salt),
			role,
			birthdate
		);

		return new Response(null, { status: 302, headers: { location: "/" } });
	}
	catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(`${error.errors.map(e => e.message).join(", ")}`, { status: 400 });
		}

		console.error(error);
		return new Response("registration error", { status: 400 });
	}
}