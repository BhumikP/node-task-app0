const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const User = require("../models/user");

const router = new express.Router();

router.get("/me", auth, async (req, res) => {
  res.send(req.user);
});

const upload = multer({
  // dest: "avatars",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a appropriate  image !"));
    }
    cb(undefined, true);
  },
});

router.get("/me/avatar", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});

router.post(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send("Can not delete avatar");
  }
});

router.get("/:id", auth, async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(500).send("can not create user");
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if (!user) {
      return res.status(403).send("Unable to login");
    }

    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    console.log(e);
    res.status(403).send(e.message);
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send("Logout Successful");
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status("200").send("Logout from all device");
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/me", auth, async (req, res) => {
  const allowedUpdates = ["name", "email", "password", "age"];
  const updatesFromReq = Object.keys(req.body);
  const isValidOperation = updatesFromReq.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    updatesFromReq.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // console.log(req.user);
    await req.user.remove();

    res.status(200).send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//********************* Admin Can do these things ***************************//

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/:id", auth, async (req, res) => {
  const id = req.params.id;
  const allowedUpdates = ["name", "email", "age", "password"];
  const updatesFromReq = Object.keys(req.body);

  const isValidOperation = updatesFromReq.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    /*It bypass the pre method (Directly perform update in db)*/
    // const user = await User.findByIdAndUpdate(id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    const user = await User.findById(id);

    updatesFromReq.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/:id", auth, async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
