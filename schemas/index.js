const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const MessageQueries = require('./messages.schema').query;
const MessageMutations = require('./messages.schema').mutations;
const FoldersQueries = require('./folders.schema');

const indexQuery = new GraphQLObjectType({
    name: 'Queries',
    description: 'Queries de Cliente',
    fields: Object.assign(MessageQueries, FoldersQueries)
})

const indexMutation = new GraphQLObjectType({
    name: 'Mutations',
    description: 'Modificaion de la base de datos',
    fields: MessageMutations
})

const schema = new GraphQLSchema({ query: indexQuery, mutation: indexMutation });

module.exports = schema;