import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

interface Props {
  submissionId?: string | null;
  defaultEmail?: string | null;
  defaultName?: string | null;
  onCreated?: (userId: string) => void | Promise<void>;
}

const generatePassword = () => {
  const base = Math.random().toString(36).slice(-8);
  return `Fit${base}!`;
};

const CreateClientAccessDialog = ({
  submissionId,
  defaultEmail,
  defaultName,
  onCreated,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail || "");
  const [password, setPassword] = useState(generatePassword());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!email || !password || password.length < 6) {
      toast.error("Informe e-mail e senha (mín. 6 caracteres)");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-create-client-access",
        {
          body: {
            email: email.trim(),
            password,
            fullName: defaultName || "",
            submissionId: submissionId || null,
          },
        }
      );
      if (error) throw error;
      const userId = (data as any)?.user_id;
      if (!userId) throw new Error("Resposta inválida do servidor");

      toast.success("Acesso criado e vinculado ao cadastro");
      setOpen(false);
      await onCreated?.(userId);
    } catch (err: any) {
      console.error("create access error:", err);
      toast.error(err?.message || "Erro ao criar acesso");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          setEmail(defaultEmail || "");
          setPassword(generatePassword());
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <UserPlus className="w-3 h-3 mr-1" />
          Criar acesso do cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar acesso do cliente</DialogTitle>
          <DialogDescription>
            Cria a conta no sistema com e-mail e senha, e vincula automaticamente este
            cadastro ao novo usuário. Depois disso você poderá definir o plano.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Senha inicial</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setPassword(generatePassword())}
              >
                Gerar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Envie essa senha ao cliente para o primeiro acesso. Ele poderá alterar em
              "Esqueci minha senha".
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            Criar acesso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientAccessDialog;
