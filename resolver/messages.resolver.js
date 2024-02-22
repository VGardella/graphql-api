const mongoose = require('mongoose');
const Message = mongoose.model('challenge_messages');

const getMessages = async (parents, args, context, info) => {
    const mailList = await Message.find({});
    return mailList;
}

module.exports = getMessages;