import { ARCHONTES } from "~/data/archontes";
import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";
import ArchonteCard from "./ArchonteCard";

export default function PresidentSelect() {
  const { president } = useConclave();
  const dispatch = useConclaveDispatch();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-gray-100 mb-2">
          Escolha o Presidente da Mesa
        </h2>
        <p className="text-gray-400 text-sm">
          Selecione o Arconte que presidirá este Conclave
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ARCHONTES.map((archonte) => (
          <ArchonteCard
            key={archonte.id}
            archonte={archonte}
            selected={president === archonte.id}
            onClick={() =>
              dispatch({ type: "SET_PRESIDENT", payload: archonte.id })
            }
          />
        ))}
      </div>
    </div>
  );
}
