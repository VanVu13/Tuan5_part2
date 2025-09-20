const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',       

        info: {
            title: 'Session Auth API',
            version: '1.0.0',               
            description: 'API login, logout, register với session cookie'
        }
    },
    apis: ['./routes/*.js'] 
};          
const swaggerSpecs = swaggerJsdoc(swaggerOptions);
function setupSwagger(app, port) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
    console.log(`Swagger docs: http://localhost:${port}/api-docs`);
}


module.exports = setupSwagger;
