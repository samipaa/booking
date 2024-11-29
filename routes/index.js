import { serve_static_file } from "../helpers.js";

export async function index_view(c) {
    return await serve_static_file("./views/index.html", "text/html");
}