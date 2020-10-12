const {DeepstreamClient} = require('@deepstream/client');

class BaseService {
    get rpc() {
        return this.client.rpc;
    }

    get event() {
        return this.client.event;
    }

    get record() {
        return this.client.record;
    }

    constructor(serviceName) {
        this.config = require('../config.json');
        this.serviceName = serviceName;
        this.client = null;
    }

    async start() {
        this.client = new DeepstreamClient('localhost:6020');
        await this.client.login(this.serviceName);

        /*
        this.client.login({username: 'peter', password: 'sesame'}, (success, data) => {
            console.log(`ConnectionState: ${this.client.getConnectionState()}`);
            console.log(`UID: ${this.client.getUid()}`);
        });
        */

        if (this.serviceName && this.rpcHandlers) {
            const rpcNameList = Object.keys(this.rpcHandlers);

            for (let i = 0; i < rpcNameList.length; ++i) {
                const rpcName = rpcNameList[i];
                const rpcHandler = this.rpcHandlers[rpcName];

                this.client.rpc.provide(`${this.serviceName}.${rpcName}`, rpcHandler.bind(this));
            }
        }

        if (this.eventHandlers) {
            const eventNameList = Object.keys(this.eventHandlers);

            for (let i = 0; i < eventNameList.length; ++i) {
                const eventName = eventNameList[i];
                const eventHandler = this.eventHandlers[eventName];

                this.client.event.subscribe(eventName, eventHandler.bind(this));
            }
        }
    }

    get rpcHandlers() {
        return null;
    }

    get eventHandlers() {
        return null;
    }
}

module.exports = BaseService;
