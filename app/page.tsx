"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const TONIGHT_PROMPT = `Vertical 9:16 premium cinematic social video, 8 seconds. Use the woman in the reference portrait as the exact same recurring Astralia spokesperson: preserve her facial identity, age, skin texture, hair and navy-gold wardrobe. Medium close-up, direct warm eye contact, subtle natural breathing and realistic lip sync. She speaks clearly in Brazilian Portuguese with a warm, intimate, confident adult female voice: “Seu signo é só o começo. O céu do seu nascimento revela quem você veio ser.” Quiet elegant celestial music under the voice, clean studio audio, no hiss, no distortion. Deep midnight-blue background with a restrained antique-gold astrolabe halo and a soft golden sun reflection moving below. Slow cinematic push-in. No captions, no written words, no logo, no watermark.`;

type Health = { providers: { veo: boolean; runway: boolean } };

export default function Home() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  const [prompt, setPrompt] = useState(TONIGHT_PROMPT);
  const [useAvatar, setUseAvatar] = useState(true);
  const [status, setStatus] = useState("Pronto para criar.");
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (pollRef.current) clearTimeout(pollRef.current);
  }, []);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setStatus("Verificando acesso…");
    const response = await fetch("/api/health", {
      headers: { "x-astralia-secret": secret },
    });
    if (!response.ok) {
      setStatus("Senha incorreta. Use o valor de ASTRALIA_STUDIO_SECRET.");
      return;
    }
    const data = (await response.json()) as Health;
    setHealth(data);
    setUnlocked(true);
    setStatus("Acesso liberado. Veo pronto.");
  }

  async function poll(operationName: string) {
    const response = await fetch(
      `/api/veo/status?operation=${encodeURIComponent(operationName)}`,
      { headers: { "x-astralia-secret": secret } },
    );
    const data = await response.json();

    if (!response.ok || data.error) {
      setBusy(false);
      setStatus(data.error || "Falha ao consultar a geração.");
      return;
    }
    if (!data.done) {
      setStatus("O Veo está criando imagem, movimento, voz e música…");
      pollRef.current = setTimeout(() => poll(operationName), 10_000);
      return;
    }

    setDownloadUrl(data.downloadUrl);
    setBusy(false);
    setStatus("Vídeo concluído. Baixe e publique nas três redes.");
  }

  async function generate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setDownloadUrl(null);
    setStatus("Enviando direção criativa ao Veo…");

    const response = await fetch("/api/veo/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-astralia-secret": secret,
      },
      body: JSON.stringify({ prompt, useAvatar }),
    });
    const data = await response.json();
    if (!response.ok || !data.operationName) {
      setBusy(false);
      setStatus(data.error || "Não foi possível iniciar o vídeo.");
      return;
    }

    setStatus("Geração iniciada. Isso costuma levar alguns minutos…");
    await poll(data.operationName);
  }

  return (
    <main className="shell">
      <header className="brand">
        <img src="/astralia-mark.svg" alt="Símbolo Astralia" />
        <div>
          <p className="eyebrow">ASTRALIA</p>
          <h1>AI Studio</h1>
        </div>
        <span className="private">PRIVADO</span>
      </header>

      {!unlocked ? (
        <section className="gate panel">
          <div>
            <p className="eyebrow">ACESSO INTERNO</p>
            <h2>Entre no estúdio</h2>
            <p>Sua chave fica apenas nesta aba e nunca é gravada no navegador.</p>
          </div>
          <form onSubmit={unlock}>
            <label htmlFor="secret">Senha do Studio</label>
            <input
              id="secret"
              type="password"
              autoComplete="off"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="ASTRALIA_STUDIO_SECRET"
              required
            />
            <button type="submit">Abrir o Studio</button>
          </form>
          <p className="status">{status}</p>
        </section>
      ) : (
        <section className="workspace">
          <aside className="portrait panel">
            <img src="/api/avatar" alt="Avatar humano oficial do Astralia" />
            <div>
              <p className="eyebrow">ROSTO OFICIAL</p>
              <h2>A voz do Astralia</h2>
              <p>Humana, próxima e consistente em Reels, TikTok e Shorts.</p>
            </div>
          </aside>

          <form className="generator panel" onSubmit={generate}>
            <div className="row">
              <div>
                <p className="eyebrow">VÍDEO DA NOITE</p>
                <h2>Seu signo é só o começo</h2>
              </div>
              <div className="lights" aria-label="Provedores conectados">
                <span className={health?.providers.veo ? "on" : ""}>Veo</span>
                <span className={health?.providers.runway ? "on" : ""}>Runway</span>
              </div>
            </div>

            <label htmlFor="prompt">Direção criativa</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={12}
              disabled={busy}
            />

            <label className="check">
              <input
                type="checkbox"
                checked={useAvatar}
                onChange={(event) => setUseAvatar(event.target.checked)}
                disabled={busy}
              />
              Usar o avatar humano oficial e preservar o rosto
            </label>

            <button type="submit" disabled={busy}>
              {busy ? "Criando vídeo…" : "Gerar Reel · TikTok · Short"}
            </button>

            <a className="cover-download" href="/api/campaign/cover" download>
              Baixar capa pronta da campanha
            </a>

            <div className="statusbox" aria-live="polite">
              <span className={busy ? "spinner" : "star"}>✦</span>
              <p>{status}</p>
            </div>

            {downloadUrl && (
              <a
                className="download"
                href={downloadUrl}
                download="astralia-video-da-noite.mp4"
                onClick={(event) => {
                  event.preventDefault();
                  fetch(downloadUrl, { headers: { "x-astralia-secret": secret } })
                    .then((response) => response.blob())
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "astralia-video-da-noite.mp4";
                      link.click();
                      URL.revokeObjectURL(url);
                    });
                }}
              >
                Baixar vídeo final
              </a>
            )}
          </form>
        </section>
      )}

      <footer>Conteúdo com intenção. Astrologia com profundidade. Conversão com confiança.</footer>
    </main>
  );
}
