import { z } from "https://deno.land/x/zod/mod.ts";
import client from "../db/db.js";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

const login_schema = z.object({
	email: z.string().min(6, "email is too short").max(256, "email is too long").email("invalid email format"),
	password: z.string().min(8, "password is too short").max(256, "password is too long")
});

export async function login_view(c) {
    return c.html(await Deno.readTextFile('./views/login.html'));
}

async function find_user_by_email(email) {
    const result = await client.queryArray(
        `SELECT user_id, password_hash FROM lfw2se_users WHERE email = $1`,
        email
    );

    return result.rows.length > 0 ? result.rows[0] : null;
}

export async function login(c) {
    const body = await c.req.parseBody();

    try {
        const { email, password } = login_schema.parse(body);

        const user = await find_user_by_email(email);

        if (!user) {
            return c.text("invalid email or password", 400);
        }

        const [ user_id, password_hash ] = user;

        if (!await bcrypt.compare(password, password_hash)) {
            return c.text("invalid email or password", 400);
        }

        return c.redirect('/');


    } catch (error) {
		if (error instanceof z.ZodError) {
			return c.text(`${error.errors.map(e => e.message).join(", ")}`, 400);
		}

		console.error(error);
		return c.text('error during login', 500);
    }
}