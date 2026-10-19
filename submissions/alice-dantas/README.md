# Submissão — Maria Alice Dantas — Challenge 003

## Sobre mim

- **Nome:** Maria Alice Dantas
- **LinkedIn:** [Alice Dantas](https://www.linkedin.com/in/alice-dfl/)
- **Challenge escolhido:** 003 — Lead Scorer (Vendas / RevOps)

---

## Executive Summary

Construí o **Rankio**, uma ferramenta de priorização de oportunidades comerciais. A ideia é que o vendedor abra o sistema na segunda de manhã, escolha a primeira oportunidade da lista e trabalhe nela. Cada item da listagem possui o motivo da sua posição em palavras simples, evidenciando também o que os dados não foram capazes de fornecer. Auditei os 8.800 registros do CRM e descobri que produto, vendedor e conta não determinam potencial de fechamento (AUC perto de 0,5). Por isso, o Rankio não inventa uma "nota de score": ele ordena por regras declaradas e diz com franqueza o que a base não é capaz de determinar, pelas limitações dos dados. 

Uma consequência da ausência de dados detalhados de negociação é que algumas oportunidades ficam empatadas na listagem. Para resolver esse problema, criei um sistema de priorização assistida, no qual **o vendedor seleciona algumas oportunidades, responde a 7 perguntas rápidas sobre a negociação de cada uma**, e a partir disso o score é realizado e os deals são reorganizados.

Para garantir o cumprimento do briefing, **seis personas simuladas testaram a ferramenta** e apontaram o que corrigir antes de ela chegar a um vendedor de verdade.

---

## Solução

O Rankio responde, em uma tela, à pergunta que a Head de RevOps fez no briefing: **"como priorizar os deals?"**

| O que a Head de RevOps pediu | O que o Rankio entrega |
| --- | --- |
| "Gastam tempo demais em deals que não vão fechar" | As 1.291 abertas acima de 138 dias (a venda mais longa já fechada) ficam separadas em **Confirmar**, com a ação "verifique no CRM se ainda está ativa". O vendedor deixa de tratá-las como carteira viva. |
| "Deixam oportunidades boas esfriar" | **Focar** reúne as abertas dentro do tempo em que 90% das vendas ganhas fecharam (até 106 dias), e **Acompanhar** as que já passaram disso. A idade aparece em cada linha. |
| "Não um modelo no Jupyter que ninguém vai usar" | Uma aplicação que roda: Front-end em Next.js, API em FastAPI. |
| "Quero que o vendedor abra, veja o pipeline e saiba onde focar" | A primeira tela é a carteira do vendedor. Ele escolher o nome, ve o cartão **"O que verificar agora"** e abre qualquer posição para ler **"Por que está aqui"**, em cerca de 1 minuto. |

### Por que isso resolve o desafio 003

| Requisito do briefing | Como o Rankio atende | Onde ver |
| --- | --- | --- |
| Precisa **rodar** | Núcleo Python, CLI, API FastAPI e tela Next.js; 220 testes de back e 248 de front passam | [Como rodar](#como-rodar) |
| Usar os **dados reais** | As 4 tabelas do CRM, 8.800 linhas após cada junção, 2.089 abertas | `check-data` |
| **Lógica de priorização**, não só valor | 5 grupos pela idade da negociação, ordem declarada dentro de cada um e desempate pelo vendedor | [Como a lista é montada](#como-a-lista-é-montada) |
| O vendedor entende o **porquê** | Dois motivos por oportunidade (o grupo e a posição), com os números que decidiram e o que o sistema não vê | Painel "Por que está aqui" |
| Filtro por vendedor, gerente e região (bônus) | Carteira por vendedor; Equipe com filtros de gerente e escritório, que se restringem entre si | Página Equipe |

As **cinco páginas** do Rankio, cada uma com a pergunta que responde:

| Página | Para quem | Pergunta |
| --- | --- | --- |
| Carteira | Vendedor | Qual é o meu próximo passo? |
| Equipe | Gestor e Head de RevOps | Como a equipe está distribuida? |
| Inteligência | Head de RevOps | Onde o processo pode melhorar? |
| Evidência | Head de RevOps | A lista ajuda a escolher onde investir? |
| Como funciona | Todos | Como a lista é montada? |

### Duas decisões que mudam o jogo

#### 1. Desempate com o que só o vendedor sabe (priorização assistida)

**O problema.** A Darcel Schlecht tem 194 abertas e **13 delas empatadas** em GTX Plus Pro, valor de tabela 5.482. A base não tem atividade, estágio nem contato para separá-las, e qualquer ordem que o sistema escolhesse seria só o código do ID. Os dados têm um buraco, e a pergunta "por qual eu começo?" ficaria sem resposta.

**A saída.** Em vez de fingir que o dado existe, o Rankio **pergunta a quem sabe**. O vendedor escolhe de 2 a 5 oportunidades empatadas e responde 7 perguntas curtas, sempre com **"Não sei"** disponível:

| Pergunta | Peso |
| --- | --- |
| O cliente demonstrou interesse ou respondeu recentemente? | 20 |
| O cliente informou quando pretende decidir? | 20 |
| O cliente confirmou qual problema quer resolver? | 15 |
| Existe uma razão concreta para comprar em breve? | 15 |
| O cliente indicou orçamento ou aprovação? | 15 |
| Você sabe quem decide e tem acesso? | 10 |
| Existe uma próxima ação combinada? | 5 |

O resultado é uma ordem por **pontos de qualificação declarada (0 a 100)**, com a quebra por pergunta, o que ainda falta saber e **o que fazer agora** com cada oportunidade ("Definir continuidade", "Verificar o compromisso", "Investigar primeiro"…).

Um exemplo ilustrativo (respostas inventadas, só para mostrar a conta):

| Oportunidade | Pontos confirmados | Até onde iria | O que o Rankio diz |
| --- | --- | --- | --- |
| A (tudo confirmado) | 100 | 100 | Primeira da lista |
| B (3 respostas "Não sei") | 47 | 87 | Segunda, com a faixa 47 a 87 visível |
| C (necessidade ainda em investigação) | 27 | 27 | Terceira |
| D (tudo "Não sei") | 0 | 100 | **À parte, sem posição:** "investigar primeiro" |

O que cuida para esse número não enganar:
- **"Não sei" vale 0 ponto confirmado, mas não é um "não".** A tela mostra a faixa, até onde a pontuação iria se o que se desconhece se confirmasse.
- **Nada é gravado no servidor.** As respostas ficam só no navegador do vendedor.
- **É uma camada declarada, separada do scoring** ([ADR-010](./docs/architecture.md#adr-010)). A ordem oficial da Carteira não muda.
- **Nunca aparece como chance de fechar.** Sem porcentagem, sem cor de temperatura, com o aviso fixo "pesos iniciais, a validar".

#### 2. Personas simuladas para validar a entrega

**O problema.** Eu não tinha 35 vendedores à mão para testar a ferramenta antes de entregar. E o risco de quem constrói é achar tudo claro porque conhece tudo.

**A saída.** Montei um teste com **seis agentes de IA independentes**, um por vez, cada um com papel e missão próprios, usando o Rankio no navegador. Os agentes não tinham acesso a **ver código, documentos nem o relato dos outros**:

| Persona | O que testou |
| --- | --- |
| Boris Faz, vendedor iniciante | "O que eu faço na segunda?" |
| Kary Hendrixson, vendedora experiente | A ordem faz sentido ou é o que eu já faria sozinha? |
| Darcel Schlecht, vendedora sobrecarregada | Uma carteira sem nenhuma oportunidade em Focar |
| Melvin Marxen, gerente regional | A visão da equipe serve para a reunião de segunda? |
| Head de RevOps | Dá para decidir um piloto? Os números se leem? |
| Diretor comercial | O que isso diz sobre vender mais? |

**O que saiu.** Os seis chegaram sozinhos ao painel "Por que está aqui" em cerca de 1 minuto e os seis fecharam em **"resolve parcialmente"**, com críticas específicas. Foi o relato da Darcel que deu origem à priorização assistida. Por causa dos relatos, mudei:
- empates sem falsa ordem: "2 oportunidades empatadas: sem ordem entre si";
- carteira sem Focar com orientação própria, e vendedor sem abertas com explicação;
- "Confirmar é limpar a carteira, não prever venda", e "Focar é sobre o tempo aberta, não sobre a chance de fechar";
- a ordem dos grupos (Qualificar antes de Acompanhar e Confirmar, contrato v7);
- o botão "O que significa cada grupo?", busca e filtros na Carteira;
- linguagem de negócio na Inteligência, no lugar de "faixa provável", "acaso" e percentuais negativos.

**O limite, dito com todas as letras.** São personas simuladas pelo mesmo modelo que ajudou a construir a ferramenta. Elas acharam problemas reais, mas **não são evidência de usuários**. A rodada com 5 vendedores reais está desenhada em [validacao-priorizacao-assistida.md](./docs/validacao-priorizacao-assistida.md) e ainda não foi feita. Os relatos completos estão em [docs/testes-personas](./docs/testes-personas/).

### Como rodar

**Requisitos:** Python 3.9 ou superior e Node 22.12 ou superior. Sem banco, sem segredo e sem LLM.

**Dados:** os CSVs não estão no repositório (o dataset é CC0). Baixe o [CRM Sales Predictive Analytics](https://www.kaggle.com/datasets/agungpambudi/crm-sales-predictive-analytics) no Kaggle e copie `sales_pipeline.csv`, `products.csv`, `sales_teams.csv` e `accounts.csv` para `solution/data/raw/`.

**Comandos** (a partir da raiz desta pasta; no Windows, troque `.venv/bin/` por `.venv\Scripts\`):

```bash
cd solution
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m leadscorer check-data                    # confere arquivos, hash e junções
.venv/bin/pytest                                             # testes do back
.venv/bin/python -m leadscorer list --seller "Zane Levy"     # a lista de um vendedor, sem Node
.venv/bin/python -m leadscorer explain --id 01XZ9CRY         # "Por que está aqui"
.venv/bin/uvicorn api.main:app --port 8000                   # API (deixe rodando; contrato em /docs)
```

Em outro terminal, para a tela:

```bash
cd solution/web
npm ci && npm run dev                                        # tela em http://localhost:3000
npm run typecheck && npm test                                # testes do front, sem a API no ar
```

**O que você deve ver:** `check-data` mostra 8.800 linhas após cada junção, hash 4 de 4 igual ao auditado e 2.089 abertas. Sem os CSVs, todos os comandos param com uma mensagem que diz qual arquivo falta e onde baixá-lo.

**Roteiro de 2 minutos:**
1. Abra `localhost:3000` e escolha **Zane Levy**. O cartão "O que verificar agora" mostra 2 oportunidades empatadas no topo (`01XZ9CRY` e `FZWU2I30`, GTX Plus Pro de 5.482).
2. Abra `01XZ9CRY`: "aberta há 104 dias; 90% das vendas ganhas fecharam em até 106 dias", o valor de tabela e o que o sistema não vê.
3. Troque para **Darcel Schlecht**. Ela não tem nenhuma em Focar, então a tela abre em Qualificar, com 13 oportunidades empatadas no topo.
4. Clique em **Avaliar estas oportunidades**, escolha 2 ou 3, responda as perguntas e veja a ordem por pontos.
5. Em **Evidência** e **Inteligência**, veja o que a base permite afirmar e o que não permite.

Todo o detalhe técnico (camadas, contrato, API, política completa, verificação e desvios do plano) está em [docs/referencia-tecnica.md](./docs/referencia-tecnica.md).

### Como a lista é montada

A auditoria mostrou que o único sinal legítimo nos dados é **há quanto tempo a negociação está aberta**. O sinal mais forte que o dataset oferece, o mês de fechamento, é vazamento: só existe depois do resultado. Por isso o Rankio **não calcula probabilidade nem nota**: classifica e ordena por regras declaradas ([ADR-001](./docs/architecture.md#adr-001)).

| Grupo | Quem entra | Com os dados auditados |
| --- | --- | --- |
| **Focar** | Em andamento, abertas há até 106 dias (o tempo em que 90% das vendas ganhas fecharam) | 157 |
| **Qualificar** | Em prospecção, sem data de início | 500 |
| **Acompanhar** | Em andamento, acima de 106 e até 138 dias | 141 |
| **Confirmar** | Em andamento, acima de 138 dias (a idade não prova que o negócio terminou) | 1.291 |
| **Completar** | Falta produto, preço ou data; o item diz o que corrigir | 0 |

Dentro de cada grupo: faixa de valor de tabela, depois preço de tabela, depois ID só para a ordem ser estável. A idade aparece, mas não muda a ordem. Oportunidades do mesmo grupo e produto são **empate** e aparecem agrupadas, sem numerar uma como melhor. Cada oportunidade tem exatamente **dois motivos**, os que decidiram, e o texto é escrito a partir de códigos que um teste reconstrói para as 2.089 abertas.

### Abordagem

Entendi o problema antes de abrir qualquer ferramenta, e o que decidi em cada etapa está registrado no [process log](./process-log/PROCESS_LOG.md):

| Etapa | O que fiz | O que saiu |
| --- | --- | --- |
| Discovery e domínio | Tratei o briefing como percepção a validar, não como fato | Mapas de decisão e hipóteses ([discovery.md](./docs/discovery.md)) |
| Auditoria dos dados | Procurei o que separa quem ganha de quem perde | Só a idade sustenta; produto, vendedor e conta não ([data-audit.md](./docs/data-audit.md)) |
| Arquitetura | Três agentes propuseram ADRs; contestei a convergência e escolhi FastAPI + Next.js contra a recomendação deles | ADR-001 a 003 ([architecture.md](./docs/architecture.md)) |
| PRD e teste de mesa | Exigi o teste de mesa antes de codar | Três lacunas corrigidas antes de qualquer código ([prd.md](./docs/prd.md)) |
| Construção | Núcleo, explicações, API, tela e backtest em ciclos curtos | Contrato orientado a dados: o back decide, a tela escreve ([ADR-004](./docs/architecture.md#adr-004)) |
| Validação e iteração | Backtest em 7 cortes temporais; só adotei a regra de idade depois de pedir incerteza e pior caso | Regra A e a página Evidência ([ADR-006](./docs/architecture.md#adr-006)) |
| Personas | Seis agentes isolados usaram a ferramenta | Relatos e problemas priorizados ([consolidação](./docs/testes-personas/00-consolidacao.md)) |
| Correção e priorização assistida | Corrigi o que as personas apontaram e fechei a lacuna dos empates | Contrato v7 e ADR-010 |

### Resultados / Findings

**A solução foi verificada:**

| O que foi verificado | Resultado |
| --- | --- |
| Testes | `pytest`: 220 passam. `vitest`: 248 passam. `tsc` sem erros |
| Reconciliação | 8.800 linhas após cada junção; 2.089 abertas = 157 + 141 + 1.291 + 500 + 0 |
| Explicações | Nas 2.089, exatamente dois motivos; um teste reconstrói o grupo e a ordem só a partir deles |
| Paridade | CLI, API e tela entregam a mesma lista para os 35 vendedores |
| Vocabulário | Nenhum termo proibido ("probabilidade", "prazo", "perdida", "score"…) nos textos da tela e da CLI, conferido por teste |
| Setup | Venv novo, `check-data`, `pytest`, `npm ci`, `vitest` e a tela abrindo, repetidos do zero antes desta entrega |

**O que os dados dizem:**
- **Produto, vendedor, conta, setor e região não separam quem ganha** (AUC entre 0,48 e 0,51). O que separa é a idade, e só por causa das negociações que nunca recebem desfecho na base.
- **O pipeline tem um problema que a ferramenta expõe:** 1.291 das 1.589 negociações em andamento estão abertas há mais tempo do que qualquer venda já fechada; 1.425 das 2.089 abertas (68%) não têm cliente registrado; 5 dos 35 vendedores não têm nenhuma oportunidade.
- **A taxa de ganho (63,2%) não muda além do acaso em nenhum recorte:** a diferença de receita entre vendedores vem do volume e do mix, não da conversão.

**Backtest temporal** (7 cortes, a lista de cada vendedor limitada às 10 primeiras, desfecho em 90 dias; [relatório](./solution/data/processed/backtest_report.md)):

| Ordenação | Valor ganho capturado nas 10 primeiras |
| --- | --- |
| **Regra do Rankio** | **58,4%** |
| Só valor de tabela | 53,8% |
| Aleatório | 23,2% |

A leitura honesta: a regra supera o acaso com folga e fica 4,6 pontos acima de "só valor de tabela". **Mas essa vantagem vem das negociações que nunca fecham.** Sem elas, "só valor de tabela" fica 1,0 ponto à frente. A página Evidência mostra isso, e a regra A foi adotada por perder menos no pior caso, não por ganhar sempre. Valor capturado não é efeito causal: só um piloto com controle mostra o efeito de trabalhar a lista.

**O que as personas mostraram:** os seis concluíram a navegação sem ajuda e entenderam o núcleo do modelo (grupo pela idade, posição pelo preço de catálogo, e o que a ferramenta não vê). Em geral, disseram que a ferramenta ajuda a organizar a carteira e a limpar o pipeline, mas que não substitui saber qual cliente está quente. A Head de RevOps simulada **aprovaria um piloto controlado**, com grupo de controle, medição de uso e faxina prévia das abertas antigas.

### Recomendações

Em ordem de prioridade:
1. **Piloto com grupo de controle.** Parte do time usa a lista, parte não, com a métrica definida antes (valor ganho, conversão, tempo até a primeira ação em Focar). Dizer ao piloto que a regra rende 4,6 pontos sobre "só valor de tabela" e perde 1,0 sem as negociações que nunca fecham: o piloto existe para descobrir se a idade acrescenta algo.
2. **Faxina das 1.291 abertas acima de 138 dias**, confirmando ou encerrando no CRM antes do piloto. Sem isso, a maior parte da lista que o vendedor vê é "Confirmar".
3. **Cadastro:** cliente obrigatório e data de início da negociação. Hoje 68% das abertas não têm cliente.
4. **Rodar a priorização assistida com 5 vendedores reais** e ajustar os pesos com o que eles disserem. Os pesos de hoje são hipóteses.
5. **Registrar atividade e mudança de estágio no CRM.** Sem isso, nenhuma ferramenta detecta esfriamento.
6. **Medir uso sem ranquear pessoas** (quem abriu a carteira e o painel), para a Head saber se a ferramenta está sendo usada.

### Limitações

- **Não prevê quem vai fechar.** Com os campos disponíveis, só a idade separa os grupos, e só por causa das negociações sem desfecho na base. A ferramenta não dá chance por oportunidade.
- **Não comprova ganho de resultado.** O ganho sobre "só valor de tabela" é pequeno e depende de um recorte; só um piloto com controle mede efeito.
- **Não detecta esfriamento nem sugere reativação:** o dataset não tem atividade nem histórico de estágio.
- **Só lê o CRM.** Não escreve nele, não registra uso e não tem login: serve um usuário, com os CSVs em memória.
- **Dados até 31/12/2017.** A data de referência é premissa, porque a data de extração é desconhecida. Sem dados novos, o Focar esvazia rápido. O dataset é provavelmente sintético: não generalizar para uma empresa real.
- **Priorização assistida:** pesos e pontos são hipóteses, as respostas ficam só no navegador (outro navegador não as vê, limpar os dados as apaga) e "Avaliada em" usa o relógio real, enquanto "hoje" nas regras é 31/12/2017.
- **Personas simuladas:** foram feitas pelo mesmo modelo, e o teste de compreensão com 3 a 5 pessoas não técnicas ainda não aconteceu.
- **A ordem dos grupos** (Qualificar antes de Acompanhar) é decisão de produto, não evidência: Qualificar não tem desfecho na base e fica fora do backtest.

**Para escalar:** fonte viva (API do CRM) no lugar do CSV; registro de ações do vendedor; log de atividade; validação da política com a RevOps; autenticação e banco se houver escrita; e o piloto com controle antes de afirmar qualquer efeito.

---

## Process Log — Como usei IA

> O registro completo, etapa por etapa, com cada prompt, decisão e erro, está em [process-log/PROCESS_LOG.md](./process-log/PROCESS_LOG.md).

### Ferramentas usadas

| Ferramenta | Para que usei |
| --- | --- |
| Claude Code | Discovery, auditoria dos dados, ADRs, PRD, construção do back, da API e da tela, backtest, testes, correção pelas personas e priorização assistida |
| Subagentes do Claude Code (Plan e Explore) | Três propostas independentes de arquitetura (lentes de arquiteto, de engenharia de entrega e de revisor); mapeamentos de código e dados |
| Subagentes do Claude Code (general-purpose) | **As seis personas** que usaram o Rankio no navegador |
| Navegador do app Claude Code | Ensaio das jornadas, conferência em 375, 768 e 1280 px nos dois temas e medição de contraste |
| Busca na web | Técnicas de scoring em vendas, incerteza e calibração |
| ChatGPT | Desenho do template do process log e otimização de prompts |

### Workflow

1. **Setup (etapa 00):** revisei o workspace e defini o fluxo de commit seguro ([commit-flow.md](./docs/commit-flow.md)).
2. **Business Discovery e Domain & Value (01 e 02):** transformei o briefing em problema, decisões de cada papel e hipóteses.
3. **Data Discovery (03):** auditei os dados com a IA e questionei cada definição ("Lost" não é "limpeza de CRM").
4. **Prioritization e Baseline & Architecture (04 e 05):** matriz de oportunidades, pesquisa e três propostas de ADR; escolhi regras em vez de ML.
5. **MVP Definition (06):** PRD e teste de mesa antes de qualquer código.
6. **Development (07):** núcleo, explicações, API e tela em quatro especificações, com backtest temporal.
7. **Validation & Iteration (08):** contrato orientado a dados, o Rankio com design system, a regra A e a Inteligência comercial.
8. **Validation com personas (09):** seis agentes isolados usaram a ferramenta e consolidei os achados.
9. **Correção e priorização assistida (10):** avaliei cada relato, corrigi o que era texto e apresentação e desenhei a camada em que o vendedor desempata.
10. **Delivery (11):** reorganização da pasta no formato do guia e este README.

### Onde a IA errou e como corrigi

- **Auditoria dos dados:** a IA errou um percentual (81,3% em vez de 81,2%), pôs a sonda de vazamento no mês errado do trimestre e afirmou coisas sobre AUC sem sustentação. A revisão cética pegou, e corrigi antes de entregar.
- **Texto de tela dentro do núcleo:** a IA defendeu escrever as frases no back. Corrigi a fronteira: o back decide, a tela escreve ([ADR-004](./docs/architecture.md#adr-004)).
- **Métrica trocada no meio do caminho:** a IA mudou o cálculo de Val@10 entre rodadas (de média por corte para razão agregada). A comparação entre regras não mudou, mas os números mudaram, e registrei isso.
- **"Nenhuma foi ganha acima de 138 dias":** a frase sugeria perda. Corrigi para "sem desfecho registrado", porque a base não diz que foram perdidas.
- **Propostas que presumiam dado inexistente:** para a Persona 1, a IA sugeriu "retome o contato" e "está a N dias do limite", presumindo atividade e urgência que a base não registra. Apontei, e ela retirou as quatro propostas.
- **Pesos que somavam 110:** a tabela de pesos do meu próprio prompt dizia "Total 100". A IA pegou a soma e reduzi Urgência de 25 para 15.
- **Perguntas com jargão:** a IA fez perguntas de produto que eu não entendi três vezes seguidas. Mandei refazer do zero, com exemplos.
- **Relatos de persona de uma tela que já mudou:** quatro relatos repetiam queixas já resolvidas; a IA precisou conferir o código antes de propor qualquer mudança.

### O que eu adicionei que a IA sozinha não faria

- **Contestei a IA nas decisões que mais pesaram:** mantive FastAPI + Next.js contra a recomendação dos três agentes; tirei a idade da ordenação; recusei "Lost = limpeza de CRM"; recusei o gatilho de 2 horas para cortar escopo.
- **Exigi evidência antes de aprovar a regra A:** pedi incerteza, sensibilidade e a separação entre o que está comprovado e o que é hipótese. O ganho foi rebaixado para "ajuste de coerência", e a dependência das negociações sem desfecho virou veredito visível na Evidência.
- **Recusei a nota.** Aceitei a objeção da IA à barra de 10 a 100 e mantive "score" fora do vocabulário, porque a Head já tinha lido o valor de tabela como "nota".
- **Transformei o buraco dos dados em recurso do produto:** troquei as 3 perguntas orientativas que a IA propôs pela priorização assistida, em que o vendedor responde e o Rankio ordena. Exigi que "nada seja gravado no backend", propus pontos por resposta no lugar do ranking por camadas e escolhi os pesos.
- **Desenhei o teste com personas para ele valer algo:** personas isoladas, sem roteiro de telas, e opinião simulada tratada como não evidência. Pedi que o coordenador separasse "concluiu a tarefa" de "tomou a decisão certa" e "navegou" de "resolveu a dor".
- **Decidi como o projeto trataria o repositório:** `submissions/` está no `.gitignore` e o CONTRIBUTING rejeita PRs que mexem fora da pasta. Defini com a IA um fluxo de commit que mantém o histórico rastreável sem levar CSVs, ambientes virtuais nem segredos ([commit-flow.md](./docs/commit-flow.md)), e exigi aprovação minha antes de cada commit.

---

## Evidências

> **Pendente:** evidências a serem anexadas pela autora (sem export de chat).

- [ ] Screenshots das conversas com IA
- [ ] Screen recording do workflow
- [ ] Chat exports
- [x] Git history (se construiu código): commits por entrega, só em `submissions/alice-dantas/`
- [x] Outro: narrativa em [process-log/PROCESS_LOG.md](./process-log/PROCESS_LOG.md) e relatos das seis personas em [docs/testes-personas](./docs/testes-personas/)

---

_Submissão enviada em: [data]_
