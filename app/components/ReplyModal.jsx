import { ARCHONTES } from "~/data/archontes";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";

export default function ReplyModal() {
  const { roundQueue, currentQueueIndex, excluded } = useConclave();
  const dispatch = useConclaveDispatch();

  const currentEntry = roundQueue[currentQueueIndex];
  const currentSpeakerId = currentEntry?.archonteId;

  const eligibleArchontes = ARCHONTES.filter(
    (a) => a.id !== currentSpeakerId && !excluded[a.id]
  );

  function handleClose() {
    dispatch({ type: "CLOSE_REPLY_MODAL" });
  }

  function handleSelect(archonteId) {
    dispatch({ type: "GRANT_REPLY_RIGHT", payload: archonteId });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-gray-950 border border-purple-900/60 rounded-xl p-6 shadow-2xl shadow-purple-900/20">
        <h2 className="font-display text-xl text-gray-100 mb-1">
          Direito de Resposta
        </h2>
        <p className="text-gray-500 text-xs mb-5 font-body">
          Selecione o Arconte que receberá direito de resposta a{" "}
          <span className="text-purple-400">
            {ARCHONTES.find((a) => a.id === currentSpeakerId)?.name}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-2">
          {eligibleArchontes.map((a) => (
            <button
              key={a.id}
              onClick={() => handleSelect(a.id)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-800 bg-gray-900/40 text-gray-400 hover:border-purple-600 hover:text-gray-200 hover:bg-purple-900/20 text-sm transition-colors text-left"
            >
              <img
                src={a.avatar}
                alt={a.name}
                className="w-7 h-7 rounded-full object-cover border border-purple-900/40 shrink-0"
              />
              <span className="font-display text-sm">{a.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-gray-400 hover:text-gray-200 text-sm font-body transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
