# Regras de IA — web

- Leia `SPEC.md`; siga o App Router e use Server Components por padrão.
- Adicione `'use client'` somente quando hooks, eventos ou APIs do navegador forem necessários.
- Sessões ficam em cookie HTTP-only. Nunca mova o JWT para `localStorage` nem o exponha ao cliente.
- Chamadas autenticadas do navegador passam pelos Route Handlers em `app/api`.
- Preserve Tailwind 4, os tokens de `globals.css` e os componentes de `components/ui`; evite estilos isolados sem necessidade.
- Valide dados na borda e mantenha compatibilidade com o envelope `{ data, error }` do backend.
- Use `next/link` e `next/image` quando aplicáveis e mantenha acessibilidade de formulários e navegação.
- Não edite saídas `.next`, `tsconfig.tsbuildinfo` ou dependências instaladas.
- Valide com `npm run build` e `npx biome check .`.

