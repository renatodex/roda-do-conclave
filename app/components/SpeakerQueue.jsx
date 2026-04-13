import { getArchonte } from "~/data/archontes";
import { useConclave } from "~/context/ConclaveContext";
import ArchonteCard from "./ArchonteCard";

export default function SpeakerQueue() {
  const {
    roundQueue,
    currentQueueIndex,
    currentSpeakerStatus,
    round,
    currentAgendaItemId,
    agenda,
  } = useConclave();

  const currentAgendaItem = currentAgendaItemId
    ? agenda.find((i) => i.id === currentAgendaItemId)
    : null;

  return (
    <div>
      <h3 className="font-display text-sm text-gray-500 uppercase tracking-wider mb-2">
        Ordem de Fala — Rodada {round}
      </h3>
      {currentAgendaItem ? (
        <div className="mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-[10px] text-amber-600 font-display uppercase tracking-wider mb-0.5">
            Pauta da Rodada
          </p>
          <p className="text-xs text-amber-300 font-body leading-snug">
            ✦ {currentAgendaItem.text}
          </p>
        </div>
      ) : (
        <div className="mb-3 px-3 py-1.5 border border-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-700 italic font-body">
            Rodada livre
          </p>
        </div>
      )}
      <div className="space-y-2">
        {roundQueue.map((entry, index) => {
          const archonte = getArchonte(entry.archonteId);
          const isCurrent = index === currentQueueIndex;
          const isDone = index < currentQueueIndex;
          const wasDenied = isDone && entry.result === "denied";
          const wasGranted = isDone && entry.result === "granted";
          const isDenied = isCurrent && currentSpeakerStatus === "denied";
          const isSpeaking = isCurrent && currentSpeakerStatus === "speaking";
          const isReply = entry.type === "reply";

          return (
            <div key={`${entry.archonteId}-${index}`} className={`flex items-center gap-2 ${isReply ? "ml-4" : ""}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${
                  wasDenied
                    ? "bg-red-900/60 border-red-700 text-red-400"
                    : wasGranted
                      ? "bg-red-900/40 border-red-800 text-red-400"
                      : isCurrent
                        ? "bg-amber-600 border-amber-500 text-gray-100"
                        : "bg-gray-900 border-gray-700 text-gray-600"
                }`}
              >
                {wasDenied ? "✕" : wasGranted ? "✓" : isReply ? "↩" : index + 1}
              </span>
              <div className="flex-1">
                <ArchonteCard
                  archonte={archonte}
                  size="sm"
                  speaking={isSpeaking}
                  denied={isDenied || wasDenied}
                  done={wasGranted}
                >
                  {isReply && (
                    <p className="text-[10px] text-purple-400 mt-1">
                      Direito de resposta a {getArchonte(entry.replyTo)?.name}
                    </p>
                  )}
                </ArchonteCard>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
