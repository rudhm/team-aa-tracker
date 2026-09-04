const fs = require('fs');

const files = [
  'src/components/data-table.tsx',
  'src/components/board-view.tsx',
  'src/app/columns.tsx',
  'src/app/page.tsx',
  'src/app/payroll/page.tsx',
  'src/app/payroll/payroll-client.tsx'
];

const replacements = [
  { search: /bg-white(?!\/)/g, replace: 'bg-white dark:bg-[#161b22]' },
  { search: /text-\[#11161B\]/g, replace: 'text-[#11161B] dark:text-[#E6EAE0]' },
  { search: /border-\[#E6EAE0\]/g, replace: 'border-[#E6EAE0] dark:border-white/10' },
  { search: /bg-\[#F3F5EE\]/g, replace: 'bg-[#F3F5EE] dark:bg-white/10' },
  { search: /bg-white\/50/g, replace: 'bg-white/50 dark:bg-black/40' },
  { search: /bg-white\/40/g, replace: 'bg-white/40 dark:bg-black/30' },
  { search: /bg-white\/60/g, replace: 'bg-white/60 dark:bg-black/50' },
  { search: /bg-white\/80/g, replace: 'bg-white/80 dark:bg-[#0d1117]/80' },
  { search: /bg-white\/20/g, replace: 'bg-white/20 dark:bg-white/5' },
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    for (const { search, replace } of replacements) {
      content = content.replace(search, replace);
    }
    fs.writeFileSync(file, content);
  }
}
