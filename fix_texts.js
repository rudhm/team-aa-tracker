const fs = require('fs');

// 1. input.tsx
let inputPath = 'src/components/ui/input.tsx';
let inputContent = fs.readFileSync(inputPath, 'utf-8');
inputContent = inputContent.replace(
  'border-[#E6EAE0] bg-white px-3 py-1.5 text-[13px] font-medium text-[#11161B] transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#11161B] placeholder:text-[#11161B]/30 focus-visible:border-[#11161B]/20 focus-visible:ring-2 focus-visible:ring-[#11161B]/5 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F3F5EE]',
  'border-[#E6EAE0] dark:border-white/10 bg-white dark:bg-[#161b22] px-3 py-1.5 text-[13px] font-medium text-[#11161B] dark:text-[#E6EAE0] transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#11161B] dark:file:text-[#E6EAE0] placeholder:text-[#11161B]/30 dark:placeholder:text-[#E6EAE0]/40 focus-visible:border-[#11161B]/20 dark:focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-[#11161B]/5 dark:focus-visible:ring-white/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F3F5EE] dark:disabled:bg-white/5'
);
fs.writeFileSync(inputPath, inputContent);

// 2. sheet.tsx
let sheetPath = 'src/components/ui/sheet.tsx';
let sheetContent = fs.readFileSync(sheetPath, 'utf-8');
sheetContent = sheetContent.replace(
  'bg-white bg-clip-padding text-sm text-[#11161B]/70',
  'bg-white dark:bg-[#0d1117] bg-clip-padding text-sm text-[#11161B]/70 dark:text-[#E6EAE0]/70'
);
sheetContent = sheetContent.replace(
  'text-[#11161B]',
  'text-[#11161B] dark:text-[#E6EAE0]'
);
fs.writeFileSync(sheetPath, sheetContent);

// 3. columns.tsx (InlineLinkEdit)
let columnsPath = 'src/app/columns.tsx';
let columnsContent = fs.readFileSync(columnsPath, 'utf-8');
columnsContent = columnsContent.replace(
  'className="h-8 w-full max-w-[180px] rounded-md bg-white dark:bg-[#161b22] border border-[#E6EAE0] dark:border-white/10 px-2 text-[12px] shadow-sm outline-none focus:ring-2 focus:ring-black/10"',
  'className="h-8 w-full max-w-[180px] rounded-md bg-white dark:bg-[#161b22] border border-[#E6EAE0] dark:border-white/10 px-2 text-[12px] text-[#11161B] dark:text-[#E6EAE0] shadow-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"'
);
fs.writeFileSync(columnsPath, columnsContent);

// 4. data-table.tsx 
let dtPath = 'src/components/data-table.tsx';
let dtContent = fs.readFileSync(dtPath, 'utf-8');
// Fix desktop quick-add input text color override
dtContent = dtContent.replace(
  /className="h-8 rounded-lg border-transparent bg-transparent px-2 text-\[13px\] font-semibold shadow-none focus-visible:bg-white dark:bg-\[#161b22\] focus-visible:ring-1"/g,
  'className="h-8 rounded-lg border-transparent bg-transparent px-2 text-[13px] font-semibold text-[#11161B] dark:text-[#E6EAE0] shadow-none focus-visible:bg-white dark:focus-visible:bg-[#161b22] focus-visible:ring-1"'
);
fs.writeFileSync(dtPath, dtContent);

