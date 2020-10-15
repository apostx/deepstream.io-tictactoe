const BaseService = require('../core/BaseService');
// const RoomData = require('../data/RoomData');
const uuid = require('../utils/uuid');

const SERVICE_NAME = 'client';

class TestClientService extends BaseService {
    get eventHandlers() {
        return {
            'game/nextTurn': this.onNextTurn,
            'game/mark': this.onMark,
        };
    }

    constructor() {
        super(SERVICE_NAME);

        this.id = uuid.generateV4Id();

        this.generateNextTurnPromise();
        this.generateMarkPromise();

        this.onNextTurn = this.onNextTurn.bind(this);
        this.onMark = this.onMark.bind(this);
    }

    generateNextTurnPromise() {
        this.resolveNextTurnPromise = null;
        this.nextTurnPromise = new Promise(resolve => { this.resolveNextTurnPromise = resolve; });
    }

    generateMarkPromise() {
        this.resolveMarkPromise = null;
        this.markPromise = new Promise(resolve => { this.resolveMarkPromise = resolve; });
    }

    onNextTurn(data) {
        this.resolveNextTurnPromise(data);
        this.generateNextTurnPromise();
    }

    onMark(data) {
        this.resolveMarkPromise(data);
        this.generateMarkPromise();
    }

    async waitForNextTurn() {
        await this.nextTurnPromise;
    }

    async waitForMark() {
        await this.markPromise;
    }

    async createAndJoinRoom() {
        const {roomId} = await this.rpc.make('room.create', {userId: this.id});

        return roomId;
    }

    async joinRoom(roomId) {
        await this.rpc.make('room.join', {roomId, userId: this.id});
    }

    subscribeGame(roomId) {
        this.event.subscribe(`game/${roomId}/nextTurn`, this.onNextTurn);
        this.event.subscribe(`game/${roomId}/mark`, this.onMark);
    }

    async startGame(roomId, firstPlayer, secondPlayer) {
        this.subscribeGame(roomId);
        await this.rpc.make('game.start', {roomId, firstPlayer, secondPlayer});
    }

    async markField(roomId, colIndex, rowIndex) {
        this.subscribeGame(roomId);
        await this.rpc.make('game.mark', {player: this.id, roomId, colIndex, rowIndex});
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

module.exports = TestClientService;
*/
