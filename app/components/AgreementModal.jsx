import { useState } from "react";
import { ARCHONTES } from "~/data/archontes";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";

export default function AgreementModal() {
  const { excluded, round } = useConclave();
  const dispatch = useConclaveDispatch();
  const activeArchontes = ARCHONTES.filter((a) => !excluded[a.id]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [signatories, setSignatories] = useState([]);
  const [selectedRound, setSelectedRound] = useState(round);

  function toggleSignatory(id) {
    setSignatories((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    dispatch({
      type: "CREATE_AGREEMENT",
      payload: {
        title: title.trim(),
        description: description.trim(),
        signatories,
        round: selectedRound,
      },
    });
  }

  function handleClose() {
    dispatch({ type: "CLOSE_AGREEMENT_MODAL" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg bg-gray-950 border border-red-900/60 rounded-xl p-6 shadow-2xl shadow-red-900/20"
      >
        <h2 className="font-display text-xl text-gray-100 mb-1">
          Firmar Acordo
        </h2>
        <p className="text-gray-500 text-xs mb-6 font-body">
          Registre uma decisão tomada pelo Conclave
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-1">
              Título do Acordo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pacto de não-agressão..."
              autoFocus
              className="w-full px-3 py-2.5 bg-gray-900 border border-red-900/40 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-600 text-sm font-body"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do acordo..."
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-900 border border-red-900/40 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-600 text-sm font-body resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-2">
              Rodada
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: round }, (_, i) => i + 1).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRound(r)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-display transition-colors ${
                    selectedRound === r
                      ? "border-red-600 bg-red-900/30 text-gray-100"
                      : "border-gray-800 bg-gray-900/40 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-2">
              Signatários
            </label>
            <div className="grid grid-cols-2 gap-2">
              {activeArchontes.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleSignatory(a.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                    signatories.includes(a.id)
                      ? "border-red-600 bg-red-900/30 text-gray-200"
                      : "border-gray-800 bg-gray-900/40 text-gray-500 hover:border-gray-600"
                  }`}
                >
                  <img
                    src={a.avatar}
                    alt={a.name}
                    className="w-6 h-6 rounded-full object-cover border border-red-900/40 shrink-0"
                  />
                  <span className="font-body">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 text-gray-400 hover:text-gray-200 text-sm font-body transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-6 py-2 bg-red-800 hover:bg-red-700 text-gray-100 font-display font-semibold rounded-lg border border-red-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Selar Acordo
          </button>
        </div>
      </form>
    </div>
  );
}
