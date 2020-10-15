const TicTacToeRuleset = {
    mark: function(state, colIndex, rowIndex) {
        state.table[rowIndex * state.tableSize + colIndex] = state.currentPlayerId;
    },

    nextPlayer: function(state) {
        state.currentPlayerId = state.currentPlayerId === state.firstPlayerId ? state.secondPlayerId : state.firstPlayerId;
    },

    validatePlayer: function(state, playerId) {
        if (playerId !== state.currentPlayerId) {
            throw new Error('Invalid player');
        }
    },

    validateMark: function(state, colIndex, rowIndex) {
        const field = state.table[rowIndex * state.tableSize + colIndex];

        if (field) {
            throw new Error('Invalid mark: field is already used');
        }

        if (colIndex < 0 || colIndex >= state.tableSize) {
            throw new Error('Invalid mark: colIndex is out of table');
        }

        if (rowIndex < 0 || rowIndex >= state.tableSize) {
            throw new Error('Invalid mark: rowIndex is out of table');
        }
    },

    isWin: function(state, colIndex, rowIndex) {
        return state.tableSize <= Math.max(
            this._calculateLineLength(state, colIndex, rowIndex, 1, 1),
            this._calculateLineLength(state, colIndex, rowIndex, 1, 0),
            this._calculateLineLength(state, colIndex, rowIndex, 1, -1),
            this._calculateLineLength(state, colIndex, rowIndex, 0, -1),
        );
    },

    isFull: function(state) {
        return (state.markedFieldNum + 1) >= state.table.length;
    },

    _calculateLineLength: function(state, colIndex, rowIndex, colStep, rowStep) {
        return this._calculateDirectionLength(state, colIndex, rowIndex, colStep, rowStep) + this._calculateDirectionLength(state, colIndex, rowIndex, -colStep, -rowStep) + 1;
    },

    _calculateDirectionLength: function(state, colIndex, rowIndex, colStep, rowStep) {
        let l = 0;
        let i = colIndex + colStep;
        let j = rowIndex + rowStep;

        while (
            i >= 0 &&
            j >= 0 &&
            i < state.tableSize &&
            j < state.tableSize &&
            state.table[j * state.tableSize + i] === state.currentPlayerId
        ) {
            ++l;
            i += colStep;
            j += rowStep;
        }

        return l;
    },
};

module.exports = TicTacToeRuleset;
