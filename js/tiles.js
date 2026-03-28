/* ═══════════════════════════════════════════════════════════════
   tiles.js — D365 Practice Platform
   All tile SVG definitions and tile rendering logic.
   Depends on: config.js (must load first)
   ═══════════════════════════════════════════════════════════════ */

const Tiles = (function () {
  'use strict';

  const TILE_SVGS = {

    'cs-app': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <path d="M25 58 A30 30 0 0 1 85 58" stroke="#1D9E75" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="17" y="56" width="15" height="22" rx="5" stroke="#1D9E75" stroke-width="1.6"/>
      <rect x="21" y="60" width="7" height="14" rx="2" stroke="#0F6E56" stroke-width="1"/>
      <rect x="78" y="56" width="15" height="22" rx="5" stroke="#1D9E75" stroke-width="1.6"/>
      <rect x="82" y="60" width="7" height="14" rx="2" stroke="#0F6E56" stroke-width="1"/>
      <path d="M93 68 Q103 76 99 88" stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="94" y="86" width="10" height="6" rx="3" stroke="#1D9E75" stroke-width="1.4"/>
      <path d="M107 84 Q111 88 107 92" stroke="#0F6E56" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
      <circle cx="55" cy="30" r="2" fill="#1D9E75" opacity="0.7"/>
      <circle cx="55" cy="36" r="1.2" fill="#1D9E75" opacity="0.35"/>
    </svg>`,

    'solution-architect': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <g opacity="0.10" stroke="#378ADD" stroke-width="0.8">
        <line x1="10" y1="20" x2="100" y2="20"/><line x1="10" y1="38" x2="100" y2="38"/>
        <line x1="10" y1="56" x2="100" y2="56"/><line x1="10" y1="74" x2="100" y2="74"/>
        <line x1="10" y1="92" x2="100" y2="92"/><line x1="20" y1="10" x2="20" y2="100"/>
        <line x1="38" y1="10" x2="38" y2="100"/><line x1="56" y1="10" x2="56" y2="100"/>
        <line x1="74" y1="10" x2="74" y2="100"/><line x1="92" y1="10" x2="92" y2="100"/>
      </g>
      <polygon points="55,14 96,55 55,96 14,55" stroke="#378ADD" stroke-width="1.8" stroke-linejoin="round"/>
      <polygon points="55,30 80,55 55,80 30,55" stroke="#378ADD" stroke-width="1.2" stroke-linejoin="round" opacity="0.65"/>
      <polygon points="55,43 68,55 55,68 42,55" stroke="#378ADD" stroke-width="1" stroke-linejoin="round" opacity="0.4"/>
      <circle cx="55" cy="55" r="3" stroke="#378ADD" stroke-width="1.2"/>
    </svg>`,

    'pp-developer': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <line x1="8" y1="55" x2="102" y2="55" stroke="#7F77DD" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="55" y1="8" x2="55" y2="102" stroke="#7F77DD" stroke-width="1.4" stroke-linecap="round"/>
      <polyline points="28,55 28,30 40,30" stroke="#7F77DD" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="82,55 82,30 70,30" stroke="#7F77DD" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="28,55 28,80 40,80" stroke="#7F77DD" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="82,55 82,80 70,80" stroke="#7F77DD" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="40" cy="30" r="3.5" stroke="#7F77DD" stroke-width="1.4"/>
      <circle cx="70" cy="30" r="3.5" stroke="#7F77DD" stroke-width="1.4"/>
      <circle cx="40" cy="80" r="3.5" stroke="#7F77DD" stroke-width="1.4"/>
      <circle cx="70" cy="80" r="3.5" stroke="#7F77DD" stroke-width="1.4"/>
      <rect x="40" y="40" width="30" height="30" rx="3" stroke="#7F77DD" stroke-width="1.8"/>
      <line x1="48" y1="40" x2="48" y2="34" stroke="#7F77DD" stroke-width="1.2"/>
      <line x1="55" y1="40" x2="55" y2="34" stroke="#7F77DD" stroke-width="1.2"/>
      <line x1="62" y1="40" x2="62" y2="34" stroke="#7F77DD" stroke-width="1.2"/>
      <line x1="48" y1="70" x2="48" y2="76" stroke="#7F77DD" stroke-width="1.2"/>
      <line x1="55" y1="70" x2="55" y2="76" stroke="#7F77DD" stroke-width="1.2"/>
      <line x1="62" y1="70" x2="62" y2="76" stroke="#7F77DD" stroke-width="1.2"/>
      <circle cx="55" cy="55" r="1.5" fill="#7F77DD" opacity="0.6"/>
    </svg>`,

    'bpf': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="12" y="46" width="22" height="18" rx="3" stroke="#ffd166" stroke-width="1.6"/>
      <rect x="44" y="28" width="22" height="18" rx="3" stroke="#ffd166" stroke-width="1.6"/>
      <rect x="44" y="64" width="22" height="18" rx="3" stroke="#ffd166" stroke-width="1.6"/>
      <rect x="76" y="46" width="22" height="18" rx="3" stroke="#ffd166" stroke-width="1.6"/>
      <line x1="34" y1="55" x2="44" y2="37" stroke="#ffd166" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="34" y1="55" x2="44" y2="73" stroke="#ffd166" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="66" y1="37" x2="76" y2="55" stroke="#ffd166" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="66" y1="73" x2="76" y2="55" stroke="#ffd166" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="23" cy="55" r="2" fill="#ffd166" opacity="0.7"/>
      <circle cx="87" cy="55" r="2" fill="#ffd166" opacity="0.7"/>
    </svg>`,

    'cases': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="20" y="18" width="70" height="78" rx="4" stroke="#ff6b35" stroke-width="1.6"/>
      <rect x="36" y="10" width="38" height="16" rx="3" stroke="#ff6b35" stroke-width="1.4"/>
      <line x1="33" y1="44" x2="77" y2="44" stroke="#ff6b35" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="33" y1="57" x2="77" y2="57" stroke="#ff6b35" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="33" y1="70" x2="60" y2="70" stroke="#ff6b35" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="28" cy="44" r="2.5" fill="#ff6b35" opacity="0.8"/>
      <circle cx="28" cy="57" r="2.5" fill="#ff6b35" opacity="0.8"/>
      <circle cx="28" cy="70" r="2.5" fill="#ff6b35" opacity="0.4"/>
    </svg>`,

    'queues': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="68" y="22" width="28" height="18" rx="3" stroke="#00e5ff" stroke-width="1.5"/>
      <rect x="68" y="46" width="28" height="18" rx="3" stroke="#00e5ff" stroke-width="1.5"/>
      <rect x="68" y="70" width="28" height="18" rx="3" stroke="#00e5ff" stroke-width="1.5"/>
      <rect x="14" y="46" width="34" height="22" rx="4" stroke="#00e5ff" stroke-width="1.6"/>
      <line x1="48" y1="57" x2="68" y2="31" stroke="#00e5ff" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
      <line x1="48" y1="57" x2="68" y2="55" stroke="#00e5ff" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="48" y1="57" x2="68" y2="79" stroke="#00e5ff" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
      <circle cx="31" cy="57" r="3" fill="#00e5ff" opacity="0.8"/>
    </svg>`,

    'sla': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <circle cx="55" cy="55" r="36" stroke="#7fff6b" stroke-width="1.6"/>
      <circle cx="55" cy="55" r="27" stroke="#7fff6b" stroke-width="0.8" opacity="0.35"/>
      <line x1="55" y1="20" x2="55" y2="27" stroke="#7fff6b" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="55" y1="83" x2="55" y2="90" stroke="#7fff6b" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="19" y1="55" x2="26" y2="55" stroke="#7fff6b" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="84" y1="55" x2="91" y2="55" stroke="#7fff6b" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="55" y1="55" x2="55" y2="33" stroke="#7fff6b" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="55" y1="55" x2="73" y2="63" stroke="#7fff6b" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="55" cy="55" r="3" fill="#7fff6b"/>
    </svg>`,

    'knowledge': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="22" y="15" width="52" height="68" rx="4" stroke="#378ADD" stroke-width="1.6"/>
      <rect x="16" y="22" width="52" height="68" rx="4" stroke="#378ADD" stroke-width="1.2" opacity="0.4"/>
      <line x1="32" y1="35" x2="62" y2="35" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="32" y1="45" x2="62" y2="45" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="32" y1="55" x2="50" y2="55" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="56" cy="62" r="10" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="63" y1="69" x2="70" y2="76" stroke="#378ADD" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    'rcrules': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="15" y="30" width="35" height="28" rx="3" stroke="#ff6b35" stroke-width="1.5"/>
      <rect x="60" y="30" width="35" height="28" rx="3" stroke="#ff6b35" stroke-width="1.5"/>
      <line x1="50" y1="44" x2="60" y2="44" stroke="#ff6b35" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="56" y1="40" x2="62" y2="44" stroke="#ff6b35" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="56" y1="48" x2="62" y2="44" stroke="#ff6b35" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="22" y1="42" x2="42" y2="42" stroke="#ff6b35" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
      <line x1="22" y1="48" x2="36" y2="48" stroke="#ff6b35" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
      <line x1="67" y1="42" x2="87" y2="42" stroke="#ff6b35" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
      <line x1="67" y1="48" x2="80" y2="48" stroke="#ff6b35" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
      <path d="M55 68 L55 82 M49 77 L55 82 L61 77" fill="none" stroke="#ff6b35" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    </svg>`,

    'timeline': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <line x1="30" y1="25" x2="30" y2="90" stroke="#aa77ff" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="30" cy="35" r="5" stroke="#aa77ff" stroke-width="1.5"/>
      <circle cx="30" cy="55" r="5" stroke="#aa77ff" stroke-width="1.5"/>
      <circle cx="30" cy="75" r="5" stroke="#aa77ff" stroke-width="1.5" opacity="0.4"/>
      <rect x="42" y="30" width="52" height="10" rx="2" stroke="#aa77ff" stroke-width="1.2"/>
      <rect x="42" y="50" width="40" height="10" rx="2" stroke="#aa77ff" stroke-width="1.2"/>
      <rect x="42" y="70" width="30" height="10" rx="2" stroke="#aa77ff" stroke-width="1.2" opacity="0.4"/>
      <circle cx="30" cy="35" r="2" fill="#aa77ff"/>
      <circle cx="30" cy="55" r="2" fill="#aa77ff"/>
    </svg>`,

    'usermgmt': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <circle cx="55" cy="32" r="14" stroke="#1D9E75" stroke-width="1.6"/>
      <path d="M22 88 C22 70 88 70 88 88" stroke="#1D9E75" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <circle cx="28" cy="52" r="8" stroke="#1D9E75" stroke-width="1.2" opacity="0.5"/>
      <circle cx="82" cy="52" r="8" stroke="#1D9E75" stroke-width="1.2" opacity="0.5"/>
      <rect x="46" y="56" width="18" height="12" rx="2" stroke="#1D9E75" stroke-width="1.2"/>
      <line x1="50" y1="60" x2="54" y2="64" stroke="#1D9E75" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="58" y1="60" x2="54" y2="64" stroke="#1D9E75" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,

    'delegation': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <line x1="55" y1="15" x2="55" y2="95" stroke="#00e5ff" stroke-width="1.2" opacity="0.3"/>
      <line x1="15" y1="55" x2="95" y2="55" stroke="#00e5ff" stroke-width="1.2" opacity="0.3"/>
      <rect x="30" y="30" width="22" height="22" rx="3" stroke="#00e5ff" stroke-width="1.6"/>
      <rect x="58" y="30" width="22" height="22" rx="3" stroke="#00e5ff" stroke-width="1.6"/>
      <rect x="30" y="58" width="22" height="22" rx="3" stroke="#00e5ff" stroke-width="1" opacity="0.35"/>
      <rect x="58" y="58" width="22" height="22" rx="3" stroke="#00e5ff" stroke-width="1" opacity="0.35"/>
      <circle cx="41" cy="41" r="3" fill="#00e5ff"/>
      <circle cx="69" cy="41" r="3" fill="#00e5ff" opacity="0.35"/>
    </svg>`,

    'powerfx': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="15" y="20" width="80" height="70" rx="5" stroke="#7F77DD" stroke-width="1.5"/>
      <line x1="15" y1="36" x2="95" y2="36" stroke="#7F77DD" stroke-width="0.8" opacity="0.5"/>
      <circle cx="26" cy="28" r="3" fill="#ff4d6d" opacity="0.7"/>
      <circle cx="37" cy="28" r="3" fill="#ffd166" opacity="0.7"/>
      <circle cx="48" cy="28" r="3" fill="#7fff6b" opacity="0.7"/>
      <text x="24" y="53" font-family="monospace" font-size="13" fill="#7F77DD" opacity="0.9">If(</text>
      <text x="24" y="67" font-family="monospace" font-size="11" fill="#7F77DD" opacity="0.6">  x &gt; 0,</text>
      <text x="24" y="80" font-family="monospace" font-size="11" fill="#7F77DD" opacity="0.4">  true</text>
    </svg>`,

    'canvasui': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="12" y="12" width="86" height="86" rx="5" stroke="#aa77ff" stroke-width="1.5"/>
      <rect x="20" y="20" width="30" height="36" rx="3" stroke="#aa77ff" stroke-width="1.3"/>
      <rect x="58" y="20" width="32" height="16" rx="3" stroke="#aa77ff" stroke-width="1.3"/>
      <rect x="58" y="42" width="32" height="14" rx="3" stroke="#aa77ff" stroke-width="1.3" opacity="0.5"/>
      <rect x="20" y="62" width="70" height="26" rx="3" stroke="#aa77ff" stroke-width="1.3" opacity="0.4"/>
      <line x1="25" y1="71" x2="55" y2="71" stroke="#aa77ff" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
      <line x1="25" y1="78" x2="44" y2="78" stroke="#aa77ff" stroke-width="1" stroke-linecap="round" opacity="0.3"/>
    </svg>`,

    'automate': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <circle cx="28" cy="28" r="12" stroke="#378ADD" stroke-width="1.5"/>
      <circle cx="82" cy="55" r="12" stroke="#378ADD" stroke-width="1.5"/>
      <circle cx="28" cy="82" r="12" stroke="#378ADD" stroke-width="1.5" opacity="0.5"/>
      <path d="M40 28 Q55 28 55 42 Q55 55 70 55" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round" fill="none"/>
      <path d="M40 82 Q55 82 55 68 Q55 55 70 55" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.5"/>
      <line x1="76" y1="50" x2="82" y2="43" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="88" y1="50" x2="82" y2="43" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,

    'dataverse': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <ellipse cx="55" cy="30" rx="38" ry="13" stroke="#1D9E75" stroke-width="1.5"/>
      <ellipse cx="55" cy="55" rx="38" ry="13" stroke="#1D9E75" stroke-width="1.5" opacity="0.6"/>
      <ellipse cx="55" cy="80" rx="38" ry="13" stroke="#1D9E75" stroke-width="1.5" opacity="0.3"/>
      <line x1="17" y1="30" x2="17" y2="80" stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="93" y1="30" x2="93" y2="80" stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    'archlimits': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <line x1="20" y1="90" x2="90" y2="90" stroke="#ff4d6d" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="20" y1="90" x2="20" y2="20" stroke="#ff4d6d" stroke-width="1.5" stroke-linecap="round"/>
      <polyline points="20,85 35,70 50,75 65,50 80,30" stroke="#ff4d6d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="65" y1="20" x2="65" y2="90" stroke="#ff4d6d" stroke-width="1" stroke-dasharray="4 3" opacity="0.5"/>
      <circle cx="80" cy="30" r="3" fill="#ff4d6d"/>
    </svg>`,

    'mdaconfig': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="14" y="14" width="36" height="30" rx="3" stroke="#aa77ff" stroke-width="1.6"/>
      <rect x="60" y="14" width="36" height="30" rx="3" stroke="#aa77ff" stroke-width="1.6"/>
      <rect x="14" y="66" width="36" height="30" rx="3" stroke="#aa77ff" stroke-width="1" opacity="0.4"/>
      <rect x="60" y="66" width="36" height="30" rx="3" stroke="#aa77ff" stroke-width="1" opacity="0.4"/>
      <line x1="50" y1="29" x2="60" y2="29" stroke="#aa77ff" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="32" y1="44" x2="32" y2="66" stroke="#aa77ff" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="78" y1="44" x2="78" y2="66" stroke="#aa77ff" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="20" y1="24" x2="42" y2="24" stroke="#aa77ff" stroke-width="1" opacity="0.5" stroke-linecap="round"/>
      <line x1="66" y1="24" x2="88" y2="24" stroke="#aa77ff" stroke-width="1" opacity="0.5" stroke-linecap="round"/>
    </svg>`,

    'sol-envisioning': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <circle cx="55" cy="48" r="26" stroke="#378ADD" stroke-width="1.6"/>
      <path d="M42 62 Q55 75 68 62" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round" fill="none"/>
      <circle cx="47" cy="44" r="4" stroke="#378ADD" stroke-width="1.3"/>
      <circle cx="63" cy="44" r="4" stroke="#378ADD" stroke-width="1.3"/>
      <circle cx="47" cy="44" r="1.5" fill="#378ADD"/>
      <circle cx="63" cy="44" r="1.5" fill="#378ADD"/>
      <line x1="55" y1="22" x2="55" y2="15" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="55" y1="74" x2="55" y2="92" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="42" y1="88" x2="68" y2="88" stroke="#378ADD" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
    </svg>`,

    'arc-solution': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <polygon points="55,14 96,55 55,96 14,55" stroke="#378ADD" stroke-width="1.8" stroke-linejoin="round"/>
      <polygon points="55,30 80,55 55,80 30,55" stroke="#378ADD" stroke-width="1.2" stroke-linejoin="round" opacity="0.6"/>
      <polygon points="55,43 68,55 55,67 42,55" stroke="#378ADD" stroke-width="1" stroke-linejoin="round" opacity="0.35"/>
      <circle cx="55" cy="55" r="3" stroke="#378ADD" stroke-width="1.2"/>
    </svg>`,

    'impl-solution': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="20" y="20" width="70" height="70" rx="5" stroke="#378ADD" stroke-width="1.5"/>
      <line x1="20" y1="42" x2="90" y2="42" stroke="#378ADD" stroke-width="0.8" opacity="0.4"/>
      <polyline points="32,65 44,54 56,60 68,46 78,52" stroke="#378ADD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="78" cy="52" r="3" fill="#378ADD"/>
    </svg>`,

    'sol-initiate': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <circle cx="55" cy="55" r="30" stroke="#378ADD" stroke-width="1.5"/>
      <path d="M42 38 L55 28 L68 38" fill="none" stroke="#378ADD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="55" y1="28" x2="55" y2="72" stroke="#378ADD" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="42" y1="55" x2="68" y2="55" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="42" y1="65" x2="68" y2="65" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
    </svg>`,

    'sol-eval-biz': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="20" y="25" width="70" height="60" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="20" y1="42" x2="90" y2="42" stroke="#378ADD" stroke-width="0.8" opacity="0.4"/>
      <line x1="30" y1="55" x2="55" y2="55" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="30" y1="65" x2="65" y2="65" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="30" y1="75" x2="48" y2="75" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
      <path d="M68 50 L78 55 L68 60" fill="none" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="60" y1="55" x2="77" y2="55" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`,

    'sol-identify-components': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="38" y="15" width="34" height="22" rx="3" stroke="#378ADD" stroke-width="1.5"/>
      <rect x="15" y="73" width="24" height="22" rx="3" stroke="#378ADD" stroke-width="1.3"/>
      <rect x="43" y="73" width="24" height="22" rx="3" stroke="#378ADD" stroke-width="1.3"/>
      <rect x="71" y="73" width="24" height="22" rx="3" stroke="#378ADD" stroke-width="1.3"/>
      <line x1="55" y1="37" x2="55" y2="55" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="27" y1="55" x2="83" y2="55" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="27" y1="55" x2="27" y2="73" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="55" y1="55" x2="55" y2="73" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="83" y1="55" x2="83" y2="73" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`,

    'sol-select-components': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="18" y="25" width="74" height="60" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="18" y1="45" x2="92" y2="45" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <line x1="18" y1="65" x2="92" y2="65" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <circle cx="34" cy="35" r="5" stroke="#378ADD" stroke-width="1.3"/>
      <circle cx="34" cy="55" r="5" stroke="#378ADD" stroke-width="1.3"/>
      <circle cx="34" cy="75" r="5" fill="#378ADD"/>
      <line x1="45" y1="35" x2="82" y2="35" stroke="#378ADD" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
      <line x1="45" y1="55" x2="82" y2="55" stroke="#378ADD" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
      <line x1="45" y1="75" x2="82" y2="75" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`,

    'sol-migration': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="12" y="38" width="32" height="34" rx="4" stroke="#378ADD" stroke-width="1.5"/>
      <rect x="66" y="38" width="32" height="34" rx="4" stroke="#378ADD" stroke-width="1.5"/>
      <path d="M44 50 L66 50" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M60 46 L66 50 L60 54" fill="none" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M44 62 L66 62" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round" opacity="0.5"/>
      <path d="M50 58 L44 62 L50 66" fill="none" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    </svg>`,

    'sol-org-info': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <line x1="20" y1="90" x2="90" y2="90" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="20" y1="90" x2="20" y2="20" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round"/>
      <rect x="28" y="60" width="14" height="30" rx="2" stroke="#378ADD" stroke-width="1.3"/>
      <rect x="48" y="45" width="14" height="45" rx="2" stroke="#378ADD" stroke-width="1.3"/>
      <rect x="68" y="30" width="14" height="60" rx="2" stroke="#378ADD" stroke-width="1.3"/>
      <circle cx="35" cy="57" r="2" fill="#378ADD"/>
      <circle cx="55" cy="42" r="2" fill="#378ADD"/>
      <circle cx="75" cy="27" r="2" fill="#378ADD"/>
    </svg>`,

    'sol-current-state': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="15" y="30" width="80" height="50" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="15" y1="47" x2="95" y2="47" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <polyline points="25,65 38,58 52,62 66,52 80,56" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="25" cy="65" r="2" fill="#378ADD"/>
      <circle cx="52" cy="62" r="2" fill="#378ADD"/>
      <circle cx="80" cy="56" r="2" fill="#378ADD"/>
    </svg>`,

    'sol-org-risk': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <polygon points="55,18 95,85 15,85" stroke="#378ADD" stroke-width="1.6" stroke-linejoin="round" fill="none"/>
      <line x1="55" y1="38" x2="55" y2="65" stroke="#378ADD" stroke-width="2" stroke-linecap="round"/>
      <circle cx="55" cy="74" r="3" fill="#378ADD"/>
    </svg>`,

    'sol-success-criteria': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <circle cx="55" cy="55" r="36" stroke="#378ADD" stroke-width="1.5"/>
      <circle cx="55" cy="55" r="24" stroke="#378ADD" stroke-width="1" opacity="0.5"/>
      <circle cx="55" cy="55" r="12" stroke="#378ADD" stroke-width="1" opacity="0.3"/>
      <circle cx="55" cy="55" r="4" fill="#378ADD"/>
      <line x1="55" y1="19" x2="55" y2="26" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="55" y1="84" x2="55" y2="91" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="19" y1="55" x2="26" y2="55" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="84" y1="55" x2="91" y2="55" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`,

    'sol-existing-systems': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="15" y="20" width="30" height="22" rx="3" stroke="#378ADD" stroke-width="1.3"/>
      <rect x="65" y="20" width="30" height="22" rx="3" stroke="#378ADD" stroke-width="1.3"/>
      <rect x="15" y="68" width="30" height="22" rx="3" stroke="#378ADD" stroke-width="1.3" opacity="0.5"/>
      <rect x="65" y="68" width="30" height="22" rx="3" stroke="#378ADD" stroke-width="1.3" opacity="0.5"/>
      <circle cx="55" cy="55" r="12" stroke="#378ADD" stroke-width="1.5"/>
      <line x1="45" y1="31" x2="55" y2="45" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="65" y1="31" x2="55" y2="45" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="45" y1="79" x2="55" y2="67" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
      <line x1="65" y1="79" x2="55" y2="67" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
    </svg>`,

    'sol-enterprise-arch': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="20" y="20" width="70" height="70" rx="5" stroke="#378ADD" stroke-width="1.5"/>
      <rect x="30" y="30" width="20" height="16" rx="2" stroke="#378ADD" stroke-width="1.2"/>
      <rect x="60" y="30" width="20" height="16" rx="2" stroke="#378ADD" stroke-width="1.2"/>
      <rect x="30" y="64" width="20" height="16" rx="2" stroke="#378ADD" stroke-width="1.2" opacity="0.5"/>
      <rect x="60" y="64" width="20" height="16" rx="2" stroke="#378ADD" stroke-width="1.2" opacity="0.5"/>
      <line x1="50" y1="38" x2="60" y2="38" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="40" y1="46" x2="40" y2="64" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="70" y1="46" x2="70" y2="64" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,

    'sol-data-sources': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <ellipse cx="55" cy="35" rx="28" ry="10" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="27" y1="35" x2="27" y2="55" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="83" y1="35" x2="83" y2="55" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round"/>
      <ellipse cx="55" cy="55" rx="28" ry="10" stroke="#378ADD" stroke-width="1.4" opacity="0.6"/>
      <line x1="55" y1="65" x2="30" y2="85" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="55" y1="65" x2="55" y2="85" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="55" y1="65" x2="80" y2="85" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
    </svg>`,

    'sol-data-quality': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="18" y="22" width="74" height="66" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="18" y1="40" x2="92" y2="40" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <path d="M32 56 L42 50 L52 58 L62 46 L72 52 L80 47" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M35 68 L45 74 L55 66 L65 70 L78 63" stroke="#378ADD" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.45"/>
    </svg>`,

    'sol-capture-req': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="22" y="18" width="52" height="74" rx="4" stroke="#378ADD" stroke-width="1.5"/>
      <line x1="32" y1="36" x2="62" y2="36" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="32" y1="48" x2="62" y2="48" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="32" y1="60" x2="62" y2="60" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
      <line x1="32" y1="72" x2="50" y2="72" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.35"/>
      <path d="M72 55 Q85 45 88 58 Q88 72 72 80" stroke="#378ADD" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <circle cx="80" cy="67" r="2.5" fill="#378ADD"/>
    </svg>`,

    'sol-refine-req': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="18" y="25" width="74" height="60" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="18" y1="42" x2="92" y2="42" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <line x1="28" y1="54" x2="82" y2="54" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="28" y1="64" x2="70" y2="64" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
      <line x1="28" y1="74" x2="55" y2="74" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
      <path d="M76 58 Q84 62 76 70" stroke="#378ADD" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    </svg>`,

    'sol-functional-req': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="15" y="22" width="80" height="66" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="15" y1="40" x2="95" y2="40" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <line x1="55" y1="22" x2="55" y2="88" stroke="#378ADD" stroke-width="0.8" opacity="0.25"/>
      <line x1="25" y1="52" x2="45" y2="52" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="25" y1="62" x2="45" y2="62" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
      <line x1="25" y1="72" x2="38" y2="72" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.35"/>
      <line x1="65" y1="52" x2="85" y2="52" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="65" y1="62" x2="82" y2="62" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
      <line x1="65" y1="72" x2="75" y2="72" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.35"/>
    </svg>`,

    'sol-nonfunctional-req': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="22" y="20" width="66" height="70" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <path d="M38 45 L55 32 L72 45" fill="none" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="55" y1="32" x2="55" y2="75" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="38" y1="57" x2="72" y2="57" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
      <line x1="38" y1="67" x2="72" y2="67" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.3"/>
    </svg>`,

    'sol-future-biz': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <path d="M20 75 Q35 40 55 35 Q75 30 90 55" stroke="#378ADD" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M20 85 Q35 60 55 55 Q75 50 90 65" stroke="#378ADD" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.4"/>
      <circle cx="55" cy="35" r="5" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="55" y1="30" x2="55" y2="18" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="49" y1="22" x2="55" y2="18" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="61" y1="22" x2="55" y2="18" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,

    'sol-fitgap': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="15" y="30" width="34" height="50" rx="3" stroke="#378ADD" stroke-width="1.4"/>
      <rect x="61" y="30" width="34" height="50" rx="3" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="49" y1="45" x2="61" y2="45" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="49" y1="55" x2="61" y2="55" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="49" y1="65" x2="61" y2="65" stroke="#378ADD" stroke-width="0.8" stroke-linecap="round" stroke-dasharray="3 2" opacity="0.6"/>
      <line x1="49" y1="72" x2="61" y2="72" stroke="#378ADD" stroke-width="0.8" stroke-linecap="round" stroke-dasharray="3 2" opacity="0.35"/>
    </svg>`,

    'sol-feasibility': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <line x1="55" y1="20" x2="55" y2="90" stroke="#378ADD" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="22" y="35" width="30" height="16" rx="3" stroke="#378ADD" stroke-width="1.3"/>
      <rect x="22" y="58" width="30" height="16" rx="3" stroke="#378ADD" stroke-width="1.3" opacity="0.5"/>
      <rect x="58" y="35" width="30" height="16" rx="3" stroke="#378ADD" stroke-width="1.3"/>
      <rect x="58" y="58" width="30" height="16" rx="3" stroke="#378ADD" stroke-width="1.3" opacity="0.5"/>
      <line x1="30" y1="28" x2="80" y2="28" stroke="#378ADD" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
    </svg>`,

    'sol-functional-gaps': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="15" y="25" width="80" height="60" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="15" y1="43" x2="95" y2="43" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <line x1="30" y1="55" x2="48" y2="55" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="62" y1="55" x2="80" y2="55" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M48 51 L48 59" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="3 3"/>
      <path d="M62 51 L62 59" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="3 3"/>
      <path d="M50 55 Q55 50 60 55 Q55 60 50 55" fill="none" stroke="#378ADD" stroke-width="1.2"/>
      <line x1="30" y1="68" x2="80" y2="68" stroke="#378ADD" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
    </svg>`,

    'arc-lead-design': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="15" y="15" width="80" height="80" rx="5" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="15" y1="38" x2="95" y2="38" stroke="#378ADD" stroke-width="0.8" opacity="0.4"/>
      <circle cx="55" cy="26" r="6" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="28" y1="52" x2="82" y2="52" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="28" y1="65" x2="65" y2="65" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="28" y1="75" x2="55" y2="75" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round" opacity="0.5"/>
      <line x1="75" y1="62" x2="83" y2="70" stroke="#378ADD" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    'impl-validate-design': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="20" y="22" width="70" height="66" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <path d="M36 55 L48 67 L74 43" stroke="#378ADD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,

    'impl-eval-design': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="18" y="20" width="74" height="70" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="18" y1="40" x2="92" y2="40" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <line x1="30" y1="54" x2="80" y2="54" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="30" y1="64" x2="65" y2="64" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
      <circle cx="72" cy="70" r="10" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="79" y1="77" x2="86" y2="84" stroke="#378ADD" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    'impl-api-limits': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="18" y="25" width="74" height="60" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="18" y1="43" x2="92" y2="43" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <rect x="28" y="52" width="16" height="24" rx="2" stroke="#378ADD" stroke-width="1.2"/>
      <rect x="50" y="40" width="16" height="36" rx="2" stroke="#378ADD" stroke-width="1.2"/>
      <rect x="72" y="33" width="10" height="43" rx="2" stroke="#378ADD" stroke-width="1.5"/>
      <line x1="72" y1="33" x2="72" y2="29" stroke="#378ADD" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.6"/>
    </svg>`,

    'impl-perf-impact': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <circle cx="55" cy="55" r="34" stroke="#378ADD" stroke-width="1.5"/>
      <path d="M55 55 L55 28" stroke="#378ADD" stroke-width="2" stroke-linecap="round"/>
      <path d="M55 55 L76 44" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="55" cy="55" r="4" fill="#378ADD"/>
      <path d="M30 82 A34 34 0 0 1 80 82" stroke="#378ADD" stroke-width="1" opacity="0.4" fill="none"/>
    </svg>`,

    'impl-automation-conf': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <circle cx="35" cy="40" r="12" stroke="#378ADD" stroke-width="1.4"/>
      <circle cx="75" cy="40" r="12" stroke="#378ADD" stroke-width="1.4"/>
      <path d="M47 40 Q55 30 63 40" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" fill="none"/>
      <path d="M47 40 Q55 50 63 40" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.5"/>
      <line x1="35" y1="52" x2="35" y2="80" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="75" y1="52" x2="75" y2="80" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="28" y1="80" x2="42" y2="80" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="68" y1="80" x2="82" y2="80" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,

    'impl-integration-conf': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="15" y="38" width="26" height="34" rx="3" stroke="#378ADD" stroke-width="1.4"/>
      <rect x="69" y="38" width="26" height="34" rx="3" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="41" y1="52" x2="55" y2="52" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="55" y1="60" x2="69" y2="60" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="55" cy="55" r="6" stroke="#378ADD" stroke-width="1.3"/>
    </svg>`,

    'impl-golive': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <path d="M55 85 L35 55 L45 55 L38 25 L72 25 L65 55 L75 55 Z" stroke="#378ADD" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
      <circle cx="55" cy="72" r="3" fill="#378ADD"/>
      <line x1="55" y1="48" x2="55" y2="64" stroke="#378ADD" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    'impl-perf-issues': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <line x1="20" y1="88" x2="90" y2="88" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="20" y1="88" x2="20" y2="20" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round"/>
      <polyline points="28,80 38,68 48,72 58,45 68,60 80,30" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="58" cy="45" r="3.5" stroke="#378ADD" stroke-width="1.3"/>
      <line x1="58" y1="30" x2="58" y2="41" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="3 2"/>
    </svg>`,

    'impl-data-mig-issues': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="18" y="25" width="74" height="60" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="18" y1="43" x2="92" y2="43" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <path d="M35 56 L45 56 L50 62 L55 50 L60 62 L65 56 L75 56" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="55" y1="68" x2="55" y2="75" stroke="#378ADD" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="55" cy="78" r="2.5" fill="#378ADD"/>
    </svg>`,

    'impl-deploy-issues': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="25" y="20" width="60" height="42" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="35" y1="33" x2="75" y2="33" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="35" y1="43" x2="60" y2="43" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
      <line x1="55" y1="62" x2="55" y2="78" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="35" y1="78" x2="75" y2="78" stroke="#378ADD" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="35" y1="78" x2="35" y2="88" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="55" y1="78" x2="55" y2="88" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="75" y1="78" x2="75" y2="88" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,

    'impl-golive-readiness': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="18" y="22" width="74" height="66" rx="4" stroke="#378ADD" stroke-width="1.4"/>
      <line x1="18" y1="40" x2="92" y2="40" stroke="#378ADD" stroke-width="0.8" opacity="0.35"/>
      <circle cx="35" cy="57" r="5" stroke="#378ADD" stroke-width="1.3"/>
      <circle cx="35" cy="57" r="1.5" fill="#378ADD"/>
      <line x1="40" y1="57" x2="82" y2="57" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="35" cy="72" r="5" stroke="#378ADD" stroke-width="1.3"/>
      <circle cx="35" cy="72" r="1.5" fill="#378ADD"/>
      <line x1="40" y1="72" x2="72" y2="72" stroke="#378ADD" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M70 50 L76 56 L84 47" stroke="#378ADD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,

    'technicalconsultant': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="20" y="25" width="70" height="60" rx="5" stroke="#ffd166" stroke-width="1.5"/>
      <line x1="20" y1="43" x2="90" y2="43" stroke="#ffd166" stroke-width="0.8" opacity="0.4"/>
      <circle cx="32" cy="34" r="4" stroke="#ffd166" stroke-width="1.3"/>
      <line x1="40" y1="34" x2="82" y2="34" stroke="#ffd166" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
      <line x1="30" y1="55" x2="80" y2="55" stroke="#ffd166" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="30" y1="65" x2="80" y2="65" stroke="#ffd166" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="30" y1="75" x2="60" y2="75" stroke="#ffd166" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
      <path d="M78 72 L83 77 L93 62" stroke="#ffd166" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,

    'kpmg-mbs': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <rect x="18" y="18" width="74" height="74" rx="5" stroke="#ff6b35" stroke-width="1.5"/>
      <line x1="18" y1="46" x2="92" y2="46" stroke="#ff6b35" stroke-width="0.8" opacity="0.3"/>
      <line x1="18" y1="64" x2="92" y2="64" stroke="#ff6b35" stroke-width="0.8" opacity="0.3"/>
      <line x1="46" y1="18" x2="46" y2="92" stroke="#ff6b35" stroke-width="0.8" opacity="0.3"/>
      <rect x="26" y="26" width="12" height="12" rx="2" stroke="#ff6b35" stroke-width="1.2"/>
      <rect x="26" y="52" width="12" height="12" rx="2" stroke="#ff6b35" stroke-width="1.2" opacity="0.6"/>
      <rect x="26" y="70" width="12" height="12" rx="2" stroke="#ff6b35" stroke-width="1.2" opacity="0.3"/>
      <line x1="44" y1="32" x2="82" y2="32" stroke="#ff6b35" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="44" y1="58" x2="76" y2="58" stroke="#ff6b35" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
      <line x1="44" y1="76" x2="68" y2="76" stroke="#ff6b35" stroke-width="1.2" stroke-linecap="round" opacity="0.3"/>
    </svg>`,

    'kpmg-ii-advanced': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
      <polygon points="55,18 68,42 95,46 75,65 80,92 55,78 30,92 35,65 15,46 42,42" stroke="#7F77DD" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
      <polygon points="55,34 63,48 78,50 67,61 70,76 55,68 40,76 43,61 32,50 47,48" stroke="#7F77DD" stroke-width="1" stroke-linejoin="round" fill="none" opacity="0.5"/>
      <circle cx="55" cy="55" r="6" stroke="#7F77DD" stroke-width="1.3"/>
      <circle cx="55" cy="55" r="2" fill="#7F77DD"/>
    </svg>`,
  };

  const TILE_ACCENTS = {
    'cs-app': '#1D9E75', 'solution-architect': '#378ADD', 'pp-developer': '#7F77DD',
    'bpf': '#ffd166', 'cases': '#ff6b35', 'queues': '#00e5ff', 'sla': '#7fff6b',
    'knowledge': '#378ADD', 'rcrules': '#ff6b35', 'timeline': '#aa77ff',
    'usermgmt': '#1D9E75', 'delegation': '#00e5ff', 'powerfx': '#7F77DD',
    'canvasui': '#aa77ff', 'automate': '#378ADD', 'dataverse': '#1D9E75',
    'archlimits': '#ff4d6d', 'mdaconfig': '#aa77ff',
    'sol-envisioning': '#378ADD', 'arc-solution': '#378ADD', 'impl-solution': '#378ADD',
    'sol-initiate': '#378ADD', 'sol-eval-biz': '#378ADD',
    'sol-identify-components': '#378ADD', 'sol-select-components': '#378ADD',
    'sol-migration': '#378ADD', 'sol-org-info': '#378ADD', 'sol-current-state': '#378ADD',
    'sol-org-risk': '#378ADD', 'sol-success-criteria': '#378ADD',
    'sol-existing-systems': '#378ADD', 'sol-enterprise-arch': '#378ADD',
    'sol-data-sources': '#378ADD', 'sol-data-quality': '#378ADD',
    'sol-capture-req': '#378ADD', 'sol-refine-req': '#378ADD',
    'sol-functional-req': '#378ADD', 'sol-nonfunctional-req': '#378ADD',
    'sol-future-biz': '#378ADD', 'sol-fitgap': '#378ADD', 'sol-feasibility': '#378ADD',
    'sol-functional-gaps': '#378ADD', 'arc-lead-design': '#378ADD',
    'impl-validate-design': '#378ADD', 'impl-eval-design': '#378ADD',
    'impl-api-limits': '#378ADD', 'impl-perf-impact': '#378ADD',
    'impl-automation-conf': '#378ADD', 'impl-integration-conf': '#378ADD',
    'impl-golive': '#378ADD', 'impl-perf-issues': '#378ADD',
    'impl-data-mig-issues': '#378ADD', 'impl-deploy-issues': '#378ADD',
    'impl-golive-readiness': '#378ADD',
    'technicalconsultant': '#ffd166', 'kpmg-mbs': '#ff6b35', 'kpmg-ii-advanced': '#7F77DD',
  };

  function _svg(id)    { return TILE_SVGS[id] || TILE_SVGS['sol-initiate']; }
  function _accent(id) { return TILE_ACCENTS[id] || 'var(--accent)'; }

  function groupTile(group) {
    const accent = _accent(group.id);
    const count  = (group.subtopics || []).length + (group.subgroups || []).length;
    return `<div class="gtile gtile--${group.id}" onclick="window.openGroup('${group.id}')" style="--gtile-accent:${accent}">
        <div class="gtile__icon">${_svg(group.id)}</div>
        <div class="gtile__label">${group.title}</div>
        <div class="gtile__count">${count} topics</div>
        <div class="gtile__tooltip"><strong>${group.title}</strong>${group.desc || ''}</div>
      </div>`;
  }

  function topicTile(topic, locked, best) {
    const accent   = _accent(topic.id);
    const action   = locked ? 'window.openLicenceModal()' : `window.selectTopic('${topic.id}')`;
    const bestHtml = best !== undefined ? `<div class="gtile__count" style="margin-top:4px;color:var(--muted)">Best: ${best}/1000</div>` : '';
    const lockBadge = locked ? `<div class="gtile__lock-badge">LOCKED</div>` : '';
    return `<div class="gtile" onclick="${action}" style="--gtile-accent:${accent}">
        <div class="gtile__icon">${_svg(topic.id)}</div>
        <div class="gtile__label">${topic.title}</div>
        <div class="gtile__count">${topic.desc ? topic.desc.split(',')[0].trim() : ''}</div>
        ${bestHtml}${lockBadge}
        <div class="gtile__tooltip"><strong>${topic.title}</strong>${topic.desc || ''}</div>
      </div>`;
  }

  function subgroupTile(sg, parentGroupId) {
    const accent = _accent(sg.id);
    return `<div class="gtile" onclick="window.openSubGroup('${sg.id}','${parentGroupId}')" style="--gtile-accent:${accent}">
        <div class="gtile__icon">${_svg(sg.id)}</div>
        <div class="gtile__label">${sg.title}</div>
        <div class="gtile__count">${(sg.subtopics || []).length} topics</div>
        <div class="gtile__tooltip"><strong>${sg.title}</strong>${sg.desc || ''}</div>
      </div>`;
  }

  function interviewTile(pack) {
    const accent = _accent(pack.id);
    return `<div class="gtile" onclick="window.loadInterviewPack('${pack.id}')" style="--gtile-accent:${accent}">
        <div class="gtile__icon">${_svg(pack.id)}</div>
        <div class="gtile__label">${pack.title}</div>
        <div class="gtile__count">Start session</div>
        <div class="gtile__tooltip"><strong>${pack.title}</strong>${pack.desc || 'AI-powered interview simulation'}</div>
      </div>`;
  }

  return { groupTile, topicTile, subgroupTile, interviewTile, svg: _svg, accent: _accent };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Tiles; }
else { window.Tiles = Tiles; }
