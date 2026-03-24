# ChatPulse

AI-chatbot SaaS. Bedrifter oppretter workspace, fyller inn kunnskapsbase og bedriftsinfo, får en embeddable chatbot-widget.

## Stack
- **Frontend:** Next.js 14 + shadcn/ui + Tailwind
- **Backend:** Supabase (auth, postgres, pgvector, edge functions, storage)
- **Widget:** Preact eller vanilla (separat bundle, <50kb)
- **AI:** Claude API for chat, OpenAI for embeddings (text-embedding-3-small)

## Datamodell
```
workspaces (id, name, slug, created_at)
members (id, user_id, workspace_id, role [owner/admin/member])
company_info (id, workspace_id, data JSONB)
knowledge (id, workspace_id, title, content, embedding vector(1536), category)
chatbot_config (id, workspace_id, name, prompt, welcome_message, fallback_response, widget_styling JSONB)
conversations (id, workspace_id, visitor_id, started_at)
messages (id, conversation_id, role, content, created_at)
questions (id, workspace_id, question, count, last_asked_at, answered bool)
```

## Brukerstruktur
- Workspace = én bedrift, isolert data
- Team: flere brukere per workspace (owner/admin/member)
- Én bruker kan tilhøre flere workspaces

## Design
- Lilla/indigo + varm rosa aksent
- Runde hjørner, myke skygger
- Space Grotesk headings, Inter body
- Morsomme empty states

## Milepæler

### M1 – Fundament
Auth (Supabase), workspace-opprettelse, team-invite, sidebar-layout med dashboard-shell

### M2 – Data inn
Knowledge base CRUD, bedriftsinfo-skjema, chatbot-konfig med preview

### M3 – RAG + Chat
Embedding-pipeline (pgvector), vector-søk, chat API med Claude, test-chat i dashboard

### M4 – Widget + Insights
Embeddable widget (<50kb), samtalelogg, spørsmåls-dashboard, trender

## Repo
- GitHub: github.com/benjaclaw/chatpulse
- Vercel: auto-deploy fra main
