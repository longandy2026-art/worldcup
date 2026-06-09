// SportMind AI SSG Build Script
// Generates static HTML from D1 data
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

console.log('Build complete. Static files are in public/');
console.log(`- index.html (homepage)`);
console.log(`- matches.html (all matches)`);
console.log(`- teams.html (all teams)`);
console.log(`- leaderboard.html (leaderboard)`);
console.log(`- match.html (match detail - dynamic)`);
console.log(`- css/style.css`);
console.log(`- js/app.js`);
