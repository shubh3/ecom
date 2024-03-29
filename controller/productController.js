const Product = require("../models/product");
const bigPromise = require("../middleware/bigPromise.js");
const cookieToken = require("../utils/cookieToken");
const CustomError = require("../utils/CustomError");
const WhereClause = require("../utils/WhereClause");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");

exports.addProduct = bigPromise(async( req,res,next)=>{

    let imageArray=[];

    if(!req.files)
    {
        return next(new CustomError("iamges are required",401));
    }

    if(req.files)
    {
        for(let index=0;index<req.files.photos.length;index++)
        {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                folder:"products"
            })

            imageArray.push({
                id:result.public_id,
                secure_url:result.secure_url
            })


        }
    }

req.body.photos= imageArray;
req.body.user=req.user.id;

const product = await Product.create(req.body);

res.status(200).json({
    success:true,
    product
})

});

exports.getAllProduct = bigPromise(async(req,res,next) => {

    const resultPerPage =6 ;
    const totalcountProduct = await Product.countDocuments();

   
    const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

    let products =await productsObj.base;
    const filteredProductNumber = products.length;

    productsObj.pager(resultPerPage);
    products = await productsObj.base.clone();

    res.status(200).json({
        success:true,
        products,
        filteredProductNumber,
        totalcountProduct,
    })
    
    });

exports.getOneProduct = bigPromise(async(req,res,next) => {
    const product = await Product.findById(req.params.productId);

    res.status(200).json({
        product
    })


});

exports.admingetAllProduct = bigPromise(async(req,res,next) => {
    const products = await Product.find();

    res.status(200).json({
        products
    })

});

exports.adminUpdateOneProduct = bigPromise(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
  
    if (!product) {
      return next(new CustomError("No product found with this id", 401));
    }
    let imagesArray = [];
  
    if (req.files) {
      //destroy the existing image
      for (let index = 0; index < product.photos.length; index++) {
        const res = await cloudinary.v2.uploader.destroy(
          product.photos[index].id
        );
      }
  
      for (let index = 0; index < req.files.photos.length; index++) {
        let result = await cloudinary.v2.uploader.upload(
          req.files.photos[index].tempFilePath,
          {
            folder: "products", //folder name -> .env
          }
        );
  
        imagesArray.push({
          id: result.public_id,
          secure_url: result.secure_url,
        });
      }
    }
  
    req.body.photos = imagesArray;
  
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
      product,
    });
});

exports.adminDeleteOneProduct = bigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
  
    if (!product) {
      return next(new CustomError("No product found with this id", 401));
    }
  
    //destroy the existing image
    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
    }
  
    await product.remove();
  
    res.status(200).json({
      success: true,
      message: "Product was deleted !",
    });
  });

  exports.addReview = bigPromise(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
  
    const product = await Product.findById(productId);
  
    const AlreadyReview = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
  
    if (AlreadyReview) {
      product.reviews.forEach((review) => {
        if (review.user.toString() === req.user._id.toString()) {
          review.comment = comment;
          review.rating = rating;
        }
      });
    } else {
      product.reviews.push(review);
      product.numberOfReviews = product.reviews.length;
    }
  
    // adjust ratings
  
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
  
    //save
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
  });

exports.deleteReview = bigPromise(async (req, res, next) => {
    const { productId } = req.query;
  
    const product = await Product.findById(productId);
  
    const reviews = product.reviews.filter(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
  
    const numberOfReviews = reviews.length;
  
    // adjust ratings
  
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
  
    //update the product
  
    await Product.findByIdAndUpdate(
      productId,
      {
        reviews,
        ratings,
        numberOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
  });
  
exports.getOnlyReviewsForOneProduct = bigPromise(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
  
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  });
  
  