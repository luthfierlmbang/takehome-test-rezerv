export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2 border-b border-brand-border bg-white px-6 py-6">
      <h1 className="text-2xl font-medium text-black">{title}</h1>
      <p className="text-base text-brand-textMuted">{description}</p>
    </div>
  )
}
