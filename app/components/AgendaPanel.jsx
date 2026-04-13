import { useState } from "react";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";

export default function AgendaPanel() {
  const { agenda, currentAgendaItemId } = useConclave();
  const dispatch = useConclaveDispatch();
  const [text, setText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch({ type: "ADD_AGENDA_ITEM", payload: trimmed });
    setText("");
    setIsAdding(false);
  }

  function handleBind(itemId) {
    if (currentAgendaItemId === itemId) {
      dispatch({ type: "CLEAR_ROUND_AGENDA" });
    } else {
      dispatch({ type: "SET_ROUND_AGENDA", payload: itemId });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm text-gray-500 uppercase tracking-wider">
          Pauta
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          {isAdding ? "Cancelar" : "+ Adicionar"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Novo item..."
            autoFocus
            className="w-full px-3 py-2 bg-gray-900 border border-red-900/40 rounded text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-600 text-xs font-body"
          />
        </form>
      )}

      {agenda.length === 0 ? (
        <p className="text-gray-700 text-xs italic">Nenhum item na pauta</p>
      ) : (
        <ul className="space-y-1.5">
          {agenda.map((item) => {
            const isBound = currentAgendaItemId === item.id;
            return (
              <li
                key={item.id}
                className={`flex items-start gap-2 group rounded-md px-1.5 py-1.5 -mx-1.5 transition-colors ${
                  isBound
                    ? "bg-amber-500/10 border border-amber-500/30 shadow-sm shadow-amber-500/10"
                    : ""
                }`}
              >
                <button
                  onClick={() =>
                    dispatch({ type: "TOGGLE_AGENDA_ITEM", payload: item.id })
                  }
                  className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                    item.completed
                      ? "bg-red-800 border-red-600 text-gray-200"
                      : "border-gray-600 hover:border-red-600"
                  }`}
                >
                  {item.completed && (
                    <span className="text-[10px]">✓</span>
                  )}
                </button>
                <span
                  className={`text-xs font-body flex-1 ${
                    item.completed
                      ? "text-gray-600 line-through"
                      : isBound
                        ? "text-amber-300"
                        : "text-gray-300"
                  }`}
                >
                  {item.text}
                </span>
                {!item.completed && (
                  <button
                    onClick={() => handleBind(item.id)}
                    title={isBound ? "Desvincular da rodada" : "Pautar nesta rodada"}
                    className={`text-[10px] shrink-0 px-1.5 py-0.5 rounded border transition-all ${
                      isBound
                        ? "border-amber-500/50 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                        : "border-gray-700 text-gray-600 hover:border-amber-600 hover:text-amber-400"
                    }`}
                  >
                    {isBound ? "✦ Em pauta" : "✦ Pautar"}
                  </button>
                )}
                <button
                  onClick={() =>
                    dispatch({ type: "REMOVE_AGENDA_ITEM", payload: item.id })
                  }
                  className="text-gray-700 hover:text-red-500 transition-colors text-xs opacity-0 group-hover:opacity-100"
                  aria-label="Remover"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
