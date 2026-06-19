// api/auth/login.js
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};
  const validUser = process.env.SELLER_USER || 'seller';
  const validPass = process.env.SELLER_PASS || 'iotseller123';

  if (username === validUser && password === validPass) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return res.status(200).json({ success: true, token });
  }
  return res.status(401).json({ success: false, error: 'Invalid credentials' });
};
