const express = require('express');
const cors = require('cors');
const client = require('prom-client');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const authRouter = require('./routes/auth');
const todosRouter = require('./routes/todos');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

client.collectDefaultMetrics({ eventLoopMonitoringPrecision: 10 });
const httpCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total des requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.on('finish', () => {
    httpCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'API Todo App', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./routes/*.js'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use('/auth', authRouter);
app.use('/todos', todosRouter);
app.use('/tasks', tasksRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
