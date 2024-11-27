export async function index_view(c) {
    return c.html(await Deno.readTextFile('./views/index.html'));
}