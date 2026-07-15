# Zyad Khaled — Cyberpunk Portfolio

A cyberpunk-themed, fully dynamic portfolio website with live data from GitHub API, LinkedIn JSON data, weather API, and a working contact form via FormSubmit.co. Deployed automatically via GitHub Actions to GitHub Pages.

## Live Demo

**[https://zyadkhaled-zk.github.io/portfolio](https://zyadkhaled-zk.github.io/portfolio)**

## Features

### Cyberpunk UI
- Neon cyan / magenta / yellow color scheme with glassmorphism cards
- Glitch text effects, scanlines, and animated gradients
- Smooth cubic-bezier transitions and hover interactions
- Fully responsive — works on desktop, tablet, and mobile
- RTL Arabic layout with modern CSS (backdrop-filter, gradient text, pill badges)

### Live GitHub Integration
- Fetches profile data, repositories, and stats from GitHub API in real-time
- Dynamic project cards with language tags, stars, and links
- Auto-refreshes every few minutes with manual refresh button

### LinkedIn Data
- Experience timeline (Youth Economy Lab, FlyRank AI, DEPI, ALX Africa)
- Certifications, skills, and languages loaded from `data/linkedin.json`
- Fetched via raw GitHub URL with local fallback for resilience

### Weather Widget
- Real-time weather for Banha, Egypt via OpenWeatherMap API
- Auto-updating temperature, description, and weather icons

### Contact Form
- Working contact form powered by FormSubmit.co (no backend required)
- AJAX submission — stays on page with success/error feedback
- Honeypot spam protection, auto-response, and styled email template
- Emails delivered to your inbox with one-time activation

### Icons & Typography
- Font Awesome 6.5.1 for UI icons
- Devicon 2.16.0 for skill/technology icons (C#, JS, HTML, SQL, Python, C++, Docker, Git)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (Cyberpunk theme, glassmorphism, animations) |
| Logic | Vanilla JavaScript ES6+ |
| APIs | GitHub REST API, OpenWeatherMap API |
| Data | LinkedIn JSON file served via GitHub raw URL |
| Forms | FormSubmit.co (AJAX, no backend) |
| Icons | Font Awesome 6.5.1, Devicon 2.16.0 |
| CI/CD | GitHub Actions → GitHub Pages |

## Project Structure

```
portfolio/
├── index.html                  # Main portfolio page
├── styles.css                  # Cyberpunk CSS (glassmorphism, neon, animations)
├── script.js                   # API integrations, dynamic rendering, interactions
├── data/
│   └── linkedin.json           # LinkedIn profile data (experience, certs, skills)
├── projects/
│   ├── Pixel Quest/            # JavaScript game
│   ├── 3D Transform Lib/       # 3D math library with tests
│   ├── todo-app/               # Todo application
│   ├── calculator/             # Calculator app
│   └── ...                     # Other sub-projects
└── .github/
    └── workflows/
        └── deploy.yml          # Auto-deploy to GitHub Pages
```

## Getting Started

No build step required — open `index.html` in any browser or visit the live site.

To run locally:
```bash
git clone https://github.com/ZyadKhaled-ZK/portfolio.git
cd portfolio
# Open index.html in your browser
```

## Customization

- **GitHub username**: Update `GITHUB_USERNAME` in `script.js`
- **Weather city**: Change the `q=` parameter in the weather API URL
- **LinkedIn data**: Edit `data/linkedin.json`
- **Contact email**: Update the FormSubmit action URL in `index.html`
- **Theme colors**: Modify CSS custom properties in `:root` in `styles.css`

## Browser Support

- Chrome ✅
- Firefox ✅
- Edge ✅
- Safari ✅
- Mobile browsers ✅

## License

© 2025 Zyad Khaled Mohamed Saad. All rights reserved.

---

*Built with passion for digital aesthetics and clean code.*
