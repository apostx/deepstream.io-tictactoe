const BaseService = require('../core/BaseService');
// const RoomData = require('../data/RoomData');
const uuid = require('../utils/uuid');

const SERVICE_NAME = 'client';

class DemoClientService extends BaseService {
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
        return await this.nextTurnPromise;
    }

    async waitForMark() {
        return await this.markPromise;
    }

    async createAndJoinRoom() {
        const {roomId} = await this.rpc.make('room.create', {userId: this.id});

        this._subscribeGame(roomId);

        return roomId;
    }

    async joinRoom(roomId) {
        await this.rpc.make('room.join', {roomId, userId: this.id});

        this._subscribeGame(roomId);
    }

    _subscribeGame(roomId) {
        this.event.subscribe(`game/${roomId}/nextTurn`, this.onNextTurn);
        this.event.subscribe(`game/${roomId}/mark`, this.onMark);
    }

    async startGame(roomId, firstPlayerId, secondPlayerId) {
        this._subscribeGame(roomId);
        await this.rpc.make('game.start', {roomId, firstPlayerId, secondPlayerId});
    }

    async markField(roomId, colIndex, rowIndex) {
        await this.rpc.make('game.mark', {playerId: this.id, roomId, colIndex, rowIndex});
    }

    static async *gameStepGenerator(player, roomId, marks) {
        var markIndex = 0;
        var markData = null;
        var turnData = null;

        var turnPromise = player.waitForNextTurn();

        do {
            turnData = await turnPromise;
            yield;

            if (turnData.playerId === player.id) {
                player.markField.apply(player, [roomId, ...marks[markIndex++]]);
            }

            turnPromise = player.waitForNextTurn();

            markData = await player.waitForMark();
        } while(markData.status === 'in_progress');
    }
}

module.exports = DemoClientService;
