const mongoose = require("mongoose");

const connectToDB = () => {
  mongoose.connect(process.env.DB_URI).then((data) => {
    console.log("Mongo DB connected with server :" + data.connection.host);
  });
};

module.exports = connectToDB;
