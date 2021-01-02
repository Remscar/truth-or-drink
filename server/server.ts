import express from 'express';
import * as path from 'path';
import * as http from 'http';
import { getLogger } from './util';
import { initServerSockets } from './src/serverSockets';
import sslRedirect from 'heroku-ssl-redirect';

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

const logger = getLogger("server");

logger.log(`Starting server`);

// console.log that your server is up and running
server.listen(port, () => console.log(`Listening on port ${port}`));



app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'build', 'index.html'))
});

app.use('/new', (req, res) => {
  res.redirect('/new');
});
app.use('/game', (req, res) => {
  res.redirect('/');
});
app.use('/join', (req, res) => {
  res.redirect('/join');
});
app.use('/how', (req, res) => {
  res.redirect('/how');
});

app.use(express.static(path.join(process.cwd(), "build")));

initServerSockets(server);

app.use(sslRedirect());