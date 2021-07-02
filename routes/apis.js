const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "temp/" });
const passport = require("../config/passport");

const adminController = require("../controllers/api/adminController.js");
const categoryController = require("../controllers/api/categoryController");
const userController = require("../controllers/api/userController");
const commentController = require("../controllers/api/commentController");
const restController = require("../controllers/api/restController");

const authenticated = passport.authenticate("jwt", { session: false });

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) {
      return next();
    }
    return res.json({ status: "error", message: "permission denied" });
  } else {
    return res.json({ status: "error", message: "permission denied" });
  }
};

router.post("/signin", userController.signIn);
router.post("/signup", userController.signUp);

router.get("/users/top", authenticated, userController.getTopUser);
router.get("/users/:id", authenticated, userController.getUser);
router.get("/users/:id/edit", authenticated, userController.editUser);
router.put("/users/:id/", authenticated, upload.single("image"), userController.putUser);

router.get("/admin/users", authenticated, authenticatedAdmin, adminController.getUsers);
router.get("/admin/restaurants", authenticated, authenticatedAdmin, adminController.getRestaurants);
router.get("/admin/restaurants/:id", adminController.getRestaurant);
router.post("/admin/restaurants/", upload.single("image"), adminController.postRestaurant);
router.get("/admin/restaurants/:id/edit", authenticated, authenticatedAdmin, adminController.editRestaurant);
router.put("/admin/restaurants/:id", upload.single("image"), adminController.putRestaurant);
router.delete("/admin/restaurants/:id", adminController.deleteRestaurant);
router.get("/admin/categories", categoryController.getCategories);
router.post("/admin/categories", categoryController.postCategories);
router.put("/admin/categories/:id", categoryController.putCategory);
router.delete("/admin/categories/:id", categoryController.deleteCategory);

router.get("/restaurants", authenticated, restController.getRestaurants);
router.get("/restaurants/feeds", authenticated, restController.getFeeds);
router.get("/restaurants/top", authenticated, restController.getTopRestaurants);
router.get("/restaurants/:id", authenticated, restController.getRestaurant);

router.post("/favorite/:restaurantId", authenticated, userController.addFavorite);
router.delete("/favorite/:restaurantId", authenticated, userController.removeFavorite);
router.post("/like/:restaurantId", authenticated, userController.addLike);
router.delete("/like/:restaurantId", authenticated, userController.removeLike);
router.post("/following/:userId", authenticated, userController.addFollowing);
router.delete("/following/:userId", authenticated, userController.removeFollowing);

router.post("/comments", authenticated, commentController.postComment);
router.delete("/comments/:id", authenticated, authenticatedAdmin, commentController.deleteComment);

module.exports = router;
