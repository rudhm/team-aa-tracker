const fs = require('fs');
let content = fs.readFileSync('src/components/data-table.tsx', 'utf-8');

// Replace table close to add the sheet
const endStr = `        </Table>
      </div>
      )}

      {/* Floating Bulk Action Bar */}`;

const sheetReplacement = `        </Table>
      </div>
      </>
      )}

      {/* Mobile Add Task FAB & Sheet */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-14 w-14 rounded-full bg-[#11161B] text-white shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all p-0">
              <Plus className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[32px] p-6 pb-12 outline-none">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-left text-[18px] font-bold text-[#11161B]">Add new task</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#11161B]/60 uppercase tracking-wider ml-1">Client</label>
                <Input 
                  placeholder="Client..." 
                  list="client-suggestions"
                  value={client} onChange={e => setClient(e.target.value)}
                  className="h-12 rounded-xl bg-[#F3F5EE]/50 border-[#E6EAE0] px-4 text-[14px] font-semibold shadow-sm focus-visible:bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#11161B]/60 uppercase tracking-wider ml-1">Title</label>
                <Input 
                  placeholder="Video Title..." 
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="h-12 rounded-xl bg-[#F3F5EE]/50 border-[#E6EAE0] px-4 text-[14px] shadow-sm focus-visible:bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#11161B]/60 uppercase tracking-wider ml-1">Editor</label>
                <Input 
                  placeholder="Editor..." 
                  list="editor-suggestions"
                  value={editor} onChange={e => setEditor(e.target.value)}
                  className="h-12 rounded-xl bg-[#F3F5EE]/50 border-[#E6EAE0] px-4 text-[14px] shadow-sm focus-visible:bg-white"
                />
              </div>
              <div className="flex gap-4">
                <div className="space-y-1.5 flex-1">
                  <label className="text-[11px] font-bold text-[#11161B]/60 uppercase tracking-wider ml-1">Start Date</label>
                  <Input 
                    placeholder="MM/DD"
                    value={startDay} 
                    onChange={e => setStartDay(e.target.value.replace(/[^\\d/]/g, '').slice(0, 5))}
                    className="h-12 rounded-xl bg-[#F3F5EE]/50 border-[#E6EAE0] px-4 text-[14px] shadow-sm focus-visible:bg-white text-center"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-[11px] font-bold text-[#11161B]/60 uppercase tracking-wider ml-1">Complete Date</label>
                  <Input 
                    placeholder="MM/DD"
                    value={completeDay} 
                    onChange={e => setCompleteDay(e.target.value.replace(/[^\\d/]/g, '').slice(0, 5))}
                    className="h-12 rounded-xl bg-[#F3F5EE]/50 border-[#E6EAE0] px-4 text-[14px] shadow-sm focus-visible:bg-white text-center"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={(e) => {
                     handleQuickAdd(e)
                     document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
                  }}
                  disabled={!client || !title || !editor || isAdding}
                  className="h-12 w-full rounded-xl bg-[#11161B] text-[14px] font-bold text-white transition-all hover:bg-[#11161B]/80 disabled:opacity-30"
                >
                  {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Task"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Floating Bulk Action Bar */}`;

content = content.replace(endStr, sheetReplacement);

// Fix the bulk action bar class
const oldBulkClass = `className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-200"`;
const newBulkClass = `className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-200 w-[90vw] md:w-auto flex justify-center"`;

content = content.replace(oldBulkClass, newBulkClass);

fs.writeFileSync('src/components/data-table.tsx', content);
