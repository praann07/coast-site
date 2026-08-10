const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer((req, res) => {
  const safePath = path.normalize(req.url === '/' ? '/index.html' : req.url).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(__dirname, safePath);
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }
  const ext = path.extname(filePath);
  const mime = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.json': 'application/json'
  };
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
});
server.listen(3000, () => console.log('Coast website running at http://localhost:3000'));
