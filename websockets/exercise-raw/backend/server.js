import http from "node:http";
import nanobuffer from "nanobuffer";
import handler from "serve-handler";

import generateAcceptValue from "./generate-accept-value.js";
// these are helpers to help you deal with the binary data that websockets use
import objToResponse from "./obj-to-response.js";
import parseMessage from "./parse-message.js";

let connections = [];
const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
    user: "brian",
    text: "hi",
    time: Date.now(),
});

// serve static assets
const server = http.createServer((request, response) => {
    return handler(request, response, {
        public: "./frontend",
    });
});

server.on("upgrade", (req, socket) => {
    if (req.headers.upgrade !== "websocket") {
        // we only care about websockets
        socket.end("HTTP/1.1 400 Bad Request");
        return;
    }
    const acceptKey = req.headers["sec-websocket-key"];
    const acceptValue = generateAcceptValue(acceptKey);
    const headers = [
        "HTTP/1.1 101 Web Socket Protocol Handshake",
        "Upgrade: WebSocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${acceptValue}`,
        "Sec-WebSocket-Protocol: json",
        "\r\n",
    ];

    socket.write(headers.join("\r\n"));

    connections.push(socket);

    // Now sending the data in

    for (const s of connections) {
        s.write(objToResponse({ msg: getMsgs() }));
    }

    socket.on("data", (buffer) => {
        const data = parseMessage(buffer);
        if (data) {
            msg.push({
                ...data,
                date: Date.now(),
            });
        }

        for (const s of connections) {
            s.write(objToResponse({ msg: getMsgs() }));
        }
        if (data === null) {
            socket.end();
        }

        socket.on("end", () => {
            console.log(`closing${socket}`);

            connections = connections.filter((s) => s !== socket);
        });
    });
});

/*
 *
 * your code goes here
 *
 */

const port = process.env.PORT || 8080;
server.listen(port, () =>
    console.log(`Server running at http://localhost:${port}`)
);
