// api/upload.js — upload image to Cloudinary, return secure URL
const { requireAuth } = require('../lib/auth');

// Cloudinary upload via their REST API (no SDK needed)
async function uploadToCloudinary(base64Data, filename) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary env vars not set: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder    = 'zentrix-iot';

  // Generate SHA1 signature
  const crypto   = require('crypto');
  const sigStr   = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(sigStr).digest('hex');

  const formData = new URLSearchParams();
  formData.append('file',      base64Data);       // base64 data URI
  formData.append('api_key',   apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder',    folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res))   return;

  const { imageData, filename } = req.body || {};
  if (!imageData) return res.status(400).json({ error: 'imageData (base64) is required' });

  try {
    const url = await uploadToCloudinary(imageData, filename || 'product');
    return res.status(200).json({ success: true, url });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
