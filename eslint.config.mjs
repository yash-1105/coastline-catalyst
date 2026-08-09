import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

/* Next 16 removed `next lint`, and `next build` no longer lints either, so
   this project had no linting at all until now. ESLint runs on its own from
   here: `npm run lint`.

   core-web-vitals promotes the rules that affect Core Web Vitals from
   warnings to errors, which is what we want on a site whose whole point is
   arriving fast on a phone. */
export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    // The defaults from eslint-config-next, which are dropped the moment
    // globalIgnores is set at all.
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
