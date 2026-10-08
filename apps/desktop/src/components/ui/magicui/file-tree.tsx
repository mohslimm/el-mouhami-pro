import React, { useState } from 'react'
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TreeViewElement {
  id: string
  name: string
  type?: 'file' | 'folder'
  children?: TreeViewElement[]
  size?: string
  date?: string
  filePath?: string
}

interface FileTreeProps {
  elements: TreeViewElement[]
  initialSelectedId?: string
  onSelect?: (element: TreeViewElement) => void
  className?: string
}

export function FileTree({ elements, initialSelectedId, onSelect, className }: FileTreeProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([elements[0]?.id]))

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleNodeClick = (node: TreeViewElement, e: React.MouseEvent) => {
    setSelectedId(node.id)
    const isFolder = node.type === 'folder' || Boolean(node.children && node.children.length > 0)
    if (isFolder) {
      toggleExpand(node.id, e)
    } else if (node.filePath && typeof globalThis.window !== 'undefined' && globalThis.window.electronAPI?.openPath) {
      globalThis.window.electronAPI.openPath(node.filePath)
    }
    if (onSelect) onSelect(node)
  }

  const renderNode = (node: TreeViewElement, depth = 0) => {
    const isFolder = node.type === 'folder' || Boolean(node.children && node.children.length > 0)
    const isExpanded = expandedIds.has(node.id)
    const isSelected = selectedId === node.id

    return (
      <div key={node.id} className="flex flex-col">
        <button
          onClick={(e) => handleNodeClick(node, e)}
          style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-md py-1.5 pr-2 text-xs transition-colors duration-150',
            isSelected
              ? 'bg-[var(--gold-glow)] text-[var(--gold-400)] font-medium border border-[var(--border-gold)]'
              : 'text-[var(--text-primary)] hover:bg-white/5'
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            {isFolder ? (
              <span className="text-[var(--gold-400)]">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            ) : (
              <span className="w-3.5" />
            )}

            {isFolder ? (
              isExpanded ? (
                <FolderOpen size={16} className="text-[var(--gold-400)]" />
              ) : (
                <Folder size={16} className="text-[var(--gold-400)]" />
              )
            ) : (
              <FileText size={16} className="text-[var(--text-muted)]" />
            )}

            <span className="truncate">{node.name}</span>
          </div>

          {(node.size || node.date) && (
            <div className="flex items-center gap-2 text-[0.68rem] text-[var(--text-muted)]">
              {node.size && <span>{node.size}</span>}
              {node.date && <span>{node.date}</span>}
            </div>
          )}
        </button>

        {isFolder && isExpanded && node.children && (
          <div className="flex flex-col">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-0.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2', className)}>
      {elements.map((node) => renderNode(node, 0))}
    </div>
  )
}
