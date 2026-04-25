# Deploiement LWS (Next.js + Prisma)

Ce projet utilise des routes API (`/api/contact`, `/api/partnership`) et Prisma.
Il ne doit pas etre deploye en export statique si tu veux conserver ces formulaires.

## Option recommandee: LWS VPS (Node.js)

### 1) Prerequis serveur

- Ubuntu 22.04+ sur VPS LWS
- Nom de domaine pointe vers le VPS (enregistrement `A`)
- Acces SSH

### 2) Installer Node et PM2

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
node -v
npm -v
```

### 3) Deployer le code

```bash
cd /var/www
sudo mkdir -p noya-web
sudo chown -R $USER:$USER /var/www/noya-web
cd /var/www/noya-web
git clone <URL_DU_REPO> .
npm ci
```

### 4) Variables d'environnement

Creer un fichier `.env` a la racine:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
```

### 5) Build et lancement

```bash
npm run build
npx prisma migrate deploy
pm2 start npm --name noya-web -- start
pm2 save
pm2 startup
```

### 6) Reverse proxy Nginx

Installer Nginx:

```bash
sudo apt install -y nginx
```

Creer le fichier `/etc/nginx/sites-available/noya-web`:

```nginx
server {
  listen 80;
  server_name ton-domaine.com www.ton-domaine.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Activer la config:

```bash
sudo ln -s /etc/nginx/sites-available/noya-web /etc/nginx/sites-enabled/noya-web
sudo nginx -t
sudo systemctl reload nginx
```

### 7) SSL Lets Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ton-domaine.com -d www.ton-domaine.com
```

### 8) Commandes utiles

```bash
pm2 logs noya-web
pm2 restart noya-web
pm2 status
```

## Option non recommandee: mutualise + export statique

Possible uniquement si tu supprimes/remplaces les routes API et Prisma.
Dans ce mode, les formulaires `fetch("/api/contact")` et `fetch("/api/partnership")` ne fonctionneront plus.
