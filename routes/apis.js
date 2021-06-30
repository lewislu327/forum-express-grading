const express = require('express')
const router = express.Router()

const adminController = require('../controllers/apis/adminController.js')
const categoryController = require('../controllers/apis/categoryController')

router.get('/admin/restaurants', adminController.getRestaurants)
router.get('/admin/restaurants/:id', adminController.getRestaurant)

router.get('/admin/categories', categoryController.getCategories)

module.exports = router