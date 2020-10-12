const BaseData = require('../core/BaseData');

const RECORD_NAME = 'room.roomData';

class RoomData extends BaseData {
    constructor(record) {
        super(record, RECORD_NAME);
    }

    async createAndJoinRoom(roomId, playerId) {
        const playerList = [playerId];

        return await this.setData(roomId, playerList);
    }

    async joinRoom(roomId, playerId) {
        const playerList = await this.getData(roomId);

        playerList.push(playerId);

        return await this.setData(roomId, playerList);
    }
}

module.exports = RoomData;
