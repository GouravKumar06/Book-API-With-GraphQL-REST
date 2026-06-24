require('dotenv').config();
const User = require('../schema/userSchema')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


exports.register = async(req,res) => {
    try{
        const {username,email,password,role} = req.body

        const newUser = await User.create({
            username,
            email,
            password,
            role
        })

        return res.status(201).json({
            success:true,
            message : "User resistered Successfully",
            newUser
        })

    }catch(error){
        console.log(error.message)

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0]; 
            const value = Object.values(error.keyValue)[0];

            return res.status(400).json({
                success: false,
                message: "Duplicate Error",
                errors: [`This ${field} '${value}' is already registered.`]
            });
        }

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


exports.login = async(req,res) => {
    try{
        const { input, password } = req.body

        if(!input || !password ){
            return res.status(400).json({
                success:false,
                message : "All Fields Are required"
            })
        }

        const findData = await User.findOne({
            $or:[
                { email : input},
                { username : input}
            ]
        })

        if(!findData){
            return res.status(400).json({
                success:false,
                message : "Invalid Credentials"
            })
        }

        const matchPassword = await bcrypt.compare(password,findData.password)

        if(!matchPassword){
            return res.status(500).json({
                success:false,
                message : "Invalid Credentials"
            })
        }

        const payload = {
            userId : findData._id,
            username : findData.username,
            role : findData.role
        }

        const token = jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn : '1d'
        })

        return res.status(201).json({
            success:true,
            message : "User login Successfully",
            token
        })

    }catch(error){
        console.log(error)

        return res.status(500).json({
            success : false,
            message : "internal server error"
        })
    }
}


exports.changePassowrd = async(req,res) => {
    try{
        const userId = req.userInfo.userId
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found or account has been deleted."
            });
        }

        const { oldPassword,newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both old password and new password are required."
            });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as the old password."
            });
        }

        const isMatch = await bcrypt.compare(oldPassword,user.password)

        if(!isMatch){
            return res.status(401).json({
                success:false,
                message : "The old password you entered is incorrect."
            })
        }

        user.password = newPassword;

        const ValidationError = user.validateSync();

        if(ValidationError && validationError.errors.password){
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: [validationError.errors.password.message]
            });
        }

        await user.save();
    
        return res.status(201).json({
            success:true,
            message : "passowrd changed Successfully",
        })

    }catch(error){
        console.log(error.message)

        return res.status(500).json({
            success:false,
            message : "internal server error"
        })
    }
}