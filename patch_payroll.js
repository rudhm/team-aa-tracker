const fs = require('fs');
let file = 'src/app/payroll/payroll-client.tsx';
let content = fs.readFileSync(file, 'utf-8');

// The block to replace:
//    data.forEach(task => {
//      if (!task.complete_date) return
//      const date = new Date(task.complete_date)
//      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` // e.g. 2026-09

const searchDateParsing = `    data.forEach(task => {
      if (!task.complete_date) return
      const date = new Date(task.complete_date)
      const key = \`\${date.getFullYear()}-\${String(date.getMonth() + 1).padStart(2, '0')}\` // e.g. 2026-09`;

const replaceDateParsing = `    data.forEach(task => {
      if (!task.complete_date) return
      let dateStr = task.complete_date
      if (dateStr.length === 10) dateStr += "T12:00:00Z"
      const date = new Date(dateStr)
      const key = \`\${date.getUTCFullYear()}-\${String(date.getUTCMonth() + 1).padStart(2, '0')}\` // e.g. 2026-09`;

content = content.replace(searchDateParsing, replaceDateParsing);

// Format month helper:
// function formatMonth(key: string) {
//   const [year, month] = key.split('-')
//   const date = new Date(parseInt(year), parseInt(month) - 1)
//   return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
// }
// This is actually fine because it parses local integer values directly, but wait...
// new Date(2026, 8) locally makes Sep 1, 2026 00:00 local time.
// toLocaleDateString without UTC is perfectly fine for that.

// Completed formatting inline:
// Completed: {new Date(task.complete_date!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
// Needs fixing!
content = content.replace(
  'Completed: {new Date(task.complete_date!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}',
  'Completed: {new Date(task.complete_date!.length === 10 ? task.complete_date + "T12:00:00Z" : task.complete_date!).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })}'
);

fs.writeFileSync(file, content);
