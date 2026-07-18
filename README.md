# Astralia AI Studio

Painel privado para criação de vídeos verticais do Astralia com Veo e Runway.

## Variáveis no Vercel

- `GEMINI_API_KEY`
- `RUNWAYML_API_SECRET`
- `ASTRALIA_STUDIO_SECRET`

As chaves são usadas somente nas rotas do servidor. Nunca use prefixo `NEXT_PUBLIC_`.

## Desenvolvimento

```bash
npm install
npm run dev
```

O primeiro fluxo implementado gera vídeo vertical 9:16 com áudio nativo pelo Veo 3.1 Fast. O Runway aparece no diagnóstico e receberá o segundo fluxo de geração na próxima etapa.
