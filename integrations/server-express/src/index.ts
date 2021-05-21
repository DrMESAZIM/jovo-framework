import express = require('express');
const server: express.Application = express();
server.use(express.json());
export { server as Webhook };
export * from './ExpressJs';
export { Request, Response } from 'express';