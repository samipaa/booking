import { Client } from "https://deno.land/x/postgres@v0.14.0/mod.ts";

const client = new Client({
    user: Deno.env.get("POSTGRES_USER"),
    password: Deno.env.get("POSTGRES_PASSWORD"),
    database: Deno.env.get("POSTGRES_DB"),
    hostname: "db",
    port: 5432,
});

// docker exec -it xxx bash
// psql -U samipaa -d booking --password

await client.connect();

export default client;