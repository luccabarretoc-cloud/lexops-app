# 🔧 Setup de Variáveis de Ambiente - Netlify

## ⚠️ IMPORTANTE: Configure estas variáveis no Netlify para que o app funcione!

O seu app depende do **Supabase** para validar tokens e armazenar dados de usuários. As functions do Netlify precisam acessar o Supabase através de variáveis de ambiente.

---

## 📋 Passo 1: Obtenha as credenciais do Supabase

1. Acesse sua conta no [Supabase](https://supabase.com)
2. Vá para **Settings → API**
3. Copie:
   - **Project URL** (ex: `https://seu-projeto.supabase.co`)
   - **Service Role Key** (ex: `eyJhbGc...` - a chave com permissões totais)

⚠️ **NUNCA compartilhe a Service Role Key publicamente!** Use apenas no servidor (Netlify).

---

## 🌐 Passo 2: Configure as variáveis no Netlify

### Opção A: Via Dashboard Netlify (Recomendado)

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Selecione seu site
3. Vá para **Site settings → Build & deploy → Environment**
4. Clique em **Edit variables**
5. Adicione as 2 variáveis:

| Variável | Valor |
|----------|-------|
| `SUPABASE_URL` | Cole o Project URL do Supabase |
| `SUPABASE_SERVICE_KEY` | Cole a Service Role Key do Supabase |

6. Clique em **Save** ou **Deploy site**

### Opção B: Via CLI Netlify

```bash
netlify env:set SUPABASE_URL https://seu-projeto.supabase.co
netlify env:set SUPABASE_SERVICE_KEY eyJhbGc...
```

---

## 💻 Passo 3: Para testar LOCALMENTE

Crie um arquivo `.env.local` na raiz do projeto (NÃO no git):

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
```

Depois instale o [Netlify CLI](https://cli.netlify.com/) e rode:

```bash
netlify dev
```

Isso simula o ambiente Netlify localmente.

---

## ✅ Passo 4: Valide o Setup

Após fazer o deploy, teste:

1. **Validação direta da function:**
   ```
   https://seu-site.netlify.app/.netlify/functions/validate-token?token=teste
   ```
   Deve retornar JSON com `{ "valid": false, "message": "..." }`

2. **Teste o formulário de login:**
   - Acesse `https://seu-site.netlify.app`
   - Clique em "Entrar com código"
   - Insira um token válido do seu banco Supabase

---

## 🚀 Próximos passos:

1. **Configure o webhook da Eduzz** no Órbita para chamar:
   - `https://seu-site.netlify.app/.netlify/functions/entrega-eduzz`
   - `https://seu-site.netlify.app/.netlify/functions/webhook_eduzz`

2. **Verifique o banco de dados Supabase** - deve ter a tabela `usuarios_assinantes` com colunas:
   - `token` (texto, único)
   - `email` (texto)
   - `nome` (texto)
   - `status` (texto: 'pago', 'cancelado', etc)

3. **Debug:** Acesse **Netlify → Site → Functions** para ver logs em tempo real

---

## ❓ Problemas comuns?

| Erro | Solução |
|------|---------|
| `Variáveis SUPABASE não configuradas!` | Adicione as variáveis no Netlify (veja Passo 2) |
| `Error creating client` | Verifique se o SUPABASE_URL está correto |
| `Invalid Service Role Key` | Verifique se a Service Role Key foi copiada inteira, sem espaços |
| `Token não encontrado no banco` | Insira um token que realmente existe na tabela `usuarios_assinantes` |

---

**Pronto?** Faça o deploy com `git push` ou arraste a pasta no Netlify! 🎉
