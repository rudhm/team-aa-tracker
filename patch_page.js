const fs = require('fs');

let pageContent = fs.readFileSync('src/app/page.tsx', 'utf-8');
pageContent = pageContent.replace('import { DataTable } from "@/components/data-table"', 'import { DataTable } from "@/components/data-table"\nimport { ThemeToggle } from "@/components/theme-toggle"');
pageContent = pageContent.replace(
  '<a href="/payroll" className="text-[13px] font-semibold text-[#11161B]/50 hover:text-[#11161B] transition-colors">\n              Wrap-up →\n            </a>',
  '<ThemeToggle />\n            <a href="/payroll" className="text-[13px] font-semibold text-[#11161B]/50 hover:text-[#11161B] dark:text-white/60 dark:hover:text-white transition-colors">\n              Wrap-up →\n            </a>'
);
fs.writeFileSync('src/app/page.tsx', pageContent);

let payrollContent = fs.readFileSync('src/app/payroll/page.tsx', 'utf-8');
payrollContent = payrollContent.replace('import { PayrollClient } from "./payroll-client"', 'import { PayrollClient } from "./payroll-client"\nimport { ThemeToggle } from "@/components/theme-toggle"');
payrollContent = payrollContent.replace(
  '<a href="/" className="text-[13px] font-semibold text-[#11161B]/50 hover:text-[#11161B] transition-colors">\n            ← Back to Tasks\n          </a>',
  '<div className="flex items-center gap-4"><ThemeToggle /><a href="/" className="text-[13px] font-semibold text-[#11161B]/50 hover:text-[#11161B] dark:text-white/60 dark:hover:text-white transition-colors">← Back to Tasks</a></div>'
);
fs.writeFileSync('src/app/payroll/page.tsx', payrollContent);

