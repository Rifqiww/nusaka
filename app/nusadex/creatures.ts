export interface Creature {
  id: number;
  name: string;
  type: string;
  description: string;
  modelUrl: string;
  accent: string;
  habitat: string;
  status: string;
  level: number;
  exp: number;
}

export const NUSA_CREATURES: Creature[] = [
  {
    id: 1,
    name: "Rajawali",
    type: "Sky",
    description:
      "Sang penjaga langit nusantara yang perkasa dengan kepakan sayap yang membelah awan.",
    modelUrl: "/model/rajawali.glb",
    accent: "text-yellow-600",
    habitat: "Puncak Gunung",
    status: "Legenda",
    level: 24,
    exp: 45,
  },
  {
    id: 2,
    name: "Komodo",
    type: "Dragon",
    description:
      "Naga purba dari tanah timur, memiliki gigitan yang mematikan dan ketahanan luar biasa.",
    modelUrl: "/model/Komodo.glb",
    accent: "text-orange-600",
    habitat: "Pulau Gersang",
    status: "Dilindungi",
    level: 32,
    exp: 80,
  },
  {
    id: 3,
    name: "OrangUtan",
    type: "Beast",
    description:
      "Penghuni cerdas dari pedalaman hutan Kalimantan, penjaga keseimbangan alam.",
    modelUrl: "/model/OrangUtan.glb",
    accent: "text-red-700",
    habitat: "Hutan Rimba",
    status: "Langka",
    level: 15,
    exp: 65,
  },
];
