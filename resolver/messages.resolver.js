const mongoose = require('mongoose');
const Message = mongoose.model('challenge_messages');

const getMessages = async (parents, args, context, info) => {
    let filters = args;
    let query = { $and: [] };
    let mailList;
    let mails;

    // Lógica de filtrado:
    if (filters.from && filters.from !== undefined) {
        query.$and.push({ 
            $or: [
                { "from.name": { $regex: `${filters.from}`, $options: "i"}},
                { "from.avatar": { $regex: `${filters.from}`, $options: "i"}},
                { "from.email": { $regex: `${filters.from}`, $options: "i"}},
            ]
        })
    };
    

    if (filters.to && filters.to !== undefined) {
        query.$and.push({
            $or: [
                { "to.name": { $regex: `${filters.to}`, $options: "i"}},
                { "to.email": { $regex: `${filters.to}`, $options: "i"}}
            ]
        })
    };

    if (filters.subject && filters.subject !== undefined) {
        query.$and.push({
            "subject": { $regex: `${filters.subject}`, $options: "i"}
        })
    };

    if (!filters.from && !filters.to && !filters.subject) {
        delete query.$and;
    }

    // Lógica de paginación:
    if (!filters.page && filters.limit || filters.page && !filters.limit) {
        return 'Para paginado de los mensajes especificar número de página (page) y número de mensajes (limit)'
    }

    if (filters.page && filters.limit) {
        mails = (filters.page-1)*filters.limit;
        const mailPage = await Message.aggregate([
            { $match: query },
            { $lookup : {
                    "from" : "challenge_folders",
                    "localField" : "folder",
                    "foreignField" : "name",
                    "as" : "folderInfo"
                }
            },
            { $skip: mails },
            { $limit: filters.limit }
        ])

        const count = await Message.aggregate([
            { $match: query },
            { $count: "count" }
        ])

        mailList = {
            count: count[0].count,
            page: filters.page,
            data: mailPage
        };

    } else {
        mailPage = await Message.aggregate([
            { $match: query },
            { $lookup : {
                    "from" : "challenge_folders",
                    "localField" : "folder",
                    "foreignField" : "name",
                    "as" : "folderInfo"
                }
            }
        ]);

        const count = await Message.aggregate([
            { $match: query },
            { $count: "count" }
        ])
        
        mailList = {
            count: count[0].count,
            page: 1,
            data: mailPage
        };
    }

    if (mailList.length === 0) {
        return 'No se encontraron mensajes.'
    }

    return mailList    
}


const addMessage = async (parents, args, context, info) => {
    let message = args;

    try {
        const newMessage = new Message(message);
        await newMessage.save()
        return 'Mensaje guardado.'
        }
    catch (err) {
        return `Error al guardar el mensaje: ${err}`;
    }
}


const deleteMessage = async (parents, args, context, info) => {
    let messageId = args;

    try {
        const deleteMessage = await Message.findByIdAndDelete(messageId);
        if (deleteMessage) {
            return {
                success: true,
                message: 'El elemento fue eliminado exitosamente',
                deleteMessage
            }
        } else if (deleteMessage === null) {
            return {
                success: false,
                message: 'El elemento no pudo ser eliminado'
            }
        }    
    }
    catch (err) {
        return err
    }
}


module.exports = { getMessages, addMessage, deleteMessage };
