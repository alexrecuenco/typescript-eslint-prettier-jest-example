import { serverFactory } from './server.js';

const PORT = process.env.PORT || process.env.port || 3000;
const server = serverFactory();

export { serverFactory };

if (process.argv[2] === 'serve') {
  // eslint-disable-next-line no-console
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}
