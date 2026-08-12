interface ActivityCompletionButtonProps {
  completed: boolean
  isHe: boolean
  onToggle: () => void
  compact?: boolean
}

export function ActivityCompletionButton({
  completed,
  isHe,
  onToggle,
  compact = false,
}: ActivityCompletionButtonProps) {
  return (
    <button
      type="button"
      className={`btn activity-completion${completed ? ' completed' : ''}${compact ? ' compact' : ''}`}
      aria-pressed={completed}
      onClick={onToggle}
    >
      <span aria-hidden="true">{completed ? '✓' : '○'}</span>
      {completed
        ? isHe
          ? 'הושלם'
          : 'Done'
        : isHe
          ? 'סיימנו'
          : 'Mark done'}
    </button>
  )
}
