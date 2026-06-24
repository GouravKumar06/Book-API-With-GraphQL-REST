const express = require('express');
const { addBook, getAllBooks, getBookBYRequest, updateBookBYRequest, deleteBookBYRequest } = require('../controller/book.controller');
const { isAuthenticated, isAdmin, upload } = require('../middleware/middleware');

const router = express.Router();


router.get("/get-all-books",isAuthenticated,isAdmin,getAllBooks)
router.post("/add-book",isAuthenticated,upload.single('image'),addBook);
router.get("/get-book/:id",isAuthenticated,getBookBYRequest);
router.put("/update-book/:id",isAuthenticated,updateBookBYRequest);
router.delete("/delete-book/:id",isAuthenticated,deleteBookBYRequest);



module.exports = router
