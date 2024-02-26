const express = require('express');
const mongoose = require('mongoose');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const schema = require('./schemas/index.js');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://192.168.0.14:27017/local')
    .then(() => {
        console.log('Conexion exitosa a la base de datos');
    })
    .catch((err) => {
        console.log('Error en la base de datos:', err);
    })

app.use(express.json());
app.use('/api',
    graphqlHTTP((req) => {
        return {
            schema: schema,
            graphiql: true,
            context: {
                user: req.user,
                req: req
            }
        }
    })
)

app.listen(PORT, () => {
    console.log('Escuchando puerto:', PORT);
})