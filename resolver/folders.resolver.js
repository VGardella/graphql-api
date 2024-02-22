const mongoose = require('mongoose');
const Folders = mongoose.model('challenge_folders');

const getFolders = async (parents, args, context, info) => {
    const folderList = await Folders.find({});
    return folderList;
}

module.exports = getFolders;