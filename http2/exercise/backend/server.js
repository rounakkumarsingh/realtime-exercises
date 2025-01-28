import fs from "node:fs";
import http2 from "node:http2";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nanobuffer from "nanobuffer";
import handler from "serve-handler";

let connections = [];

const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
    user: "brian",
    text: "hi",
    time: Date.now(),
});

// the two commands you'll have to run in the root directory of the project are
// (not inside the backend folder)
//
// openssl req -new -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
// openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
//
// http2 only works over HTTPS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = http2.createSecureServer({
    cert: fs.readFileSync(path.join(__dirname, "/../server.crt")),
    key: fs.readFileSync(path.join(__dirname, "/../key.pem")),
});

/*
 *
 * Code goes here
 *
 */
server.on("stream", (stream, header) => {
    const method = header[":method"];
    const path = header[":path"];

    if (method === "GET" && path === "/msgs") {
        console.log("Connected");
        stream.respond({
            ":status": 200,
            "content-type": "text/plain; charset=utf-8",
        });

        stream.write(JSON.stringify({ msgs: getMsgs() }));
        connections.push(stream);

        stream.on("close", () => {
            connections = connections.filter((s) => s !== stream);
        });
    }
});

server.on("request", async (req, res) => {
    const path = req.headers[":path"];
    const method = req.headers[":method"];

    if (path !== "/msgs") {
        // handle the static assets
        return handler(req, res, {
            public: "./frontend",
        });
    }
    if (method === "POST") {
        // get data out of post
        const buffers = [];
        for await (const chunk of req) {
            buffers.push(chunk);
        }
        const json = Buffer.concat(buffers).toString();
        const data = JSON.parse(json);
        /*
         *
         * some code goes here
         *
         */

        msg.push({
            user: data.user,
            text: data.text,
            time: Date.now(),
        });

        // all done with the request
        res.end();

        // notify all connected users
        for (const stream of connections) {
            stream.write(JSON.stringify({ msgs: getMsgs() }));
        }
    }
});

// start listening
const port = process.env.PORT || 8080;
server.listen(port, () =>
    console.log(
        `Server running at https://localhost:${port} - make sure you're on httpS, not http`
    )
);
