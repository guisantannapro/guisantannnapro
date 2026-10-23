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
import { KeyRound, Loader2, UserPlus } from "lucide-react";

interface Props {
  submissionId?: string | null;
  defaultEmail?: string | null;
  defaultName?: string | null;
  hasExistingAccess?: boolean;
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
  hasExistingAccess = false,
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

      toast.success(hasExistingAccess ? "Senha do cliente redefinida" : "Acesso criado e vinculado ao cadastro");
      setOpen(false);
      await onCreated?.(userId);
    } catch (err: any) {
      console.error("create access error:", err);
      toast.error(err?.message || "Erro ao salvar acesso do cliente");
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
          {hasExistingAccess ? <KeyRound className="w-3 h-3 mr-1" /> : <UserPlus className="w-3 h-3 mr-1" />}
          Acesso do cliente / redefinir senha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{hasExistingAccess ? "Redefinir senha do cliente" : "Criar acesso do cliente"}</DialogTitle>
          <DialogDescription>
            {hasExistingAccess
              ? "Defina uma nova senha para a conta do cliente."
              : "Cria a conta com e-mail e senha e vincula ao cadastro; se a conta já existir, redefine a senha."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="client-access-email">E-mail</Label>
            <Input
              id="client-access-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-access-password">{hasExistingAccess ? "Nova senha" : "Senha inicial"}</Label>
            <div className="flex gap-2">
              <Input
                id="client-access-password"
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
              Envie a nova senha ao cliente.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            {hasExistingAccess ? "Redefinir senha" : "Criar acesso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientAccessDialog;
