const fs = require('fs');

function patch(file) {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  
  // Replace dark:text-[#E6EAE0]/35 or /40 or /30 with /70
  text = text.replace(/dark:text-\[#E6EAE0\]\/(30|35|40|50|60)/g, 'dark:text-[#E6EAE0]/70');
  
  // Fix invalid dark:bg-white/10/50 etc if they exist
  text = text.replace(/dark:bg-white\/10\/[0-9]+/g, 'dark:bg-white/10');
  
  // Fix hover:text-[#11161B] dark:text-[#E6EAE0] overriding hover in columns.tsx
  text = text.replace(/hover:text-\[#11161B\] dark:text-\[#E6EAE0\]/g, 'hover:text-[#11161B] dark:hover:text-[#E6EAE0]');
  
  fs.writeFileSync(file, text);
}

patch('src/components/data-table.tsx');
patch('src/app/columns.tsx');
patch('src/components/board-view.tsx');
patch('src/app/payroll/payroll-client.tsx');

