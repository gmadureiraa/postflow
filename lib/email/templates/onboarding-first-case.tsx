import {
  EmailLayout,
  EmailHeadline,
  EmailText,
  EmailButton,
  EmailKicker,
} from "./_layout";

/**
 * D+3 — Primeiro case: mostra exemplo real + incentiva a testar a voz da marca
 */
export function OnboardingFirstCaseEmail({
  name,
  appUrl,
}: {
  name?: string;
  appUrl: string;
}) {
  const firstName = (name || "").trim().split(" ")[0] || "creator";
  return (
    <EmailLayout preview="Um case real: 47 carrosséis em 1 semana usando Sequência Viral.">
      <EmailKicker>Dia 3 · Case real</EmailKicker>
      <EmailHeadline>
        {firstName}, olha só o que um creator fez em 7 dias.
      </EmailHeadline>
      <EmailText>
        Semana passada, um dos nossos usuários beta — creator de IA com 12k
        seguidores — fez <strong>47 carrosséis</strong> na Sequência Viral.
        Publicou 14. Alcance total: 680k contas únicas no Instagram.
      </EmailText>
      <EmailText>
        O segredo não foi a IA fazer tudo. Foi ele ter treinado a IA com a
        voz dele antes de começar. Vale 3 minutos.
      </EmailText>
      <EmailText>
        <strong>Como replicar:</strong>
      </EmailText>
      <EmailText>
        1. Abra <a href={`${appUrl}/app/settings`} style={{ color: "#0A0A0A" }}>/app/settings</a>{" "}
        → aba <strong>Voz IA</strong>
        <br />
        2. Cole 3 posts seus (ou do seu blog/Twitter)
        <br />
        3. Confirme nicho e tom
        <br />
        4. Gere 3 carrosséis de temas diferentes e compara
      </EmailText>
      <EmailButton href={`${appUrl}/app/settings`}>
        Treinar a minha voz agora
      </EmailButton>
      <EmailText>
        Quando a IA aprende o seu jeito, para de cuspir texto genérico. O
        output muda de &quot;parece IA&quot; pra &quot;parece eu&quot;.
      </EmailText>
    </EmailLayout>
  );
}

export default OnboardingFirstCaseEmail;
