# Segurança de dados de horários na Fatec

_Exportado de claude.ai em 01/09/2026, 16:18:40_

---

### Você

favicon.ico

ICO

LICENSE

logo.svg

SVG

schedule\_data.json

JSON

index.html

HTML

README.md
66 linhas

MD

No Modo Claro, o verde limão ficou ruim de ler (nos nomes dos cursos na parte de editar grade). Troque. Você tocou num ponto relevante no readme sobre segurança de dados: se isso vaza de algum jeito, alguém de fora sabe quando uma pessoa vai pra fatec em que horário e eu não sei se curto essa ideia. Quero pensar num jeito de tornar isso mais justo, talvez algum sistema de autenticação, alguma senha, algo do gênero, e de camuflar os dados no repo. P: Qual nível de proteção você quer pros dados de horário/professor? R: via Netlify Function eu vou acabar gastando crédito, né? Os que vem e vc pode usar na conta gratuita. Preferia o maior nível de segurança possível, mas também sem perder um recurso assim

---

### Claude

Now updating the four text-color usages that need the readable variant instead of the raw accent color:



Index
Código·HTML

---

### Você

P: Qual caminho você prefere pra proteger os dados de horário/professor? R: Quero entender melhor antes de decidir

---

### Claude

Boa, vale entender antes de mexer em arquitetura. Deixa eu te dar o panorama real, porque teve mudança recente na Netlify que muda a conta.

**Sobre créditos Netlify (atualizado):** a Netlify saiu do modelo antigo de "125 mil invocações grátis" e passou pra um sistema de **créditos compartilhados**: 300 créditos/mês no plano Free, sem auto-recarga (o site trava até o próximo ciclo se estourar). Function roda a ~10 créditos por GB-hora de compute — pra uma function levinha (só validar senha e devolver um JSON de ~50KB), isso é uma fração de crédito por chamada. Com o volume de uso que uma ferramenta de turma de Fatec deve ter, é bem improvável estourar isso. Então sim, dá pra usar Function sem gastar dinheiro, mas o teto agora é mais apertado do que era antes — se um dia o link viralizar, pode bater no limite.

Agora as duas opções reais:


### Opção A — Senha única compartilhada

Uma Function recebe a senha, compara com um valor guardado como variável de ambiente na Netlify (nunca no repo), e só aí devolve o `schedule_data.json`. O HTML deixa de carregar o JSON estático — ele pede a senha na primeira visita, guarda um token no navegador, e busca os dados via Function.


- **Esconde do repo público:** sim — o arquivo de dados sai do GitHub.
- **Esconde de quem não tem a senha:** sim, mas é uma senha só, então basta vazar uma vez (um print, um "empresta aí") pra qualquer pessoa ter acesso permanente.
- **Esforço:** baixo. Uma function, um campo de senha, pronto.
- **Revogar acesso de alguém específico:** não dá — é tudo ou nada, e trocar a senha derruba todo mundo até avisar a nova.


### Opção B — Login individual (Netlify Identity)

Cada pessoa cria conta (email + senha, ou você aprova cadastros manualmente). A Function só devolve os dados se receber um token válido de um usuário autenticado do Identity.


- Confirmei agora: ao contrário do que rolou de rumor por aí, a **Netlify Identity não foi descontinuada** — em fevereiro de 2026 a Netlify reverteu esse plano e ela segue disponível de graça em todos os planos, inclusive o Free.
- **Esconde do repo:** sim, igual à opção A.
- **Controle fino:** dá pra ver quem logou, revogar uma conta específica, exigir aprovação manual de cadastro.
- **Esforço:** bem maior — fluxo de signup/login, tela de "aguardando aprovação", mais estados pra tratar na interface.


### O que nenhuma das duas resolve

Isso vale a pena deixar claro: depois que uma pessoa autenticada (com senha certa ou conta própria) recebe os dados no navegador, eles **passam pelo JavaScript dela** — dá pra abrir o DevTools e copiar tudo, print, etc. Nenhum esquema client-side impede isso; ele só impede acesso de quem _não_ tem permissão nenhuma. Ou seja: você reduz de "qualquer um na internet vê" pra "só quem tem senha/conta vê", mas não elimina o risco de alguém de dentro repassar os dados adiante.

Dado isso, pra um app de turma compartilhado entre alunos, a Opção A costuma ser o ponto de equilíbrio — resolve o problema real (não ficar público e indexável no Google/GitHub) sem o overhead de gerenciar contas individuais. A Opção B faz sentido se você realmente precisa saber _quem_ acessou ou quiser poder cortar o acesso de uma pessoa específica sem afetar as outras.

Quer que eu implemente a Opção A primeiro?

---

### Você

Bom, assim como podem vazar uma foto do mural, podem vazar um site, né, acho que aí já sai da minha responsabilidade individual. Mas eu por num repo a info pra qualquer um saber que pode ter acesso fácil assim já é um pouco demais pra mim, talvez. Então talvez a senha seja um bom meio termo

---

### Claude

Achei uma coisa importante antes de sair implementando — preciso te contar isso primeiro.

**O `index.html` que você me mandou já tem TODOS os dados de sala/turma/professor embutidos direto no código-fonte**, numa variável `DEFAULT_DATA` (~48KB de JSON, dá pra ver com "Ver código-fonte" no navegador, sem precisar nem abrir o `schedule_data.json`). Isso existe de propósito — é o fallback pra quando alguém abre o app como `file://` (sem servidor) ou quando o fetch do `schedule_data.json` falha.

Ou seja: **hoje, mesmo que a gente esconda o `schedule_data.json`, o mesmo conteúdo já está público, em texto puro, dentro do próprio `index.html`** — e o `index.html` é o arquivo que obrigatoriamente fica no repo (é ele que a Netlify serve). Botar senha só na busca do JSON externo não resolveria nada, porque os dados sensíveis continuariam ali, embutidos.

Pra senha realmente proteger algo, isso muda o plano: o `index.html` que vai pro GitHub **não pode mais carregar os dados de sala/turma/professor por padrão** — ele vira uma casca vazia (interface + lógica de busca), e os dados reais só chegam depois que a pessoa digita a senha certa e a Function libera. Isso tem um custo: acabou o "funciona offline abrindo o arquivo direto" — sem servidor (Netlify) e sem digitar a senha, o app não mostra nada.

---

### Você

P: Topa perder o modo offline/file:// (que hoje mostra os dados sem senha) pra fechar essa brecha de vez? R: Sim, tira o fallback embutido e exige senha sempre

---

### Claude

Vou implementar. Primeiro removo os dados embutidos do HTML e troco pela tela de senha:







Investigating why a file's size stays unexpectedly large.





Inspecting embedded images explaining the file's unusual size.





Implementing Netlify Blobs code for the request.





Now let's add the password gate overlay markup right after `<body>`, matching the lightbox style:



Now let's add CSS for `.authgate` near the `.lightbox` styles:







Now let's rewrite this section with the password-gated loading logic:









Checking the auth gate and overlay logic together.



Now let's check the `updateSaveStatus` function and the reset handler that also references `dataSource === 'arquivo'`:





Untangling the save-status function's true purpose.





Now let's check the reset handler that also calls `loadInitialData()` and referenced `dataSource === 'arquivo'`:











Let's add a "trocar senha" button here, reusing the `.resetBtn` style:







Cleaning up remaining references to the old file.





Cleaning up unused code and checking for leftover references.

Now let's add a "publish to everyone" button that writes straight to the server, replacing the old manual file-replace workflow:







Building serverless functions for a scheduling app with storage.

Now let's create the Netlify Functions and config:







---

