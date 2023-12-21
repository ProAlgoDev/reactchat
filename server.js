const connectDB = require("./utils/db");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const http = require("http");
const express = require("express"); // web framework for Node.js.
const morgan = require("morgan"); // HTTP request logger middleware for node.js
const routes = require("./routes/index");
// const notFound = require("./middleware/notFound");
// const errorHandler = require("./middleware/errorHandler");

// Sanitize and Rate limit 
const rateLimit = require("express-rate-limit"); // Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.
const helmet = require("helmet"); // Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
const mongosanitize = require("express-mongo-sanitize"); // This module searches for any keys in objects that begin with a $ sign or contain a ., from req.body, req.query or req.params.
const xss = require("xss-clean"); // Node.js Connect middleware to sanitize user input coming from POST body, GET queries, and url params.

const bodyParser = require("body-parser"); // Node.js body parsing middleware.

const cors = require("cors"); // CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
const cookieParser = require("cookie-parser"); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
const session = require("cookie-session"); // Simple cookie-based session middleware.

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());

// Setup express response and body parser configurations
app.use(express.json()); // Controls the maximum request body size. If this is a number, then the value specifies the number of bytes; if it is a string, the value is passed to the bytes library for parsing. Defaults to '100kb'.
app.use(bodyParser.json()); // Returns middleware that only parses json
app.use(bodyParser.urlencoded({ extended: true })); // Returns middleware that only parses urlencoded bodies

app.use(
  session({
    secret: "keyboard cat",
    proxy: true,
    resave: true,
    saveUnintialized: true,
    cookie: {
      secure: false,
    },
  })
);

// app.use(helmet());

// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }
// if (process.env.NODE_ENV === "production") {
//   console.log = () => { };
// }

const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // In one hour
  message: "Too many Requests from this IP, please try again in an hour!",
});

app.use("/tawk", limiter);

app.use(
  express.urlencoded({
    extended: true,
  })
); // Returns middleware that only parses urlencoded bodies

app.use(mongosanitize());
app.use(xss());
app.use("/api", routes);
// app.get("/", (req, res) => {
//   res.send("API is running..");
// });

const server = http.createServer(app);
connectDB();

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT Exception! Shutting down ...");
  process.exit(1); // Exit Code 1 indicates that a container shut down, either because of an application failure.
});


const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}


const port = process.env.PORT || 9001;
server.listen(port, () => {
  console.log(`App running on port ${port}`);
});

/*
 * --------------------- SOCKET LOGIC --------------------------
 */

// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = require("socket.io")(server, {
  pingTimeout: 60000, // 60 s
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


// Listen for when the client connects via socket.io-client
io.on("connection", async (socket) => {

  console.log("Connected to socket.io");
  // const user_id = socket.handshake.query["user_id"];
  // console.log(`User connected ${socket.id}`);

  // USER CONNECTED
  socket.on("setup", (user) => {
    try {
      socket.join(user._id)
      socket.emit("connected to app")
    } catch (e) {
      console.log(e);
    }
  });



  // Socket event listeners...
  socket.on("join chat", (room) => {
    socket.join(room._id);
    console.log("User Joined Room: " + room);
    socket.emit("connected");
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing")
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing")
  });

  socket.on("new message", (newMessageRecieved) => {

    let chat = newMessageRecieved.chat;
    if (!chat.users)
      return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      console.log("Sending messages rcvd")
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    })

  });


  socket.off("leave room", (chat_id) => {
    console.log("USER Left: ", chat_id);
    socket.leave(chat_id);
  });

  // USER DISCONNECTED 
  socket.off("Disconnect", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });

});

// Handle Server Failure -----------------------------------------------
process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("UNHANDLED REJECTION! Shutting down ...");
  server.close(() => {
    process.exit(1); //  Exit Code 1 indicates that a container shut down, either because of an application failure.
  });
});
