/** Форматирует байты в человекочитаемый вид */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Б'
  const k = 1024
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/** Форматирует миллисекунды в читаемый вид */
export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms} мс`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} с`
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}м ${sec}с`
}

/** Экспорт таблицы в CSV */
export function exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(';'),
    ...rows.map(row =>
      headers.map(h => {
        const v = String(row[h] ?? '')
        return v.includes(';') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
      }).join(';')
    ),
  ].join('\n')
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/** Статус подключения → цвет Badge */
export function statusColor(status: string): string {
  switch (status) {
    case 'CONNECTED': return 'success'
    case 'ERROR':     return 'error'
    case 'TIMEOUT':   return 'warning'
    default:          return 'default'
  }
}
