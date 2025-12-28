const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static('public'));


class Sensor {
  constructor(id, type, valueRange, intervalMs = 1000) {
    this.id = id;
    this.type = type;
    this.valueRange = valueRange;
    this.intervalMs = intervalMs;
    this.value = this.randomValue();
    this.timer = null;
  }

  randomValue() {
    const [min, max] = this.valueRange;
    return +(Math.random() * (max - min) + min).toFixed(2);
  }

  start(broadcastFn) {
    if (this.timer) return;
    this.timer = setInterval(() => {

      const drift = (Math.random() - 0.5) * (this.valueRange[1] - this.valueRange[0]) * 0.01;
      this.value = +(Math.min(this.valueRange[1], Math.max(this.valueRange[0], this.value + drift))).toFixed(2);
      const payload = {
        event: 'sensor_update',
        data: {
          sensorId: this.id,
          type: this.type,
          value: this.value,
          timestamp: Date.now()
        }
      };
      broadcastFn(payload);
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setIntervalMs(ms, broadcastFn) {
    this.intervalMs = ms;
    this.stop();
    this.start(broadcastFn);
  }
}


const sensors = [
  new Sensor('sensor-temp-1', 'temperature', [15, 35], 1000),
  new Sensor('sensor-hum-1', 'humidity', [20, 90], 1500),
  new Sensor('sensor-pres-1', 'pressure', [980, 1050], 2000)
];


function broadcastToAll(obj) {
  const s = JSON.stringify(obj);
  wss.clients.forEach(c => {
    if (c.readyState === c.OPEN) c.send(s);
  });
}

sensors.forEach(s => s.start(broadcastToAll));

const clients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  ws.clientId = clientId;
  clients.set(clientId, ws);

  ws.send(JSON.stringify({ event: 'connected', data: { clientId, sensors: sensors.map(s => ({ id: s.id, type: s.type })) } }));

  broadcastToAll({ event: 'presence', data: { clientId, status: 'connected' } });

  ws.on('message', (msg) => {
    let parsed;
    try { parsed = JSON.parse(msg); } catch (e) { return; }

    const { event, data } = parsed;

    switch (event) {
      case 'subscribe': {
        ws.send(JSON.stringify({ event: 'subscribed', data }));
        break;
      }

      case 'set_sensor_interval': {
        const { sensorId, intervalMs } = data || {};
        const s = sensors.find(x => x.id === sensorId);
        if (s) {
          s.setIntervalMs(Number(intervalMs) || 1000, broadcastToAll);
          ws.send(JSON.stringify({ event: 'ok', data: { msg: `interval set for ${sensorId} = ${s.intervalMs}ms` } }));
        } else {
          ws.send(JSON.stringify({ event: 'error', data: { msg: 'sensor not found', sensorId } }));
        }
        break;
      }

      case 'chat': {
        const payload = { event: 'chat', data: { from: clientId, text: data.text, timestamp: Date.now() } };
        broadcastToAll(payload);
        break;
      }

      case 'private_message': {
        const { to, text } = data || {};
        const toWs = clients.get(to);
        if (toWs && toWs.readyState === toWs.OPEN) {
          toWs.send(JSON.stringify({ event: 'private_message', data: { from: clientId, text, timestamp: Date.now() } }));
          ws.send(JSON.stringify({ event: 'ok', data: { msg: 'sent', to } }));
        } else {
          ws.send(JSON.stringify({ event: 'error', data: { msg: 'client not found or offline', to } }));
        }
        break;
      }

      default:
        ws.send(JSON.stringify({ event: 'error', data: { msg: 'unknown event', event } }));
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
    broadcastToAll({ event: 'presence', data: { clientId, status: 'disconnected' } });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));