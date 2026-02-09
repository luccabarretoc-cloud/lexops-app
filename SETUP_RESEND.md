## 📧 SETUP RESEND - ENVIO DE EMAILS

A integração com **Resend** foi implementada! Aqui como configurar:

---

## 1️⃣ CRIAR CONTA NO RESEND

1. Acesse [resend.com](https://resend.com)
2. Clique em **Sign Up** (gratuito)
3. Crie sua conta com email corporativo
4. Confirme o email

---

## 2️⃣ GERAR API KEY

1. No dashboard do Resend, vá para **API Keys**
2. Clique em **Create API Key**
3. Dê um nome: `lexops-insight`
4. Copie a chave (começa com `re_`)
5. **Guarde em local seguro** ⚠️

Exemplo:
```
re_abc123xyz...
```

---

## 3️⃣ CONFIGURAR DOMÍNIO (IMPORTANTE!)

Para emails não irem para SPAM:

1. No Resend, vá para **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio: `lexopsinsight.com.br` (ou qual usar)
4. Siga as instruções para adicionar os registros DNS
   - TXT record (SPF)
   - CNAME record (DKIM)
5. Aguarde validação (5-15 minutos)

**Email "From" recomendado:** `noreply@lexopsinsight.com.br`

---

## 4️⃣ CONFIGURAR VARIÁVEIS NO NETLIFY

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Selecione seu site `lexopsinsight`
3. Vá para **Site settings → Build & deploy → Environment**
4. Clique em **Edit variables**
5. Adicione **2 novas variáveis:**

| Variável | Valor |
|----------|-------|
| `RESEND_API_KEY` | Cole aqui sua API Key do Resend (`re_...`) |
| `RESEND_FROM_EMAIL` | `contato@lexopsinsight.com.br` |

6. Clique **Save**
7. **Deploy** o site (vai se atualizar automaticamente)

---

## 5️⃣ COMO FUNCIONA AGORA

**Fluxo completo:**

```
Cliente compra na Eduzz
    ↓
Redirecionado com ?transactionkey=XXXXX
    ↓
Chega em seu dashboard
    ↓
Valida token no Supabase via validate-token.js
    ↓
✅ Se válido E tem email:
    └─→ send-email.js dispara via Resend
        └─→ 📧 Email chegando em 2-3 segundos
```

---

## 📧 O QUE O CLIENTE RECEBE

Email automático com:
- ✅ Saudação personalizada (com nome)
- ✅ Seu código de acesso destacado
- ✅ Link direto para o dashboard
- ✅ Instruções de como usar
- ✅ Design profissional

---

## 🧪 TESTAR ENVIO DE EMAIL

Manualmente na sua URL:

```bash
curl -X POST https://seu-site.netlify.app/.netlify/functions/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@test.com",
    "token": "teste123",
    "nome": "Seu Nome"
  }'
```

Deve retornar:
```json
{
  "success": true,
  "message": "Email enviado com sucesso",
  "emailId": "20250209..."
}
```

---

## ⚠️ TROUBLESHOOTING

**Problema:** Email não chega
- ✅ Verifique se RESEND_API_KEY está correta
- ✅ Confirme que domínio foi validado no Resend
- ✅ Veja **Resend Dashboard → Emails** para logs

**Problema:** Email vai para SPAM
- ✅ Configure SPF/DKIM corretamente no DNS
- ✅ Use domínio verificado (não teste com @gmail.com)

**Problema:** Erro "Email service não configurado"
- ✅ Variável RESEND_API_KEY não está no Netlify
- ✅ Aguarde 1-2 min após salvar variáveis

---

## ✅ PRÓXIMO PASSO

1. Crie conta Resend
2. Gere API Key
3. Configure domínio (se possível)
4. Adicione variáveis no Netlify
5. Deploy novamente
6. Teste enviando um email real

Pronto! 🚀
