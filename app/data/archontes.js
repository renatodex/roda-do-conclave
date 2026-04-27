// Hierarquia (rank) is read from the heraldic icon on each Arconte's banner:
//   1 = Sol                       (rank mais baixo)
//   2 = Homem com braços abertos  (rank intermediário)
//   3 = Dragão com língua         (rank mais alto)
// Quanto maior o número da hierarquia, mais alto o posto.
// Hierarquia 0 = posto desconhecido (Arconte não está em jogo nesta partida).
//
// votingPower (Poder de Votação) ainda não é mensurável a partir dos materiais
// disponíveis; mantido em 0 até que se tenha como aferi-lo.
export const ARCHONTES = [
  {
    id: "astaroth",
    name: "Astaroth",
    description: "Conquistador. Força bruta em combate corpo a corpo com a Dark Art Draconic Razzia.",
    avatar: "/avatars/astaroth.webp",
    prestige: 4,
    hierarchy: 3,
    votingPower: 0,
  },
  {
    id: "beelzebub",
    name: "Beelzebub",
    description: "Conquistadora. Converte a essência de legiões destruídas em tributo com Hell's Maw.",
    avatar: "/avatars/beelzebub.webp",
    prestige: 45,
    hierarchy: 3,
    votingPower: 0,
  },
  {
    id: "andromalius",
    name: "Andromalius",
    description: "Duelista. Mestre em intriga e engano, fortalece Praetores com Vanity's Anointed.",
    avatar: "/avatars/andromalius.webp",
    prestige: 58,
    hierarchy: 2,
    votingPower: 0,
  },
  {
    id: "erzsebet",
    name: "Erzsebet",
    description: "Conquistadora. Cruza territórios inimigos livremente com Lure of Excess.",
    avatar: "/avatars/erzsebet.webp",
    prestige: 0,
    hierarchy: 0,
    votingPower: 0,
  },
  {
    id: "mammon",
    name: "Mammon",
    description: "Versátil. Rouba tributos dos oponentes com Chains of Avarice.",
    avatar: "/avatars/mammon.webp",
    prestige: 39,
    hierarchy: 1,
    votingPower: 0,
  },
  {
    id: "belial",
    name: "Belial",
    description: "Manipulador. Coloca Arcontes rivais uns contra os outros em guerra aberta.",
    avatar: "/avatars/belial.webp",
    prestige: 64,
    hierarchy: 2,
    votingPower: 0,
  },
  {
    id: "murmur",
    name: "Murmur",
    description: "Feiticeiro. Invoca legiões extras com Danse Macabre e domina rituais destrutivos.",
    avatar: "/avatars/murmur.webp",
    prestige: 24,
    hierarchy: 2,
    votingPower: 0,
  },
  {
    id: "lilith",
    name: "Lilith",
    description: "Feiticeira. Descobre fraquezas de legiões inimigas com Baleful Gaze.",
    avatar: "/avatars/lilith.webp",
    prestige: 0,
    hierarchy: 0,
    votingPower: 0,
  },
];

export const MAX_ATTENDEES = 6;

export function getArchonte(id) {
  return ARCHONTES.find((a) => a.id === id);
}

/**
 * Compares two Arcontes by Prestige, with Hierarchy as tiebreaker.
 * Higher `hierarchy` number means higher rank (Codex 3.1: "maior hierarquia").
 * - direction: "desc" → highest prestige first (Rule 3.1)
 *              "asc"  → lowest prestige first  (Rule 3.2)
 */
export function compareByPrestige(a, b, direction = "desc") {
  const sign = direction === "asc" ? 1 : -1;
  if (a.prestige !== b.prestige) return sign * (a.prestige - b.prestige);
  return sign * (a.hierarchy - b.hierarchy);
}

/**
 * Returns Arcontes ordered for the speaking sequence (Rule 5.1):
 * Potestade speaks first, then by descending Prestige.
 */
export function orderForSpeaking(presentIds, potestadeId) {
  const present = presentIds
    .map(getArchonte)
    .filter(Boolean)
    .filter((a) => a.id !== potestadeId)
    .sort((a, b) => compareByPrestige(a, b, "desc"));
  const potestade = getArchonte(potestadeId);
  return [potestade, ...present].filter(Boolean).map((a) => a.id);
}

/**
 * Picks the Potestade among present Arcontes (Rule 3.1 / 3.2).
 */
export function pickPotestade(presentIds, mode = "highest") {
  const present = presentIds.map(getArchonte).filter(Boolean);
  if (present.length === 0) return null;
  const sorted = [...present].sort((a, b) =>
    compareByPrestige(a, b, mode === "lowest" ? "asc" : "desc")
  );
  return sorted[0].id;
}
