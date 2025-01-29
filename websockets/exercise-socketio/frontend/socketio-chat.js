// a global called "io" is being loaded separately

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

/*
 *
 * Code goes here
 *
 */

const socket = io("http://localhost:8080/");

socket.on("connect", () => {
    console.log("Socket connection successfull");
    presence.innerText = "🍏";
});

socket.on("disconnect", () => {
    presence.innerText = "⭕";
});

socket.on("msg:get", (data) => {
    allChat = data.msg;
    render();
});

chat.addEventListener("submit", (e) => {
    e.preventDefault();
    postNewMsg(chat.elements.user.value, chat.elements.text.value);
    chat.elements.text.value = "";
});

const postNewMsg = async (user, text) => {
    const data = { user, text };
    socket.emit("msg:emit", data);
};

function render() {
    const html = allChat.map(({ user, text }) => template(user, text));
    msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
    `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
