# Referência técnica — Rankio (Challenge 003)

Detalhe técnico da solução: setup completo, camadas, contrato entre back e front, lógica de priorização, verificação, validação offline, limitações e desvios do plano. O [README](../README.md) traz a visão de produto e o caminho mais curto para rodar.

## Setup

**Requisitos:** Python 3.9 ou superior (testado em 3.9.6) e, para a tela e os testes do front, Node 22.12 ou superior (testado em 22.12). Sem banco, sem segredo e sem LLM.

**Dados:** os CSVs não estão no repositório. Baixe o dataset [CRM Sales Predictive Analytics](https://www.kaggle.com/datasets/agungpambudi/crm-sales-predictive-analytics) (CC0) pelo navegador e copie `sales_pipeline.csv`, `products.csv`, `sales_teams.csv` e `accounts.csv` para `solution/data/raw/`. O [README da pasta](../solution/data/raw/README.md) traz o SHA-256 da versão auditada.

**Comandos** (a partir de `solution/`; no Windows, troque `.venv/bin/` por `.venv\Scripts\`):

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m leadscorer check-data                    # arquivos, hash e reconciliação
.venv/bin/pytest                                             # testes
.venv/bin/python -m leadscorer list --seller "Zane Levy"     # lista de um vendedor, sem Node
.venv/bin/python -m leadscorer explain --id 01XZ9CRY         # "Por que está aqui"
.venv/bin/python scripts/backtest.py                         # validação offline (7 cortes); alimenta /api/evidence
.venv/bin/uvicorn api.main:app --port 8000                   # API (deixe rodando; contrato em /docs)
cd web && npm ci && npm run dev                              # tela em http://localhost:3000 (outro terminal)
```

**Testes do front** (em `solution/web/`, sem a API no ar):

- `npm run typecheck` confere os tipos.
- `npm test` roda o Vitest contra respostas sintéticas da API, junto com os testes de contraste dos tokens e da regra "só shadcn".

**Componentes da tela:** os primitivos do shadcn ficam em `web/components/ui/` e entram pela CLI fixada, sem que ela vire dependência:

```bash
cd web && npx shadcn@4.21.1 add <componente>
```

**Quando o contrato da API mudar** (um campo ou código novo em `api/schemas.py` ou `leadscorer/codes.py`), regenere os artefatos que o front usa. Os testes dos dois lados falham se algum deles ficar desatualizado.

```bash
.venv/bin/python scripts/export_openapi.py     # web/contract/openapi.json
.venv/bin/python scripts/export_fixtures.py    # web/tests/fixtures/ (dados sintéticos)
cd web && npm run contract                     # web/lib/contract/ (tipos e validação zod)
```

O que esperar: `check-data` mostra 8.800 linhas após cada junção, 1.480 linhas que se perderiam sem o mapa `GTXPro` → `GTX Pro`, hash 4 de 4 igual ao auditado e 2.089 abertas. Sem os CSVs, todos os comandos param com uma mensagem que diz qual arquivo falta e onde baixá-lo, e o `pytest` pula com aviso os testes que dependem dos dados reais. Os testes do front não precisam dos CSVs.

## Solução

Uma ferramenta de **triagem explicável** da carteira aberta: o vendedor escolhe o próprio nome e vê, em uma ordem única e declarada, o que abrir primeiro, com o motivo de cada posição e o que os dados não sabem. A ferramenta só lê o CRM; a ação acontece no CRM, pelo ID da oportunidade.

| Camada                    | O que faz                                                                                                                                                                                                                                                                                                                                                                      | Onde                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| Núcleo Python (pandas)    | Carga, normalização, estados, ordem e motivos em código; funções puras, sem web e sem texto de tela                                                                                                                                                                                                                                                                            | `solution/leadscorer/` |
| CLI                       | `check-data`, `list --seller` (texto ou `--json`) e `explain --id`; escreve os textos a partir dos códigos (`cli_text.py`) e entrega tudo sem Node                                                                                                                                                                                                                             | `python -m leadscorer` |
| API FastAPI               | `GET /api/meta`, `/api/sellers`, `/api/sellers/{seller}/pipeline`, `/api/pipeline?manager=&office=` (com o resumo por vendedor), `/api/rules` (a política), `/api/evidence` (o backtest), `/api/intelligence` e `/api/intelligence/deals` (a Inteligência comercial); respostas tipadas (pydantic, descritas em `/docs`); erros 404, 422 e 503 com `code`, `params` e `detail` | `solution/api/`        |
| Tela Next.js (TypeScript) | **Rankio**: cinco páginas com menu central (Carteira, Equipe, Inteligência, Evidência e Como funciona), tema claro e escuro. Valida cada resposta contra o contrato e escreve os textos a partir dos códigos (`copy/pt-BR.ts`). Componentes só do shadcn, com tokens próprios ([design-system.md](./design-system.md), [ADR-005](./architecture.md#adr-005))         | `solution/web/`        |

CLI, API e tela consomem **o mesmo payload**, então a lista é idêntica nas três saídas (testado para os 35 vendedores).

**Contrato entre back e front** ([ADR-004](./architecture.md#adr-004)):

- **O back entrega dados e decisões da regra:** o grupo de cada oportunidade, a ordem, os motivos como código com os valores que decidiram (`reasons: [{code, role, params}]`), a ação sugerida (`next_action`) e os números.
- **O front decide como dizer:** nomes, frases, formatação e layout.
- **O mesmo contrato serve aos dois lados:** o schema fica em `web/contract/openapi.json`; o front gera dele os tipos e a validação, e testa contra respostas sintéticas exportadas pelo back.
- **Versão 7 do contrato:** a ordem dos grupos passa a ser Focar, Qualificar, Acompanhar, Confirmar e Completar ([ADR-009](./architecture.md#adr-009)), e a Carteira ganha a orientação de verificação e o contexto da idade ([ADR-008](./architecture.md#adr-008)). A priorização assistida ([ADR-010](./architecture.md#adr-010)) roda só no navegador e não muda o contrato, a API nem a CLI.
- **Versão 6 do contrato:** a Inteligência comercial ([ADR-007](./architecture.md#adr-007)), com duas rotas novas. A versão 5 trouxe a regra A ([ADR-006](./architecture.md#adr-006)), com o grupo Acompanhar, os dois limites de idade e só os motivos que decidem. A versão 4 trouxe a evidência, as regras e o resumo por vendedor. A tela não calcula nenhum número de negócio; o máximo que faz é formatar (fração em %, diferença em pontos).

**As cinco páginas:**

| Página        | Para quem               | Pergunta que responde                                   | O que mostra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | ----------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Carteira      | Vendedor                | Qual é o meu próximo passo?                             | Cartão "O que verificar agora" com a verificação do grupo e o primeiro bloco da ordem (o empate inteiro, sem eleger um ID). Uma aba por grupo, com contagem e definição. Painel "Por que está aqui" com os dois motivos que decidiram (o grupo e a posição) e o que o sistema não vê. Anterior e Próxima percorrem a lista; "Copiar ID" leva ao CRM. O vendedor fica na URL, e o último escolhido volta na próxima visita. **Priorização assistida** (ADR-010): no empate do topo, o botão "Avaliar estas oportunidades" abre um painel em que o vendedor escolhe de 2 a 5, responde 7 perguntas (sempre com "Não sei") e recebe uma ordem por pontos de qualificação declarada, com a explicação e o que fazer agora. Camada separada do scoring: pesos iniciais a validar, respostas só no navegador, nada vai ao servidor |
| Equipe        | Gestor e Head de RevOps | Onde está a carteira da equipe?                         | Filtros de gerente e escritório, cada um restringindo o outro. Os números da carteira, um por grupo, e, abaixo deles, duas abas: "Por vendedor" (em ordem alfabética, ordenável por coluna só para consulta) e "Por oportunidade" (a lista com a coluna Vendedor). Tabelas paginadas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Inteligência  | Head de RevOps          | Onde o processo pode melhorar? O que explica a receita? | No corpo, só números: o histórico (receita ganha, vendas ganhas, taxa de ganho com o intervalo em que ela deve ficar, ciclo), a carteira aberta à parte ("não é receita"), a exploração por produto, vendedor, gerente, escritório, setor, cliente e porte, o mix vendedor × produto e tempo e resultado, com a leitura abaixo de cada tabela e as negociações por trás de cada número. Três botões: "Filtros" (os sete campos num painel, com o recorte ativo em chips), "Ver análises" (diagnósticos do processo com o próximo passo, o que o CRM não registra e as descobertas com o veredito de acaso) e "Como funciona". Pessoas em ordem alfabética, sem gráfico; nada aqui entra na lista                                                                                                                             |
| Evidência     | Head de RevOps          | A lista ajuda a escolher onde investir?                 | Do valor vendido em 90 dias, quanto estava nas 10 primeiras de cada vendedor: regra atual, "só valor de tabela" e o acaso, com a diferença e a margem de erro. Também o recorte sem as negociações que nunca fecham, com a conclusão dele (sem elas, "só valor de tabela" fica à frente), e o que a evidência não mostra. Em **linguagem de negócio** (padrão) ou **técnica** (Val@10, P@10, Lift@10, AUC e IC95%)                                                                                                                                                                                                                                                                                                                                                                                                           |
| Como funciona | Todos                   | Como a lista é montada?                                 | Os cinco grupos, os dois limites de idade, a ordem, as faixas de valor de tabela e o que a ferramenta não faz                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

**Jornada do vendedor (2 minutos):**

1. Abra `localhost:3000` e escolha Zane Levy.
2. O cartão "O que verificar agora" mostra a verificação de Focar e as 2 GTX Plus Pro de 5.482 empatadas no topo: `01XZ9CRY` e `FZWU2I30`.
3. Abaixo, "88 abertas = 13 Focar + 18 Acompanhar + 57 Confirmar + 0 Qualificar + 0 Completar" e as abas.
4. Abra `01XZ9CRY` para ler os dois motivos ("aberta há 104 dias; 90% das vendas ganhas fecharam em até 106 dias") e use "Próxima" para seguir na ordem.
5. Troque para Darcel Schlecht: ela não tem nenhuma em Focar (194 abertas = 111 Qualificar + 83 Confirmar), então abre direto em Qualificar, com a indicação de começar por lá. No topo há 13 oportunidades empatadas (GTX Plus Pro, 5.482): é onde entra a priorização assistida.

**Jornada da Head de RevOps:**

1. Em **Equipe**, veja 2.089 abertas: 157 em Focar (até o tempo em que 90% das vendas ganhas fecharam: não deixar esfriar), 141 em Acompanhar, 1.291 em Confirmar (acima da venda mais longa já fechada: confirmar se seguem) e 500 em Qualificar, além da carteira de cada vendedor.
2. Em **Inteligência**, abra "Ver análises" para ver onde o processo pode melhorar: 1.291 das 1.589 negociações em andamento estão abertas há mais tempo do que qualquer venda já fechada; 1.425 das 2.089 abertas não têm cliente, contra 0 das 6.711 fechadas (o cliente só entra no fechamento); as 500 em prospecção não têm data; 5 dos 35 vendedores não têm nenhuma oportunidade; a entrada de novas negociações caiu para 283 e 121 em novembro e dezembro, contra 864,6 por mês antes. Leia as descobertas: a taxa de ganho (63,2%) não muda além do acaso em nenhum recorte, e a diferença de receita entre vendedores vem do volume (61,5%) e do mix (39,9%), não da conversão.
3. Em **Evidência**, compare a regra atual (58,4% do valor ganho capturado) com ordenar só por valor de tabela (53,8%) e com o acaso (23,2%). Leia também a limitação: sem as negociações que nunca fecham, "só valor de tabela" fica 1,0 ponto à frente.

## Lógica de Scoring

A auditoria mostrou que **produto, vendedor, conta, setor e região não separam quem ganha de quem perde** (AUC entre 0,48 e 0,51 fora do tempo). O único sinal legítimo é **há quanto tempo a negociação está aberta**, e ele aparece só por causa das negociações que nunca recebem desfecho na base (ver Resultados). O sinal mais forte é o mês de fechamento, que é vazamento, porque só existe depois do resultado. Por isso a ferramenta **não calcula probabilidade nem nota**. Ela classifica e ordena por regras declaradas, com o que os dados sustentam ([ADR-001](./architecture.md#adr-001); a regra de grupos é a regra A, [ADR-006](./architecture.md#adr-006)).

**1. Grupo** (cada aberta cai em exatamente um). Dois limites de idade, os dois calculados só com fechadas até o `as_of`:

- **L1:** o piso do P90 do ciclo de todas as vendas ganhas (106 dias). Um número só para todos os produtos.
- **L2:** o maior ciclo já fechado, ganha ou perdida (138 dias).

| Grupo (chave)   | Nome na tela   | Regra                                                                                       | Com os dados auditados |
| --------------- | -------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| `focar`         | **Focar**      | Engaging com idade até L1                                                                   | 157                    |
| `qualificar`    | **Qualificar** | Prospecting (sem data de engajamento, logo sem idade)                                       | 500                    |
| `acompanhar`    | **Acompanhar** | Engaging com idade acima de L1 e até L2                                                     | 141                    |
| `revisar`       | **Confirmar**  | Engaging acima de L2; a idade não prova que o negócio terminou                              | 1.291                  |
| `nao_pontuavel` | **Completar**  | Falta produto, preço ou, em Engaging, a data de engajamento; o item diz qual campo corrigir | 0                      |

Os limites aparecem para o vendedor só como fato do histórico ("90% das vendas ganhas fecharam em até 106 dias"), nunca como prazo: sem contagem regressiva, e "prazo", "vencida", "atrasada" e "parada" estão na lista de termos proibidos.

**2. Ordem dentro do estado:** faixa de valor de tabela (alto ≥ 3.000; médio de 500 a 2.999; baixo < 500) → preço de tabela decrescente → ID, só para a ordem ficar estável. O preço de tabela reproduz o valor fechado com ±20% em 95,9% das vendas ganhas. Dentro de cada grupo, **a idade aparece, mas não muda a ordem**. O produto também não: dentro de cada faixa de idade, a taxa de ganho não difere entre produtos (permutação, p = 0,82), e trocar "preço" por "taxa do produto × preço" não muda nenhuma das 180 listas do backtest. Deals do mesmo grupo e produto são empate e aparecem agrupados.

**3. Explicação:** exatamente dois motivos por oportunidade, os que decidiram.

- **O do grupo:** idade × L1 e L2 (citando só os limites que decidiram), estágio Prospecting ou campo ausente.
- **O da ordem:** faixa e preço de tabela.
- **Nada que não decide entra como motivo.** A referência de ciclo por produto e a taxa das fechadas saíram na versão 5: a primeira mostraria um segundo "P90", diferente do que decide. No lugar, uma nota fixa diz o que o sistema não vê (ligações, reuniões, e-mails).
- **O próximo passo** vem do grupo.
- **Os valores são os da regra:** a API entrega cada motivo como código, com exatamente os valores que a regra usou, e a tela e a CLI escrevem a frase. Um teste reconstrói o grupo e a ordem dos 2.089 itens só a partir desses valores.

**Premissas e guardas:**

- `as_of` (o "hoje") é parâmetro, com padrão em 31/12/2017, o último fechamento do dataset.
- Os dois limites usam só fechamentos até o `as_of`; sem nenhuma venda ganha até ele, a API responde 503 com `no_won_history`.
- `close_date`, `close_value` e o ID nunca entram na classificação. Os testes embaralham as fechadas e incluem uma venda futura sem que nada mude.
- Conta, vendedor, manager e escritório são escopo, nunca critério.
- Faixas e percentil do primeiro limite são política provisória, editáveis em `leadscorer/policy.py`.
- **Uma regra só:** o grupo vem de `triage.engaging_group`, a mesma função que o backtest usa em cada corte; testes provam que núcleo, API, CLI, carteira da equipe, detalhe e backtest servem a mesma lista.

## Priorização assistida (a camada do vendedor)

Declarada pelo vendedor, separada do scoring e **só no navegador** ([ADR-010](./architecture.md#adr-010), exceção declarada ao ADR-004). Existe para o caso em que a base não separa as oportunidades: a Darcel Schlecht tem 13 oportunidades empatadas em GTX Plus Pro (5.482), sem atividade, estágio ou contato para desempatá-las.

**Como funciona:** o vendedor escolhe de 2 a 5 oportunidades empatadas (ou avalia uma só), responde 7 perguntas, sempre com "Não sei", e recebe uma ordem por pontos de qualificação declarada (0 a 100), com a quebra por pergunta, "o que ainda não sabemos" e "o que fazer agora".

| Pergunta | Peso | Respostas e pontos |
| --- | --- | --- |
| Interesse e reciprocidade | 20 | respondeu recentemente 20; houve contato sem resposta 0; sem contato 0 |
| Momento de compra | 20 | decide em até 30 dias 20; de 31 a 90 dias 12; depois de 90 dias 4; sem previsão ou não conversamos 0 |
| Necessidade confirmada | 15 | confirmada 15; investigando 7; não identificada 0 |
| Urgência de compra | 15 | razão concreta 15; possível 7; sem razão 0 |
| Orçamento | 15 | confirmado 15; depende de aprovação 7; sem orçamento 0 |
| Autoridade decisória | 10 | conheço e tenho acesso 10; sei quem é, sem acesso 5; não identifiquei 0 |
| Progresso comercial | 5 | ação combinada com data 5; sem data 3; não existe 0 |

**Regras:**
- **"Não sei" vale 0 ponto confirmado, mas não é um "não":** a tela mostra também até onde a pontuação iria se o que se desconhece se confirmasse.
- **A ordem usa os pontos confirmados.** Pontos iguais ficam empatados. Com 4 ou mais respostas "Não sei" de 7, a oportunidade vai para um bloco à parte ("Investigar primeiro"), sem posição.
- **Contradições** (por exemplo, "sem contato" com "ação combinada") pedem confirmação antes de contar.
- **Categoria de trabalho** (o que fazer, não ordena): compromisso a cumprir ou a organizar, definir continuidade, avançar qualificação, retomar ou reavaliar, investigar primeiro, qualificar necessidade. "Hoje" é a data dos dados (31/12/2017); ação até 7 dias depois, ou anterior, conta como compromisso a cumprir.
- **Mesmas respostas, mesmo resultado:** pesos e pontos ficam em `solution/web/lib/assisted/model.ts`, com `POLICY_VERSION` `assisted-points-v1`.
- **Onde ficam as respostas:** `localStorage` (`rankio.avaliacoes.v1`), sem texto livre. Nada vai ao servidor nem ao CRM; outro navegador não as vê, e limpar os dados do navegador as apaga.
- **Nunca aparece como chance:** sem porcentagem, sem cor de temperatura. A tela repete "pesos iniciais, a validar".

**Limite:** os pesos e os pontos por resposta são **hipóteses do desenho**, não evidência. A rodada com 5 vendedores reais está desenhada em [validacao-priorizacao-assistida.md](./validacao-priorizacao-assistida.md) e ainda não foi feita.

## Resultados / Findings

**Verificação da solução** (CSVs auditados, `as_of` 31/12/2017):

| O que foi verificado         | Resultado                                                                                                                                                                                                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Testes automatizados         | `pytest`: 220 verdes com os CSVs (sem eles, os testes que dependem dos dados pulam com aviso). `vitest`: 248 verdes; `npm run typecheck` sem erros |
| Reconciliação                | 8.800 linhas após cada junção; 2.089 abertas = 157 + 141 + 1.291 + 500 + 0                                                                                                                                                                                                                                                   |
| Explicações                  | Nas 2.089, exatamente dois motivos, que citam os valores que decidiram e, sozinhos, reconstroem o grupo e a ordem; todo número das frases vem desses valores; nenhum termo proibido ("probabilidade", "perdida", "prazo", "parada", "score"…) nos textos da CLI ou da tela, conferido por início de palavra com uma lista só |
| Contrato                     | Todas as respostas passam pelos modelos tipados (versão 6); todo código tem texto na tela e na CLI; resposta fora do contrato vira mensagem de erro na tela; a evidência servida bate com o backtest, traz o carimbo da regra servida e não traz a armadilha de vazamento                                                    |
| Design system                | Todo par de texto com contraste AA (≥ 4,5 : 1) nos temas claro e escuro; composições só com primitivos do shadcn, sem cor literal nem estilo inline (ambos em teste)                                                                                                                                                         |
| Paridade                     | CLI = API = núcleo para os 35 vendedores; soma = 2.089; a carteira da equipe, o detalhe e as regras usam a mesma lista e o mesmo `meta`; o backtest reproduz a ordem servida em todos os 7 cortes; a Inteligência mostra as mesmas abertas da Equipe em todo gerente e escritório                                            |
| Inteligência                 | Receita 10.005.534, 4.238 ganhas de 6.711 fechadas (63,2%, faixa 62,0–64,3%), ciclo mediano 57 dias; os sete diagnósticos e as descobertas conferem com os CSVs; em cada recorte, os segmentos somam o total; todo número das frases vem do payload, sem jargão estatístico                                                  |
| Robustez                     | Arquivo ausente, vazio ou inválido, rótulo desconhecido, data ou preço fora do formato e `as_of` inválido param com mensagem; nenhuma lista parcial                                                                                                                                                                          |
| Ensaio das jornadas (tela)   | Vendedor e RevOps nas cinco páginas, nos temas claro e escuro, em 1280 px e 375 px; todos os itens do roteiro apareceram, nenhum erro no console e nenhuma página rola na horizontal                                                                                                                                         |
| Backtest temporal (7 cortes) | Produto e preço não separam quem ganha; a regra servida (A) concentra mais valor ganho que a regra anterior e que ordenar só por preço, por causa das negociações sem desfecho (detalhes abaixo)                                                                                                                             |

**Validação offline** ([relatório completo](../solution/data/processed/backtest_report.md), gerado por `scripts/backtest.py`):

- **População:** em cada corte T (fim de março a fim de setembro de 2017), todas as negociações em Engaging abertas em T, inclusive as que nunca fecham na base (1.330 a 2.409 por corte).
- **Desfecho:** ganhou em até 90 dias. Como T + 90 dias cai dentro da base, "não ganhou" é observado, não imputado.
- **Sem vazamento:** os ordenadores legítimos só recebem o que se sabia em T.
- **Lista do vendedor:** as 10 primeiras de cada vendedor.
  - **P@10:** quantas das 10 foram ganhas.
  - **Val@10:** valor ganho nas 10 sobre o valor das 10 melhores possíveis, sabendo o futuro.
- **Incerteza:** os cortes se sobrepõem, então as diferenças têm IC95% por bootstrap de vendedores.
- **Não coberto:** Prospecting não tem data e fica de fora.

| Ordenador                                                               | AUC média | P@10  | Val@10 | Δ Val@10 contra a regra servida (IC95%) |
| ----------------------------------------------------------------------- | --------- | ----- | ------ | --------------------------------------- |
| Aleatório                                                               | 0,510     | 38,9% | 23,2%  | −35,2 pp (−41,1 a −29,7)                |
| Taxa por produto                                                        | 0,494     | 37,7% | 14,0%  | −44,5 pp (−50,6 a −38,2)                |
| Só valor de tabela                                                      | 0,505     | 38,7% | 53,8%  | −4,6 pp (−6,8 a −2,5)                   |
| Regra anterior (até a v4): só até o maior ciclo → preço                 | 0,574     | 41,2% | 56,9%  | −1,5 pp (−2,7 a −0,2)                   |
| **Regra servida (A):** até o P90 das ganhas → até o maior ciclo → preço | 0,604     | 43,0% | 58,4%  | —                                       |
| [Vazamento] fechou no 3º mês do trimestre                               | 0,711     | —     | —      | —                                       |

Como ler:

1. **Produto e preço não preveem quem ganha** (AUC perto de 0,5). O que separa é a idade: nenhuma negociação foi ganha nem perdida depois de passar dos 138 dias.
2. **Por que a regra A foi adotada:** ela supera a regra anterior (+1,5 pp em Val@10 e +1,7 pp em P@10) e, escolhendo o limite só com os cortes anteriores, nenhum limite fixo a supera (55,8% contra 56,3%). O P90 sai de 4.238 ganhas e usa só o passado; o 138 é um caso extremo. E a lista fica coerente: hoje, 2 das 157 em Focar passaram do P90 do próprio produto, contra 140 das 298 com a regra anterior.
3. **A limitação principal:** a vantagem das regras por idade vem das negociações que nunca fecham na base. Sem elas, "só valor de tabela" fica 1,0 pp à frente da regra servida (IC +0,3 a +1,9), porque A rebaixa negociações de 107 a 138 dias que, quando fecham, ganham bastante. Essas negociações têm sinais de vir da construção da base, então o ganho é condicional a elas. A página Evidência mostra essa conclusão, calculada pelo back. No pior caso, a regra A perde menos que a anterior (−1,0 contra −1,5 pp).
4. **Valor capturado não é efeito causal.** O backtest mede quem teria ganhado de qualquer forma. O efeito de trabalhar a lista só um piloto com grupo de controle mostra.

Critérios de aceite e oráculos: [PRD](./prd.md). Plano de build, desvios e cortes: [build-plan.md](./build-plan.md). Auditoria dos dados: [data-audit.md](./data-audit.md).

## Limitações

**O que a ferramenta não faz:**

- **Não prevê quem vai fechar.** Com estes campos, só a idade separa os grupos, e só por causa das negociações sem desfecho na base. A ferramenta não dá chance por oportunidade.
- **Não comprova ganho de resultado.** O ganho sobre "ordenar por preço" é pequeno e inverificável aqui; só um piloto com grupo de controle mede efeito.
- **Não detecta esfriamento nem sugere reativação:** o dataset não tem atividade nem histórico de estágio.
- **Não escreve no CRM, não registra uso** (marcações "vou trabalhar", "revisei") e não tem autenticação; serve um usuário, com CSV em memória.
- **A evidência é o resultado gravado do backtest:**
  - ela não se recalcula quando os dados mudam; rode de novo `scripts/backtest.py`;
  - a página avisa quando o resultado não veio dos CSVs auditados.

**O que depende de premissa:**

- **Data do recorte:** a data de extração é desconhecida, então o `as_of` padrão de 31/12/2017 é premissa. Com ela, 81% das Engaging caem em Confirmar e o Focar tem 157 itens; sem dados novos, ele esvazia rápido com o `as_of` (84 em 31/01/2018, 9 em 31/03/2018). O selo "Dados até…" fica sempre visível.
- **Cliente ausente:** 68% das abertas não têm cliente registrado (e 0% das fechadas). A tela avisa uma vez e identifica o deal pelo ID.
- **Linhas idênticas:** 461 linhas abertas idênticas (exceto pelo ID) foram mantidas, sem prova de duplicidade.
- **Política provisória:** faixas de valor e o percentil do primeiro limite não foram validados pela Head de RevOps. Em produção, o segundo limite (o maior ciclo) deveria virar um quantil robusto ou uma política definida com a RevOps.
- **Dataset provavelmente sintético** (fechamentos em fins de semana e sem estrutura de sinal); não generalizar para a empresa real.

**O que não foi verificado:**

- **Compreensão:** o teste dos nomes (Focar, Acompanhar, Confirmar, Qualificar, Completar) com 3 a 5 pessoas não técnicas ainda não foi feito.
- **A divisão por idade:** o backtest avalia os três grupos de Engaging. A vantagem deles depende das negociações que nunca recebem desfecho, e não dá para saber se elas estão de fato encerradas ou se são registros sem atualização.
- **Qualificar:** Prospecting não tem data, então o grupo não é avaliado no backtest.

**Para escalar:**

1. Fonte viva (API do CRM) no lugar do CSV.
2. Registro de ações do vendedor (cria o baseline e a medida de adoção).
3. Log de atividade e de mudança de estágio (habilita sinais de esfriamento).
4. Validação da política com a RevOps.
5. Autenticação e banco, se houver escrita ou mais de ~30 usuários.
6. Piloto com grupo de controle antes de afirmar qualquer efeito.

**Desvios em relação ao ADR-003 e ao PRD** (detalhes em [build-plan.md](./build-plan.md#2-ambiente-instalação-e-reprodução)):

- A CLI imprime no terminal, sem gerar CSV.
- A tela é Next.js com TypeScript, Tailwind v4 e componentes do shadcn (sem ESLint), com `agentRules: false` no `next.config.mjs` para o `next dev` não criar um `AGENTS.md`. O `next-env.d.ts` é gerado pelo `next dev` e não vai para o repositório.
- **Design system ([ADR-005](./architecture.md#adr-005)):**
  - a CLI do shadcn é usada só pelo `npx`;
  - o CSS de que os primitivos dependem fica copiado em `web/app/shadcn.css` (MIT), para não trazer as 34 dependências da CLI;
  - as dependências novas estão fixadas em versões publicadas há pelo menos 14 dias.
- **Contrato orientado a dados ([ADR-004](./architecture.md#adr-004)):** o payload leva só chaves, códigos e números (`contract_version` 4 na época; hoje, 7), e os textos ficam na tela e na CLI.
- **Ferramentas do front, escolhidas para rodar em Node 22.12:**
  - Vitest com Vite 7 fixado (o Vite 8 não trouxe o binário nativo nesta máquina);
  - jsdom 28;
  - `@hey-api/openapi-ts` 0.95, que gera os tipos e a validação zod.
- A validação do `as_of` fica na entrada (CLI e API), e o núcleo aceita qualquer data. Assim, o teste de vazamento com uma venda futura (AC-1.10) não conflita com o `as_of` mínimo (D-4).
- A API carrega os dados uma vez e calcula a lista a cada chamada (cerca de 25 ms).
