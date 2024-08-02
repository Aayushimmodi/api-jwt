var mongoose =  require('mongoose');
const {Schema} =  mongoose;

const userSchema =  new Schema({
    user_name : String,
    user_email : String,
    user_mobile : String,
    user_password : String
})

const userModel  = mongoose.model('user',userSchema);
module.exports =  userModel;