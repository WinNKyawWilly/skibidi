const WishDB = require("../models/wishModel");
const ProductDB = require("../models/bookModel");

// You may manage counting number of wishlist products in the controller
const updateWishlist = async function(req, wishingProducts) {

     var userWish = await WishDB.getUserWishlist(req.session.userId)

     
    



    result = "";
    return(result);




}

exports.updateWishlist =  updateWishlist ;