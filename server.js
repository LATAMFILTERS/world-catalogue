require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

// -------------------- BASIC SAFETY --------------------
app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- SECURITY --------------------
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

// -------------------- STATIC FILES --------------------
app.use(express.static(path.join(__dirname, 'public')));

// -------------------- NEXT.JS HANDLER --------------------
const nextApp = require('./motor-de-busqueda/node_modules/next');
const nextHandler = nextApp({ dev: false, dir: './motor-de-busqueda' });
const handle = nextHandler.getRequestHandler();

nextHandler.prepare()
    .then(() => {
        // All routes to Next.js
        app.all('*', (req, res) => {
            return handle(req, res);
        });

        // -------------------- START --------------------
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✓ ELIMFILTERS Frontend running on port ${PORT}`);
            console.log(`✓ API Server should run on ${process.env.API_PORT || 5000}`);
        });
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });

// -------------------- GLOBAL ERROR HANDLERS --------------------
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED:', err);
});
