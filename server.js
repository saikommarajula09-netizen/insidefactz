const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// SSL Certificate Auto-Detection
const sslPaths = {
  key: path.join(__dirname, 'key.pem'),
  cert: path.join(__dirname, 'cert.pem')
};

let isHttps = false;
let serverOptions = {};

if (fs.existsSync(sslPaths.key) && fs.existsSync(sslPaths.cert)) {
  try {
    serverOptions = {
      key: fs.readFileSync(sslPaths.key),
      cert: fs.readFileSync(sslPaths.cert)
    };
    isHttps = true;
  } catch (sslErr) {
    console.error(`[SSL Error] Failed to read certificate files:`, sslErr.message);
  }
}

// Port Configurations: default to 443 (HTTPS) if keys exist, otherwise 80 (HTTP)
const PORT = process.env.PORT || (isHttps ? 443 : 80);
const HOST = process.env.HOST || '0.0.0.0';

// In-Memory Rate Limiter Configuration (Anti-DDoS Guard)
const rateLimits = {};
const LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 150; // Max requests per window per IP

function isRateLimited(ip) {
  const now = Date.now();
  if (!rateLimits[ip]) {
    rateLimits[ip] = [];
  }
  // Remove expired timestamps
  rateLimits[ip] = rateLimits[ip].filter(timestamp => now - timestamp < LIMIT_WINDOW);
  
  if (rateLimits[ip].length >= MAX_REQUESTS) {
    return true;
  }
  rateLimits[ip].push(now);
  return false;
}

// Helper to resolve local network IP
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Request Handler containing Core Security Logic
const requestHandler = (req, res) => {
  const clientIp = req.socket.remoteAddress || 'unknown';

  // 1. Apply Rate Limiting
  if (isRateLimited(clientIp)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'text/plain');
    res.end('429 Too Many Requests. Please slow down.');
    console.warn(`[Security Alert] Rate limit exceeded by IP: ${clientIp}`);
    return;
  }

  // 2. Normalize and resolve the request path
  let reqUrl = req.url.split('?')[0]; // strip query strings
  let filePath = reqUrl === '/' ? '/index.html' : reqUrl;
  filePath = path.normalize(path.join(__dirname, filePath));

  // 3. Directory Traversal Protection (Strict Check)
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Access Denied: Path outside scope.');
    console.error(`[Security Warning] Blocked Directory Traversal request to: ${filePath} from IP: ${clientIp}`);
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 File Not Found');
      } else {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Internal Server Error: ${error.code}`);
      }
    } else {
      // 4. Inject HTTP Security Headers
      res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
      res.setHeader('X-Frame-Options', 'DENY'); // Prevent Clickjacking (iframe exploits)
      res.setHeader('X-XSS-Protection', '1; mode=block'); // Enable browser XSS filtering
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); // Protect referrer leakages
      
      // Strict Content Security Policy (CSP)
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data:; " +
        "connect-src 'self';"
      );

      // Enforce HSTS (HTTP Strict Transport Security) if HTTPS is enabled
      if (isHttps) {
        res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.end(content, 'utf-8');
    }
  });
};

// Create server depending on SSL availability
let server;
if (isHttps) {
  server = https.createServer(serverOptions, requestHandler);
} else {
  server = http.createServer(requestHandler);
}

// Handle Server Errors (Port Conflicts & Permissions)
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`=======================================================`);
    console.error(` ERROR: Port ${PORT} is already in use by another app.`);
    console.error(` Windows IIS, Skype, or other server might be using it.`);
    console.error(` Please run: PORT=3000 node server.js to use port 3000.`);
    console.error(`=======================================================`);
  } else if (e.code === 'EACCES') {
    console.error(`=======================================================`);
    console.error(` ERROR: Port ${PORT} requires Administrator privileges.`);
    console.error(` Please run your command prompt/terminal as Administrator.`);
    console.error(` Alternatively, use: PORT=3000 node server.js`);
    console.error(`=======================================================`);
  } else {
    console.error(`Server error:`, e.message);
  }
});

// Start listening
server.listen(PORT, HOST, () => {
  const localIp = getLocalIpAddress();
  const protocol = isHttps ? 'https' : 'http';
  const urlPort = (PORT === 80 && !isHttps) || (PORT === 443 && isHttps) ? '' : `:${PORT}`;
  
  console.log(`=======================================================`);
  console.log(` InsideFactz Academy web server running SECURELY!`);
  console.log(` Mode:           ${isHttps ? 'HTTPS (Secure)' : 'HTTP (With Security Headers)'}`);
  console.log(` Local URL:      ${protocol}://localhost${urlPort}`);
  console.log(` Custom Domain:  ${protocol}://insidefactz.xyz${urlPort}`);
  console.log(` Network URL:    ${protocol}://${localIp}${urlPort}`);
  console.log(`=======================================================`);
  console.log(`Press Ctrl+C to terminate the server`);
});

// Spin up HTTP -> HTTPS redirect server if running on default HTTPS port (443)
if (isHttps && PORT === 443) {
  http.createServer((req, res) => {
    const host = req.headers.host || '';
    // If the request comes from localtunnel, serve the request directly to bypass external HTTPS redirects!
    if (host.includes('loca.lt') || host.includes('tunnel')) {
      requestHandler(req, res);
    } else {
      res.writeHead(301, { "Location": `https://${host}${req.url}` });
      res.end();
    }
  }).listen(80, HOST, () => {
    console.log(` Redirecting http://insidefactz.xyz -> https://insidefactz.xyz (localtunnel bypassed)`);
  });
}
