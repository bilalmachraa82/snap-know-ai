# Guia de Deployment no Vercel

Este guia descreve as etapas necessárias para publicar o projeto SnapKnow AI no Vercel.

## Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Conta no GitHub (o repositório já está configurado)
- Acesso ao projeto Supabase

## Etapas de Deployment

### 1. Preparar o Repositório

Certifique-se de que todas as alterações estão commitadas e enviadas para o GitHub:

```bash
git add .
git commit -m "Adicionar configuração do Vercel"
git push origin claude/vercel-deployment-steps-011CUc7xsaMsShw3Lm6eHok6
```

### 2. Importar Projeto no Vercel

1. Aceda a [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Selecione **"Import Git Repository"**
4. Escolha o repositório **snap-know-ai**
5. Selecione o branch **claude/vercel-deployment-steps-011CUc7xsaMsShw3Lm6eHok6** (ou main após merge)

### 3. Configurar o Projeto

O Vercel deverá detetar automaticamente que é um projeto Vite. Verifique as seguintes configurações:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Configurar Variáveis de Ambiente

No painel de configuração do Vercel, adicione as seguintes variáveis de ambiente:

```
VITE_SUPABASE_PROJECT_ID=afnhqzwhgygyvppmqccq
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbmhxendoZ3lneXZwcG1xY2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDgxNzUsImV4cCI6MjA3NzMyNDE3NX0.vtmzhbmddssZejMoj9KRDmVcXXAMUKh2rTOXp9ZSH1k
VITE_SUPABASE_URL=https://afnhqzwhgygyvppmqccq.supabase.co
```

**Importante**: Estas variáveis devem ser adicionadas na secção **Environment Variables** do projeto no Vercel.

### 5. Deploy

1. Clique em **"Deploy"**
2. Aguarde que o build seja concluído (geralmente 1-2 minutos)
3. Após o deploy bem-sucedido, o Vercel irá fornecer um URL de produção

### 6. Verificar o Deploy

1. Aceda ao URL fornecido pelo Vercel
2. Teste a aplicação para garantir que tudo está a funcionar corretamente
3. Verifique se a conexão com o Supabase está operacional

## Configuração de Domínio Personalizado (Opcional)

Se desejar usar um domínio personalizado:

1. Vá para **Settings** > **Domains** no painel do Vercel
2. Adicione o seu domínio
3. Configure os registos DNS conforme as instruções do Vercel

## Deploy Automático

O Vercel está configurado para fazer deploy automático sempre que houver um push para o branch principal. Para configurar:

1. Vá para **Settings** > **Git**
2. Configure o **Production Branch** (normalmente `main`)
3. Ative **Automatic deployments from Git**

## Troubleshooting

### Build Fails

Se o build falhar, verifique:
- Se todas as dependências estão no `package.json`
- Se as variáveis de ambiente estão configuradas corretamente
- Os logs de build no painel do Vercel

### Erro 404 nas Rotas

O ficheiro `vercel.json` já está configurado para redirecionar todas as rotas para `index.html`, resolvendo problemas com o React Router.

### Problemas com Supabase

Verifique:
- Se as variáveis de ambiente estão corretas
- Se o projeto Supabase está ativo
- Se as permissões do Supabase estão configuradas corretamente

## Comandos Úteis

```bash
# Testar build localmente
npm run build

# Visualizar build local
npm run preview

# Verificar linting
npm run lint
```

## Recursos

- [Documentação do Vercel](https://vercel.com/docs)
- [Guia Vite + Vercel](https://vercel.com/docs/frameworks/vite)
- [Supabase Documentation](https://supabase.com/docs)
