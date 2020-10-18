const DemoClientService = require('./services/DemoClientService');
const GameService = require('./services/GameService');
const RoomService = require('./services/RoomService');

class Demo {
    sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    async init() {
        const gameService = new GameService();
        const roomService = new RoomService();

        this.player1 = new DemoClientService();
        this.player2 = new DemoClientService();

        await Promise.all([
            roomService.start(),
            gameService.start(),
            this.player1.start(),
            this.player2.start(),
        ]);

        await this.sleep(1000);
        return this;
    }

    async run(player1MarkedFields, player2MarkedFields) {
        console.log('Start...');

        const roomId = await this.player1.createAndJoinRoom();
        await this.player2.joinRoom(roomId);

        const player1StepGenerator = DemoClientService.gameStepGenerator(this.player1, roomId, player1MarkedFields);
        const player2StepGenerator = DemoClientService.gameStepGenerator(this.player2, roomId, player2MarkedFields);

        // Init game
        await Promise.all([
            this.player1.startGame(roomId, this.player1.id, this.player2.id),
            player1StepGenerator.next(),
            player2StepGenerator.next(),
        ]);

        // Full game flow
        var p1, p2;
        var markNum = 0;
        do {
            [p1, p2] = await Promise.all([player1StepGenerator.next(), player2StepGenerator.next()]);
            ++markNum;
        } while(!p1.done || !p2.done);

        console.log(`Finished... (markNum: ${markNum})`);
        return this;
    }

    async end() {
        process.exit(0);
    }
}

Promise.resolve(new Demo())
    .then(demo => demo.init())
    .then(demo => demo.run([[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]]))
    .then(demo => demo.end());
