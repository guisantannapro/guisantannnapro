import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";

import legPressImg from "@/assets/equipment/leg-press.png";
import supinoImg from "@/assets/equipment/supino.png";
import supinoInclinadoImg from "@/assets/equipment/supino-inclinado.png";
import puxadorImg from "@/assets/equipment/puxador.png";
import cadeiraExtensoraImg from "@/assets/equipment/cadeira-extensora.png";
import cadeiraFlexoraImg from "@/assets/equipment/cadeira-flexora.png";
import crossoverImg from "@/assets/equipment/crossover.png";
import smithMachineImg from "@/assets/equipment/smith-machine.png";
import hackSquatImg from "@/assets/equipment/hack-squat.png";
import shoulderPressImg from "@/assets/equipment/shoulder-press.png";
import remadaImg from "@/assets/equipment/remada.png";
import peckDeckImg from "@/assets/equipment/peck-deck.png";
import pulloverImg from "@/assets/equipment/pullover.png";

interface Equipment {
  id: string;
  name: string;
  image: string;
}

const equipmentList: Equipment[] = [
  { id: "supino-reto", name: "Supino Reto", image: supinoImg },
  { id: "supino-inclinado", name: "Supino Inclinado", image: supinoInclinadoImg },
  { id: "shoulder-press", name: "Shoulder Press", image: shoulderPressImg },
  { id: "peck-deck", name: "Peck Deck / Fly", image: peckDeckImg },
  { id: "pullover", name: "Pullover", image: pulloverImg },
  { id: "puxador", name: "Puxador Frontal", image: puxadorImg },
  { id: "remada", name: "Remada", image: remadaImg },
  { id: "leg-press", name: "Leg Press", image: legPressImg },
  { id: "hack-squat", name: "Hack Squat", image: hackSquatImg },
  { id: "cadeira-extensora", name: "Cadeira Extensora", image: cadeiraExtensoraImg },
  { id: "cadeira-flexora", name: "Cadeira Flexora", image: cadeiraFlexoraImg },
  { id: "crossover", name: "Crossover", image: crossoverImg },
  { id: "smith-machine", name: "Smith Machine", image: smithMachineImg },
];

interface EquipmentSectionProps {
  isElite: boolean;
  selectedEquipment: string[];
  onSelectionChange: (selected: string[]) => void;
}

const EquipmentSection = ({ isElite, selectedEquipment, onSelectionChange }: EquipmentSectionProps) => {
  const toggleEquipment = (id: string) => {
    if (!isElite) return;
    if (selectedEquipment.includes(id)) {
      onSelectionChange(selectedEquipment.filter((e) => e !== id));
    } else {
      onSelectionChange([...selectedEquipment, id]);
    }
  };

  return (
    <div className="relative">
      <h3 className="font-bold text-xl uppercase text-primary border-b border-border pb-2 mb-6 mt-10 flex items-center gap-2">
        <span>🏋️</span> Equipamentos Disponíveis
        {!isElite && <Lock className="w-4 h-4 text-muted-foreground ml-2" />}
      </h3>

      {!isElite && (
        <div className="bg-muted/50 border border-border rounded-lg p-6 text-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Esta seção é exclusiva para o <span className="text-primary font-semibold">Plano Elite</span>.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Faça upgrade para selecionar os equipamentos da sua academia.
          </p>
        </div>
      )}

      {isElite && (
        <>
          <p className="text-muted-foreground text-sm mb-4">
            Selecione os equipamentos disponíveis na sua academia:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {equipmentList.map((equip) => {
              const isSelected = selectedEquipment.includes(equip.id);
              return (
                <motion.button
                  key={equip.id}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleEquipment(equip.id)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted hover:border-primary/30"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <img
                    src={equip.image}
                    alt={equip.name}
                    className="w-12 h-12 object-contain"
                  />
                  <span className="text-xs text-foreground text-center leading-tight">
                    {equip.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default EquipmentSection;
