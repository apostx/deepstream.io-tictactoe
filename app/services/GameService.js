const BaseService = require('../core/BaseService');
const GameState = require('../data/GameState');
const gameRuleset = require('./game/TicTacToeRuleset');

const SERVICE_NAME = 'game';

const IN_PROGRESS = 'in_progress';
const WIN = 'win';
const DRAW = 'draw';

class GameService extends BaseService {
    constructor() {
        super(SERVICE_NAME);
    }

    get eventHandlers() {
        return {
            'room/fullRoom': this.startGame,
        };
    }

    get rpcHandlers() {
        return {
            mark: this.markField,
        };
    }

    async startGame(data) {
        const {roomId, playerList} = data;
        const {firstPlayerId, secondPlayerId} = this.randomizePlayers(playerList);

        const gameState = this.getGameState();
        const tableSize = this.config.game.tableSize;

        await gameState.init(roomId, firstPlayerId, secondPlayerId, tableSize);

        this.event.emit(`${SERVICE_NAME}/${roomId}/nextTurn`, firstPlayerId);
    }

    async markField(data, response) {
        const {roomId, playerId, colIndex, rowIndex} = data;

        const gameState = this.getGameState();
        const stateData = await gameState.getData(roomId);

        try {
            if (!stateData) {
                throw new Error('No running game');
            }

            gameRuleset.validatePlayer(stateData, playerId);
            gameRuleset.validateMark(stateData, colIndex, rowIndex);
        } catch (error) {
            response.error(error.message);
            return;
        }

        gameRuleset.mark(stateData, colIndex, rowIndex);

        const isWin = gameRuleset.isWin(stateData, colIndex, rowIndex);
        const isDraw = gameRuleset.isFull(stateData);

        let status = null;

        if (isWin) {
            status = WIN;
        } else if (isDraw) {
            status = DRAW;
        } else {
            status = IN_PROGRESS;
        }

        const markData = {
            roomId,
            playerId,
            table: stateData.table,
            colIndex,
            rowIndex,
            status,
        };

        this.event.emit(`${SERVICE_NAME}/mark`, markData);
        this.event.emit(`${SERVICE_NAME}/${roomId}/mark`, markData);

        if (isWin || isDraw) {
            await gameState.dispose();
        } else {
            gameRuleset.nextPlayer(stateData);

            await gameState.setData(roomId, stateData);

            const nextTurnData = {
                roomId,
                currentPlayerId: stateData.currentPlayerId,
            };

            this.event.emit(`${SERVICE_NAME}/nextTurn`, nextTurnData);
            this.event.emit(`${SERVICE_NAME}/${roomId}/nextTurn`, stateData.currentPlayerId);
        }

        response.send();
    }

    randomizePlayers(playerList) {
        const firstIndex = Math.floor(Math.random() * this.config.game.playerLimit);
        const secondIndex = (firstIndex + 1) % this.config.game.playerLimit;
        const firstPlayerId = playerList[firstIndex];
        const secondPlayerId = playerList[secondIndex];

        return {firstPlayerId, secondPlayerId};
    }

    getGameState() {
        return new GameState(this.record);
    }
}

module.exports = GameService;
