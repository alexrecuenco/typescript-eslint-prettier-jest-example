import http from 'http';
import { replace } from './replacer.js';

// See simple example here

const addOneToNumbers = replace(
  (p) => p + 1,
  (t: number): t is number => typeof t === 'number',
);

let start = { a: 1, b: 2, c: { d: 3, e: 'hi' } };
export function serverFactory() {
  return http.createServer((req, res) => {
    res.statusCode = 200;
    start = addOneToNumbers(start);
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Hello World\r\n${JSON.stringify(start, null, 2)}\r\n`);
  });
}
