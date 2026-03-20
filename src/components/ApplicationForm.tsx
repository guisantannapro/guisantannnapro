import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Upload, ImageIcon, X, Loader2 } from "lucide-react";
import EquipmentSection from "./EquipmentSection";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  fullName: string;
  age: string;
  height: string;
  weight: string;
  email: string;
  instagram: string;
  whatsapp: string;
  city: string;
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
  foodRestrictions: string;
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
  trainingFrequency: string;
  trainingDuration: string;
  trainingExperience: string;
  workEffort: string;
  availableSchedule: string;
  hadProfessionalCoaching: string;
  agreement: boolean;
}

const initialForm: FormData = {
  fullName: "", age: "", height: "", weight: "", email: "", instagram: "", whatsapp: "", city: "",
  mainGoal: [], mainGoalOther: "", timeline: "", commitment: "5",
  healthConditions: [], healthConditionsOther: "",
  usesMedication: "", medicationDetails: "",
  usesHormones: "", hormoneDetails: "",
  foodRestrictions: "",
  usesSupplements: "", supplementDetails: "",
  mealsPerDay: "", fixedMealTimes: "", dailyDiet: "", waterIntake: "", bingEating: "",
  smoking: "", smokingAmount: "",
  alcohol: "", alcoholFrequency: "",
  otherSubstances: "", otherSubstancesDetails: "",
  sleepHours: "", sleepQuality: "5", stressLevel: "",
  trainingModalities: [], trainingModalitiesOther: "",
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

interface ApplicationFormProps {
  isElite?: boolean;
}

const ApplicationForm = ({ isElite = false }: ApplicationFormProps) => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<{ front: File | null; side: File | null; back: File | null; assessment: File | null }>({
    front: null, side: null, back: null, assessment: null,
  });
  const [photoPreviews, setPhotoPreviews] = useState<{ front: string; side: string; back: string; assessment: string }>({
    front: "", side: "", back: "", assessment: "",
  });

  const handlePhotoChange = (type: "front" | "side" | "back" | "assessment", file: File | null) => {
    setPhotos((prev) => ({ ...prev, [type]: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreviews((prev) => ({ ...prev, [type]: url }));
    } else {
      setPhotoPreviews((prev) => ({ ...prev, [type]: "" }));
    }
  };

  const removePhoto = (type: "front" | "side" | "back" | "assessment") => {
    setPhotos((prev) => ({ ...prev, [type]: null }));
    setPhotoPreviews((prev) => ({ ...prev, [type]: "" }));
  };

  const uploadPhoto = async (file: File, userId: string, type: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${type}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("client-photos").upload(path, file);
    if (error) {
      console.error(`Upload ${type} error:`, error);
      return null;
    }
    return path;
  };

  const update = (field: keyof FormData, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Você precisa estar logado para enviar o formulário.");
        setUploading(false);
        return;
      }

      const userId = session.user.id;

      // Upload photos
      let photoFrontPath: string | null = null;
      let photoSidePath: string | null = null;
      let photoBackPath: string | null = null;
      let photoAssessmentPath: string | null = null;

      if (photos.front) photoFrontPath = await uploadPhoto(photos.front, userId, "frente");
      if (photos.side) photoSidePath = await uploadPhoto(photos.side, userId, "lado");
      if (photos.back) photoBackPath = await uploadPhoto(photos.back, userId, "costas");
      if (photos.assessment) photoAssessmentPath = await uploadPhoto(photos.assessment, userId, "avaliacao");

      // Save form data to Supabase
      const { error } = await supabase.from("form_submissions").insert({
        user_id: userId,
        form_data: form as any,
        photo_front: photoFrontPath,
        photo_side: photoSidePath,
        photo_back: photoBackPath,
        photo_assessment: photoAssessmentPath,
        selected_equipment: isElite ? selectedEquipment : [],
      });

      if (error) {
        console.error("Submit error:", error);
        alert("Erro ao enviar formulário. Tente novamente.");
        setUploading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-primary/20 rounded-lg p-12 glow-gold"
          >
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl uppercase mb-4">Formulário Enviado!</h2>
            <p className="text-muted-foreground text-lg">
              Entraremos em contato pelo WhatsApp em até 24 horas.
            </p>
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
    "Musculação", "Boxe", "Caminhada", "Corrida", "Esporte coletivo", "Outro"
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
            <Field label="Altura" required>
              <input className={inputClass} required value={form.height} onChange={(e) => update("height", e.target.value)} />
            </Field>
            <Field label="Peso atual" required>
              <input className={inputClass} required value={form.weight} onChange={(e) => update("weight", e.target.value)} />
            </Field>
            <Field label="E-mail" required>
              <input className={inputClass} type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Instagram">
              <input className={inputClass} placeholder="@usuario" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} />
            </Field>
            <Field label="WhatsApp (com DDD)" required>
              <input className={inputClass} required value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
            </Field>
            <Field label="Cidade/Estado">
              <input className={inputClass} value={form.city} onChange={(e) => update("city", e.target.value)} />
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
              <input className={inputClass} value={form.timeline} onChange={(e) => update("timeline", e.target.value)} />
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
              <textarea className={inputClass} rows={2} value={form.foodRestrictions} onChange={(e) => update("foodRestrictions", e.target.value)} />
            </Field>
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
            {form.trainingModalities.includes("Outro") && (
              <Field label="Qual modalidade?">
                <input className={inputClass} value={form.trainingModalitiesOther} onChange={(e) => update("trainingModalitiesOther", e.target.value)} />
              </Field>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Quantas vezes por semana treina?">
                <input className={inputClass} value={form.trainingFrequency} onChange={(e) => update("trainingFrequency", e.target.value)} />
              </Field>
              <Field label="Tempo médio por treino">
                <input className={inputClass} value={form.trainingDuration} onChange={(e) => update("trainingDuration", e.target.value)} />
              </Field>
              <Field label="Há quanto tempo treina?">
                <input className={inputClass} value={form.trainingExperience} onChange={(e) => update("trainingExperience", e.target.value)} />
              </Field>
              <Field label="Esforço físico no trabalho">
                <RadioGroup options={["Leve", "Moderado", "Intenso", "Sedentário"]} value={form.workEffort} onChange={(v) => update("workEffort", v)} />
              </Field>
            </div>
            <Field label="Horários disponíveis para treinar">
              <input className={inputClass} value={form.availableSchedule} onChange={(e) => update("availableSchedule", e.target.value)} />
            </Field>
            <Field label="Já treinou com acompanhamento profissional?">
              <RadioGroup options={["Não", "Sim"]} value={form.hadProfessionalCoaching} onChange={(v) => update("hadProfessionalCoaching", v)} />
            </Field>
          </div>

          {/* SEÇÃO 8 – EQUIPAMENTOS (ELITE) */}
          <EquipmentSection
            isElite={isElite}
            selectedEquipment={selectedEquipment}
            onSelectionChange={setSelectedEquipment}
          />

          {/* SEÇÃO 9 – ENVIO DE FOTOS */}
          <SectionTitle icon="📸">Envio de Fotos</SectionTitle>
          <div className="bg-muted rounded-lg p-6 border border-border space-y-3">
            <p className="text-foreground text-sm font-semibold">Enviar fotos em jejum:</p>
            <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
              <li>Frente</li>
              <li>Lado</li>
              <li>Costas</li>
            </ul>
            <div className="text-muted-foreground text-sm space-y-1">
              <p>✔ Boa iluminação</p>
              <p>✔ Mesmo local</p>
              <p>✔ Postura relaxada</p>
              <p>✔ Sem contração</p>
            </div>
            <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-foreground text-sm font-semibold">📲 Após enviar este formulário, envie suas fotos separadamente pelo WhatsApp.</p>
              <p className="text-muted-foreground text-xs mt-1">
                Caso possua avaliação física recente, envie junto com as fotos.
              </p>
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
            className="w-full mt-8 bg-gradient-gold text-primary-foreground uppercase tracking-widest px-10 py-4 text-lg font-semibold glow-gold rounded-md"
          >
            Enviar Inscrição
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
};

export default ApplicationForm;
