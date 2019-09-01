import express from 'express';
import { createServer } from 'http';
import config from '../config';
import Logger from './logger';

const logger = Logger('Http-server');
const app = express();

const httpServer = createServer(app);
export async function start(): Promise<void> {
  if (httpServer.listening) throw new Error('HTTP Server is already listening');

  const serverListenPromise = new Promise((resolve, reject) => {
    httpServer.listen(config.http.port, resolve);
    httpServer.once('error', reject);
  });
  await serverListenPromise;
  logger.info(`HTTP server started on ${config.http.port}`);
}

export async function stop(): Promise<void> {
  if (!httpServer.listening) throw new Error('HTTP Server is not listening');

  const serverClosePromise = new Promise((resolve, reject) => {
    httpServer.once('close', resolve);
    httpServer.close(err => {
      if (err) reject(err);
    });
  });

  await serverClosePromise;
  logger.info('Http server stopped');
}
