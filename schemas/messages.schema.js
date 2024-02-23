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
    folder: { type: String }
});

const Message = mongoose.model('challenge_messages', messageSchema);
const resolver = require('../resolver/messages.resolver.js');

const TC = composeWithMongoose(Message, {});

// Definicion de Objetos:
const messageInputType = new GraphQLInputObjectType({
    name: 'MessageInput',
    fields: {
        name: { type: GraphQLString },
        email: { type: GraphQLString }
    }
});

// const paginatedMessages = new GraphQLObjectType({
//     name: 'paginatedObject',
//     fields: {
//         numberOfMessages: { type: GraphQLInt },
//         pageNumber: { type: GraphQLInt },
//         messages: { type: new GraphQLList(TC.getType()) }
//     }
// })

const DeletionResultType = new GraphQLObjectType({
    name: 'DeletionResult',
    fields: {
      success: { type: GraphQLBoolean },
      message: { type: GraphQLString },
      deleteMessage: { type: GraphQLString }
    }
});

const folderInfoType = new GraphQLObjectType({
    name: 'folderInfoType',
    description: 'Informacion de la carpeta de origen.',
    fields: {
        _id: { type: GraphQLString },
        name: { type: GraphQLString },
        title: { type: GraphQLString },
        icon: { type: GraphQLString },
    }
})

TC.addFields({ folderInfo: new GraphQLList(folderInfoType) });


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
            folder: { type: GraphQLString },
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt }
        },
        resolve: resolver.filterMessages
    }
}

const mutations = {
    messages_addMessage: {
        type: TC.getType(),
        description: 'Agregar mensaje',
        args: {
            from: { type: messageInputType },
            to: { type: new GraphQLList(messageInputType) },
            subject: { type: GraphQLString },
            message: { type: GraphQLString },
            time: { type: GraphQLString },
            read: { type: GraphQLBoolean },
            starred: { type: GraphQLBoolean },
            important: { type: GraphQLBoolean },
            hasAttachments: { type: GraphQLBoolean },
            labels: { type: new GraphQLList(GraphQLString) },
            folder: { type: GraphQLString }
        },
        resolve: resolver.addMessage
    },
    messages_deleteMessage: {
        type: DeletionResultType,
        args: {
            _id: { type: GraphQLString },
        },
        resolve: resolver.deleteMessage
    }
}

module.exports = { query, mutations };
