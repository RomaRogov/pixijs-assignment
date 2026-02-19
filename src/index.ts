import { Application } from './app/Application';

// Создаём и запускаем приложение
const app = new Application();

app.init().then(() => {
  console.log('PixiJS Application initialized successfully!');
}).catch((error) => {
  console.error('Failed to initialize PixiJS application:', error);
});

