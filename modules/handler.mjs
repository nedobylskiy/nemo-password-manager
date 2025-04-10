export async function handleRequest(request, db, env) {

    const API_ACCESS_KEY = process.env.API_ACCESS_KEY || env?.API_ACCESS_KEY || 'default_access_key';


    const {pathname} = new URL(request.url);

    // Check for API access key in the request headers
    const apiKey = request.headers.get('x-api-key') || request.headers.get('Authorization') || request.body?.apiKey;

    if (!apiKey || apiKey !== API_ACCESS_KEY) {
        return new Response("Unauthorized", {status: 401});
    }



    if (pathname === "/spaces") {
        let spaces = await db.listSpaces();

        if (!spaces) {
            spaces = [];
        }

        spaces = spaces.map(space => space.spaceId);

        return new Response(JSON.stringify(spaces, null, 2), {
            headers: {"Content-Type": "application/json"},
        });
    }

    if (pathname.includes("/spaceContent/")) {

        let spaceId = decodeURIComponent(pathname.split("/").pop());

        const space = await db.getSpace(spaceId);

        return new Response(JSON.stringify(space, null, 2), {
            headers: {"Content-Type": "application/json"},
        });
    }

    if (pathname === "/createSpace") {
        let {spaceName, spaceKeyHash} = await request.json();

        if (!spaceName || !spaceKeyHash) {
            return new Response("Missing space name or key hash", {status: 400});
        }

        await db.createSpace(spaceName, spaceKeyHash);

        return new Response("Space created", {status: 200});
    }

    if (pathname === "/addContent") {
        let {spaceId, name, type, encryptedValue} = await request.json();

        if (!spaceId || !name || !type || !encryptedValue) {
            return new Response("Missing space id, name, type or encrypted value", {status: 400});
        }

        console.log("Adding content: ", spaceId, name, type, encryptedValue);

        await db.addContent(spaceId, {name, type, encryptedValue});

        return new Response("Content added", {status: 200});
    }

    return new Response("Nothing to do here", {status: 404});
}
