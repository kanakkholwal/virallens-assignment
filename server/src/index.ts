import app from './app';
import dbConnect from './config/db';
import { config } from './config/env';



const startServer = async () => {
    await dbConnect();
    app.listen(config.port, '0.0.0.0', () => {
        console.log(`server listening on http://0.0.0.0:${config.port}`);
    });
};

startServer();
