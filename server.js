const express = require('express');
const redis = require('redis');
const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// Connexion à Redis
let redisClient;
try {
  redisClient = redis.createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT
    }
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
  
  redisClient.connect().then(() => {
    console.log('Connecté à Redis');
  }).catch(err => {
    console.error('Erreur de connexion Redis:', err);
  });
} catch (err) {
  console.error('Impossible de créer le client Redis:', err);
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Route d'accueil
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Docker - Accueil</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 600px;
        }
        h1 {
          color: #667eea;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .links {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        a {
          display: inline-block;
          padding: 12px 24px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          transition: background 0.3s;
        }
        a:hover {
          background: #5568d3;
        }
        .info {
          margin-top: 30px;
          padding: 15px;
          background: #f0f0f0;
          border-radius: 5px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1> Application Docker</h1>
        <p>Bienvenue sur l'application web conteneurisée par Oussama !</p>
        <p>Cette application est déployée dans des conteneurs Docker et utilise Docker Compose pour l'orchestration.</p>
        <div class="links">
          <a href="/api/info">Informations API</a>
          <a href="/api/stats">Statistiques</a>
        </div>
        <div class="info">
          <strong>Port:</strong> ${PORT}<br>
          <strong>Environnement:</strong> ${process.env.NODE_ENV || 'development'}
        </div>
      </div>
    </body>
    </html>
  `);
});

// Route API - Informations
app.get('/api/info', async (req, res) => {
  try {
    let visitCount = 0;
    if (redisClient && redisClient.isOpen) {
      visitCount = await redisClient.incr('api_info_visits');
    }
    
    res.json({
      message: 'Informations sur l\'API',
      version: '1.0.0',
      description: 'API REST pour l\'application Docker',
      endpoints: [
        'GET /',
        'GET /api/info',
        'GET /api/stats'
      ],
      visits: visitCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route API - Statistiques
app.get('/api/stats', async (req, res) => {
  try {
    let statsVisits = 0;
    if (redisClient && redisClient.isOpen) {
      statsVisits = await redisClient.incr('api_stats_visits');
    }
    
    res.json({
      message: 'Statistiques de l\'application',
      totalVisits: statsVisits,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Serveur démarré sur le port ${PORT}`);
  console.log(` Accessible sur http://localhost:${PORT}`);
});

