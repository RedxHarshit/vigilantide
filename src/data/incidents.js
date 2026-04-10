export const incidents = [
  {
    id: "INC-402",
    severity: "critical",
    title: "Payment Processing Timeout Loop",
    root_cause: "Synchronous retry loop in payment processor caused cascading timeouts when the payment gateway returned 503. No exponential backoff was implemented, causing the loop to hammer the gateway until thread pool exhaustion.",
    resolution_code: `// Fixed: Added exponential backoff with jitter
async function processPayment(order) {
  const MAX_RETRIES = 3;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await gateway.charge(order);
    } catch (err) {
      if (err.status === 503 && i < MAX_RETRIES - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}`,
    affected_files: ["payment/processor.js", "payment/gateway.js"],
    date: "2024-03-15T14:30:00Z",
    impact: "All payment processing halted for 47 minutes. Revenue loss estimated at $230K."
  },
  {
    id: "INC-108",
    severity: "high",
    title: "SQL Injection in User Search Endpoint",
    root_cause: "User search endpoint concatenated raw query parameter into SQL string without parameterized queries. Allowed attackers to extract user email addresses via UNION-based injection.",
    resolution_code: `// Fixed: Parameterized query
async function searchUsers(query) {
  const results = await db.query(
    'SELECT id, name, email FROM users WHERE name ILIKE $1 LIMIT 20',
    [\`%\${query}%\`]
  );
  return results.rows;
}`,
    affected_files: ["api/routes/users.js", "db/queries.js"],
    date: "2024-01-22T09:15:00Z",
    impact: "~2,400 user email addresses exposed. Required mandatory password resets and GDPR notification."
  },
  {
    id: "INC-215",
    severity: "medium",
    title: "Memory Leak in WebSocket Connection Handler",
    root_cause: "WebSocket connection handler stored client references in a Map but never removed them on disconnect. Event listeners were also not cleaned up, leading to gradual memory growth.",
    resolution_code: `// Fixed: Proper cleanup on disconnect
wss.on('connection', (ws, req) => {
  const clientId = generateId();
  clients.set(clientId, ws);

  ws.on('close', () => {
    clients.delete(clientId);
    ws.removeAllListeners();
  });

  ws.on('error', () => {
    clients.delete(clientId);
    ws.removeAllListeners();
  });
});`,
    affected_files: ["realtime/wsHandler.js", "realtime/connections.js"],
    date: "2024-02-08T16:45:00Z",
    impact: "Server OOM crash every 72 hours. Required manual restart during peak hours."
  },
  {
    id: "INC-067",
    severity: "critical",
    title: "Security Violation — Auth Logs Exposed",
    root_cause: "Debug logging middleware logged full request bodies including auth tokens and session keys to application logs stored in plaintext on shared EBS volumes.",
    resolution_code: `// Fixed: Redact sensitive fields before logging
function sanitizeBody(body) {
  const sensitive = ['userToken', 'sessionHash', 'authKey', 'pin'];
  const sanitized = { ...body };
  for (const key of sensitive) {
    if (sanitized[key]) sanitized[key] = '***REDACTED***';
  }
  return sanitized;
}

app.use((req, res, next) => {
  logger.info({ path: req.path, body: sanitizeBody(req.body) });
  next();
});`,
    affected_files: ["middleware/logger.js", "config/logging.js"],
    date: "2024-04-02T11:00:00Z",
    impact: "Security audit failure. Required emergency remediation and compliance review."
  },
  {
    id: "INC-312",
    severity: "high",
    title: "Race Condition in Order Processing Pipeline",
    root_cause: "Two concurrent requests for the same order could both pass the 'pending' status check and proceed to charge the customer twice. No distributed locking mechanism was in place.",
    resolution_code: `// Fixed: Distributed lock with Redis
async function processOrder(orderId) {
  const lockKey = \`order-lock:\${orderId}\`;
  const lock = await redis.set(lockKey, '1', 'NX', 'EX', 30);
  if (!lock) throw new Error('Order already being processed');

  try {
    const order = await db.getOrder(orderId);
    if (order.status !== 'pending') return;
    await chargeCustomer(order);
    await db.updateStatus(orderId, 'completed');
  } finally {
    await redis.del(lockKey);
  }
}`,
    affected_files: ["orders/processor.js", "orders/charge.js"],
    date: "2024-05-18T08:30:00Z",
    impact: "~340 customers charged twice over 6 hours. Required manual refunds and customer support surge."
  },
  {
    id: "INC-189",
    severity: "medium",
    title: "Unhandled Promise Rejection in Auth Middleware",
    root_cause: "JWT verification was wrapped in try/catch but the token refresh call inside was an unhandled promise. When the refresh endpoint was down, the unhandled rejection crashed the Node process.",
    resolution_code: `// Fixed: Proper async error handling
async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    try {
      req.user = jwt.verify(token, SECRET);
    } catch (verifyErr) {
      if (verifyErr.name === 'TokenExpiredError') {
        try {
          const newToken = await refreshToken(token);
          req.user = jwt.verify(newToken, SECRET);
          res.setHeader('X-Refreshed-Token', newToken);
        } catch (refreshErr) {
          return res.status(401).json({ error: 'Token refresh failed' });
        }
      } else {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}`,
    affected_files: ["middleware/auth.js", "auth/refresh.js"],
    date: "2024-06-01T03:20:00Z",
    impact: "Intermittent 502 errors during auth service maintenance windows. Average 15-minute outages."
  }
];
