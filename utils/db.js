const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const DB = process.env.DATABASE || "mongodb://127.0.0.1:27017";

mongoose.set('strictQuery', true);

const connectDB = async () => {
    await mongoose.connect(DB, {
        useNewUrlParser: true, // The underlying MongoDB driver has deprecated their current connection string parser. Because this is a major change, they added the useNewUrlParser flag to allow users to fall back to the old parser if they find a bug in the new parser.
        // useCreateIndex: true, // Again previously MongoDB used an ensureIndex function call to ensure that Indexes exist and, if they didn't, to create one. This too was deprecated in favour of createIndex . the useCreateIndex option ensures that you are using the new function calls.
        useUnifiedTopology: true, // Set to true to opt in to using the MongoDB driver's new connection management engine. You should set this option to true , except for the unlikely case that it prevents you from maintaining a stable connection.
    }).then((conn) => {
        console.log(`DB Connection successful : ${conn}`);
    }).catch((err) => {
        console.log(err.message);
    })
}

module.exports = connectDB;