// Renders a translation string, coloring **marked** segments with the accent.
// Lets each language decide which words get highlighted.
export default function AccentText({ text }) {
  return String(text)
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="text-accent">
          {part}
        </span>
      ) : (
        part
      ),
    )
}
