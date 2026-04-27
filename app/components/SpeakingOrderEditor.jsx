import { useState } from "react";
import { ARCHONTES, getArchonte, orderForSpeaking } from "~/data/archontes";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";
import ArchonteCard from "./ArchonteCard";

export default function SpeakingOrderEditor() {
  const { president, excluded, baseSpeakingOrder } = useConclave();
  const dispatch = useConclaveDispatch();

  const initial =
    baseSpeakingOrder.length > 0
      ? baseSpeakingOrder
      : orderForSpeaking(
          ARCHONTES.filter((a) => !excluded[a.id]).map((a) => a.id),
          president
        );

  const [order, setOrder] = useState(initial);

  function moveUp(index) {
    if (index <= 1) return;
    const next = [...order];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setOrder(next);
  }

  function moveDown(index) {
    if (index === 0 || index === order.length - 1) return;
    const next = [...order];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setOrder(next);
  }

  function reset() {
    const presentIds = ARCHONTES.filter((a) => !excluded[a.id]).map((a) => a.id);
    setOrder(orderForSpeaking(presentIds, president));
  }

  function confirm() {
    dispatch({ type: "SET_SPEAKING_ORDER", payload: order });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-gray-100 mb-2">
          Ordem de Fala
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Inicia-se pelo Potestade e segue por ordem de Prestígio (Codex 5.1).
          Ajuste manualmente os demais, se necessário.
        </p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
          Ordem dos Arcontes
        </p>
        <button
          onClick={reset}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          ↺ Restaurar ordem por Prestígio
        </button>
      </div>

      <div className="space-y-2">
        {order.map((id, index) => {
          const archonte = getArchonte(id);
          const isPotestade = id === president;
          return (
            <div key={id} className="flex items-center gap-2">
              <span className="text-gray-600 font-display text-sm w-6 text-right">
                {index + 1}.
              </span>
              <div className="flex-1">
                <ArchonteCard archonte={archonte} size="sm" selected={isPotestade}>
                  <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider">
                    {isPotestade && (
                      <span className="text-amber-500 font-display">
                        Potestade
                      </span>
                    )}
                    <span className="text-amber-500/70">
                      Prestígio {archonte.prestige}
                    </span>
                    <span className="text-gray-500">
                      Voto {archonte.votingPower}
                    </span>
                  </div>
                </ArchonteCard>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index <= 1}
                  className="px-2 py-1 text-xs rounded border border-red-900/40 text-gray-400 hover:text-gray-100 hover:border-red-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === 0 || index === order.length - 1}
                  className="px-2 py-1 text-xs rounded border border-red-900/40 text-gray-400 hover:text-gray-100 hover:border-red-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={confirm}
          className="px-8 py-3 bg-red-800 hover:bg-red-700 text-gray-100 font-display font-semibold rounded-lg border border-red-600 transition-colors"
        >
          Confirmar Ordem
        </button>
      </div>
    </div>
  );
}
