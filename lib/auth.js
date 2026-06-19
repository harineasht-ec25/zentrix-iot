// lib/auth.js
function checkAuth(req) {
  const token = req.headers['x-seller-auth'];
  if (!token) return false;
  try {
    const [user, pass] = Buffer.from(token, 'base64').toString().split(':');
    return (
      user === (process.env.SELLER_USER || 'seller') &&
      pass === (process.env.SELLER_PASS || 'iotseller123')
    );
  } catch { return false; }
}

function requireAuth(req, res) {
  if (!checkAuth(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

module.exports = { checkAuth, requireAuth };
