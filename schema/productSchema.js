const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    imageUrl: {
        type: String,
        required: true,
        default: 'pending_upload'
    },
    publicId: {
        type: String,
        default: 'pending_id'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Processing', 'Success', 'Failed'],
        default: 'Processing'
    }
}, { timestamps: true });

// Fast searching ke liye index lagaya
ProductSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', ProductSchema);