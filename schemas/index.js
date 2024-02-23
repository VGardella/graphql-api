const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const MessageQueries = require('./messages.schema');
const FoldersQueries = require('./folders.schema');

const indexQuery = new GraphQLObjectType({
    name: 'Queries',
    description: 'Queries de Cliente',
    fields: Object.assign(MessageQueries, FoldersQueries)
})

const schema = new GraphQLSchema({ query: indexQuery })

module.exports = schema;