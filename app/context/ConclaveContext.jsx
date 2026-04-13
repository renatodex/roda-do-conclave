import { createContext, useContext, useReducer } from "react";

const ConclaveContext = createContext(null);
const ConclaveDispatchContext = createContext(null);

const initialState = {
  phase: "setup",
  setupStep: "president",
  president: null,
  excluded: {},
  baseSpeakingOrder: [],
  roundQueue: [],
  currentQueueIndex: 0,
  currentSpeakerStatus: "waiting",
  agenda: [],
  agreements: [],
  round: 1,
  currentAgendaItemId: null,
  showAgreementModal: false,
  showReplyModal: false,
  showRoundSummaryModal: false,
  pendingRoundEnd: null,
  speakingLog: [],
  roundSummaries: {},
  roundAgendaItems: {},
};

let nextAgendaId = 1;
let nextAgreementId = 1;

function buildRoundQueue(baseSpeakingOrder) {
  return baseSpeakingOrder.map((id) => ({ archonteId: id, type: "regular" }));
}

function conclaveReducer(state, action) {
  switch (action.type) {
    case "SET_PRESIDENT":
      return {
        ...state,
        president: action.payload,
        setupStep: "attendance",
      };

    case "SET_EXCLUDED":
      return {
        ...state,
        excluded: action.payload,
        setupStep: "order",
      };

    case "SET_SPEAKING_ORDER":
      return {
        ...state,
        baseSpeakingOrder: action.payload,
        setupStep: "agenda",
      };

    case "ADD_AGENDA_ITEM":
      return {
        ...state,
        agenda: [
          ...state.agenda,
          { id: nextAgendaId++, text: action.payload, completed: false },
        ],
      };

    case "TOGGLE_AGENDA_ITEM":
      return {
        ...state,
        agenda: state.agenda.map((item) =>
          item.id === action.payload
            ? { ...item, completed: !item.completed }
            : item
        ),
      };

    case "REMOVE_AGENDA_ITEM":
      return {
        ...state,
        agenda: state.agenda.filter((item) => item.id !== action.payload),
      };

    case "START_SESSION": {
      const queue = buildRoundQueue(state.baseSpeakingOrder);
      return {
        ...state,
        phase: "session",
        roundQueue: queue,
        currentQueueIndex: 0,
        currentSpeakerStatus: "waiting",
        round: 1,
        speakingLog: [],
        roundSummaries: {},
        roundAgendaItems: {},
      };
    }

    case "GRANT_WORD": {
      const entry = state.roundQueue[state.currentQueueIndex];
      const updatedQueue = state.roundQueue.map((e, i) =>
        i === state.currentQueueIndex ? { ...e, result: "granted" } : e
      );
      return {
        ...state,
        currentSpeakerStatus: "speaking",
        roundQueue: updatedQueue,
        speakingLog: [
          ...state.speakingLog,
          {
            round: state.round,
            archonteId: entry.archonteId,
            action: "granted",
            isReply: entry.type === "reply",
            replyTo: entry.replyTo || null,
            timestamp: new Date().toLocaleTimeString("pt-BR"),
          },
        ],
      };
    }

    case "DENY_WORD": {
      const entry = state.roundQueue[state.currentQueueIndex];
      const updatedQueue = state.roundQueue.map((e, i) =>
        i === state.currentQueueIndex ? { ...e, result: "denied" } : e
      );
      return {
        ...state,
        currentSpeakerStatus: "denied",
        roundQueue: updatedQueue,
        speakingLog: [
          ...state.speakingLog,
          {
            round: state.round,
            archonteId: entry.archonteId,
            action: "denied",
            isReply: entry.type === "reply",
            replyTo: entry.replyTo || null,
            timestamp: new Date().toLocaleTimeString("pt-BR"),
          },
        ],
      };
    }

    case "SET_ROUND_AGENDA": {
      const newRoundAgendaItems = { ...state.roundAgendaItems };
      newRoundAgendaItems[state.round] = action.payload;
      return {
        ...state,
        currentAgendaItemId: action.payload,
        roundAgendaItems: newRoundAgendaItems,
      };
    }

    case "CLEAR_ROUND_AGENDA": {
      const newRoundAgendaItems = { ...state.roundAgendaItems };
      delete newRoundAgendaItems[state.round];
      return {
        ...state,
        currentAgendaItemId: null,
        roundAgendaItems: newRoundAgendaItems,
      };
    }

    case "OPEN_REPLY_MODAL":
      return { ...state, showReplyModal: true };

    case "CLOSE_REPLY_MODAL":
      return { ...state, showReplyModal: false };

    case "GRANT_REPLY_RIGHT": {
      const replyArchonteId = action.payload;
      const currentEntry = state.roundQueue[state.currentQueueIndex];
      const replyEntry = {
        archonteId: replyArchonteId,
        type: "reply",
        replyTo: currentEntry.archonteId,
      };
      const newQueue = [...state.roundQueue];
      newQueue.splice(state.currentQueueIndex + 1, 0, replyEntry);
      return {
        ...state,
        roundQueue: newQueue,
        showReplyModal: false,
      };
    }

    case "NEXT_SPEAKER": {
      const nextIndex = state.currentQueueIndex + 1;
      const isNewRound = nextIndex >= state.roundQueue.length;

      if (isNewRound) {
        return {
          ...state,
          showRoundSummaryModal: true,
          pendingRoundEnd: state.round,
        };
      }

      return {
        ...state,
        currentQueueIndex: nextIndex,
        currentSpeakerStatus: "waiting",
      };
    }

    case "CONFIRM_ROUND_SUMMARY": {
      const summaryText = action.payload;
      const updatedAgenda = state.currentAgendaItemId
        ? state.agenda.map((item) =>
            item.id === state.currentAgendaItemId
              ? { ...item, completed: true }
              : item
          )
        : state.agenda;
      const newQueue = buildRoundQueue(state.baseSpeakingOrder);
      return {
        ...state,
        roundSummaries: {
          ...state.roundSummaries,
          [state.round]: summaryText,
        },
        currentQueueIndex: 0,
        currentSpeakerStatus: "waiting",
        round: state.round + 1,
        currentAgendaItemId: null,
        agenda: updatedAgenda,
        roundQueue: newQueue,
        showRoundSummaryModal: false,
        pendingRoundEnd: null,
      };
    }

    case "SET_ROUND_SUMMARY":
      return {
        ...state,
        roundSummaries: {
          ...state.roundSummaries,
          [action.payload.round]: action.payload.text,
        },
      };

    case "OPEN_AGREEMENT_MODAL":
      return { ...state, showAgreementModal: true };

    case "CLOSE_AGREEMENT_MODAL":
      return { ...state, showAgreementModal: false };

    case "CREATE_AGREEMENT":
      return {
        ...state,
        agreements: [
          ...state.agreements,
          {
            id: nextAgreementId++,
            round: action.payload.round ?? state.round,
            title: action.payload.title,
            description: action.payload.description,
            signatories: action.payload.signatories,
            timestamp: new Date().toLocaleTimeString("pt-BR"),
          },
        ],
        showAgreementModal: false,
      };

    case "END_SESSION":
      return {
        ...state,
        phase: "ended",
      };

    case "RESET":
      nextAgendaId = 1;
      nextAgreementId = 1;
      return { ...initialState };

    default:
      return state;
  }
}

export function ConclaveProvider({ children }) {
  const [state, dispatch] = useReducer(conclaveReducer, initialState);

  return (
    <ConclaveContext value={state}>
      <ConclaveDispatchContext value={dispatch}>
        {children}
      </ConclaveDispatchContext>
    </ConclaveContext>
  );
}

export function useConclave() {
  const context = useContext(ConclaveContext);
  if (!context) throw new Error("useConclave must be used within ConclaveProvider");
  return context;
}

export function useConclaveDispatch() {
  const context = useContext(ConclaveDispatchContext);
  if (!context) throw new Error("useConclaveDispatch must be used within ConclaveProvider");
  return context;
}
