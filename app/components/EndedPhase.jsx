import { ARCHONTES, getArchonte } from "~/data/archontes";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";

function groupLogByRound(speakingLog) {
  const rounds = {};
  for (const entry of speakingLog) {
    if (!rounds[entry.round]) rounds[entry.round] = [];
    rounds[entry.round].push(entry);
  }
  return rounds;
}

function generateMarkdown(state) {
  const presidentArchonte = getArchonte(state.president);
  const totalRounds = Math.max(
    state.round - 1,
    ...Object.keys(state.roundSummaries).map(Number),
    ...state.speakingLog.map((e) => e.round)
  );
  const logByRound = groupLogByRound(state.speakingLog);

  let md = "";
  md += "# ATA DO CONCLAVE\n";
  md += `## Solium Infernum — Roda do Conclave\n\n`;
  md += `**Presidente da Mesa:** ${presidentArchonte?.name}\n`;
  md += `**Rodadas realizadas:** ${totalRounds}\n`;
  md += `**Data:** ${new Date().toLocaleDateString("pt-BR")}\n\n`;

  const activeParticipants = ARCHONTES.filter((a) => !state.excluded[a.id]);
  md += `**Participantes:** ${activeParticipants.map((a) => a.name).join(", ")}\n`;

  const absentEntries = Object.entries(state.excluded);
  if (absentEntries.length > 0) {
    const absent = absentEntries
      .filter(([, reason]) => reason === "absent")
      .map(([id]) => getArchonte(id)?.name);
    const notParticipating = absentEntries
      .filter(([, reason]) => reason === "not_participating")
      .map(([id]) => getArchonte(id)?.name);

    if (absent.length > 0) {
      md += `**Ausentes:** ${absent.join(", ")}\n`;
    }
    if (notParticipating.length > 0) {
      md += `**Não participam:** ${notParticipating.join(", ")}\n`;
    }
  }

  md += `\n---\n\n`;

  if (state.agenda.length > 0) {
    md += `## PAUTA\n\n`;
    for (const item of state.agenda) {
      md += `- [${item.completed ? "x" : " "}] ${item.text}\n`;
    }
    md += `\n`;
  }

  for (let r = 1; r <= totalRounds; r++) {
    const boundId = state.roundAgendaItems[r];
    const boundItem = boundId
      ? state.agenda.find((i) => i.id === boundId)
      : null;
    md += `## RODADA ${r}`;
    if (boundItem) {
      md += ` — ✦ ${boundItem.text}`;
    } else {
      md += ` — Rodada livre`;
    }
    md += `\n\n`;

    const roundLog = logByRound[r] || [];
    if (roundLog.length > 0) {
      md += `### Ordem de Fala\n\n`;
      for (const entry of roundLog) {
        const name = getArchonte(entry.archonteId)?.name;
        const actionText = entry.action === "granted" ? "Com a palavra" : "Palavra negada";
        const replyTag = entry.isReply
          ? ` (Direito de resposta a ${getArchonte(entry.replyTo)?.name})`
          : "";
        md += `- **${name}** — ${actionText}${replyTag} [${entry.timestamp}]\n`;
      }
      md += `\n`;
    }

    if (state.roundSummaries[r]) {
      md += `### Desfecho\n\n`;
      md += `${state.roundSummaries[r]}\n\n`;
    }

    const roundAgreements = state.agreements.filter((a) => a.round === r);
    if (roundAgreements.length > 0) {
      md += `### Acordos Firmados\n\n`;
      for (const agreement of roundAgreements) {
        md += `**${agreement.title}**\n`;
        if (agreement.description) md += `${agreement.description}\n`;
        if (agreement.signatories.length > 0) {
          const names = agreement.signatories.map((id) => getArchonte(id)?.name).join(", ");
          md += `Signatários: ${names}\n`;
        }
        md += `\n`;
      }
    }
  }

  md += `---\n\n`;
  md += `*Documento gerado pela Roda do Conclave — Solium Infernum*\n`;

  return md;
}

function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function EndedPhase() {
  const state = useConclave();
  const dispatch = useConclaveDispatch();
  const { president, excluded, agreements, agenda, round, speakingLog, roundSummaries, roundAgendaItems } = state;
  const presidentArchonte = getArchonte(president);

  const absentArchontes = Object.entries(excluded)
    .filter(([, reason]) => reason === "absent")
    .map(([id]) => getArchonte(id));
  const notParticipatingArchontes = Object.entries(excluded)
    .filter(([, reason]) => reason === "not_participating")
    .map(([id]) => getArchonte(id));

  const completedItems = agenda.filter((i) => i.completed).length;
  const totalRounds = Math.max(
    round - 1,
    ...Object.keys(roundSummaries).map(Number),
    ...speakingLog.map((e) => e.round),
    0
  );
  const logByRound = groupLogByRound(speakingLog);

  function handleExport() {
    const md = generateMarkdown(state);
    const date = new Date().toISOString().slice(0, 10);
    downloadMarkdown(md, `ata-conclave-${date}.md`);
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-red-500 mb-2">
            Ata do Conclave
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-500 font-body text-sm">
            <span>Presidido por</span>
            <img
              src={presidentArchonte?.avatar}
              alt={presidentArchonte?.name}
              className="w-6 h-6 rounded-full object-cover border border-red-900/50"
            />
            <span>
              {presidentArchonte?.name} — {totalRounds} rodada
              {totalRounds !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {(absentArchontes.length > 0 || notParticipatingArchontes.length > 0) && (
          <section className="mb-8">
            {absentArchontes.length > 0 && (
              <div className="mb-3">
                <h2 className="font-display text-sm text-gray-500 uppercase tracking-wider mb-2">
                  Ausentes
                </h2>
                <div className="flex flex-wrap gap-2">
                  {absentArchontes.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-900/20 border border-red-900/30 rounded-lg text-xs text-red-400"
                    >
                      <img
                        src={a.avatar}
                        alt={a.name}
                        className="w-4 h-4 rounded-full object-cover opacity-60"
                      />
                      <span className="font-display">{a.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {notParticipatingArchontes.length > 0 && (
              <div>
                <h2 className="font-display text-sm text-gray-500 uppercase tracking-wider mb-2">
                  Não participam
                </h2>
                <div className="flex flex-wrap gap-2">
                  {notParticipatingArchontes.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-800/40 border border-gray-700/50 rounded-lg text-xs text-gray-500"
                    >
                      <img
                        src={a.avatar}
                        alt={a.name}
                        className="w-4 h-4 rounded-full object-cover opacity-40"
                      />
                      <span className="font-display">{a.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {agenda.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-sm text-gray-500 uppercase tracking-wider mb-3">
              Pauta ({completedItems}/{agenda.length} concluídos)
            </h2>
            <ul className="space-y-1">
              {agenda.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <span className={item.completed ? "text-red-400" : "text-gray-600"}>
                    {item.completed ? "✓" : "○"}
                  </span>
                  <span
                    className={`text-sm font-body ${
                      item.completed ? "text-gray-400 line-through" : "text-gray-400"
                    }`}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {Array.from({ length: totalRounds }, (_, i) => i + 1).map((r) => {
          const roundLog = logByRound[r] || [];
          const roundAgreements = agreements.filter((a) => a.round === r);
          const summary = roundSummaries[r];
          const boundAgendaId = roundAgendaItems[r];
          const boundAgendaItem = boundAgendaId
            ? agenda.find((i) => i.id === boundAgendaId)
            : null;
          const hasContent = roundLog.length > 0 || summary || roundAgreements.length > 0;

          if (!hasContent) return null;

          return (
            <section
              key={r}
              className="mb-8 p-5 bg-gray-900/40 border border-red-900/20 rounded-lg"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="font-display text-lg text-gray-200">
                  Rodada {r}
                </h2>
                {boundAgendaItem ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-400 font-display shrink-0">
                    <span>✦</span>
                    <span>{boundAgendaItem.text}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-700 italic font-body shrink-0">
                    Rodada livre
                  </span>
                )}
              </div>

              {roundLog.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                    Ordem de Fala
                  </h3>
                  <div className="space-y-1.5">
                    {roundLog.map((entry, idx) => {
                      const a = getArchonte(entry.archonteId);
                      const replyTo = entry.replyTo
                        ? getArchonte(entry.replyTo)
                        : null;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 text-sm ${entry.isReply ? "ml-5" : ""}`}
                        >
                          <img
                            src={a?.avatar}
                            alt={a?.name}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                          <span className="font-display text-gray-300 text-sm">
                            {a?.name}
                          </span>
                          <span
                            className={`text-xs ${
                              entry.action === "granted"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {entry.action === "granted"
                              ? "✓ Com a palavra"
                              : "✕ Negado"}
                          </span>
                          {entry.isReply && replyTo && (
                            <span className="text-xs text-purple-400">
                              ↩ resposta a {replyTo.name}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-700 ml-auto">
                            {entry.timestamp}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {summary && (
                <div className="mb-4">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                    Desfecho
                  </h3>
                  <p className="text-sm text-gray-300 font-body whitespace-pre-wrap bg-gray-950/50 rounded p-3 border border-red-900/10">
                    {summary}
                  </p>
                </div>
              )}

              {roundAgreements.length > 0 && (
                <div>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                    Acordos
                  </h3>
                  <div className="space-y-2">
                    {roundAgreements.map((agreement) => (
                      <div
                        key={agreement.id}
                        className="p-3 bg-gray-950/50 border border-red-900/20 rounded"
                      >
                        <h4 className="font-display text-sm text-gray-200 font-semibold">
                          {agreement.title}
                        </h4>
                        {agreement.description && (
                          <p className="text-xs text-gray-400 font-body mt-1">
                            {agreement.description}
                          </p>
                        )}
                        {agreement.signatories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {agreement.signatories.map((id) => {
                              const a = getArchonte(id);
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-900/30 border border-red-900/40 rounded text-[10px] text-gray-400"
                                >
                                  <img
                                    src={a?.avatar}
                                    alt={a?.name}
                                    className="w-3.5 h-3.5 rounded-full object-cover"
                                  />
                                  {a?.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}

        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={handleExport}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-display font-semibold rounded-lg border border-gray-600 transition-colors flex items-center gap-2"
          >
            ⬇ Exportar Ata
          </button>
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="px-8 py-3 bg-red-800 hover:bg-red-700 text-gray-100 font-display font-semibold rounded-lg border border-red-600 transition-colors"
          >
            Novo Conclave
          </button>
        </div>
      </div>
    </div>
  );
}
