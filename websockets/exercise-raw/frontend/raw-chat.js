const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

// listen for events on the form
chat.addEventListener("submit", (e) => {
    e.preventDefault();
    postNewMsg(chat.elements.user.value, chat.elements.text.value);
    chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
    // code goes here
    const data = {
        user,
        text,
    };

    ws.send(JSON.stringify(data));
}

const ws = new WebSocket("ws://localhost:8080", ["json"]);

ws.addEventListener("open", (socket) => {
    console.log("connected");
    presence.innerText = "🟢";
});

ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    allChat = data.msg;
    render();
});

ws.addEventListener("close", () => {
    presence.innerText = "🔴";
});
/*
 *
 * your code goes here
 *
 */

function render() {
    const html = allChat.map(({ user, text }) => template(user, text));
    msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
    `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
