import http from "node:http";
import nanobuffer from "nanobuffer";
import handler from "serve-handler";
import { Server } from "socket.io";

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

/*
 *
 * Code goes here
 *
 */

const io = new Server(server, {});
io.on("connection", (socket) => {
    console.log("Connected");

    socket.emit("msg:get", { msg: getMsgs() });

    socket.on("msg:emit", (data) => {
        msg.push({
            ...data,
            time: Date.now(),
        });
        io.emit("msg:get", { msg: getMsgs() });
    });

    socket.on("disconnect", () => {
        console.log("Disconnected");
    });
});

const port = process.env.PORT || 8080;
server.listen(port, () =>
    console.log(`Server running at http://localhost:${port}`)
);
