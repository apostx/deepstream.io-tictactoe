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
        const {userId} = data;
        const roomId = uuid.generateV4Id();
        const roomData = this.getRoomData();

        await roomData.createAndJoinRoom(roomId, userId);

        response.send({roomId});
    }

    async joinRoom(data, response) {
        const {roomId, userId} = data;
        const roomData = this.getRoomData();
        const userData = await roomData.getData(roomId);

        if (!userData) {
            response.error('The room does not exist');
            return;
        }

        const users = Object.keys(userData);

        if (users.indexOf(userId) !== -1) {
            response.error('Already in the room');
        }

        await roomData.joinRoom(roomId, userId);

        // this.event.emit(`${SERVICE_NAME}/${roomId}/presence`, {isJoin: true});

        response.send();
    }

    async getRoomList(data, response) {
        const roomData = this.getRoomData();
        const roomListData = await roomData.getData();

        const roomList = Object.entries(roomListData)
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
