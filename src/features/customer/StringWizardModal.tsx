import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { stringCatalog } from "@/lib/strings";
import { Shield, Zap, Crosshair, Swords } from "lucide-react";

interface StringWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selection: {
    brand: string;
    model: string;
    category: "durable" | "repulsion";
    focus: "attack" | "control";
  }) => void;
}

export const StringWizardModal: React.FC<StringWizardModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState<{
    category?: "durable" | "repulsion";
    focus?: "attack" | "control";
  }>({});

  const reset = () => {
    setStep(0);
    setSelection({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const recommendedGroup = stringCatalog.find(
    (g) => g.category === selection.category && g.focus === selection.focus,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 2 ? "Recommended Strings" : "Help Me Choose"}
    >
      <div className="min-h-[300px] flex flex-col">
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-wizard-slide-in">
            <h3 className="text-xl font-bold text-center">
              What matters most to you?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <button
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all text-center group active:scale-95 duration-200"
                onClick={() => {
                  setSelection((prev) => ({ ...prev, category: "durable" }));
                  setStep(1);
                }}
              >
                <div className="p-4 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Shield size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">
                    {t("strings.durable")}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Long-lasting, economical
                  </p>
                </div>
              </button>

              <button
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-orange-500 hover:bg-orange-50 transition-all text-center group active:scale-95 duration-200"
                onClick={() => {
                  setSelection((prev) => ({ ...prev, category: "repulsion" }));
                  setStep(1);
                }}
              >
                <div className="p-4 rounded-full bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                  <Zap size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">
                    {t("strings.repulsion")}
                  </h4>
                  <p className="text-sm text-gray-500">
                    High rebound, satisfying sound
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-wizard-slide-in">
            <h3 className="text-xl font-bold text-center">
              What is your play style?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <button
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-red-500 hover:bg-red-50 transition-all text-center group active:scale-95 duration-200"
                onClick={() => {
                  setSelection((prev) => ({ ...prev, focus: "attack" }));
                  setStep(2);
                }}
              >
                <div className="p-4 rounded-full bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                  <Swords size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">
                    {t("strings.attack")}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Smash power, hard hitting
                  </p>
                </div>
              </button>

              <button
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center group active:scale-95 duration-200"
                onClick={() => {
                  setSelection((prev) => ({ ...prev, focus: "control" }));
                  setStep(2);
                }}
              >
                <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <Crosshair size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">
                    {t("strings.control")}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Net play, precision, hold
                  </p>
                </div>
              </button>
            </div>
            <Button variant="ghost" onClick={() => setStep(0)} className="mt-4">
              Back
            </Button>
          </div>
        )}

        {step === 2 && recommendedGroup && (
          <div className="flex-1 flex flex-col gap-4 animate-wizard-slide-in">
            <div className="text-center mb-2">
              <p className="text-gray-600">
                Based on your choices:{" "}
                <strong className="text-gray-900 capitalize">
                  {selection.category}
                </strong>{" "}
                &{" "}
                <strong className="text-gray-900 capitalize">
                  {selection.focus}
                </strong>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto p-1">
              {recommendedGroup.options.map((option) => {
                const handleChoose = () => {
                  onSelect({
                    brand: option.brand,
                    model: option.model,
                    category: selection.category!,
                    focus: selection.focus!,
                  });
                  handleClose();
                };

                return (
                  <div
                    key={`${option.brand}-${option.model}`}
                    role="button"
                    tabIndex={0}
                    onClick={handleChoose}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleChoose();
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-gray-900">
                        {option.brand}
                      </span>
                      <span className="text-sm text-gray-500">
                        {option.model}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="pointer-events-none"
                    >
                      Select
                    </Button>
                  </div>
                );
              })}
            </div>
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              className="mt-4 mx-auto"
            >
              Back
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
