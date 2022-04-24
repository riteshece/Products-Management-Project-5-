const ProductModel =require("../Models/ProductModel")
const validator =require("../Validator/validation")
const aws =require('aws-sdk')


// ************************************* AWS-S3 *****************************************************//

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",  // id
    secretAccessKey: "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",  // secret password
    region: "ap-south-1" 
  });
  
  
  // this function uploads file to AWS and gives back the url for the file
  let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) { 
      
      let s3 = new aws.S3({ apiVersion: "2006-03-01" });
      var uploadParams = {
        ACL: "public-read", 
        Bucket: "classroom-training-bucket", // HERE
        Key: "group37/profileImages/" + file.originalname, // HERE    
        Body: file.buffer, 
      };
  
      s3.upload(uploadParams , function (err, data) {
        if (err) {
          return reject( { "error": err });
        }
        console.log(data)
        console.log("File uploaded successfully.");
        return resolve(data.Location); //HERE 
      });
    });
  };

// ************************************* create-API *****************************************************//

const createProduct = async function(req,res){
    try{
        let ProductData =req.body
        if(!validator.isValidBody(ProductData)){
            return res.status(400).send({status:false,msg:"Product data is require in requestBody"})
        }
        const {title,description,price,currencyId,currencyFormat,style,availableSizes} = ProductData
         //validation title
        if(!validator.isValid(title)){
            return res.status(400).send({status:false,msg:"Title is require in requestBody"})
        }
        //validation description
        if(!validator.isValid(description)){
            return res.status(400).send({status:false,msg:"Description is require in requestBody"})
        }
        //validation price
        if(!validator.isValid(price)){
            return res.status(400).send({status:false,msg:"Price is require in requestBody"})
        }
         //validation currencyId
        if(!validator.isValid(currencyId)){
            return res.status(400).send({status:false,msg:"CurrencyId is require in requestBody"})
        }
         //validation currencyFormat
        if(!validator.isValid(currencyFormat)){
            return res.status(400).send({status:false,msg:"CurrencyFormat is require in requestBody"})
        }
         //validation style
        if(!validator.isValid(style)){
            return res.status(400).send({status:false,msg:"Style is require in requestBody"})
        }
         //validation availableSize
        if(!validator.isValid(availableSizes)){
            return res.status(400).send({status:false,msg:"AvailableSize is require in requestBody"})

        }  //validation duplicate title
        const DTitle = await ProductModel.findOne({title})
        if(DTitle) return res.status(404).send({status:false,msg:"title is already is present"})


        let files = req.files;
        if (files && files.length > 0) {
        var uploadedFileURL = await uploadFile( files[0] ); 
        }

        productImage = uploadedFileURL
        let ProductData1 ={title,description,price,currencyId,currencyFormat,style,availableSizes,productImage}
        let createP =await ProductModel.create(ProductData1)
        return res.status(201).send({status:true,msg:"product model created successfully", data:createP})



    }
    catch(err){
       return res.status(500).send({status:false,msg:err.message})
    }
}
    module.exports.createProduct=createProduct
// *******************************************************get//product api*************************************************


const getProduct = async function(req,res) {
    try{
        let size = req.query.size
        let name = req.query.name
        let priceGreaterThan = req.query.priceGreaterThan
        let priceLessThan = req.query.priceLessThan
        let priceSort = req.query.priceSort


        // Validate of body(It must not be present)
        const body = req.body;
        if(validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "Body must not be present"})
        }

        // Validate params(it must not be present)
        const params = req.params;
        if(validator.isValidBody(params)) {
            return res.status(400).send({status: false, msg: "Invalid request"})
        }

        let data = {}

        // To search size
        if(size) {
            let sizeSearch = await ProductModel.find({availableSizes: size, isDeleted: false}).sort({price: priceSort})

            if(sizeSearch.length !== 0) {
                return res.status(200).send({ status: true, msg: "Success", data: sizeSearch})
            }
            else {
                return res.status(400).send({status: false, msg: "No products exist"})
            }
        }

        // To find products with name
        if(name) {
            let nameSearch = await ProductModel.find({title: {$regex: name}, isDeleted: false}).sort({price:priceSort})

            if(nameSearch.length !== 0) {
                return res.status(200).send({status: true, msg: "Success", data: nameSearch})
            }
            else {
                return res.status(400).send({status: false, msg: "No products exist"})
            }
        }

        // To find the price
        if(priceGreaterThan) {
            data["$gt"] = priceGreaterThan
        }

        if(priceLessThan) {
            data["$lt"] = priceLessThan
        }

        if(priceLessThan || priceGreaterThan) {
            let searchPrice = await ProductModel.find({price:data, isDeleted: false}).sort({price: priceSort})

            if(searchPrice.length !== 0) {
                return res.status(200).send({status: true, msg: "Success", data: searchPrice})
            }
            else {
                return res.status(400).send({status: false, msg: "No products exist"})
            }                
        }

        let finalProduct = await ProductModel.find(data).sort({price: priceSort})
        if(finalProduct !== 0) {
            return res.status(200).send({status: true, msg: "Success", data: finalProduct})
        }
        else{
            return res.status(404).send({status: false, msg: "No product exist"})
        }
        

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}
       module.exports.getProduct = getProduct



// ******************************************************** PUT /products/:productId ******************************************************* //


const getProductById = async function(req,res) {
    try{

        // Validate of body(It must not be present)
        const body = req.body;
        if(validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "Body must not be present"})
        }

        // Validate query (it must not be present)
        const query = req.query;
        if(validator.isValidBody(query)) {
            return res.status(400).send({ status: false, msg: " query is not required here"});
        }

        const productId = req.params.productId
        if(!validator.isValidobjectId(productId)) {
            return res.status(400).send({status: false, msg: `this product Id is not valid`})
        }

        const findProductId = await ProductModel.findById({_id:productId})
        if(!findProductId) {
            return res.status(404).send({status: false, msg: `this productId is not exist in database`})
        }

        return res.status(200).send({status: true, data: findProductId})

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}
    module.exports.getProductById = getProductById



  //********************************** PUT /update/:product ******************************

const updateProduct = async function(req,res){
    try{
        const body =req.body
        if(!validator.isValidBody(body)){
            return res.status(400).send({status:false,msg:"Product details must be require in request body"})
        }

     // Validate query (it must not be present)
    const query =req.query;
    if(validator.isValidBody(query)){
        return res.status(400).send({status:false,msg:"invalid parameter"})
    }
    const params =req.params;

    const {title, description, price, isFreeShipping, style, availableSizes, installments} = body
    const searchProduct =await ProductModel.findOne({_id:params.productId, isDeleted: false})

    if(!searchProduct){
        return res.status(400).send({status:false,msg:"product is not found"})
    }
        let files = req.files;
        if (files && files.length > 0) {
        var uploadedFileURL = await uploadFile( files[0] );
        }
        const finalProduct ={title, description, price, currencyId: "₹", currencyFormat: "INR",isFreeShipping, productImage: uploadedFileURL, style: style, availableSizes, installments

        }
        let updateProduct = await ProductModel.findOneAndUpdate({_id:params.productId},finalProduct,{new:true})
        return res.status(200).send({status:true,msg:"updated successfully",data:updateProduct})
    }
    
    catch(err){
        return res.status(500).send({status:false,msg:err.message})
    }
   
}
module.exports.updateProduct=updateProduct

//**********************************  /delete/:product ******************************

const deleteById = async function(req,res){
    try{
        const data = req.body
        if(validator.isValidBody(data)){
            return res.status(400).send({status:false,msg:"invalid parameter"})
        }
        const query =req.query
        if(validator.isValidBody(query)){
            return res.status(400).send({status:false,msg:"invalid parameter"})
        }
         const productId =req.params.productId

         if(!validator.isValidobjectId(productId)){
            return res.status(400).send({status:false,msg:"product Id is not valid"})
         }

         let deleteProduct = await ProductModel.findById({_id:productId})
         if(!deleteProduct){
            return res.status(404).send({status:false,msg:"this productId is not found in db"})
         }
         if (deleteProduct.isDeleted !== false) {
            return res.status(400).send({status:false, msg:`this productId is already deleted`})
        }
    
        await ProductModel.findByIdAndUpdate({_id:productId},{$set:{isDeleted:true, deletedAt: new Date()}},{new:true})
    
        return res.status(200).send({status:false, msg:"successfully deleted"})
    
        }

    catch(err){
        res.status(500).send({status:false,msg:err.message})
    }
}

module.exports.deleteById = deleteById



