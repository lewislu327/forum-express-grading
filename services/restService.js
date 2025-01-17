const { Restaurant, Category, Comment, User, Favorite } = require("../models");
const helpers = require("../_helpers");
const pageLimit = 10;

let restService = {
  getRestaurants: (req, res, callback) => {
    let offset = 0;
    const whereQuery = {};
    let categoryId = "";

    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit;
    }

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId);
      whereQuery.categoryId = categoryId;
    }

    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset,
      limit: pageLimit,
    }).then((result) => {
      const page = Number(req.query.page) || 1;
      const pages = Math.ceil(result.count / pageLimit);
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1);
      let prev = page - 1 < 1 ? 1 : page - 1;
      let next = page + 1 > pages ? pages : page + 1;

      const data = result.rows.map((r) => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map((d) => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map((d) => d.id).includes(r.id),
      }));
      Category.findAll({ raw: true, nest: true }).then((categories) => {
        return callback({
          restaurants: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next,
        });
      });
    });
  },

  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] },
        { model: User, as: "FavoritedUsers" },
        { model: User, as: "LikedUsers" },
      ],
    }).then((restaurant) => {
      const isFavorited = restaurant.FavoritedUsers.map((d) => d.id).includes(
        helpers.getUser(req).id
      );
      const isLiked = restaurant.LikedUsers.map((d) => d.id).includes(helpers.getUser(req).id);
      restaurant.increment("viewCounts", { by: 1 });
      return callback({
        isFavorited,
        isLiked,
        restaurant: restaurant.toJSON(),
      });
    });
  },

  getFeeds: (req, res, callback) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [["createdAt", "DESC"]],
        include: [Category],
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [["createdAt", "DESC"]],
        include: [User, Restaurant],
      }),
    ]).then(([restaurants, comments]) => {
      return callback({
        restaurants: restaurants,
        comments: comments,
      });
    });
  },

  getDashboard: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category, Comment, { model: User, as: "FavoritedUsers" }],
    }).then((restaurant) => {
      return callback({ restaurant: restaurant.toJSON() });
    });
  },

  getTopRestaurants: (req, res, callback) => {
    return Restaurant.findAll({
      include: [{ model: User, as: "FavoritedUsers" }],
    }).then((restaurants) => {
      restaurants = restaurants.map((restaurant) => ({
        ...restaurant.dataValues,
        description: restaurant.description.substring(0, 50),
        favoritedCount: restaurant.FavoritedUsers.length,
        isFavorited: restaurant.FavoritedUsers.map((d) => d.id).includes(helpers.getUser(req).id),
      }));
      restaurants = restaurants.sort((a, b) => b.favoritedCount - a.favoritedCount);
      restaurants = restaurants.slice(0, 10);
      return callback({
        restaurants: restaurants,
      });
    });
  },

  getRandomRestaurant: async (req, res, callback) => {
    const restaurants = await Restaurant.findAll({ raw: true, nest: true });
    const restaurantId = restaurants.map((d) => d.id);

    let min = restaurantId[0];
    let max = restaurantId.pop();

    function getRandom(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const randomId = getRandom(min, max);
    console.log(randomId);
    return Restaurant.findByPk(randomId, {
      include: [
        Category,
        { model: Comment, include: [User] },
        { model: User, as: "FavoritedUsers" },
        { model: User, as: "LikedUsers" },
      ],
    }).then((restaurant) => {
      const isFavorited = restaurant.FavoritedUsers.map((d) => d.id).includes(req.user.id);
      const isLiked = restaurant.LikedUsers.map((d) => d.id).includes(helpers.getUser(req).id);
      restaurant.increment("viewCounts", { by: 1 });
      return callback({
        isFavorited,
        isLiked,
        restaurant: restaurant.toJSON(),
      });
    });
  },
};

module.exports = restService;
