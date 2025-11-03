# Próximas Etapas - Cal AI

## ✅ Concluído
- ✅ Instalação de dependências

## 🔄 Próximas Etapas

### 1. Login no Supabase CLI
```bash
supabase login
```
Isto irá abrir o browser para autenticação.

### 2. Link ao Projeto Supabase
```bash
supabase link --project-ref afnhqzwhgygyvppmqccq
```

### 3. Deploy da Edge Function
```bash
supabase functions deploy analyze-food
```

### 4. Configurar LOVABLE_API_KEY
Precisas adicionar a API key como secret no Supabase:

```bash
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key_here
```

**Onde obter a LOVABLE_API_KEY:**
- Acede a [Lovable](https://lovable.dev)
- Vai para Project Settings → API Keys
- Cria ou copia a API key

### 5. Testar Localmente
```bash
npm run dev
```

Depois testa as seguintes funcionalidades:
- ✅ Login/Registo
- ✅ Adicionar refeição manual
- ✅ Adicionar refeição com foto (análise IA)
- ✅ Ver dashboard
- ✅ Ver histórico
- ✅ Editar/eliminar refeições

### 6. Build de Produção
```bash
npm run build
```

## 📝 Notas Importantes

### Funcionalidades Implementadas
- ✅ Landing page completa com design moderno
- ✅ Sistema de autenticação (email/password e Google OAuth)
- ✅ Dashboard com tracking nutricional em tempo real
- ✅ Adicionar refeições de forma manual
- ✅ Análise de imagens com IA (Gemini 2.5 Flash via Lovable Gateway)
- ✅ Editar e eliminar refeições
- ✅ Definir objetivos nutricionais personalizados
- ✅ Histórico de refeições com filtros (dia/semana/mês)
- ✅ Gráficos de progresso (últimos 7 dias)
- ✅ Exportar dados em JSON/CSV
- ✅ Partilhar progresso
- ✅ Storage bucket para fotos das refeições
- ✅ RLS policies para segurança

### Estrutura do Projeto
```
src/
├── pages/
│   ├── Landing.tsx        # Página inicial
│   ├── Auth.tsx          # Autenticação
│   ├── Dashboard.tsx     # Dashboard principal
│   └── NotFound.tsx
├── components/
│   ├── AddMealDialog.tsx      # Modal para adicionar refeição
│   ├── EditMealDialog.tsx     # Modal para editar refeição
│   ├── GoalsDialog.tsx        # Modal para definir objetivos
│   ├── ProgressCharts.tsx     # Gráficos de progresso
│   ├── ExportDataDialog.tsx   # Exportar dados
│   └── ShareProgressDialog.tsx # Partilhar progresso
└── hooks/
    └── useAuth.tsx       # Hook de autenticação

supabase/
├── functions/
│   └── analyze-food/     # Edge function para análise IA
└── migrations/
    ├── 20251029191653_*.sql  # Schema principal
    └── 20251029191720_*.sql  # Storage bucket
```

### Tecnologias Utilizadas
- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **IA:** Gemini 2.5 Flash via Lovable AI Gateway
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

## 🚀 Deploy em Produção

### Opção 1: Via Lovable (Recomendado)
1. Acede a https://lovable.dev/projects/3526ac6c-c105-4eb9-a710-628eea2a726e
2. Clica em Share → Publish

### Opção 2: Via Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Opção 3: Via Netlify
```bash
# Build
npm run build

# Faz upload da pasta dist/ para Netlify
```

## ⚠️ Troubleshooting

### Erro na análise de imagens
- Verifica se a LOVABLE_API_KEY está configurada corretamente
- Verifica se tens créditos disponíveis no Lovable
- Verifica os logs da edge function: `supabase functions logs analyze-food`

### Erro ao fazer upload de imagens
- Verifica se o storage bucket 'meal-photos' existe
- Verifica se as migrations foram aplicadas

### Erro de autenticação
- Verifica se as variáveis de ambiente estão corretas no .env
- Verifica se o Google OAuth está configurado (se aplicável)

## 📊 Melhorias Futuras (Opcionais)
- [ ] Notificações push para lembrar de registar refeições
- [ ] Sugestões de refeições baseadas nos objetivos
- [ ] Integração com wearables (Apple Health, Google Fit)
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)
- [ ] Análise de tendências a longo prazo
- [ ] Receitas personalizadas
- [ ] Sistema de badges e gamificação
