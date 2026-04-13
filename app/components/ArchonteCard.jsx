const sizeClasses = {
  sm: "p-2.5",
  md: "p-3",
  lg: "p-5",
};

const avatarSizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

const nameSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

export default function ArchonteCard({
  archonte,
  size = "md",
  selected = false,
  speaking = false,
  denied = false,
  done = false,
  onClick,
  className = "",
  children,
}) {
  const isClickable = !!onClick;

  const baseClasses = [
    "rounded-lg border transition-all duration-300 font-body",
    sizeClasses[size],
    className,
  ];

  if (speaking) {
    baseClasses.push(
      "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/50"
    );
  } else if (selected) {
    baseClasses.push(
      "border-red-600 bg-red-900/30 shadow-lg shadow-red-900/30"
    );
  } else if (denied) {
    baseClasses.push("border-red-900/50 bg-red-950/30 opacity-60");
  } else if (done) {
    baseClasses.push("border-gray-700 bg-gray-900/40 opacity-70");
  } else {
    baseClasses.push("border-red-900/40 bg-gray-900/60");
  }

  if (isClickable && !denied && !done) {
    baseClasses.push("cursor-pointer hover:border-red-600 hover:bg-red-900/20");
  }

  return (
    <div
      className={baseClasses.join(" ")}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        <img
          src={archonte.avatar}
          alt={archonte.name}
          className={`${avatarSizes[size]} rounded-full object-cover border border-red-900/50 shrink-0`}
        />
        <div className="min-w-0 flex-1">
          <h3
            className={`font-display font-bold text-gray-100 ${nameSizes[size]}`}
          >
            {archonte.name}
          </h3>
          {size !== "sm" && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {archonte.description}
            </p>
          )}
        </div>
        {speaking && (
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
            Falando
          </span>
        )}
        {denied && (
          <span className="text-red-500 text-xs font-semibold uppercase tracking-wider">
            Negado
          </span>
        )}
        {done && (
          <span className="text-green-600 text-xs">✓</span>
        )}
      </div>
      {children}
    </div>
  );
}
