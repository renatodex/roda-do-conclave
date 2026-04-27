import { getArchonte } from "~/data/archontes";
import { useConclave } from "~/context/ConclaveContext";

const OUTCOME_CONFIG = {
  approved: {
    label: "Aprovada",
    chip: "border-green-700 bg-green-900/30 text-green-300",
  },
  rejected: {
    label: "Rejeitada",
    chip: "border-red-700 bg-red-900/30 text-red-300",
  },
  tied: {
    label: "Empate",
    chip: "border-gray-600 bg-gray-800/40 text-gray-300",
  },
  blocked: {
    label: "Bloqueada",
    chip: "border-red-800 bg-red-950/40 text-red-300",
  },
};

const VOTE_LABEL = {
  favor: "A favor",
  contra: "Contra",
  abster: "Abstém",
};

export default function DeliberationsList() {
  const { deliberations } = useConclave();

  if (deliberations.length === 0) {
    return (
      <div>
        <h3 className="font-display text-sm text-gray-500 uppercase tracking-wider mb-3">
          Deliberações
        </h3>
        <p className="text-gray-700 text-xs italic">
          Nenhuma pauta vinculante deliberada
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display text-sm text-gray-500 uppercase tracking-wider mb-3">
        Deliberações ({deliberations.length})
      </h3>
      <div className="space-y-3">
        {deliberations.map((deliberation) => {
          const cfg = OUTCOME_CONFIG[deliberation.outcome] ?? OUTCOME_CONFIG.tied;
          return (
            <div
              key={deliberation.id}
              className="p-3 bg-gray-900/60 border border-amber-900/30 rounded-lg"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-display text-sm text-gray-200 font-semibold leading-tight">
                  {deliberation.title}
                </h4>
                <span
                  className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-display shrink-0 ${cfg.chip}`}
                >
                  {cfg.label}
                </span>
              </div>
              {deliberation.description && (
                <p className="text-[11px] text-gray-500 font-body mb-2 italic">
                  {deliberation.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-body mb-2">
                <span className="text-green-400">✓ {deliberation.tally.favor}</span>
                <span className="text-red-400">✕ {deliberation.tally.contra}</span>
                <span>○ {deliberation.tally.abster}</span>
                {deliberation.overridden && (
                  <span className="text-amber-400 ml-auto">↻ revertida pelo Conclave</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {deliberation.votes.map((v) => {
                  const a = getArchonte(v.archonteId);
                  const tone =
                    v.vote === "favor"
                      ? "border-green-700/50 text-green-300/90"
                      : v.vote === "contra"
                        ? "border-red-700/50 text-red-300/90"
                        : "border-gray-700 text-gray-500";
                  return (
                    <span
                      key={v.archonteId}
                      title={`${a?.name} • ${VOTE_LABEL[v.vote]} • peso ${v.weight}${v.justification ? ` — ${v.justification}` : ""}`}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-950/40 border rounded text-[10px] ${tone}`}
                    >
                      <img
                        src={a?.avatar}
                        alt={a?.name}
                        className="w-3.5 h-3.5 rounded-full object-cover"
                      />
                      {a?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
