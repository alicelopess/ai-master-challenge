# PRD — Challenge 003 | Lead Scorer

**Status:** escopo congelado para build em 15/10/2026 · **Dona:** Maria Alice Dantas · **Base:** [architecture.md](./architecture.md) (ADR-001 a ADR-003), [data-audit.md](./data-audit.md) e [discovery.md](./discovery.md). Este PRD não reabre o discovery: reduz os seis P0 da arquitetura a três e fixa aceite, dados, comandos e ordem de construção. **Revisão 1** (teste de mesa, 15/10/2026): próximos passos, legenda de ordem, frase de posição e AC-2.12. **Revisão 2** (16/10/2026): contrato orientado a dados ([ADR-004](./architecture.md#adr-004)). Os critérios de texto passam a ser de código no back e de texto nos catálogos da tela e da CLI; entram os AC-4.x do contrato e o backtest com todas as abertas em cada corte. **Revisão 3** (16/10/2026): interface Rankio ([ADR-005](./architecture.md#adr-005) e [design-system.md](./design-system.md)).
- **Nova jornada:** abas por grupo, cartão "Seu próximo passo" e painel lateral.
- **Páginas novas:** Equipe, Evidência e Como funciona, com menu central.
- **Contrato v4:** `/api/evidence`, `/api/rules` e `by_seller` (AC-4.5 e AC-4.6).
- **Critérios de interface:** AC-5.x.
- **Ajustes da revisão visual (16/10/2026):** cursor de clique em todo elemento clicável; tabelas paginadas no lugar de "Mostrar mais"; filtros de gerente e escritório que se restringem; Evidência com a escolha entre linguagem de negócio e técnica, e cartão "A pergunta" com os números à esquerda e o gráfico à direita.

## 1. Problema e valor

- **Problema:** segundo a Head de RevOps, os vendedores escolhem no feeling quais das 2.089 oportunidades abertas trabalhar, sem critério comum e visível. O custo disso nunca foi medido.
- **Valor proposto:** uma lista única do que abrir primeiro, com o motivo de cada posição em campos verificáveis e com o que os dados não sabem. Se isso melhora o resultado, só um piloto com grupo de controle vai dizer.

## 2. Jornada de demonstração (até 2 minutos)

`as_of` = 2017-12-31. Vendedor principal: **Zane Levy**. Contraste: **Darcel Schlecht**. Revisão 3: a resposta vem antes da lista (cartão "Seu próximo passo"), os grupos são abas e a explicação abre num painel lateral.

| Etapa | O usuário faz | Informação visível | Reação do sistema |
| --- | --- | --- | --- |
| 1. Entrada (0:00–0:20) | Abre `localhost:3000` (vai para a Carteira) e escolhe Zane Levy; na próxima visita, ele já vem escolhido | "Dados até 31/12/2017" no cabeçalho; os 35 vendedores em ordem alfabética, com busca; cartão "Seu próximo passo" com a ação de Focar e o empate do topo: `01XZ9CRY`, `FZWU2I30` e `J0G6ZLYZ` (GTX Plus Pro, 5.482) | Responde em menos de 1 s; nenhum percentual de chance; o vendedor fica na URL |
| 2. Interpretação (0:20–0:50) | Lê o resumo e a aba Focar | 88 abertas = 31 Focar + 57 Revisar + 0 + 0; aviso único "59 de 88 sem cliente registrado"; legenda de ordem; abas Focar 31, Revisar 57, Qualificar 0 e Não pontuável 0, com a definição do grupo; tabela com ID, produto, cliente, valor de tabela, data e idade | Ordena por estado → faixa → preço → ID; agrupa empates; a idade não ordena |
| 3. Decisão (0:50–1:30) | Abre `01XZ9CRY` e segue com "Próxima" | Painel "Por que está aqui" com os motivos em três seções (por que neste grupo, por que nesta posição, contexto), o próximo passo e "Copiar ID" | As frases só usam campos da linha; Anterior e Próxima seguem a ordem do grupo |
| 4. Ação seguinte (1:30–2:00) | Abre a aba Revisar e troca para Darcel Schlecht | "Confirme no CRM se segue ativa"; Darcel abre direto em Revisar (83), e o cartão diz "Nenhuma oportunidade dentro do ciclo observado (até 138 d). Comece por Revisar: confirme no CRM quais seguem ativas."; 111 Qualificar | O vendedor age no CRM pelo ID (a ferramenta só lê, RE-03); o estado vazio não quebra a tela |

**Jornada da Head de RevOps** (Revisão 3):

| Etapa | O usuário faz | Informação visível | Reação do sistema |
| --- | --- | --- | --- |
| 5. Equipe | Abre Equipe; filtra por gerente ou escritório | Quatro cartões: 298 Focar, 1.291 Revisar, 500 Qualificar e 0 Não pontuável, cada um "de 2.089 abertas" e com a definição do grupo; abaixo dos cartões, duas abas centralizadas: "Por vendedor" (35, em ordem alfabética, 8 sem abertas) e "Por oportunidade" (2.089, a lista com a coluna Vendedor) | Nenhum percentual calculado na tela; nenhuma ordenação de pessoas; o nome leva à carteira do vendedor; só a análise aberta fica na tela |
| 6. Evidência | Abre Evidência (linguagem de negócio, o padrão) e, se quiser, troca para a técnica | "Se cada vendedor trabalhasse as 10 primeiras da lista, quanto do valor vendido nos 90 dias seguintes estaria nelas?": regra atual 56,9%, só valor de tabela 53,8% ("3,1 pontos a menos que a regra atual (margem de erro: entre 1,9 e 4,4 pontos a menos)") e ordem aleatória 23,2%; sem as negociações paradas, 79,1% e 79,1%; "O que esta evidência não mostra". Na técnica: Val@10, Δ com IC95%, P@10, Lift@10 e AUC | Os números vêm do resultado gravado do backtest e são os mesmos nas duas linguagens; a armadilha de vazamento não aparece |

## 3. Funcionalidades P0

**P0-1 · Carteira classificada.** Origem: F-03, F-04, F-05 e a guarda de F-06; RD-02 a RD-04, RD-07; ADR-001 e ADR-002.
- **Descrição:** carrega, normaliza e junta os CSVs; põe cada aberta em exatamente um estado, com motivo.
- **Entradas:** `sales_pipeline`, `products`, `sales_teams` e `accounts` em `data/raw/`. Política: `as_of` (padrão `max(close_date)` = 2017-12-31), limite de ciclo (padrão: o maior ciclo das fechadas até o `as_of`, hoje 138 d) e faixas de valor.
- **Saídas:** abertas com identificação, idade, faixa, estado e motivo; `meta` (`as_of`, limite, P90 e N por produto, taxa-base, SHA-256); relatório de reconciliação.
- **Lógica:** `GTXPro` → `GTX Pro`; junções m:1 mantêm 8.800 linhas. Focar = Engaging com idade ≤ limite; Revisar = Engaging acima do limite; Qualificar = Prospecting; Não pontuável = falta um campo necessário. Só campos permitidos entram; `close_date` só entra na régua de ciclo, e só de fechadas até o `as_of`. Função pura; CSV só leitura.
- **Dados ausentes:** arquivo, coluna, rótulo ou estágio inválido → erro explícito, nunca descarte; produto vazio ou Engaging sem data → Não pontuável; conta vazia → só o aviso (AC-1.2 a 1.8).
- **Pronto quando:** AC-1.x verdes, reconciliação 8.800/2.089 publicada e saída determinística.

**P0-2 · Lista "Onde focar" por vendedor.** Origem: F-01 e F-04; RB-04, RB-06, RD-06, RE-02, Q-01; ADR-001 e ADR-003.
- **Descrição:** a carteira de um vendedor em ordem única e declarada, com resumo por estado.
- **Entradas:** saída de P0-1, `seller` e `as_of`; `manager` e `office` na API e na página Equipe.
- **Saídas:**
  - `GET /api/meta`;
  - `/api/sellers` (ordem alfabética);
  - `/api/sellers/{seller}/pipeline?as_of=` (`summary`, `ordering`, `empty` e grupos com itens, `empty` e `next_action`, em códigos; ver ADR-004);
  - `/api/pipeline?manager=&office=`, com `by_seller`;
  - `/api/rules` e `/api/evidence` (Revisão 3);
  - quatro páginas Next.js com menu central (Carteira, Equipe, Evidência e Como funciona; ADR-005);
  - CLI `python -m leadscorer list`.
- **Lógica:** estado → faixa de valor de tabela (alto ≥ 3.000; médio de 500 a 2.999; baixo < 500) → preço decrescente → ID, só para estabilidade. A idade é coluna; mesmo estado e produto é empate agrupado; vendedores nunca são ordenados. A ordem vai no payload como dado (`ordering`), e a tela e a CLI escrevem acima da lista a legenda "Ordem: Focar → Revisar → Qualificar → Não pontuável; em cada grupo, maior valor de tabela primeiro; a idade aparece, mas não muda a ordem." Faixas e limite são política provisória (U-06).
- **Dados ausentes:** vendedor inexistente → 404; vendedor sem abertas (8), grupo vazio ou filtro vazio → mensagem própria; Focar vazio (6 vendedores) ainda aponta o próximo grupo com oportunidades; conta nula → "sem cliente registrado" (AC-2.4 a 2.7 e 2.10).
- **Pronto quando:** AC-2.x verdes, CLI igual à API e a jornada rodando sem intervenção.

**P0-3 · "Por que está aqui".** Origem: F-02 e a frase mínima de F-09; RB-03, RE-04, RD-01, RD-05, RJ-07, Q-03.
- **Descrição:** explica cada posição com frases de modelo fixo, preenchidas com campos, e dá o próximo passo.
- **Entradas e saídas:** linha e `meta` de P0-1 → `reasons: [{code, role, params}]` e `next_action: {code, params}` na API. A tela (`copy/pt-BR.ts`) e a CLI (`cli_text.py`) escrevem as frases (ADR-004).
- **Lógica:** sem LLM. Motivos:
  - **grupo** (`role: group`): idade × maior ciclo já fechado, estágio Prospecting ou campo ausente;
  - **ordem** (`role: order`): faixa e preço de tabela;
  - **contexto** (`role: context`): idade × P90 das ganhas do produto, com N, e o limite; taxa das fechadas.
- **Frases da tela e da CLI:**
  - "<Grupo> porque <está em negociação há X dias, dentro/acima do maior ciclo já fechado (138 d) | ainda está em prospecção | falta <campo>>";
  - "preço de catálogo, não valor negociado";
  - "Não sabemos a chance de fechar desta oportunidade: cerca de 63% das fechadas foram ganhas (48% a 72% contando as abertas)".
- **Duas frases corrigidas na Revisão 2,** porque diziam mais do que o código:
  - "ainda não tem data de engajamento" virou "ainda está em prospecção";
  - "e isso não diferencia uma da outra" saiu.
- **Próximo passo** (códigos `work_highest_list_price_first`, `confirm_still_active`, `advance_prospecting` e `fix_missing_field`; o texto é da tela e da CLI): Focar, "Trabalhe primeiro os de maior valor de tabela; empates do mesmo produto valem o mesmo." Revisar, "Confirme no CRM se segue ativa: idade acima do ciclo não prova que o negócio terminou." Qualificar, "Ainda em prospecção: avance no CRM os de maior valor de tabela e registre a data de engajamento quando houver contato." Não pontuável, "Corrija <campo> no CRM." Focar vazio: "Nenhuma oportunidade dentro do ciclo observado (até 138 d). Comece por Revisar: confirme no CRM quais seguem ativas." (Se Revisar também estiver vazio, aponta Qualificar.) Vocabulário proibido: AC-3.8.
- **Dados ausentes:** sem idade, com menos de 30 ganhas do produto (GTK 500 tem 15) ou sem nenhuma ganha → frase própria, sem número inventado; conta nula → só o aviso do cabeçalho (AC-3.3 a 3.5).
- **Pronto quando:** AC-3.x verdes e 100% dos itens explicados.

**Fora do escopo:** F-07, F-08, F-10 a F-13, RJ-01 a RJ-07, escrita no CRM e envio por Slack ou e-mail.

## 4. Dados, dependências, comandos e riscos

**Dados:** os quatro CSVs do Kaggle (CC0) em `solution/data/raw/`, conferidos pelo SHA-256 de [`A§7`](./data-audit.md#a-7); demonstração com Zane Levy, Darcel Schlecht (sem Focar) e Carl Lin (sem abertas). Testes unitários usam fixtures sintéticas; o e2e usa os CSVs reais e é pulado com aviso se eles faltarem.

**Oráculos:** os números e registros de AC-1.1, AC-1.8, AC-2.1, AC-2.4, AC-3.1 e AC-3.3 foram conferidos nos CSVs em 15/10/2026, por consulta fora do repositório (CP-01).

**Dependências:** Python 3.9.6 com pandas 2.2.3 e numpy 2.0.2; FastAPI, pydantic, uvicorn, pytest e httpx fixados na fatia 0; scipy e scikit-learn só no backtest; Node 22.12 e npm 11.5 com Next.js e lockfile; no front, TypeScript 6, zod 4, Vitest 5 (com Vite 7), jsdom 28 e `@hey-api/openapi-ts` 0.95, que gera tipos e validação do contrato. A interface (Revisão 3) acrescenta:
- Tailwind 4.3 e os componentes do shadcn, que entram pela CLI 4.21.1 via `npx`, sem virar dependência;
- Radix, `cn`, lucide, next-themes e cmdk;
- Recharts 3.10, só no gráfico da Evidência. Sem banco, sem segredo, sem LLM e sem rede em execução.

**Comandos do avaliador** (em `submissions/alice-dantas/challenge-003-lead-scorer/solution/`):

```bash
# 0. Baixar o dataset no Kaggle pelo navegador e copiar os 4 CSVs para data/raw/
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m leadscorer check-data          # presença, colunas, hash e reconciliação
.venv/bin/pytest
.venv/bin/uvicorn api.main:app --port 8000
cd web && npm ci && npm run dev                    # http://localhost:3000
cd web && npm run typecheck && npm test            # testes do front, sem a API no ar
.venv/bin/python -m leadscorer list --seller "Zane Levy"   # caminho sem Node
.venv/bin/python scripts/backtest.py               # regrava a evidência servida em /api/evidence
# Se o contrato mudar: export_openapi.py, export_fixtures.py e, em web/, npm run contract
```

| Artefato | Risco | Regra |
| --- | --- | --- |
| CSVs brutos | Ficam fora do PR, mas `git add -f` os incluiria, e o [commit-flow](../../docs/commit-flow.md) não filtra `.csv` | Excluir `data/raw/*.csv` no `git add` e na etapa 5; publicar `data/raw/README.md` com link e SHA-256 |
| `outputs/` da CLI | Republica o dataset linha a linha | Fora do PR; fixtures só sintéticas |
| `audit_log.txt` | Traz caminho absoluto local (`/Users/...`) | Trocar por caminho relativo |
| Credenciais | Token do Kaggle; `.env` do Next.js | Download pelo navegador; URL da API com padrão no código |
| Artefatos locais | `.venv` (206 MB), `node_modules`, `.next`, `.pytest_cache` | Acrescentar `.next` e `.pytest_cache` ao commit-flow |

## 5. Métricas

| Testável hoje | Como | Critério |
| --- | --- | --- |
| Execução | Setup do zero pelo README | Nenhum passo fora do README |
| Funcionalidade | pytest, `npm test`, `npm run typecheck` e a jornada da seção 2 | 100% verde; jornada em até 2 min |
| Lógica | Partição, reconciliação, `as_of`, invariância, códigos e textos | Bate com os oráculos |
| Contrato | Schema tipado, snapshot e respostas sintéticas atualizados; validação no front | AC-4.1 a 4.6 |
| Interface | Contraste dos tokens, só primitivos do shadcn, navegação, Carteira, painel, Equipe, Evidência e Como funciona; roteiro em 375 px e nos dois temas | AC-5.1 a 5.8 |
| Ranking offline válido | Backtest em 7 cortes com todas as Engaging abertas em T e desfecho em 90 dias, só com o que se sabia em cada corte; AUC com IC; P@10, Lift@10 e Val@10 por vendedor, com IC por bootstrap de vendedores; sensibilidade sem as negociações que nunca fecham | Sem vazamento e reprodutível; produto e preço perto de 0,5; a vantagem da idade é reportada junto com a sensibilidade; a armadilha do mês de fechamento só funciona com o campo proibido |
| Compreensão | 3 a 5 pessoas não técnicas: "quais 3 você abre, e por quê?" | 4 de 5 explicam a posição e o limite da ferramenta |

**Só em piloto** (exige F-07 e grupo de controle, F-13): adoção semanal; % de deals trabalhados que estavam em Focar; horas economizadas e tempo para decidir o foco; conversão e valor ganho com e sem a ferramenta; % de Revisar resolvidos em 30 dias. Nenhuma dessas métricas pode ser afirmada com o dataset.

## 6. Backlog por fatias

Cada fatia termina com os seus testes verdes.

0. **Ambiente:** dependências em venv limpo e Next.js; versões fixadas; `data/raw/README.md`; ajuste do commit-flow. Se a instalação for inviável, plano E do ADR-003.
1. **P0-1a:** carga e contrato (AC-1.1 a 1.5).
2. **P0-1b:** estados, guarda de campos e invariância (AC-1.6 a 1.11).
3. **P0-2a:** ordenação, legenda e CLI; o P0 já pode ser entregue sem web (AC-2.1 a 2.3 e 2.11).
4. **P0-3:** explicação no núcleo (AC-3.1 a 3.9).
5. **P0-2b:** API, com a CLI igual à API (AC-2.4 a 2.10).
6. **P0-2c:** tela e ensaio cronometrado da jornada (AC-2.12).
7. **Validação offline:** backtest, armadilha e scripts das consultas diretas (fecha CP-01).
8. **Entrega:** README, process log e commit.
9. **Contrato (Revisão 2, ADR-004):**
   - schemas tipados;
   - códigos no back;
   - catálogos de texto na tela e na CLI;
   - payload sem texto (AC-4.1 a 4.4).
10. **Interface (Revisão 3, ADR-005):**
    - design system: tokens, shadcn e tema claro e escuro;
    - navegação central e Carteira com cartão, abas e painel;
    - Equipe;
    - contrato v4 (evidência, regras e resumo por vendedor);
    - Evidência e Como funciona (AC-4.5, AC-4.6 e AC-5.x).

**Decisões desta versão:** **D-1** os seis P0 da arquitetura viram três, e o backtest de F-06 vira evidência (fatia 7). **D-2** os CSVs ficam fora do PR. **D-3** as 4 a 6 h são estimativa, sem gatilho de tempo (fecha a falha 4 do PL-021). **D-4** o `as_of` mínimo é `max(close_date)`; o cenário 2017-12-27 do ADR-002 (Focar 351) sai do aceite, porque tira da carteira deals que só fecharam depois do `as_of`. **D-5** rótulo de produto desconhecido gera erro; produto vazio vira Não pontuável. **D-6** (Revisão 2):
- o back entrega códigos, e o texto é da tela e da CLI;
- `contract_version` 3 sinaliza a saída dos campos de texto;
- as duas frases que diziam mais do que o código foram corrigidas.

**D-7** (Revisão 3):
- **Interface:** só componentes do shadcn, com tokens medidos na peça de marca e menu central, sem sidebar.
- **Dados das páginas novas:** os números de Equipe, Evidência e Como funciona vêm da API (`contract_version` 4); a tela só formata.
- **Evidência:** é o resultado gravado de `scripts/backtest.py`, sem a armadilha de vazamento.
- **Por vendedor:** a tabela segue a ordem alfabética, sem ordenação na tela (AC-2.9).

---

## Tabela de critérios de aceite

Fixture = arquivo sintético de teste. Os demais casos rodam nos CSVs reais com `as_of` 2017-12-31, salvo indicação.

| ID | P0 | Caso | DADO | QUANDO | ENTÃO |
| --- | --- | --- | --- | --- | --- |
| AC-1.1 | P0-1 | Sucesso | os 4 CSVs com o hash auditado | `check-data` roda | 8.800 linhas após cada junção, 0 preço nulo e 2.089 abertas = 298 + 1.291 + 500 + 0; limite de 138 d; Focar com 123/113/62 por faixa |
| AC-1.2 | P0-1 | Arquivo ausente | sem `products.csv` em `data/raw/` | a carga roda (CLI ou API) | erro com o nome do arquivo, a pasta esperada e o passo de download; nenhuma lista parcial; API com status 503 e a mesma mensagem |
| AC-1.3 | P0-1 | Arquivo inválido | `sales_pipeline.csv` vazio, que não seja CSV ou sem a coluna `engage_date` | a carga roda | erro com o arquivo e as colunas faltantes; nenhuma lista parcial |
| AC-1.4 | P0-1 | Contrato de rótulo | fixture com o produto `GTX Ultra`; e, à parte, a carga sem o mapa de normalização | a carga roda | erro lista o rótulo e as IDs, sem descarte; sem o mapa, 1.480 não casadas, e com o mapa, 0 |
| AC-1.5 | P0-1 | Arquivo divergente | CSVs com schema válido e SHA-256 diferente do auditado | a carga roda | `meta.audited` falso; a tela e a CLI mostram o aviso "dados diferentes da versão auditada"; os oráculos deixam de ser garantidos |
| AC-1.6 | P0-1 | Campo nulo | fixture com uma Engaging sem `engage_date` e uma aberta sem `product` | a classificação roda | as duas em Não pontuável, com os motivos "sem data de engajamento" e "sem produto"; a soma dos estados é igual ao total |
| AC-1.7 | P0-1 | Campo nulo (conta) | as 1.425 abertas sem conta | a classificação roda | o estado e a ordem são iguais aos da mesma linha com conta; a conta só alimenta o aviso |
| AC-1.8 | P0-1 | Valor extremo | `as_of` 2018-01-31, 2018-03-31 e 2030-01-01; depois `2017-12-30` e `31/12/2017` | a classificação roda | Focar 160, 34 e 0, sempre com 2.089 na partição; os dois últimos dão erro de validação com o mínimo aceito e o formato AAAA-MM-DD |
| AC-1.9 | P0-1 | Fronteira | fixture com Engaging de 138 e de 139 dias | a classificação roda | 138 d em Focar e 139 d em Revisar |
| AC-1.10 | P0-1 | Vazamento | linhas, `opportunity_id` e `close_value` das fechadas embaralhados; uma Won extra com `close_date` > `as_of` | a classificação roda | nenhum estado, faixa ou ordem muda; o limite continua em 138 d |
| AC-1.11 | P0-1 | Determinismo | a mesma entrada e a mesma política | duas execuções | saídas com o mesmo hash |
| AC-2.1 | P0-2 | Sucesso | Zane Levy | a lista é pedida | 88 = 31 + 57 + 0 + 0 em `summary`; Focar na ordem alto (11) → médio (17) → baixo (3); na mesma faixa, preço decrescente e depois ID; `ordering` traz grupos focar → revisar → qualificar → nao_pontuavel, dentro do grupo faixa → preço → ID, com `age_affects_order` falso; a tela e a CLI escrevem a partir dele a legenda "Ordem: Focar → Revisar → Qualificar → Não pontuável; em cada grupo, maior valor de tabela primeiro; a idade aparece, mas não muda a ordem." |
| AC-2.2 | P0-2 | Ordem declarada (a idade não ordena) | deals do mesmo estado e produto, com `engage_date` embaralhada entre eles | a lista é pedida | a ordem não muda; a idade aparece como coluna em Focar e Revisar |
| AC-2.3 | P0-2 | Empate | 2 ou mais deals com o mesmo estado e produto | a lista é exibida | `tie_size` > 1; a tela e a CLI os agrupam como "N oportunidades de mesmo valor de tabela" |
| AC-2.4 | P0-2 | Resultado vazio (grupo) | Darcel Schlecht | a lista é pedida | grupo focar com `empty` = `start_with_group` (grupo revisar, ação `confirm_still_active`, 138 d); a tela e a CLI mostram "Nenhuma oportunidade dentro do ciclo observado (até 138 d). Comece por Revisar: confirme no CRM quais seguem ativas."; 83 Revisar e 111 Qualificar visíveis |
| AC-2.5 | P0-2 | Resultado vazio (vendedor) | Carl Lin, sem abertas | a lista é pedida | status 200, resumo zerado e `empty.code` = `no_open_for_seller`; a tela e a CLI mostram "Nenhuma oportunidade aberta para este vendedor" |
| AC-2.6 | P0-2 | Entrada inválida | `seller=Fulano` | a API é chamada | 404 com `code` = `seller_not_found` e `params.seller`; a tela só oferece nomes de `sales_teams` |
| AC-2.7 | P0-2 | Campo nulo | linha sem conta | a lista é exibida | `account` nulo, contado em `summary.without_account`; a tela e a CLI mostram ID, produto, `engage_date` e "sem cliente registrado", e o aviso de conta uma vez, no cabeçalho |
| AC-2.8 | P0-2 | Contrato | qualquer vendedor e `as_of` válido | API e CLI são comparadas | itens, ordem e contagens idênticos; a soma dos 35 vendedores é 2.089; toda resposta passa pelo modelo tipado de `api/schemas.py` |
| AC-2.9 | P0-2 | Sem ranking de pessoas | `GET /api/sellers` e `by_seller` de `/api/pipeline` | a lista é pedida | ordem alfabética nos dois; nenhuma tela ou endpoint ordena vendedores por resultado; a tabela "Por vendedor" não tem controle de ordenação |
| AC-2.10 | P0-2 | Filtro vazio | `manager` inexistente ou combinação sem abertas | o filtro é aplicado | lista vazia com `empty.code` = `no_open_for_filter`; nunca 500 |
| AC-2.11 | P0-2 | Valor extremo | `as_of` 2030-01-01 | a lista de qualquer vendedor é pedida | grupo focar vazio (`empty`) e todas as Engaging em Revisar |
| AC-2.12 | P0-2 | Tela (roteiro manual, fatias 6 e 10) | API e tela no ar com os CSVs auditados | a jornada da seção 2 é seguida | Aparecem: "Dados até 31/12/2017" no cabeçalho; o cartão "Seu próximo passo" com o empate de `01XZ9CRY`, `FZWU2I30` e `J0G6ZLYZ`; o resumo 88 = 31 + 57 + 0 + 0; o aviso de conta uma única vez; a legenda de ordem; as abas com contagem e Focar ativa; o painel de `01XZ9CRY` com os motivos por papel e o próximo passo; Darcel abrindo em Revisar com a mensagem de Focar vazio; Equipe com 2.089 = 298 + 1.291 + 500 + 0 e a Evidência com 56,9% e 53,8%. A lista aparece em menos de 1 s após escolher o vendedor; nenhum erro; jornada do vendedor em até 2 min |
| AC-3.1 | P0-3 | Explicação da prioridade | a Focar `01XZ9CRY` (GTX Plus Pro, Initech, engajada em 2017-09-18) | o painel é aberto | `reasons`: `age_within_cycle_limit` (104 d, 138 d), `list_price` (5.482, alto), `won_cycle_reference` (P90 de 105 d, N = 479) e `closed_base_rate` (63%, de 48% a 72%); `next_action` = `work_highest_list_price_first`. A tela e a CLI mostram "Focar porque está em negociação há 104 dias, dentro do maior ciclo já fechado (138 d)", "valor de tabela 5.482 (valor de tabela alto)", a referência de 105 d com N = 479, "Não sabemos a chance de fechar desta oportunidade: cerca de 63%…" e "Trabalhe primeiro os de maior valor de tabela; empates do mesmo produto valem o mesmo." |
| AC-3.2 | P0-3 | Revisar | uma Revisar | o painel é aberto | motivo `age_above_cycle_limit` com idade e limite; `next_action` = `confirm_still_active`; texto "confirme no CRM se segue ativa", sem "perdida" nem "encerre" |
| AC-3.3 | P0-3 | Campo nulo | a Qualificar `28EJ0L9T` (GTX Plus Pro, sem cliente, sem data) | o painel é aberto | motivo `prospecting_stage` (a regra é o estágio) e contexto `no_cycle_reference` com causa `no_age`; nenhuma idade inventada; textos "Qualificar porque ainda está em prospecção" e "Sem data de engajamento: não há idade para comparar"; `next_action` = `advance_prospecting` |
| AC-3.4 | P0-3 | Valor extremo | uma aberta de GTK 500 (26.768; 15 ganhas) | o painel é aberto | `won_cycle_reference` com N = 15 e `few_cases` verdadeiro; texto "poucos casos; leia como indicação" |
| AC-3.5 | P0-3 | Sem referência | fixture com um produto sem ganhas até o `as_of` | o painel é aberto | `no_cycle_reference` com causa `no_wins` e o `as_of`; texto "sem vendas ganhas deste produto até <as_of>", sem erro |
| AC-3.6 | P0-3 | Não pontuável | item Não pontuável da fixture | o painel é aberto | motivo `missing_field` com o campo; `next_action` = `fix_missing_field`; texto "Corrija <campo> no CRM" |
| AC-3.7 | P0-3 | Verificabilidade | os 2.089 itens | os testes comparam códigos, valores e textos | os motivos de grupo e de ordem citam exatamente os valores que decidiram (back); todo número das frases da tela e da CLI vem dos parâmetros do código (front e CLI) |
| AC-3.8 | P0-3 | Vocabulário | os catálogos de texto da tela e da CLI e tudo o que eles mostram | os testes varrem os textos | nenhum termo proibido; faixas só com "de tabela"; o payload não traz texto de tela |
| AC-3.9 | P0-3 | Resultado vazio | um grupo vazio | a tela é exibida | `empty` = `group_empty` e só a mensagem do grupo, sem painel de explicação vazio |
| AC-4.1 | Contrato | Schema | as 6 rotas | o `openapi.json` é gerado | toda resposta e todo erro têm modelo tipado, sem objeto solto; o snapshot em `web/contract/` e as respostas sintéticas em `web/tests/fixtures/` estão atualizados |
| AC-4.2 | Contrato | Resposta fora do contrato | código desconhecido, tipo errado ou campo obrigatório ausente | a tela recebe a resposta | a validação zod recusa e a tela mostra a mensagem de erro; campo novo é tolerado |
| AC-4.3 | Contrato | Cobertura de textos | todos os códigos do contrato | os testes dos catálogos rodam | cada código tem texto na tela e na CLI; um código novo sem texto quebra o `typecheck` (tela) e o `pytest` (CLI) |
| AC-4.4 | Contrato | Sem texto no payload | qualquer resposta | o payload é inspecionado | nenhum campo de texto pronto (`legend`, `label`, `explanation`, `next_step`, `empty_message`…); `meta.contract_version` = 4 |
| AC-4.5 | Contrato | Evidência | o resultado gravado do backtest (`data/processed/backtest_results.json`) | `GET /api/evidence` é chamado | as 7 estratégias em código, na ordem do relatório, sem a armadilha de vazamento; Val@10 de 0,569 (regra atual) e 0,538 (só valor de tabela), delta −0,031 (IC −0,044 a −0,019); sem as que nunca fecham, 0,791 nos dois; responde sem os CSVs; arquivo ausente ou inválido → 503 com `code` = `evidence_unavailable` |
| AC-4.6 | Contrato | Regras e resumo por vendedor | os CSVs auditados | `GET /api/rules` e `GET /api/pipeline` são chamados | `rules` traz `meta`, `ordering` e as faixas (alto a partir de 3.000; médio de 500 a 2.999; baixo até 499), iguais à política; `by_seller` traz os 35 vendedores em ordem alfabética, 8 com zero abertas, com somas iguais ao `summary` (2.089); com filtro, só os vendedores do filtro |
| AC-5.1 | Interface | Tokens | `web/app/globals.css` | `tokens.test.ts` roda | todo par de texto com contraste ≥ 4,5 : 1 nos temas claro e escuro; o lilás da marca `#8091FA` igual nos dois |
| AC-5.2 | Interface | Só shadcn | as composições em `app/` e `components/` (fora de `ui/`) | `design-system.test.ts` roda | nenhum `<button>`, `<table>`, `<select>`, `<input>` ou `<details>` cru, nenhuma cor literal e nenhum `style` inline; a regra de cursor de clique (botões, links, abas, opções, combobox) fica fora de `@layer`, para valer sobre os utilitários |
| AC-5.3 | Interface | Navegação | qualquer página | o cabeçalho é exibido | os 4 itens do menu central, com `aria-current="page"` na página ativa; `/` leva a `/carteira`; sem sidebar |
| AC-5.4 | Interface | Carteira | fixtures de Ana Alfa, Bruno Beta e Carla Gama | a Carteira é aberta | o cartão mostra a ação do grupo por onde começar e o primeiro bloco da ordem com o empate inteiro, nunca um ID sozinho dentro dele; aba inicial Focar, ou o grupo de `start_with_group` quando Focar está vazio; sem abertas, só a mensagem de vazio; vendedor e aba na URL; o último vendedor volta na próxima visita |
| AC-5.5 | Interface | Painel | um item da lista | o painel é aberto | motivos agrupados por `role`, na ordem do payload; próximo passo; Anterior e Próxima na ordem do grupo; Esc fecha |
| AC-5.6 | Interface | Equipe | fixtures da equipe e filtros | a Equipe é aberta | os 4 números do `summary`, com "de N abertas" e sem percentual calculado na tela; filtros de gerente e escritório na URL e na chamada, cada um mostrando só as opções compatíveis com o outro; abaixo dos números, as abas "Por vendedor" (padrão) e "Por oportunidade", com a contagem e a escolha na URL (`?visao=oportunidades`); "Por vendedor" na ordem da API, com link para a carteira; filtro sem vendedores mostra a mensagem, sem tabela vazia; tabelas paginadas (25 por página, sem "Mostrar mais"), e a tabela acompanha o item aberto no painel |
| AC-5.7 | Interface | Evidência e Como funciona | fixtures `evidence` e `rules` | as páginas são abertas | todo código de estratégia com rótulo e descrição nas duas linguagens; linguagem de negócio por padrão, sem siglas (pp, IC95%, AUC, Val@…); linguagem técnica pela URL, com as métricas completas; todo número sai do payload; a armadilha nunca aparece; aviso quando `audited_data` é falso; grupos, faixas, referência de ciclo com N e taxa-base vindos de `/api/rules` |
| AC-5.8 | Interface | Responsivo e tema (roteiro manual) | API e tela no ar | as 4 páginas são abertas em 375 px e 1280 px | nenhuma rola na horizontal; no celular, o menu desce para a segunda linha e o gráfico some (a tabela traz os mesmos números); o tema segue o sistema por padrão, e o seletor Claro, Escuro ou Sistema guarda a escolha |

---

**Pronto para build: SIM**

**Bloqueios remanescentes** (nenhum impede começar a fatia 0):
1. **Compatibilidade da stack não testada:** FastAPI, pydantic e Next.js não estão instalados nem foram testados com Python 3.9.6 e Node 22. A fatia 0 resolve; o plano E é a contingência.
2. **Oráculos sem script no repositório (CP-01):** os números foram conferidos hoje, mas fora do repositório. As fatias 1 e 2 os transformam em teste e a fatia 7 publica os scripts. Se divergirem, a definição do limite é conferida antes de seguir.
3. **Antes do primeiro commit da solução:** o commit-flow precisa excluir `data/raw/*.csv`, `outputs/`, `.next` e `.pytest_cache`, e o `audit_log.txt` precisa trocar o caminho absoluto por um relativo.
4. **Política provisória (U-06):** faixas de valor e limite de ciclo seguem sem validação da Head de RevOps. São parâmetros, então não bloqueiam o build.
5. **Teste de compreensão:** exige de 3 a 5 testadores não técnicos e fica para depois do build, como validação. Não bloqueia.
