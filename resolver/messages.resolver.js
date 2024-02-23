const mongoose = require('mongoose');
const Message = mongoose.model('challenge_messages');

const getMessages = async (parents, args, context, info) => {
    const mailList = await Message.find({});
    return mailList;
}

const filterMessages = async (parents, args, context, info) => {
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

    if (Object.keys(filters).length === 0) {
        delete query.$and;
    }

    // Lógica de paginación:
    if (!filters.page && filters.limit || filters.page && !filters.limit) {
        return 'Para paginado de los mensajes especificar número de página (page) y número de mensajes (limit)'
    }
    
    if (filters.page && filters.limit) {
        mails = (parseInt(page)-1)*parseInt(limit);
        console.log(mails)
    }

    try {
        if (filters.page && filters.limit) {
            console.log(filters.page)
            console.log(filters.limit)
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
                { $limit: parseInt(limit) }
            ])
    
            const count = await Message.aggregate([
                { $match: query },
                { $count: "count" }
            ])
    
            mailList = {
                count: count[0].count,
                page: parseInt(page),
                data: mailPage
            };
        } else {
            mailList = await Message.aggregate([
                { $match: query },
                { $lookup : {
                        "from" : "challenge_folders",
                        "localField" : "folder",
                        "foreignField" : "name",
                        "as" : "folderInfo"
                    }
                }
            ]);
        }

        if (mailList.length === 0) {
            return 'No se encontraron mensajes.'
        }
        return mailList    
    } catch (err) {
        return 'No se pudo realizar la busqueda.'
    }
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


module.exports = { getMessages, filterMessages, addMessage };
