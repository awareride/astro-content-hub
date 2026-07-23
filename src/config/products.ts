// Product registry - the single place to add a product that ships a localized
// docs collection and a landing card. Kept out of lib/i18n.ts (locale strings)
// so it reads as plain configuration.
//
// `slug`     URL segment (/<slug>/docs).
// `github`   repo URL (used by the landing card and product page).
// `badges`   labels shown on the landing card.
// `nav`      show in the primary nav bar.
// `base`     (optional) override the docs directory - a path relative to the
//            repo root, e.g. './docs' => ./docs/<locale>/, used by content
//            synced in from an external repo. Defaults to
//            ./src/content/docs/<slug>/<locale>/.
//
// Adding an entry here auto-wires the docs collections (content.config.ts)
// and the landing Projects grid.

export interface Product {
  slug: string;
  name: string;
  github: string;
  badges: string[];
  base?: string;
  nav: boolean;
}

export const products: Product[] = [
  { slug: 'astro-content-hub', name: 'Astro Content Hub', github: 'https://github.com/awareride/astro-content-hub', badges: ['Astro', 'ContentHub'], nav: false, base: './docs' },
  { slug: 'vite', name: 'Vite', github: 'https://github.com/vitejs/vite', badges: ['Build Tool', 'JavaScript'], nav: false },
  { slug: 'astro', name: 'Astro', github: 'https://github.com/withastro/astro', badges: ['Web Framework', 'JavaScript'], nav: false },
  { slug: 'json-server', name: 'JSON Server', github: 'https://github.com/typicode/json-server', badges: ['Mock API', 'Node'], nav: false },
];
