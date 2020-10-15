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

    get rpcHandlers() {
        return {
            start: this.startGame,
            mark: this.markField,
        };
    }

    async startGame(data, response) {
        const {roomId, firstPlayer, secondPlayer} = data;

        const gameState = this.getGameState();
        const tableSize = this.config.game.tableSize;

        await gameState.init(roomId, firstPlayer, secondPlayer, tableSize);

        this.event.emit(`${SERVICE_NAME}/${roomId}/nextTurn`, firstPlayer);

        response.send();
    }

    async markField(data, response) {
        const {roomId, player, colIndex, rowIndex} = data;

        const gameState = this.getGameState();
        const stateData = await gameState.getData(roomId);

        try {
            if (!stateData) {
                throw new Error('No running game');
            }

            gameRuleset.validatePlayer(stateData, player);
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
            player,
            table: stateData.table,
            colIndex,
            rowIndex,
            status,
        };

        this.event.emit(`${SERVICE_NAME}/${roomId}/mark`, markData);

        if (isWin || isDraw) {
            await gameState.dispose();
        } else {
            gameRuleset.nextPlayer(stateData);

            await gameState.setData(roomId, stateData);

            this.event.emit(`${SERVICE_NAME}/${roomId}/nextTurn`, stateData.currentPlayerId);
        }

        response.send();
    }

    getGameState() {
        return new GameState(this.record);
    }
}

module.exports = GameService;
