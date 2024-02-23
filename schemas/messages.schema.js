const mongoose = require('mongoose');
const {
    GraphQLList,
    GraphQLObjectType,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLFloat,
    GraphQLString,
    GraphQLInputObjectType
} = require('graphql')
const { composeWithMongoose } = require('graphql-compose-mongoose');

const fromSchema = new mongoose.Schema({
    name: { type: String },
    avatar: { type: String },
    email: { type: String }
}, { _id: false });

const messageSchema = new mongoose.Schema({
    from: fromSchema,
    to: [{ name: String, email: String, _id: false }],
    subject: { type: String },
    message: { type: String },
    time: { type: String },
    read: { type: Boolean },
    starred: { type: Boolean },
    important: { type: Boolean },
    hasAttachments: { type: Boolean },
    labels: [{ type: String }],
    folder: { type: String },
    folderInfo: [{ _id: String, name: String, title: String, icon: String}]
});

const Message = mongoose.model('challenge_messages', messageSchema);
const resolver = require('../resolver/messages.resolver.js');

const TC = composeWithMongoose(Message, {});


// Las queries para los mensajes:
const query = {
    messages_GetMessages: {
        type: new GraphQLList(TC.getType()),
        description: 'Obtencion de mensaje',
        resolve: resolver.getMessages
    },
    messages_filterMessages: {
        type: new GraphQLList(TC.getType()),
        description: 'Filtrado de mensaje',
        args: {
            from: { type: GraphQLString },
            to: { type: GraphQLString },
            subject: { type: GraphQLString },
            message: { type: GraphQLString },
            time: { type: GraphQLString },
            read: { type: GraphQLBoolean },
            starred: { type: GraphQLBoolean },
            important: { type: GraphQLBoolean },
            hasAttachments: { type: GraphQLBoolean },
            labels: { type: GraphQLString },
            folder: { type: GraphQLString }
        },
        resolve: resolver.filterMessages
    }
}

module.exports = query;
