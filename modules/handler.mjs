
export async function handleRequest(request, db, env) {

    const API_ACCESS_KEY = process.env.API_ACCESS_KEY || env?.API_ACCESS_KEY || 'default_access_key';


    const {pathname} = new URL(request.url);

    // Check for API access key in the request headers
    const apiKey = request.headers.get('x-api-key') || request.headers.get('Authorization') || request.body?.apiKey;

    if (!apiKey || apiKey !== API_ACCESS_KEY) {
        return new Response("Unauthorized", {status: 401});
    }

    if (pathname === "/add") {
        await db.addMessage("Hello universal!");
        return new Response("Inserted!");
    }

    if (pathname === "/list") {
        const messages = await db.listMessages();
        return new Response(JSON.stringify(messages, null, 2), {
            headers: {"Content-Type": "application/json"},
        });
    }

    return new Response("Nothing to do here", {status: 404});
}
