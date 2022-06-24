const app = require("./app");
const dotenv = require("dotenv");
const connectToDB = require("./config/database");

//Handling uncaught exceptions
process.on("uncaughtException", (error) => {
  console.log(`Error:${error.message}`);
  console.log(`Shutting down the server due to uncaught error`);
  process.exit(1);
});

//config

dotenv.config({ path: "backend/config/config.env" });

//connnect to DB

connectToDB();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is listening on ${process.env.PORT}`);
});

//Unhandled Prmoise Rejection

process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`Shutting down the server due to unhandled Promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
