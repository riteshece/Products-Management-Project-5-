const express = require('express');

const router = express.Router();


const userController = require('../Controllers/UserController')

const ProductController = require('../Controllers/ProductController')

const CartController =require('../Controllers/CartController')

const OrderController = require('../Controllers/OrderController')

const middleware = require('../Middleware/auth')


// ************************************************ User Controller *********************************************** //

router.post('/register', userController.createUser)

router.post('/login', userController.login)

router.get('/user/:userId/profile', middleware.auth, userController.getUser)

router.put('/user/:userId/profile', middleware.auth, userController.update)

// ************************************************ product Controller ********************************************* //

router.post('/products',  ProductController.createProduct)

router.get('/products',  ProductController.getProduct)

router.get('/products/:productId', ProductController.getProductById)

router.put('/products/:productId', ProductController.updateProduct)

router.delete('/products/:productId', ProductController.deleteById)

// ************************************************ cart Controller *********************************************** //

router.post('/users/:userId/cart',middleware.auth,CartController.createCart)

router.put('/users/:userId/cart',middleware.auth,CartController.updateCart)

router.get('/users/:userId/cart',middleware.auth, CartController.getCart)

router.delete('/users/:userId/cart',middleware.auth,CartController.deleteCart)

// ************************************************ order Controller *********************************************** //

router.post('/users/:userId/orders',middleware.auth,OrderController.createOrder)

router.put('/users/:userId/orders',middleware.auth,OrderController.updateOrder)



module.exports = router;








