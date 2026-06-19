// api/products/index.js  — GET all, POST new
const { getCollection } = require('../../lib/db');
const { requireAuth }   = require('../../lib/auth');
const { v4: uuidv4 }    = require('uuid');

// Vercel serverless functions can't use multer disk storage.
// Images are uploaded to Cloudinary (free tier: 25GB) via their upload API.
// The client sends: multipart with an 'image' field, OR just imgUrl in JSON.

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const col = await getCollection();

  // ── GET all products ─────────────────────────────────
  if (req.method === 'GET') {
    const { cat } = req.query;
    const query   = cat ? { cat } : {};
    const products = await col.find(query).sort({ _id: 1 }).toArray();
    // strip Mongo _id, expose our id field
    return res.status(200).json(products.map(cleanDoc));
  }

  // ── POST create product ──────────────────────────────
  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return;

    const body = req.body || {};
    if (!body.name || !body.desc || !body.cat) {
      return res.status(400).json({ error: 'name, desc, cat are required' });
    }

    const product = {
      id:     uuidv4(),
      name:   body.name.trim(),
      desc:   body.desc.trim(),
      price:  parseInt(body.price) || 0,
      cat:    body.cat,
      badge:  body.badge  || '',
      icon:   body.icon   || '📦',
      img:    body.img    || '',   // Cloudinary URL sent from admin
      tags:   Array.isArray(body.tags) ? body.tags : (body.tags ? JSON.parse(body.tags) : []),
      rating: body.rating || '5.0',
      custom: body.custom === true || body.custom === 'true',
      createdAt: new Date(),
    };

    await col.insertOne(product);
    return res.status(201).json(cleanDoc(product));
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

function cleanDoc(doc) {
  const { _id, ...rest } = doc;
  return rest;
}
