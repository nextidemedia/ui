export function ComponentReference({
  names,
}: {
  names: string | readonly string[]
}) {
  const componentNames = typeof names === "string" ? [names] : names

  return (
    <div
      data-slot="component-reference"
      aria-label="Component reference"
      className="flex flex-wrap gap-x-3 gap-y-1"
    >
      {componentNames.map((name) => (
        <code
          key={name}
          data-component-name={name}
          className="text-ui-caption font-medium text-nextide-tide"
        >
          {name}
        </code>
      ))}
    </div>
  )
}
