export type StringOption = {
  brand: string;
  model: string;
};

export type StringGroup = {
  category: "durable" | "repulsion";
  focus: "attack" | "control";
  title: string;
  options: StringOption[];
};

export const stringCatalog: StringGroup[] = [
  {
    category: "durable",
    focus: "attack",
    title: "Durable • Attack (Power-Focused)",
    options: [
      { brand: "Yonex", model: "BG 65 Ti" },
      { brand: "Yonex", model: "BG 68 Ti" },
      { brand: "Yonex", model: "NBG 99" },
      { brand: "Yonex", model: "Exbolt 68" },
      { brand: "Victor", model: "VBS 68 Power" },
      { brand: "Kizuna", model: "Z66" },
    ],
  },
  {
    category: "durable",
    focus: "control",
    title: "Durable • Control (Precision-Focused)",
    options: [
      { brand: "Yonex", model: "BG 65" },
      { brand: "Yonex", model: "NBG 95" },
      { brand: "Yonex", model: "Sky Arc" },
      { brand: "Victor", model: "VBS 69 Nano" },
      { brand: "Victor", model: "VS-100" },
      { brand: "Kizuna", model: "Z69" },
      { brand: "Kizuna", model: "Z65" },
    ],
  },
  {
    category: "repulsion",
    focus: "attack",
    title: "Repulsion • Attack (Speed & Power)",
    options: [
      { brand: "Yonex", model: "BG 66 Ultimax" },
      { brand: "Yonex", model: "BG 80" },
      { brand: "Yonex", model: "BG 80 Power" },
      { brand: "Yonex", model: "Exbolt 63" },
      { brand: "Yonex", model: "Aerobite Boost" },
      { brand: "Yonex", model: "Aerosonic" },
      { brand: "Victor", model: "VBS-68" },
      { brand: "Victor", model: "VBS-61" },
      { brand: "Kizuna", model: "Z61" },
      { brand: "Kizuna", model: "Z58" },
    ],
  },
  {
    category: "repulsion",
    focus: "control",
    title: "Repulsion • Control (Feel & Placement)",
    options: [
      { brand: "Yonex", model: "NBG 98" },
      { brand: "Yonex", model: "Exbolt 65" },
      { brand: "Yonex", model: "Aerobite" },
      { brand: "Yonex", model: "BG 66 Force" },
      { brand: "Victor", model: "VBS 63" },
      { brand: "Victor", model: "VBS 66 Nano" },
      { brand: "Kizuna", model: "Z63X" },
    ],
  },
];
