const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.User;
const Comment = db.Comment;
const Restaurant = db.Restaurant;
const Favorite = db.Favorite;
const Like = db.Like;
const Followship = db.Followship;
const helpers = require("../_helpers");

const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

let userService = {
  getUser: (req, res, callback) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: Restaurant, as: "FavoritedRestaurants" },
        { model: User, as: "Followers" },
        { model: User, as: "Followings" },
      ],
    }).then((user) => {
      callback({
        myId: req.user.id,
        user: user.toJSON(),
        Comments: user.Comments,
        FavoritedRestaurants: user.FavoritedRestaurants,
        Followers: user.Followers,
        Followings: user.Followings,
      });
    });
  },

  editUser: (req, res, callback) => {
    User.findByPk(req.params.id).then((user) => {
      callback({ user: user.toJSON() });
    });
  },

  putUser: (req, res, callback) => {
    if (!req.body.name) {
      req.flash("error_messages", "name didn't exist");
      return res.redirect("back");
    }
    const { file } = req;
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id, {
          include: [
            { model: Comment, include: [Restaurant] },
            { model: Restaurant, as: "FavoritedRestaurants" },
            { model: User, as: "Followers" },
            { model: User, as: "Followings" },
          ],
        }).then((user) => {
          user
            .update({
              name: req.body.name,
              image: file ? img.data.link : null,
            })
            .then((user) => {
              return callback({
                user: user.toJSON(),
                comments: user.Comments,
                FavoritedRestaurants: user.FavoritedRestaurants,
                Followers: user.Followers,
                Followings: user.Followings,
              });
            });
        });
      });
    } else {
      return User.findByPk(req.params.id, {
        include: [
          { model: Comment, include: [Restaurant] },
          { model: Restaurant, as: "FavoritedRestaurants" },
          { model: User, as: "Followers" },
          { model: User, as: "Followings" },
        ],
      }).then((user) => {
        user
          .update({
            name: req.body.name,
          })
          .then((user) => {
            return callback({
              user: user.toJSON(),
              comments: user.Comments,
              FavoritedRestaurants: user.FavoritedRestaurants,
              Followers: user.Followers,
              Followings: user.Followings,
            });
          });
      });
    }
  },

  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId,
    }).then((restaurant) => {
      callback({ status: "success", message: "addFavorite" });
    });
  },

  removeFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId,
      },
    }).then((favorite) => {
      favorite.destroy().then((restaurant) => {
        callback({ status: "success", message: "removeFavorite" });
      });
    });
  },

  addLike: (req, res, callback) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId,
    }).then((restaurant) => {
      callback({ status: "success", message: "addLike" });
    });
  },

  removeLike: (req, res, callback) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId,
      },
    }).then((like) => {
      like.destroy().then((restaurant) => {
        callback({ status: "success", message: "removeLike" });
      });
    });
  },

  getTopUser: (req, res, callback) => {
    return User.findAll({
      include: [{ model: User, as: "Followers" }],
    }).then((users) => {
      users = users.map((user) => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: helpers
          .getUser(req)
          .Followings.map((d) => d.id)
          .includes(user.id),
      }));
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount);
      return callback({ users: users });
    });
  },

  addFollowing: (req, res, callback) => {
    return Followship.create({
      followerId: helpers.getUser(req).id, //user himself
      followingId: req.params.userId, // the guy you want to follow
    }).then((followship) => {
      callback({ status: "success", message: "addFollowing" });
    });
  },

  removeFollowing: (req, res, callback) => {
    return Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId,
      },
    }).then((followship) => {
      followship.destroy().then((followship) => {
        callback({ status: "success", message: "removeFollowing" });
      });
    });
  },
};

module.exports = userService;
