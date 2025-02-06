// Importation des modules nécessaires
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

// Middleware pour parser les JSON dans le corps des requêtes
app.use(express.json());

// Route HTTP (middleware) pour recevoir des messages depuis Messenger ou d'autres plateformes
app.post('/chatfuel', (req, res) => {
  // Par exemple, on s'attend à recevoir un JSON contenant { "message": "on" } ou { "message": "off" }
  const message = req.body.message;
  console.log('Message reçu via HTTP (webhook) :', message);

  // Transmettre ce message à tous les clients WebSocket connectés
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  // Répondre à l'appelant HTTP
  res.json({ status: 'ok', message });
});

// Créer le serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// Créer un serveur WebSocket en l'associant au même serveur HTTP
const wss = new WebSocket.Server({ server });

// Ensemble pour stocker les clients connectés
const clients = new Set();

// Gérer les connexions WebSocket
wss.on('connection', (ws) => {
  console.log('Nouveau client WebSocket connecté');
  clients.add(ws);

  // Lorsque le serveur reçoit un message via WebSocket...
  ws.on('message', (message) => {
    console.log(`Message reçu via WebSocket: ${message}`);

    // Exemple : retransmettre ce message à tous les clients (broadcast)
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // En cas de déconnexion d'un client
  ws.on('close', () => {
    console.log('Client WebSocket déconnecté');
    clients.delete(ws);
  });
});

// Le port utilisé par Render est fourni dans la variable d'environnement PORT
const PORT = process.env.PORT || 8080;

// Démarrer le serveur HTTP (et WebSocket sur le même port)
server.listen(PORT, () => {
  console.log(`Serveur HTTP/WebSocket démarré sur le port ${PORT}`);
});
