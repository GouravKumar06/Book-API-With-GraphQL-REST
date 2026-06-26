const cloudinary = require("../config/cloudinary");
const streamifier = require('streamifier');

exports.uploadToCloudinary = (buffer) => {
    return new Promise((resolve,reject)=>{

        const stream = cloudinary.uploader.upload_stream(
            {
                folder:"books",
                timeout: 60000
            },
            (error,result)=>{
                if(error) return reject(error);

                resolve({
                    imageUrl:result.secure_url,
                    publicId:result.public_id
                });
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
}