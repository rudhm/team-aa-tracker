const fs = require('fs');
let dtPath = 'src/components/data-table.tsx';
let dtContent = fs.readFileSync(dtPath, 'utf-8');

dtContent = dtContent.replace(
  /className="h-12 rounded-xl bg-\[#F3F5EE\]\/50 border-\[#E6EAE0\] px-4 text-\[14px\] font-semibold shadow-sm focus-visible:bg-white"/g,
  'className="h-12 rounded-xl bg-[#F3F5EE]/50 dark:bg-white/5 border-[#E6EAE0] dark:border-white/10 px-4 text-[14px] font-semibold text-[#11161B] dark:text-[#E6EAE0] shadow-sm focus-visible:bg-white dark:focus-visible:bg-[#161b22]"'
);

dtContent = dtContent.replace(
  /className="h-12 rounded-xl bg-\[#F3F5EE\]\/50 border-\[#E6EAE0\] px-4 text-\[14px\] shadow-sm focus-visible:bg-white"/g,
  'className="h-12 rounded-xl bg-[#F3F5EE]/50 dark:bg-white/5 border-[#E6EAE0] dark:border-white/10 px-4 text-[14px] text-[#11161B] dark:text-[#E6EAE0] shadow-sm focus-visible:bg-white dark:focus-visible:bg-[#161b22]"'
);

dtContent = dtContent.replace(
  /className="h-12 rounded-xl bg-\[#F3F5EE\]\/50 border-\[#E6EAE0\] px-4 text-\[14px\] shadow-sm focus-visible:bg-white text-center"/g,
  'className="h-12 rounded-xl bg-[#F3F5EE]/50 dark:bg-white/5 border-[#E6EAE0] dark:border-white/10 px-4 text-[14px] text-[#11161B] dark:text-[#E6EAE0] shadow-sm focus-visible:bg-white dark:focus-visible:bg-[#161b22] text-center"'
);

fs.writeFileSync(dtPath, dtContent);
