const { default: mongoose } = require('mongoose')
const Book = require('../schema/bookSchema')
const { uploadToCloudinary } = require('../utils/cloudinary.util');
const cloudinary = require('../config/cloudinary')
const fs = require('fs');
const client = require('../database/redis');

exports.addBook = async (req,res) => {
    try{
        if(!req.file){
            return res.status(400).json({
                success:false,
                message : "File is Required"
            })
        }

        const userId = req.userInfo.userId
        const {title,author,year} = req.body

        const newBook = new Book({
            title, author, year,
            imageUrl: "Processing_upload", 
            publicId: "Processing_id",
            uploadedBy: userId,
            status: "Processing"
        });

        await newBook.save();
        
        // runs in the event loop
        uploadToCloudinary(req.file.buffer)
            .then( async ({ imageUrl,publicId }) => {
                newBook.imageUrl = imageUrl;
                newBook.publicId = publicId;
                newBook.status = "Success";
                await newBook.save();
                console.log(`🚀 [Background] Book ${newBook._id} successfully processed and saved.`);

                const eventPayload = {
                    bookId: newBook._id,
                    title: newBook.title,
                    author: newBook.author,
                    uploadedBy: newBook.uploadedBy,
                    timestamp: new Date()
                };

                await client.publish('book:created', JSON.stringify(eventPayload));
                console.log(`📢 [Pub/Sub] Event published to 'book:created' channel.`);
            })
            .catch( async (bgError) => {
                console.error(`❌ [Background Error] Failed for Book ${newBook._id}:`, bgError);
                newBook.status = "Failed";
                await newBook.save();
            });



        return res.status(201).json({
            success: true,
            message: "Book creation initiated successfully. Image is processing in the background.",
            bookId: newBook._id
        });

    }catch(error){
        console.log("error in add book ",error.message)

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: messages 
            });
        }


        return res.status(500).json({
            success:false,
            message : "internal server error"
        })
    }
}


exports.getAllBooks = async(req,res) => {
    try{

        const { search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

        let query = {};

        if (search) {
            query.$text = { $search: search };
        }

        const sortOrder = order === 'asc' ? 1 : -1;

        let sortQuery = { [sortBy]: sortOrder };

        if (search && sortBy === 'createdAt') {
            sortQuery = { score: { $meta: "textScore" } };
        }

        const pageNum = Math.max(1, parseInt(page));  
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        const [books, totalBooks] = await Promise.all([
            Book.find(query)
                .sort(sortQuery)
                .skip(skip)
                .limit(limitNum)
                .lean(), 
            
            Book.countDocuments(query)
        ]);

        if(books.length === 0){
            return res.status(404).json({
                success: false,
                message: "No books found matching the criteria."
            });
        }

        const totalPages = Math.ceil(totalBooks / limitNum);

        return res.status(200).json({
            success: true,
            message: "Books retrieved successfully",
            pagination: {
                totalBooks,
                totalPages,
                currentPage: pageNum,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            books,
        });
    }catch(error){
        console.log(error)

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.getBookBYRequest = async(req,res) =>  {
    try{
        const id = req.params.id

        // 1. Validate ID format BEFORE running the database query
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format. Must be a 24-character hex string."
            });
        }

        const book = await Book.findById(id).lean();

        if(!book){
            res.status(404).json({
               message : "Does not have book"
            })
        }

        res.status(200).json({
            message : "book found successfully",
            book        
        })
    }catch(error){
        console.log(error)

        res.status(500).json({
            message : "internal server error"
        })
    }
}



exports.updateBookBYRequest = async(req,res) =>  {
    try{
        const id = req.params.id
        const changedYear = req.body.year

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format. Must be a 24-character hex string."
            });
        }


        const book = await Book.findByIdAndUpdate(
            id,
            {
                $set:{year : changedYear}
            },
            {
                new : true,
                runValidators:true
            }
        );

        if(!book){
            res.status(404).json({
               message : "Does not have book"
            })
        }

        res.status(200).json({
            message : "book updated successfully",
            book        
        })
    }catch(error){
        console.log(error)

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: messages
            });
        }

        // 4. Catch CastError just in case an invalid ID slips through
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Invalid format for field: ${error.path}`
            });
        }

        res.status(500).json({
            message : "internal server error"
        })
    }
}


exports.deleteBookBYRequest = async(req,res) =>  {
    try{
        const id = req.params.id

        const userId = req.userInfo.userId

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format. Must be a 24-character hex string."
            });
        }

        const book = await Book.findOne({ _id: id });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "This book does not exist."
            });
        }

        if(book.uploadedBy.toString() !== userId){
            return res.status(403).json({
                success: false,
                message: "You Can't Access this Book or This Book Did Not exist"
            });
        }

        await Promise.all([
            cloudinary.uploader.destroy(book.publicId), // Cloudinary deletion
            Book.findByIdAndDelete(id)                  // Database deletion
        ]);

        return res.status(200).json({
            message : "book deleted successfully",
            book        
        })
    }catch(error){
        console.log(error)

        return res.status(500).json({
            message : "internal server error"
        })
    }
}