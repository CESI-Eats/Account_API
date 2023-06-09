const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['src/routes/myModelRoutes.ts','src/server.ts']

swaggerAutogen(outputFile, endpointsFiles)
