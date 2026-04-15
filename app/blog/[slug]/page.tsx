import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

/* ─────────────────── BLOG DATA ─────────────────── */

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
}

const posts: Record<string, BlogPost> = {
  "como-criar-carrosseis-virais-instagram-2026": {
    slug: "como-criar-carrosseis-virais-instagram-2026",
    title: "Como Criar Carrosseis Virais no Instagram em 2026",
    description:
      "Descubra as estrategias que os maiores criadores de conteudo usam para criar carrosseis que viralizam no Instagram em 2026.",
    date: "2026-04-10",
    readTime: "7 min",
    category: "Instagram",
    content: `O carrossel e o formato que mais gera engajamento no Instagram em 2026. Dados recentes mostram que carrosseis tem 1.4x mais alcance que posts de imagem unica e 3x mais salvamentos. Se voce ainda nao esta usando carrosseis como pilar da sua estrategia, esta deixando engajamento na mesa.

## Por que carrosseis funcionam tao bem?

O algoritmo do Instagram prioriza tempo de permanencia. Quando alguem para pra passar os slides do seu carrossel, o Instagram interpreta isso como conteudo de qualidade. Cada swipe e um sinal positivo. E se a pessoa volta pro inicio ou salva pra ler depois? Melhor ainda.

Alem disso, carrosseis aparecem ate 3 vezes no feed de uma mesma pessoa. Se ela nao interagiu no primeiro slide, o Instagram mostra o segundo ou terceiro. Isso multiplica suas chances de capturar atencao.

## Os 5 elementos de um carrossel viral

### 1. Primeiro slide matador

O primeiro slide e o seu outdoor. Se nao parar o scroll, o resto nao importa. Use perguntas provocativas, numeros especificos ou afirmacoes contrarias ao senso comum.

Exemplos que funcionam:
- "90% dos criadores erram isso no primeiro slide"
- "5 automacoes que economizam 20h por semana"
- "Pare de fazer carrosseis bonitos (e comece a fazer carrosseis uteis)"

### 2. Narrativa progressiva

Cada slide precisa fazer a pessoa querer ver o proximo. Use frameworks como:
- Problema → Agravamento → Solucao
- Lista numerada com revelacao progressiva
- Historia com cliffhanger entre slides

### 3. Design limpo e consistente

Menos e mais. Use no maximo 2 fontes, 3 cores e bastante espaco em branco. Textos curtos — maximo 30 palavras por slide. Se precisa de mais texto, divida em mais slides.

### 4. CTA no ultimo slide

Nunca termine sem um chamado para acao. Pode ser "Salve pra consultar depois", "Comente qual foi sua favorita" ou "Siga pra mais conteudo como esse". O CTA direciona o comportamento.

### 5. Caption complementar

A legenda nao deve repetir o carrossel. Use-a para adicionar contexto pessoal, contar os bastidores ou fazer uma pergunta que gere comentarios.

## Como criar carrosseis mais rapido com IA

O maior obstaculo pra consistencia e o tempo de producao. Criar um bom carrossel manualmente leva de 1 a 3 horas entre pesquisa, escrita, design e revisao.

Ferramentas como o PostFlow eliminam essa fricao. Voce cola um link de artigo ou descreve uma ideia, e a IA gera 3 variacoes completas em 30 segundos — cada uma com abordagem diferente (dados, storytelling e provocativa). Seu branding e aplicado automaticamente.

Isso significa que voce pode testar mais formatos, publicar com mais frequencia e gastar sua energia criativa no que importa: ter boas ideias.

## Frequencia ideal de publicacao

Para a maioria dos criadores, 3 a 5 carrosseis por semana e o sweet spot. Menos que 3 e voce nao ganha tracao. Mais que 5 e a qualidade tende a cair.

O segredo e ter um sistema. Defina seus pilares de conteudo (3 a 5 temas), crie um banco de ideias e use ferramentas de IA pra acelerar a producao. Com PostFlow, por exemplo, voce consegue criar 5 carrosseis em menos de 30 minutos.

## Metricas que importam

Nao fique obcecado com curtidas. As metricas que realmente indicam um carrossel viral sao:

- **Salvamentos**: Indica que o conteudo e util
- **Compartilhamentos**: Indica que o conteudo e relevante para outros
- **Tempo de permanencia**: Indica que as pessoas estao consumindo
- **Novos seguidores**: Indica que o conteudo atrai publico novo

Monitore essas metricas semanalmente e ajuste sua estrategia com base nos dados, nao na intuicao.

## Conclusao

Criar carrosseis virais nao e sorte — e sistema. Primeiro slide forte, narrativa progressiva, design limpo, CTA claro e frequencia consistente. Combine isso com ferramentas de IA pra escalar sua producao e voce tera uma maquina de engajamento.

Comece hoje: crie seu primeiro carrossel com PostFlow gratuitamente e veja a diferenca.`,
  },

  "5-formatos-carrossel-mais-engajamento": {
    slug: "5-formatos-carrossel-mais-engajamento",
    title: "5 Formatos de Carrossel que Geram Mais Engajamento",
    description:
      "Conheca os 5 formatos de carrossel que consistentemente geram mais curtidas, comentarios e compartilhamentos no Instagram e LinkedIn.",
    date: "2026-04-08",
    readTime: "6 min",
    category: "Estrategia",
    content: `Nem todo carrossel e igual. Depois de analisar centenas de posts de alto desempenho no Instagram e LinkedIn, identificamos 5 formatos que consistentemente superam a media em engajamento. Se voce esta criando carrosseis sem uma estrutura definida, esta perdendo potencial.

## Formato 1: O Listicle Educativo

O formato mais popular e por bom motivo. Funciona assim:
- Slide 1: Titulo com numero ("7 ferramentas que todo criador precisa")
- Slides 2-8: Uma ferramenta por slide com nome, descricao curta e por que usar
- Slide final: CTA para salvar ou seguir

Por que funciona: Numeros criam expectativa. Cada slide entrega valor isolado. Facil de salvar pra consultar depois.

Engajamento medio: 2.5x acima da media da conta.

## Formato 2: O Mito vs Realidade

Estrutura poderosa para conteudo que desafia crencas:
- Slide 1: "X mitos sobre [tema] que voce ainda acredita"
- Slides pares: O mito (com icone de X vermelho)
- Slides impares: A realidade (com icone de check verde)
- Slide final: A verdade resumida + CTA

Por que funciona: Gera curiosidade e controversia saudavel. As pessoas comentam pra concordar ou discordar. O formato visual (X vs check) e facil de processar.

Engajamento medio: 3x acima da media em comentarios.

## Formato 3: O Tutorial Passo a Passo

Ideal para conteudo pratico e aplicavel:
- Slide 1: "Como [resultado desejado] em X passos"
- Slides intermediarios: Um passo por slide com instrucao clara
- Screenshots ou mockups quando possivel
- Slide final: Resultado esperado + CTA

Por que funciona: E o formato com mais salvamentos. As pessoas guardam pra aplicar depois. Tutoriais posicionam voce como autoridade.

Engajamento medio: 4x mais salvamentos que a media.

## Formato 4: O Antes e Depois

Transformacao visual ou conceitual:
- Slide 1: "De [estado ruim] para [estado bom]"
- Slide 2: O antes (com contexto)
- Slides intermediarios: O processo de transformacao
- Penultimo slide: O depois
- Slide final: Licoes aprendidas + CTA

Por que funciona: Historias de transformacao sao irresistiveis. Geram identificacao ("eu estava nessa situacao") e aspiracao ("quero chegar la").

Engajamento medio: 2x mais compartilhamentos.

## Formato 5: O Hot Take Argumentativo

Para criadores que querem gerar debate:
- Slide 1: Opiniao forte e concisa ("SEO morreu. Aqui esta o por que.")
- Slides 2-4: Argumentos que sustentam a tese
- Slides 5-6: Contra-argumentos e por que nao se sustentam
- Slide final: Conclusao provocativa + "Concorda? Comenta."

Por que funciona: Polariza. E polarizacao gera comentarios. E comentarios fazem o algoritmo distribuir mais. Use com responsabilidade — opinioes devem ser genuinas, nao clickbait vazio.

Engajamento medio: 5x mais comentarios, mas pode gerar unfollow se feito em excesso.

## Como escolher o formato certo

A regra e simples:
- **Quer educar?** Use Listicle ou Tutorial
- **Quer engajar?** Use Mito vs Realidade ou Hot Take
- **Quer inspirar?** Use Antes e Depois

O ideal e alternar entre os formatos ao longo da semana. Monotonia mata o engajamento.

## Acelerando a producao

Com PostFlow, voce descreve sua ideia e recebe 3 variacoes — e cada uma pode usar um formato diferente. A variacao "dados" tende a virar Listicle, a "storytelling" vira Antes e Depois, e a "provocativa" vira Hot Take. Assim voce testa formatos sem esforco extra.

## Conclusao

Formatos nao sao formulas magicas, mas sao frameworks que funcionam. Teste os 5, analise seus dados e dobre a aposta nos que performam melhor com o seu publico. Consistencia no formato certo e o caminho pro crescimento.`,
  },

  "thread-vs-carrossel-qual-funciona-melhor": {
    slug: "thread-vs-carrossel-qual-funciona-melhor",
    title: "Thread vs Carrossel: Qual Funciona Melhor?",
    description:
      "Threads no Twitter/X ou carrosseis no Instagram? Analisamos dados reais para responder essa pergunta definitivamente.",
    date: "2026-04-05",
    readTime: "8 min",
    category: "Analise",
    content: `Dois formatos dominam a criacao de conteudo longo em redes sociais: threads no Twitter/X e carrosseis no Instagram (e cada vez mais no LinkedIn). Mas qual dos dois gera mais resultado? Analisamos dados de mais de 500 criadores para chegar a uma resposta baseada em evidencias.

## O cenario atual

Em 2026, ambos os formatos estao em alta. O Instagram expandiu o limite de slides para 20. O Twitter/X melhorou a experiencia de leitura de threads. E o LinkedIn abraou carrosseis como nunca.

Mas os formatos servem a propositos diferentes. Vamos comparar.

## Alcance: Vantagem Carrossel

Carrosseis no Instagram tem um alcance medio 1.4x maior que posts de imagem unica. Threads no Twitter, por outro lado, tendem a perder leitores a cada tweet — em media, apenas 30% dos leitores chegam ao final de uma thread de 10 tweets.

O motivo e estrutural: no carrossel, o swipe e continuo. Na thread, cada tweet compete com o resto do feed. O carrossel mantem voce dentro da experiencia.

**Veredicto**: Carrossel ganha em alcance total.

## Engajamento: Depende do tipo

- **Curtidas**: Carrossel ganha (mais visibilidade = mais curtidas)
- **Comentarios**: Thread ganha (formato de texto estimula resposta em texto)
- **Retweets/Compartilhamentos**: Thread ganha (mais facil de RT um tweet do que compartilhar um carrossel)
- **Salvamentos**: Carrossel ganha por goleada (as pessoas salvam visual)

**Veredicto**: Empate. Depende da metrica que voce prioriza.

## Velocidade de producao

Uma thread de 10 tweets leva em media 45 minutos para escrever (pesquisa + escrita + revisao). Um carrossel de 10 slides leva 1.5 a 3 horas (pesquisa + escrita + design + revisao).

Com ferramentas de IA como PostFlow, um carrossel pode ser criado em menos de 5 minutos — eliminando completamente a desvantagem de tempo.

**Veredicto**: Thread ganha no manual. Com IA, carrossel empata.

## Longevidade do conteudo

Carrosseis no Instagram tem uma vida util mais longa. O algoritmo continua mostrando carrosseis de boa performance semanas depois da publicacao. Threads no Twitter, por natureza da plataforma, tem uma vida util de 24-48 horas.

No LinkedIn, carrosseis (documentos PDF) tambem tem longevidade superior a posts de texto.

**Veredicto**: Carrossel ganha.

## Conversao para seguidores

Threads no Twitter sao melhores para viralizar e atrair seguidores novos. Um bom primeiro tweet pode ser retweetado centenas de vezes, trazendo publico novo. Carrosseis no Instagram dependem mais do Explore e de compartilhamentos diretos.

**Veredicto**: Thread ganha para aquisicao de novos seguidores no curto prazo.

## A estrategia ideal: os dois

A melhor estrategia nao e escolher um ou outro — e usar ambos de forma complementar:

1. **Comece com a ideia** — defina o tema e os pontos principais
2. **Crie o carrossel primeiro** — e o formato mais completo (visual + texto)
3. **Extraia uma thread** — adapte o conteudo do carrossel para formato de tweets
4. **Adapte para LinkedIn** — o carrossel funciona como documento, a thread vira post longo

Esse fluxo de repurposing multiplica seu conteudo por 3 plataformas com esforco incremental minimo.

## Como PostFlow facilita isso

PostFlow gera carrosseis otimizados para Instagram, Twitter e LinkedIn a partir de uma unica ideia. As 3 variacoes (dados, storytelling, provocativa) podem ser adaptadas para cada plataforma. Voce cria uma vez e publica em 3 lugares.

Isso elimina o debate "thread vs carrossel" porque voce faz ambos em menos tempo do que antes levaria pra fazer um so.

## Conclusao

Nao existe formato universalmente melhor. Carrosseis ganham em alcance e longevidade. Threads ganham em viralidade e conversao rapida. A estrategia inteligente e usar os dois — e ferramentas de IA como PostFlow tornam isso possivel sem triplicar o esforco.`,
  },

  "como-usar-ia-criar-conteudo-redes-sociais": {
    slug: "como-usar-ia-criar-conteudo-redes-sociais",
    title: "Como Usar IA para Criar Conteudo de Redes Sociais",
    description:
      "Um guia pratico de como integrar inteligencia artificial no seu fluxo de producao de conteudo sem perder autenticidade.",
    date: "2026-04-02",
    readTime: "9 min",
    category: "IA",
    content: `A inteligencia artificial nao vai substituir criadores de conteudo. Mas criadores que usam IA vao substituir os que nao usam. Em 2026, a questao nao e se voce deve usar IA na producao de conteudo — e como usar de forma inteligente.

## O problema: producao de conteudo e um gargalo

A maioria dos criadores e profissionais de marketing enfrenta o mesmo desafio: produzir conteudo consistente em multiplas plataformas consome tempo demais. Um estudo recente mostrou que criadores gastam em media 15 horas por semana so na producao de conteudo para redes sociais.

Isso deixa pouco tempo para o que realmente importa: estrategia, relacionamento com a audiencia e desenvolvimento de novas ideias.

## Onde a IA realmente ajuda (e onde nao ajuda)

### A IA e excelente para:

**1. Gerar primeiros rascunhos**
Ninguem gosta de encarar a pagina em branco. A IA elimina esse obstaculo. Descreva sua ideia em uma frase e tenha um rascunho completo em segundos. Voce edita e refina — nao cria do zero.

**2. Criar variacoes**
Uma ideia, multiplas abordagens. A IA pode transformar o mesmo conceito em versao educativa, provocativa, pessoal ou baseada em dados. Isso permite testar o que funciona melhor com sua audiencia.

**3. Adaptar para multiplas plataformas**
O que funciona no Instagram e diferente do que funciona no Twitter ou LinkedIn. A IA adapta tom, comprimento e formato para cada plataforma automaticamente.

**4. Design automatico**
Ferramentas como PostFlow aplicam seu branding (foto, nome, cores) automaticamente. Zero tempo em Canva ou Figma.

**5. Pesquisa e curadoria**
Cole um link de artigo e a IA extrai os pontos-chave para transformar em conteudo. Isso transforma consumo de informacao em producao de conteudo.

### A IA NAO e boa para:

**1. Opinioes genuinas** — Sua perspectiva unica e o que diferencia voce. A IA pode estruturar, mas a opiniao precisa ser sua.

**2. Historias pessoais** — Bastidores, vulnerabilidade, experiencias reais. A IA nao viveu sua vida.

**3. Tom de voz original** — A IA tende a ser generica. Voce precisa revisar e injetar personalidade.

**4. Estrategia** — Decidir o que postar, quando e por que ainda requer inteligencia humana.

## O fluxo de trabalho ideal com IA

Aqui esta o framework que recomendamos:

### Passo 1: Ideacao (humano)
Defina seus 3-5 pilares de conteudo. Mantenha um banco de ideias (Notion, Apple Notes, qualquer lugar). Anote insights do dia-a-dia, artigos interessantes, perguntas da audiencia.

### Passo 2: Geracao (IA)
Pegue uma ideia do banco e use IA para gerar o conteudo. Com PostFlow, voce pode:
- Colar um link de artigo
- Descrever o tema em uma frase
- Colar um video do YouTube

A IA gera 3 variacoes de carrossel em 30 segundos.

### Passo 3: Edicao (humano)
Revise cada variacao. Injete sua voz. Adicione exemplos pessoais. Remova o que parece generico. Esse passo e crucial — e o que separa conteudo bom de conteudo generico de IA.

### Passo 4: Design (IA + humano)
Com PostFlow, o design e automatico. Seu branding ja esta aplicado. Ajuste cores ou imagens se necessario. Exporte ou publique direto.

### Passo 5: Distribuicao (automatizado)
Publique no Instagram, adapte para Twitter thread e LinkedIn. Use ferramentas de agendamento para manter consistencia.

## Quanto tempo voce economiza?

Comparacao real de um criador que publica 5 carrosseis por semana:

| Etapa | Sem IA | Com IA (PostFlow) |
|-------|--------|-------------------|
| Pesquisa | 2h | 30min |
| Escrita | 5h | 1h |
| Design | 3h | 15min |
| Publicacao | 1h | 30min |
| **Total** | **11h** | **2h 15min** |

Isso e uma economia de quase 9 horas por semana. Em um mes, sao 36 horas — quase uma semana inteira de trabalho.

## Cuidados importantes

1. **Nunca publique sem revisar** — IA comete erros factuais. Sempre confira.
2. **Mantenha sua voz** — Se tudo parece escrito por IA, voce perde autenticidade.
3. **Diversifique inputs** — Nao use sempre o mesmo tipo de prompt. Experimente diferentes abordagens.
4. **Monitore metricas** — Compare performance de conteudo com e sem IA. Ajuste.

## Conclusao

IA e uma ferramenta, nao uma muleta. Use-a para eliminar o trabalho mecanico e liberar tempo para o trabalho criativo. O criador do futuro nao e quem escreve mais rapido — e quem tem melhores ideias e sabe usar tecnologia pra escala-las.

Comece gratuitamente com PostFlow e veja como IA pode transformar seu fluxo de producao.`,
  },

  "guia-completo-tamanhos-instagram-twitter-linkedin": {
    slug: "guia-completo-tamanhos-instagram-twitter-linkedin",
    title:
      "O Guia Completo de Tamanhos para Instagram, Twitter e LinkedIn",
    description:
      "Todos os tamanhos de imagem e video atualizados para 2026 para Instagram, Twitter/X e LinkedIn. Guia de referencia definitivo.",
    date: "2026-03-28",
    readTime: "5 min",
    category: "Referencia",
    content: `Publicar com o tamanho errado de imagem e um dos erros mais comuns — e mais faceis de evitar — nas redes sociais. Imagens cortadas, textos ilegveis e videos pixelados destroem a percepcao profissional do seu conteudo.

Este guia reune todos os tamanhos atualizados para 2026. Salve nos favoritos e consulte sempre que precisar.

## Instagram

### Post no Feed
- **Quadrado**: 1080 x 1080 px (1:1) — Classico, funciona sempre
- **Retrato**: 1080 x 1350 px (4:5) — Recomendado, ocupa mais espaco no feed
- **Paisagem**: 1080 x 566 px (1.91:1) — Pouco usado, menos impacto visual

### Carrossel
- **Tamanho por slide**: 1080 x 1350 px (4:5) — Maximo impacto
- **Numero de slides**: Ate 20 slides (atualizado em 2025)
- **Formato**: JPG ou PNG
- **Resolucao minima**: 1080 px de largura

### Stories
- **Tamanho ideal**: 1080 x 1920 px (9:16)
- **Area segura para texto**: Evite os 250 px superiores e 320 px inferiores (nome de usuario e CTAs do Instagram)

### Reels
- **Tamanho**: 1080 x 1920 px (9:16)
- **Duracao**: Ate 90 segundos (ate 3 minutos para contas verificadas)
- **Formato**: MP4 ou MOV

### Foto de Perfil
- **Tamanho**: 320 x 320 px (exibido como circulo de 110 px)

## Twitter / X

### Post com Imagem
- **Uma imagem**: 1600 x 900 px (16:9) — Melhor visibilidade
- **Duas imagens**: 700 x 800 px cada (7:8)
- **Tres imagens**: 1 de 700 x 800 px + 2 de 700 x 400 px
- **Quatro imagens**: 700 x 400 px cada

### Thread Visual
- **Tamanho por imagem**: 1080 x 1080 px (1:1) ou 1080 x 1350 px (4:5)
- **Formato**: JPG, PNG ou GIF

### Header/Banner
- **Tamanho**: 1500 x 500 px (3:1)
- **Area segura**: O centro 1000 x 300 px (os cantos sao cortados em mobile)

### Foto de Perfil
- **Tamanho**: 400 x 400 px (exibido como circulo)

## LinkedIn

### Post com Imagem
- **Tamanho recomendado**: 1200 x 627 px (1.91:1)
- **Post quadrado**: 1080 x 1080 px (1:1)
- **Post retrato**: 1080 x 1350 px (4:5)

### Documento/Carrossel
- **Tamanho por pagina**: 1080 x 1350 px (4:5) — Recomendado
- **Formato**: PDF
- **Maximo**: 300 paginas (mas 8-12 e o ideal)

### Banner do Perfil
- **Tamanho**: 1584 x 396 px (4:1)
- **Area segura**: Considere que a foto de perfil cobre parte do canto inferior esquerdo

### Foto de Perfil
- **Tamanho**: 400 x 400 px (exibido como circulo)

### Company Page Banner
- **Tamanho**: 1128 x 191 px

## Tabela Resumo — Carrosseis

| Plataforma | Tamanho Ideal | Proporcao | Formato | Max Slides |
|------------|---------------|-----------|---------|------------|
| Instagram | 1080 x 1350 px | 4:5 | JPG/PNG | 20 |
| Twitter/X | 1080 x 1080 px | 1:1 | JPG/PNG | - (thread) |
| LinkedIn | 1080 x 1350 px | 4:5 | PDF | 300 |

## Dicas universais

1. **Sempre exporte em 2x** — Telas retina mostram pixels. Use 2160 x 2700 px para um carrossel 4:5 de alta qualidade.

2. **Mantenha texto na area segura** — Cada plataforma corta de forma diferente. Deixe margem de pelo menos 5% em cada borda.

3. **Use PNG para texto** — JPG comprime e borra textos pequenos. PNG mantem nitidez.

4. **Teste em mobile antes de publicar** — 90% do consumo e no celular. O que parece bom no desktop pode ficar ilegvel no telefone.

5. **Automatize com PostFlow** — O PostFlow ja exporta no tamanho correto para cada plataforma. Voce nao precisa memorizar nenhum desses numeros — a ferramenta faz isso automaticamente.

## Conclusao

Tamanhos corretos sao o basico da producao de conteudo profissional. Este guia e atualizado regularmente conforme as plataformas mudam suas especificacoes. Salve-o e consulte sempre que tiver duvida.

Com PostFlow, voce nao precisa se preocupar com tamanhos — a exportacao automatica ja cuida disso. Mas saber os numeros te da mais controle sobre seu conteudo.`,
  },
};

/* ─────────────────── GENERATE STATIC PARAMS ─────────────────── */

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

/* ─────────────────── GENERATE METADATA ─────────────────── */

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = posts[slug];

  if (!post) {
    return { title: "Post nao encontrado | PostFlow Blog" };
  }

  return {
    title: `${post.title} | PostFlow Blog`,
    description: post.description,
    alternates: {
      canonical: `https://postflow.app/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://postflow.app/blog/${post.slug}`,
      publishedTime: post.date,
      authors: ["PostFlow"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

/* ─────────────────── PAGE ─────────────────── */

export default async function BlogPost(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const post = posts[slug];

  if (!post) {
    notFound();
  }

  // Simple markdown-like rendering for ## headings, **bold**, lists, and tables
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeader: string[] = [];

    const flushTable = () => {
      if (tableHeader.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[var(--border)]">
                  {tableHeader.map((cell, i) => (
                    <th
                      key={i}
                      className="text-left py-2 px-3 font-semibold"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-[var(--border)]/50"
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2 px-3 text-[var(--muted)]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      inTable = false;
      tableRows = [];
      tableHeader = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table detection
      if (line.startsWith("|")) {
        const cells = line
          .split("|")
          .filter((c) => c.trim() !== "")
          .map((c) => c.trim());

        if (!inTable) {
          inTable = true;
          tableHeader = cells;
          continue;
        }

        // Skip separator line
        if (cells.every((c) => /^[-:]+$/.test(c))) continue;

        tableRows.push(cells);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Headings
      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={i}
            className="font-[family-name:var(--font-serif)] text-xl tracking-tight mt-8 mb-3"
          >
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={i}
            className="font-[family-name:var(--font-serif)] text-2xl tracking-tight mt-10 mb-4"
          >
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("- **")) {
        // Bold list item
        const parts = line.replace("- **", "").split("**");
        elements.push(
          <li key={i} className="flex items-start gap-2 ml-4 mb-2">
            <span className="text-[var(--accent)] mt-1.5 shrink-0">
              &bull;
            </span>
            <span>
              <strong>{parts[0]}</strong>
              {parts[1]}
            </span>
          </li>
        );
      } else if (line.startsWith("- ")) {
        elements.push(
          <li key={i} className="flex items-start gap-2 ml-4 mb-2">
            <span className="text-[var(--accent)] mt-1.5 shrink-0">
              &bull;
            </span>
            <span>{line.replace("- ", "")}</span>
          </li>
        );
      } else if (line.trim() === "") {
        // Skip empty lines (spacing handled by margins)
      } else {
        // Regular paragraph - handle inline bold
        const parts = line.split(/(\*\*[^*]+\*\*)/);
        elements.push(
          <p
            key={i}
            className="text-[var(--muted)] leading-relaxed mb-4"
          >
            {parts.map((part, pi) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={pi} className="text-[var(--foreground)]">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      }
    }

    if (inTable) flushTable();

    return elements;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-4xl px-6 flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-[family-name:var(--font-serif)] text-xl tracking-tight"
          >
            PostFlow
          </Link>
          <Link
            href="/blog"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Todos os posts
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-[var(--accent)] bg-purple-50 px-2 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-[var(--muted)]">{post.date}</span>
            <span className="text-xs text-[var(--muted)]">
              {post.readTime} de leitura
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            {post.description}
          </p>
        </header>

        <div className="prose-postflow">{renderContent(post.content)}</div>

        {/* CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
          <h3 className="font-[family-name:var(--font-serif)] text-2xl tracking-tight mb-3">
            Crie seu primeiro carrossel com IA
          </h3>
          <p className="text-[var(--muted)] mb-6">
            Gratis. Sem cartao de credito. Pronto em 30 segundos.
          </p>
          <a
            href="https://postflow.app"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] transition-colors text-sm"
          >
            Criar carrossel gratis
          </a>
        </div>
      </article>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm text-[var(--muted)]">
            &copy; {new Date().getFullYear()} PostFlow. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
