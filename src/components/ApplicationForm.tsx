import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Upload, ImageIcon, X, Loader2 } from "lucide-react";
import CityStateField from "./CityStateField";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type FormSubmissionInsert = Database["public"]["Tables"]["form_submissions"]["Insert"];

interface FormData {
  fullName: string;
  age: string;
  height: string;
  weight: string;
  email: string;
  instagram: string;
  whatsapp: string;
  city: string;
  state: string;
  mainGoal: string[];
  mainGoalOther: string;
  timeline: string;
  commitment: string;
  healthConditions: string[];
  healthConditionsOther: string;
  usesMedication: string;
  medicationDetails: string;
  usesHormones: string;
  hormoneDetails: string;
  foodRestrictions: string[];
  foodRestrictionsOther: string;
  allergyDetails: string;
  usesSupplements: string;
  supplementDetails: string;
  mealsPerDay: string;
  fixedMealTimes: string;
  dailyDiet: string;
  waterIntake: string;
  bingEating: string;
  smoking: string;
  smokingAmount: string;
  alcohol: string;
  alcoholFrequency: string;
  otherSubstances: string;
  otherSubstancesDetails: string;
  sleepHours: string;
  sleepQuality: string;
  stressLevel: string;
  trainingModalities: string[];
  trainingModalitiesOther: string;
  sportFrequency: string;
  musculacaoFrequency: string;
  ciclismoFrequency: string;
  caminhadaFrequency: string;
  corridaFrequency: string;
  trainingFrequency: string;
  trainingDuration: string;
  trainingExperience: string;
  workEffort: string;
  availableSchedule: string;
  hadProfessionalCoaching: string;
  agreement: boolean;
}

const initialForm: FormData = {
  fullName: "", age: "", height: "", weight: "", email: "", instagram: "", whatsapp: "", city: "", state: "",
  mainGoal: [], mainGoalOther: "", timeline: "", commitment: "5",
  healthConditions: [], healthConditionsOther: "",
  usesMedication: "", medicationDetails: "",
  usesHormones: "", hormoneDetails: "",
  foodRestrictions: [], foodRestrictionsOther: "", allergyDetails: "",
  usesSupplements: "", supplementDetails: "",
  mealsPerDay: "", fixedMealTimes: "", dailyDiet: "", waterIntake: "", bingEating: "",
  smoking: "", smokingAmount: "",
  alcohol: "", alcoholFrequency: "",
  otherSubstances: "", otherSubstancesDetails: "",
  sleepHours: "", sleepQuality: "5", stressLevel: "",
  trainingModalities: [], trainingModalitiesOther: "", sportFrequency: "", musculacaoFrequency: "", ciclismoFrequency: "", caminhadaFrequency: "", corridaFrequency: "",
  trainingFrequency: "", trainingDuration: "", trainingExperience: "",
  workEffort: "", availableSchedule: "", hadProfessionalCoaching: "",
  agreement: false,
};

const SectionTitle = ({ icon, children }: { icon: string; children: React.ReactNode }) => (
  <h3 className="font-bold text-xl uppercase text-primary border-b border-border pb-2 mb-6 mt-10 first:mt-0 flex items-center gap-2">
    <span>{icon}</span> {children}
  </h3>
);

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm text-muted-foreground">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {children}
  </div>
);

const inputClass = "w-full bg-muted border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors text-sm";

const findInvalidPaths = (value: unknown, path: string): string[] => {
  if (value === undefined) return [`${path} (undefined)`];
  if (typeof value === "string" && value.trim() === "") return [`${path} (string vazia)`];
  if (value === null) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findInvalidPaths(item, `${path}[${index}]`));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
      findInvalidPaths(item, `${path}.${key}`),
    );
  }

  return [];
};

const sanitizePayloadValue = (value: unknown): unknown => {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizePayloadValue(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, item]) => [key, sanitizePayloadValue(item)] as const)
        .filter(([, item]) => item !== undefined),
    );
  }

  return value;
};

const comparePayloads = (current: unknown, previous: unknown, path = "payload"): string[] => {
  if (JSON.stringify(current) === JSON.stringify(previous)) {
    return [];
  }

  if (
    current === null ||
    previous === null ||
    current === undefined ||
    previous === undefined ||
    typeof current !== "object" ||
    typeof previous !== "object"
  ) {
    return [`${path}: ${JSON.stringify(previous)} -> ${JSON.stringify(current)}`];
  }

  if (Array.isArray(current) || Array.isArray(previous)) {
    return [`${path}: ${JSON.stringify(previous)} -> ${JSON.stringify(current)}`];
  }

  const currentObj = current as Record<string, unknown>;
  const previousObj = previous as Record<string, unknown>;
  const keys = new Set([...Object.keys(currentObj), ...Object.keys(previousObj)]);

  return [...keys].flatMap((key) => comparePayloads(currentObj[key], previousObj[key], `${path}.${key}`));
};

const RadioGroup = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-2">
    {options.map((opt) => (
      <label key={opt} className="flex items-center gap-3 cursor-pointer text-sm text-foreground">
        <input type="radio" checked={value === opt} onChange={() => onChange(opt)} className="accent-primary w-4 h-4" />
        {opt}
      </label>
    ))}
  </div>
);

const CheckboxGroup = ({ options, values, onChange }: { options: string[]; values: string[]; onChange: (v: string[]) => void }) => (
  <div className="flex flex-col gap-2">
    {options.map((opt) => (
      <label key={opt} className="flex items-center gap-3 cursor-pointer text-sm text-foreground">
        <input
          type="checkbox"
          checked={values.includes(opt)}
          onChange={(e) => {
            if (opt === "Não possuo") {
              onChange(e.target.checked ? ["Não possuo"] : []);
            } else {
              const without = values.filter((v) => v !== "Não possuo" && v !== opt);
              onChange(e.target.checked ? [...without, opt] : without);
            }
          }}
          className="accent-primary w-4 h-4"
        />
        {opt}
      </label>
    ))}
  </div>
);

const ScaleInput = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
  <Field label={`${label}: ${value}/10`}>
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">0</span>
      <input
        type="range" min="0" max="10" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
      />
      <span className="text-xs text-muted-foreground">10</span>
    </div>
  </Field>
);

const ApplicationForm = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regError, setRegError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<{ front: File | null; side: File | null; back: File | null; assessment: File | null }>({
    front: null, side: null, back: null, assessment: null,
  });
  const [photoPreviews, setPhotoPreviews] = useState<{ front: string; side: string; back: string; assessment: string }>({
    front: "", side: "", back: "", assessment: "",
  });

  // Session is preserved — no forced signOut on form load

  const handlePhotoChange = (type: "front" | "side" | "back" | "assessment", file: File | null) => {
    setPhotos((prev) => ({ ...prev, [type]: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreviews((prev) => ({ ...prev, [type]: reader.result as string }));
      reader.readAsDataURL(file);
    } else {
      setPhotoPreviews((prev) => ({ ...prev, [type]: "" }));
    }
  };

  const removePhoto = (type: "front" | "side" | "back" | "assessment") => {
    setPhotos((prev) => ({ ...prev, [type]: null }));
    setPhotoPreviews((prev) => ({ ...prev, [type]: "" }));
  };

  const uploadPhoto = async (file: File, folderKey: string, label: string): Promise<string | null> => {
    try {
      const ext = file.name.split(".").pop();
      const path = `${folderKey}/${label}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("client-photos").upload(path, file);
      if (error) {
        console.error(`Upload error (${label}):`, error);
        return null;
      }
      return path;
    } catch (err) {
      console.error(`Upload exception (${label}):`, err);
      return null;
    }
  };

  const update = (field: keyof FormData, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setSubmitError("");

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData?.session ?? null;
      const sessionUserId =
        session?.access_token && typeof session.user?.id === "string" && session.user.id.trim() !== ""
          ? session.user.id
          : null;
      const folderKey = sessionUserId ?? `anon-${Date.now()}`;

      console.log("[AUTH DEBUG] SESSION:", session);
      console.log("[AUTH DEBUG] USER:", session?.user);
      console.log("[AUTH DEBUG] AUTH UID:", session?.user?.id);
      console.log("[AUTH DEBUG] sessionError:", sessionError);
      console.log("[AUTH DEBUG] userId resolvido:", sessionUserId);
      console.log("[AUTH DEBUG] role:", session ? "authenticated" : "anon");
      console.log("[AUTH DEBUG] Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
      console.log("[AUTH DEBUG] Usando anon key:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.slice(0, 20) + "...");

      let photoFrontPath: string | null = null;
      let photoSidePath: string | null = null;
      let photoBackPath: string | null = null;
      let photoAssessmentPath: string | null = null;

      if (photos.front) photoFrontPath = await uploadPhoto(photos.front, folderKey, "frente");
      if (photos.side) photoSidePath = await uploadPhoto(photos.side, folderKey, "lado");
      if (photos.back) photoBackPath = await uploadPhoto(photos.back, folderKey, "costas");
      if (photos.assessment) photoAssessmentPath = await uploadPhoto(photos.assessment, folderKey, "avaliacao");

      const purchasedPlan = localStorage.getItem("purchased_plan");
      const purchasedPeriod = localStorage.getItem("purchased_period");
      const purchasedModality = localStorage.getItem("purchased_modality");

      const enrichedFormData = {
        ...form,
        billingPeriod: purchasedPeriod || null,
        billingModality: purchasedModality || null,
      };

      const rawInsertPayload: Record<string, unknown> = {
        form_data: enrichedFormData as any,
        photo_front: photoFrontPath,
        photo_side: photoSidePath,
        photo_back: photoBackPath,
        photo_assessment: photoAssessmentPath,
        selected_equipment: [],
        plan: purchasedPlan,
      };

      if (sessionUserId) {
        rawInsertPayload.user_id = sessionUserId;
      }

      const sanitizedPayload = sanitizePayloadValue(rawInsertPayload) as Record<string, unknown>;
      if (!sessionUserId) {
        delete sanitizedPayload.user_id;
      }
      const insertPayload = sanitizedPayload as FormSubmissionInsert;

      const invalidPaths = findInvalidPaths(rawInsertPayload, "payload");
      if (invalidPaths.length > 0) {
        console.warn("[FORM DEBUG] Campos inválidos encontrados no payload bruto:", invalidPaths);
      }

      const requiredIssues = [
        insertPayload.form_data == null ? "payload.form_data está null/undefined" : null,
        insertPayload.selected_equipment == null ? "payload.selected_equipment está null/undefined" : null,
      ].filter(Boolean);

      if (requiredIssues.length > 0) {
        console.warn("[FORM DEBUG] Campos obrigatórios com problema:", requiredIssues);
      }

      const flowType = purchasedPlan ? "post-checkout" : "direct";
      const currentFlowStorageKey = flowType === "post-checkout" ? "debug_payload_post_checkout" : "debug_payload_direct";
      const oppositeFlowStorageKey = flowType === "post-checkout" ? "debug_payload_direct" : "debug_payload_post_checkout";
      console.log(`[FORM DEBUG] fluxo detectado: ${flowType}`);
      console.log("[FORM DEBUG] payload completo:", insertPayload);

      const oppositePayloadRaw = localStorage.getItem(oppositeFlowStorageKey);
      if (oppositePayloadRaw) {
        try {
          const oppositePayload = JSON.parse(oppositePayloadRaw);
          const differences = comparePayloads(insertPayload, oppositePayload);
          console.log(
            `[FORM DEBUG] Diferenças entre fluxo ${flowType} e ${flowType === "post-checkout" ? "direct" : "post-checkout"}:`,
            differences.length > 0 ? differences.slice(0, 200) : "Nenhuma diferença",
          );
        } catch (parseError) {
          console.error("[FORM DEBUG] Erro ao parsear payload salvo para comparação:", parseError);
        }
      } else {
        console.log("[FORM DEBUG] Ainda não existe payload do fluxo oposto para comparação.");
      }

      localStorage.setItem(currentFlowStorageKey, JSON.stringify(insertPayload));

      // Gerar ID client-side para poder vincular depois sem precisar de SELECT
      const generatedId = crypto.randomUUID();
      const { data, error } = await supabase.from("form_submissions").insert([{ ...insertPayload, id: generatedId }]);

      console.log("[FORM DEBUG] resposta completa do insert (data):", data);
      console.log("[FORM DEBUG] resposta completa do insert (error):", error);

      if (error) {
        console.error("ERRO INSERT:", error);
        const detailedErrorMessage = [
          `Erro ao enviar formulário: ${error.message}`,
          error.details ? `Detalhes: ${error.details}` : null,
          error.hint ? `Hint: ${error.hint}` : null,
          error.code ? `Code: ${error.code}` : null,
        ]
          .filter(Boolean)
          .join(" | ");

        setSubmitError(detailedErrorMessage);
        alert(detailedErrorMessage);
        setUploading(false);
        return;
      }

      localStorage.removeItem("purchased_plan");
      localStorage.removeItem("purchased_period");
      localStorage.removeItem("purchased_modality");
      setSubmissionId(null);
      setTempUserId(null);
      setRegEmail(form.email);
      setRegName(form.fullName);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      const fallbackError = err instanceof Error ? err.message : "Erro inesperado no envio.";
      setSubmitError(`Erro inesperado ao enviar formulário: ${fallbackError}`);
      alert(`Erro inesperado ao enviar formulário: ${fallbackError}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setCreatingAccount(true);

    try {
      if (regPassword.length < 6) {
        setRegError("A senha deve ter pelo menos 6 caracteres.");
        setCreatingAccount(false);
        return;
      }

      if (regPassword !== regConfirmPassword) {
        setRegError("As senhas não coincidem.");
        setCreatingAccount(false);
        return;
      }

      await supabase.auth.signOut();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: { full_name: regName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setRegError("Este e-mail já possui uma conta. Faça login na Área do Cliente.");
        } else {
          setRegError(signUpError.message);
        }
        setCreatingAccount(false);
        return;
      }

      const newUserId = signUpData.user?.id;

      if (!newUserId || !submissionId) {
        setRegError("Não foi possível concluir a vinculação da sua conta. Tente novamente.");
        setCreatingAccount(false);
        return;
      }

      // Aguardar sessão estar ativa antes de chamar o RPC
      let sessionReady = false;
      for (let i = 0; i < 10; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id === newUserId) {
          sessionReady = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      if (!sessionReady) {
        console.error("Session not ready after signup");
        setRegError("Conta criada, mas a sessão não foi iniciada. Faça login na Área do Cliente.");
        setCreatingAccount(false);
        return;
      }

      const { error: claimError } = await supabase.rpc("claim_form_submission", {
        _submission_id: submissionId,
        _old_user_id: tempUserId as any,
      });

      if (claimError) {
        console.error("Error claiming submission and protocols:", claimError);
        setRegError("Conta criada, mas não foi possível vincular seus dados automaticamente. Fale com o suporte.");
        setCreatingAccount(false);
        return;
      }

      await supabase.from("profiles").update({ full_name: regName }).eq("id", newUserId);

      // Auto-redirect to client area
      window.location.href = "/area-do-cliente";
    } catch (err) {
      console.error("Account creation error:", err);
      setRegError("Erro ao criar conta. Tente novamente.");
    } finally {
      setCreatingAccount(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-primary/20 rounded-lg p-8 md:p-12"
          >
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl uppercase mb-2 text-center">Crie sua conta para acessar seu protocolo</h2>
            <p className="text-muted-foreground text-sm text-center mb-8">
              Use o mesmo e-mail do formulário
            </p>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="reg-name" className="text-sm font-medium text-foreground">
                  Nome completo
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-email" className="text-sm font-medium text-foreground">
                  E-mail
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-password" className="text-sm font-medium text-foreground">
                  Senha (mín. 6 caracteres)
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-confirm-password" className="text-sm font-medium text-foreground">
                  Confirmar senha
                </label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {regError && (
                <p className="text-destructive text-sm">{regError}</p>
              )}

              <button
                type="submit"
                disabled={creatingAccount}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold uppercase text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {creatingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar conta e acessar"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    );
  }

  const goalOptions = [
    "Perda de gordura", "Ganho de massa muscular", "Recomposição corporal",
    "Definição corporal", "Performance esportiva", "Reeducação alimentar", "Outro"
  ];

  const healthOptions = [
    "Não possuo", "Diabetes", "Hipertensão", "Doença cardiovascular",
    "Problemas hormonais", "Lesões articulares", "Insuficiência renal", "Outro"
  ];

  const modalityOptions = [
    "Musculação", "Ciclismo", "Caminhada", "Corrida", "Esporte coletivo", "Outro"
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold uppercase mb-4">
            🏆 Formulário <span className="text-gradient-gold">Oficial</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Consultoria Fitness — Guilherme Sant'Anna IFBBPRO
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-lg p-8 md:p-12"
        >
          {/* SEÇÃO 1 – IDENTIFICAÇÃO */}
          <SectionTitle icon="🔹">Identificação</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Nome completo" required>
              <input className={inputClass} required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            </Field>
            <Field label="Idade" required>
              <input className={inputClass} required value={form.age} onChange={(e) => update("age", e.target.value)} />
            </Field>
            <Field label="Altura (cm)" required>
              <input className={inputClass} required placeholder="Ex: 175" value={form.height} onChange={(e) => update("height", e.target.value)} />
            </Field>
            <Field label="Peso atual (kg)" required>
              <input className={inputClass} required placeholder="Ex: 80" value={form.weight} onChange={(e) => update("weight", e.target.value)} />
            </Field>
            <Field label="E-mail" required>
              <input className={inputClass} type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Instagram">
              <input className={inputClass} placeholder="@usuario" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} />
            </Field>
            <Field label="WhatsApp (com DDD)" required>
              <input className={inputClass} required placeholder="(00) 00000-0000" value={form.whatsapp} onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                let masked = digits;
                if (digits.length > 2) {
                  masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                } else if (digits.length > 0) {
                  masked = `(${digits}`;
                }
                if (digits.length > 7) {
                  masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                }
                update("whatsapp", masked);
              }} />
            </Field>
            <Field label="Cidade/Estado">
              <CityStateField
                className={inputClass}
                value={form.city}
                onChange={(city, uf) => {
                  update("city", city);
                  update("state", uf);
                }}
              />
            </Field>
          </div>

          {/* SEÇÃO 2 – OBJETIVO */}
          <SectionTitle icon="🔹">Objetivo</SectionTitle>
          <div className="space-y-5">
            <Field label="Qual seu objetivo? (pode marcar mais de um)" required>
              <CheckboxGroup options={goalOptions} values={form.mainGoal} onChange={(vals) => update("mainGoal", vals)} />
            </Field>
            {form.mainGoal.includes("Outro") && (
              <Field label="Descreva seu objetivo">
                <input className={inputClass} value={form.mainGoalOther} onChange={(e) => update("mainGoalOther", e.target.value)} />
              </Field>
            )}
            <Field label="Em quanto tempo deseja atingir esse objetivo?">
              <input className={inputClass} placeholder="Ex: 6 meses" value={form.timeline} onChange={(e) => update("timeline", e.target.value)} />
            </Field>
            <ScaleInput value={form.commitment} onChange={(v) => update("commitment", v)} label="Nível de comprometimento" />
          </div>

          {/* SEÇÃO 3 – SAÚDE */}
          <SectionTitle icon="🔹">Saúde</SectionTitle>
          <div className="space-y-5">
            <Field label="Possui alguma condição de saúde diagnosticada?">
              <CheckboxGroup options={healthOptions} values={form.healthConditions} onChange={(v) => update("healthConditions", v)} />
            </Field>
            {form.healthConditions.includes("Outro") && (
              <Field label="Qual condição?">
                <input className={inputClass} value={form.healthConditionsOther} onChange={(e) => update("healthConditionsOther", e.target.value)} />
              </Field>
            )}
            <Field label="Faz uso de medicação?">
              <RadioGroup options={["Não", "Sim"]} value={form.usesMedication} onChange={(v) => update("usesMedication", v)} />
            </Field>
            {form.usesMedication === "Sim" && (
              <Field label="Qual medicação?">
                <textarea className={inputClass} rows={3} value={form.medicationDetails} onChange={(e) => update("medicationDetails", e.target.value)} />
              </Field>
            )}
            <Field label="Faz uso de hormônios ou já utilizou?">
              <RadioGroup options={["Não", "Sim"]} value={form.usesHormones} onChange={(v) => update("usesHormones", v)} />
            </Field>
            {form.usesHormones === "Sim" && (
              <Field label="Quais hormônios, tempo de uso e última aplicação?">
                <textarea className={inputClass} rows={3} value={form.hormoneDetails} onChange={(e) => update("hormoneDetails", e.target.value)} />
              </Field>
            )}
            <Field label="Possui restrição alimentar ou intolerância?">
              <CheckboxGroup
                options={["Não possuo", "Intolerância à lactose", "Intolerância ao glúten", "Vegetariano(a)", "Vegano(a)", "Alergia alimentar", "Outro"]}
                values={form.foodRestrictions}
                onChange={(v) => update("foodRestrictions", v)}
              />
            </Field>
            {form.foodRestrictions.includes("Alergia alimentar") && (
              <Field label="Descreva a alergia alimentar">
                <input className={inputClass} value={form.allergyDetails} onChange={(e) => update("allergyDetails", e.target.value)} />
              </Field>
            )}
            {form.foodRestrictions.includes("Outro") && (
              <Field label="Qual restrição?">
                <input className={inputClass} value={form.foodRestrictionsOther} onChange={(e) => update("foodRestrictionsOther", e.target.value)} />
              </Field>
            )}
          </div>

          {/* SEÇÃO 4 – SUPLEMENTAÇÃO */}
          <SectionTitle icon="🔹">Suplementação</SectionTitle>
          <div className="space-y-5">
            <Field label="Utiliza suplementos atualmente?">
              <RadioGroup options={["Não", "Sim"]} value={form.usesSupplements} onChange={(v) => update("usesSupplements", v)} />
            </Field>
            {form.usesSupplements === "Sim" && (
              <Field label="Quais suplementos?">
                <input className={inputClass} value={form.supplementDetails} onChange={(e) => update("supplementDetails", e.target.value)} />
              </Field>
            )}
          </div>

          {/* SEÇÃO 5 – ALIMENTAÇÃO */}
          <SectionTitle icon="🔹">Alimentação</SectionTitle>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Quantas refeições realiza por dia?">
                <input className={inputClass} value={form.mealsPerDay} onChange={(e) => update("mealsPerDay", e.target.value)} />
              </Field>
              <Field label="Possui horários fixos para se alimentar?">
                <RadioGroup options={["Não", "Sim"]} value={form.fixedMealTimes} onChange={(v) => update("fixedMealTimes", v)} />
              </Field>
            </div>
            <Field label="Descreva sua alimentação diária (horários + alimentos)">
              <textarea className={inputClass} rows={4} value={form.dailyDiet} onChange={(e) => update("dailyDiet", e.target.value)} />
            </Field>
            <Field label="Ingestão média de água por dia">
              <RadioGroup options={["1 a 2 litros", "3 litros", "4 litros ou mais"]} value={form.waterIntake} onChange={(v) => update("waterIntake", v)} />
            </Field>
            <Field label="Costuma ter episódios de compulsão alimentar?">
              <RadioGroup options={["Não", "Sim"]} value={form.bingEating} onChange={(v) => update("bingEating", v)} />
            </Field>
          </div>

          {/* SEÇÃO 6 – HISTÓRICO SOCIAL */}
          <SectionTitle icon="🔹">Histórico Social</SectionTitle>
          <div className="space-y-5">
            <Field label="Tabagismo">
              <RadioGroup options={["Não", "Sim"]} value={form.smoking} onChange={(v) => update("smoking", v)} />
            </Field>
            {form.smoking === "Sim" && (
              <Field label="Quantidade por dia?">
                <input className={inputClass} value={form.smokingAmount} onChange={(e) => update("smokingAmount", e.target.value)} />
              </Field>
            )}
            <Field label="Consumo de álcool">
              <RadioGroup options={["Não", "Sim"]} value={form.alcohol} onChange={(v) => update("alcohol", v)} />
            </Field>
            {form.alcohol === "Sim" && (
              <Field label="Frequência semanal de álcool">
                <input className={inputClass} value={form.alcoholFrequency} onChange={(e) => update("alcoholFrequency", e.target.value)} />
              </Field>
            )}
            <Field label="Uso de outras substâncias?">
              <RadioGroup options={["Não", "Sim"]} value={form.otherSubstances} onChange={(v) => update("otherSubstances", v)} />
            </Field>
            {form.otherSubstances === "Sim" && (
              <Field label="Quais?">
                <input className={inputClass} value={form.otherSubstancesDetails} onChange={(e) => update("otherSubstancesDetails", e.target.value)} />
              </Field>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Quantas horas dorme por noite?">
                <input className={inputClass} value={form.sleepHours} onChange={(e) => update("sleepHours", e.target.value)} />
              </Field>
              <Field label="Nível de estresse diário">
                <RadioGroup options={["Baixo", "Moderado", "Alto"]} value={form.stressLevel} onChange={(v) => update("stressLevel", v)} />
              </Field>
            </div>
            <ScaleInput value={form.sleepQuality} onChange={(v) => update("sleepQuality", v)} label="Qualidade do sono" />
          </div>

          {/* SEÇÃO 7 – TREINAMENTO */}
          <SectionTitle icon="🔹">Treinamento</SectionTitle>
          <div className="space-y-5">
            <Field label="Quais modalidades pratica atualmente?">
              <CheckboxGroup options={modalityOptions} values={form.trainingModalities} onChange={(v) => update("trainingModalities", v)} />
            </Field>
            {form.trainingModalities.includes("Ciclismo") && (
              <Field label="Ciclismo — quantas vezes por semana?">
                <input className={inputClass} placeholder="Ex: 3 vezes" value={form.ciclismoFrequency} onChange={(e) => update("ciclismoFrequency", e.target.value)} />
              </Field>
            )}
            {form.trainingModalities.includes("Caminhada") && (
              <Field label="Caminhada — quantas vezes por semana?">
                <input className={inputClass} placeholder="Ex: 5 vezes" value={form.caminhadaFrequency} onChange={(e) => update("caminhadaFrequency", e.target.value)} />
              </Field>
            )}
            {form.trainingModalities.includes("Corrida") && (
              <Field label="Corrida — quantas vezes por semana?">
                <input className={inputClass} placeholder="Ex: 3 vezes" value={form.corridaFrequency} onChange={(e) => update("corridaFrequency", e.target.value)} />
              </Field>
            )}
            {form.trainingModalities.includes("Esporte coletivo") && (
              <Field label="Esporte coletivo — quantas vezes por semana?">
                <input className={inputClass} placeholder="Ex: 2 vezes" value={form.sportFrequency} onChange={(e) => update("sportFrequency", e.target.value)} />
              </Field>
            )}
            {form.trainingModalities.includes("Outro") && (
              <Field label="Qual modalidade?">
                <input className={inputClass} placeholder="Ex: Natação" value={form.trainingModalitiesOther} onChange={(e) => update("trainingModalitiesOther", e.target.value)} />
              </Field>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Quantas vezes por semana treina?">
                <input className={inputClass} placeholder="Ex: 5 vezes" value={form.trainingFrequency} onChange={(e) => update("trainingFrequency", e.target.value)} />
              </Field>
              <Field label="Tempo médio por treino">
                <input className={inputClass} placeholder="Ex: 1 hora" value={form.trainingDuration} onChange={(e) => update("trainingDuration", e.target.value)} />
              </Field>
              <Field label="Há quanto tempo treina?">
                <input className={inputClass} placeholder="Ex: 2 anos" value={form.trainingExperience} onChange={(e) => update("trainingExperience", e.target.value)} />
              </Field>
              <Field label="Esforço físico no trabalho">
                <RadioGroup options={["Leve", "Moderado", "Intenso", "Sedentário"]} value={form.workEffort} onChange={(v) => update("workEffort", v)} />
              </Field>
            </div>
            <Field label="Horários disponíveis para treinar">
              <input className={inputClass} placeholder="Ex: Manhã e noite" value={form.availableSchedule} onChange={(e) => update("availableSchedule", e.target.value)} />
            </Field>
            <Field label="Já treinou com acompanhamento profissional?">
              <RadioGroup options={["Não", "Sim"]} value={form.hadProfessionalCoaching} onChange={(v) => update("hadProfessionalCoaching", v)} />
            </Field>
          </div>


          {/* SEÇÃO 9 – ENVIO DE FOTOS */}
          <SectionTitle icon="📸">Envio de Fotos</SectionTitle>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm mb-1">📋 Instruções para as fotos:</p>
              <p className="text-muted-foreground text-xs">Em jejum • Boa iluminação • Postura relaxada • Sem contração</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(["front", "side", "back", "assessment"] as const).map((type) => {
                const labels = { front: "Frente", side: "Lado", back: "Costas", assessment: "Avaliação Física" };
                return (
                  <div key={type} className="flex flex-col gap-2">
                    <label className="text-sm text-muted-foreground text-center min-h-[2.75rem] flex items-start justify-center pt-0">
                      <span>
                        {labels[type]}
                        {type === "assessment" && <span className="block text-xs text-muted-foreground/60">(opcional)</span>}
                      </span>
                    </label>
                    {photoPreviews[type] ? (
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-primary/30">
                        <img src={photoPreviews[type]} alt={labels[type]} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(type)}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-destructive-foreground" />
                        </button>
                      </div>
                    ) : (
                      <label className="aspect-[3/4] rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/30">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Enviar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoChange(type, e.target.files?.[0] || null)}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO FINAL – TERMO */}
          <div className="mt-10 border-t border-border pt-8">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.agreement}
                onChange={(e) => update("agreement", e.target.checked)}
                className="mt-1 accent-primary w-5 h-5"
              />
              <span className="text-sm text-muted-foreground leading-relaxed">
                Declaro que as informações fornecidas são verdadeiras e estou ciente de que os resultados dependem do meu comprometimento.
              </span>
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={uploading}
            className="w-full mt-8 bg-gradient-gold text-primary-foreground uppercase tracking-widest px-10 py-4 text-lg font-semibold glow-gold rounded-md disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Salvando...
              </>
            ) : (
              "Salvar Inscrição"
            )}
          </motion.button>

          {submitError && (
            <p className="mt-4 text-sm text-destructive break-words">{submitError}</p>
          )}
        </motion.form>
      </div>
    </section>
  );
};

export default ApplicationForm;
