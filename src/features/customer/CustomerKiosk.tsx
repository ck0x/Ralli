import { useMemo, useState, useEffect, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import clsx from "clsx";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-react";
import { Maximize, Minimize, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { PastOrdersModal } from "./PastOrdersModal";
import { stringCatalog } from "@/lib/strings";
import { racketBrands, popularRacketModels } from "@/lib/rackets";
import { createOrder, fetchCustomerByPhone } from "@/lib/api";
import type { OrderFormValues, Order } from "@/types";

const schema = z.object({
  phone: z.string().min(7, "Phone number is required (min 7 digits)"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  preferredLanguage: z.string(),
  racketBrand: z.string().min(1, "Racket brand is required"),
  racketModel: z.string().optional().or(z.literal("")),
  stringCategory: z.string(), // Relaxed from enum to allow defaults/custom
  stringFocus: z.string(), // Relaxed from enum
  stringBrand: z.string().min(1, "String brand is required"),
  stringModel: z.string().min(1, "String model is required"),
  tension: z.coerce
    .number()
    .min(15, "Tension must be at least 15")
    .max(35, "Tension must be at most 35"),
  preStretch: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional(),
  isExpress: z.boolean().optional(),
  notes: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

type StepStatus = "idle" | "loading" | "found" | "not_found" | "error";
type SubmissionStatus = "idle" | "success" | "error" | "loading";

const defaultValues: OrderFormValues = {
  phone: "",
  name: "",
  email: "",
  preferredLanguage: "en",
  racketBrand: "",
  racketModel: "",
  stringCategory: "durable",
  stringFocus: "attack",
  stringBrand: "",
  stringModel: "",
  tension: 24,
  preStretch: "",
  dueDate: "",
  isExpress: false,
  notes: "",
};

export const CustomerKiosk = () => {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const adminUserId = user?.id;
  const [step, setStep] = useState(0);
  const kioskRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showPastOrdersModal, setShowPastOrdersModal] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void kioskRef.current?.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  const [lookupStatus, setLookupStatus] = useState<StepStatus>("idle");
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("idle");
  const [preStretchEnabled, setPreStretchEnabled] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(schema) as Resolver<FormValues>,
    mode: "onBlur",
  });

  const watchedStringBrand = watch("stringBrand");
  const watchedStringModel = watch("stringModel");

  // Auto-detect category/focus when user manually selects/types a string that exists in catalog
  useEffect(() => {
    if (!watchedStringBrand || !watchedStringModel) return;

    for (const group of stringCatalog) {
      const match = group.options.find(
        (o) =>
          o.brand.toLowerCase() === watchedStringBrand.toLowerCase() &&
          o.model.toLowerCase() === watchedStringModel.toLowerCase(),
      );
      if (match) {
        setValue("stringCategory", group.category);
        setValue("stringFocus", group.focus);
        return;
      }
    }
  }, [watchedStringBrand, watchedStringModel, setValue]);

  // Derived options for Autocomplete
  const stringBrandOptions = useMemo(() => {
    const brands = new Set<string>();
    stringCatalog.forEach((group) => {
      group.options.forEach((opt) => brands.add(opt.brand));
    });
    return Array.from(brands).sort();
  }, []);

  const stringModelOptions = useMemo(() => {
    const models = new Set<string>();
    stringCatalog.forEach((group) => {
      group.options.forEach((opt) => {
        if (
          !watchedStringBrand ||
          opt.brand.toLowerCase() === watchedStringBrand.toLowerCase()
        ) {
          models.add(opt.model);
        }
      });
    });
    return Array.from(models).sort();
  }, [watchedStringBrand]);

  const handleSelectPastOrder = (order: Order) => {
    // Populate form with past order details
    setValue("racketBrand", order.racketBrand);
    setValue("racketModel", order.racketModel || "");
    setValue("stringBrand", order.stringBrand);
    setValue("stringModel", order.stringModel);
    setValue("tension", order.tension);
    setValue("preStretch", order.preStretch || "");
    setValue("stringCategory", order.stringCategory);
    setValue("stringFocus", order.stringFocus);

    // We already have customer details from the lookup
    setShowPastOrdersModal(false);

    // Advance to review step directly? Or Racket step?
    // Prompt said "pick and submit" or "submit new one and continue".
    // "Suggests past configurations... pick and submit".
    // Let's go to Review step (Step 4) so they can verify and submit.
    // But they might want to change due date or express.
    // Jumping to step 4 (Review) seems appropriate for "Quick Reorder".
    setStep(4);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionStatus("loading");
    try {
      await createOrder(values as OrderFormValues, adminUserId);
      setSubmissionStatus("success");
      toast.success(t("messages.submitSuccess"));
      // Give some time for animation/success message before reset
      setTimeout(() => {
        setStep(0);
        reset(defaultValues);
        setSubmissionStatus("idle");
      }, 3000);
    } catch (error: any) {
      setSubmissionStatus("error");
      toast.error(error.message || t("messages.submitError"));
    }
  });

  const stepLabels = [
    t("steps.lookup"),
    t("steps.personal"),
    t("steps.racket"),
    t("steps.string"),
    t("steps.review"),
  ];

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    switch (step) {
      case 0:
        fieldsToValidate = ["phone"];
        break;
      case 1:
        fieldsToValidate = ["name", "email", "preferredLanguage"];
        break;
      case 2:
        fieldsToValidate = ["racketBrand", "racketModel", "notes"];
        break;
      case 3:
        fieldsToValidate = [
          "stringCategory",
          "stringFocus",
          "stringBrand",
          "stringModel",
          "tension",
        ];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    // Special logic for Step 0 (Lookup)
    if (step === 0) {
      const phone = watch("phone");
      setLookupStatus("loading");
      try {
        const result = await fetchCustomerByPhone(phone, adminUserId);
        if (result?.customer) {
          setValue("name", result.customer.name);
          setValue("email", result.customer.email ?? "");
          setValue(
            "preferredLanguage",
            result.customer.preferredLanguage ?? "en",
          );
          if (result.customer.preferredLanguage) {
            void i18n.changeLanguage(result.customer.preferredLanguage);
          }
          setLookupStatus("found");

          if (result.recentOrders && result.recentOrders.length > 0) {
            console.log(
              "CustomerKiosk: Found recent orders, showing modal",
              result.recentOrders.length,
            );
            setRecentOrders(result.recentOrders);
            setShowPastOrdersModal(true);
            return; // Wait for modal
          } else {
            console.log(
              "CustomerKiosk: No recent orders found for returning customer",
            );
          }
        } else {
          setLookupStatus("not_found");
        }
      } catch (e) {
        console.error("Lookup failed", e);
        // Fail gracefully, treat as new user and show an error state
        setLookupStatus("error");
        toast.error(t("messages.submitError"));
        return;
      }
    }

    setStep((prev) => prev + 1);
  };
  const canGoBack = step > 0;
  const canGoNext = step < stepLabels.length - 1;

  return (
    <div
      ref={kioskRef}
      className={clsx(
        "kiosk",
        isFullscreen &&
          "fixed inset-0 z-50 flex h-dvh w-screen max-w-none items-center justify-center overflow-auto bg-gray-100 p-4",
      )}
    >
      <Card className={clsx("kiosk-card", isFullscreen && "w-full max-w-4xl")}>
        {submissionStatus === "success" ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-75"></div>
              <div className="relative rounded-full bg-green-100 p-8 text-green-600 shadow-inner">
                <CheckCircle2 className="h-24 w-24" />
              </div>
            </div>
            <h2 className="mb-4 text-4xl font-extrabold text-gray-900">
              {t("messages.submitSuccess")}
            </h2>
            <p className="max-w-md text-xl text-gray-600 leading-relaxed">
              Redirecting you to the start in a moment...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                type="button"
                title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="stepper">
              {stepLabels.map((label, index) => (
                <div
                  key={label}
                  className={`step ${index === step ? "active" : ""}`}
                >
                  <span>{index + 1}</span>
                  <p>{label}</p>
                </div>
              ))}
            </div>

            <form onSubmit={onSubmit}>
              {step === 0 && (
                <section className="step-panel">
                  <h2>{t("steps.lookup")}</h2>
                  <p className="muted">{t("messages.lookupHelp")}</p>
                  <div className="form-grid">
                    <label>
                      {t("fields.phone")}
                      <input
                        {...register("phone")}
                        placeholder="000-000-0000"
                      />
                      {errors.phone && (
                        <span className="error">{errors.phone.message}</span>
                      )}
                    </label>
                  </div>
                </section>
              )}

              {step === 1 && (
                <section className="step-panel">
                  <h2>{t("steps.personal")}</h2>
                  <div className="form-grid">
                    <label>
                      {t("fields.name")}
                      <input {...register("name")} />
                      {errors.name && (
                        <span className="error">{errors.name.message}</span>
                      )}
                    </label>
                    <label>
                      {t("fields.email")}
                      <input {...register("email")} />
                      {errors.email && (
                        <span className="error">{errors.email.message}</span>
                      )}
                    </label>
                    <label>
                      {t("fields.preferredLanguage")}
                      <select
                        {...register("preferredLanguage", {
                          onChange: (event) => {
                            void i18n.changeLanguage(event.target.value);
                          },
                        })}
                      >
                        <option value="en">English</option>
                        <option value="ko">한국어</option>
                        <option value="zh">中文</option>
                      </select>
                    </label>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="step-panel">
                  <h2>{t("steps.racket")}</h2>
                  <div className="form-grid">
                    <Autocomplete
                      label={t("fields.racketBrand")}
                      {...register("racketBrand")}
                      value={watch("racketBrand") || ""}
                      options={racketBrands}
                      onSelectOption={(val) =>
                        setValue("racketBrand", val, { shouldValidate: true })
                      }
                      error={errors.racketBrand?.message}
                    />
                    <Autocomplete
                      label={t("fields.racketModel")}
                      {...register("racketModel")}
                      value={watch("racketModel") || ""}
                      options={popularRacketModels}
                      onSelectOption={(val) =>
                        setValue("racketModel", val, { shouldValidate: true })
                      }
                    />
                    <label>
                      {t("fields.notes")}
                      <textarea rows={3} {...register("notes")} />
                    </label>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="step-panel">
                  <div className="flex items-center justify-between">
                    <h2>{t("steps.string")}</h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowWizard(true)}
                      className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white shadow-sm transition-all"
                    >
                      <span className="mr-2 hidden sm:inline">Not sure?</span>
                      Help me choose
                    </Button>
                  </div>

                  <input type="hidden" {...register("stringCategory")} />
                  <input type="hidden" {...register("stringFocus")} />

                  <div className="form-grid">
                    <Autocomplete
                      label={t("fields.stringBrand")}
                      {...register("stringBrand")}
                      value={watch("stringBrand") || ""}
                      options={stringBrandOptions}
                      onSelectOption={(val) =>
                        setValue("stringBrand", val, { shouldValidate: true })
                      }
                      error={errors.stringBrand?.message}
                      placeholder="e.g. Yonex"
                    />
                    <Autocomplete
                      label={t("fields.stringModel")}
                      {...register("stringModel")}
                      value={watch("stringModel") || ""}
                      options={stringModelOptions}
                      onSelectOption={(val) =>
                        setValue("stringModel", val, { shouldValidate: true })
                      }
                      error={errors.stringModel?.message}
                      placeholder="e.g. BG80"
                    />
                  </div>

                  <StringWizardModal
                    isOpen={showWizard}
                    onClose={() => setShowWizard(false)}
                    onSelect={(selection) => {
                      setValue("stringCategory", selection.category);
                      setValue("stringFocus", selection.focus);
                      setValue("stringBrand", selection.brand, {
                        shouldValidate: true,
                      });
                      setValue("stringModel", selection.model, {
                        shouldValidate: true,
                      });
                    }}
                  />

                  <div className="form-grid">
                    <label>
                      {t("fields.tension")}
                      <input
                        type="number"
                        min={15}
                        max={35}
                        {...register("tension", { valueAsNumber: true })}
                      />
                      {errors.tension && (
                        <span className="error">{errors.tension.message}</span>
                      )}
                    </label>

                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t("fields.preStretchToggle")}
                      </span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 font-normal">
                          <input
                            type="radio"
                            name="preStretchToggle"
                            checked={!preStretchEnabled}
                            onChange={() => {
                              setPreStretchEnabled(false);
                              setValue("preStretch", "");
                            }}
                          />
                          No
                        </label>
                        <label className="flex items-center gap-2 font-normal">
                          <input
                            type="radio"
                            name="preStretchToggle"
                            checked={preStretchEnabled}
                            onChange={() => {
                              setPreStretchEnabled(true);
                              setValue("preStretch", "5%");
                            }}
                          />
                          Yes
                        </label>
                      </div>
                    </div>

                    {preStretchEnabled && (
                      <label>
                        {t("fields.preStretch")}
                        <select {...register("preStretch")}>
                          <option value="5%">5%</option>
                          <option value="10%">10%</option>
                          <option value="15%">15%</option>
                          <option value="20%">20%</option>
                        </select>
                      </label>
                    )}
                  </div>
                </section>
              )}

              {step === 4 && (
                <section className="step-panel">
                  <h2>{t("steps.review")}</h2>

                  <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-6">
                    <h3 className="mb-4 text-lg font-bold">Options</h3>
                    <div className="form-grid">
                      <label>
                        {t("fields.dueDate")}
                        <input type="date" {...register("dueDate")} />
                      </label>
                      <label className="flex h-full cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                          {...register("isExpress")}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {t("fields.isExpress")}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="review-grid">
                    <div>
                      <p className="label">{t("fields.name")}</p>
                      <p>{watch("name")}</p>
                    </div>
                    <div>
                      <p className="label">{t("fields.phone")}</p>
                      <p>{watch("phone")}</p>
                    </div>
                    <div>
                      <p className="label">{t("fields.email")}</p>
                      <p>{watch("email") || "-"}</p>
                    </div>
                    <div>
                      <p className="label">{t("fields.racketBrand")}</p>
                      <p>{watch("racketBrand")}</p>
                    </div>
                    <div>
                      <p className="label">{t("fields.racketModel")}</p>
                      <p>{watch("racketModel") || "-"}</p>
                    </div>
                    <div>
                      <p className="label">{t("fields.stringBrand")}</p>
                      <p>{watch("stringBrand")}</p>
                    </div>
                    <div>
                      <p className="label">{t("fields.stringModel")}</p>
                      <p>{watch("stringModel")}</p>
                    </div>
                    <div>
                      <p className="label">{t("fields.tension")}</p>
                      <p>{watch("tension")} lbs</p>
                    </div>
                    {watch("preStretch") && (
                      <div>
                        <p className="label">{t("fields.preStretch")}</p>
                        <p>{watch("preStretch")}</p>
                      </div>
                    )}
                    {watch("dueDate") && (
                      <div>
                        <p className="label">{t("fields.dueDate")}</p>
                        <p>{watch("dueDate")}</p>
                      </div>
                    )}
                    {watch("isExpress") && (
                      <div>
                        <p className="label">Priority</p>
                        <p className="font-bold text-red-600">Express</p>
                      </div>
                    )}
                  </div>
                  {submissionStatus === "error" && (
                    <p className="error">{t("messages.submitError")}</p>
                  )}
                  {!adminUserId && (
                    <p className="warning">
                      You must be signed in to submit an order.
                    </p>
                  )}
                </section>
              )}

              <div className="step-actions">
                {canGoBack && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep((prev) => prev - 1)}
                  >
                    {t("actions.back")}
                  </Button>
                )}
                {canGoNext && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    isLoading={lookupStatus === "loading"}
                  >
                    {t("actions.next")}
                  </Button>
                )}
                {step === 4 && (
                  <Button
                    type="submit"
                    disabled={!adminUserId}
                    isLoading={submissionStatus === "loading"}
                  >
                    {t("actions.submit")}
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
      </Card>

      <PastOrdersModal
        isOpen={showPastOrdersModal}
        onClose={() => {
          setShowPastOrdersModal(false);
          setStep(1); // Proceed as new/standard
        }}
        onSelect={handleSelectPastOrder}
        orders={recentOrders}
        customerName={watch("name")}
      />
    </div>
  );
};
