if (process.argv.length < 3) {
    throw new Error('Missing serviceName argument');
}

const serviceName = process.argv[2];
const ServiceClass = require(`./services/${serviceName}`);
const service = new ServiceClass();

service.start();
