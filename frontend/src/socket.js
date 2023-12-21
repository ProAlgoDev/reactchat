import io from "socket.io-client";

let socket;
const connectSocket = () => {
  socket = io(process.env.SERVER_URL);
}

export { socket, connectSocket };
