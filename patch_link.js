const fs = require('fs');
let content = fs.readFileSync('src/app/columns.tsx', 'utf-8');

const newComponent = `export function InlineLinkEdit({ value, locked, onUpdate, isCompleted }: { value: string | null, locked: boolean, onUpdate: (val: string, newStatus?: string) => void, isCompleted: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState("")

  const startEdit = () => {
    if (locked) return
    setIsEditing(true)
    setText(value || "")
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText && pastedText.startsWith('http')) {
      e.preventDefault()
      setText(pastedText)
      setIsEditing(false)
      onUpdate(pastedText, !isCompleted ? 'Complete' : undefined)
    }
  }

  const saveEdit = () => {
    setIsEditing(false)
    if (text !== (value || "")) {
      onUpdate(text)
    }
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        placeholder="Paste URL..."
        className="h-8 w-full max-w-[180px] rounded-md bg-white border border-[#E6EAE0] px-2 text-[12px] shadow-sm outline-none focus:ring-2 focus:ring-black/10"
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={saveEdit}
        onPaste={handlePaste}
        onKeyDown={e => { if (e.key === 'Enter') saveEdit() }}
      />
    )
  }

  if (!value) {
    return (
      <span 
        onClick={startEdit} 
        className={\`text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1.5 \${locked ? 'text-[#11161B]/20' : 'text-[#11161B]/40 hover:bg-[#F3F5EE] hover:text-[#11161B] cursor-pointer border border-dashed border-[#E6EAE0]'}\`}
      >
        <LinkIcon className="h-3 w-3" />
        Add Link
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <a 
        href={value} 
        target="_blank" 
        rel="noreferrer" 
        className="text-[12px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
      >
        <LinkIcon className="h-3 w-3" />
        Watch
      </a>
      {!locked && (
        <button 
          onClick={startEdit}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-[#11161B]/30 hover:text-[#11161B] hover:bg-[#F3F5EE] rounded-full transition-all"
          title="Edit link"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </button>
      )}
    </div>
  )
}

export const columns: ColumnDef<VideoTask>[] = [`;

content = content.replace('export const columns: ColumnDef<VideoTask>[] = [', newComponent);

const oldCellContent = `    cell: ({ row, table }) => {
      const task = row.original
      const [localValue, setLocalValue] = useState(task.link || "")
      const isCompleted = task.status === "Complete"

      // Sync local state if prop changes from outside
      useEffect(() => {
        setLocalValue(task.link || "")
      }, [task.link])

      if (task.payroll_locked) {
        return (
          <a href={task.link || "#"} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">
            {task.link ? "View" : ""}
          </a>
        )
      }

      const handlePaste = async (e: React.ClipboardEvent) => {
        const pastedText = e.clipboardData.getData('text')
        if (pastedText && pastedText.startsWith('http')) {
          e.preventDefault()
          setLocalValue(pastedText)
          
          const updates: any = { link: pastedText }
          if (!isCompleted) {
            updates.status = 'Complete'
          }
          
          await table.options.meta?.updateData(row.index, updates)
        }
      }

      const handleBlur = async () => {
        if (localValue !== task.link) {
          await table.options.meta?.updateData(row.index, 'link', localValue)
        }
      }

      return (
        <div className="relative group">
          {(!isCompleted && !localValue) ? (
             <div className="flex h-7 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Input 
                  placeholder="Paste link..." 
                  className="h-7 w-28 rounded-full border-none bg-white/50 backdrop-blur-md px-3 text-[11px] shadow-none placeholder:text-[#11161B]/50 focus-visible:ring-1 focus-visible:ring-white"
                  onPaste={handlePaste}
                  onChange={(e) => setLocalValue(e.target.value)}
                  onBlur={handleBlur}
                  value={localValue}
                />
             </div>
          ) : (
            <Input 
              placeholder="https://..." 
              className={\`h-7 w-32 rounded-full border-none bg-transparent px-3 text-[11px] shadow-none focus-visible:ring-0 \${localValue ? 'text-blue-600 underline' : 'text-[#11161B]/30'}\`}
              onPaste={handlePaste}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleBlur}
              value={localValue}
            />
          )}
        </div>
      )
    },`;

const newCellContent = `    cell: ({ row, table }) => {
      const task = row.original
      const isCompleted = task.status === "Complete"

      return (
        <InlineLinkEdit 
          value={task.link} 
          locked={task.payroll_locked} 
          isCompleted={isCompleted}
          onUpdate={async (newLink, newStatus) => {
            const updates: any = { link: newLink }
            if (newStatus) updates.status = newStatus
            await table.options.meta?.updateData(row.index, updates)
          }} 
        />
      )
    },`;

content = content.replace(oldCellContent, newCellContent);

fs.writeFileSync('src/app/columns.tsx', content);
