# Content Machine 5.4 — Insights aplicados ao Sequência Viral

_Extração + mapeamento dos princípios CM5.4 (BrandsDecoded) aplicados no writer prompt em 2026-04-20._

---

## 1. Sumário executivo

O **Content Machine 5.4** é um framework/GPT da BrandsDecoded que orquestra produção de carrosséis em **5 etapas sequenciais** (triagem → headlines → espinha dorsal → template → render) com contratos rígidos de formato, bastidor 100% invisível e validação interna pré-resposta.

O diferencial do CM5.4 vs um prompt comum de IA: **separa pensamento de entrega**. Antes de escrever, o sistema resolve internamente 4 coisas (transformação, fricção, ângulo, âncoras), depois testa 10 formulações de headline cobrindo 10 naturezas diferentes, depois desenha espinha dorsal de 6 partes, só então renderiza o carrossel em template fechado.

Essa separação é o que diferencia "carrossel genérico" de "carrossel com tese". A versão anterior do nosso writer prompt já tinha hook library + escada + variants visuais, mas pulava direto pra render — sem o passo de triagem narrativa e sem a lista de 10 naturezas de abordagem.

---

## 2. Top 10 insights aplicáveis

1. **Triagem narrativa ANTES de escrever** — resolver internamente transformação, fricção central, ângulo dominante, âncoras observáveis. Prompt agora força esse passo como Pilar 1.
2. **Fricção central ≠ resumo do tema** — a tensão escondida do fenômeno é o coração do carrossel. Tema = "Claude Code", fricção = "a maior skill de dev em 2026 é saber o que NÃO pedir". Novo Quality Gate 11.
3. **10 naturezas de abordagem (ortogonais aos 12 arquétipos)** — reenquadramento, conflito oculto, implicação sistêmica, contradição, ameaça, nomeação, diagnóstico cultural, inversão, ambição, mecanismo social. Os 3 estilos (data/story/provocative) agora devem puxar 3 NATUREZAS diferentes, não só 3 arquétipos. Quality Gate 13.
4. **Regra-mãe da headline** — linha 1 captura (termina `?` ou `:`), linha 2 ancora (termina `.` ou `!`). Cada headline precisa passar 4 qualidades: INTERRUPÇÃO + RELEVÂNCIA + CLAREZA + TENSÃO. Pilar 2.
5. **Espinha dorsal em 6 papéis obrigatórios** — hook, mecanismo, prova, aplicação, implicação maior, direção. Todos aparecem mesmo em story mode. Quality Gate 12.
6. **Âncoras observáveis via pesquisa automática** — se o tema é amplo sem fatos concretos, buscar 3-6 âncoras verificáveis antes de escrever (já temos grounding Google Search, agora instrução explícita pra usar pra isso).
7. **Headline não pode servir para outros temas** — se trocando o tema a headline ainda funciona, ela é genérica. Quality Gate 14.
8. **Headline sem imagem mental ou conflito = fraca** — nenhuma abstração fria. Quality Gate 15.
9. **Linguagem de relatório banida no slide 1** — nada de "um olhar sobre", "análise de", "aspectos importantes". Quality Gate 16.
10. **Framework contratual selecionável** — 4 arquiteturas narrativas discretas (story-arc, problem-solution, mechanism-first, transformation) que o user pode ativar via `advanced.contentFramework`. Cada uma define papéis POR SLIDE (slide 2 = cenário antigo, slide 3 = ruptura, etc.).

---

## 3. Mapeamento CM5.4 → onde entrou no prompt

| Insight CM5.4 | Arquivo | Seção/Linha aproximada |
|---|---|---|
| Triagem narrativa (Pilar 1) | `app/api/generate/route.ts` | `# CONTENT MACHINE 5.4 FRAMEWORK` → PILAR 1 |
| Regra-mãe da headline (Pilar 2) | `app/api/generate/route.ts` | PILAR 2 dentro do bloco CM5.4 |
| 10 naturezas de abordagem (Pilar 3) | `app/api/generate/route.ts` | PILAR 3 + Quality Gate 13 |
| Espinha dorsal 6 partes (Pilar 4) | `app/api/generate/route.ts` | PILAR 4 + Quality Gate 12 |
| Fricção central | `app/api/generate/route.ts` | PILAR 1 + Quality Gate 11 |
| Teste de genericidade | `app/api/generate/route.ts` | Quality Gate 14 |
| Teste de abstração fria | `app/api/generate/route.ts` | Quality Gate 15 |
| Teste linguagem de relatório | `app/api/generate/route.ts` | Quality Gate 16 |
| Frameworks narrativos discretos | `app/api/generate/route.ts` | `advanced.contentFramework` + `frameworkSpec` object |
| ContentFramework type | `app/api/generate/route.ts` | novo tipo `ContentFramework`, campo opcional em `AdvancedGenerationOptions` |

---

## 4. O que ficou FORA (e por quê)

### Máquina de estados sequencial (5 etapas com "ok" entre cada uma)
O CM5.4 é um GPT interativo: user digita "ok" entre etapas. Nosso produto é API single-shot — user clica "gerar" e recebe 3 carrosséis. Implementar multi-turn quebraria o fluxo atual (e os 60s de `maxDuration` do Vercel). A lógica de triagem → headlines → espinha → render agora acontece INTERNAMENTE no raciocínio do modelo (thinkingBudget 16k ajuda), sem expor ao user.

### Proibição de 2ª pessoa ("você")
CM5.4 proíbe 2ª pessoa explicitamente. Mas a voz do Gabriel e do nicho cripto/marketing/IA em português BR é **naturalmente em "você"** — faz parte do ritmo conversacional. Aplicar essa regra quebraria Voice DNA dos usuários. Mantido: apenas proibição de "você precisa / você deve" (tom guru), que já estava no prompt.

### Templates fechados com 14/18/21 blocos exatos
O `Template_Library.md` define 4 templates com contagem rígida de blocos (14 Futurista, 18 Principal, 18 Autoral, 21 Twitter). Nosso produto já tem `DesignTemplateId` com 4 templates visuais — mas a contagem aqui é flexível (6-10 slides). Forçar 18 ou 21 blocos quebraria os templates visuais existentes (`components/app/templates/`). A contagem fica no UX do usuário.

### Proibição de sugestão visual dentro do texto
CM5.4 proíbe qualquer menção a imagem/cor/layout no texto gerado. Nosso produto SEPARA heading/body de `imageQuery` — o campo textual já é limpo. `imageQuery` alimenta Imagen/Serper e não vai pro slide. Regra já implícita.

### Bastidor invisível (lista de frases proibidas "vou consultar", "vou validar")
Isso é regra de GPT conversacional. Nossa API retorna JSON puro — Gemini não conversa com user. Não aplica.

### Pesquisa automática como etapa separada
Já temos Google Search grounding ativo no writer mode. O CM5.4 faz isso "no bastidor" e usa pra preencher triagem. Nosso prompt agora cita explicitamente "use grounding pra buscar âncoras observáveis quando o tema for amplo" dentro do Pilar 1.

---

## 5. Como testar (briefing exemplo)

**Brief abstrato (onde CM5.4 brilha):**
> "quero um carrossel sobre Claude Code no dia a dia de dev"

- **Antes (sem CM5.4):** carrossel genérico com 5 features aleatórias do Claude Code (Artifacts, Projects, Computer Use…), headline tipo "CLAUDE CODE: O QUE VOCÊ PRECISA SABER".
- **Depois (com CM5.4):** triagem força decidir fricção central ("dev que trata Claude como autocomplete perde 80% do valor"), ângulo é REENQUADRAMENTO + NOMEAÇÃO ("agente autônomo" vs "assistente"), headline tipo "O ERRO QUE 9 EM 10 DEVS COMETEM COM CLAUDE CODE: POR QUE TRATAR IA COMO AUTOCOMPLETE DESTRÓI SEU LEVERAGE." (linha 1 `:`, linha 2 `.`), espinha percorre os 6 papéis.

**Brief com framework ativo:**
```json
{
  "topic": "por que founders B2B que mudaram pra LinkedIn em 2025 estão voltando pro Twitter",
  "advanced": { "contentFramework": "story-arc", "preferredStyle": "provocative" }
}
```
Resultado esperado: slide 1 = capa contra-intuitiva, slide 2 = "O CENÁRIO ANTIGO" (LinkedIn era o novo canal B2B), slide 3 = "A RUPTURA" (o que aconteceu em 2026), slides 4+ = nova realidade.

---

## 6. Arquivos da fonte CM5.4

- `Downloads/Content Machine 5.4 (2)/# Content Machine 5.4 — Master Spec (1).md` — estados, regras globais, contratos de etapa
- `Downloads/Content Machine 5.4 (2)/5.4 _ System Instructions.md` — instruções operacionais do GPT
- `Downloads/Content Machine 5.4 (2)/Content_Machine_5_4_Template_Library (1).md` — 4 templates com contagem fixa de blocos
