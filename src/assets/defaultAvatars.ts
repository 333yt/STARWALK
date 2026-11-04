/**
 * STAR WALK Default Visual Assets (SVG Data URIs)
 * Ensures 100% stable offline rendering without broken images
 */

// Cute Star Idol Character SVG Data URI
const SVG_CHARACTER_IDOL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fce7f3"/>
      <stop offset="50%" stop-color="#f3e8ff"/>
      <stop offset="100%" stop-color="#e0e7ff"/>
    </linearGradient>
    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ec4899"/>
      <stop offset="50%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff5f5"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
    <linearGradient id="outfitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7e22ce"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Card -->
  <rect width="256" height="256" fill="url(#bgGrad)" rx="32"/>

  <!-- Background Decorative Stars -->
  <path d="M 40 40 L 43 49 L 52 52 L 43 55 L 40 64 L 37 55 L 28 52 L 37 49 Z" fill="#f472b6" opacity="0.6"/>
  <path d="M 215 50 L 217 56 L 223 58 L 217 60 L 215 66 L 213 60 L 207 58 L 213 56 Z" fill="#c084fc" opacity="0.7"/>
  <path d="M 30 180 L 32 185 L 37 187 L 32 189 L 30 194 L 28 189 L 23 187 L 28 185 Z" fill="#e879f9" opacity="0.5"/>
  <path d="M 220 170 L 222 174 L 226 176 L 222 178 L 220 182 L 218 178 L 214 176 L 218 174 Z" fill="#fb7185" opacity="0.6"/>

  <!-- Back Hair -->
  <path d="M 50 110 C 40 160 55 210 70 230 C 80 230 176 230 186 230 C 201 210 216 160 206 110 Z" fill="url(#hairGrad)"/>

  <!-- Body & Idol Outfit -->
  <path d="M 85 210 Q 128 190 171 210 L 180 256 L 76 256 Z" fill="url(#outfitGrad)"/>
  <!-- Collar ribbon -->
  <path d="M 112 210 Q 128 220 144 210 L 138 235 L 128 225 L 118 235 Z" fill="#ffffff"/>
  <circle cx="128" cy="216" r="4" fill="#fb7185"/>

  <!-- Neck -->
  <rect x="118" y="170" width="20" height="24" rx="10" fill="url(#skinGrad)"/>

  <!-- Ears -->
  <ellipse cx="76" cy="140" rx="9" ry="12" fill="url(#skinGrad)"/>
  <ellipse cx="180" cy="140" rx="9" ry="12" fill="url(#skinGrad)"/>
  <ellipse cx="76" cy="140" rx="5" ry="7" fill="#fbcfe8"/>
  <ellipse cx="180" cy="140" rx="5" ry="7" fill="#fbcfe8"/>

  <!-- Earrings -->
  <path d="M 74 152 L 76 160 L 78 152 Z" fill="#fbbf24"/>
  <path d="M 178 152 L 180 160 L 182 152 Z" fill="#fbbf24"/>

  <!-- Face Base -->
  <path d="M 78 120 C 78 175 178 175 178 120 C 178 90 78 90 78 120 Z" fill="url(#skinGrad)"/>

  <!-- Cheeks Blush -->
  <ellipse cx="96" cy="142" rx="12" ry="7" fill="#fda4af" opacity="0.65"/>
  <ellipse cx="160" cy="142" rx="12" ry="7" fill="#fda4af" opacity="0.65"/>

  <!-- Eyes -->
  <!-- Left Eye -->
  <ellipse cx="102" cy="132" rx="12" ry="16" fill="#1e1b4b"/>
  <ellipse cx="102" cy="134" rx="10" ry="13" fill="url(#eyeGrad)"/>
  <circle cx="98" cy="126" r="4.5" fill="#ffffff"/>
  <circle cx="106" cy="140" r="2.5" fill="#ffffff"/>
  <path d="M 88 120 Q 102 112 116 122" stroke="#312e81" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- Right Eye -->
  <ellipse cx="154" cy="132" rx="12" ry="16" fill="#1e1b4b"/>
  <ellipse cx="154" cy="134" rx="10" ry="13" fill="url(#eyeGrad)"/>
  <circle cx="150" cy="126" r="4.5" fill="#ffffff"/>
  <circle cx="158" cy="140" r="2.5" fill="#ffffff"/>
  <path d="M 140 122 Q 154 112 168 120" stroke="#312e81" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- Nose -->
  <circle cx="128" cy="138" r="1.5" fill="#f43f5e" opacity="0.6"/>

  <!-- Cute Smile -->
  <path d="M 120 148 Q 128 156 136 148" stroke="#e11d48" stroke-width="2.5" fill="none" stroke-linecap="round"/>

  <!-- Front Hair Bangs -->
  <path d="M 74 110 C 74 70 182 70 182 110 C 182 100 160 85 140 98 C 130 90 126 90 116 98 C 96 85 74 100 74 110 Z" fill="url(#hairGrad)"/>
  <path d="M 76 115 C 80 135 88 145 92 125 C 92 105 82 98 76 115 Z" fill="url(#hairGrad)"/>
  <path d="M 180 115 C 176 135 168 145 164 125 C 164 105 174 98 180 115 Z" fill="url(#hairGrad)"/>

  <!-- Star Hairpins -->
  <path d="M 86 82 L 89 90 L 97 92 L 91 97 L 93 105 L 86 100 L 79 105 L 81 97 L 75 92 L 83 90 Z" fill="#facc15" filter="url(#glow)"/>
  <path d="M 170 82 L 173 90 L 181 92 L 175 97 L 177 105 L 170 100 L 163 105 L 165 97 L 159 92 L 167 90 Z" fill="#facc15" filter="url(#glow)"/>

  <!-- Idol Headset Microphone -->
  <path d="M 72 135 Q 60 165 92 166" stroke="#94a3b8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="94" cy="166" r="4" fill="#ec4899"/>

  <!-- Sparkles on Hair -->
  <circle cx="110" cy="74" r="2" fill="#ffffff"/>
  <circle cx="150" cy="74" r="2.5" fill="#ffffff"/>
</svg>`;

export const DEFAULT_CHARACTER_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(SVG_CHARACTER_IDOL)}`;

// Stage Concert Cover SVG Data URI
const SVG_CONCERT_STAGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="600" height="350">
  <defs>
    <linearGradient id="stageBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="60%" stop-color="#311042"/>
      <stop offset="100%" stop-color="#701a75"/>
    </linearGradient>
    <linearGradient id="spotlightL" x1="0%" y1="0%" x2="40%" y2="100%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="spotlightR" x1="100%" y1="0%" x2="60%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="600" height="350" fill="url(#stageBg)"/>

  <!-- Spotlights -->
  <polygon points="50,0 200,350 100,350" fill="url(#spotlightL)"/>
  <polygon points="550,0 400,350 500,350" fill="url(#spotlightR)"/>

  <!-- Stage Floor -->
  <polygon points="0,260 600,260 600,350 0,350" fill="#1e1b4b"/>
  <line x1="0" y1="260" x2="600" y2="260" stroke="#f472b6" stroke-width="2"/>

  <!-- Stage Light Beams & Sparkles -->
  <circle cx="300" cy="180" r="80" fill="#f472b6" opacity="0.15" filter="blur(20px)"/>
  <text x="300" y="160" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">STAR STAGE</text>
  <text x="300" y="195" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#fbcfe8" text-anchor="middle">LIVE CONCERT TOUR</text>

  <!-- Cheering Crowd Silhouette -->
  <path d="M 0 350 L 0 300 Q 30 290 60 305 Q 90 280 120 300 Q 150 285 180 300 Q 210 290 240 310 Q 270 280 300 305 Q 330 285 360 310 Q 390 290 420 305 Q 450 280 480 300 Q 510 285 540 305 L 600 290 L 600 350 Z" fill="#090d16"/>

  <!-- Penlights / Lightsticks in crowd -->
  <circle cx="80" cy="280" r="3" fill="#f472b6"/>
  <circle cx="150" cy="270" r="3.5" fill="#c084fc"/>
  <circle cx="230" cy="275" r="3" fill="#38bdf8"/>
  <circle cx="350" cy="268" r="4" fill="#f472b6"/>
  <circle cx="430" cy="275" r="3" fill="#e879f9"/>
  <circle cx="510" cy="270" r="3" fill="#fb7185"/>
</svg>`;

export const DEFAULT_CONCERT_COVER = `data:image/svg+xml;utf8,${encodeURIComponent(SVG_CONCERT_STAGE)}`;
