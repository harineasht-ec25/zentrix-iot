# Zentrix IoT — Vercel Deployment Guide

## Project Structure
```
zentrix-vercel/
├── vercel.json              ← Vercel routing config
├── package.json
├── lib/
│   ├── db.js                ← MongoDB connection helper
│   └── auth.js              ← Seller auth helper
├── api/
│   ├── auth/login.js        ← POST /api/auth/login
│   ├── products/
│   │   ├── index.js         ← GET /api/products  |  POST /api/products
│   │   └── [id].js          ← GET/PUT/DELETE /api/products/:id
│   ├── upload.js            ← POST /api/upload (Cloudinary)
│   └── seed.js              ← POST /api/seed (first-time data seed)
└── public/
    ├── index.html           ← Customer storefront
    └── admin.html           ← Seller admin panel
```

---

## Step 1 — MongoDB Atlas (Free Database)

1. Go to https://mongodb.com/atlas and create a free account
2. Create a **free M0 cluster** (choose any region)
3. Under **Database Access** → Add a new user:
   - Username: `zentrixuser`
   - Password: something strong (save it!)
   - Role: **Read and Write to any database**
4. Under **Network Access** → Add IP Address → click **Allow Access from Anywhere** (0.0.0.0/0)
5. Go to **Clusters** → click **Connect** → **Connect your application**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://zentrixuser:<password>@cluster0.xxxxx.mongodb.net/
   ```
   Replace `<password>` with your actual password.
   Add the DB name at the end:
   ```
   mongodb+srv://zentrixuser:yourpassword@cluster0.xxxxx.mongodb.net/zentrix
   ```
   **Save this — it's your MONGODB_URI**

---

## Step 2 — Cloudinary (Free Image Storage)

1. Go to https://cloudinary.com and create a free account
2. From your **Dashboard**, note down:
   - **Cloud name** (e.g. `dxxxxxxxxx`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `xxxxxxxxxxxxxxxxxxxxxxxx`)
3. **Save all three values**

---

## Step 3 — Push to GitHub

1. Create a new repository on https://github.com (name it `zentrix-iot`)
2. On your computer, open terminal in the `zentrix-vercel` folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/zentrix-iot.git
   git push -u origin main
   ```

---

## Step 4 — Deploy on Vercel

1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New Project**
3. Select your `zentrix-iot` repository → click **Import**
4. Framework preset: **Other** (leave as default)
5. Click **Environment Variables** and add these one by one:

   | Variable Name | Value |
   |---|---|
   | `MONGODB_URI` | Your MongoDB connection string from Step 1 |
   | `MONGODB_DB` | `zentrix` |
   | `CLOUDINARY_CLOUD_NAME` | Your cloud name from Step 2 |
   | `CLOUDINARY_API_KEY` | Your API key from Step 2 |
   | `CLOUDINARY_API_SECRET` | Your API secret from Step 2 |
   | `SELLER_USER` | `seller` (or choose your own) |
   | `SELLER_PASS` | `iotseller123` (change this!) |

6. Click **Deploy** — Vercel builds and deploys in ~60 seconds
7. You'll get a live URL like: `https://zentrix-iot.vercel.app`

---

## Step 5 — Seed the Database (One Time Only)

After deploying, you need to load your 14 default products into MongoDB.

Open your browser and go to:
```
https://your-site.vercel.app/api/seed
```
But this needs auth — use this curl command (or Postman):
```bash
curl -X POST https://your-site.vercel.app/api/seed \
  -H "x-seller-auth: $(echo -n 'seller:iotseller123' | base64)"
```

Or simply open the **admin panel**, log in, and add products manually via the + Add Product button.

---

## Your Live URLs

| Page | URL |
|---|---|
| 🛒 Storefront | `https://your-site.vercel.app/` |
| ⚙️ Admin panel | `https://your-site.vercel.app/admin` |
| 📡 Products API | `https://your-site.vercel.app/api/products` |

---

## Updating Your Site

Any time you push to GitHub, Vercel **automatically redeploys** — no manual steps needed.

```bash
git add .
git commit -m "Updated products"
git push
```
Vercel rebuilds in ~30 seconds. Products in MongoDB are never affected by redeploys.

---

## Default Seller Credentials
| Field | Value |
|---|---|
| Username | `seller` (set in env var SELLER_USER) |
| Password | `iotseller123` (set in env var SELLER_PASS) |

**Change these in Vercel → Project → Settings → Environment Variables**

---

## Cost Breakdown

| Service | Free Tier |
|---|---|
| Vercel | 100GB bandwidth/month, unlimited deploys |
| MongoDB Atlas | 512MB storage, shared cluster |
| Cloudinary | 25GB storage, 25GB bandwidth/month |
| **Total** | **₹0 / month** |
