const { gql } = require('graphql-tag')

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    imageUrl: String!
    status: String!
    uploadedBy: ID!
  }

  type MessageResponse {
    success: Boolean!
    message: String!
  }

  type Query {
    getProducts: [Product]
    getSingleProduct(id:ID!) : Product
  }

  type Mutation {
    addProduct(name: String!, price: Float!): Product
    updateProduct(id: ID!, name: String, price: Float): Product
    deleteProduct(id: ID!): MessageResponse
  }
`;

module.exports = typeDefs;