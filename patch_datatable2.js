const fs = require('fs');
let file = 'src/components/data-table.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Replace new Date().toISOString() with local YYYY-MM-DD
content = content.replace(
  'updates.complete_date = new Date().toISOString()',
  'updates.complete_date = new Date().toLocaleDateString("en-CA") // format as YYYY-MM-DD in local time'
);

// Also in handleQuickAdd:
content = content.replace(
  'const parsedComplete = createDateFromInput(completeDay)',
  `const parsedComplete = createDateFromInput(completeDay)
    const localToday = new Date().toLocaleDateString("en-CA")`
);
content = content.replace(
  "complete_date: parsedComplete,",
  "complete_date: parsedComplete ? parsedComplete : (status === 'Complete' ? localToday : null),"
);

fs.writeFileSync(file, content);
