const mongoose = require('mongoose');
const { GraphQLObjectType, GraphQLList, GraphQLInt } = require('graphql');
const { composeWithMongoose } = require('graphql-compose-mongoose');

const folderSchema = new mongoose.Schema({
    _id: { type: String },
    name: { type: String },
    title: { type: String },
    icon: { type: String },
})

const Folders = mongoose.model('challenge_folders', folderSchema);
const getFolders = require('../resolver/folders.resolver');

const TC = composeWithMongoose(Folders, {});

// Definimos el objeto que nos devuelve la query:
// const folderObject = new GraphQLObjectType({
//     name: 'folderObject',
//     fields: {
//         data: { type: new GraphQLList(TC.getType())}, // !!!!!!!!!!!
//         count: { type: GraphQLInt }
//     }
// })

// Queries:
const query = {
    folders_getFolder: {
        type: new GraphQLList(TC.getType()),
        description: 'Obtencion de carpetas',
        resolve: getFolders
    }
}

module.exports = query;