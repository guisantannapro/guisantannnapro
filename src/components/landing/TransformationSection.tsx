import { motion } from "framer-motion";
import t1 from "@/assets/transformation-1.jpg";
import t2 from "@/assets/transformation-2.jpg";
import t3 from "@/assets/transformation-3.jpg";
import BeforeAfterSlider from "@/components/landing/BeforeAfterSlider";

const transformations = [
  { image: t1, name: "Aluno A", duration: "12 semanas" },
  { image: t2, name: "Aluno B", duration: "16 semanas" },
  { image: t3, name: "Aluno C", duration: "20 semanas" },
];

const TransformationSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold uppercase mb-4">
            <span className="text-gradient-gold">Transformações</span> Reais
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto normal-case">
            Resultados falam mais que palavras. Arraste a barra para comparar o antes e depois.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {transformations.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group"
            >
              <BeforeAfterSlider image={t.image} alt={`Transformação ${t.name}`} />
              <div className="mt-3 text-center">
                <p className="font-display text-primary text-sm uppercase tracking-wider">{t.duration}</p>
                <p className="font-display text-lg uppercase">{t.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransformationSection;
