"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const http = __importStar(require("http"));
const util_1 = require("./util");
const serverSockets_1 = require("./src/serverSockets");
const app = express_1.default();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const logger = util_1.getLogger("server");
logger.log(`Starting server`);
// console.log that your server is up and running
server.listen(port, () => console.log(`Listening on port ${port}`));
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
});
app.use('/new', (req, res) => {
    res.redirect('/');
});
app.use('/game', (req, res) => {
    res.redirect('/');
});
app.use('/join', (req, res) => {
    res.redirect('/');
});
app.use(express_1.default.static(path.join(__dirname, "build")));
serverSockets_1.initServerSockets(server);
