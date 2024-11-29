export async function serve_static_file(path, content_type) {
    console.log(path);

	try {
		return new Response(await Deno.readFile(path), { headers: { "Content-Type": content_type } });
	} catch {
		return new Response("not found", { status: 404 });
	}
}