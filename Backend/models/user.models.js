const mongoose = require('mongoose');
//const { type } = require('node:os');


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    fullName: {
        firstname:{
            type: String,
            required: true,
            minlength:[3, "First name must be at least 3 characters long"]
        },
        lastname:{
            type: String,
           // required: true,
            minlength:[2, "Last name must be at least 2 characters long"]
        }
    },
    email:{
        type: String,
        required: true,
        
    },
    socketId:{
        type: String,
       // required: true,
    },
    password:{
        type: String,
        required: true,
        select:false }
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { _id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    return token;
  }
userSchema.methods.comparePasswords=async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password, 10); 
}
const User = mongoose.model('User', userSchema);

module.exports = User;