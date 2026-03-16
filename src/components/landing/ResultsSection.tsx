import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import alunoA from "@/assets/aluno-a.jpg";
import alunoB from "@/assets/aluno-b.jpg";
import alunoC from "@/assets/aluno-c.jpg";
import alunoD from "@/assets/aluno-d.jpg";
import alunoE from "@/assets/aluno-e.jpg";
import alunoF from "@/assets/aluno-f.jpg";

const results = [
  { image: alunoA, label: "Transformação 1" },
  { image: alunoB, label: "Transformação 2" },
  { image: alunoC, label: "Transformação 3" },
  { image: alunoD, label: "Transformação 4" },
  { image: alunoE, label: "Transformação 5" },
  { image: alunoF, label: "Transformação 6" },
];

const ResultsSection = () => {

  return (
    <section className="py-20 md:py-32 bg-secondary/20" id="resultados">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
            Transformações <span className="text-gradient-gold">Reais</span>
          </h2>
          <p className="text-muted-foreground font-body normal-case max-w-xl mx-auto">
            Resultados de clientes que aplicaram o método com disciplina e consistência.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {results.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`${item.image ? 'aspect-[4/3]' : 'aspect-[4/5]'} rounded-lg bg-card border border-border flex flex-col items-center justify-center gap-4 overflow-hidden`}
            >
              {item.image ? (
                <img src={item.image} alt={item.label} className="w-full h-full object-contain bg-card" />
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                  <div className="text-center px-4">
                    <p className="text-muted-foreground/50 font-body normal-case text-sm">
                      Antes & Depois
                    </p>
                    <p className="text-muted-foreground/30 font-body normal-case text-xs mt-1">
                      {item.label}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
