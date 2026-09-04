const fs = require('fs');
const content = fs.readFileSync('src/components/data-table.tsx', 'utf-8');

const targetStr = `{viewMode === 'board' ? (
        <BoardView data={table.getCoreRowModel().rows.map(r => r.original)} />
      ) : (
      <div className="overflow-hidden rounded-[28px] border border-[#E6EAE0] bg-white shadow-sm overflow-x-auto w-full">`;

const replacement = `{viewMode === 'board' ? (
        <BoardView data={table.getCoreRowModel().rows.map(r => r.original)} />
      ) : (
      <>
        {/* Mobile View (Cards) */}
        <div className="md:hidden flex flex-col gap-4 pb-24">
          {table.getRowModel().rows?.length ? (
             table.getRowModel().rows.map(row => (
                <div key={row.id} className="rounded-[24px] bg-white p-5 shadow-sm border border-[#E6EAE0] flex flex-col relative overflow-hidden transition-all duration-200">
                   <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex items-center gap-3 flex-1">
                        {row.getVisibleCells().find(c => c.column.id === 'select') && row.original.status !== 'Complete' && (
                          <div className="scale-125 transform-gpu -mt-0.5">
                            {flexRender(row.getVisibleCells().find(c => c.column.id === 'select')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'select')?.getContext()!)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {flexRender(row.getVisibleCells().find(c => c.column.id === 'client')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'client')?.getContext()!)}
                        </div>
                      </div>
                      <div className="shrink-0 scale-90 origin-top-right">
                        {flexRender(row.getVisibleCells().find(c => c.column.id === 'status')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'status')?.getContext()!)}
                      </div>
                   </div>
                   
                   <div className="mb-5 text-[15px]">
                     {flexRender(row.getVisibleCells().find(c => c.column.id === 'video_title')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'video_title')?.getContext()!)}
                   </div>
                   
                   <div className="flex items-end justify-between mt-auto">
                     <div>
                       {flexRender(row.getVisibleCells().find(c => c.column.id === 'editor')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'editor')?.getContext()!)}
                     </div>
                     <div className="flex flex-col gap-1.5 items-end text-[11.5px]">
                       <div className="flex items-center gap-2 bg-[#F3F5EE]/50 px-2 py-0.5 rounded-md">
                         <span className="text-[#11161B]/40 font-bold uppercase tracking-wider text-[9px]">Start</span>
                         {flexRender(row.getVisibleCells().find(c => c.column.id === 'start_date')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'start_date')?.getContext()!)}
                       </div>
                       <div className="flex items-center gap-2 bg-[#F3F5EE]/50 px-2 py-0.5 rounded-md">
                         <span className="text-[#11161B]/40 font-bold uppercase tracking-wider text-[9px]">Done</span>
                         {flexRender(row.getVisibleCells().find(c => c.column.id === 'complete_date')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'complete_date')?.getContext()!)}
                       </div>
                     </div>
                   </div>
                   
                   {/* Mobile Link Rendering */}
                   <div className="mt-4 pt-3 border-t border-[#E6EAE0]/50">
                     {flexRender(row.getVisibleCells().find(c => c.column.id === 'link')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'link')?.getContext()!)}
                   </div>
                </div>
             ))
          ) : (
            <div className="text-center py-10 text-[13px] font-medium text-[#11161B]/30">No tasks found.</div>
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-hidden rounded-[28px] border border-[#E6EAE0] bg-white shadow-sm overflow-x-auto w-full">`;

const patched = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/data-table.tsx', patched);
