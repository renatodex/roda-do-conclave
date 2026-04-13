import type { Route } from "./+types/home";
import { ConclaveProvider, useConclave } from "~/context/ConclaveContext";
import SetupPhase from "~/components/SetupPhase";
import SessionPhase from "~/components/SessionPhase";
import EndedPhase from "~/components/EndedPhase";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roda do Conclave — Solium Infernum" },
    {
      name: "description",
      content: "Sistema de reunião do Conclave do Solium Infernum",
    },
  ];
}

function ConclaveApp() {
  const { phase } = useConclave();

  return (
    <>
      {phase === "setup" && <SetupPhase />}
      {phase === "session" && <SessionPhase />}
      {phase === "ended" && <EndedPhase />}
    </>
  );
}

export default function Home() {
  return (
    <ConclaveProvider>
      <ConclaveApp />
    </ConclaveProvider>
  );
}
