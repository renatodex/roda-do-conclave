import { useState } from "react";
import { ARCHONTES, MAX_ATTENDEES, compareByPrestige } from "~/data/archontes";
import { useConclaveDispatch } from "~/context/ConclaveContext";

const STATUS_CONFIG = {
  present: {
    label: "Presente",
    border: "border-green-700",
    bg: "bg-green-900/20",
    text: "text-green-400",
    badge: "bg-green-900/40 border-green-700",
  },
  absent: {
    label: "Ausente",
    border: "border-red-700",
    bg: "bg-red-900/20",
    text: "text-red-400",
    badge: "bg-red-900/40 border-red-700",
  },
  not_participating: {
    label: "Não participa",
    border: "border-gray-700",
    bg: "bg-gray-900/20",
    text: "text-gray-500",
    badge: "bg-gray-800/40 border-gray-700",
  },
};

const NEXT_STATUS = {
  present: "absent",
  absent: "not_participating",
  not_participating: "present",
};

function initialStatuses() {
  const sorted = [...ARCHONTES].sort((a, b) => compareByPrestige(a, b, "desc"));
  const result = {};
  sorted.forEach((a, idx) => {
    result[a.id] = idx < MAX_ATTENDEES ? "present" : "not_participating";
  });
  return result;
}

export default function AttendanceEditor() {
  const dispatch = useConclaveDispatch();
  const [statuses, setStatuses] = useState(initialStatuses);

  const presentCount = Object.values(statuses).filter((s) => s === "present").length;
  const overCap = presentCount > MAX_ATTENDEES;
  const noPresent = presentCount === 0;

  function cycle(id) {
    setStatuses((prev) => {
      const current = prev[id];
      let next = NEXT_STATUS[current];
      if (next === "present") {
        const presentNow = Object.entries(prev).filter(
          ([key, value]) => value === "present" && key !== id
        ).length;
        if (presentNow >= MAX_ATTENDEES) next = "absent";
      }
      return { ...prev, [id]: next };
    });
  }

  function confirm() {
    const excluded = {};
    for (const [id, status] of Object.entries(statuses)) {
      if (status !== "present") excluded[id] = status;
    }
    dispatch({ type: "SET_EXCLUDED", payload: excluded });
  }

  const sorted = [...ARCHONTES].sort((a, b) => compareByPrestige(a, b, "desc"));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-gray-100 mb-2">
          Presença dos Arcontes
        </h2>
        <p className="text-gray-400 text-sm">
          Reúnem-se em meu Templo até <span className="text-red-400 font-semibold">{MAX_ATTENDEES}</span> Arcontes.
          Clique para alternar: Presente → Ausente → Não participa.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-wider font-semibold">
        <span className="text-gray-500">Listagem por Prestígio</span>
        <span
          className={`px-2.5 py-1 rounded-full border ${
            overCap
              ? "border-red-600 bg-red-900/40 text-red-300"
              : noPresent
                ? "border-gray-700 bg-gray-900/40 text-gray-500"
                : "border-green-700 bg-green-900/30 text-green-300"
          }`}
        >
          {presentCount}/{MAX_ATTENDEES} presentes
        </span>
      </div>

      <div className="space-y-2">
        {sorted.map((archonte) => {
          const status = statuses[archonte.id];
          const config = STATUS_CONFIG[status];
          return (
            <button
              key={archonte.id}
              onClick={() => cycle(archonte.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${config.border} ${config.bg}`}
            >
              <img
                src={archonte.avatar}
                alt={archonte.name}
                className={`w-9 h-9 rounded-full object-cover border shrink-0 ${
                  status === "not_participating"
                    ? "opacity-40 border-gray-700"
                    : status === "absent"
                      ? "opacity-60 border-red-800"
                      : "border-red-900/50"
                }`}
              />
              <div
                className={`flex-1 min-w-0 ${
                  status === "not_participating"
                    ? "text-gray-600"
                    : status === "absent"
                      ? "text-gray-400"
                      : "text-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm">
                    {archonte.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-amber-500/80">
                    Prestígio {archonte.prestige}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">
                    Hierarquia {archonte.hierarchy}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate font-body">
                  Poder de Votação {archonte.votingPower}
                </p>
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badge} ${config.text}`}
              >
                {config.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center space-y-2">
        {overCap && (
          <p className="text-xs text-red-400 font-body">
            O Conclave admite no máximo {MAX_ATTENDEES} Arcontes presentes (Codex, regra 1).
          </p>
        )}
        <button
          onClick={confirm}
          disabled={noPresent || overCap}
          className="px-8 py-3 bg-red-800 hover:bg-red-700 text-gray-100 font-display font-semibold rounded-lg border border-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirmar Presença
        </button>
      </div>
    </div>
  );
}
