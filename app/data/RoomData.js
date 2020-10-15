const BaseData = require('../core/BaseData');

const RECORD_NAME = 'room.roomData';

class RoomData extends BaseData {
    constructor(record) {
        super(record, RECORD_NAME);
    }

    async createAndJoinRoom(roomId, playerId) {
        await this.joinRoom(roomId, playerId);
    }

    async joinRoom(roomId, playerId) {
        return await this.setData(`${roomId}.${playerId}`, true); // TODO May could be null as default value
    }
}

module.exports = RoomData;
