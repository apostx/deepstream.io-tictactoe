/*
const { DeepstreamClient } = require('@deepstream/client');
const client = new DeepstreamClient('localhost:6020');
client.login();
*/
/*
const { DeepstreamClient } = require('@deepstream/client')
const client = new DeepstreamClient('localhost:6020')
// client.getConnectionState() will now return 'AWAITING_AUTHENTICATION'

client.login({username: 'peter', password: 'sesame'}, (success, data) => {
  if (success) {
    // start application
    // client.getConnectionState() will now return 'OPEN'
  } else {
    // extra data can be optionaly sent from deepstream for
    // both successful and unsuccesful logins
  }
  console.log(`Alert: ${data}`);

    // client.getConnectionState() will now return
    // 'AWAITING_AUTHENTICATION' or 'CLOSED'
    // if the maximum number of authentication
    // attempts has been exceeded.
  }
  console.log(`ConnectionState: ${client.getConnectionState()}`);
  console.log(`UID: ${client.getUid()}`);
})

client.on('error', ( error, event, topic ) => console.log(error, event, topic));
*/

/*
client.rpc.provide("multiply-numbers", new RpcRequestedListener() {
  public void onRPCRequested(String name, Object data, RpcResponse response) {
      Gson gson = new Gson();
      JsonObject jsonData = (JsonObject) gson.toJsonTree(data);
      int a = jsonData.get("a").getAsInt();
      int b = jsonData.get("b").getAsInt();
      response.send(a * b);
  }
});
*/

/*
JsonObject jsonObject = new JsonObject();
jsonObject.addProperty("a", 7);
jsonObject.addProperty("b", 8);
RpcResult rpcResult = client.rpc.make( "multiply-numbers", jsonObject);
int result = (Integer) rpcResult.getData(); // 56
*/

/*
if (process.argv.length < 3) {
 throw new Error('Missing serviceName argument');
}
*/

/*
const serviceName = process.argv[2];
const ServiceClass = require(`./services/${serviceName}`);
const service = new ServiceClass();

service.start();
*/

const sleep = (time) => new Promise(resolve => setTimeout(resolve, time));

const test = async() => {
    const GameService = require('./services/GameService');
    const gameService = new GameService();

    const RoomService = require('./services/RoomService');
    const roomService = new RoomService();

    const TestClientService = require('./services/TestClientService');
    const player1 = new TestClientService();
    const player2 = new TestClientService();

    await Promise.all([
        roomService.start(),
        gameService.start(),
        player1.start(),
        player2.start(),
    ]);

    await sleep(1000);

    const runTestGame = async() => {
        const roomId = await player1.createAndJoinRoom();
        await player2.joinRoom(roomId);

        var nextTurnPromises;
        var markPromises;

        nextTurnPromises = [player1.waitForNextTurn(), player2.waitForNextTurn()];

        player2.subscribeGame(roomId);
        await player1.startGame(roomId, player1.id, player2.id);

        await Promise.all(nextTurnPromises);

        nextTurnPromises = [player1.waitForNextTurn(), player2.waitForNextTurn()];
        markPromises = [player1.waitForMark(), player2.waitForMark()];

        player1.markField(roomId, 0, 0);

        await Promise.all(nextTurnPromises);
        await Promise.all(markPromises);

        console.log(12);
    };

    await runTestGame();
};

test();
