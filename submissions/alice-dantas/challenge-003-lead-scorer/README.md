# Submissão — Maria Alice Dantas — Challenge 003

## Executive Summary

_Em 3-5 frases: o que você fez, o que encontrou, e qual a principal recomendação._

### Setup

**Requisitos:** Python 3.9 ou superior (testado em 3.9.6) e, para a tela e os testes do front, Node 22.12 ou superior (testado em 22.12). Sem banco, sem segredo e sem LLM.

**Dados:** os CSVs não estão no repositório. Baixe o dataset [CRM Sales Predictive Analytics](https://www.kaggle.com/datasets/agungpambudi/crm-sales-predictive-analytics) (CC0) pelo navegador e copie `sales_pipeline.csv`, `products.csv`, `sales_teams.csv` e `accounts.csv` para `solution/data/raw/`. O [README da pasta](./solution/data/raw/README.md) traz o SHA-256 da versão auditada.

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

### Solução

Uma ferramenta de **triagem explicável** da carteira aberta: o vendedor escolhe o próprio nome e vê, em uma ordem única e declarada, o que abrir primeiro, com o motivo de cada posição e o que os dados não sabem. A ferramenta só lê o CRM; a ação acontece no CRM, pelo ID da oportunidade.

| Camada | O que faz | Onde |
| --- | --- | --- |
| Núcleo Python (pandas) | Carga, normalização, estados, ordem e motivos em código; funções puras, sem web e sem texto de tela | `solution/leadscorer/` |
| CLI | `check-data`, `list --seller` (texto ou `--json`) e `explain --id`; escreve os textos a partir dos códigos (`cli_text.py`) e entrega tudo sem Node | `python -m leadscorer` |
| API FastAPI | `GET /api/meta`, `/api/sellers`, `/api/sellers/{seller}/pipeline`, `/api/pipeline?manager=&office=` (com o resumo por vendedor), `/api/rules` (a política) e `/api/evidence` (o backtest); respostas tipadas (pydantic, descritas em `/docs`); erros 404, 422 e 503 com `code`, `params` e `detail` | `solution/api/` |
| Tela Next.js (TypeScript) | **Rankio**: quatro páginas com menu central (Carteira, Equipe, Evidência e Como funciona), tema claro e escuro. Valida cada resposta contra o contrato e escreve os textos a partir dos códigos (`copy/pt-BR.ts`). Componentes só do shadcn, com tokens próprios ([design-system.md](./docs/design-system.md), [ADR-005](./docs/architecture.md#adr-005)) | `solution/web/` |

CLI, API e tela consomem **o mesmo payload**, então a lista é idêntica nas três saídas (testado para os 35 vendedores).

**Contrato entre back e front** ([ADR-004](./docs/architecture.md#adr-004)):
- **O back entrega dados e decisões da regra:** o grupo de cada oportunidade, a ordem, os motivos como código com os valores que decidiram (`reasons: [{code, role, params}]`), a ação sugerida (`next_action`) e os números.
- **O front decide como dizer:** nomes, frases, formatação e layout.
- **O mesmo contrato serve aos dois lados:** o schema fica em `web/contract/openapi.json`; o front gera dele os tipos e a validação, e testa contra respostas sintéticas exportadas pelo back.
- **Versão 4 do contrato:** acrescenta a evidência, as regras e o resumo por vendedor. A tela não calcula nenhum número de negócio; o máximo que faz é formatar (fração em %, diferença em pontos).

**As quatro páginas:**

| Página | Para quem | Pergunta que responde | O que mostra |
| --- | --- | --- | --- |
| Carteira | Vendedor | Qual é o meu próximo passo? | Cartão "Seu próximo passo" com a ação e o primeiro bloco da ordem (o empate inteiro, sem eleger um ID). Uma aba por grupo, com contagem e definição. Painel "Por que está aqui" com os motivos separados por papel: decidiu o grupo, decidiu a posição ou é só contexto. Anterior e Próxima percorrem a lista; "Copiar ID" leva ao CRM. O vendedor fica na URL, e o último escolhido volta na próxima visita |
| Equipe | Gestor e Head de RevOps | Onde está a carteira da equipe? | Filtros de gerente e escritório, cada um restringindo o outro. Os quatro números da carteira, a tabela "Por vendedor" em ordem alfabética, sem ordenação por resultado, e a lista com a coluna Vendedor. Tabelas paginadas |
| Evidência | Head de RevOps | A lista ajuda a escolher onde investir? | Do valor vendido em 90 dias, quanto estava nas 10 primeiras de cada vendedor: regra atual, "só valor de tabela" e o acaso, com a diferença e a margem de erro. Também o recorte sem as negociações que nunca fecham e o que a evidência não mostra. Em **linguagem de negócio** (padrão) ou **técnica** (Val@10, P@10, Lift@10, AUC e IC95%) |
| Como funciona | Todos | Como a lista é montada? | Os quatro grupos, a ordem, as faixas de valor de tabela, a referência de ciclo por produto, a taxa-base e o que a ferramenta não faz |

**Jornada do vendedor (2 minutos):**
1. Abra `localhost:3000` e escolha Zane Levy.
2. O cartão "Seu próximo passo" mostra a ação de Focar e as 3 GTX Plus Pro de 5.482 empatadas no topo: `01XZ9CRY`, `FZWU2I30` e `J0G6ZLYZ`.
3. Abaixo, "88 abertas = 31 Focar + 57 Revisar + 0 Qualificar + 0 Não pontuável" e as abas.
4. Abra `01XZ9CRY` para ler o motivo e use "Próxima" para seguir na ordem.
5. Troque para Darcel Schlecht: ele abre direto em Revisar, com a indicação de começar por lá, porque não tem nada em Focar.

**Jornada da Head de RevOps:**
1. Em **Equipe**, veja 2.089 abertas: 298 em Focar (dentro do maior ciclo já fechado: não deixar esfriar) e 1.291 em Revisar (acima dele: confirmar se seguem ativas), além da carteira de cada vendedor.
2. Em **Evidência**, compare a regra atual (56,9% do valor ganho capturado) com ordenar só por valor de tabela (53,8%) e com o acaso (23,2%), e leia o que essa medida não prova.

### Lógica de Scoring

A auditoria mostrou que **produto, vendedor, conta, setor e região não separam quem ganha de quem perde** (AUC entre 0,48 e 0,51 fora do tempo). O único sinal legítimo é **há quanto tempo a negociação está aberta**, e ele aparece só por causa das negociações que nunca recebem desfecho na base (ver Resultados). O sinal mais forte é o mês de fechamento, que é vazamento, porque só existe depois do resultado. Por isso a ferramenta **não calcula probabilidade nem nota**. Ela classifica e ordena por regras declaradas, com o que os dados sustentam ([ADR-001](./docs/architecture.md#adr-001)).

**1. Estado** (cada aberta cai em exatamente um):

| Estado | Regra | Com os dados auditados |
| --- | --- | --- |
| **Focar** | Engaging com idade até o maior ciclo já fechado (138 dias) | 298 |
| **Revisar** | Engaging acima desse limite; a idade não prova que o negócio terminou | 1.291 |
| **Qualificar** | Prospecting (sem data de engajamento, logo sem idade) | 500 |
| **Não pontuável** | Falta produto, preço ou, em Engaging, a data de engajamento; o item diz qual campo corrigir | 0 |

**2. Ordem dentro do estado:** faixa de valor de tabela (alto ≥ 3.000; médio de 500 a 2.999; baixo < 500) → preço de tabela decrescente → ID, só para a ordem ficar estável. O preço de tabela reproduz o valor fechado com ±20% em 95,9% das vendas ganhas. **A idade aparece, mas não muda a ordem**, porque não mostrou sinal estável. Deals do mesmo estado e produto são empate e aparecem agrupados.

**3. Explicação:** quatro motivos por oportunidade, cada um com um papel.
- **Os que decidem:** o motivo do grupo (idade × maior ciclo, estágio Prospecting ou campo ausente) e o da ordem (faixa e preço de tabela).
- **Os de contexto:** a referência do produto (P90 do ciclo das ganhas, com N e aviso quando N < 30) e a taxa das fechadas ("Não sabemos a chance de fechar desta oportunidade: cerca de 63% das fechadas foram ganhas (48% a 72% contando as abertas)").
- **O próximo passo** vem do grupo.
- **Os valores são os da regra:** a API entrega cada motivo como código, com exatamente os valores que a regra usou, e a tela e a CLI escrevem a frase.

**Premissas e guardas:**
- `as_of` (o "hoje") é parâmetro, com padrão em 31/12/2017, o último fechamento do dataset.
- A régua do ciclo usa só fechamentos até o `as_of`.
- `close_date`, `close_value` e o ID nunca entram na classificação. Os testes embaralham as fechadas e incluem uma venda futura sem que nada mude.
- Conta, vendedor, manager e escritório são escopo, nunca critério.
- Faixas e limite são política provisória, editáveis em `leadscorer/policy.py`.

### Abordagem

_Como você atacou o problema. Por onde começou? Como decompôs? O que priorizou?_

### Resultados / Findings

**Verificação da solução** (CSVs auditados, `as_of` 31/12/2017):

| O que foi verificado | Resultado |
| --- | --- |
| Testes automatizados | `pytest`: 147 verdes com os CSVs; sem eles, 114 verdes e 33 pulados com aviso. `npm test`: 118 verdes; `npm run typecheck` e `npm run build` sem erros |
| Reconciliação | 8.800 linhas após cada junção; 2.089 abertas = 298 + 1.291 + 500 + 0 |
| Explicações | Nas 2.089, cada motivo de grupo e de ordem cita exatamente os valores que decidiram; todo número das frases vem desses valores; nenhum termo proibido ("probabilidade", "perdida", "encerre", "score"…) nos textos da CLI ou da tela |
| Contrato | Todas as respostas passam pelos modelos tipados (versão 4); todo código tem texto na tela e na CLI; resposta fora do contrato vira mensagem de erro na tela; a evidência servida bate com o backtest e não traz a armadilha de vazamento |
| Design system | Todo par de texto com contraste AA (≥ 4,5 : 1) nos temas claro e escuro; composições só com primitivos do shadcn, sem cor literal nem estilo inline (ambos em teste) |
| Paridade | CLI = API = núcleo para os 35 vendedores; soma = 2.089 |
| Robustez | Arquivo ausente, vazio ou inválido, rótulo desconhecido, data ou preço fora do formato e `as_of` inválido param com mensagem; nenhuma lista parcial |
| Ensaio das jornadas (tela) | Vendedor e RevOps nas quatro páginas, nos temas claro e escuro, em 1280 px e 375 px; todos os itens do roteiro apareceram, nenhum erro no console e nenhuma página rola na horizontal |
| Backtest temporal (7 cortes) | Produto e preço não separam quem ganha; a regra da ferramenta concentra mais valor ganho que ordenar só por preço, por causa das negociações sem desfecho (detalhes abaixo) |

**Validação offline** ([relatório completo](./solution/data/processed/backtest_report.md), gerado por `scripts/backtest.py`):
- **População:** em cada corte T (fim de março a fim de setembro de 2017), todas as negociações em Engaging abertas em T, inclusive as que nunca fecham na base (1.330 a 2.409 por corte).
- **Desfecho:** ganhou em até 90 dias. Como T + 90 dias cai dentro da base, "não ganhou" é observado, não imputado.
- **Sem vazamento:** os ordenadores legítimos só recebem o que se sabia em T.
- **Lista do vendedor:** as 10 primeiras de cada vendedor.
  - **P@10:** quantas das 10 foram ganhas.
  - **Val@10:** valor ganho nas 10 sobre o valor das 10 melhores possíveis, sabendo o futuro.
- **Incerteza:** os cortes se sobrepõem, então as diferenças têm IC95% por bootstrap de vendedores.
- **Não coberto:** Prospecting não tem data e fica de fora.

| Ordenador | AUC média | P@10 | Val@10 | Δ Val@10 contra a regra da ferramenta (IC95%) |
| --- | --- | --- | --- | --- |
| Aleatório | 0,510 | 38,9% | 23,2% | −33,7 pp |
| Taxa por produto | 0,494 | 37,7% | 14,0% | −43,0 pp |
| Só valor de tabela | 0,505 | 38,7% | 53,8% | −3,1 pp (−4,4 a −1,9) |
| **Regra da ferramenta** (até o maior ciclo → preço) | 0,574 | 41,2% | 56,9% | — |
| Alternativa avaliada, não implementada: até o P90 das ganhas → até o maior ciclo → preço | 0,604 | 43,0% | 58,4% | +1,5 pp (+0,2 a +2,7) |
| [Vazamento] fechou no 3º mês do trimestre | 0,711 | — | — | — |

Como ler:
1. **Produto e preço não preveem quem ganha** (AUC perto de 0,5). O que separa é a idade: o grupo Revisar não teve nenhuma negociação ganha nem perdida depois de passar dos 138 dias.
2. **Por que a regra captura mais valor que "só preço":** ela põe abaixo as negociações paradas, que nunca fecham na base. Sem elas, a vantagem some: a regra empata com "só preço" (Val@10 de 79,1% nos dois), e a alternativa pelo P90 fica 1,0 pp abaixo (IC −1,9 a −0,3). Essas negociações têm sinais de vir da construção da base, então o ganho é condicional a elas.
3. **Valor capturado não é efeito causal.** O backtest mede quem teria ganhado de qualquer forma. O efeito de trabalhar a lista só um piloto com grupo de controle mostra.

Critérios de aceite e oráculos: [PRD](./docs/prd.md). Plano de build, desvios e cortes: [build-plan.md](./docs/build-plan.md). Auditoria dos dados: [data-audit.md](./docs/data-audit.md).

### Recomendações

_O que a empresa deveria fazer com base nos seus findings. Priorize._

### Limitações

**O que a ferramenta não faz:**
- **Não prevê quem vai fechar.** Com estes campos, só a idade separa os grupos, e só por causa das negociações sem desfecho na base. A ferramenta não dá chance por oportunidade.
- **Não comprova ganho de resultado.** O ganho sobre "ordenar por preço" é pequeno e inverificável aqui; só um piloto com grupo de controle mede efeito.
- **Não detecta esfriamento nem sugere reativação:** o dataset não tem atividade nem histórico de estágio.
- **Não escreve no CRM, não registra uso** (marcações "vou trabalhar", "revisei") e não tem autenticação; serve um usuário, com CSV em memória.
- **A evidência é o resultado gravado do backtest:**
  - ela não se recalcula quando os dados mudam; rode de novo `scripts/backtest.py`;
  - a página avisa quando o resultado não veio dos CSVs auditados.

**O que depende de premissa:**
- **Data do recorte:** a data de extração é desconhecida, então o `as_of` padrão de 31/12/2017 é premissa. Com ela, 81% das Engaging caem em Revisar e o Focar tem só 298 itens; o tamanho muda com o `as_of` (160 em 31/01/2018, 34 em 31/03/2018).
- **Cliente ausente:** 68% das abertas não têm cliente registrado (e 0% das fechadas). A tela avisa uma vez e identifica o deal pelo ID.
- **Linhas idênticas:** 461 linhas abertas idênticas (exceto pelo ID) foram mantidas, sem prova de duplicidade.
- **Política provisória:** faixas de valor e limite de ciclo não foram validados pela Head de RevOps.
- **Dataset provavelmente sintético** (fechamentos em fins de semana e sem estrutura de sinal); não generalizar para a empresa real.

**O que não foi verificado:**
- **Compreensão:** o teste com 3 a 5 pessoas não técnicas ainda não foi feito.
- **Focar × Revisar:** o backtest agora avalia essa divisão. A vantagem dela depende das negociações que nunca recebem desfecho, e não dá para saber se elas estão de fato encerradas ou se são registros sem atualização.
- **Qualificar:** Prospecting não tem data, então o grupo não é avaliado no backtest.

**Para escalar:**
1. Fonte viva (API do CRM) no lugar do CSV.
2. Registro de ações do vendedor (cria o baseline e a medida de adoção).
3. Log de atividade e de mudança de estágio (habilita sinais de esfriamento).
4. Validação da política com a RevOps.
5. Autenticação e banco, se houver escrita ou mais de ~30 usuários.
6. Piloto com grupo de controle antes de afirmar qualquer efeito.

**Desvios em relação ao ADR-003 e ao PRD** (detalhes em [build-plan.md](./docs/build-plan.md#2-ambiente-instalação-e-reprodução)):
- A CLI imprime no terminal, sem gerar CSV.
- A tela é Next.js com TypeScript, Tailwind v4 e componentes do shadcn (sem ESLint), com `agentRules: false` no `next.config.mjs` para o `next dev` não criar um `AGENTS.md`. O `next-env.d.ts` é gerado pelo `next dev` e não vai para o repositório.
- **Design system ([ADR-005](./docs/architecture.md#adr-005)):**
  - a CLI do shadcn é usada só pelo `npx`;
  - o CSS de que os primitivos dependem fica copiado em `web/app/shadcn.css` (MIT), para não trazer as 34 dependências da CLI;
  - as dependências novas estão fixadas em versões publicadas há pelo menos 14 dias.
- **Contrato orientado a dados ([ADR-004](./docs/architecture.md#adr-004)):** o payload leva só chaves, códigos e números (`contract_version` 4), e os textos ficam na tela e na CLI.
- **Ferramentas do front, escolhidas para rodar em Node 22.12:**
  - Vitest com Vite 7 fixado (o Vite 8 não trouxe o binário nativo nesta máquina);
  - jsdom 28;
  - `@hey-api/openapi-ts` 0.95, que gera os tipos e a validação zod.
- A validação do `as_of` fica na entrada (CLI e API), e o núcleo aceita qualquer data. Assim, o teste de vazamento com uma venda futura (AC-1.10) não conflita com o `as_of` mínimo (D-4).
- A API carrega os dados uma vez e calcula a lista a cada chamada (cerca de 25 ms).

## Process Log — Como usei IA

[Acesse o process log](./process-log/PROCESS_LOG.md)
