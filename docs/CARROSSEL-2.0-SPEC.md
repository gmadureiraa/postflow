# Carrossel 2.0 — Content Machine Integration

## Conceito

Integrar o sistema Content Machine 5.4 (BrandsDecoded) no Sequência Viral como "Carrossel 2.0". O fluxo guiado de 5 etapas produz conteúdo narrativo profundo, muito superior ao gerador atual (que faz tudo de uma vez).

## Fluxo de 5 Etapas (Máquina de Estados)

### Etapa 1 — Triagem
- Recebe o insumo do usuário (texto, link, ideia)
- IA analisa e extrai: Transformação, Fricção central, Ângulo narrativo, Evidências
- Exibe como tabela para revisão
- Usuário confirma com "ok"

### Etapa 2 — Headlines (Capas)
- Gera 10 opções de headline (capa do carrossel)
- Cada headline tem 2 linhas: captura + ancoragem
- 10 naturezas diferentes: reenquadramento, conflito oculto, implicação sistêmica, contradição, ameaça/oportunidade, nomeação, diagnóstico cultural, inversão, ambição de mercado, mecanismo social
- Usuário escolhe 1 das 10

### Etapa 3 — Espinha Dorsal
- Constrói a estrutura narrativa baseada na headline escolhida
- Campos: Hook, Mecanismo, Prova (A/B/C), Aplicação, Direção
- Usuário confirma com "ok"

### Etapa 4 — Escolha do Template
- 4 templates disponíveis:
  1. **Principal** — 18 blocos, alternância curto/denso
  2. **Futurista** — 14 textos / 10 slides, compacto
  3. **Autoral** — 18 blocos, progressão narrativa contínua
  4. **Twitter** — 21 blocos, fragmentado, continuidade lógica

### Etapa 5 — Render Final
- Gera o carrossel completo em Markdown
- Obedece ao template escolhido
- Blocos numerados (texto 1, texto 2, etc.)
- Pronto para ser aplicado no design

## Templates Visuais (do Figma)

### Template 1 — Principal
- Layout: Imagem hero + texto bold sobreposto
- 3 colunas de slides por "página"
- Fundo escuro com imagens fotográficas
- Texto branco em caixa alta/bold
- 18 blocos distribuídos em ~9 slides (2 textos por slide)

### Template 2 — Futurista
- Layout: Imagem lateral + texto ao lado
- Headers grandes + body menores
- 14 textos em 10 slides
- Visual mais limpo/editorial

### Template 3 — Autoral
- Layout: Imagem full + texto sobreposto
- Progressão narrativa forte
- 18 blocos com storytelling contínuo
- Visual premium com fotos

### Template 4 — Twitter
- Layout: Estilo tweet screenshot
- Avatar + nome + handle verificado
- Corpo de texto + imagem embaixo
- 21 blocos em ~8 slides (thread visual)
- Visual similar ao que já temos no Carrossel 1.0

## Implementação no App

### Nova aba: "Carrossel 2.0" (/app/create-v2)
- Interface de chat guiado (não form)
- Cada etapa mostra o output da IA e espera confirmação
- Progress bar visual das 5 etapas
- Template picker visual com previews

### API Route: /api/generate-v2
- Stateful — mantém contexto da conversa
- Cada etapa é uma chamada separada (baratas)
- Usa Gemini 2.5 Flash com o system prompt do Content Machine

### Rendering: 4 template components
- `TemplatePrincipal` — 18 blocos com imagens hero
- `TemplateFuturista` — 14 textos, layout editorial
- `TemplateAutoral` — 18 blocos, narrativa visual
- `TemplateTwitter` — 21 blocos, estilo tweet (evoluir o atual)

## Diferença Carrossel 1.0 vs 2.0

| Aspecto | 1.0 (Atual) | 2.0 (Content Machine) |
|---------|-------------|----------------------|
| Geração | 1 chamada → 3 variações | 5 etapas guiadas |
| Headlines | IA escolhe | Usuário escolhe entre 10 |
| Profundidade | Superficial | Análise narrativa profunda |
| Templates | 1 (tweet style) | 4 templates visuais |
| Qualidade | Boa | Excepcional |
| Velocidade | ~3s | ~30s (5 etapas) |
| Controle | Baixo | Alto (confirma cada etapa) |

---

*Spec criada: 2026-04-17 | Fonte: Content Machine 5.4 by BrandsDecoded*
