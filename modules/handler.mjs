
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

    if (pathname === "/spaces") {
        const spaces = ['space1', 'space2', 'space3'];
        return new Response(JSON.stringify(spaces, null, 2), {
            headers: {"Content-Type": "application/json"},
        });
    }

    if (pathname.includes("/spaceContent/")) {

        let spaceId = pathname.split("/").pop();

        const content = [
            {id: 1, name: "Content 1", spaceId: spaceId, encryptedValue: "encryptedValue1", type: "password"},
            {id: 2, name: "Content 2", spaceId: spaceId, encryptedValue: "encryptedValue2", type: "key"},
            {id: 3, name: "Content 3", spaceId: spaceId, encryptedValue: "encryptedValue3", type: "text"},
        ]

        const space = {
            spaceKeyHash: "50d139ada3365459863a6b1a512ddb18d6275df0c91aaf992581507ce0abc869",
            content: content,
        }

        return new Response(JSON.stringify(space, null, 2), {
            headers: {"Content-Type": "application/json"},
        });
    }

    return new Response("Nothing to do here", {status: 404});
}
