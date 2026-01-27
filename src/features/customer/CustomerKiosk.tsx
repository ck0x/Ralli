import { useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { stringCatalog } from "@/lib/strings";
import { createOrder, fetchCustomerByPhone } from "@/lib/api";
import type { OrderFormValues } from "@/types";

const schema = z.object({
  phone: z.string().min(7, "Phone number is required (min 7 digits)"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  preferredLanguage: z.string(),
  racketBrand: z.string().min(1, "Racket brand is required"),
  racketModel: z.string().optional().or(z.literal("")),
  stringCategory: z.enum(["durable", "repulsion"]),
  stringFocus: z.enum(["attack", "control"]),
  stringBrand: z.string().min(1, "String brand is required"),
  stringModel: z.string().min(1, "String model is required"),
  tension: z.coerce
    .number()
    .min(15, "Tension must be at least 15")
    .max(35, "Tension must be at most 35"),
  notes: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

type StepStatus = "idle" | "loading" | "found" | "not_found" | "error";

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
  notes: "",
};

export const CustomerKiosk = () => {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const adminUserId = user?.id;
  const configuredAdminId = import.meta.env.VITE_ADMIN_USER_ID;
  const isAdmin =
    adminUserId && configuredAdminId && adminUserId === configuredAdminId;
  const [step, setStep] = useState(0);
  const [showStringHelper, setShowStringHelper] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<StepStatus>("idle");
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

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

  const stringCategory = watch("stringCategory");
  const stringFocus = watch("stringFocus");

  const stringOptions = useMemo(() => {
    return stringCatalog.filter(
      (item) => item.category === stringCategory && item.focus === stringFocus,
    );
  }, [stringCategory, stringFocus]);

  const handleLookup = async () => {
    const phone = watch("phone");
    if (!phone) return;

    setLookupStatus("loading");

    try {
      const customer = await fetchCustomerByPhone(phone, adminUserId);
      if (customer) {
        setValue("name", customer.name);
        setValue("email", customer.email ?? "");
        setValue("preferredLanguage", customer.preferredLanguage ?? "en");
        if (customer.preferredLanguage) {
          void i18n.changeLanguage(customer.preferredLanguage);
        }
        setLookupStatus("found");
      } else {
        setLookupStatus("not_found");
      }
    } catch {
      setLookupStatus("error");
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionStatus("idle");
    try {
      await createOrder(
        values as OrderFormValues,
        isAdmin ? adminUserId : undefined,
      );
      setSubmissionStatus("success");
      setStep(0);
      reset(defaultValues);
    } catch {
      setSubmissionStatus("error");
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
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };
  const canGoBack = step > 0;
  const canGoNext = step < stepLabels.length - 1;

  return (
    <div className="kiosk">
      <Card className="kiosk-card">
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
                  <input {...register("phone")} placeholder="000-000-0000" />
                  {errors.phone && (
                    <span className="error">{errors.phone.message}</span>
                  )}
                </label>
              </div>
              <div className="row">
                <Button type="button" onClick={handleLookup}>
                  {t("actions.lookup")}
                </Button>
                {lookupStatus === "found" && (
                  <span className="success">{t("messages.profileFound")}</span>
                )}
                {lookupStatus === "not_found" && (
                  <span className="muted">{t("messages.profileNotFound")}</span>
                )}
                {lookupStatus === "error" && (
                  <span className="error">{t("messages.submitError")}</span>
                )}
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
                <label>
                  {t("fields.racketBrand")}
                  <input {...register("racketBrand")} />
                  {errors.racketBrand && (
                    <span className="error">{errors.racketBrand.message}</span>
                  )}
                </label>
                <label>
                  {t("fields.racketModel")}
                  <input {...register("racketModel")} />
                </label>
                <label>
                  {t("fields.notes")}
                  <textarea rows={3} {...register("notes")} />
                </label>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="step-panel">
              <h2>{t("steps.string")}</h2>
              <div className="form-grid">
                <label>
                  {t("fields.stringCategory")}
                  <select {...register("stringCategory")}>
                    <option value="durable">{t("strings.durable")}</option>
                    <option value="repulsion">{t("strings.repulsion")}</option>
                  </select>
                </label>
                <label>
                  {t("fields.stringFocus")}
                  <select {...register("stringFocus")}>
                    <option value="attack">{t("strings.attack")}</option>
                    <option value="control">{t("strings.control")}</option>
                  </select>
                </label>
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
              </div>
              <div className="string-helper">
                {stringOptions.map((group) => (
                  <Card key={group.title} className="string-card">
                    <h3>{group.title}</h3>
                    <div className="string-options">
                      {group.options.map((option) => (
                        <button
                          key={`${option.brand}-${option.model}`}
                          type="button"
                          onClick={() => {
                            setValue("stringBrand", option.brand);
                            setValue("stringModel", option.model);
                          }}
                        >
                          <strong>{option.brand}</strong>
                          <span>{option.model}</span>
                        </button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
              <div className="form-grid">
                <label>
                  {t("fields.stringBrand")}
                  <input {...register("stringBrand")} />
                  {errors.stringBrand && (
                    <span className="error">{errors.stringBrand.message}</span>
                  )}
                </label>
                <label>
                  {t("fields.stringModel")}
                  <input {...register("stringModel")} />
                  {errors.stringModel && (
                    <span className="error">{errors.stringModel.message}</span>
                  )}
                </label>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="step-panel">
              <h2>{t("steps.review")}</h2>
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
                  <p>{watch("tension")}</p>
                </div>
              </div>
              {submissionStatus === "success" && (
                <p className="success">{t("messages.submitSuccess")}</p>
              )}
              {submissionStatus === "error" && (
                <p className="error">{t("messages.submitError")}</p>
              )}
              {!isAdmin && (
                <p className="warning">{t("messages.adminOnlySubmit")}</p>
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
              <Button type="button" onClick={handleNext}>
                {t("actions.next")}
              </Button>
            )}
            {step === 4 && (
              <Button type="submit" disabled={!isAdmin}>
                {t("actions.submit")}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
