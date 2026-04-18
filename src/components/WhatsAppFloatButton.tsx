import { MessageCircle } from "lucide-react";

interface WhatsAppFloatButtonProps {
  phoneNumber: string;
  message?: string;
}

export const WhatsAppFloatButton = ({ 
  phoneNumber, 
  message = "Olá! Tenho interesse nos planos de consultoria." 
}: WhatsAppFloatButtonProps) => {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-current" />
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-body whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg pointer-events-none">
        Fale conosco
      </span>
    </a>
  );
};
