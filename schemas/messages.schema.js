const mongoose = require('mongoose');
const {
    GraphQLList,
    GraphQLObjectType,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLNonNull,
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

// Definicion de Objetos (como va a ser la respuet a mi query):
const messageInputType = new GraphQLInputObjectType({
    name: 'MessageInput',
    fields: {
        name: { type: GraphQLString },
        email: { type: GraphQLString }
    }
});

const paginatedMessages = new GraphQLObjectType({
    name: 'paginatedObject',
    fields: {
        count: { type: GraphQLInt },
        page: { type: GraphQLInt },
        data: { type: new GraphQLList(TC.getType()) } // se devuelve una lista con los campos definidos en TC
    }
});

const addedMessage = new GraphQLObjectType({
    name: 'postingResult',
    fields: {
        success: { type: GraphQLBoolean },
        message: { type: GraphQLString },
        messageId: { type: GraphQLString }
    }
})

const DeletionResultType = new GraphQLObjectType({
    name: 'DeletionResult',
    fields: {
      success: { type: GraphQLBoolean },
      message: { type: GraphQLString },
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

TC.addFields({ folderInfo: new GraphQLList(folderInfoType) }); // se usa GraphQLList porque el resultado es una lista


// Las queries para los mensajes:
const query = {
    messages_getMessages: {
        type: paginatedMessages,
        description: 'Filtrado de mensaje',
        args: {
            from: { type: GraphQLString },
            to: { type: GraphQLString },
            subject: { type: GraphQLString },
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt }
        },
        resolve: resolver.getMessages
    }
}

const mutations = {
    messages_addMessage: {
        type: addedMessage,
        description: 'Agregar mensaje',
        args: {
            message: { type: new GraphQLNonNull(TC.getInputType())}
        },
        resolve: resolver.addMessage
    },
    messages_deleteMessage: {
        type: DeletionResultType,
        args: {
            _id: { type: new GraphQLNotNull(GraphQLString) },
        },
        resolve: resolver.deleteMessage
    }
}

module.exports = { query, mutations };
