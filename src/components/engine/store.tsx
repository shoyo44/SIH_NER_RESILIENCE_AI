import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type Role = "driver" | "admin";
export type Lang = "assamese" | "hindi" | "bengali" | "english";

const DEFAULTS = {
  currentRole: "admin" as Role,
  isOffline: false,
  hazardTriggered: false,
  hazardReported: false,
  activeLanguage: "english" as Lang,
  isDrawerOpen: false,
  selectedTruck: "AS-4412",
  activeModal: null as string | null,
  rainfall: 60,
  soilMoisture: 40,
};

type State = typeof DEFAULTS;

interface Ctx extends State {
  set: (patch: Partial<State>) => void;
  reset: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const EngineCtx = createContext<Ctx | null>(null);

export function EngineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(DEFAULTS);
  const [toast, setToast] = useState<string | null>(null);
  const set = useCallback((patch: Partial<State>) => setState((s) => ({ ...s, ...patch })), []);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);
  const reset = useCallback(() => {
    setState((s) => ({ ...DEFAULTS, currentRole: s.currentRole }));
    showToast("Simulation reset to baseline");
  }, [showToast]);
  return (
    <EngineCtx.Provider value={{ ...state, set, reset, toast, showToast }}>{children}</EngineCtx.Provider>
  );
}

export function useEngine() {
  const c = useContext(EngineCtx);
  if (!c) throw new Error("useEngine outside provider");
  return c;
}

export const vulnerability = (rain: number, soil: number) =>
  Math.round(Math.min(100, (rain / 250) * 60 + soil * 0.4));

export const SMS_PACKET = "HZD|LND|25.18,92.85|SEV3|TRK-4412";
export const SMS_BASE64 = "SFpEfExORHwyNS4xOCw5Mi44NXxTRVYzfFRSSy00NDEy";

export const ALERT_TEXT: Record<Lang, string> = {
  assamese: "সাৱধান: ৫ কিলোমিটাৰ আগত ভূমিস্খলন চিনাক্ত কৰা হৈছে। বিকল্প ৰুট লোড কৰা হৈছে।",
  hindi: "सावधान: 5 किमी आगे भूस्खलन का पता चला है। नया सुरक्षित रूट लोड हो रहा है।",
  bengali: "সতর্কতা: ৫ কিমি এগিয়ে ভূমিধসের শনাক্তকরণ। নিরাপদ বিকল্প রুট প্রস্তুত।",
  english: "Caution: Active rockfall reported 5 km ahead on NH-06. Diverting to alternate link.",
};

export const LANG_CODE: Record<Lang, string> = {
  assamese: "as-IN",
  hindi: "hi-IN",
  bengali: "bn-IN",
  english: "en-IN",
};

export function Overlay({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
