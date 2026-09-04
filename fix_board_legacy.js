const fs = require('fs');
let file = 'src/components/board-view.tsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(
  'new Date(task.start_date + "T12:00:00Z").toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })',
  'new Date(task.start_date.length === 10 ? task.start_date + "T12:00:00Z" : task.start_date).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })'
);

content = content.replace(
  'new Date(task.complete_date + "T12:00:00Z").toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })',
  'new Date(task.complete_date.length === 10 ? task.complete_date + "T12:00:00Z" : task.complete_date).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })'
);

fs.writeFileSync(file, content);
