import { useState } from "react";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";

export default function AgendaSetup() {
  const { agenda } = useConclave();
  const dispatch = useConclaveDispatch();
  const [text, setText] = useState("");

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch({ type: "ADD_AGENDA_ITEM", payload: trimmed });
    setText("");
  }

  function handleStart() {
    dispatch({ type: "START_SESSION" });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-gray-100 mb-2">
          Pauta do Conclave
        </h2>
        <p className="text-gray-400 text-sm">
          Adicione os assuntos a serem tratados nesta sessão
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Novo item da pauta..."
          className="flex-1 px-4 py-2.5 bg-gray-900 border border-red-900/40 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-600 font-body text-sm"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-red-900/60 hover:bg-red-800 text-gray-200 rounded-lg border border-red-900/40 hover:border-red-600 transition-colors text-sm font-semibold"
        >
          Adicionar
        </button>
      </form>

      {agenda.length > 0 && (
        <ul className="space-y-2 mb-8">
          {agenda.map((item, i) => (
            <li
              key={item.id}
              className="flex items-center gap-3 p-3 bg-gray-900/60 border border-red-900/20 rounded-lg"
            >
              <span className="text-red-700 font-display text-sm font-bold">
                {i + 1}.
              </span>
              <span className="flex-1 text-gray-300 text-sm font-body">
                {item.text}
              </span>
              <button
                onClick={() =>
                  dispatch({ type: "REMOVE_AGENDA_ITEM", payload: item.id })
                }
                className="text-gray-600 hover:text-red-500 transition-colors text-lg leading-none"
                aria-label="Remover item"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="text-center">
        <button
          onClick={handleStart}
          className="px-10 py-3.5 bg-red-700 hover:bg-red-600 text-gray-100 font-display text-lg font-bold rounded-lg border border-red-500 shadow-lg shadow-red-900/40 transition-all hover:shadow-red-800/60"
        >
          ⛧ Abrir o Conclave
        </button>
        {agenda.length === 0 && (
          <p className="text-gray-600 text-xs mt-3">
            Você pode iniciar sem pauta e adicionar itens durante a sessão
          </p>
        )}
      </div>
    </div>
  );
}
