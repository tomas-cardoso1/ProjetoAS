import { buildApp } from './app';

const app = buildApp();

app.listen({ port: 3000, host: '0.0.0.0' }).then(() => {
  console.log('API a correr em http://localhost:3000');
});