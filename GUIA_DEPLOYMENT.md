# 🚀 Instruções de Deploy - Autenticação Supabase

## ✅ Alterações Implementadas

Seu arquivo `app/index.html` foi atualizado com a autenticação Supabase totalmente funcional.

---

## 📋 Checklist Pre-Deploy

Antes de publicar, verifique:

### 1. Supabase Setup
- [ ] Tabela `usuarios_assinantes` existe
- [ ] Coluna `token` com tipo TEXT
- [ ] Coluna `status` com tipo TEXT (valores: 'pago', 'active')
- [ ] Política RLS permite SELECT (public read)
- [ ] URL e Key estão corretos no código

### 2. Testes Locais
- [ ] Abrir `index.html` sem parâmetros → Mostra tela de login
- [ ] Entrar com token válido (status='pago') → Dashboard aparece
- [ ] Entrar com token válido (status='active') → Dashboard aparece
- [ ] Entrar com token inválido → Erro aparece em card vermelho
- [ ] Abrir com URL: `?token=CODIGO` → Login automático
- [ ] Recarregar página após login → Sessão mantida (localStorage)
- [ ] Pressionar Enter no input → Envia formulário

### 3. Navegador
- [ ] Testar em Chrome/Firefox/Safari
- [ ] Verificar console (F12) para erros
- [ ] Testar em mobile (responsivo)

### 4. HTTPS
- [ ] Seu site usa HTTPS? ✅ Supabase recomenda
- [ ] LocalStorage funciona em HTTP ⚠️ (limitado)

---

## 📂 Arquivo Modificado

**Arquivo principal:** `app/index.html`

**Seções alteradas:**
1. `<script type="module">` (linhas ~20-150)
   - Removido antigo código auth-logic
   - Novo fluxo Supabase

2. `<style>` section (linhas ~350-360)
   - CSS para #login-screen

3. `<body>` (linhas ~377-405)
   - Nova tela de login redesenhada

---

## 🔐 Credenciais (Já Integradas)

```javascript
Supabase URL: https://amwjnkitkxtwqzsxnoin.supabase.co
Supabase Key: sb_publishable_OqGyqzS5tnO0qLt86dK38A_t53QT5PR
```

⚠️ **Nota:** Estas são chaves públicas (seguro expor no client)

---

## 🌐 URLs de Teste

### Teste 1: Login Manual
```
http://localhost:8000/app/index.html
```
→ Tela de login deve aparecer

### Teste 2: Login via URL
```
http://localhost:8000/app/index.html?token=seu_codigo_aqui
```
→ Dashboard deve aparecer (se código válido)

---

## 🐛 Troubleshooting

### Problema: Tela de login não aparece
**Solução:**
- Verificar console (F12 → Console)
- Garantir que `id="login-screen"` existe no HTML
- Verificar z-index (deve estar acima de 99999)

### Problema: Token não é validado
**Solução:**
- Verificar Supabase: tabela `usuarios_assinantes` existe?
- Verificar se registro do token existe
- Verificar status: deve ser exatamente 'pago' ou 'active'
- Abrir console do navegador para ver erro

### Problema: Logout automático
**Solução:**
- localStorage está limpo? (F12 → Application → localStorage)
- Token expirou? Criar novo token no Supabase
- Domínio diferente entre abas? localStorage é por domínio

### Problema: CORS Error
**Solução:**
- Supabase permite requisições do seu domínio?
- Chave publica está correta?
- Modo de RLS configurado corretamente?

---

## 📊 Flow Visual

```
┌─────────────────────────────────────────────────────────────────┐
│ Usuário acessa index.html                                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Tem token?  │
                    └──────┬──────┘
            ┌──────────────┴──────────────┐
            │ Não                          │ Sim
            ▼                              ▼
       ┌─────────────┐          ┌─────────────────┐
       │ Tela Login  │          │ Validar Supabase│
       └────┬────────┘          └────────┬────────┘
            │                            │
            │ Usuário entra código       │ ┌───────────┐
            │                            ├─┤Status OK? │
            │ ┌──────────────────────────┘ └──────┬────┘
            │ │                          │ Sim    │ Não
            │ │                          ▼        ▼
            │ │                    ┌──────────┐ ┌─────┐
            │ │                    │Dashboard │ │Erro │
            │ │                    └──────────┘ └─────┘
            ▼ ▼
    ┌───────────────┐
    │Validar (POST) │
    └───────────────┘
            │
            └─────────► localStorage.setItem('lexops_token')
```

---

## 📞 Contato/Suporte

Caso tenha dúvidas:
1. Verificar console do navegador (F12)
2. Consultar logs do Supabase
3. Validar credenciais no Supabase dashboard

---

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar botão de logout
- [ ] Implementar refresh token automático
- [ ] Adicionar 2FA
- [ ] Rate limiting para brute force
- [ ] Logs de acesso no Supabase
- [ ] Link "Esqueci meu código?" → Eduzz

---

**Data:** 03 de Fevereiro de 2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para Produção
