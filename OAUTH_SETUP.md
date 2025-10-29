# Google OAuth Setup Guide

Este guia explica como configurar o Google OAuth para a autenticação no SnapKnow AI.

## Índice
1. [Configurar Google Cloud Console](#1-configurar-google-cloud-console)
2. [Configurar Supabase Dashboard](#2-configurar-supabase-dashboard)
3. [Configurar Redirect URLs](#3-configurar-redirect-urls)
4. [Testar a Integração](#4-testar-a-integração)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Configurar Google Cloud Console

### 1.1 Criar um Projeto

1. Acede à [Google Cloud Console](https://console.cloud.google.com/)
2. Clica em **"Select a project"** no topo da página
3. Clica em **"New Project"**
4. Dá um nome ao projeto (ex: "SnapKnow AI")
5. Clica em **"Create"**

### 1.2 Configurar OAuth Consent Screen

1. No menu lateral, vai a **APIs & Services > OAuth consent screen**
2. Seleciona **"External"** (a não ser que tenhas um Google Workspace)
3. Clica em **"Create"**
4. Preenche os campos obrigatórios:
   - **App name**: SnapKnow AI
   - **User support email**: o teu email
   - **Developer contact information**: o teu email
5. Clica em **"Save and Continue"**
6. Na secção **"Scopes"**, clica em **"Add or Remove Scopes"**
7. Adiciona os seguintes scopes:
   - `openid`
   - `email`
   - `profile`
8. Clica em **"Update"** e depois **"Save and Continue"**
9. Na secção **"Test users"** (se estiveres em modo Testing), adiciona os emails que vão testar a aplicação
10. Clica em **"Save and Continue"** e depois **"Back to Dashboard"**

### 1.3 Criar OAuth 2.0 Client ID

1. No menu lateral, vai a **APIs & Services > Credentials**
2. Clica em **"Create Credentials"** > **"OAuth client ID"**
3. Seleciona **"Web application"** como Application type
4. Dá um nome (ex: "SnapKnow Web Client")
5. Em **"Authorized JavaScript origins"**, adiciona:
   ```
   http://localhost:5173
   https://teu-dominio.com
   ```
6. Em **"Authorized redirect URIs"**, adiciona (vais configurar o URL exato no próximo passo):
   ```
   https://[SEU_PROJETO_REF].supabase.co/auth/v1/callback
   ```
7. Clica em **"Create"**
8. **Guarda o Client ID e Client Secret** - vais precisar deles no próximo passo

---

## 2. Configurar Supabase Dashboard

### 2.1 Configurar Google Provider

1. Acede ao [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleciona o teu projeto SnapKnow AI
3. No menu lateral, vai a **Authentication > Providers**
4. Procura **"Google"** na lista de providers
5. Clica em **"Google"** para expandir as configurações
6. Ativa o toggle **"Enable Sign in with Google"**
7. Preenche os campos:
   - **Client ID (for OAuth)**: Cola o Client ID do Google Cloud Console
   - **Client Secret (for OAuth)**: Cola o Client Secret do Google Cloud Console
8. Copia o **"Callback URL (for OAuth)"** que aparece no Supabase
   - Deve ser algo como: `https://[teu-projeto].supabase.co/auth/v1/callback`
9. Clica em **"Save"**

### 2.2 Adicionar Callback URL ao Google Cloud Console

1. Volta ao **Google Cloud Console > APIs & Services > Credentials**
2. Clica no OAuth client ID que criaste
3. Em **"Authorized redirect URIs"**, adiciona o **Callback URL** que copiaste do Supabase
4. Clica em **"Save"**

---

## 3. Configurar Redirect URLs

As Redirect URLs já estão configuradas no código:

### No useAuth.tsx
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
  },
});
```

### URLs Configuradas
- **Production**: `https://teu-dominio.com/dashboard`
- **Development**: `http://localhost:5173/dashboard`

Quando o utilizador faz login com Google:
1. É redirecionado para a página de autenticação do Google
2. Após autorizar, é redirecionado de volta para o Supabase
3. O Supabase processa a autenticação
4. O utilizador é redirecionado para `/dashboard` da tua aplicação

---

## 4. Testar a Integração

### 4.1 Ambiente de Desenvolvimento

1. Certifica-te que a aplicação está a correr:
   ```bash
   npm run dev
   ```

2. Acede a `http://localhost:5173/auth`

3. Clica em **"Continuar com Google"**

4. Deves ser redirecionado para a página de login do Google

5. Após fazer login, deves voltar para `/dashboard`

### 4.2 Verificar o Perfil Criado

1. No **Supabase Dashboard**, vai a **Authentication > Users**
2. Deves ver o novo utilizador com:
   - Provider: `google`
   - Email do Google
   - Nome completo (se disponível)

3. Vai a **Database > Tables > profiles**
4. Verifica que foi criado um perfil para o utilizador

### 4.3 Estados a Testar

- ✅ Login com Google (primeira vez)
- ✅ Login com Google (utilizador existente)
- ✅ Cancelar login no Google
- ✅ Email já registado com password
- ✅ Logout e novo login

---

## 5. Troubleshooting

### Erro: "Access blocked: This app's request is invalid"

**Causa**: OAuth Consent Screen não está configurado corretamente.

**Solução**:
1. Vai ao Google Cloud Console > OAuth consent screen
2. Verifica que o status é "Testing" ou "Published"
3. Se estiver em "Testing", adiciona o teu email aos Test Users

### Erro: "redirect_uri_mismatch"

**Causa**: O redirect URI não está configurado no Google Cloud Console.

**Solução**:
1. Vai ao Google Cloud Console > Credentials
2. Edita o OAuth client ID
3. Adiciona exatamente o URL de callback do Supabase:
   ```
   https://[teu-projeto].supabase.co/auth/v1/callback
   ```

### Erro: "Email já registado com outro método"

**Causa**: O utilizador já tem conta com email/password.

**Comportamento**: O sistema mostra mensagem "Email já registado com outro método de login".

**Solução**: O utilizador deve fazer login com email/password ou usar o sistema de password reset.

### Erro: "OAuth configuration error"

**Causa**: Client ID ou Client Secret estão incorretos no Supabase.

**Solução**:
1. Vai ao Supabase Dashboard > Authentication > Providers > Google
2. Verifica que o Client ID e Client Secret estão corretos
3. Se necessário, gera novas credenciais no Google Cloud Console

### Botão "Continuar com Google" não aparece

**Causa**: O Google OAuth pode estar comentado no código.

**Solução**: Verifica que o código em `/src/pages/Auth.tsx` não está comentado (deve estar visível após esta implementação).

### Utilizador é redirecionado mas não faz login

**Causa**: Possível problema com o auth state listener.

**Solução**:
1. Abre a Developer Console do browser (F12)
2. Verifica se há erros no console
3. Vai ao Supabase Dashboard > Authentication > Logs
4. Procura por erros relacionados com OAuth

---

## Variáveis de Ambiente

**Não são necessárias variáveis de ambiente adicionais** para esta integração.

As credenciais OAuth são configuradas diretamente no:
- ✅ Google Cloud Console (Client ID e Secret)
- ✅ Supabase Dashboard (Provider settings)
- ✅ O código já está configurado para usar `supabase.auth.signInWithOAuth()`

---

## Notas de Segurança

1. **Nunca commits Client Secret**: Está configurado no Supabase, não no código
2. **HTTPS em produção**: Certifica-te que usas HTTPS em produção
3. **Verificar domínios**: Só adiciona domínios confiáveis aos Authorized JavaScript origins
4. **Rate limiting**: O Supabase já tem rate limiting configurado
5. **OAuth Consent Screen**: Move para "Published" quando estiveres pronto para produção

---

## Recursos Adicionais

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth UI Kit](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)

---

## Checklist de Implementação

- [x] Google Cloud Project criado
- [x] OAuth Consent Screen configurado
- [x] OAuth 2.0 Client ID criado
- [x] Client ID e Secret adicionados ao Supabase
- [x] Callback URL adicionado ao Google Cloud Console
- [x] Código implementado (Auth.tsx e useAuth.tsx)
- [x] Mensagens de erro em Português
- [x] Loading states implementados
- [ ] Testado em desenvolvimento
- [ ] Testado em produção
- [ ] OAuth Consent Screen em modo "Published" (para produção)

---

**Última atualização**: 29 de Outubro de 2025
**Versão**: 1.0
