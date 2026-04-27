import { useMemo } from "react";
import {
  ARCHONTES,
  compareByPrestige,
  pickPotestade,
} from "~/data/archontes";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";
import ArchonteCard from "./ArchonteCard";

export default function PresidentSelect() {
  const { president, excluded, honrariaMode } = useConclave();
  const dispatch = useConclaveDispatch();

  const presentArchontes = useMemo(
    () => ARCHONTES.filter((a) => !excluded[a.id]),
    [excluded]
  );

  const presentIds = presentArchontes.map((a) => a.id);
  const recommended = pickPotestade(presentIds, honrariaMode);

  const sortedForList = useMemo(
    () =>
      [...presentArchontes].sort((a, b) =>
        compareByPrestige(a, b, honrariaMode === "lowest" ? "asc" : "desc")
      ),
    [presentArchontes, honrariaMode]
  );

  function setMode(mode) {
    dispatch({ type: "SET_HONRARIA_MODE", payload: mode });
  }

  function confirm() {
    if (!president) return;
    dispatch({ type: "SET_PRESIDENT", payload: president });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl md:text-3xl text-gray-100 mb-2">
          Honraria do Potestade
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Cada Conclave é governado por um único Arconte. A honraria recai sobre o de maior
          Prestígio entre os presentes; no Conclave seguinte, sobre o de menor (Codex 3.1–3.3).
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-red-900/40 bg-gray-950/60 p-1">
          <button
            onClick={() => setMode("highest")}
            className={`px-4 py-2 text-xs font-display uppercase tracking-wider rounded-md transition-colors ${
              honrariaMode === "highest"
                ? "bg-red-900/60 text-gray-100 border border-red-700"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Maior Prestígio
          </button>
          <button
            onClick={() => setMode("lowest")}
            className={`px-4 py-2 text-xs font-display uppercase tracking-wider rounded-md transition-colors ${
              honrariaMode === "lowest"
                ? "bg-red-900/60 text-gray-100 border border-red-700"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Menor Prestígio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sortedForList.map((archonte) => {
          const isRecommended = archonte.id === recommended;
          return (
            <div key={archonte.id} className="relative">
              {isRecommended && (
                <span className="absolute -top-2 left-3 z-10 px-2 py-0.5 text-[10px] font-display uppercase tracking-wider bg-amber-600 text-gray-950 rounded">
                  Honraria
                </span>
              )}
              <ArchonteCard
                archonte={archonte}
                selected={president === archonte.id}
                onClick={() =>
                  dispatch({ type: "SET_PRESIDENT", payload: archonte.id })
                }
              >
                <div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-wider">
                  <span className="text-amber-500/80">
                    Prestígio {archonte.prestige}
                  </span>
                  <span className="text-gray-500">
                    Hierarquia {archonte.hierarchy}
                  </span>
                </div>
              </ArchonteCard>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={confirm}
          disabled={!president}
          className="px-8 py-3 bg-red-800 hover:bg-red-700 text-gray-100 font-display font-semibold rounded-lg border border-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirmar Potestade
        </button>
      </div>
    </div>
  );
}
