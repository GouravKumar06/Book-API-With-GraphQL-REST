const Product = require('./schema/productSchema');
const { GraphQLError } = require('graphql'); // Standard GraphQL Error format
const { default: mongoose } = require('mongoose')


const resolvers = {
    Query: {
        getProducts: async (_, __, context) => {
            // 1. Auth Guard (isAuthenticated Check)
            if (!context.userInfo) {
                throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } } });
            }

            const { userId, role } = context.userInfo;

            console.log("role: ",role)

            let filter = {};
            if (role !== 'Admin') {
                filter.uploadedBy = userId;
            }

            const products =  await Product.find(filter).lean();

            return products.map(product => ({
                ...product,
                id: product._id.toString() // 👈 Manually id field create kar di
            }));
        },

        getSingleProduct: async (_, args, context) => {
            try {
                // 1. Auth Guard (Pehle check karo banda logged in hai ya nahi)
                if (!context.userInfo) {
                    throw new GraphQLError('Unauthorized', {
                        extensions: { code: 'UNAUTHENTICATED' }
                    });
                }

                const { id } = args; 
                const { userId, role } = context.userInfo;

                // 2. ID Validation check (Mongoose check)
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new GraphQLError('Invalid Product ID format', {
                        extensions: { code: 'BAD_USER_INPUT' }
                    });
                }

                const product = await Product.findById(id).lean();

                // 3. Check product exist or not
                if (!product) {
                    throw new GraphQLError('Product not found', {
                        extensions: { code: 'NOT_FOUND' }
                    });
                }

                // 4. Authorization Check:
                if (role !== 'Admin' && product.uploadedBy.toString() !== userId) {
                    throw new GraphQLError('Forbidden: You do not have access to this product', {
                        extensions: { code: 'FORBIDDEN' }
                    });
                }

                // 5. Return Product
                return {
                    ...product,
                    id: product._id.toString()
                };

            } catch (error) {
                console.error("Error in getSingleProduct resolver: ", error.message);
                if (error instanceof GraphQLError) throw error;
                throw new GraphQLError('Internal server error');
            }
        }
    },

    Mutation: {
        addProduct: async (_, args, context) => {
            if (!context.userInfo) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

            const { name, price } = args;
            const userId = context.userInfo.userId;

            // Memory validate and create document immediately (80ms logic with background processing)
            const newProduct = new Product({
                name,
                price,
                uploadedBy: userId,
                status: 'Processing'
            });

            await newProduct.save();

            // Note: Multer/File Upload GraphQL mein directly handle karne ke liye 
            // apollo-server-express scalar integration lagta hai, ya fir image upload ke liye alag se 
            // REST endpoint ya pre-signed URL base approach pipeline ki jaati hai background worker ke saath.
            
            return newProduct;
        },

        updateProduct: async (_, args, context) => {
            if (!context.userInfo) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
            
            const { id, ...updateData } = args;
            const { userId, role } = context.userInfo;

            const product = await Product.findById(id).select('uploadedBy').lean();
            if (!product) throw new GraphQLError('Product not found');

            // Owner ya admin hi sirf update kar sake
            if (product.uploadedBy.toString() !== userId && role !== 'Admin') {
                throw new GraphQLError('Forbidden: You cannot modify this product', { extensions: { code: 'FORBIDDEN' } });
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                id, 
                { $set: updateData }, 
                { new: true, runValidators: true }
            );

            return updatedProduct;
        },

        deleteProduct: async (_, args, context) => {
            if (!context.userInfo) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

            const { id } = args;
            const { userId, role } = context.userInfo;

            const product = await Product.findById(id);
            if (!product) throw new GraphQLError('Product not found');

            if (product.uploadedBy.toString() !== userId && role !== 'Admin') {
                throw new GraphQLError('Forbidden: You cannot delete this product', { extensions: { code: 'FORBIDDEN' } });
            }

            await Product.findByIdAndDelete(id);

            return {
                success: true,
                message: "Product deleted successfully"
            };
        }
    }
};

module.exports = resolvers;