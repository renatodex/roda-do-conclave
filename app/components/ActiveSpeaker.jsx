import { getArchonte } from "~/data/archontes";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";

export default function ActiveSpeaker() {
  const { roundQueue, currentQueueIndex, currentSpeakerStatus } = useConclave();
  const dispatch = useConclaveDispatch();

  const entry = roundQueue[currentQueueIndex];
  if (!entry) return null;

  const archonte = getArchonte(entry.archonteId);
  if (!archonte) return null;

  const isReply = entry.type === "reply";
  const replyToArchonte = isReply ? getArchonte(entry.replyTo) : null;

  const statusLabel = {
    waiting: "Aguardando a palavra",
    speaking: "Com a palavra",
    denied: "Palavra negada",
  };

  const statusColor = {
    waiting: "text-gray-400",
    speaking: "text-amber-400",
    denied: "text-red-500",
  };

  const ringColor = {
    waiting: isReply ? "border-purple-700" : "border-gray-700",
    speaking: isReply
      ? "border-purple-500 shadow-lg shadow-purple-500/20"
      : "border-amber-500 shadow-lg shadow-amber-500/20",
    denied: "border-red-800",
  };

  return (
    <div className="flex flex-col items-center">
      {isReply && (
        <div className="mb-3 px-4 py-1.5 bg-purple-900/30 border border-purple-700/50 rounded-full flex items-center gap-2">
          <span className="text-purple-400 text-xs font-display">↩ Direito de Resposta</span>
          <span className="text-gray-500 text-xs">a</span>
          <img
            src={replyToArchonte?.avatar}
            alt={replyToArchonte?.name}
            className="w-5 h-5 rounded-full object-cover border border-purple-700/50"
          />
          <span className="text-purple-300 text-xs font-display">{replyToArchonte?.name}</span>
        </div>
      )}

      <div
        className={`w-full max-w-md p-8 rounded-xl border-2 bg-gray-900/80 transition-all duration-500 ${ringColor[currentSpeakerStatus]}`}
      >
        <div className="text-center">
          <img
            src={archonte.avatar}
            alt={archonte.name}
            className="w-28 h-28 rounded-full object-cover border-2 border-red-900/50 mx-auto mb-4"
          />
          <h2 className="font-display text-3xl text-gray-100 font-bold mb-1">
            {archonte.name}
          </h2>
          <p className="text-gray-500 text-sm mb-4 font-body">
            {archonte.description}
          </p>
          <p
            className={`text-sm font-semibold uppercase tracking-wider ${statusColor[currentSpeakerStatus]} ${currentSpeakerStatus === "speaking" ? "animate-pulse" : ""}`}
          >
            {statusLabel[currentSpeakerStatus]}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {currentSpeakerStatus === "waiting" && (
          <>
            <button
              onClick={() => dispatch({ type: "GRANT_WORD" })}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 text-gray-100 font-display font-semibold rounded-lg border border-amber-500 transition-colors text-sm"
            >
              ✦ Dar a Palavra
            </button>
            <button
              onClick={() => dispatch({ type: "DENY_WORD" })}
              className="px-6 py-2.5 bg-red-900/60 hover:bg-red-800 text-gray-300 font-display font-semibold rounded-lg border border-red-900/60 hover:border-red-600 transition-colors text-sm"
            >
              ✕ Negar
            </button>
          </>
        )}

        {currentSpeakerStatus === "speaking" && (
          <>
            <button
              onClick={() => dispatch({ type: "OPEN_REPLY_MODAL" })}
              className="px-5 py-2.5 bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 font-display font-semibold rounded-lg border border-purple-700/50 hover:border-purple-600 transition-colors text-sm"
            >
              ↩ Direito de Resposta
            </button>
            <button
              onClick={() => dispatch({ type: "NEXT_SPEAKER" })}
              className="px-8 py-2.5 bg-red-800 hover:bg-red-700 text-gray-100 font-display font-semibold rounded-lg border border-red-600 transition-colors text-sm"
            >
              Próximo Arconte →
            </button>
          </>
        )}

        {currentSpeakerStatus === "denied" && (
          <button
            onClick={() => dispatch({ type: "NEXT_SPEAKER" })}
            className="px-8 py-2.5 bg-red-800 hover:bg-red-700 text-gray-100 font-display font-semibold rounded-lg border border-red-600 transition-colors text-sm"
          >
            Próximo Arconte →
          </button>
        )}
      </div>
    </div>
  );
}
