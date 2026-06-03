import { Injectable } from '@angular/core';

export const TEMAS = [
  { id: 'verde',   label: 'Verde SENA', color: '#007832' },
  { id: 'azul',    label: 'Azul',       color: '#1e40af' },
  { id: 'indigo',  label: 'Índigo',     color: '#6366f1' },
  { id: 'naranja', label: 'Naranja',    color: '#f97316' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {

  /** Lee localStorage y vuelca todos los overrides CSS en <style id="epsas-theme"> */
  apply(): void {
    const accent   = TEMAS.find(t => t.id === (localStorage.getItem('tema') ?? 'verde'))?.color ?? '#39A900';
    const dark     = localStorage.getItem('dark') === '1';
    const sizeMap: Record<string, string> = { small: '13px', normal: '15px', large: '17px' };
    const fontSize = sizeMap[localStorage.getItem('fontSize') ?? 'normal'] ?? '15px';

    const [r, g, b]     = this.hexToRgb(accent);
    const darkHex       = this.darken(accent);
    const [dr, dg, db]  = this.hexToRgb(darkHex);
    const lightHex      = this.lighten(accent);   // para hover:text-[#acd8a7]

    let el = document.getElementById('epsas-theme') as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = 'epsas-theme';
      document.head.appendChild(el);
    }

    el.textContent = `
/* ═══════════════════════════════════════════════════════════
   EPSAS Theme  —  generado por ThemeService
   Accent: ${accent}   Dark: ${darkHex}   Light: ${lightHex}
═══════════════════════════════════════════════════════════ */

/* ── Variables globales ── */
:root {
  font-size: ${fontSize};
  --epsas-accent:       rgb(${r} ${g} ${b});
  --epsas-accent-dark:  rgb(${dr} ${dg} ${db});
  --epsas-accent-light: ${lightHex};
  --tui-primary:             rgb(${r} ${g} ${b});
  --tui-primary-hover:       rgb(${dr} ${dg} ${db});
  --tui-background-accent-1: rgb(${r} ${g} ${b});
  --tui-text-action:         rgb(${r} ${g} ${b});
  --tui-border-focus:        rgb(${r} ${g} ${b});
}

/* ══ bg-[color] ══════════════════════════════════════════ */
.bg-\\[\\#39A900\\],
.bg-\\[\\#2d8400\\],
.bg-\\[\\#2d8600\\],
.bg-\\[\\#007832\\]
  { background-color: rgb(${r} ${g} ${b}) !important; }

.bg-\\[\\#39A900\\]\\/5   { background-color: rgb(${r} ${g} ${b} / 0.05) !important; }
.bg-\\[\\#39A900\\]\\/8   { background-color: rgb(${r} ${g} ${b} / 0.08) !important; }
.bg-\\[\\#39A900\\]\\/10  { background-color: rgb(${r} ${g} ${b} / 0.10) !important; }
.bg-\\[\\#39A900\\]\\/20  { background-color: rgb(${r} ${g} ${b} / 0.20) !important; }
.bg-\\[\\#007832\\]\\/20  { background-color: rgb(${r} ${g} ${b} / 0.20) !important; }

/* ══ text-[color] ════════════════════════════════════════ */
.text-\\[\\#39A900\\],
.text-\\[\\#007832\\]
  { color: rgb(${r} ${g} ${b}) !important; }

/* ══ border-[color] ══════════════════════════════════════ */
.border-\\[\\#39A900\\]       { border-color:     rgb(${r} ${g} ${b})        !important; }
.border-t-\\[\\#39A900\\]    { border-top-color:  rgb(${r} ${g} ${b})        !important; }
.border-\\[\\#39A900\\]\\/20 { border-color:     rgb(${r} ${g} ${b} / 0.20) !important; }
.border-\\[\\#39A900\\]\\/30 { border-color:     rgb(${r} ${g} ${b} / 0.30) !important; }
.border-\\[\\#39A900\\]\\/40 { border-color:     rgb(${r} ${g} ${b} / 0.40) !important; }

/* ══ ring-[color] ════════════════════════════════════════ */
.ring-\\[\\#39A900\\] {
  --tw-ring-color: rgb(${r} ${g} ${b}) !important;
  --tw-ring-shadow: 0 0 0 var(--tw-ring-offset-width, 0px) var(--tw-ring-offset-color, #fff),
                    0 0 0 calc(1px + var(--tw-ring-offset-width, 0px)) rgb(${r} ${g} ${b}) !important;
}

/* ══ shadow-[color] ══════════════════════════════════════ */
.shadow-\\[\\#39A900\\]       { --tw-shadow-color: rgb(${r} ${g} ${b})        !important; }
.shadow-\\[\\#39A900\\]\\/20  { --tw-shadow-color: rgb(${r} ${g} ${b} / 0.20) !important; }

/* ══ accent-[color] (inputs, checkboxes, etc.) ════════════ */
.accent-\\[\\#39A900\\]  { accent-color: rgb(${r} ${g} ${b}) !important; }

/* ══ Gradient stops ══════════════════════════════════════ */
.from-\\[\\#39A900\\]      { --tw-gradient-from: rgb(${r} ${g} ${b})        !important; }
.via-\\[\\#39A900\\]       { --tw-gradient-via:  rgb(${r} ${g} ${b})        !important; }
.to-\\[\\#39A900\\]        { --tw-gradient-to:   rgb(${r} ${g} ${b})        !important; }
.from-\\[\\#39A900\\]\\/0  { --tw-gradient-from: rgb(${r} ${g} ${b} / 0)    !important; }
.from-\\[\\#39A900\\]\\/5  { --tw-gradient-from: rgb(${r} ${g} ${b} / 0.05) !important; }
.to-\\[\\#39A900\\]\\/0    { --tw-gradient-to:   rgb(${r} ${g} ${b} / 0)    !important; }

/* ══ hover: ══════════════════════════════════════════════ */
.hover\\:bg-\\[\\#39A900\\]:hover,
.hover\\:bg-\\[\\#2d8400\\]:hover,
.hover\\:bg-\\[\\#2d8600\\]:hover
  { background-color: rgb(${dr} ${dg} ${db}) !important; }

.hover\\:bg-\\[\\#39A900\\]\\/5:hover   { background-color: rgb(${r} ${g} ${b} / 0.05) !important; }
.hover\\:bg-\\[\\#39A900\\]\\/10:hover  { background-color: rgb(${r} ${g} ${b} / 0.10) !important; }
.hover\\:text-\\[\\#39A900\\]:hover     { color: rgb(${r} ${g} ${b})        !important; }
.hover\\:text-\\[\\#acd8a7\\]:hover     { color: ${lightHex}                !important; }
.hover\\:border-\\[\\#39A900\\]:hover   { border-color: rgb(${r} ${g} ${b}) !important; }
.hover\\:border-\\[\\#39A900\\]\\/30:hover { border-color: rgb(${r} ${g} ${b} / 0.30) !important; }
.hover\\:border-\\[\\#39A900\\]\\/50:hover { border-color: rgb(${r} ${g} ${b} / 0.50) !important; }
.hover\\:from-\\[\\#39A900\\]\\/5:hover    { --tw-gradient-from: rgb(${r} ${g} ${b} / 0.05) !important; }
.hover\\:shadow-\\[\\#39A900\\]\\/30:hover { --tw-shadow-color: rgb(${r} ${g} ${b} / 0.30) !important; }

/* ══ focus: ══════════════════════════════════════════════ */
.focus\\:border-\\[\\#39A900\\]:focus      { border-color: rgb(${r} ${g} ${b})        !important; }
.focus\\:border-\\[\\#39A900\\]\\/60:focus { border-color: rgb(${r} ${g} ${b} / 0.60) !important; }

.focus\\:ring-\\[\\#39A900\\]:focus {
  --tw-ring-color: rgb(${r} ${g} ${b}) !important;
  box-shadow: 0 0 0 3px rgb(${r} ${g} ${b}) !important;
}
.focus\\:ring-\\[\\#39A900\\]\\/20:focus {
  --tw-ring-color: rgb(${r} ${g} ${b} / 0.20) !important;
  box-shadow: 0 0 0 3px rgb(${r} ${g} ${b} / 0.20) !important;
}
.focus\\:ring-\\[\\#39A900\\]\\/30:focus {
  --tw-ring-color: rgb(${r} ${g} ${b} / 0.30) !important;
  box-shadow: 0 0 0 3px rgb(${r} ${g} ${b} / 0.30) !important;
}
.focus\\:ring-\\[\\#39A900\\]\\/40:focus {
  --tw-ring-color: rgb(${r} ${g} ${b} / 0.40) !important;
  box-shadow: 0 0 0 3px rgb(${r} ${g} ${b} / 0.40) !important;
}

/* ══ Sidebar ═════════════════════════════════════════════ */
/* routerLinkActive aplica estas clases dinámicamente */
a.bg-\\[\\#007832\\],
a[class*="bg-\\[#007832\\]"]
  { background-color: rgb(${r} ${g} ${b}) !important; }

/* ══ Componentes con estilos encapsulados ════════════════ */
/* Estos usan !important para vencer la especificidad Angular */
.toggle.on           { background-color: rgb(${r} ${g} ${b}) !important; }
.btn-primary         { background-color: rgb(${r} ${g} ${b}) !important; }
.settings-nav button.active { background-color: rgb(${r} ${g} ${b}) !important; }
.strength-seg.filled { background-color: rgb(${r} ${g} ${b}) !important; }
.progress-bar-fill   { background-color: rgb(${r} ${g} ${b}) !important; }
.dot-green           { background-color: rgb(${r} ${g} ${b}) !important; }
.font-size-btns button.active {
  border-color: rgb(${r} ${g} ${b}) !important;
  color:        rgb(${r} ${g} ${b}) !important;
  background:   rgb(${r} ${g} ${b} / 0.08) !important;
}
.color-chip.selected { border-color: #0f172a !important; }

/* ══ Sidebar link activo ══════════════════════════════════ */
.nav-link-active {
  background:        rgb(${r} ${g} ${b} / 0.08) !important;
  color:             rgb(${r} ${g} ${b}) !important;
  border-left-color: rgb(${r} ${g} ${b}) !important;
}

/* SVG inline */
circle[stroke="#39A900"],
path[stroke="#39A900"]   { stroke: rgb(${r} ${g} ${b}) !important; }

/* Gradientes compuestos */
.settings-avatar { background: linear-gradient(135deg, rgb(${r} ${g} ${b}), rgb(${dr} ${dg} ${db})) !important; }
.personal-hero   { background: linear-gradient(135deg, rgb(${r} ${g} ${b}), rgb(${dr} ${dg} ${db})) !important; }
.bg-sena-gradient { background: linear-gradient(to right, rgb(${r} ${g} ${b}), rgb(${r} ${g} ${b} / 0.6)) !important; }
.accent-card      { background: linear-gradient(135deg, rgb(${r} ${g} ${b}), rgb(${dr} ${dg} ${db})) !important; }

/* ══ Modo oscuro ═════════════════════════════════════════ */
${dark ? `
  body, html { background-color: #0f172a !important; color: #e2e8f0 !important; }
  .dashboard, .settings-wrap, main { background: #0f172a !important; }

  /* Tarjetas / paneles */
  .bg-white, .stat-card, .donut-card, .settings-panel,
  .settings-nav, .settings-header, .admin-card, .sys-card,
  .bg-gray-50, .bg-gray-100 {
    background-color: #1e293b !important;
    border-color: #334155 !important;
  }

  /* Textos principales */
  .text-gray-800, .text-gray-700,
  h1, h2, h3, h4,
  .dash-title, .panel-title, .card-label,
  .card-value, .donut-title, .sys-value, .settings-name {
    color: #f1f5f9 !important;
  }

  /* Textos secundarios */
  .text-gray-500, .text-gray-400,
  .card-sub, .donut-sub, .panel-sub,
  .dash-date, .legend-text, .pref-desc, .sys-label, label {
    color: #94a3b8 !important;
  }
  .text-gray-600 { color: #cbd5e1 !important; }

  /* Inputs */
  input:not([type="checkbox"]):not([type="radio"]),
  textarea, select {
    background-color: #1e293b !important;
    border-color: #475569 !important;
    color: #f1f5f9 !important;
  }

  /* Bordes y separadores */
  hr, .divider, [class*="border-gray"], .border { border-color: #334155 !important; }

  /* Sidebar */
  aside { background-color: #1e293b !important; border-color: #334155 !important; }
  .nav-link { color: #94a3b8 !important; }
  .nav-link:hover { background-color: #334155 !important; color: #f8fafc !important; }
  .nav-link svg { color: #94a3b8 !important; }
  .nav-link:hover svg { color: #f8fafc !important; }
  .nav-section-label { color: #cbd5e1 !important; }
  .nav-logout { color: #94a3b8 !important; }
  .nav-logout:hover { background-color: #7f1d1d !important; color: #fecaca !important; }

  /* Modales / overlays */
  .modal-backdrop, [class*="bg-black\\/"] { background-color: rgba(0,0,0,.65) !important; }
  .modal-content, [class*="bg-white"] { background-color: #1e293b !important; }

  /* Tablas */
  table, thead, tbody, tr, th, td {
    background-color: #1e293b !important;
    border-color: #334155 !important;
    color: #e2e8f0 !important;
  }
  tr:hover { background-color: #273549 !important; }

  /* Badges / pills con fondo blanco/gris claro */
  .badge, [class*="bg-gray-100"], [class*="bg-slate-100"] {
    background-color: #334155 !important;
    color: #cbd5e1 !important;
  }
` : ''}
`;
  }

  /* ── Helpers ───────────────────────────────────────────── */

  /** #RRGGBB → [r, g, b] */
  private hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  }

  /** Oscurece ~18 puntos en cada canal */
  private darken(hex: string): string {
    const [r, g, b] = this.hexToRgb(hex);
    return this.toHex(Math.max(0, r - 30), Math.max(0, g - 30), Math.max(0, b - 30));
  }

  /** Aclara mezclando 45 % con blanco (para hover:text suave) */
  private lighten(hex: string): string {
    const [r, g, b] = this.hexToRgb(hex);
    const mix = (c: number) => Math.round(c + (255 - c) * 0.45);
    return this.toHex(mix(r), mix(g), mix(b));
  }

  private toHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }
}
