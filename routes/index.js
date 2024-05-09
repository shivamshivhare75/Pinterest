var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post")
const passport = require('passport');
const upload = require("./multer")

const localStrategy = require("passport-local")
passport.use(new localStrategy(userModel.authenticate()))


router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});

router.get('/register', function (req, res, next) {
  res.render('register', { nav: false });
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  }).populate("posts")


  res.render("profile", { user, nav: true });
});

router.get('/show/posts', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  }).populate("posts")


  res.render("showposts", { user, nav: true });
});

router.get('/add', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })

  res.render("add", { user, nav: true });
});

router.get("/feed", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const allPosts = await postModel.find({}).populate("user")
  res.render("feed", { allPosts, nav: true })

})
router.get("/likedPost", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({
    username: req.session.passport.user
  }).populate({
    path: "liked",
    populate: {
      path: "user" // Assuming "user" is the field referencing the user in each liked post
    }
  });



  res.render("liked", { nav: true, user })
})

router.post('/liked', isLoggedIn, async (req, res) => {

  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  const postId = req.body.postId;
  // Here you can process the liked post ID as per your application's logic


  // For demonstration purposes, let's just send a simple response
  user.liked.push(postId)
  await user.save()
  res.redirect("/feed")
});


router.post('/createpost', isLoggedIn, upload.single("postimage"), async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  })
  user.posts.push(post._id);
  await user.save()
  res.redirect("/profile")
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  user.profileImage = req.file.filename;
  await user.save()
  res.redirect("profile")
});



router.post("/register", (req, res, next) => {
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    contact: req.body.phone,

  })
  userModel.register(userData, req.body.password)
    .then(() => {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/profile")
      })
    })
})

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/",
}), (req, res, next) => {

})

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
})
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/")
}
module.exports = router;
