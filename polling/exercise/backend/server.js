import bodyParser from "body-parser";
import express from "express";
import morgan from "morgan";
import nanobuffer from "nanobuffer";

// set up a limited array
const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

// feel free to take out, this just seeds the server with at least one message
msg.push({
    user: "brian",
    text: "hi",
    time: Date.now(),
});

// get express ready to run
const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(express.static("frontend"));

app.get("/poll", (_, res) => {
    // use getMsgs to get messages to send back
    // write code here
    return res.json({ msgs: getMsgs() });
});

app.post("/poll", (req, res) => {
    // add a new message to the server
    // write code here

    const { user, text } = req.body;

    msg.push({
        user,
        text,
        time: Date.now(),
    });

    res.json({ status: "ok" });
});

// start the server
const port = process.env.PORT || 3000;
app.listen(port);
console.log(`listening on http://localhost:${port}`);
