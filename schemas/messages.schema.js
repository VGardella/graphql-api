const mongoose = require('mongoose');
const { GraphQLObjectType, GraphQLList, GraphQLString } = require('graphql');
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
const getMessages = require('../resolver/messages.resolver.js');

const TC = composeWithMongoose(Message, {});

// El tipo de objeto que devuelve nuestra query
// const messageObject = new GraphQLObjectType({
//     name: 'messageObject',
//     fields: {
//         messages: {
//             type: new GraphQLList(TC.getType())
//         }
//     }
// })



// Las queries para los mensajes:
const query = {
    messages_GetMessages : {
        type: new GraphQLList(TC.getType()),
        description: 'Obtencion de mensaje',
        resolve: getMessages
    }
}

module.exports = query;
