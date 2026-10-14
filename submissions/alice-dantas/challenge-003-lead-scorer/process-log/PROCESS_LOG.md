# Process Log — Challenge 003 | Lead Scorer

## Informações Gerais

**Desafio:** Challenge 003 | Lead Scorer  
**Responsável:** Maria Alice Dantas  
**Data de início:** 14/10/2026  
**Horário de início:** Pendente  
**Data de conclusão:** Em andamento  
**Horário de conclusão:** Pendente  
**Status:** Em andamento

## 1. Objetivo

Documentar como utilizei inteligência artificial para investigar o problema, analisar dados, tomar decisões, construir, testar e melhorar a solução.

O documento também registra a evolução cronológica do projeto e as evidências das decisões tomadas.

## 2. Linha do tempo do projeto

| Etapa   | Início  | Fim     | Duração | Status   |
| ------- | ------- | ------- | ------- | -------- |
| [Etapa] | [HH:mm] | [HH:mm] | --      | [Status] |

**Tempo total efetivo:** [HH:MM]  
**Etapas concluídas:** [0/n]

> Os horários representam o tempo efetivamente
> dedicado ao projeto, não o tempo decorrido
> entre o primeiro e o último dia.

## 3. Ferramentas utilizadas

| Ferramenta  | Finalidade                                                                    | Etapas |
| ----------- | ----------------------------------------------------------------------------- | ------ |
| Claude Code | Revisão do workspace e da submissão (PL-001); fluxo de commit seguro (PL-002) | 00     |
| ChatGPT     | Desenho do template do Process Log                                            | 00     |

## 4. Registro detalhado por etapa

### Etapa 00 - Setup

#### Controle da etapa

**Status:** Finalizada

**Início:** 14/10/2026 — 12:55  
**Intervalo:** 14/10/2026 — 14:00 às 18:00 (trabalho intercalado, em micropausas)  
**Fim:** 14/10/2026 — 19:30  
**Duração efetiva:** ≥ 02:35 (12:55–14:00 e 18:00–19:30), mais as micropausas entre 14:00 e 18:00, que não foram cronometradas

#### Objetivo

Preparar o workspace da submissão: fork, branch, estrutura de pastas e templates de documentação, deixando o ambiente pronto para iniciar a construção da solução.

#### Atividades realizadas

- [x] Fork, clone (12:55) e criação da branch `submission/alice-dantas` (12:57)
- [x] Leitura do README do repositório, do guia de submissão e do CONTRIBUTING
- [x] Desenho e adaptação do template do Process Log
- [x] Estrutura de pastas e READMEs da submissão (pastas criadas entre 12:58 e 13:01; ajustes nos READMEs ao longo da tarde)

#### Interações com IA

##### PL-001 — Revisão do workspace antes do primeiro commit

**Data e horário:** 14/10/2026 — 15:40

**Ferramenta:** Claude Code (app desktop, Claude Sonnet 5.5)

**Objetivo:**
Obter uma revisão independente do workspace antes do primeiro commit: estrutura do projeto, riscos de rejeição/desclassificação e qualidade do process log.

**Decomposição do Problema:**

1. Avaliar o projeto como um todo, sem alterar nenhum arquivo.
2. Revisar a pasta `submissions/`, com foco no process log.
3. Emitir um relatório sobre o setup do workspace.

Restrição definida no prompt: a IA apenas revisa e reporta, sem alterar código.

**Prompt / Interação:**

> Avalie o projeto como um todo, sem fazer nenhuma alteracao e em seguida faca uma revisao honesta na pasta submissions, especialmente no process log, fornecendo um parecer sobre a configuracao do workspace. Voce esta PROIBIDO de alterar codigo. Seu papel eh revisao e relatorio

**Resposta obtida:**
Parecer de que o workspace ainda não estava pronto para o primeiro commit. Principais pontos apontados:

- o `.gitignore` do repositório oficial ignora `submissions/`, então `git add .` não inclui a submissão (é necessário `git add -f`);
- o README do challenge não tinha as seções Setup e Lógica de Scoring exigidas pelo brief.

**Minha análise:**
Avaliei o parecer e acompanhei os ajustes com novas rodadas de verificação da pasta `submissions/`. Entre os pontos levantados, acrescentei ao template o campo "Decomposição do Problema" e as seções "Setup" e "Lógica de Scoring" ao README do challenge.

**Decisão:**

- Incluir o campo "Decomposição do Problema" em cada interação (PL) do template do process log.
- Adicionar as seções "Setup" e "Lógica de Scoring" ao README do challenge.

Base nos documentos do desafio: o guia de submissão pede que o process log mostre como o problema foi decomposto antes de promptar, e o brief do Challenge 003 exige Setup, Lógica e Limitações na documentação.

**Resultado e validação:**
Ajustes aplicados no `PROCESS_LOG.md` e no `README.md` do challenge. Confirmei com duas novas rodadas de revisão da pasta `submissions/` (≈16:26 e ≈16:40), que verificaram numeração, níveis de heading, links e presença das novas seções, além de checagem por `git status` e `git diff` de que nenhum arquivo rastreado foi alterado.

**Evidências:**

- Ainda não há evidências salvas (export da conversa e screenshots); pendente de anexar em `process-log/`.

##### PL-002 — Fluxo de commit seguro para a pasta da submissão

**Data e horário:** 14/10/2026 — ≈18:00

**Ferramenta:** Claude Code (app desktop, Claude Sonnet 5.5)

**Objetivo:**
Definir um fluxo de commit que mantenha o meu trabalho rastreável mesmo com `submissions/` no `.gitignore` do repositório, sem alterar nada fora da pasta da submissão e com verificações para que arquivos que devem ficar ignorados (lixo do sistema, segredos, dados) não sejam commitados.

**Decomposição do Problema:**

1. Partir do achado do PL-001: o `.gitignore` ignora `submissions/`, então `git add .` não inclui a submissão.
2. Entender o alcance do `git add -f`: se ele também adicionaria arquivos ignorados indesejados, como o `.DS_Store`.
3. Pedir um fluxo completo e reutilizável, com verificação de segurança antes de cada commit.
4. Avaliar se a forma de entrega (script automático ou comandos manuais) é algo que eu consigo executar e verificar.

**Prompt / Interação:**

Dúvida inicial:

> duvida sobre o git igore: usando a flag -f, todos os arquivos e pastas ignorados vao ser adicionados? inclusive o DS?

Pedido do fluxo:

> me informe o fluxo de commit completo que eu preciso utilizar sempre que for commitar uma alteracao na pasta submissions, com verificacao de seguranca para arquivos que devem ser ignorados

Redirecionamento depois da primeira resposta:

> Em vez do script, nao seria melhor ter um fluxo de comandos que eu executo e verifico pelo terminal?

**Resposta obtida:**
Sobre a dúvida inicial: o `-f` adiciona tudo o que estiver ignorado sob o caminho informado, inclusive `.DS_Store` e `datasets/`. Para o pedido do fluxo, primeiro veio um script (`.git/submit.sh`) com hook de pré-commit que automatizava as verificações: branch, arquivos fora da pasta, lixo conhecido, limite de 1 MB, padrões de segredos e confirmação antes do commit. Depois do redirecionamento, veio um fluxo manual de comandos: conferir a branch, procurar lixo e arquivos grandes, `git add -f` só na pasta, revisar o staging (arquivos fora da pasta e possíveis segredos), commitar, conferir o diff do PR contra `origin/main` e enviar com `git push -u`.

**Minha análise:**
Questionei a necessidade do script e preferi comandos que eu executo e confiro no terminal, por ser mais transparente e não depender de um arquivo extra dentro de `.git/`. Perguntei também o que `core.quotepath=false` e `diff --cached` fazem, e se arquivos dentro de `.git/` subiriam com o repositório ou contariam como alteração do projeto (resposta: não, `.git/` é metadado local e nunca vai para o PR). Adaptei o fluxo e o organizei em 10 etapas comentadas em `docs/commit-flow.md`. Depois de uma revisão do fluxo com o Claude Code, apliquei três ajustes: filtro de arquivos indesejados dentro da pasta (etapa 5), mais itens no `find` da etapa 2 (`.vscode`, `.idea`, `_internal`, `Thumbs.db`) e `core.whitespace=-trailing-space` no `--check`, que acusava como erro os dois espaços finais usados como quebra de linha no Markdown.

**Decisão:**

- Adotar um fluxo manual de comandos, executado e verificado por mim no terminal, em vez do script automático.
- Usar `git add -f` restrito a `submissions/alice-dantas/`, sem alterar o `.gitignore`.
- Documentar o fluxo em `docs/commit-flow.md` e registrá-lo como DEC 001 no README raiz.

Base: o CONTRIBUTING rejeita PRs que alteram arquivos fora da pasta da submissão, e editar o `.gitignore` seria uma alteração fora dela.

**Resultado e validação:**
O fluxo foi validado por simulação com o Claude Code: sintaxe do bloco (`bash -n`), simulação `git add -n -f` na pasta real (5 arquivos, sem lixo e sem arquivo acima de 1 MB) e teste dos comandos em um repositório descartável, onde o `:(exclude)` acusou um arquivo fora da pasta e o filtro de lixo acusou um `.DS_Store` plantado. A execução real, até o commit, é o próximo passo e ainda não foi feita.

**Evidências:**

- Arquivo produzido: `submissions/alice-dantas/docs/commit-flow.md`.
- Decisão registrada como DEC 001 em `submissions/alice-dantas/README.md`.
- Ainda não há export da conversa nem screenshots; pendente de anexar em `process-log/`.

#### Encerramento da etapa

**Principais descobertas:**

- Nenhuma descoberta relevante registrada nesta etapa.

**Decisões tomadas:**

- Incluir o campo "Decomposição do Problema" nas interações com IA do template.
- Adicionar as seções "Setup" e "Lógica de Scoring" ao README do challenge.
- Adotar um fluxo manual de commit, executado e verificado por mim no terminal, em vez de script automático.
- Usar `git add -f` restrito a `submissions/alice-dantas/`, sem alterar o `.gitignore`.
- Documentar o fluxo em `docs/commit-flow.md` e registrá-lo como DEC 001 no README raiz.

**Entregáveis produzidos:**

- Estrutura `submissions/alice-dantas/` com README raiz da submissão (conteúdo ainda em placeholder).
- Pasta `challenge-003-lead-scorer/` com `README.md`, `process-log/PROCESS_LOG.md` e a pasta `solution/` (com `.gitkeep`).
- `submissions/alice-dantas/docs/commit-flow.md`: fluxo de commit seguro (DEC 001).

**Pendências:**

- Preencher o README raiz e o README do challenge (hoje em placeholder).
- Salvar as evidências do PL-001 (export da conversa e screenshots) em `process-log/`.

**Critério para avançar:**
Scaffold commitado na branch `submission/alice-dantas`.

**Status final:** Finalizada

---

### Etapa X - [Nome da etapa]

#### Controle da etapa

**Status:** Em andamento / Concluída

**Início:** [DD/MM/AAAA — HH:MM]  
**Fim:** [DD/MM/AAAA — HH:MM]  
**Duração efetiva:** [HH:MM]

#### Objetivo

[Objetivo da etapa]

#### Atividades realizadas

- [ ] [Item]

#### Interações com IA

##### PL-001 — [Título]

**Data e horário:** [DD/MM/AAAA — HH:MM]

**Ferramenta:** [Nome]

**Objetivo:**
[O que precisava resolver?]

**Decomposição do Problema:**
[Quais passos vou adotar na resolução do problema]

**Prompt / Interação:**
[Prompt ou referência à conversa]

**Resposta obtida:**
[O que a IA sugeriu ou produziu?]

**Minha análise:**
[O que verifiquei, questionei ou acrescentei?]

**Decisão:**
[O que decidi fazer e por quê?]

**Resultado e validação:**
[O que aconteceu? Como confirmei?]

**Evidências:**

- [Chat exportado]
- [Screenshot]
- [Commit, se aplicável]

#### Encerramento da etapa

**Principais descobertas:**

- [...]

**Decisões tomadas:**

- [...]

**Entregáveis produzidos:**

- [...]

**Pendências:**

- [...]

**Critério para avançar:**
[O que ficou definido para começar a próxima etapa?]

**Status final:** Concluída / Parcial

---

## 5. Principais decisões independentes

1. [Decisão e impacto]

## 6. Erros e limitações

- **Etapa 00 — pasta `.claude/` criada na raiz do repositório pelo Claude Code.** Efeito colateral das permissões aprovadas durante a sessão de revisão: o arquivo `.claude/settings.local.json` apareceu fora de `submissions/`, o que violaria a regra do CONTRIBUTING (PRs que alteram arquivos fora da pasta da submissão são rejeitados) se fosse commitado. Foi identificado antes de qualquer commit, nunca esteve rastreado pelo git e a pasta foi removida.
- [Limitação ainda existente]

## 7. Reflexão final

**Onde a IA mais ajudou:**
[Resposta]

**Onde meu julgamento fez diferença:**
[Resposta]

**O que faria diferente em uma próxima versão:**
[Resposta]

## 8. Resumo final de execução

| Indicador                         | Resultado          |
| --------------------------------- | ------------------ |
| Início do Setup                   | 14/10/2026 — 12:55 |
| Início do projeto                 | Pendente           |
| Conclusão                         | Pendente           |
| Tempo efetivo total               | [HH:MM]            |
| Etapas concluídas                 | [X/n]              |
| Interações com IA documentadas    | [X]                |
| Decisões estratégicas registradas | [X]                |
| Commits realizados                | [X]                |
| Testes executados                 | [X]                |

### Entregáveis finais

- [ ] [Item]

### Resultado final

[Resumo objetivo da solução entregue, do que foi efetivamente validado e das limitações.]
