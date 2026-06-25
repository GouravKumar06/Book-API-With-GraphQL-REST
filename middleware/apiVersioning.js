const { sendError } = require("../helpers/responseHelpers");


const urlVersioning = (version) => (req,res,next) => {

    if( req.path === "/healthcheck" || req.path.startsWith("/graphql")) {
        return next();
    }

    if(req.path.startsWith(`/${version}`)){
        return next()
    }else{
        return sendError(
            res,
            400,
            "Unsupported API Version"
        );
    }
}


const headerVersioning = (header) => (req,res,next) => {
    if(req.get('Accept-Version') === header){
        next()
    }else{
        return sendError(
            res,
            400,
            "Unsupported Health Version"
        );
    }
}


const contentTypeVersioning = (version) => (req,res,next) => {
    const contentType = req.get('Content-Type')

    if( contentType && contentType.includes(`application/vnd.api.${version}+json`)){
        next()
    }else{
        return sendError(
            res,
            400,
            "Unsupported Content type Version"
        );
    }
}

module.exports = {urlVersioning,headerVersioning,contentTypeVersioning}