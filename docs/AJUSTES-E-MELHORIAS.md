# Sequência Viral — Plano de Ajustes & Melhorias
> Nada de features novas. Só polish, fixes e refinamento do que existe.

---

## 1. FAVICON & META (Prioridade: Alta)
- [x] Favicon: trocar Vercel default por ícone "SV" laranja
- [x] Apple-touch-icon 180x180
- [ ] OG image: gerar imagem 1200x630 com logo + tagline pra compartilhamento
- [ ] Twitter card image: mesma coisa
- [ ] Meta description: revisar em todas as rotas

## 2. LANDING PAGE (Prioridade: Alta)
- [ ] Hero: headline mais impactante e curta, testar variações
- [ ] Trust strip: remover border neo-brutal que ainda pode existir
- [ ] Features: verificar se os textos estão atualizados (referências a "PostFlow" etc)
- [ ] Testimonials: revisar handles (@sequencia-viralapp → algo real)
- [ ] Pricing cards: verificar que os valores e features estão corretos
- [ ] FAQ: revisar todas as respostas pra relevância
- [ ] Footer: verificar links sociais
- [ ] Mobile: testar responsividade em viewport 375px
- [ ] Loading speed: verificar LCP, CLS, FID

## 3. LOGIN/SIGNUP (Prioridade: Alta)
- [ ] Verificar que Google OAuth redireciona corretamente
- [ ] Verificar que signup com email envia confirmação
- [ ] Mensagens de erro claras em português
- [ ] Loading states nos botões
- [ ] Visual panel (direita): carousel preview atualizado

## 4. ONBOARDING (Prioridade: Alta)
- [ ] Step 0: testar scraping de Twitter e Instagram com Apify
- [ ] Verificar que dados scraped populam corretamente os campos
- [ ] Transições entre steps suaves
- [ ] Progress indicator claro
- [ ] Mobile responsiveness

## 5. EDITOR DE CARROSSEL (Prioridade: Média)
- [ ] Drag-and-drop: testar em mobile (touch events)
- [ ] Thumbnail strip: verificar scroll behavior
- [ ] Image picker: testar busca e upload
- [ ] Auto-save: confirmar que salva no Supabase (não só local)
- [ ] Undo/redo: não existe, considerar implementar
- [ ] Export PNG: testar download de cada slide individualmente
- [ ] Export PDF: testar geração e download
- [ ] Keyboard shortcuts: documentar na UI

## 6. MEUS CARROSSÉIS (Prioridade: Média)
- [ ] Empty state bonito com CTA
- [ ] Cards com thumbnail real do primeiro slide
- [ ] Status badge (rascunho, publicado)
- [ ] Delete com confirmação
- [ ] Abrir pra edição ao clicar
- [ ] Sort/filter funcional

## 7. SETTINGS (Prioridade: Baixa)
- [x] Botão "Refazer onboarding"
- [ ] Verificar que todos os campos salvam corretamente
- [ ] Plano/usage display preciso
- [ ] Link pra checkout funcional

## 8. PERFORMANCE (Prioridade: Média)
- [ ] Lazy load de imagens nas páginas
- [ ] Skeleton loading nos carrosséis
- [ ] Prefetch das rotas mais acessadas
- [ ] Bundle size: verificar se não há imports desnecessários

## 9. COPY & UX WRITING (Prioridade: Baixa)
- [ ] Revisar todos os toasts (sucesso, erro, info)
- [ ] Revisar placeholders dos inputs
- [ ] Revisar loading messages na geração
- [ ] Consistência no tom (sempre português informal)

## 10. BUGS CONHECIDOS
- [x] "Unexpected token" ao receber erro da API → fixado
- [x] Favicon Vercel default → fixado
- [ ] Sugestões de IA repetitivas → precisa variar seed/temperature no prompt
- [ ] Possível race condition no auto-save se editar rápido

---

*Criado: 2026-04-17 | Foco: qualidade, não quantidade*
