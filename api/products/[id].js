// api/products/[id].js  — GET one, PUT update, DELETE
const { getCollection } = require('../../lib/db');
const { requireAuth }   = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const col = await getCollection();

  // ── GET one ──────────────────────────────────────────
  if (req.method === 'GET') {
    const doc = await col.findOne({ id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(cleanDoc(doc));
  }

  // ── PUT update ───────────────────────────────────────
  if (req.method === 'PUT') {
    if (!requireAuth(req, res)) return;

    const doc = await col.findOne({ id });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const body    = req.body || {};
    const updated = {
      ...cleanDoc(doc),
      name:   body.name   !== undefined ? body.name.trim()         : doc.name,
      desc:   body.desc   !== undefined ? body.desc.trim()         : doc.desc,
      price:  body.price  !== undefined ? (parseInt(body.price)||0): doc.price,
      cat:    body.cat    !== undefined ? body.cat                  : doc.cat,
      badge:  body.badge  !== undefined ? body.badge               : doc.badge,
      icon:   body.icon   !== undefined ? body.icon                : doc.icon,
      img:    body.img    !== undefined ? body.img                 : doc.img,
      tags:   body.tags   !== undefined
        ? (Array.isArray(body.tags) ? body.tags : JSON.parse(body.tags))
        : doc.tags,
      rating: body.rating !== undefined ? body.rating              : doc.rating,
      custom: body.custom !== undefined
        ? (body.custom === true || body.custom === 'true')
        : doc.custom,
      updatedAt: new Date(),
    };

    await col.replaceOne({ id }, updated);
    return res.status(200).json(cleanDoc(updated));
  }

  // ── DELETE ───────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!requireAuth(req, res)) return;
    const result = await col.deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ success: true, id });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

function cleanDoc(doc) {
  const { _id, ...rest } = doc;
  return rest;
}
