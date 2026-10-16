# Build Plan — Challenge 003 | Lead Scorer

**Status:** proposto em 15/10/2026, aguardando o "go" da Spec 1 · **Base:** [prd.md](./prd.md) (escopo congelado), [architecture.md](./architecture.md) (ADR-001 a ADR-003) e [data-audit.md](./data-audit.md). Este plano não reabre escopo: reagrupa o backlog de 9 fatias do PRD (seção 6) em **4 specs**, ordenadas por risco, com tempo-limite e gatilho de corte por incremento.

**Conferência prévia (15/10/2026, só leitura, fora do repositório):** SHA-256 dos 5 CSVs idêntico a [`A§7`](./data-audit.md#a-7); 8.800 linhas após as junções, 0 preço nulo; limite 138 d; 2.089 abertas = 298 + 1.291 + 500 + 0; Focar 123/113/62; Zane Levy 88 = 31 + 57 (59 sem cliente; Focar 11/17/3); Darcel Schlecht 0/83/111; Carl Lin 0; 8 vendedores sem abertas e 6 com Focar vazio; `01XZ9CRY` com 104 d e P90 105 d (N = 479); `28EJ0L9T` em Qualificar, sem cliente e sem data; Focar 160/34/0 em 2018-01-31/2018-03-31/2030-01-01; taxa-base 63,15%. **Os oráculos do PRD batem.**

## 0. Resumo

| Spec | Objetivo (ordem de risco) | ACs | ⏱ | Saída visível ao final |
| --- | --- | --- | --- | --- |
| **1. Fluxo principal** | Fatia vertical: dados → validação → estados → lista por vendedor na CLI | 1.1, 1.4 (regressão), 1.9, 2.1, 2.2, 2.3, 2.7 | 1h45 | `list --seller "Zane Levy"` mostra 88 = 31 + 57 + 0 + 0 em ordem declarada |
| **2. Explicabilidade** | "Por que está aqui" com frases fixas, campos verificáveis e próximo passo | 3.1 a 3.4, 3.7, 3.8 | 1h00 | `explain --id 01XZ9CRY` mostra as frases do AC-3.1 |
| **3. Erros, bordas e API** | Falhas explícitas, nulos, estados vazios, invariância e contrato HTTP | 1.2 a 1.8, 1.10, 1.11, 2.4 a 2.6, 2.8 a 2.11, 3.5, 3.6 | 1h15 | API em `:8000` com 404/422/503 e paridade CLI = API |
| **4. Tela e entrega** | Página Next.js, ensaio cronometrado, README e commit | 2.12, 3.8 (tela), 3.9 | 1h15 (+0h30 opcional) | Jornada da seção 2 do PRD em `localhost:3000` em até 2 min |

**Orçamento de build:** 5h15 planejadas + 0h45 de folga = 6h00 (teto do briefing), contado a partir do "go" e independente do tempo já gasto no discovery.

## 1. Fatia vertical mínima

A menor jornada completa é **a lista de um vendedor na CLI**, e é exatamente a Spec 1:

| Camada | O que entra | Como se verifica |
| --- | --- | --- |
| Dados | `sales_pipeline`, `products`, `sales_teams` e `accounts` de `data/raw/`, lidos como texto; `GTXPro` → `GTX Pro` por mapa explícito | Regressão: sem o mapa, 1.480 não casadas; com o mapa, 0 |
| Validação | Colunas exigidas presentes; junções `m:1`; 8.800 linhas após cada passo; 0 preço nulo; hash comparado ao auditado | `check-data` imprime a reconciliação |
| Lógica | `as_of` = `max(close_date)`; limite = maior ciclo das fechadas até o `as_of`; Focar, Revisar e Qualificar; ordem estado → faixa → preço decrescente → ID | Partição = 2.089; fronteira 138/139 d |
| Saída | "Dados até 31/12/2017", resumo por estado, aviso de conta único, legenda fixa, itens com ID, produto, cliente, valor de tabela e idade | Teste e2e com os números de Zane Levy |

**Por que CLI e não a tela:** é o caminho mais curto que cobre as quatro camadas com um só runtime. O ADR-003 já a define como rede de segurança, e a tela é só apresentação sobre o mesmo payload (`views.py`). Explicação, erros, Não pontuável, API e tela entram nas specs seguintes, sem retrabalho no núcleo.

## 2. Ambiente: instalação e reprodução

**Stack (coerente com o ADR-003):** Python 3.9.6 do sistema + `venv` com pandas (núcleo), FastAPI + uvicorn (API fina), pytest + httpx (testes), Node 22.12 + npm 11.5.2 com Next.js (uma página). Sem banco, Docker, CI, autenticação, `.env`, LLM, API do Kaggle nem rede em execução.

**Reprodução pelo avaliador** (em `solution/`):

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m leadscorer check-data
.venv/bin/pytest
.venv/bin/python -m leadscorer list --seller "Zane Levy"
.venv/bin/uvicorn api.main:app --port 8000
cd web && npm ci && npm run dev
```

As quatro primeiras linhas já entregam o P0 sem Node. As versões do FastAPI, uvicorn, pytest e httpx são as que o pip resolver para Python 3.9 no incremento 1.1, fixadas com `==`. O `pip` do `.venv` é o 21.2.4: se ele não resolver as rodas em um `venv` limpo, o README ganha `.venv/bin/pip install -U pip` como passo explícito.

**Desvios declarados em relação ao ADR e ao PRD:**

| # | Desvio | Motivo |
| --- | --- | --- |
| DV-1 | As 9 fatias do PRD viram 4 specs | Agrupamento pedido; nenhum AC sai do escopo |
| DV-2 | Gatilhos de tempo por incremento (o PRD, em D-3, dizia "sem gatilho de tempo") | Pedido desta etapa; fecha o risco de prazo |
| DV-3 | Erros e bordas depois da explicação (o PRD fazia a invariância antes da ordenação) | Ordem por risco: fluxo → explicação → erros → refinamentos. Os CSVs reais não têm Não pontuável, então o fluxo principal não depende disso |
| DV-4 | A CLI imprime no terminal (texto ou `--json`) e não gera CSV em `outputs/` (ADR-003) | Elimina o risco de republicar o dataset linha a linha (tabela de riscos do PRD) |
| DV-5 | Fixtures sintéticas geradas em código (`tmp_path`), sem CSV de teste no repositório | Nenhum `.csv` precisa ser versionado |
| DV-6 | Next.js em JavaScript, uma página, sem TypeScript, Tailwind ou ESLint | Menos dependências e menos risco de setup |
| DV-7 | Instalação limpa testada em um `venv` temporário fora do repositório; o `.venv` atual (206 MB) não é apagado | Evita operação destrutiva |
| DV-8 | P90 = quantil linear (padrão do pandas), arredondado para dia inteiro | O PRD não fixa a regra; com ela, P90 vai de 102 a 116 d, como no audit |
| DV-9 | Subcomando `explain --id` na CLI (o PRD só nomeia `list` e `check-data`) | P0-3 pede a explicação também na CLI |
| DV-10 | Backtest (fatia 7) opcional e primeiro item cortado | O `audit_data.py` já cobre 5 cortes e a armadilha (`A§2.9`); falta só o baseline "só valor" |

## 3. Dados ausentes e fallbacks

| A ADR ou o PRD dependem de | Existe? | Fallback que preserva a tarefa central | Limitação rotulada onde |
| --- | --- | --- | --- |
| Data real de extração | Não | `as_of` = `max(close_date)` = 2017-12-31, parâmetro validado | Cabeçalho "Dados até 31/12/2017"; README: idade é premissa |
| Conta nas abertas | Em 31,8% | Aviso único no cabeçalho; a linha é identificada pelo ID | "59 de 88 sem cliente registrado" |
| Política validada pela Head de RevOps (U-06) | Não | Faixas 3.000/500 e limite em `policy.py`, editáveis | README: "política provisória" |
| Atividade e histórico de estágio | Não | Revisar mostra um fato (idade × ciclo), não um alerta | Frase "idade acima do ciclo não prova que o negócio terminou" |
| CSVs no PR | Não (D-2) | `data/raw/README.md` com link e SHA-256; erro com o passo de download; e2e pulado com aviso; unitários com fixtures | Mensagem do AC-1.2; motivo do `skip` no pytest |
| Scripts dos oráculos (CP-01) | Não | `tests/test_real_data.py` passa a ser o script reproduzível | — |
| Ganhas suficientes por produto | GTK 500 tem 15 | "poucos casos; leia como indicação"; sem ganhas, frase própria | AC-3.4 e AC-3.5 |
| Testadores não técnicos | Não | Teste de compreensão depois do build | README: "compreensão ainda não testada" |
| Piloto com controle | Não | Métricas de impacto só em piloto | README, seção Limitações |

## 4. Specs

Cada incremento termina com os seus testes verdes. **⏱** é o tempo-limite; **corte** é o ponto (⏱ + 50%) em que se aplica o corte previsto e se segue em frente.

**Contrato único** (`views.py`), usado pela CLI (`--json`), pela API e pela tela, o que garante a paridade do AC-2.8 por construção:

```text
meta:    as_of, data_label, cycle_limit_days, base_rate, p90_by_product{days, n}, audited_hash
seller, legend, summary{total, focar, revisar, qualificar, nao_pontuavel}, account_warning
groups[]: state, label, count, empty_message, next_step,
          items[]: opportunity_id, product, account|null, sales_price, value_band,
                   engage_date|null, age_days|null, tie_size, explanation[{factor, text, fields}]
```

### Spec 1 — Fluxo principal (fatia vertical na CLI) · 1h45

#### 1.1 Ambiente e guarda de commit · ⏱ 20 min · corte aos 30

- **Entradas:** `requirements.txt` atual; Node 22.12 e npm 11.5.2; `commit-flow.md`.
- **Arquivos:** `solution/requirements.txt`, `solution/pytest.ini`, `solution/data/raw/README.md`, `solution/scripts/audit_data.py` (linha 253: caminho relativo), `solution/data/processed/audit_log.txt` (linha 3), `../../docs/commit-flow.md`.
- **Depende de:** nada.
- **Comando:** `.venv/bin/pip install fastapi uvicorn pytest httpx`; depois, em um diretório temporário, `python3 -m venv <tmp>/v && <tmp>/v/bin/pip install -r requirements.txt && <tmp>/v/bin/python -c "import fastapi, uvicorn, httpx, pandas"`; smoke de Node no mesmo diretório temporário: `npm i next react react-dom && npx next --version`.
- **Teste esperado:** imports ok no `venv` limpo; `pytest --collect-only` sem erro; `next --version` responde.
- **Pronto quando:** dependências fixadas com `==`; a etapa 4 do `commit-flow.md` passa a usar o comando da seção 7, e a checagem da etapa 5 ganha `\.csv$`, `.next` e `.pytest_cache`; `audit_log.txt` sem `/Users/`; a simulação não lista nenhum `.csv` nem nada de `.venv`.
- **Se atrasar:** se as dependências Python não resolverem, fixar a última linha conhecida com suporte a 3.9 (fastapi 0.115.x, pydantic 2.10.x, uvicorn 0.32.x, pytest 8.3.x, httpx 0.28.x). Se ainda falhar, usar o plano B do ADR-003 (CLI + HTML estático), declarado. Se o Node falhar, **o plano E fica decidido aqui** (HTML/JS servido pela FastAPI) e a Spec 4 já começa nele.
- **Checkpoint Git:** `chore(solution): pin dependencies and exclude data from commit flow`

#### 1.2 Carga, normalização e reconciliação · ⏱ 30 min · corte aos 45

- **Entradas:** os 4 CSVs; em `policy.py`: `PRODUCT_MAP`, `REQUIRED_COLUMNS`, `AUDITED_SHA256`.
- **Arquivos:** `leadscorer/__init__.py`, `leadscorer/policy.py`, `leadscorer/data.py`, `leadscorer/__main__.py` (`check-data`), `tests/conftest.py` (gerador de fixtures e marcador de dados reais), `tests/test_data.py`, `tests/test_real_data.py`.
- **Depende de:** 1.1.
- **Comando:** `.venv/bin/python -m leadscorer check-data` e `.venv/bin/pytest tests/test_data.py tests/test_real_data.py`.
- **Teste esperado:** parte de dados do AC-1.1 (8.800 linhas em cada junção, 0 preço nulo, 2.089 abertas, hash igual ao auditado); regressão do AC-1.4 (sem o mapa, 1.480 não casadas; com o mapa, 0).
- **Pronto quando:** a carga é uma função pura que não escreve nada em `data/raw/`; `check-data` imprime as contagens por passo e o resultado do hash.
- **Se atrasar:** a reconciliação fica só no terminal, sem relatório em arquivo.
- **Checkpoint Git:** `feat(core): load, normalize GTXPro and reconcile 8800/2089`

#### 1.3 Estados e ordenação · ⏱ 30 min · corte aos 45

- **Entradas:** o frame de 1.2; política com `as_of` padrão, limite derivado das fechadas até o `as_of` e faixas (alto ≥ 3.000; médio de 500 a 2.999; baixo < 500).
- **Arquivos:** `leadscorer/triage.py`, `tests/test_triage.py`, `tests/test_real_data.py`.
- **Depende de:** 1.2.
- **Comando:** `.venv/bin/pytest tests/test_triage.py tests/test_real_data.py`.
- **Teste esperado:** restante do AC-1.1 (298/1.291/500/0; limite 138 d; Focar 123/113/62); AC-1.9 (138 d em Focar, 139 d em Revisar); AC-2.2 (embaralhar `engage_date` dentro do mesmo estado e produto não muda a ordem); AC-2.3 (empates do mesmo estado e produto recebem `tie_size`).
- **Pronto quando:** `classify()` e `order()` são puras; a partição soma o total, também por vendedor; a idade é coluna e não entra na chave de ordenação.
- **Se atrasar:** o empate fica só como campo no dado; o texto "N oportunidades de mesmo valor de tabela" passa para 1.4.
- **Checkpoint Git:** `feat(core): Focar/Revisar/Qualificar states and declared order`

#### 1.4 Lista por vendedor na CLI (fecha a fatia vertical) · ⏱ 25 min · corte aos 40

- **Entradas:** saída de 1.3; argumentos `--seller` e `--as-of` (só o formato; a validação completa fica em 3.1).
- **Arquivos:** `leadscorer/views.py`, `leadscorer/__main__.py` (`list`, com `--json`), `tests/test_views.py`.
- **Depende de:** 1.3.
- **Comando:** `.venv/bin/python -m leadscorer list --seller "Zane Levy"`.
- **Teste esperado:** AC-2.1 (88 = 31 + 57 + 0 + 0; Focar alto 11 → médio 17 → baixo 3; preço decrescente e depois ID; legenda exata); AC-2.7 (sem conta → "sem cliente registrado"; aviso "59 de 88 sem cliente registrado" uma única vez); cabeçalho "Dados até 31/12/2017"; nenhum "%" de chance na saída.
- **Pronto quando:** as etapas 1 e 2 da jornada do PRD rodam no terminal; `--json` imprime o contrato único.
- **Se atrasar:** formatação mínima, uma linha por item; o agrupamento visual de empates vai para a Spec 4.
- **Checkpoint Git:** `feat(cli): per-seller focus list (P0 vertical slice)`

### Spec 2 — Explicabilidade "Por que está aqui" · 1h00

#### 2.1 Referências: P90 e N por produto e taxa-base · ⏱ 20 min · corte aos 30

- **Entradas:** fechadas com `close_date` ≤ `as_of`; Won por produto.
- **Arquivos:** `leadscorer/triage.py` (`reference_stats`), `leadscorer/views.py` (`meta`), `tests/test_explain.py`.
- **Depende de:** 1.4.
- **Comando:** `.venv/bin/pytest tests/test_explain.py -k reference`.
- **Teste esperado:** GTX Plus Pro com P90 105 d e N = 479; GTK 500 com N = 15; taxa-base 63,15%, exibida como "cerca de 63%".
- **Pronto quando:** `meta` traz limite, P90, N e taxa-base calculados só com o que existia até o `as_of` (DV-8).
- **Se atrasar:** P90 só do produto da linha, sem a tabela completa no `meta`.
- **Checkpoint Git:** junto com 2.2.

#### 2.2 Frases e próximo passo · ⏱ 25 min · corte aos 40

- **Entradas:** item + `meta`; textos fixos do PRD (P0-3) em `policy.py`.
- **Arquivos:** `leadscorer/explain.py`, `leadscorer/policy.py`, `leadscorer/views.py` (`explanation`, `next_step`), `leadscorer/__main__.py` (`explain --id`), `tests/test_explain.py`.
- **Depende de:** 2.1.
- **Comando:** `.venv/bin/python -m leadscorer explain --id 01XZ9CRY`.
- **Teste esperado:** AC-3.1 (texto exato para `01XZ9CRY`: 104 d, 138 d, 5.482, "valor de tabela alto", P90 105 d com N = 479, frase "Não sabemos a chance", próximo passo de Focar); AC-3.2 (Revisar com idade, limite e "confirme no CRM se segue ativa"); AC-3.3 (`28EJ0L9T`, sem idade inventada); AC-3.4 (GTK 500 com N = 15 e "poucos casos; leia como indicação").
- **Pronto quando:** cada frase é `{factor, text, fields}`, sem LLM, e todo item tem explicação e próximo passo.
- **Se atrasar:** a frase de P90 sai sem o limite global; posição, valor de tabela, taxa-base e próximo passo não são cortados.
- **Checkpoint Git:** `feat(core): verifiable "why it's here" sentences and next step`

#### 2.3 Verificabilidade e vocabulário · ⏱ 15 min · corte aos 25

- **Entradas:** as 2.089 explicações dos CSVs reais e a saída da CLI.
- **Arquivos:** `tests/test_explain.py`.
- **Depende de:** 2.2.
- **Comando:** `.venv/bin/pytest tests/test_explain.py`.
- **Teste esperado:** AC-3.7 (todo número do texto aparece em `fields`, e cada frase lista seus `fields`); AC-3.8 (nenhum de "probabilidade", "perdida", "encerre", "prioridade alta", "chance alta", "score"; faixa sempre com "de tabela"; frase da taxa-base em 100% dos itens).
- **Pronto quando:** a varredura cobre o payload, que é o mesmo da API e da tela.
- **Se atrasar:** o AC-3.7 confere só os números (regex), não a correspondência frase a frase.
- **Checkpoint Git:** `test(core): explanation verifiability and banned vocabulary`

### Spec 3 — Erros, bordas e API · 1h15

#### 3.1 Erros de carga e de política · ⏱ 25 min · corte aos 40

- **Entradas:** fixtures com arquivo ausente, vazio, não CSV, sem `engage_date`, produto `GTX Ultra` e hash divergente; `as_of` inválidos.
- **Arquivos:** `leadscorer/errors.py`, `leadscorer/data.py`, `leadscorer/policy.py` (validação do `as_of`), `leadscorer/__main__.py` (mensagem e código de saída ≠ 0), `tests/test_errors.py`.
- **Depende de:** Spec 1.
- **Comando:** `.venv/bin/pytest tests/test_errors.py` e `.venv/bin/python -m leadscorer list --seller "Zane Levy" --as-of 31/12/2017`.
- **Teste esperado:** AC-1.2 (nome do arquivo, pasta e passo de download, sem lista parcial); AC-1.3; AC-1.4 (rótulo e IDs, sem descarte); AC-1.5 (aviso "dados diferentes da versão auditada"); AC-1.8 (Focar 160/34/0 com 2.089; `2017-12-30` e `31/12/2017` com erro que cita o mínimo e o formato AAAA-MM-DD).
- **Pronto quando:** nenhum erro sai como traceback; todo erro é `DataError` ou `PolicyError`, com mensagem para o usuário.
- **Se atrasar:** o AC-1.3 cobre só a coluna ausente; arquivo vazio e não CSV caem na mesma mensagem genérica de "arquivo inválido".
- **Checkpoint Git:** `feat(core): explicit load and as_of errors`

#### 3.2 Nulos, estados vazios e invariância · ⏱ 20 min · corte aos 30

- **Entradas:** fixtures com Engaging sem data, aberta sem produto e produto sem ganhas; Darcel Schlecht, Carl Lin e `as_of` 2030-01-01 nos CSVs reais.
- **Arquivos:** `leadscorer/triage.py` (Não pontuável), `leadscorer/explain.py` (frases de borda), `leadscorer/views.py` (`empty_message`; Focar vazio aponta Revisar e, se este também estiver vazio, Qualificar), `tests/test_edges.py`.
- **Depende de:** 3.1.
- **Comando:** `.venv/bin/pytest tests/test_edges.py` e `.venv/bin/python -m leadscorer list --seller "Darcel Schlecht"`.
- **Teste esperado:** AC-1.6, AC-1.7, AC-1.10 (embaralhar e incluir um Won futuro não muda estado, faixa, ordem nem limite), AC-1.11 (mesmo hash em duas execuções), AC-2.4 (Darcel), AC-2.5 (Carl Lin: resumo zerado e mensagem), AC-2.11, AC-3.5, AC-3.6.
- **Pronto quando:** a soma dos estados é igual ao total em todas as fixtures, e nenhum estado vazio quebra a saída.
- **Se atrasar:** o AC-1.10 testa o embaralhamento e o Won futuro, mas não o embaralhamento de `close_value`.
- **Checkpoint Git:** `feat(core): unscorable state, empty states and leakage invariance`

#### 3.3 API FastAPI fina e paridade com a CLI · ⏱ 30 min · corte aos 45

- **Entradas:** `views.py`; parâmetros `seller`, `as_of`, `manager`, `office`.
- **Arquivos:** `api/__init__.py`, `api/main.py`, `tests/test_api.py`.
- **Depende de:** 3.2.
- **Comando:** `.venv/bin/uvicorn api.main:app --port 8000`, depois `curl -s "localhost:8000/api/sellers/Zane%20Levy/pipeline"`.
- **Teste esperado:** `GET /api/meta`; `/api/sellers` em ordem alfabética (AC-2.9); `/api/sellers/{seller}/pipeline?as_of=` (AC-2.4 e AC-2.5); 404 para `Fulano` (AC-2.6); 422 para `as_of` inválido; 503 com a mesma mensagem da CLI quando falta um CSV (AC-1.2); `/api/pipeline?manager=&office=` vazio com mensagem e nunca 500 (AC-2.10); CLI `--json` igual à API e soma dos 35 vendedores = 2.089 (AC-2.8).
- **Pronto quando:** a API só traduz o núcleo para HTTP (sem lógica própria), carrega os dados de forma preguiçosa com cache por `as_of`, sobe mesmo sem CSV e libera CORS só para `http://localhost:3000`.
- **Se atrasar:** `/api/pipeline` sai sem resumo agregado; se ainda faltar tempo, esse endpoint é adiado (bônus F-08) e o AC-2.10 é registrado como não entregue.
- **Checkpoint Git:** `feat(api): thin FastAPI layer with 404/422/503 and CLI parity`

### Spec 4 — Tela, ensaio e entrega · 1h15 (+0h30 opcional)

#### 4.1 Página Next.js · ⏱ 45 min · corte aos 60 → plano E

- **Entradas:** API em `:8000`; URL padrão `http://localhost:8000` no código, sem `.env`.
- **Arquivos:** `web/package.json`, `web/package-lock.json`, `web/app/layout.js`, `web/app/page.js`, `web/app/globals.css`; varredura de vocabulário da tela em `tests/test_explain.py`, com `skip` se `web/` não existir.
- **Depende de:** 3.3.
- **Comando:** `cd web && npm install && npm run dev` (gera o lockfile); depois `npm run build`.
- **Teste esperado:** `npm run build` sem erro; seletor com os 35 nomes de `/api/sellers`; cabeçalho, resumo, aviso único, legenda, grupos com empates agrupados; clicar no item abre o painel a partir de `explanation` do payload, sem nova chamada; grupo vazio mostra só a mensagem (AC-3.9); AC-3.8 nas strings da página.
- **Pronto quando:** as etapas 1 a 4 da jornada funcionam no navegador.
- **Gatilho de corte:** se aos 60 min a página não listar Zane Levy com dados da API, aplicar o **plano E**: `api/static/index.html` (HTML + JS, sem build) servido pela FastAPI em `/`. A jornada passa a `localhost:8000`, registrada como desvio.
- **Checkpoint Git:** `feat(web): single-page focus list and explanation panel`

#### 4.2 Ensaio cronometrado da jornada · ⏱ 10 min · corte aos 15

- **Entradas:** API e tela no ar com os CSVs auditados.
- **Arquivos:** `process-log/PROCESS_LOG.md` (resultado do ensaio).
- **Depende de:** 4.1.
- **Comando:** roteiro da seção 2 do PRD, com cronômetro.
- **Teste esperado:** AC-2.12 (lista em menos de 1 s, nenhum erro, jornada em até 2 min).
- **Pronto quando:** o tempo medido e as falhas encontradas estão registrados.
- **Se atrasar:** registrar o que falhou e seguir; não reabrir a 4.1.
- **Checkpoint Git:** junto com 4.3.

#### 4.3 Entrega · ⏱ 20 min · corte aos 30

- **Entradas:** tudo o que está verde.
- **Arquivos:** `challenge-003-lead-scorer/README.md` (Setup, Lógica, Limitações, desvios DV-1 a DV-10 e fallbacks da seção 3), `process-log/PROCESS_LOG.md` (Etapa 07), `submissions/alice-dantas/README.md` (linha da entrega).
- **Depende de:** 4.2.
- **Comando:** setup do zero pelo README em um `venv` temporário e `pytest`; etapas 2 a 6 do `commit-flow.md`.
- **Teste esperado:** nenhum passo fora do README; staging sem `.csv`, `.venv`, `node_modules` ou `.next`; nenhum arquivo fora de `submissions/alice-dantas/`.
- **Pronto quando:** commit pronto para o PR.
- **Se atrasar:** README só com Setup, Lógica e Limitações; o restante fica no process log.
- **Checkpoint Git:** `docs(submission): setup, scoring logic and limitations`

#### 4.4 (Opcional; primeiro corte) Validação offline · ⏱ 30 min

- **Entradas:** fechadas por corte temporal.
- **Arquivos:** `scripts/backtest.py`.
- **Comando:** `.venv/bin/python scripts/backtest.py`.
- **Teste esperado:** 5 cortes; AUC com IC para taxa global, por produto, aleatório e "só valor"; armadilha do mês de fechamento perto de 0,64; valor capturado em coluna separada.
- **Fallback se cortado:** o README cita `A§2.9` (5 cortes; armadilha de 0,614 a 0,650) e rotula "baseline 'só valor' não executado".
- **Checkpoint Git:** `feat(eval): temporal backtest against baselines`

## 5. Tempo e gatilhos de corte

**Regra por incremento:** o relógio começa no primeiro comando. Ao atingir o ⏱: parar, rodar os testes e decidir em até 2 min. Ao atingir o corte: aplicar o corte previsto para o incremento, registrar no process log como "corte de profundidade" e seguir. Corta-se profundidade, nunca item (architecture, seção 1.4).

**Gatilhos acumulados** (relógio do build):

| Marco | Planejado | Gatilho | Ação |
| --- | --- | --- | --- |
| Fim da Spec 1 | 1h45 | > 2h15 | Cortar 4.4 (backtest) |
| Fim da Spec 2 | 2h45 | > 3h15 | Também: a 4.1 começa direto no plano E |
| Fim da Spec 3 | 4h00 | > 4h30 | Também: adiar `/api/pipeline` (filtros) e reduzir a Spec 4 a plano E + README |
| Fim da Spec 4 | 5h15 | > 5h45 | Só README e commit |
| Teto | 6h00 | — | Entrega o que está verde; a CLI é o caminho garantido |

**Nunca se corta:** o núcleo, os testes dos ACs das Specs 1 e 2, a API básica (sem os filtros) e o Setup do README (ADR-003).

## 6. Arquivos

**Criar** (em `challenge-003-lead-scorer/`):

| Arquivo | Spec |
| --- | --- |
| `docs/build-plan.md` (este) | — |
| `solution/pytest.ini`, `solution/data/raw/README.md` | 1.1 |
| `solution/leadscorer/__init__.py`, `policy.py`, `data.py`, `__main__.py` | 1.2 |
| `solution/leadscorer/triage.py` | 1.3 |
| `solution/leadscorer/views.py` | 1.4 |
| `solution/leadscorer/explain.py` | 2.2 |
| `solution/leadscorer/errors.py` | 3.1 |
| `solution/api/__init__.py`, `solution/api/main.py` | 3.3 |
| `solution/tests/conftest.py`, `test_data.py`, `test_real_data.py`, `test_triage.py`, `test_views.py`, `test_explain.py`, `test_errors.py`, `test_edges.py`, `test_api.py` | 1.2 a 3.3 |
| `solution/web/package.json`, `package-lock.json`, `app/layout.js`, `app/page.js`, `app/globals.css` | 4.1 |
| `solution/api/static/index.html` (só no plano E) | 4.1 |
| `solution/scripts/backtest.py` (opcional) | 4.4 |

**Modificar:**

| Arquivo | Mudança | Spec |
| --- | --- | --- |
| `solution/requirements.txt` | + fastapi, uvicorn, pytest, httpx com `==` | 1.1 |
| `solution/scripts/audit_data.py` | Linha 253: imprimir o caminho relativo | 1.1 |
| `solution/data/processed/audit_log.txt` | Linha 3: caminho relativo no lugar de `/Users/...` | 1.1 |
| `submissions/alice-dantas/docs/commit-flow.md` | Exclusões no `git add` e na checagem da etapa 5 | 1.1 |
| `README.md` (do challenge) | Setup, Lógica, Limitações e desvios | 4.3 |
| `process-log/PROCESS_LOG.md` | Etapa 07 e ensaio da jornada | 4.2 e 4.3 |
| `submissions/alice-dantas/README.md` | Linha da entrega na tabela de challenges | 4.3 |

**Só leitura:** `solution/data/raw/*.csv` e tudo fora de `submissions/alice-dantas/`.
**Nunca versionar:** `data/raw/*.csv`, `.venv/`, `web/node_modules/`, `web/.next/`, `.pytest_cache/`, `__pycache__/`, `.DS_Store`.

## 7. Checkpoint de Git (comando-padrão)

**Achado da simulação (`git add -n -f`, 15/10/2026):** a etapa 4 do `commit-flow.md` atual (`git add -f -- submissions/alice-dantas/`) colocaria no staging **os 5 CSVs de `data/raw/` e 6.670 arquivos do `.venv`**. Exclusões por pathspec (`':(exclude)…'`) não resolvem: com elas, o `-f` deixa de incluir também os arquivos ignorados que deveriam entrar (docs, scripts). Até a 1.1 terminar, nenhum commit da solução deve ser feito.

A 1.1 troca a etapa 4 por um `find` com as mesmas exclusões da etapa 2, mais `*.csv`, `.next` e `.pytest_cache`. Funciona em zsh e bash mesmo quando uma pasta ainda não existe. Na simulação, entraram os 5 docs, o script, as saídas da auditoria e o `requirements.txt`, e ficaram de fora CSV e `.venv`:

```bash
find submissions/alice-dantas \( -name .venv -o -name venv -o -name node_modules -o -name .next -o -name .pytest_cache -o -name __pycache__ -o -name .claude -o -name datasets -o -name .vscode -o -name .idea -o -name _internal -o -name .ipynb_checkpoints \) -prune -o -type f ! -name .DS_Store ! -name Thumbs.db ! -name '.env' ! -name '.env.*' ! -name '*.csv' ! -name '*.pyc' ! -name '*.log' ! -name '*.key' ! -name '*.pem' -print0 | xargs -0 git add -f --
git add -u -- submissions/alice-dantas
```

A primeira linha adiciona os arquivos novos e alterados; a segunda registra remoções. Para simular, troque `git add -f` por `git add -n -f` e `git add -u` por `git add -n -u`. As etapas 5 e 6 do fluxo continuam valendo como segunda barreira.

O primeiro checkpoint também leva a remoção de `solution/.gitkeep`, a alteração pendente do `PROCESS_LOG.md` e os 5 documentos de `docs/`, que ainda não estão versionados. Commit e push só com o seu aval, em cada checkpoint.
