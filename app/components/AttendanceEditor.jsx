import { useState } from "react";
import { ARCHONTES, getArchonte } from "~/data/archontes";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";

export default function AttendanceEditor() {
  const { president } = useConclave();
  const dispatch = useConclaveDispatch();
  const presidentArchonte = getArchonte(president);

  const others = ARCHONTES.filter((a) => a.id !== president);
  const [statuses, setStatuses] = useState(
    Object.fromEntries(others.map((a) => [a.id, "present"]))
  );

  function cycle(id) {
    setStatuses((prev) => {
      const current = prev[id];
      const next =
        current === "present"
          ? "absent"
          : current === "absent"
            ? "not_participating"
            : "present";
      return { ...prev, [id]: next };
    });
  }

  function confirm() {
    const excluded = {};
    for (const [id, status] of Object.entries(statuses)) {
      if (status !== "present") {
        excluded[id] = status;
      }
    }
    dispatch({ type: "SET_EXCLUDED", payload: excluded });
  }

  const presentCount = Object.values(statuses).filter(
    (s) => s === "present"
  ).length;

  const statusConfig = {
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-gray-100 mb-2">
          Presença dos Arcontes
        </h2>
        <p className="text-gray-400 text-sm">
          Clique para alternar: Presente → Ausente → Não participa
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
          Presidente da Mesa (sempre presente)
        </p>
        <div className="flex items-center gap-3 p-2.5 rounded-lg border border-green-700 bg-green-900/20">
          <img
            src={presidentArchonte.avatar}
            alt={presidentArchonte.name}
            className="w-8 h-8 rounded-full object-cover border border-green-700/50 shrink-0"
          />
          <span className="font-display font-bold text-gray-100 text-sm flex-1">
            {presidentArchonte.name}
          </span>
          <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">
            Presente
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
          Demais Arcontes
        </p>
        <div className="space-y-2">
          {others.map((archonte) => {
            const status = statuses[archonte.id];
            const config = statusConfig[status];
            return (
              <button
                key={archonte.id}
                onClick={() => cycle(archonte.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${config.border} ${config.bg}`}
              >
                <img
                  src={archonte.avatar}
                  alt={archonte.name}
                  className={`w-8 h-8 rounded-full object-cover border shrink-0 ${
                    status === "not_participating"
                      ? "opacity-40 border-gray-700"
                      : status === "absent"
                        ? "opacity-60 border-red-800"
                        : "border-red-900/50"
                  }`}
                />
                <span
                  className={`font-display font-bold text-sm flex-1 ${
                    status === "not_participating"
                      ? "text-gray-600"
                      : status === "absent"
                        ? "text-gray-400"
                        : "text-gray-100"
                  }`}
                >
                  {archonte.name}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badge} ${config.text}`}
                >
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={confirm}
          disabled={presentCount === 0}
          className="px-8 py-3 bg-red-800 hover:bg-red-700 text-gray-100 font-display font-semibold rounded-lg border border-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirmar Presença ({presentCount + 1} participantes)
        </button>
      </div>
    </div>
  );
}
