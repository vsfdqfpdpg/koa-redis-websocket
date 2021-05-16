const http = require("http");
const Koa = require("koa");
const Router = require("koa-router");
const serve = require("koa-static");
const {Server} = require("socket.io");
const {promisify} = require("util");

const livereload = require('livereload');
const reloadServer = livereload.createServer();
reloadServer.watch(__dirname + "/frontend");

const {createClient} = require("redis");
const client = createClient();
const getAsync = promisify(client.get).bind(client);

const redisAdapter = require('@socket.io/redis-adapter');

const pubClient = createClient({host: 'localhost', port: 6379});
const subClient = pubClient.duplicate();

client.on("error", function (error) {
    console.error(error);
});

const app = new Koa();
const httpServer = http.createServer(app.callback());
const io = new Server(httpServer);
io.adapter(redisAdapter(pubClient, subClient));

const router = new Router();
app.use(serve(__dirname + "/frontend"));

router.get("/hello", async ctx => {
    io.emit("app:notifications", "This is from hello.")
    ctx.body = await getAsync("hello");
});


app.use(router.routes());
app.use(router.allowedMethods());

/*subscriptionClient.on('message', (channel, message) => {
    io.sockets.emit(channel, message);
});*/

io.on("connection", socket => {
    socket.on("app:notifications:cli", msg => {
        io.emit("app:notifications", msg)
        socket.disconnect(true);
    });
    socket.on("app:notifications", msg => {
        io.emit("app:notifications", msg)
    });
    console.log("client connected: " + socket.id)
});

httpServer.listen("3000", () => {
    console.log("Listening on port 3000");
});
