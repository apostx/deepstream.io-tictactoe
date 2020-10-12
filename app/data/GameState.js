const BaseData = require('../core/BaseData');

const RECORD_NAME = 'game.gameState';

class GameState extends BaseData {
    constructor(record) {
        super(record, RECORD_NAME);
    }

    async init(roomId, firstPlayerId, secondPlayerId, tableSize) {
        const table = [];
        table.length = tableSize * tableSize;

        const state = {
            tableSize,
            firstPlayerId,
            secondPlayerId,
            table,
            markedFieldNum: 0,
            currentPlayerId: firstPlayerId,
        };

        // TODO Should check the data is not exists yet

        const data = await this.setData(roomId, state);

        return data;
    }
}

module.exports = GameState;
