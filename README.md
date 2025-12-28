# 📡 Sensor Dashboard en Tiempo Real con WebSockets

## 👥 Integrantes
- Alberto Martínez Medina
- Joan Gelabert Colomar

---

## ℹ️ Introducción
Este proyecto implementa un **servidor WebSocket** que simula el comportamiento de varios **sensores** (temperatura, humedad y presión) y envía sus datos en tiempo real a un **dashboard web interactivo**.

La aplicación sigue un **modelo Event-Driven**, donde el servidor y los clientes se comunican mediante eventos WebSocket.

Además, incluye:
- Chat público en tiempo real
- Mensajes privados entre clientes
- Control dinámico de la frecuencia de los sensores

---

## 🛠️ Tecnologías utilizadas

- **Node.js** v18+
- **npm** v9+
- **Express** v4.18.2
- **ws** v8.13.0 (WebSockets)
- **uuid** v9.0.0
- HTML5, CSS3 y JavaScript
- Chart.js (CDN) para visualización de datos

---

## 📦 Dependencias
Definidas en `package.json`:

```json
{
  "express": "^4.18.2",
  "ws": "^8.13.0",
  "uuid": "^9.0.0"
}
```

---

## 📂 Estructura del proyecto

/WebSockets_Tiempo  
├── server.js  
├── package.json  
├── package-lock.json  
├── .gitignore  
├── README.md  
└── public/  
     └── index.html  

---

## ⚙️ Instalación
1️⃣ Requisitos previos

Tener instalado:
- Node.js
- npm
- Git

Comprobar versiones:
1. node -v
2. npm -v
3. git --version

2️⃣ Clonar el repositorio
1. git clone https://github.com/AlbertoM01/WebSockets_Tiempo.git
2. cd WebSockets_Tiempo

3️⃣ Instalar dependencias
npm install

4️⃣ Ejecutar el servidor
npm start

El servidor estará disponible en:
http://localhost:3000

---

## ▶️ Manual de uso

1. Abrir http://localhost:3000 en el navegador.
2. Abrir varias pestañas para simular múltiples clientes.

Funcionalidades disponibles:

### 📊 Dashboard de sensores
Visualización en tiempo real de temperatura, humedad y presión.

### ⏱️ Control de frecuencia
Cambiar el intervalo de actualización de cada sensor desde la interfaz.

### 💬 Chat público
Mensajes visibles para todos los clientes conectados.

### 🔒 Mensajes privados
Comunicación directa usando el clientId asignado al conectarse.

### 👥 Presencia de usuarios
Notificación cuando un cliente se conecta o se desconecta.

---

## 🔄 Eventos WebSocket
Cliente → Servidor
- subscribe
- set_sensor_interval
- chat
- private_message

Servidor → Cliente
- connected
- sensor_update
- chat
- private_message
- presence
- ok
- error

---

## 📌 Fuentes
Chatgpt: https://chatgpt.com/ Classroom: https://classroom.google.com/

---

## ✅ Conclusión
Este proyecto demuestra cómo implementar un sistema en tiempo real con WebSockets, permitiendo la comunicación bidireccional entre servidor y clientes. Hemos conseguido simular sensores, actualizar un dashboard interactivo y habilitar un chat público y uno privado.