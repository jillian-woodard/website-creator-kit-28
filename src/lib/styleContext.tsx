import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CategoryBudget {
  enabled: boolean;
  min: number;
  max: number;
}

export type ShoppingPreference = "mens" | "womens" | "nonbinary" | "both";

export interface StyleData {
  vibeDescription: string;
  inspirationImages: string[];
  selectedVisualCues: string[];
  budgetMin: number;
  budgetMax: number;
  bodyInputMethod: "photo" | "silhouette" | "manual" | null;
  silhouetteType: string;
  manualMeasurements: { bust: string; waist: string; hips: string };
  heightInches: number | null;
  shoppingPreference: ShoppingPreference | null;
  abChoices: number[];
  occasions: string[];
  categoryBudgets: Record<string, CategoryBudget>;
  profileGenerated: boolean;
}

export const SHOPPING_CATEGORIES = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Accessories",
] as const;

const defaultCategoryBudgets: Record<string, CategoryBudget> = SHOPPING_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = { enabled: false, min: 50, max: 200 };
    return acc;
  },
  {} as Record<string, CategoryBudget>
);

const defaultData: StyleData = {
  vibeDescription: "",
  inspirationImages: [],
  selectedVisualCues: [],
  budgetMin: 50,
  budgetMax: 500,
  bodyInputMethod: null,
  silhouetteType: "",
  manualMeasurements: { bust: "", waist: "", hips: "" },
  heightInches: null,
  shoppingPreference: null,
  abChoices: [],
  occasions: [],
  categoryBudgets: defaultCategoryBudgets,
  profileGenerated: false,
};

interface StyleContextType {
  data: StyleData;
  updateData: (partial: Partial<StyleData>) => void;
  resetData: () => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<StyleData>(defaultData);
  const updateData = (partial: Partial<StyleData>) =>
    setData((prev) => ({ ...prev, ...partial }));
  const resetData = () => setData(defaultData);

  return (
    <StyleContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = () => {
  const ctx = useContext(StyleContext);
  if (!ctx) throw new Error("useStyle must be within StyleProvider");
  return ctx;
};
