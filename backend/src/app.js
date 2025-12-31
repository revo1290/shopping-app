const express = require('express');
const cors = require('cors');
const itemsRouter = require('./routes/items');

function createApp() {
  const app = express();

  // ミドルウェア
  app.use(cors());
  app.use(express.json());

  // ルート
  app.use('/api/items', itemsRouter);

  // ヘルスチェック
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}

module.exports = { createApp };
