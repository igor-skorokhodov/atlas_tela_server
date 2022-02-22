const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createUser, login } = require('./controllers/users');
const router = require('./routes/index');
const NotError = require('./errors/not-found-err');
const ServerError = require('./errors/server-error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const CORS_WHITELIST = [
  'http://mesto.ivladsk.nomoredomains.club',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://mesto.ivladsk.nomoredomains.club',
];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const corsOption = {
  credentials: true,
  origin: function checkCorsList(origin, callback) {
    if (CORS_WHITELIST.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet());

app.use(bodyParser.json());

app.use(requestLogger);

app.use(limiter);

app.use(cors(corsOption));

app.use(router);

app.get('*', () => {
  throw new NotError('страница не найдена');
});

app.use(errorLogger);

app.use(errors());

app.use(ServerError);

app.listen(PORT);
