import { useState } from "react";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";

export default function RoundSummaryPanel() {
  const { round, roundSummaries } = useConclave();
  const dispatch = useConclaveDispatch();
  const [editingRound, setEditingRound] = useState(null);
  const [text, setText] = useState("");

  const pastRounds = Object.keys(roundSummaries)
    .map(Number)
    .filter((r) => roundSummaries[r])
    .sort((a, b) => a - b);

  function handleEdit(r) {
    setEditingRound(r);
    setText(roundSummaries[r] || "");
  }

  function handleSave() {
    dispatch({
      type: "SET_ROUND_SUMMARY",
      payload: { round: editingRound, text: text.trim() },
    });
    setEditingRound(null);
    setText("");
  }

  function handleCancel() {
    setEditingRound(null);
    setText("");
  }

  if (pastRounds.length === 0) {
    return (
      <div>
        <h3 className="font-display text-sm text-gray-500 uppercase tracking-wider mb-3">
          Sumários
        </h3>
        <p className="text-xs text-gray-700 italic font-body">
          Os sumários aparecerão aqui ao final de cada rodada.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display text-sm text-gray-500 uppercase tracking-wider mb-3">
        Sumários
      </h3>

      <div className="space-y-3">
        {pastRounds.map((r) => (
          <div key={r}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-600 font-display uppercase">
                Rodada {r}
              </span>
              {editingRound !== r && (
                <button
                  onClick={() => handleEdit(r)}
                  className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Editar
                </button>
              )}
            </div>
            {editingRound === r ? (
              <div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  autoFocus
                  className="w-full px-2 py-1.5 bg-gray-900 border border-red-900/40 rounded text-gray-300 text-xs font-body focus:outline-none focus:border-red-600 resize-none"
                />
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleSave}
                    disabled={!text.trim()}
                    className="text-[10px] text-red-400 hover:text-red-300 disabled:opacity-40"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-[10px] text-gray-600 hover:text-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-body whitespace-pre-wrap">
                {roundSummaries[r]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
