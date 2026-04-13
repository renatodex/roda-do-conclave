import { useState } from "react";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";

export default function RoundSummaryModal() {
  const { round, currentAgendaItemId, agenda } = useConclave();
  const dispatch = useConclaveDispatch();
  const [text, setText] = useState("");

  const agendaItem = currentAgendaItemId
    ? agenda.find((i) => i.id === currentAgendaItemId)
    : null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: "CONFIRM_ROUND_SUMMARY", payload: text.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg bg-gray-950 border border-red-900/60 rounded-xl p-6 shadow-2xl shadow-red-900/20"
      >
        <h2 className="font-display text-xl text-gray-100 mb-1">
          Sumário da Rodada {round}
        </h2>
        <p className="text-gray-500 text-xs mb-5 font-body">
          Registre o desfecho desta rodada antes de prosseguir.
          {agendaItem && (
            <span className="text-amber-400 ml-1">
              Pauta: {agendaItem.text}
            </span>
          )}
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          autoFocus
          placeholder="Descreva os pontos discutidos e decisões tomadas nesta rodada..."
          className="w-full px-3 py-2.5 bg-gray-900 border border-red-900/40 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-600 text-sm font-body resize-none"
        />

        <div className="flex justify-end mt-5">
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-6 py-2.5 bg-red-800 hover:bg-red-700 text-gray-100 font-display font-semibold rounded-lg border border-red-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Registrar e Avançar →
          </button>
        </div>
      </form>
    </div>
  );
}
