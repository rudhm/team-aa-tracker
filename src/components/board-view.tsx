import { VideoTask } from "@/app/columns"
import { createEntityColor, type EntityColorMaps, formatName, getEditorDotColor } from "@/lib/utils"

const STATUSES = ['In progress', 'Revision', 'Complete']

interface BoardViewProps {
  data: VideoTask[]
  colorMaps?: EntityColorMaps
}

export function BoardView({ data, colorMaps }: BoardViewProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory" aria-label="Video board">
      {STATUSES.map(status => {
        const columnTasks = data.filter(task => task.status === status)
        
        return (
          <section key={status} aria-labelledby={`board-${status.replace(/\s+/g, "-").toLowerCase()}`} className="flex-shrink-0 w-[85vw] sm:w-72 snap-center rounded-[24px] bg-[var(--surface-card)] p-4 shadow-sm border border-[var(--border)]">
            <div className="mb-4 flex items-center justify-between px-2">
              <h3 id={`board-${status.replace(/\s+/g, "-").toLowerCase()}`} className="text-[13px] font-bold text-[var(--text-primary)]">{status === "Complete" ? "Completed" : status}</h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-card-2)] text-[11px] font-semibold text-[var(--text-primary)]">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {columnTasks.map(task => (
                <div key={task.id} className="group rounded-[20px] border border-[var(--border)] bg-[var(--surface-page)] p-4 transition-all hover:bg-[var(--surface-card)] hover:shadow-sm">
                  {task.sub_client && (
                    <div
                      className="mb-2 inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase"
                      style={colorMaps?.clients[task.sub_client] ?? createEntityColor(task.sub_client, "client")}
                    >
                      {task.sub_client}
                    </div>
                  )}
                  {task.client && (
                    <div
                      className="mb-2 inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
                      style={colorMaps?.subClients[task.client] ?? createEntityColor(task.client, "subclient")}
                    >
                      {task.client}
                    </div>
                  )}
                  <div className="mb-3 break-words text-[14px] font-bold text-[var(--text-primary)]">
                    {task.video_title}
                  </div>
                  <div className="flex items-center justify-between">
                    {task.editor ? (
                      <div className="min-w-0 max-w-[55%] truncate flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-primary)]">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getEditorDotColor(formatName(task.editor)) }} />
                        {formatName(task.editor)}
                      </div>
                    ) : (
                      <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                        Unassigned
                      </span>
                    )}
                    <div className="flex flex-col items-end gap-0.5">
                      {task.start_date && (
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] tabular-nums">
                          S: {new Date(task.start_date.length === 10 ? task.start_date + "T12:00:00Z" : task.start_date).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })}
                        </span>
                      )}
                      {task.complete_date && (
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] tabular-nums">
                          C: {new Date(task.complete_date.length === 10 ? task.complete_date + "T12:00:00Z" : task.complete_date).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="rounded-[20px] border border-dashed border-[var(--border)] p-4 text-center text-[12px] font-medium text-[var(--text-secondary)]">
                  Empty
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
