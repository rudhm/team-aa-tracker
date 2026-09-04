import { VideoTask } from "@/app/columns"
import { Badge } from "@/components/ui/badge"

const STATUSES = ['Not started', 'In progress', 'In review', 'Revision', 'Complete']

interface BoardViewProps {
  data: VideoTask[]
  onUpdateStatus?: (id: string, newStatus: string) => void
}

export function BoardView({ data, onUpdateStatus }: BoardViewProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory">
      {STATUSES.map(status => {
        const columnTasks = data.filter(task => task.status === status)
        
        return (
          <div key={status} className="flex-shrink-0 w-[85vw] sm:w-72 snap-center rounded-[24px] bg-white dark:bg-[#161b22] p-4 shadow-sm border border-[#E6EAE0] dark:border-white/10">
            <div className="mb-4 flex items-center justify-between px-2">
              <h3 className="text-[13px] font-bold text-[#11161B] dark:text-[#E6EAE0]">{status}</h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3F5EE] dark:bg-white/10 text-[11px] font-semibold text-[#11161B] dark:text-[#E6EAE0]/70">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {columnTasks.map(task => (
                <div key={task.id} className="group rounded-[20px] border border-[#E6EAE0] dark:border-white/10/50 bg-[#F3F5EE] dark:bg-white/10 p-4 transition-all hover:border-[#E6EAE0] dark:border-white/10 hover:bg-white dark:bg-[#161b22] hover:shadow-sm">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#11161B] dark:text-[#E6EAE0]/70">
                    {task.client}
                  </div>
                  <div className="mb-3 text-[14px] font-bold text-[#11161B] dark:text-[#E6EAE0]">
                    {task.video_title}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#11161B] dark:text-[#E6EAE0]/70">
                      {task.editor || 'Unassigned'}
                    </span>
                    <div className="flex flex-col items-end gap-0.5">
                      {task.start_date && (
                        <span className="text-[10px] font-semibold text-[#11161B] dark:text-[#E6EAE0]/70 tabular-nums">
                          S: {new Date(task.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                      {task.complete_date && (
                        <span className="text-[10px] font-semibold text-[#11161B] dark:text-[#E6EAE0]/70 tabular-nums">
                          C: {new Date(task.complete_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="rounded-[20px] border border-dashed border-[#E6EAE0] dark:border-white/10 p-4 text-center text-[12px] font-medium text-[#11161B] dark:text-[#E6EAE0]/70">
                  Empty
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
