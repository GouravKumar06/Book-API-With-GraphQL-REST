const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
    username: {
        type:String,
        required:[true, 'Username is required'],
        trim:true,
        maxLength: [30,'Username can not be more than 30 characters'],
        unique:true
    },
    email: {
        type:String,
        required:[true, 'email is required'],
        trim:true,
        unique:true,
        lowercase:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type:String,
        required:[true, 'password is required'],
        trim:true,
        minLength: [8, 'Password must be at least 8 characters long']
    },
    role: {
        type:String,
        enum:['User','Admin'],
        default:'User'
    }
},{timestamps:true})

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});


module.exports = mongoose.model('User',userSchema)
