# PRD — Challenge 003 | Lead Scorer

**Status:** escopo congelado para build em 15/10/2026 · **Dona:** Maria Alice Dantas · **Base:** [architecture.md](./architecture.md) (ADR-001 a ADR-003), [data-audit.md](./data-audit.md) e [discovery.md](./discovery.md). Este PRD não reabre o discovery: reduz os seis P0 da arquitetura a três e fixa aceite, dados, comandos e ordem de construção. **Revisão 1** (teste de mesa, 15/10/2026): próximos passos, legenda de ordem, frase de posição e AC-2.12.

## 1. Problema e valor

- **Problema:** segundo a Head de RevOps, os vendedores escolhem no feeling quais das 2.089 oportunidades abertas trabalhar, sem critério comum e visível. O custo disso nunca foi medido.
- **Valor proposto:** uma lista única do que abrir primeiro, com o motivo de cada posição em campos verificáveis e com o que os dados não sabem. Se isso melhora o resultado, só um piloto com grupo de controle vai dizer.

## 2. Jornada de demonstração (até 2 minutos)

`as_of` = 2017-12-31. Vendedor principal: **Zane Levy**. Contraste: **Darcel Schlecht**.

| Etapa | O usuário faz | Informação visível | Reação do sistema |
| --- | --- | --- | --- |
| 1. Entrada (0:00–0:20) | Abre `localhost:3000` e escolhe Zane Levy | "Dados até 31/12/2017"; os 35 vendedores em ordem alfabética | Responde em menos de 1 s; nenhum percentual de chance |
| 2. Interpretação (0:20–0:50) | Lê o resumo e a lista | 88 abertas = 31 Focar + 57 Revisar; aviso único "59 de 88 sem cliente registrado"; legenda de ordem; Focar com ID, produto, cliente, valor de tabela e idade | Ordena por estado → faixa → preço → ID; agrupa empates; a idade não ordena |
| 3. Decisão (0:50–1:30) | Abre `01XZ9CRY` e escolhe 3 deals | "Por que está aqui": posição, valor de tabela, idade × ciclo, "não sabemos a chance" e próximo passo | As frases só usam campos da linha |
| 4. Ação seguinte (1:30–2:00) | Abre "Revisar" e troca para Darcel Schlecht | "Confirme no CRM se segue ativa"; Darcel: Focar vazio com mensagem e próximo passo ("Comece por Revisar"), 83 Revisar e 111 Qualificar | O vendedor age no CRM pelo ID (a ferramenta só lê, RE-03); o estado vazio não quebra a tela |

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
- **Entradas:** saída de P0-1, `seller` e `as_of`; `manager` e `office` só na API.
- **Saídas:** `GET /api/meta`; `/api/sellers` (ordem alfabética); `/api/sellers/{seller}/pipeline?as_of=` (`summary`, `account_warning` e grupos com itens e `empty_message`); `/api/pipeline?manager=&office=`; uma página Next.js; CLI `python -m leadscorer list`.
- **Lógica:** estado → faixa de valor de tabela (alto ≥ 3.000; médio de 500 a 2.999; baixo < 500) → preço decrescente → ID, só para estabilidade. A idade é coluna; mesmo estado e produto é empate agrupado; vendedores nunca são ordenados. Acima da lista vai a legenda fixa "Ordem: Focar → Revisar → Qualificar → Não pontuável; em cada grupo, maior valor de tabela primeiro; a idade aparece, mas não muda a ordem." Faixas e limite são política provisória (U-06).
- **Dados ausentes:** vendedor inexistente → 404; vendedor sem abertas (8), grupo vazio ou filtro vazio → mensagem própria; Focar vazio (6 vendedores) ainda aponta o próximo grupo com oportunidades; conta nula → "sem cliente registrado" (AC-2.4 a 2.7 e 2.10).
- **Pronto quando:** AC-2.x verdes, CLI igual à API e a jornada rodando sem intervenção.

**P0-3 · "Por que está aqui".** Origem: F-02 e a frase mínima de F-09; RB-03, RE-04, RD-01, RD-05, RJ-07, Q-03.
- **Descrição:** explica cada posição com frases de modelo fixo, preenchidas com campos, e dá o próximo passo.
- **Entradas e saídas:** linha e `meta` de P0-1 → `explanation: [{factor, text, fields}]` na API, na tela e na CLI.
- **Lógica:** sem LLM. Frases: posição ("<Estado> porque <está em negociação há X dias, dentro/acima do maior ciclo já fechado (138 d) | ainda não tem data de engajamento | falta <campo>>"); valor de tabela ("preço de catálogo, não valor negociado"); idade × P90 das ganhas do produto (com N) e o limite; e a fixa "Não sabemos a chance de fechar: cerca de 63% das fechadas foram ganhas (48% a 72% contando as abertas), e isso não diferencia uma da outra".
- **Próximo passo:** Focar, "Trabalhe primeiro os de maior valor de tabela; empates do mesmo produto valem o mesmo." Revisar, "Confirme no CRM se segue ativa: idade acima do ciclo não prova que o negócio terminou." Qualificar, "Ainda em prospecção: avance no CRM os de maior valor de tabela e registre a data de engajamento quando houver contato." Não pontuável, "Corrija <campo> no CRM." Focar vazio: "Nenhuma oportunidade dentro do ciclo observado (até 138 d). Comece por Revisar: confirme no CRM quais seguem ativas." (Se Revisar também estiver vazio, aponta Qualificar.) Vocabulário proibido: AC-3.8.
- **Dados ausentes:** sem idade, com menos de 30 ganhas do produto (GTK 500 tem 15) ou sem nenhuma ganha → frase própria, sem número inventado; conta nula → só o aviso do cabeçalho (AC-3.3 a 3.5).
- **Pronto quando:** AC-3.x verdes e 100% dos itens explicados.

**Fora do escopo:** F-07, F-08, F-10 a F-13, RJ-01 a RJ-07, escrita no CRM e envio por Slack ou e-mail.

## 4. Dados, dependências, comandos e riscos

**Dados:** os quatro CSVs do Kaggle (CC0) em `solution/data/raw/`, conferidos pelo SHA-256 de [`A§7`](./data-audit.md#a-7); demonstração com Zane Levy, Darcel Schlecht (sem Focar) e Carl Lin (sem abertas). Testes unitários usam fixtures sintéticas; o e2e usa os CSVs reais e é pulado com aviso se eles faltarem.

**Oráculos:** os números e registros de AC-1.1, AC-1.8, AC-2.1, AC-2.4, AC-3.1 e AC-3.3 foram conferidos nos CSVs em 15/10/2026, por consulta fora do repositório (CP-01).

**Dependências:** Python 3.9.6 com pandas 2.2.3 e numpy 2.0.2; FastAPI, uvicorn, pytest e httpx fixados na fatia 0; scipy e scikit-learn só no backtest; Node 22.12 e npm 11.5 com Next.js e lockfile. Sem banco, sem segredo, sem LLM e sem rede em execução.

**Comandos do avaliador** (em `submissions/alice-dantas/challenge-003-lead-scorer/solution/`):

```bash
# 0. Baixar o dataset no Kaggle pelo navegador e copiar os 4 CSVs para data/raw/
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m leadscorer check-data          # presença, colunas, hash e reconciliação
.venv/bin/pytest
.venv/bin/uvicorn api.main:app --port 8000
cd web && npm ci && npm run dev                    # http://localhost:3000
.venv/bin/python -m leadscorer list --seller "Zane Levy"   # caminho sem Node
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
| Funcionalidade | pytest e a jornada da seção 2 | 100% verde; jornada em até 2 min |
| Lógica | Partição, reconciliação, `as_of`, invariância e texto | Bate com os oráculos |
| Ranking offline válido | Backtest em 5 cortes, só com o que se sabia em cada um; AUC com IC contra taxa global, por produto, aleatório e só valor; valor capturado à parte | Sem vazamento e reprodutível; AUC perto de 0,5 é esperado e reportado; a armadilha do mês de fechamento só chega a ~0,64 com o campo proibido |
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

**Decisões desta versão:** **D-1** os seis P0 da arquitetura viram três, e o backtest de F-06 vira evidência (fatia 7). **D-2** os CSVs ficam fora do PR. **D-3** as 4 a 6 h são estimativa, sem gatilho de tempo (fecha a falha 4 do PL-021). **D-4** o `as_of` mínimo é `max(close_date)`; o cenário 2017-12-27 do ADR-002 (Focar 351) sai do aceite, porque tira da carteira deals que só fecharam depois do `as_of`. **D-5** rótulo de produto desconhecido gera erro; produto vazio vira Não pontuável.

---

## Tabela de critérios de aceite

Fixture = arquivo sintético de teste. Os demais casos rodam nos CSVs reais com `as_of` 2017-12-31, salvo indicação.

| ID | P0 | Caso | DADO | QUANDO | ENTÃO |
| --- | --- | --- | --- | --- | --- |
| AC-1.1 | P0-1 | Sucesso | os 4 CSVs com o hash auditado | `check-data` roda | 8.800 linhas após cada junção, 0 preço nulo e 2.089 abertas = 298 + 1.291 + 500 + 0; limite de 138 d; Focar com 123/113/62 por faixa |
| AC-1.2 | P0-1 | Arquivo ausente | sem `products.csv` em `data/raw/` | a carga roda (CLI ou API) | erro com o nome do arquivo, a pasta esperada e o passo de download; nenhuma lista parcial; API com status 503 e a mesma mensagem |
| AC-1.3 | P0-1 | Arquivo inválido | `sales_pipeline.csv` vazio, que não seja CSV ou sem a coluna `engage_date` | a carga roda | erro com o arquivo e as colunas faltantes; nenhuma lista parcial |
| AC-1.4 | P0-1 | Contrato de rótulo | fixture com o produto `GTX Ultra`; e, à parte, a carga sem o mapa de normalização | a carga roda | erro lista o rótulo e as IDs, sem descarte; sem o mapa, 1.480 não casadas, e com o mapa, 0 |
| AC-1.5 | P0-1 | Arquivo divergente | CSVs com schema válido e SHA-256 diferente do auditado | a carga roda | aviso visível "dados diferentes da versão auditada"; os oráculos deixam de ser garantidos |
| AC-1.6 | P0-1 | Campo nulo | fixture com uma Engaging sem `engage_date` e uma aberta sem `product` | a classificação roda | as duas em Não pontuável, com os motivos "sem data de engajamento" e "sem produto"; a soma dos estados é igual ao total |
| AC-1.7 | P0-1 | Campo nulo (conta) | as 1.425 abertas sem conta | a classificação roda | o estado e a ordem são iguais aos da mesma linha com conta; a conta só alimenta o aviso |
| AC-1.8 | P0-1 | Valor extremo | `as_of` 2018-01-31, 2018-03-31 e 2030-01-01; depois `2017-12-30` e `31/12/2017` | a classificação roda | Focar 160, 34 e 0, sempre com 2.089 na partição; os dois últimos dão erro de validação com o mínimo aceito e o formato AAAA-MM-DD |
| AC-1.9 | P0-1 | Fronteira | fixture com Engaging de 138 e de 139 dias | a classificação roda | 138 d em Focar e 139 d em Revisar |
| AC-1.10 | P0-1 | Vazamento | linhas, `opportunity_id` e `close_value` das fechadas embaralhados; uma Won extra com `close_date` > `as_of` | a classificação roda | nenhum estado, faixa ou ordem muda; o limite continua em 138 d |
| AC-1.11 | P0-1 | Determinismo | a mesma entrada e a mesma política | duas execuções | saídas com o mesmo hash |
| AC-2.1 | P0-2 | Sucesso | Zane Levy | a lista é pedida | 88 = 31 + 57 + 0 + 0; Focar na ordem alto (11) → médio (17) → baixo (3); na mesma faixa, preço decrescente e depois ID; a legenda "Ordem: Focar → Revisar → Qualificar → Não pontuável; em cada grupo, maior valor de tabela primeiro; a idade aparece, mas não muda a ordem." acompanha a lista na CLI, na API e na tela |
| AC-2.2 | P0-2 | Ordem declarada (a idade não ordena) | deals do mesmo estado e produto, com `engage_date` embaralhada entre eles | a lista é pedida | a ordem não muda; a idade aparece como coluna em Focar e Revisar |
| AC-2.3 | P0-2 | Empate | 2 ou mais deals com o mesmo estado e produto | a lista é exibida | aparecem agrupados como "N oportunidades de mesmo valor de tabela" |
| AC-2.4 | P0-2 | Resultado vazio (grupo) | Darcel Schlecht | a lista é pedida | Focar vazio com "Nenhuma oportunidade dentro do ciclo observado (até 138 d). Comece por Revisar: confirme no CRM quais seguem ativas."; 83 Revisar e 111 Qualificar visíveis |
| AC-2.5 | P0-2 | Resultado vazio (vendedor) | Carl Lin, sem abertas | a lista é pedida | status 200, resumo zerado e "Nenhuma oportunidade aberta para este vendedor" |
| AC-2.6 | P0-2 | Entrada inválida | `seller=Fulano` | a API é chamada | 404 com mensagem; a tela só oferece nomes de `sales_teams` |
| AC-2.7 | P0-2 | Campo nulo | linha sem conta | a lista é exibida | ID, produto, `engage_date` e "sem cliente registrado"; o aviso de conta aparece uma vez, no cabeçalho |
| AC-2.8 | P0-2 | Contrato | qualquer vendedor e `as_of` válido | API e CLI são comparadas | itens, ordem e contagens idênticos; a soma dos 35 vendedores é 2.089 |
| AC-2.9 | P0-2 | Sem ranking de pessoas | `GET /api/sellers` | a lista é pedida | ordem alfabética; nenhuma tela ou endpoint ordena vendedores por resultado |
| AC-2.10 | P0-2 | Filtro vazio | `manager` inexistente ou combinação sem abertas | o filtro é aplicado | lista vazia com mensagem; nunca 500 |
| AC-2.11 | P0-2 | Valor extremo | `as_of` 2030-01-01 | a lista de qualquer vendedor é pedida | Focar vazio com mensagem e todas as Engaging em Revisar |
| AC-2.12 | P0-2 | Tela (roteiro manual, fatia 6) | API e tela no ar com os CSVs auditados | a jornada da seção 2 é seguida | aparecem "Dados até 31/12/2017" no cabeçalho, o resumo 88 = 31 + 57 + 0 + 0, o aviso de conta uma única vez, a legenda de ordem, o painel de `01XZ9CRY` com as frases e o próximo passo, e Darcel com Focar vazio e próximo passo; a lista aparece em menos de 1 s após escolher o vendedor; nenhum erro; jornada em até 2 min |
| AC-3.1 | P0-3 | Explicação da prioridade | a Focar `01XZ9CRY` (GTX Plus Pro, Initech, engajada em 2017-09-18) | o painel é aberto | frase 1 "Focar porque está em negociação há 104 dias, dentro do maior ciclo já fechado (138 d)"; "valor de tabela 5.482 (valor de tabela alto)"; P90 de 105 d com N = 479; a frase "Não sabemos a chance"; próximo passo "Trabalhe primeiro os de maior valor de tabela; empates do mesmo produto valem o mesmo." |
| AC-3.2 | P0-3 | Revisar | uma Revisar | o painel é aberto | idade, limite e "confirme no CRM se segue ativa"; sem "perdida" nem "encerre" |
| AC-3.3 | P0-3 | Campo nulo | a Qualificar `28EJ0L9T` (GTX Plus Pro, sem cliente, sem data) | o painel é aberto | frase 1 "Qualificar porque ainda não tem data de engajamento"; "sem data de engajamento: não há idade para comparar"; nenhuma idade inventada; próximo passo "Ainda em prospecção: avance no CRM os de maior valor de tabela e registre a data de engajamento quando houver contato." |
| AC-3.4 | P0-3 | Valor extremo | uma aberta de GTK 500 (26.768; 15 ganhas) | o painel é aberto | mostra N = 15 e "poucos casos; leia como indicação" |
| AC-3.5 | P0-3 | Sem referência | fixture com um produto sem ganhas até o `as_of` | o painel é aberto | "sem vendas ganhas deste produto até <as_of>", sem erro |
| AC-3.6 | P0-3 | Não pontuável | item Não pontuável da fixture | o painel é aberto | o motivo e "corrija <campo> no CRM" |
| AC-3.7 | P0-3 | Verificabilidade | as 2.089 explicações | o teste compara textos e campos | 100% dos números coincidem com os campos, e cada frase lista seus `fields` |
| AC-3.8 | P0-3 | Vocabulário | todos os textos da API, da CLI e da tela | o teste varre os textos | nenhum termo proibido; faixas só com "de tabela"; a frase da taxa-base em 100% dos itens |
| AC-3.9 | P0-3 | Resultado vazio | um grupo vazio | a tela é exibida | só a mensagem do grupo, sem painel de explicação vazio |

---

**Pronto para build: SIM**

**Bloqueios remanescentes** (nenhum impede começar a fatia 0):
1. **Compatibilidade da stack não testada:** FastAPI, pydantic e Next.js não estão instalados nem foram testados com Python 3.9.6 e Node 22. A fatia 0 resolve; o plano E é a contingência.
2. **Oráculos sem script no repositório (CP-01):** os números foram conferidos hoje, mas fora do repositório. As fatias 1 e 2 os transformam em teste e a fatia 7 publica os scripts. Se divergirem, a definição do limite é conferida antes de seguir.
3. **Antes do primeiro commit da solução:** o commit-flow precisa excluir `data/raw/*.csv`, `outputs/`, `.next` e `.pytest_cache`, e o `audit_log.txt` precisa trocar o caminho absoluto por um relativo.
4. **Política provisória (U-06):** faixas de valor e limite de ciclo seguem sem validação da Head de RevOps. São parâmetros, então não bloqueiam o build.
5. **Teste de compreensão:** exige de 3 a 5 testadores não técnicos e fica para depois do build, como validação. Não bloqueia.
