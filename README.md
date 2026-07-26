# DS Agro Tourism & Resort

<p align="center">
  <img src="./public/preview.svg" alt="DS Agro Tourism & Resort website preview" width="100%" />
</p>

<p align="center">
  <strong>A premium, responsive hospitality website built around the “From Soil to Serenity” concept.</strong>
</p>

<p align="center">
  <a href="https://satitech-official.github.io/DS-Agro-website/"><strong>View Live Website</strong></a>
  ·
  <a href="https://www.instagram.com/dsagrotourismresort_official">Official Instagram</a>
</p>

## Features

- Premium responsive UI for desktop, tablet, and mobile
- Static-exported Next.js application optimized for GitHub Pages
- Stay, day outing, experiences, dining, celebrations, gallery, and contact pages
- Direct WhatsApp enquiry flow with prefilled visit details
- Google Maps, telephone, and Instagram integrations
- Animated loader, scroll progress, interactive cards, mobile navigation, and back-to-top controls
- SEO metadata, sitemap, robots file, favicon, and social preview
- Automatic GitHub Actions build, validation, and deployment

## Technology

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- CSS animations and responsive layouts
- GitHub Actions and GitHub Pages

## Local Development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000` in your browser.

## Production Validation

```bash
npm run lint
npm test
```

The test command creates the static production export and validates the generated homepage and inner-page HTML.

## Content and Photography

Verified contact information, navigation, experience cards, and inner-page copy live in `data/site.ts`. Current remote photographs are experience-inspiration images and are not represented as photographs of DS Agro Tourism & Resort. Replace them with client-approved property photography before the final marketing launch.

Do not add prices, room categories, policies, capacities, timings, availability claims, or testimonials unless confirmed by the resort.

## Enquiry Flow

All booking calls-to-action create transparent, prefilled WhatsApp enquiries to the primary business number. The website does not claim real-time availability or confirmed booking.

## Deployment

Every push to `main` runs lint and a production static build. When validation passes, the exported `out` directory is deployed automatically to GitHub Pages.

---

Developed by **Sati Technologies**.
