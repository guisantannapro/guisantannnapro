import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

interface Protocol {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

interface ProtocolUploadProps {
  clientUserId: string;
  protocols: Protocol[];
  onProtocolsChange: () => void;
}

const ProtocolUpload = ({ clientUserId, protocols, onProtocolsChange }: ProtocolUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${clientUserId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("client-protocols")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { user } } = await supabase.auth.getUser();

      const { error: dbError } = await supabase
        .from("client_protocols")
        .insert({
          user_id: clientUserId,
          file_name: file.name,
          file_path: filePath,
          uploaded_by: user!.id,
        });

      if (dbError) throw dbError;

      toast.success("Protocolo enviado com sucesso!");
      onProtocolsChange();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Erro ao enviar protocolo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (protocol: Protocol) => {
    try {
      await supabase.storage.from("client-protocols").remove([protocol.file_path]);
      await supabase.from("client_protocols").delete().eq("id", protocol.id);
      toast.success("Protocolo removido.");
      onProtocolsChange();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Erro ao remover protocolo.");
    }
  };

  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold uppercase text-primary">Protocolos</h4>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Enviar Protocolo
          </Button>
        </div>
      </div>

      {protocols.length > 0 ? (
        <div className="space-y-2">
          {protocols.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <div>
                  <p className="text-foreground text-sm">{p.file_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(p)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">Nenhum protocolo enviado para este cliente.</p>
      )}
    </div>
  );
};

export default ProtocolUpload;
