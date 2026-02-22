type Props = {
  type: "assistential" | "technical";
  title: string;
  text: string;
  author: string;
};

export default function MessageCard({
  type,
  title,
  text,
  author,
}: Props) {
  const isAssistential = type === "assistential";

  return (
    <div
      className={`
        max-w-2xl rounded-xl p-6 shadow-soft
        ${
          isAssistential
            ? "bg-sinergya-blue/5 border-l-4 border-sinergya-blue"
            : "bg-gradient-to-r from-sinergya-green/10 via-sinergya-turquoise/10 to-transparent border-l-4 border-sinergya-green"
        }
      `}
    >
      <h3
        className={`text-xs font-semibold uppercase ${
          isAssistential
            ? "text-sinergya-blue"
            : "text-sinergya-green"
        }`}
      >
        {title}
      </h3>

      <p className="mt-2 text-slate-700">
        {text}
      </p>

      <span className="mt-3 block text-xs text-slate-500">
        {author}
      </span>
    </div>
  );
}
