// Very simple mocking server for mimicking IDAPI

/* eslint-env node */
const bodyParser = require('body-parser');
const express = require('express');
const { inspect } = require('util');
const PORT = 9000;

const DEFAULT_RESPONSE = {
  status: 500,
  payload: 'Mock Server Error: No mock requests in queue',
};

const app = express();

const responses = [];
const permanent = [];

let payload = {};

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.get('/healthcheck', (_, res) => {
  console.log('healthcheck OK');
  res.sendStatus(204);
});

// Reset all mocks, including permanent
app.get('/mock/purge', (_, res) => {
  console.log('purging all mocks');
  responses.length = 0;
  permanent.length = 0;
  res.sendStatus(204);
});

// Push mock onto mock stack
app.post('/mock', (req, res) => {
  responses.unshift({
    status: req.get('X-status'),
    payload: req.body,
  });
  res.sendStatus(204);
});

// Always mock supplied endpoint
app.post('/mock/permanent', (req, res) => {
  const { path, body: payload, status = 200 } = req.body;
  permanent.push({ path, payload, status });
  res.sendStatus(204);
});

// Return last POST or PATCH'd request payload
app.get('/mock/payload', (_, res) => {
  res.json(payload);
});

// For any request, if permanent, return permanent mock, otherwise pop from mock stack.
app.all('*', (req, res) => {
  const { method } = req;
  if (method === 'POST' || method === 'PATCH') {
    payload = req.body;
  }
  console.log(`Mocking: ${req.originalUrl}`);
  const permanent_redirect = permanent.find((p) => p.path === req.path);
  if (permanent_redirect) {
    res.status(permanent_redirect.status).json(permanent_redirect.payload);
    return;
  }
  if (responses.length === 0) {
    res.status(DEFAULT_RESPONSE.status).json(DEFAULT_RESPONSE.body);
  } else {
    const { status, payload } = responses.pop();
    console.log(`Mocking: ${req.originalUrl}: ${status} ${inspect(payload)}`);
    res.status(status).json(payload);
  }
});

app.listen(PORT);
console.log('mock server running on port:', PORT);
