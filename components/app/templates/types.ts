/**
 * Shared types for Sequência Viral visual templates.
 *
 * Canvas: 1080 × 1350 (Instagram 4:5). Cada template renderiza o mesmo
 * `SlideProps` com tratamento visual distinto.
 */

export type TemplateId = "manifesto" | "futurista" | "autoral" | "twitter";

export interface SlideProps {
  heading: string;
  body: string;
  imageUrl?: string;
  slideNumber: number;
  totalSlides: number;
  profile: { name: string; handle: string; photoUrl: string };
  style: "white" | "dark";
  isLastSlide?: boolean;
  /** Exibe o rodapé Sequência Viral (wordmark + seta) só no primeiro slide, e só se true. */
  showFooter?: boolean;
  /** Tamanho da escala visual. 1 = full 1080×1350. Default: 0.38. */
  scale?: number;
  /**
   * Modo export (PNG/PDF): rota imagens externas pelo /api/img-proxy pra evitar
   * canvas tainted de CORS. Nunca habilite em preview — quebra cache de imagem.
   */
  exportMode?: boolean;
  /** Override da cor de destaque do template (substitui a cor padrão). */
  accentOverride?: string;
  /** Override da família de fonte do heading (CSS font-family string completa). */
  displayFontOverride?: string;
  /** Multiplicador do tamanho do texto (body + heading). Default: 1. Range: 0.8–1.3. */
  textScale?: number;
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  kicker: string;
  /** Paleta de preview (primary / accent / contraste). */
  palette: [string, string, string];
}
