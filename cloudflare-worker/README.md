# BeneDive — Worker formulaire WhatsApp

Cloudflare Worker qui relaie le formulaire de contact du site vers le WhatsApp de Bénédicte (et un email en backup).

## Architecture

```
www.benedive.com/contact.html
     ↓ POST JSON {prenom, message, ...}
[Cloudflare Worker]   ← ce code
     ↓ POST WhatsApp Cloud API
WhatsApp de Bénédicte (+20 15 58664187)
     +
[Resend / email backup] (optionnel)
```

**Le prospect ne voit rien** : pas de redirection WhatsApp, pas de fenêtre qui s'ouvre. Juste un message "Merci, Bénédicte vous recontacte sous 24h".

---

## 1. Pré-requis (à faire UNE FOIS)

### A. Compte WhatsApp Business Cloud API (gratuit Meta)

1. Aller sur **https://developers.facebook.com/** → se connecter avec Facebook (perso ou pro).
2. Créer une **app de type Business** : <https://developers.facebook.com/apps/create/>
3. Ajouter le produit **WhatsApp** à l'app.
4. Dans **WhatsApp > Getting Started** :
   - Récupérer le `Phone Number ID` (id du numéro expéditeur)
   - Générer un `Temporary Access Token` (24h) pour tester
   - **Pour la prod** : passer ensuite à un **Permanent Access Token** via Business Manager → Users → System Users → Create system user → Add asset (WhatsApp Account) → Generate token (jamais expire)

### B. Choisir le numéro expéditeur

⚠️ Le numéro qui ENVOIE doit être différent du WhatsApp perso de Bénédicte. Trois options :

- **OPTION FACILE (recommandée pour démarrer)** : utiliser le **numéro de test gratuit Meta** (visible dans l'app FB). Il peut envoyer à 5 numéros listés, donc à Bénédicte (+201558664187) c'est OK. Limite : 250 messages/24h. Gratuit à vie.

- **OPTION PRO** : acheter une eSIM/SIM neuve (Égypte ~3€/mois, ou France 5€/mois) et la dédier au business. Bénédicte continue d'utiliser son WhatsApp perso normalement. Le worker envoie depuis le nouveau numéro vers le perso.

- **OPTION HYBRIDE** : migrer le +201558664187 en WhatsApp Business API (perd la version classique sur ce numéro). Non recommandé pour quelqu'un qui dépend de WhatsApp perso.

### C. (Optionnel mais recommandé) Resend pour l'email de backup

1. Créer un compte gratuit sur https://resend.com
2. Vérifier le domaine `benedive.com` (entrée DNS TXT à ajouter chez l'hébergeur DNS)
3. Récupérer le `RESEND_API_KEY`

Sans Resend : pas de mail backup, le worker fonctionne quand même.

---

## 2. Déploiement (~5 minutes)

```bash
# Depuis ce dossier (cloudflare-worker/)
cd cloudflare-worker

# Installer Wrangler (CLI Cloudflare)
npm install

# Se connecter à Cloudflare (ouvre le navigateur)
npx wrangler login

# Configurer les secrets (un par un)
npm run secret:wa-phone-id      # colle le Phone Number ID
npm run secret:wa-token         # colle le Permanent Access Token
npm run secret:bene-phone       # colle "201558664187" (sans +)
npm run secret:resend           # optionnel
npm run secret:bene-email       # optionnel (ex: kev42800@gmail.com en test)

# Déployer
npm run deploy
```

Après déploiement, Cloudflare donne une URL comme `https://benedive-contact-form.<account>.workers.dev`. **Note-la** — c'est l'URL à mettre dans le formulaire.

### Déploiement sans CLI (via dashboard Cloudflare)

1. Aller sur https://dash.cloudflare.com → Workers & Pages → Create
2. Workers → Create Worker → Donner un nom : `benedive-contact-form`
3. Coller le contenu de `src/index.js`
4. Settings → Variables → Add Secret (5 secrets ci-dessus)
5. Save and Deploy

---

## 3. Brancher le formulaire du site

Dans `contact.html`, le formulaire JS est déjà préparé pour POSTer vers le Worker.

Éditer la ligne `WORKER_URL` dans `contact.html` et y mettre l'URL du Worker déployé.

---

## 4. Tester

```bash
curl -X POST https://<worker-url>/ \
  -H "Origin: https://www.benedive.com" \
  -H "Content-Type: application/json" \
  -d '{
    "prenom": "TEST",
    "prestation": "Open Water",
    "dates": "1-7 juin",
    "niveau": "Débutant",
    "personnes": "2",
    "message": "Test du formulaire depuis curl"
  }'
```

Réponse attendue : `{"success":true,"channels":{"whatsapp":true,"email":false}}`. Vérifier sur le WhatsApp de Bénédicte qu'un message est arrivé.

### Voir les logs en temps réel

```bash
npm run tail
```

---

## 5. Domaine custom (optionnel)

Pour que l'URL soit `https://form.benedive.com/` au lieu de `*.workers.dev` :

1. Dashboard CF → Workers → benedive-contact-form → Settings → Triggers → Custom Domains
2. Add Custom Domain → `form.benedive.com`
3. Cloudflare crée automatiquement le CNAME nécessaire dans la zone DNS

Si le domaine n'est pas géré par Cloudflare, ajouter à la main un CNAME chez ton DNS :
- `form.benedive.com` → `benedive-contact-form.<account>.workers.dev`

---

## 6. Sécurité

- **CORS** : seul `www.benedive.com` peut POSTer (variable `ALLOWED_ORIGIN`)
- **Honeypot** : champ caché `_honeypot` ; si rempli → silent drop
- **Validation** : prénom obligatoire, URL dans le prénom → drop
- **Rate limiting** : non implémenté nativement par le worker (gratuit). Ajouter en cas d'abus via Cloudflare Rules ou Cloudflare Turnstile (CAPTCHA invisible).

Pour ajouter Turnstile (recommandé après quelques semaines d'usage) :
1. Dashboard CF → Turnstile → Add site (mode invisible)
2. Récupérer site key + secret key
3. Modifier le worker pour valider le token Turnstile reçu du form

---

## 7. Limites du plan gratuit

| Service | Free tier | Largement suffisant pour |
|---|---|---|
| Cloudflare Workers | 100 000 req/jour | < 1000 contacts/jour |
| WhatsApp Cloud API (Meta) | 1000 conversations/mois | < 30 conversations/jour |
| Resend (email) | 3000 emails/mois, 100/jour | < 100 contacts/jour |

Au-delà : tarification très progressive (quelques € / mois).

---

## 8. Maintenance

- **Le Permanent Access Token** ne périme pas (sauf si Bénédicte le révoque manuellement).
- Le **template de message** n'est PAS nécessaire ici car Bénédicte est destinataire des messages "non-user-initiated", pas l'inverse. (Les templates Meta sont obligatoires uniquement quand on écrit à un user qui n'a pas écrit en premier dans les 24h.)
- Vérifier les logs Worker régulièrement (`wrangler tail`) pour détecter spam ou erreurs.

---

## Coût total

**0 € / mois** dans le tier gratuit. Premier vrai paiement seulement si :
- > 1000 conversations WhatsApp/mois → 0.005 € la conv suivante
- > 100k requêtes Worker/jour → $0.30 / million de requêtes suivantes
