const fs = require('fs');
let content = fs.readFileSync('src/components/data-table.tsx', 'utf-8');

content = content.replace(
  '<SheetTrigger asChild>\n            <Button className="h-14 w-14 rounded-full bg-[#11161B] text-white shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all p-0">\n              <Plus className="h-6 w-6" />\n            </Button>\n          </SheetTrigger>',
  '<SheetTrigger className="flex items-center justify-center h-14 w-14 rounded-full bg-[#11161B] text-white shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all p-0">\n            <Plus className="h-6 w-6" />\n          </SheetTrigger>'
);

fs.writeFileSync('src/components/data-table.tsx', content);
