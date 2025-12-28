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
    this.valueRange = valueRange; // [min, max]
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
