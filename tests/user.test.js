const { default: mongoose } = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const User = require("../src/models/user");

const userId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userId,
  name: "Bhumik",
  email: "bhumik@gmail.com",
  password: "123456789",

  tokens: [
    {
      token: jwt.sign({ _id: userId }, process.env.TOKEN_SECRET),
    },
  ],
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test("Should sign up", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "Bhumik",
      email: "bhumik@gmaol.com",
      password: "123456789",
    })
    .expect(201);
});

test("Login existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
});

test("Should not login nonexisting user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "a@a.com",
      password: "123456789",
    })
    .expect(403);
});

test("Should get profile of user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile of user if not logged in", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete user", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userId);
  expect(user).toBeNull();
});

test("Should not delete if unauthenticated", async () => {
  await request(app).delete("/users/me").send().expect(401);
});
