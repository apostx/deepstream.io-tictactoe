const BaseService = require('../core/BaseService');
const RoomData = require('../data/RoomData');
const uuid = require('../utils/uuid');

const SERVICE_NAME = 'room';

class RoomService extends BaseService {
    constructor() {
        super(SERVICE_NAME);
    }

    get rpcHandlers() {
        return {
            create: this.createAndJoinRoom,
            join: this.joinRoom,
            list: this.getRoomList,
        };
    }

    async createAndJoinRoom(data, response) {
        const {playerId} = data;
        const roomId = uuid.generateV4Id();
        const roomData = this.getRoomData();

        await roomData.createAndJoinRoom(roomId, playerId);

        response.send({roomId});
    }

    async joinRoom(data, response) {
        const {roomId, playerId} = data;
        const roomData = this.getRoomData();
        let playerList = await roomData.getData(roomId);
        const playersNum = playerList.length;

        if (!playerList) {
            response.error('The room does not exist');
        }

        if (playerList.indexOf(playerId) !== -1) {
            response.error('Already in the room');
        }

        if (playerList.length >= this.config.game.playerLimit) {
            response.error('The room is full');
        } else {
            playerList = await roomData.joinRoom(roomId, playerId);

            if (playerList.length >= this.config.game.playerLimit) {
                this.event.emit(`${SERVICE_NAME}/fullRoom`, {roomId, playerList});
            }

            response.send({roomId, playersNum});
        }
    }

    async getRoomList(data, response) {
        const roomData = this.getRoomData();
        const roomListData = await roomData.getData();

        const roomList = Object.entries(roomListData)
            .filter(([id, playerList]) => playerList.length < this.config.game.playerLimit)
            .map(([id, playerList]) => ({
                id,
                details: {
                    playersNum: playerList.length
                }
            }));

        response.send(roomList);
    }

    getRoomData() {
        return new RoomData(this.record);
    }
}

module.exports = RoomService;
