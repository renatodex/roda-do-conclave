import { getArchonte } from "~/data/archontes";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";
import ActiveSpeaker from "./ActiveSpeaker";
import SpeakerQueue from "./SpeakerQueue";
import AgendaPanel from "./AgendaPanel";
import AgreementsList from "./AgreementsList";
import AgreementModal from "./AgreementModal";
import ReplyModal from "./ReplyModal";
import RoundSummaryModal from "./RoundSummaryModal";
import RoundSummaryPanel from "./RoundSummaryPanel";
import DeliberationModal from "./DeliberationModal";
import DeliberationsList from "./DeliberationsList";

export default function SessionPhase() {
  const {
    president,
    round,
    showAgreementModal,
    showReplyModal,
    showRoundSummaryModal,
    showDeliberationModal,
    currentAgendaItemId,
    agenda,
  } = useConclave();
  const dispatch = useConclaveDispatch();
  const presidentArchonte = getArchonte(president);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-red-900/30 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg text-red-500 tracking-wide">
              Roda do Conclave
            </h1>
            <span className="text-gray-700">|</span>
            <span className="text-gray-400 text-sm font-body">
              Rodada {round}
            </span>
            {currentAgendaItemId && (() => {
              const item = agenda.find((i) => i.id === currentAgendaItemId);
              return item ? (
                <>
                  <span className="text-gray-700">|</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-400 font-body">
                    <span className="text-amber-500">✦</span>
                    <span className="max-w-[250px] truncate">{item.text}</span>
                  </span>
                </>
              ) : null;
            })()}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 font-body">Potestade:</span>
              <span className="inline-flex items-center gap-1.5 text-gray-300 font-display">
                <img
                  src={presidentArchonte?.avatar}
                  alt={presidentArchonte?.name}
                  className="w-6 h-6 rounded-full object-cover border border-red-900/50"
                />
                {presidentArchonte?.name}
              </span>
            </div>

            <button
              onClick={() => dispatch({ type: "OPEN_DELIBERATION_MODAL" })}
              className="px-4 py-1.5 bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 text-xs font-display font-semibold rounded border border-amber-900/40 hover:border-amber-700 transition-colors"
            >
              ⚖ Deliberação Vinculante
            </button>

            <button
              onClick={() => dispatch({ type: "OPEN_AGREEMENT_MODAL" })}
              className="px-4 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-300 text-xs font-display font-semibold rounded border border-red-900/40 hover:border-red-700 transition-colors"
            >
              ⛧ Firmar Acordo
            </button>

            <button
              onClick={() => dispatch({ type: "END_SESSION" })}
              className="px-4 py-1.5 text-gray-600 hover:text-red-400 text-xs font-body transition-colors"
            >
              Encerrar
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-[280px_1fr_280px] gap-6 p-6">
        <aside className="space-y-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
          <SpeakerQueue />
        </aside>

        <section className="flex items-start justify-center pt-8">
          <ActiveSpeaker />
        </section>

        <aside className="space-y-5 overflow-y-auto max-h-[calc(100vh-5rem)]">
          <AgendaPanel />
          <div className="border-t border-red-900/20 pt-4">
            <DeliberationsList />
          </div>
          <div className="border-t border-red-900/20 pt-4">
            <AgreementsList />
          </div>
          <div className="border-t border-red-900/20 pt-4">
            <RoundSummaryPanel />
          </div>
        </aside>
      </main>

      {showAgreementModal && <AgreementModal />}
      {showReplyModal && <ReplyModal />}
      {showRoundSummaryModal && <RoundSummaryModal />}
      {showDeliberationModal && <DeliberationModal />}
    </div>
  );
}
