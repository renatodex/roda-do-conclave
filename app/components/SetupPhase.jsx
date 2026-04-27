import { useConclave, useConclaveDispatch } from "~/context/ConclaveContext";
import PresidentSelect from "./PresidentSelect";
import AttendanceEditor from "./AttendanceEditor";
import SpeakingOrderEditor from "./SpeakingOrderEditor";
import AgendaSetup from "./AgendaSetup";

const steps = [
  { key: "attendance", label: "Presença" },
  { key: "president", label: "Potestade" },
  { key: "order", label: "Ordem de Fala" },
  { key: "agenda", label: "Pauta" },
];

export default function SetupPhase() {
  const { setupStep } = useConclave();

  const currentStepIndex = steps.findIndex((s) => s.key === setupStep);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="text-center pt-10 pb-6">
        <h1 className="font-display text-4xl md:text-5xl text-red-500 mb-1 tracking-wide">
          Roda do Conclave
        </h1>
        <p className="text-gray-500 text-sm font-body">Solium Infernum</p>
      </header>

      <nav className="flex justify-center gap-6 mb-10">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                i < currentStepIndex
                  ? "bg-red-800 border-red-600 text-gray-100"
                  : i === currentStepIndex
                    ? "bg-red-900/60 border-red-500 text-red-300"
                    : "bg-gray-900 border-gray-700 text-gray-600"
              }`}
            >
              {i < currentStepIndex ? "✓" : i + 1}
            </span>
            <span
              className={`text-sm font-body ${
                i === currentStepIndex ? "text-gray-200" : "text-gray-600"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </nav>

      <main className="flex-1 px-4 pb-12">
        {setupStep === "president" && <PresidentSelect />}
        {setupStep === "attendance" && <AttendanceEditor />}
        {setupStep === "order" && <SpeakingOrderEditor />}
        {setupStep === "agenda" && <AgendaSetup />}
      </main>
    </div>
  );
}
