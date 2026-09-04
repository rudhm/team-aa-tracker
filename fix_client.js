const fs = require('fs');
let content = fs.readFileSync('src/components/data-table.tsx', 'utf-8');

// Fix handleQuickAdd
content = content.replace(
  'if (!client || !title || !editor) return',
  'if (!title || !editor) return'
);

// Fix disabled states on buttons (there are two: desktop quick-add and mobile sheet)
content = content.replace(
  /disabled=\{!client \|\| !title \|\| !editor \|\| isAdding\}/g,
  'disabled={!title || !editor || isAdding}'
);

fs.writeFileSync('src/components/data-table.tsx', content);
