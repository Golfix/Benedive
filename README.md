# BeneDive.com

Site web officiel de **Bénédicte Imbert**, instructrice PADI francophone à Hurghada (Mer Rouge, Égypte).

## Architecture

Site statique pur (HTML5 + CSS3 + JS vanilla) — aucune dépendance, aucun build, déploiement direct
sur n'importe quel hébergeur statique (Netlify, Cloudflare Pages, GitHub Pages, OVH, Vercel…).

```
.
├── index.html                              Accueil
├── a-propos.html                           À propos de Bénédicte
├── bapteme-plongee-hurghada.html           Baptême / Discover Scuba Diving
├── cours-padi.html                         Hub des formations PADI
├── cours-padi/
│   ├── open-water-diver.html               PADI Open Water (best-seller)
│   ├── advanced-open-water.html            PADI Advanced
│   ├── rescue-diver.html                   PADI Rescue + EFR
│   ├── divemaster.html                     PADI Divemaster (stage)
│   └── specialites.html                    Spécialités (Nitrox, Deep, Wreck, etc.)
├── sites-de-plongee-hurghada.html          Tous les sites (Giftun, Abu Nuhas, Thistlegorm…)
├── tarifs.html                             Tarifs détaillés en euros
├── temoignages.html                        Avis clients
├── galerie.html                            Galerie photo (placeholders à remplacer)
├── faq.html                                FAQ pratique
├── contact.html                            Formulaire + WhatsApp + carte
├── mentions-legales.html                   RGPD, mentions légales
├── 404.html                                Page d'erreur
├── css/style.css                           Feuille de style unique
├── js/main.js                              JS minimal (menu mobile, bulles, smooth scroll)
├── images/                                 Logo, favicon, photos (à enrichir)
├── robots.txt                              SEO crawler directives
├── sitemap.xml                             Sitemap (17 URLs)
├── manifest.webmanifest                    PWA manifest
├── humans.txt
└── .well-known/security.txt
```

## Optimisations SEO incluses

- **Schema.org JSON-LD** sur chaque page : `LocalBusiness`/`SportsActivityLocation`, `Person`,
  `Course`, `Service`, `FAQPage`, `BreadcrumbList`, `ItemList`, `TouristAttraction`.
- **Meta tags complets** : title et description optimisés par page, canonical, robots, theme-color,
  Open Graph (FB/LinkedIn), Twitter Card.
- **Hreflang** prêt pour version EN (à compléter quand traduit).
- **Sitemap XML** + robots.txt référencé.
- **URLs sémantiques** en français : `/bapteme-plongee-hurghada.html`, `/cours-padi/open-water-diver.html`.
- **Maillage interne** dense : chaque page renvoie vers les pages liées (cours ↔ sites ↔ tarifs).
- **Mobile-first** + responsive complet, `<meta viewport>` correct.
- **Performances** : pas de framework JS, CSS unique, polices Google avec `preconnect`,
  `loading="lazy"` sur l'iframe carte, animations désactivables (`prefers-reduced-motion`).

## Points d'action avant mise en production

À renseigner/remplacer dans toutes les pages (faire un find/replace global) :

| Placeholder              | Valeur réelle attendue                                  |
|--------------------------|---------------------------------------------------------|
| `+20 15 58664187`       | Numéro de téléphone réel de Bénédicte                   |
| `+201558664187`          | Idem, format URI WhatsApp (sans espaces ni +)           |
| `contact@benedive.com`   | Email de contact réel                                   |
| `Sheraton Road`          | Adresse précise du centre de plongée partenaire         |
| `27.2579 / 33.8116`      | Coordonnées GPS exactes                                 |
| `og-cover.jpg`           | Image Open Graph 1200×630 à créer (`/images/`)          |
| `images/icon-192.png`, `512.png` | Icônes PWA carrées à générer                    |
| `https://wa.me/201558664187` | Lien WhatsApp avec vrai numéro                      |
| `https://www.benedive.com/` | OK une fois le domaine pointé                        |

**Galerie** : la page `/galerie.html` utilise des placeholders en SVG/dégradés. Remplacer par les vraies
photos sous-marines BeneDive (format `.webp` ou `.avif` conseillé, dimensions max 1600px de large,
`alt` descriptif pour le SEO).

**Avis Google** : la page d'accueil affiche `aggregateRating` 5,0/87 dans le JSON-LD.
Ces valeurs sont des placeholders — à mettre à jour avec les vrais chiffres de la fiche Google Business Profile
une fois celle-ci active, sinon Google sanctionne pour faux avis.

**Formulaire** : le contact pointe vers FormSubmit (`formsubmit.co/contact@benedive.com`).
Premier envoi nécessitera une activation par clic sur un mail de confirmation envoyé à
contact@benedive.com. Alternative : intégrer Formspree, Web3Forms, ou un endpoint propre.

## Local SEO — checklist à mettre en place après livraison

1. **Google Business Profile** : créer/réclamer la fiche, catégorie "SCUBA instructor" + "Dive shop",
   photos régulières, posts hebdo, réponses systématiques aux avis.
2. **Inscriptions annuaires** : PADI Dive Shop Locator, TripAdvisor (catégorie Diving),
   Scubaboard, DiveZone, Wannadive, annuaires plongée francophones (Tribloo, Plongée Plaisir).
3. **Google Search Console** + Bing Webmaster Tools : soumettre `sitemap.xml`.
4. **Suivre les Core Web Vitals** (PageSpeed Insights, CrUX).

## Développement local

Aucun build. Servir le dossier avec n'importe quel serveur HTTP :

```bash
python3 -m http.server 8000
# ou
npx serve .
```

Puis ouvrir <http://localhost:8000>.

## Licence

Code source propriété de Bénédicte Imbert / BeneDive.
Tous droits réservés.
