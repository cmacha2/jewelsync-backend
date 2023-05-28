const express = require('express');
const app = express();
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const variantRoutes = require('./routes/variantRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const webhoohRoutes = require('./routes/webhookRoutes');
const cloverRoutes = require('./routes/cloverRoutes');
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
require('dotenv').config({ path: './.env' })


const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('¡Se ha establecido una nueva conexión de Socket.IO!');

  // Ejemplo de emisión de mensajes cada 5 segundos
  const interval = setInterval(() => {
    const message = '¡Hola desde el servidor!';
    socket.emit('message', message);
  }, 10000);

  // Manejador de desconexión de Socket.IO
  socket.on('disconnect', () => {
    console.log('Se ha desconectado una conexión de Socket.IO');
    clearInterval(interval);
  });
});

app.set('io', io);

app.use((req, res, next) => {
  console.log('Nueva solicitud recibida:', req.method, req.url);
  next();
});


app.use('/api/webhooks', bodyParser.raw({ type: 'application/json', verify: function(req, res, buf) {
  req.rawBody = buf;
}}));



app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Shop');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhoohRoutes);
app.use('/api/clover', cloverRoutes);

// Start the server


const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

