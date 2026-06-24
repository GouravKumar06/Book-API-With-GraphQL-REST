const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type:String,
        required:[true,'Book title is required'],
        trim:true,
        maxLength: [100,'Book title can not be more than 100 characters'],
    },
    author: {
        type:String,
        required:[true,'Author Name is required'],
        trim:true,
    },
    year:{
        type:Number,
        required:[true,'Publication Year is required'],
        max:[new Date().getFullYear(), "Year Can Not Be In The Future"],
    },
    imageUrl:{
        type:String,
        required:[true,'Image is required'],
    },
    publicId:{
        type:String,
        required:true,
    },
    uploadedBy:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required:true,
        index:true
    },
    status:{
        type:String,
        enum:['Processing','Success','Failed'],
        default:'Processing'
    }
},{timestamps:true})

BookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book',BookSchema)
