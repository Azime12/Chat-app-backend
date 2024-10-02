const mongoose = require("mongoose");
// const Router = require("./routes")

// const app = express();

const connectDB = () => {
    mongoose.connect('mongodb+srv://zmera:ak12345678@cluster0.mv9shgj.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        // useFindAndModify: false,
        useUnifiedTopology: true
    });
    mongoose.set('strictQuery', true)
    db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error: ".red.bold));
    db.once("open", function() {
        console.log("Connected successfully".green.bold);
    })
}

exports.connectDB = connectDB