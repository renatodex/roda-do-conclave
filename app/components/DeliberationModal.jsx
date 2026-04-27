import { useMemo, useState } from "react";
import {
  ARCHONTES,
  compareByPrestige,
  getArchonte,
} from "~/data/archontes";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";

const STAGES = {
  AGENDA: "agenda",
  GATEKEEPING: "gatekeeping",
  VOTING: "voting",
  RESULT: "result",
};

const VOTE_OPTIONS = [
  { value: "favor", label: "A favor", color: "green" },
  { value: "contra", label: "Contra", color: "red" },
  { value: "abster", label: "Abster-se", color: "gray" },
];

const VOTE_STYLES = {
  favor: {
    border: "border-green-600",
    bg: "bg-green-900/30",
    text: "text-green-300",
    chip: "border-green-700 bg-green-900/40 text-green-300",
  },
  contra: {
    border: "border-red-600",
    bg: "bg-red-900/30",
    text: "text-red-300",
    chip: "border-red-700 bg-red-900/40 text-red-300",
  },
  abster: {
    border: "border-gray-600",
    bg: "bg-gray-900/40",
    text: "text-gray-300",
    chip: "border-gray-700 bg-gray-800/50 text-gray-300",
  },
};

function effectiveWeight(archonte, anyHasPower) {
  // While Voting Power isn't known, fall back to one-vote-per-Arconte so the
  // deliberation can still resolve. As soon as at least one present Arconte
  // has a non-zero votingPower, the weighted tally takes over.
  const power = archonte.votingPower ?? 0;
  if (anyHasPower) return power;
  return 1;
}

function tallyVotes(votes, archontesById) {
  const tally = { favor: 0, contra: 0, abster: 0, total: 0 };
  const anyHasPower = Object.values(archontesById).some(
    (a) => (a.votingPower ?? 0) > 0
  );
  for (const [id, vote] of Object.entries(votes)) {
    const archonte = archontesById[id];
    if (!archonte || !vote.value) continue;
    const weight = effectiveWeight(archonte, anyHasPower);
    tally[vote.value] += weight;
    tally.total += weight;
  }
  return tally;
}

function decideOutcome(tally) {
  if (tally.favor > tally.contra) return "approved";
  if (tally.contra > tally.favor) return "rejected";
  return "tied";
}

export default function DeliberationModal() {
  const { excluded, president, round } = useConclave();
  const dispatch = useConclaveDispatch();

  const presentArchontes = useMemo(
    () =>
      ARCHONTES.filter((a) => !excluded[a.id]).sort((a, b) => {
        if (a.id === president) return -1;
        if (b.id === president) return 1;
        return compareByPrestige(a, b, "desc");
      }),
    [excluded, president]
  );

  const archontesById = useMemo(
    () => Object.fromEntries(presentArchontes.map((a) => [a.id, a])),
    [presentArchontes]
  );

  const otherArchonteIds = presentArchontes
    .filter((a) => a.id !== president)
    .map((a) => a.id);

  const [stage, setStage] = useState(STAGES.AGENDA);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [potestadeAccepted, setPotestadeAccepted] = useState(null);
  const [overrideVotes, setOverrideVotes] = useState({});
  const [overridden, setOverridden] = useState(false);
  const [votes, setVotes] = useState({});

  const tally = useMemo(
    () => tallyVotes(votes, archontesById),
    [votes, archontesById]
  );
  const outcome = decideOutcome(tally);

  const allVoted = presentArchontes.every((a) => votes[a.id]?.value);

  function close() {
    dispatch({ type: "CLOSE_DELIBERATION_MODAL" });
  }

  function submitAgenda(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setStage(STAGES.GATEKEEPING);
  }

  function decidePotestade(accepted) {
    setPotestadeAccepted(accepted);
    if (accepted) {
      setStage(STAGES.VOTING);
    } else {
      setOverrideVotes(
        Object.fromEntries(otherArchonteIds.map((id) => [id, null]))
      );
    }
  }

  function setOverrideVote(id, against) {
    setOverrideVotes((prev) => ({ ...prev, [id]: against }));
  }

  const overrideUnanimous =
    otherArchonteIds.length > 0 &&
    otherArchonteIds.every((id) => overrideVotes[id] === true);
  const overrideHasDissent = otherArchonteIds.some(
    (id) => overrideVotes[id] === false
  );

  function applyOverrideDecision() {
    if (overrideUnanimous) {
      setOverridden(true);
      setStage(STAGES.VOTING);
    } else {
      setStage(STAGES.RESULT);
    }
  }

  function setVote(id, value) {
    setVotes((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), value },
    }));
  }

  function setJustification(id, justification) {
    setVotes((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), justification },
    }));
  }

  function finalize() {
    const anyHasPower = presentArchontes.some(
      (a) => (a.votingPower ?? 0) > 0
    );
    const finalVotes = presentArchontes.map((a) => ({
      archonteId: a.id,
      vote: votes[a.id]?.value ?? "abster",
      justification: votes[a.id]?.justification?.trim() ?? "",
      weight: effectiveWeight(a, anyHasPower),
    }));
    dispatch({
      type: "RECORD_DELIBERATION",
      payload: {
        round,
        title: title.trim(),
        description: description.trim(),
        potestadeAccepted,
        overridden,
        votes: finalVotes,
        tally,
        outcome:
          potestadeAccepted === false && !overridden ? "blocked" : outcome,
      },
    });
  }

  const totalPower = presentArchontes.reduce(
    (sum, a) => sum + (a.votingPower ?? 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={close} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-950 border border-amber-900/60 rounded-xl p-6 shadow-2xl shadow-amber-900/20">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="font-display text-xl text-gray-100">
              Pauta de Deliberação Vinculante
            </h2>
            <p className="text-gray-500 text-xs font-body mt-0.5">
              Codex Conclavis Umbrarum, regra 6 — manifestações públicas, ponderadas pelo Poder de Votação.
            </p>
          </div>
          <button
            onClick={close}
            className="text-gray-600 hover:text-gray-300 text-xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <StageDots stage={stage} />

        {stage === STAGES.AGENDA && (
          <form onSubmit={submitAgenda} className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">
                Pauta proposta
              </label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Sancionar incursão sobre Iblis..."
                className="w-full px-3 py-2.5 bg-gray-900 border border-amber-900/40 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-600 text-sm font-body"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">
                Justificativa (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Razões expostas ao Conclave..."
                className="w-full px-3 py-2.5 bg-gray-900 border border-amber-900/40 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-600 text-sm font-body resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={close}
                className="px-5 py-2 text-gray-400 hover:text-gray-200 text-sm font-body transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-6 py-2 bg-amber-800 hover:bg-amber-700 text-gray-100 font-display font-semibold rounded-lg border border-amber-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submeter ao Potestade →
              </button>
            </div>
          </form>
        )}

        {stage === STAGES.GATEKEEPING && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gray-900/60 border border-amber-900/30 rounded-lg">
              <p className="text-[10px] uppercase tracking-wider text-amber-500/80 mb-1 font-display">
                Manifestação do Potestade
              </p>
              <p className="text-sm text-gray-300 font-body">
                Cumpre ao Potestade <span className="text-amber-300">{getArchonte(president)?.name}</span>{" "}
                acolher ou denegar a Pauta proposta.
              </p>
              <p className="text-xs text-gray-500 mt-2 italic font-body">
                Caso o Potestade negue, todos os demais presentes podem manifestar-se ordenadamente em sentido contrário, revertendo a decisão (Codex 6.2).
              </p>
            </div>

            {potestadeAccepted === null && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => decidePotestade(true)}
                  className="px-6 py-2.5 bg-green-900/40 hover:bg-green-900/60 text-green-300 font-display font-semibold rounded-lg border border-green-700 transition-colors text-sm"
                >
                  ✓ Acolher Pauta
                </button>
                <button
                  onClick={() => decidePotestade(false)}
                  className="px-6 py-2.5 bg-red-900/40 hover:bg-red-900/60 text-red-300 font-display font-semibold rounded-lg border border-red-700 transition-colors text-sm"
                >
                  ✕ Denegar Pauta
                </button>
              </div>
            )}

            {potestadeAccepted === false && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 font-body">
                  Pauta denegada. Cada Arconte manifesta-se ordenadamente sobre reverter a decisão:
                </p>
                <div className="space-y-2">
                  {otherArchonteIds.map((id) => {
                    const archonte = getArchonte(id);
                    const decision = overrideVotes[id];
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 p-2.5 bg-gray-900/40 border border-gray-800 rounded-lg"
                      >
                        <img
                          src={archonte.avatar}
                          alt={archonte.name}
                          className="w-8 h-8 rounded-full object-cover border border-red-900/40"
                        />
                        <span className="font-display text-sm text-gray-200 flex-1">
                          {archonte.name}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setOverrideVote(id, true)}
                            className={`px-3 py-1 text-xs rounded border font-display transition-colors ${
                              decision === true
                                ? "border-amber-500 bg-amber-600/30 text-amber-200"
                                : "border-gray-700 text-gray-500 hover:border-amber-600 hover:text-amber-400"
                            }`}
                          >
                            Reverter
                          </button>
                          <button
                            onClick={() => setOverrideVote(id, false)}
                            className={`px-3 py-1 text-xs rounded border font-display transition-colors ${
                              decision === false
                                ? "border-gray-500 bg-gray-700/40 text-gray-200"
                                : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                            }`}
                          >
                            Acatar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={applyOverrideDecision}
                    disabled={otherArchonteIds.some((id) => overrideVotes[id] === null || overrideVotes[id] === undefined)}
                    className="px-6 py-2 bg-amber-800 hover:bg-amber-700 text-gray-100 font-display font-semibold rounded-lg border border-amber-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {overrideUnanimous && !overrideHasDissent
                      ? "Reverter decisão →"
                      : "Acatar decisão do Potestade →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {stage === STAGES.VOTING && (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-[10px] uppercase tracking-wider text-amber-500/80 mb-0.5 font-display">
                {overridden ? "Reversão pelo Conclave" : "Pauta acolhida"}
              </p>
              <p className="text-sm text-amber-200 font-body">{title}</p>
              {description && (
                <p className="text-xs text-gray-400 font-body mt-1">{description}</p>
              )}
            </div>

            <div className="space-y-3">
              {presentArchontes.map((a) => {
                const vote = votes[a.id]?.value;
                const justification = votes[a.id]?.justification ?? "";
                const styles = vote ? VOTE_STYLES[vote] : null;
                return (
                  <div
                    key={a.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      styles
                        ? `${styles.border} ${styles.bg}`
                        : "border-gray-800 bg-gray-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={a.avatar}
                        alt={a.name}
                        className="w-9 h-9 rounded-full object-cover border border-red-900/40"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm text-gray-100">
                            {a.name}
                          </span>
                          {a.id === president && (
                            <span className="text-[10px] text-amber-500 uppercase tracking-wider font-display">
                              Potestade
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-500">
                          Poder de Voto {a.votingPower}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {VOTE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setVote(a.id, opt.value)}
                            className={`px-2.5 py-1 text-[11px] rounded border font-display uppercase tracking-wider transition-colors ${
                              vote === opt.value
                                ? VOTE_STYLES[opt.value].chip
                                : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {vote && vote !== "abster" && (
                      <input
                        type="text"
                        value={justification}
                        onChange={(e) => setJustification(a.id, e.target.value)}
                        placeholder="Justificativa (opcional)"
                        className="mt-2 w-full px-2.5 py-1.5 bg-gray-950/60 border border-gray-800 rounded text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-700 font-body"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <TallyBar tally={tally} totalPower={totalPower} />

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={close}
                className="px-5 py-2 text-gray-400 hover:text-gray-200 text-sm font-body transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStage(STAGES.RESULT)}
                disabled={!allVoted}
                className="px-6 py-2 bg-amber-800 hover:bg-amber-700 text-gray-100 font-display font-semibold rounded-lg border border-amber-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apurar resultado →
              </button>
            </div>
          </div>
        )}

        {stage === STAGES.RESULT && (
          <div className="mt-4 space-y-4">
            <ResultBanner
              outcome={
                potestadeAccepted === false && !overridden ? "blocked" : outcome
              }
              tally={tally}
              totalPower={totalPower}
            />

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                Manifestações registradas
              </p>
              <div className="space-y-1.5">
                {presentArchontes.map((a) => {
                  const vote = votes[a.id]?.value ?? "abster";
                  const justification = votes[a.id]?.justification ?? "";
                  return (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 p-2 bg-gray-900/40 border border-gray-800 rounded text-sm"
                    >
                      <img
                        src={a.avatar}
                        alt={a.name}
                        className="w-6 h-6 rounded-full object-cover border border-red-900/40 shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-gray-200 text-xs">
                            {a.name}
                          </span>
                          <span
                            className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-display ${VOTE_STYLES[vote].chip}`}
                          >
                            {VOTE_OPTIONS.find((o) => o.value === vote)?.label}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            (peso {a.votingPower})
                          </span>
                        </div>
                        {justification && (
                          <p className="text-[11px] text-gray-500 italic font-body mt-0.5">
                            “{justification}”
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={close}
                className="px-5 py-2 text-gray-400 hover:text-gray-200 text-sm font-body transition-colors"
              >
                Descartar
              </button>
              <button
                onClick={finalize}
                className="px-6 py-2 bg-red-800 hover:bg-red-700 text-gray-100 font-display font-semibold rounded-lg border border-red-600 transition-colors text-sm"
              >
                Selar deliberação
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StageDots({ stage }) {
  const order = [STAGES.AGENDA, STAGES.GATEKEEPING, STAGES.VOTING, STAGES.RESULT];
  const labels = {
    [STAGES.AGENDA]: "Pauta",
    [STAGES.GATEKEEPING]: "Acolhimento",
    [STAGES.VOTING]: "Votação",
    [STAGES.RESULT]: "Apuração",
  };
  const currentIndex = order.indexOf(stage);
  return (
    <div className="flex items-center gap-3 mt-4 pb-3 border-b border-amber-900/30">
      {order.map((s, idx) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
              idx < currentIndex
                ? "bg-amber-700 border-amber-500 text-gray-100"
                : idx === currentIndex
                  ? "bg-amber-900/60 border-amber-500 text-amber-300"
                  : "bg-gray-900 border-gray-700 text-gray-600"
            }`}
          >
            {idx + 1}
          </span>
          <span
            className={`text-[11px] font-body ${
              idx === currentIndex ? "text-gray-200" : "text-gray-600"
            }`}
          >
            {labels[s]}
          </span>
        </div>
      ))}
    </div>
  );
}

function TallyBar({ tally, totalPower }) {
  if (totalPower === 0) return null;
  const pct = (n) => `${(n / totalPower) * 100}%`;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-500">
        <span>Apuração ponderada</span>
        <span>
          {tally.total}/{totalPower} de poder manifestado
        </span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden bg-gray-900 border border-gray-800 flex">
        <div className="bg-green-700" style={{ width: pct(tally.favor) }} />
        <div className="bg-red-700" style={{ width: pct(tally.contra) }} />
        <div className="bg-gray-600" style={{ width: pct(tally.abster) }} />
      </div>
      <div className="flex items-center gap-3 text-[10px] text-gray-500 font-body">
        <span className="text-green-400">A favor: {tally.favor}</span>
        <span className="text-red-400">Contra: {tally.contra}</span>
        <span>Abstenção: {tally.abster}</span>
      </div>
    </div>
  );
}

function ResultBanner({ outcome, tally, totalPower }) {
  const config = {
    approved: {
      title: "Pauta aprovada",
      tone: "border-green-700 bg-green-900/30 text-green-200",
    },
    rejected: {
      title: "Pauta rejeitada",
      tone: "border-red-700 bg-red-900/30 text-red-200",
    },
    tied: {
      title: "Empate",
      tone: "border-gray-600 bg-gray-800/40 text-gray-200",
    },
    blocked: {
      title: "Pauta bloqueada pelo Potestade",
      tone: "border-red-800 bg-red-950/40 text-red-200",
    },
  }[outcome];

  return (
    <div className={`p-4 border rounded-lg ${config.tone}`}>
      <p className="font-display text-base">{config.title}</p>
      {outcome !== "blocked" && (
        <p className="text-xs font-body mt-1 text-gray-300">
          A favor {tally.favor} · Contra {tally.contra} · Abstenção {tally.abster}{" "}
          (de {totalPower} pontos de Poder de Votação).
        </p>
      )}
    </div>
  );
}
