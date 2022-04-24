const mongoose= require('mongoose')
const ObjectId=mongoose.Schema.Types.ObjectId
const cartSchema = new mongoose.Schema({

    userId:{
        type:ObjectId,
        required:true,
        unique:true,
        ref:'User'
    },
    items:[{
        productId:{
            type:ObjectId,
            required:true,
            ref:'Product'
        },
        quantity:{
            type:Number,
            required:true,
            default:1
        }
    }],
    totalPrice:{
        type:Number,
        required:true,
        comment:"Holds total price of all the items in the cart"
    },
    totalItems:{
        type:Number,
        required:true,
        comment:"Holds total number of items in the cart"
    },
    

},{timestamps:true})

module.exports = mongoose.model('Cart',cartSchema)


