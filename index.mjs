import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import {SQLiteAdapter} from './modules/sqlite-adapter.mjs';
import {handleRequest} from './modules/handler.mjs';
import * as fs from "node:fs";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const API_ACCESS_KEY = process.env.API_ACCESS_KEY || 'default_access_key';

const app = express();
const db = new SQLiteAdapter();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Static
app.use(express.static('static'));

app.all('/*', async (req, res) => {
    try {
        // Ensure path starts with forward slash
        const path = req.path.startsWith('/') ? req.path : '/' + req.path;
        const requestURL = `http://${HOST}:${PORT}${path}${req.query ? '?' + new URLSearchParams(req.query).toString() : ''}`;

        const response = await handleRequest(new Request(requestURL, {
            method: req.method,
            headers: req.headers,
            body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : null
        }), db, process.env);

        const text = await response.text();
        res.status(response.status).set(Object.fromEntries(response.headers)).send(text);
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
