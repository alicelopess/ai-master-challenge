# Submissão — Maria Alice Dantas — Challenge 003

## Executive Summary

_Em 3-5 frases: o que você fez, o que encontrou, e qual a principal recomendação._

### Setup

**Requisitos:** Python 3.9 ou superior (testado em 3.9.6) e, só para a tela, Node 20.9 ou superior (testado em 22.12). Sem banco, sem segredo e sem LLM.

**Dados:** os CSVs não estão no repositório. Baixe o dataset [CRM Sales Predictive Analytics](https://www.kaggle.com/datasets/agungpambudi/crm-sales-predictive-analytics) (CC0) pelo navegador e copie `sales_pipeline.csv`, `products.csv`, `sales_teams.csv` e `accounts.csv` para `solution/data/raw/`. O [README da pasta](./solution/data/raw/README.md) traz o SHA-256 da versão auditada.

**Comandos** (a partir de `solution/`; no Windows, troque `.venv/bin/` por `.venv\Scripts\`):

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m leadscorer check-data                    # arquivos, hash e reconciliação
.venv/bin/pytest                                             # testes
.venv/bin/python -m leadscorer list --seller "Zane Levy"     # lista de um vendedor, sem Node
.venv/bin/python -m leadscorer explain --id 01XZ9CRY         # "Por que está aqui"
.venv/bin/python scripts/backtest.py                         # validação offline (5 cortes)
.venv/bin/uvicorn api.main:app --port 8000                   # API (deixe rodando)
cd web && npm ci && npm run dev                              # tela em http://localhost:3000 (outro terminal)
```

O que esperar: `check-data` mostra 8.800 linhas após cada junção, 1.480 linhas que se perderiam sem o mapa `GTXPro` → `GTX Pro`, hash 4 de 4 igual ao auditado e 2.089 abertas. Sem os CSVs, todos os comandos param com uma mensagem que diz qual arquivo falta e onde baixá-lo, e o `pytest` pula com aviso os testes que dependem dos dados reais.

### Solução

Uma ferramenta de **triagem explicável** da carteira aberta: o vendedor escolhe o próprio nome e vê, em uma ordem única e declarada, o que abrir primeiro, com o motivo de cada posição e o que os dados não sabem. A ferramenta só lê o CRM; a ação acontece no CRM, pelo ID da oportunidade.

| Camada | O que faz | Onde |
| --- | --- | --- |
| Núcleo Python (pandas) | Carga, normalização, estados, ordem e explicação; funções puras, sem web | `solution/leadscorer/` |
| CLI | `check-data`, `list --seller` (texto ou `--json`) e `explain --id`; entrega tudo sem Node | `python -m leadscorer` |
| API FastAPI | `GET /api/meta`, `/api/sellers`, `/api/sellers/{seller}/pipeline`, `/api/pipeline?manager=&office=`; erros 404, 422 e 503 com mensagem | `solution/api/main.py` |
| Tela Next.js | Uma página: vendedor, resumo, grupos e painel "Por que está aqui" | `solution/web/` |

CLI, API e tela consomem **o mesmo payload**, então a lista é idêntica nas três saídas (testado para os 35 vendedores).

**Jornada de 2 minutos:** abra `localhost:3000` e escolha Zane Levy. Veja "88 abertas = 31 Focar + 57 Revisar + 0 Qualificar + 0 Não pontuável" e abra `01XZ9CRY` para ler o motivo. Depois abra "Revisar" e troque para Darcel Schlecht, que não tem nada em Focar e recebe a indicação de começar por Revisar.

### Lógica de Scoring

A auditoria mostrou que **nenhum campo disponível prevê ganho melhor que o acaso**: AUC de 0,47 a 0,57 em backtest temporal. O único sinal forte é o mês de fechamento (AUC de cerca de 0,64), que é vazamento, porque só existe depois do resultado. Por isso a ferramenta **não calcula probabilidade nem nota**. Ela classifica e ordena por regras declaradas, com o que os dados sustentam ([ADR-001](./docs/architecture.md#adr-001)).

**1. Estado** (cada aberta cai em exatamente um):

| Estado | Regra | Com os dados auditados |
| --- | --- | --- |
| **Focar** | Engaging com idade até o maior ciclo já fechado (138 dias) | 298 |
| **Revisar** | Engaging acima desse limite; a idade não prova que o negócio terminou | 1.291 |
| **Qualificar** | Prospecting (sem data de engajamento, logo sem idade) | 500 |
| **Não pontuável** | Falta produto, preço ou, em Engaging, a data de engajamento; o item diz qual campo corrigir | 0 |

**2. Ordem dentro do estado:** faixa de valor de tabela (alto ≥ 3.000; médio de 500 a 2.999; baixo < 500) → preço de tabela decrescente → ID, só para a ordem ficar estável. O preço de tabela reproduz o valor fechado com ±20% em 95,9% das vendas ganhas. **A idade aparece, mas não muda a ordem**, porque não mostrou sinal estável. Deals do mesmo estado e produto são empate e aparecem agrupados.

**3. Explicação:** quatro frases de modelo fixo por oportunidade, preenchidas só com campos verificáveis. Elas cobrem a posição em relação ao ciclo, o valor de tabela, a referência do produto (P90 do ciclo das ganhas, com N e aviso quando N < 30) e a frase fixa "Não sabemos a chance de fechar: cerca de 63% das fechadas foram ganhas (48% a 72% contando as abertas)". Cada frase traz o próximo passo do estado.

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
| Testes automatizados (`pytest`) | 99 verdes com os CSVs; sem eles, 73 verdes e 26 pulados com aviso |
| Reconciliação | 8.800 linhas após cada junção; 2.089 abertas = 298 + 1.291 + 500 + 0 |
| Explicações | Nas 2.089, todo número do texto confere com os campos; nenhum termo proibido ("probabilidade", "perdida", "encerre", "score"…) na API, na CLI ou na tela |
| Paridade | CLI = API = núcleo para os 35 vendedores; soma = 2.089 |
| Robustez | Arquivo ausente, vazio ou inválido, rótulo desconhecido, data ou preço fora do formato e `as_of` inválido param com mensagem; nenhuma lista parcial |
| Ensaio da jornada (tela) | Todos os itens do roteiro apareceram; lista visível de 38 a 116 ms após escolher o vendedor; nenhum erro no console; sem transbordo horizontal em 375 px |
| Backtest temporal (5 cortes) | Nenhuma ordenação legítima supera o acaso; só a armadilha do mês de fechamento passa de 0,6 (detalhes abaixo) |

**Validação offline** ([relatório completo](./solution/data/processed/backtest_report.md), gerado por `scripts/backtest.py`):
- **Desenho**, o mesmo da sonda de [data-audit.md, seção 2.9](./docs/data-audit.md#a-2-9):
  - em cada corte T (fim de maio a fim de setembro de 2017), o treino são as fechadas até T;
  - o teste são as negociações já engajadas em T que fecharam depois (de 893 a 1.139 por corte);
  - os ordenadores legítimos só recebem o que se sabia em T;
  - o IC95% do AUC vem de bootstrap com 300 reamostras.
- **Reprodução:** tamanhos de teste e AUC por produto idênticos aos da auditoria.

| Ordenador | AUC médio (mín.–máx. nos 5 cortes) | Cortes com IC acima de 0,5 | Valor ganho nos 20% primeiros |
| --- | --- | --- | --- |
| Taxa global | 0,500 | 0 de 5 | 21,9% |
| Taxa por produto | 0,506 (0,495–0,533) | 0 de 5 | 11,1% |
| Aleatório | 0,495 (0,467–0,527) | 0 de 5 | 19,2% |
| Só valor de tabela | 0,495 (0,478–0,510) | 0 de 5 | 49,7% |
| Regra da ferramenta | 0,495 (0,478–0,510) | 0 de 5 | 49,7% |
| [Vazamento] fechou no 3º mês do trimestre | 0,632 (0,614–0,650) | 5 de 5 | 23,6% |

Como ler:
1. **Habilidade:** nenhuma ordenação legítima separa quem ganha de quem perde (AUC perto de 0,5, com o IC sempre incluindo 0,5). A única que parece funcionar usa a data de fechamento, que só existe depois do resultado.
2. **Valor capturado:** ordenar por valor de tabela põe cerca de 50% do valor ganho nos 20% primeiros, contra cerca de 20% ao acaso. Isso acontece **por construção** (negócio caro no topo), não por prever quem fecha, e por isso aparece em coluna separada.
3. **Por que a regra coincide com "só valor":** nenhuma negociação fechada passou de 138 dias, então todo o teste estava em Focar no corte. A divisão Focar/Revisar não tem rótulo para ser avaliada.

Critérios de aceite e oráculos: [PRD](./docs/prd.md). Plano de build, desvios e cortes: [build-plan.md](./docs/build-plan.md). Auditoria dos dados: [data-audit.md](./docs/data-audit.md).

### Recomendações

_O que a empresa deveria fazer com base nos seus findings. Priorize._

### Limitações

**O que a ferramenta não faz:**
- **Não prevê quem vai fechar.** Com estes campos, nenhuma regra ou modelo superou o acaso, e a ferramenta não promete fazer isso.
- **Não comprova ganho de resultado.** O ganho sobre "ordenar por preço" é pequeno e inverificável aqui; só um piloto com grupo de controle mede efeito.
- **Não detecta esfriamento nem sugere reativação:** o dataset não tem atividade nem histórico de estágio.
- **Não escreve no CRM, não registra uso** (marcações "vou trabalhar", "revisei") e não tem autenticação; serve um usuário, com CSV em memória.
- **Na tela, não tem filtros de manager e escritório**, que existem só na API.

**O que depende de premissa:**
- **Data do recorte:** a data de extração é desconhecida, então o `as_of` padrão de 31/12/2017 é premissa. Com ela, 81% das Engaging caem em Revisar e o Focar tem só 298 itens; o tamanho muda com o `as_of` (160 em 31/01/2018, 34 em 31/03/2018).
- **Cliente ausente:** 68% das abertas não têm cliente registrado (e 0% das fechadas). A tela avisa uma vez e identifica o deal pelo ID.
- **Linhas idênticas:** 461 linhas abertas idênticas (exceto pelo ID) foram mantidas, sem prova de duplicidade.
- **Política provisória:** faixas de valor e limite de ciclo não foram validados pela Head de RevOps.
- **Dataset provavelmente sintético** (fechamentos em fins de semana e sem estrutura de sinal); não generalizar para a empresa real.

**O que não foi verificado:**
- **Compreensão:** o teste com 3 a 5 pessoas não técnicas ainda não foi feito.
- **Focar × Revisar:** o backtest não consegue avaliar essa divisão, porque nenhuma negociação fechada passou de 138 dias, e "Revisar" segue como heurística. O backtest também só cobre negociações que acabaram fechando: as que seguem abertas não têm desfecho para medir.

**Para escalar:**
1. Fonte viva (API do CRM) no lugar do CSV.
2. Registro de ações do vendedor (cria o baseline e a medida de adoção).
3. Log de atividade e de mudança de estágio (habilita sinais de esfriamento).
4. Validação da política com a RevOps.
5. Autenticação e banco, se houver escrita ou mais de ~30 usuários.
6. Piloto com grupo de controle antes de afirmar qualquer efeito.

**Desvios em relação ao ADR-003 e ao PRD** (detalhes em [build-plan.md](./docs/build-plan.md#2-ambiente-instalação-e-reprodução)):
- A CLI imprime no terminal, sem gerar CSV.
- A tela é Next.js em JavaScript puro (sem TypeScript, Tailwind ou ESLint), com `agentRules: false` no `next.config.mjs` para o `next dev` não criar um `AGENTS.md`.
- A validação do `as_of` fica na entrada (CLI e API), e o núcleo aceita qualquer data. Assim, o teste de vazamento com uma venda futura (AC-1.10) não conflita com o `as_of` mínimo (D-4).
- A API carrega os dados uma vez e calcula a lista a cada chamada (cerca de 25 ms).

## Process Log — Como usei IA

[Acesse o process log](./process-log/PROCESS_LOG.md)
