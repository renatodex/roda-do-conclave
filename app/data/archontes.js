export const ARCHONTES = [
  {
    id: "astaroth",
    name: "Astaroth",
    description: "Conquistador. Força bruta em combate corpo a corpo com a Dark Art Draconic Razzia.",
    avatar: "/avatars/astaroth.webp",
  },
  {
    id: "beelzebub",
    name: "Beelzebub",
    description: "Conquistadora. Converte a essência de legiões destruídas em tributo com Hell's Maw.",
    avatar: "/avatars/beelzebub.webp",
  },
  {
    id: "andromalius",
    name: "Andromalius",
    description: "Duelista. Mestre em intriga e engano, fortalece Praetores com Vanity's Anointed.",
    avatar: "/avatars/andromalius.webp",
  },
  {
    id: "erzsebet",
    name: "Erzsebet",
    description: "Conquistadora. Cruza territórios inimigos livremente com Lure of Excess.",
    avatar: "/avatars/erzsebet.webp",
  },
  {
    id: "mammon",
    name: "Mammon",
    description: "Versátil. Rouba tributos dos oponentes com Chains of Avarice.",
    avatar: "/avatars/mammon.webp",
  },
  {
    id: "belial",
    name: "Belial",
    description: "Manipulador. Coloca Arcontes rivais uns contra os outros em guerra aberta.",
    avatar: "/avatars/belial.webp",
  },
  {
    id: "murmur",
    name: "Murmur",
    description: "Feiticeiro. Invoca legiões extras com Danse Macabre e domina rituais destrutivos.",
    avatar: "/avatars/murmur.webp",
  },
  {
    id: "lilith",
    name: "Lilith",
    description: "Feiticeira. Descobre fraquezas de legiões inimigas com Baleful Gaze.",
    avatar: "/avatars/lilith.webp",
  },
];

export function getArchonte(id) {
  return ARCHONTES.find((a) => a.id === id);
}
