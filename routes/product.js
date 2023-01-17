const express = require('express')
const router = express.Router()

const { addProduct,getAllProduct,admingetAllProduct,
    getOneProduct,adminUpdateOneProduct,adminDeleteOneProduct ,
    addReview,deleteReview,getOnlyReviewsForOneProduct
} = require('../controller/productController');
const { isLoggedIn,customRole } = require('../middleware/userMiddleware');

router.route('/products').get(getAllProduct);

router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(isLoggedIn, getOnlyReviewsForOneProduct);

router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct);
router.route('/admin/products').get(isLoggedIn,customRole('admin'),  admingetAllProduct);
router.route('/products/:productId').get(isLoggedIn,getOneProduct);

router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct);
module.exports = router;