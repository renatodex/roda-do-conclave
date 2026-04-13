import { getArchonte } from "~/data/archontes";
import { useConclave } from "~/context/ConclaveContext";

export default function AgreementsList() {
  const { agreements } = useConclave();

  if (agreements.length === 0) {
    return (
      <div>
        <h3 className="font-display text-sm text-gray-500 uppercase tracking-wider mb-3">
          Acordos
        </h3>
        <p className="text-gray-700 text-xs italic">
          Nenhum acordo firmado ainda
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display text-sm text-gray-500 uppercase tracking-wider mb-3">
        Acordos ({agreements.length})
      </h3>
      <div className="space-y-3">
        {agreements.map((agreement) => (
          <div
            key={agreement.id}
            className="p-3 bg-gray-900/60 border border-red-900/30 rounded-lg"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-display text-sm text-gray-200 font-semibold">
                {agreement.title}
              </h4>
              <span className="text-[10px] text-gray-600 shrink-0">
                {agreement.timestamp}
              </span>
            </div>
            {agreement.description && (
              <p className="text-xs text-gray-400 font-body mb-2">
                {agreement.description}
              </p>
            )}
            {agreement.signatories.length > 0 && (
              <div className="flex flex-wrap gap-1">
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
                        className="w-4 h-4 rounded-full object-cover"
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
  );
}
