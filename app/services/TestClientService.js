const BaseService = require('../core/BaseService');
// const RoomData = require('../data/RoomData');
// const uuid = require('../utils/uuid');

const SERVICE_NAME = 'room';

class TestClientService extends BaseService {
    get eventHandlers() {
        return {
            'room/fullRoom': this.startGame,
        };
    }

    constructor() {
        super(SERVICE_NAME);
    }

    async createAndJoinRoom(connectionChannel, playerId) {
        const {roomId} = await this.rpc.make('room.create', {playerId});

        this.subscribeGameEvents(connectionChannel, roomId);

        return roomId;
    }

    async joinRoom(connectionChannel, playerId, roomId) {
        await this.rpc.make('room.join', {roomId, playerId});

        this.subscribeGameEvents(connectionChannel, roomId);

        return roomId;
    }
}

module.exports = TestClientService;

/*
const ClientBridge = require('./ClientBridge');
const uuid = require('../utils/uuid');

const TEST_GAME_NUM = 1;

class TestClientService
{
    async start()
    {
        const clientBridge = new ClientBridge();
        await clientBridge.start();

        const roomId = uuid.generateV4Id();
        const firstPlayerId = uuid.generateV4Id();
        const secondPlayerId = uuid.generateV4Id();

        for (let i = 0; i < TEST_GAME_NUM; ++i)
        {
            const connection_1 = new TestConnection(clientBridge);
            const roomId = await connection_1.start();

            const connection_2 = new TestConnection(clientBridge);
            await connection_2.start(roomId);
        }
    }
}

class TestConnection
{
    constructor(clientBridge)
    {
        this.clientBridge = clientBridge;
        this.id = uuid.generateV4Id();
        this.nextField = {
            colIndex: 0,
            rowIndex: 0
        };
    }

    async start(roomId)
    {
        if (roomId)
        {
            this.roomId = roomId;
            this.nextField.colIndex = 1;
            return await this.clientBridge.joinRoom(this, this.id, roomId);
        }
        else
        {
            this.roomId = await this.clientBridge.createAndJoinRoom(this, this.id);
            return this.roomId;
        }

        this.clientBridge.on(this.roomId);
    }

    async onMark(markData)
    {
        if (markData.playerId == this.id)
        {
            console.log(`onMark: ${JSON.stringify(markData)}`);
        }
    }

    async onNextTurn(currentPlayerId)
    {
        if (currentPlayerId == this.id)
        {
            console.log(`onNextTurn: ${currentPlayerId}`);

            await this.clientBridge.markField(this.roomId, this.id, this.nextField.colIndex, this.nextField.rowIndex++);
        }
    }
}
*/

module.exports = TestClientService;
