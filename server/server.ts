import express from 'express';
import * as path from 'path';
import * as http from 'http';
import { getLogger } from './util';
import { initServerSockets } from './src/serverSockets';

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

const logger = getLogger("server");

logger.log(`Starting server`);

// console.log that your server is up and running
server.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.static(path.join(__dirname, 'build')))

app.get('/ping', (req, res) => {
  return res.send('pong')
})

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

app.post('/create', (req, res) => {
  res.send({ id: 'abcd'});
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
});

initServerSockets(server);
