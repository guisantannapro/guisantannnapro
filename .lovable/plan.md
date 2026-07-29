## Ação administrativa pontual

Criar a conta de autenticação do cliente **Anderson José Da Silva** e vincular o formulário existente.

### Passos

1. **Criar usuário no `auth.users`** via migration SQL (mesmo padrão usado antes para Kheetley/Alessandra), usando `session_replication_role = replica` para inserir diretamente com senha já criptografada (`crypt`) e `email_confirmed_at = now()`:
   - Email: `andersonsilvajgi@gmail.com`
   - Senha: `Sh8Mhd8ML3`
   - Metadata: `full_name = 'Anderson José Da Silva'`
   - Trigger `handle_new_user` cria o `profiles` automaticamente.

2. **Vincular o formulário** via `supabase--insert`:
   ```sql
   UPDATE public.form_submissions
   SET user_id = '<novo_uuid>'
   WHERE id = 'b5a74af6-de45-4e94-a621-1baa13128c90';
   ```

3. **Retornar confirmação em texto**: UUID gerado + status do UPDATE.

### Sem alterações de código
Nenhum arquivo do projeto será modificado. Apenas operações no banco.
