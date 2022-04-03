const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log("Error connecting to database: ", error);
  });

//To connect using only MongoDB

//   const { MongoClient } = require("mongodb");

// const connectionUrl = "mongodb://localhost:27017";
// const databaseName = "task-manager";

// MongoClient.connect(
//   connectionUrl,
//   { useNewUrlParser: true },
//   (error, client) => {
//     if (error) {
//       return console.error(error);
//     }
//     const db = client.db(databaseName);
//   }
// );
