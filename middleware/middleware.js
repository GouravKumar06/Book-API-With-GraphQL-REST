const jwt = require('jsonwebtoken')
const multer = require('multer')
const util = require('util');

const verifyJwtAsync = util.promisify(jwt.verify);

exports.isAuthenticated = async (req,res,next) => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader?.startsWith("Bearer ")){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })
        }

        const token = authHeader.split(" ")[1];

        if(!token){
            return res.status(500).json({
                success : false,
                message : "Not Authorized"
            })
        }

        const decoded = await verifyJwtAsync(token, process.env.JWT_SECRET);

        req.userInfo = decoded

        next()

    }catch(error){

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
        }

        return res.status(500).json({
            success : false,
            message : "internal server error"
        })
    }
}


exports.isAdmin = (req,res,next) => {
    try{
        if(req.userInfo.role !== "Admin"){
            return res.status(403).json({
                success:false,
                message:"Access Denied"
            });
        }

        next();

    }catch(error){
        console.log(error.message)

        return res.status(500).json({
            success : false,
            message : "internal server error"
        })
    }
}


exports.buildAuthContext = async ({ req }) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
        return { userInfo: null }; // No user authenticated
    }

    const token = authHeader.split(" ")[1];
    if (!token) return { userInfo: null };

    try {
        const decoded = await verifyJwtAsync(token, process.env.JWT_SECRET);
        return { userInfo: decoded }; // Yeh object ab saare resolvers ko milega
    } catch (error) {
        return { userInfo: null }; // Invalid token
    }
};


const storage = multer.memoryStorage();

const checkFile = (req,file,cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new Error('Not an Image!'))
    }
}


exports.upload = multer({
    storage:storage,
    fileFilter:checkFile,
    limits: {
        fileSize:5 * 1024 * 1024
    }
})