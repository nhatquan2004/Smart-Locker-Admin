import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export type TColumn<T> = {
  key: string
  title: React.ReactNode
  render?: (row: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
  align?: 'left' | 'center' | 'right'
}

type TAppTableProps<T> = {
  columns: TColumn<T>[]
  data: T[]
  keyExtractor?: (item: T, index: number) => string | number
  pageSize?: number
  emptyState?: React.ReactNode
  minWidth?: string
  rowClassName?: string | ((row: T, index: number) => string)
}

export function AppTable<T>({
  columns,
  data,
  keyExtractor,
  pageSize = 8,
  emptyState,
  minWidth = '1000px',
  rowClassName,
}: TAppTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, safeCurrentPage, pageSize])

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className="rounded-2xl glass-card overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/80 text-[11px] font-mono text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    "py-3.5 px-5 whitespace-nowrap",
                    col.align === 'center' ? "text-center" : col.align === 'right' ? "text-right" : "text-left",
                    col.headerClassName || "",
                  ].join(" ")}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px] bg-white dark:bg-slate-900">
            {paginatedData.map((row, index) => {
              const rowKey = keyExtractor ? keyExtractor(row, index) : (row as any).id || index
              const customRowClass = typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName || ""

              return (
                <tr
                  key={rowKey}
                  className={`hover:bg-sky-50/40 dark:hover:bg-slate-800/60 transition-colors ${customRowClass}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        "py-3.5 px-5",
                        col.align === 'center' ? "text-center" : col.align === 'right' ? "text-right" : "text-left",
                        col.className || "",
                      ].join(" ")}
                    >
                      {col.render ? col.render(row, index) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Built-in Pagination Bar */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[12px] text-slate-600 dark:text-slate-400">
          <div className="font-mono text-[11.5px]">
            Hiển thị <strong className="text-slate-900 dark:text-white font-bold">{Math.min(data.length, (safeCurrentPage - 1) * pageSize + 1)}</strong> – <strong className="text-slate-900 dark:text-white font-bold">{Math.min(data.length, safeCurrentPage * pageSize)}</strong> trong tổng số <strong className="text-sky-600 dark:text-sky-400 font-bold">{data.length}</strong> kết quả
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang đầu"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 font-mono font-bold text-slate-800 dark:text-slate-200 text-[12px]">
              Trang {safeCurrentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang cuối"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
