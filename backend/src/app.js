const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const itemsRouter = require('./routes/items');
const db = require('./database');

function createApp(options = {}) {
  const app = express();

  // セキュリティヘッダー (Helmet)
  app.use(helmet());

  // リクエストログ (morgan) - テスト環境以外で有効
  if (process.env.NODE_ENV !== 'test' && !options.disableLogging) {
    app.use(morgan('combined'));
  }

  // CORS設定
  app.use(cors());

  // リクエストボディサイズ制限
  app.use(express.json({ limit: '1mb' }));

  // レート制限
  if (process.env.NODE_ENV !== 'test' && !options.disableRateLimit) {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分
      max: 100, // 最大100リクエスト
      message: { error: 'リクエスト数が上限を超えました。しばらく待ってから再試行してください。' },
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use('/api', limiter);
  }

  // ルート
  app.use('/api/items', itemsRouter);

  // ヘルスチェック (拡張版)
  app.get('/api/health', (req, res) => {
    try {
      // DBの接続確認
      const dbCheck = db.prepare('SELECT 1').get();
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbCheck ? 'connected' : 'disconnected'
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed'
      });
    }
  });

  // 404ハンドラ
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'Cannot ' + req.method + ' ' + req.path,
      statusCode: 404
    });
  });

  // グローバルエラーハンドラ
  app.use((err, req, res, next) => {
    // エラーログ出力
    if (process.env.NODE_ENV !== 'test') {
      console.error('[ERROR] ' + new Date().toISOString() + ' - ' + (err.stack || err.message));
    }

    // JSONパースエラー
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid JSON format',
        statusCode: 400
      });
    }

    // その他のエラー
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: statusCode === 500 ? 'Internal Server Error' : err.message,
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
      statusCode
    });
  });

  return app;
}

module.exports = { createApp };
