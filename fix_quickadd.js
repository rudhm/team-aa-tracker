const fs = require('fs');
let file = 'src/components/data-table.tsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(
  "complete_date: parsedComplete ? parsedComplete : (status === 'Complete' ? localToday : null),",
  "complete_date: parsedComplete ? parsedComplete : null,"
);

fs.writeFileSync(file, content);
