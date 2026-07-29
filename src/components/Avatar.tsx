function initialsFor(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-surfaceMuted text-[10px] font-medium text-brand-textMuted"
      style={{ width: size, height: size }}
    >
      {initialsFor(name)}
    </span>
  )
}
