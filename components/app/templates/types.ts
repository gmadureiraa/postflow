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
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  kicker: string;
  /** Paleta de preview (primary / accent / contraste). */
  palette: [string, string, string];
}
