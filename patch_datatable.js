const fs = require('fs');
let file = 'src/components/data-table.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add tableData state
const dataInitSearch = `export function DataTable({ columns, data }: DataTableProps) {
  const router = useRouter()`;
const dataInitReplace = `export function DataTable({ columns, data }: DataTableProps) {
  const router = useRouter()
  const [tableData, setTableData] = React.useState(data)

  React.useEffect(() => {
    setTableData(data)
  }, [data])`;
content = content.replace(dataInitSearch, dataInitReplace);

// 2. Change useReactTable to use tableData
content = content.replace(
  'const table = useReactTable({',
  'const table = useReactTable({'
).replace(
  '    data,\n    columns,',
  '    data: tableData,\n    columns,'
);

// 3. Update updateData function to optimistically update tableData
const updateDataSearch = `      updateData: async (rowIndex: number, columnIdOrUpdates: string | Record<string, any>, value?: any) => {
        const row = data[rowIndex]`;
const updateDataReplace = `      updateData: async (rowIndex: number, columnIdOrUpdates: string | Record<string, any>, value?: any) => {
        const row = tableData[rowIndex]
        
        let updates: any = {}
        if (typeof columnIdOrUpdates === 'string') {
          updates[columnIdOrUpdates] = value
        } else {
          updates = columnIdOrUpdates
        }
        
        // Auto-set complete_date when status flips to Complete
        if (updates.status) {
          if (updates.status === 'Complete' && row.status !== 'Complete') {
            updates.complete_date = new Date().toISOString()
            
            // Trigger celebration animation!
            setTimeout(() => {
              celebrateDelivery(document.getElementById('delivery-stage'))
            }, 100)
          } else if (updates.status !== 'Complete' && row.status === 'Complete') {
            updates.complete_date = null
          }
        }
        
        // Optimistic UI Update
        setTableData(old => {
          const newData = [...old]
          newData[rowIndex] = { ...newData[rowIndex], ...updates }
          return newData
        })
        
        await supabase.from('video_tasks').update(updates).eq('id', row.id)
        router.refresh()
      }`;
      
// Because I'm replacing the whole function body, let's use a targeted replace
content = content.replace(
  /updateData: async \(rowIndex: number, columnIdOrUpdates: string \| Record<string, any>, value\?: any\) => {[\s\S]*?router\.refresh\(\)\n      }/,
  updateDataReplace
);

fs.writeFileSync(file, content);
