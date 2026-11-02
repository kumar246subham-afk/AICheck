import test from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import { extractDocumentText, analyzeTextContent } from '../controllers/detectionController.js';

test('Production Health Check Endpoint (/api/v1/health)', (t) => {
  let statusCode = null;
  let jsonResponse = null;

  const req = {
    method: 'GET',
    url: '/api/v1/health',
    headers: {},
  };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
  };

  // Find health route handler
  const healthRoute = app._router.stack.find(
    (layer) => layer.route && layer.route.path === '/api/v1/health'
  );

  assert.ok(healthRoute, 'Health route /api/v1/health must be registered');
  healthRoute.route.stack[0].handle(req, res);

  assert.strictEqual(statusCode, 200);
  assert.strictEqual(jsonResponse.status, 'success');
  assert.strictEqual(jsonResponse.message, 'AICheck API Engine operational');
  assert.strictEqual(jsonResponse.version, '1.0.0');
});

test('Document Extraction Controller Validations', async (t) => {
  await t.test('Rejects request without a file (400 Bad Request)', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {};
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
    };

    await extractDocumentText(req, res, () => {});
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonResponse.status, 'error');
    assert.ok(jsonResponse.message.includes('No file uploaded'));
  });

  await t.test('Rejects oversized file beyond MAX_FILE_SIZE_MB (400)', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      file: {
        buffer: Buffer.from('large-content'),
        originalname: 'large.txt',
        mimetype: 'text/plain',
        size: 50 * 1024 * 1024, // 50MB > 10MB limit
      },
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
    };

    await extractDocumentText(req, res, () => {});
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonResponse.status, 'error');
    assert.ok(jsonResponse.message.includes('exceeds the allowed limit'));
  });
});

test('AI Text Analysis Controller Validations', async (t) => {
  await t.test('Rejects request without text field (400)', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = { body: {} };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
    };

    await analyzeTextContent(req, res, () => {});
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonResponse.status, 'error');
    assert.ok(jsonResponse.message.includes('Field "text" is required'));
  });
});
