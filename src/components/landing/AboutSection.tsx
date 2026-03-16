import { motion } from "framer-motion";
import heroImg from "@/assets/hero-coach.jpg";

const AboutSection = () => {
  return (
    <section className="py-20 md:py-32" id="sobre">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-primary/30">
              <img
                src={heroImg}
                alt="Guilherme Sant'Anna - Coach"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-primary rounded-lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-8">
              Conheça <span className="text-gradient-gold">Guilherme Sant'Anna</span>
            </h2>

            <div className="space-y-4 text-foreground/80 font-body normal-case text-sm md:text-base leading-relaxed">
              <p>
                Sou Guilherme Sant'Anna, atleta profissional de fisiculturismo e
                apaixonado por esporte desde a infância. Durante minha juventude
                pratiquei diversas modalidades, como futebol, tênis, natação, futsal,
                surf e skate. Porém, foi na musculação que encontrei minha verdadeira
                vocação.
              </p>
              <p>
                Minha jornada no esporte começou de forma simples, treinando em casa
                com equipamentos básicos e muita dedicação. Ao longo de mais de 20
                anos de disciplina, evoluí de <span className="text-primary font-semibold">57kg para 106kg</span>, construindo meu
                físico através de estudo, prática e consistência.
              </p>
              <p>
                No meu primeiro ano de competições conquistei três títulos, vencendo
                os campeonatos Estreantes, Estadual e Brasileiro — um marco que mudou
                definitivamente minha trajetória no esporte.
              </p>
              <p>
                A partir daí, segui vencendo importantes eventos do cenário
                nacional, como Eduardo Corrêa Classic, Iron Games e Masters Brasil,
                conquistando títulos e consolidando minha carreira até alcançar o
                status de atleta profissional.
              </p>
              <p>
                Ao longo dessa jornada tive a oportunidade de trabalhar com
                diversos coaches, médicos e fisioterapeutas, adquirindo uma
                bagagem prática extremamente valiosa dentro do esporte.
              </p>
              <p>
                Hoje utilizo toda essa experiência para ajudar pessoas a
                alcançarem seus objetivos físicos, de saúde e performance,
                através de um acompanhamento estratégico, individualizado e
                baseado na prática real do que funciona.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
