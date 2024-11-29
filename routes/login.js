import { z } from "https://deno.land/x/zod/mod.ts";
import client from "../db/db.js";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { serve_static_file } from "../helpers.js";

const login_schema = z.object({
	email: z.string().min(6, "email is too short").max(256, "email is too long").email("invalid email format"),
	password: z.string().min(8, "password is too short").max(256, "password is too long")
});

export async function login_view(c) {
    return await serve_static_file("./views/login.html", "text/html");
}

async function find_user_by_email(email) {
    const result = await client.queryArray(
        `SELECT user_token, password_hash FROM lfw2se_users WHERE email = $1`,
        email
    );

    return result.rows.length > 0 ? result.rows[0] : null;
}

export async function login(req) {
    try {
        const form = await req.formData();
		const data = Object.fromEntries(form.entries());
        const { email, password } = login_schema.parse(data);

        const user = await find_user_by_email(email);

        if (!user) {
            return new Response("invalid credentials", { status: 400 });
        }

        const [ user_token, password_hash ] = user;

        if (!await bcrypt.compare(password, password_hash)) {
            return new Response("invalid credentials", { status: 400 });
        }

        const forwarded = req.header("x-forwarded-for") || req.header("x-real-ip");

        const remoteaddr = req.raw?.conn?.remoteAddr;
        const ip = forwarded || (remoteaddr ? remoteaddr.hostname : "0.0.0.0");

        const result = await client.queryArray(
			`INSERT INTO lfw2se_login_logs (user_token, ip_address)
				VALUES ($1, $2)`,
            user_token,
            "0.0.0.0"//ip
		);

        return new Response(null, { status: 302, headers: { location: "/" } });
    } catch (error) {
		if (error instanceof z.ZodError) {
			console.error(`${error.errors.map(e => e.message).join(", ")}`);
		}

		console.error(error);
		return new Response("invalid credentials", { status: 400 });
    }
}