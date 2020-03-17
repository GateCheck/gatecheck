import { createServer } from 'http';
import app from './app';

const server = createServer(app);

server.listen(process.env.PORT || 3000, () => {
    console.log(`Started listening on port ${process.env.PORT || 3000}`)
});
