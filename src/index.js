const app = require("./app");

const port = process.env.PORT;

app.listen(port || 8001, () => {
  console.log(`Listening on port ${port}`);
});
