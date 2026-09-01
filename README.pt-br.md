# Cadê meu prof/turma? 📍

*(Read in English: [README.md](README.md))*

Ferramenta rápida para achar **sala, turma ou professor** na grade de horários da Fatec Baixada Santista — sem precisar verificar o mapa impresso toda vez.

🔗 **Acesse:** _(cole aqui o link do Netlify depois do deploy)_

## O que faz

- **Buscar por professor** (nome parcial já funciona) → mostra onde e quando ele dá aula, dia por dia.
- **Buscar por turma** (ex: `CD6`, `ADS4`) → mostra a agenda semanal completa da turma.
- **Buscar por sala** → mostra todas as aulas que acontecem ali, em qualquer horário.
- **Editar grade**: uma tela com o mapa em formato de tabela (sala × horário), pra corrigir ou completar dados comparando com a foto do mapa impresso.
- **Aviso de conflitos**: se o mesmo professor acabar aparecendo em duas salas no mesmo dia/horário (geralmente um erro herdado do mapa impresso), o app sinaliza isso — tanto nos resultados de busca quanto na tela de edição da grade.
- **Fotos-fonte**: as fotos do mapa original ficam anexadas no próprio app, pra conferência.
- Acesso protegido por senha — os dados de sala/turma/professor não ficam expostos no repositório nem no HTML público (ver seção **Segurança dos dados** abaixo).

## Como usar

Acesse o link publicado, digite a senha de acesso e escolha o modo de busca (professor / turma / sala).

Não sabe uma sigla de curso? A aba de busca mostra uma legenda com todas as siglas (GP, CD, ADS, SI, LOG, GE, línguas etc.) e a cor de cada curso.

## Segurança dos dados

Diferente de uma versão anterior deste projeto, os dados de sala/turma/professor **não ficam em nenhum arquivo do repositório** (nem `schedule_data.json`, nem embutidos no `index.html`). Eles moram só no [Netlify Blobs](https://docs.netlify.com/blobs/overview/), um armazenamento privado ligado ao site, e só saem de lá através de duas Netlify Functions:

- `get-schedule` devolve os dados, mas exige o hash SHA-256 da **senha de acesso** (a mesma que todo mundo usa pra entrar no app).
- `save-schedule` sobrescreve os dados, mas exige o hash de uma **senha de administrador separada** (pra publicar uma correção pra todo mundo).

A senha em si nunca é enviada nem guardada — o navegador calcula o hash SHA-256 dela localmente (`crypto.subtle.digest`) e só o hash trafega pela rede. O `index.html` publicado é uma casca vazia: sem a senha certa, ele não mostra nada.

**O que isso não resolve:** depois que alguém autenticado recebe os dados no navegador, eles passam pelo JavaScript da página — dá pra abrir o DevTools e copiar tudo. O esquema protege contra acesso público (indexação no Google/GitHub, link vazado sem senha), não contra alguém autorizado repassando os dados adiante.

### Configurando as senhas

1. Escolha uma senha de acesso (pra quem só precisa consultar) e uma senha de administrador (pra quem publica correções). Podem ser frases simples, tipo `turma-2026-2`.
2. Calcule o hash SHA-256 de cada uma. Num terminal com Node instalado:
   ```bash
   node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "sua-senha-aqui"
   ```
   (Ou no console do navegador: `crypto.subtle.digest('SHA-256', new TextEncoder().encode('sua-senha-aqui')).then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))`)
3. No painel da Netlify: **Site configuration → Environment variables**, adicione:
   - `ACCESS_KEY_HASH` = hash da senha de acesso
   - `ADMIN_KEY_HASH` = hash da senha de administrador
4. Faça um novo deploy (ou "Trigger deploy → Clear cache and deploy") pra as variáveis valerem.

### Primeira publicação dos dados (semear o Blobs)

Como os dados não vão pro repositório, na primeira vez o Blobs está vazio. Pra popular:

1. Abra o site publicado e entre com a senha de acesso.
2. Vá na aba **Editar grade** → **⬆️ Importar arquivo (.json)** e selecione o `schedule_data.json` que você tem localmente (o mesmo formato que o botão "Baixar dados atualizados" gera).
3. Clique em **📤 Publicar atualização para todos** e informe a senha de administrador.

Pronto — a partir daí, qualquer pessoa que entrar com a senha de acesso vê esses dados. Pra atualizar depois, edite direto na grade (compare com a foto em **Fotos-fonte** se tiver dúvida) e publique de novo.

**Importante:** nunca commite um `schedule_data.json` com dados reais no repositório — ele existe só como formato de import/export local. O `.gitignore` já ignora esse arquivo.

## Publicar no Netlify

1. Suba esta pasta pro GitHub (veja abaixo).
2. No [Netlify](https://app.netlify.com), **Add new site → Import an existing project**, conecte o repositório.
3. Build command: nenhum. Publish directory: `.` (raiz). O `netlify.toml` já define isso e aponta `netlify/functions` como pasta das Functions.
4. Configure as variáveis de ambiente `ACCESS_KEY_HASH` e `ADMIN_KEY_HASH` (ver seção acima) **antes** do primeiro deploy, ou refaça o deploy depois de configurá-las.
5. Deploy. Depois, siga a seção **Primeira publicação dos dados** pra semear o Blobs.

O plano Free da Netlify inclui Functions e Blobs sem custo dentro do uso normal de um app desse porte (créditos compartilhados, ~300/mês — uma chamada leve de function usa uma fração de crédito).

## Rodando localmente

Como agora o app depende de Netlify Functions (e do Blobs), rodar como `file://` ou com um servidor HTTP simples não é mais suficiente pra ver os dados — a tela de senha vai aparecer, mas a Function não vai responder sem o ambiente da Netlify. Pra testar de verdade localmente, use a [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npm install
npx netlify dev
```

Isso sobe o site e as Functions juntos (com Blobs funcionando localmente também), normalmente em `http://localhost:8888`. Configure `ACCESS_KEY_HASH` e `ADMIN_KEY_HASH` no `.env` local ou via `netlify env:set` antes de rodar.

## Estrutura

```
index.html                        # o app inteiro (HTML + CSS + JS), sem dados embutidos
logo.svg                          # logo/favicon em SVG
favicon.ico                       # favicon (fallback)
apple-touch-icon.png              # ícone pra tela inicial no iOS
netlify.toml                      # config de build/publish e pasta das Functions
package.json                      # dependência @netlify/blobs
netlify/functions/get-schedule.js # devolve os dados (exige senha de acesso)
netlify/functions/save-schedule.js# sobrescreve os dados (exige senha de administrador)
```

## Aviso

Este é um projeto não-oficial, feito por um aluno, sem vínculo com a Fatec Baixada Santista. Os dados de professores vêm do mapa de salas público exposto na unidade; se algum professor preferir não aparecer aqui, abra uma *issue* ou me chame que eu removo.

## Licença

Distribuído sob a licença MIT — veja [LICENSE](LICENSE).
