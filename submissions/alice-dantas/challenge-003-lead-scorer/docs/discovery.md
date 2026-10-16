# Discovery — Challenge 003 | Lead Scorer

**Status:** Concluído em 15/10/2026 (handoff pronto para a etapa de Estratégia de Solução e Arquitetura)
**Última atualização:** 15/10/2026

<a id="indice"></a>
## Índice

| Etapa | Pergunta que responde | Conteúdo (clique para ir) |
| --- | --- | --- |
| **Antes de começar** | Como ler este documento? | [Como ler](#como-ler) · [Convenção de identificadores](#ids) · [Glossário](#glossario) |
| [**Etapa 1. Business Decision Discovery**](#etapa-1) | Qual é o problema, de quem, e para decidir o quê? | [1.1 Problem Statement](#sub-1-1) · [1.2 Stakeholders e mapa de decisões](#sub-1-2) · [1.3 Problemas e hipóteses](#sub-1-3) · [1.4 Business Impact](#sub-1-4) · [1.5 Perguntas-chave](#sub-1-5) · [1.6 Conclusões da etapa](#sub-1-6) |
| [**Etapa 2. Domain & Value Discovery**](#etapa-2) | Como funciona a venda, que sinais ajudam a priorizar e como saberemos se funciona? (sem olhar os dados) | [2.1 Domínio](#sub-2-1) · [2.2 Sinais de decisão](#sub-2-2) · [2.3 Valor de negócio](#sub-2-3) · [2.4 KPIs](#sub-2-4) · [2.5 Plano de validação](#sub-2-5) · [2.6 Hipóteses das decisões](#sub-2-6) · [2.7 Conhecimento da empresa](#sub-2-7) |
| [**Etapa 3. Data Discovery**](#etapa-3) | O que os dados realmente permitem concluir? | [3.1 Fontes e limite temporal](#sub-3-1) · [3.2 Hipótese → evidência](#sub-3-2) · [3.3 Campo → pode entrar?](#sub-3-3) · [3.4 KPI → calculável?](#sub-3-4) · [3.5 Conclusões atraentes e injustificadas](#sub-3-5) · [3.6 Decisões já possíveis](#sub-3-6) · [3.7 Perguntas sem resposta](#sub-3-7) · [3.8 Testes adicionais](#sub-3-8) · [3.9 Resumo executivo](#sub-3-9) |
| [**Etapa 4. Discovery Conclusions**](#etapa-4) | O que o discovery responde e o que passa para a Arquitetura? | [4.1 As 8 perguntas](#sub-4-1) · [4.2 O que é prioridade](#sub-4-2) · [4.3 Dados → arquitetura](#sub-4-3) · [4.4 Discovery Handoff](#sub-4-4) · [4.5 Limitações e questões abertas](#sub-4-5) |
| **Apêndice** | Termos e documentos de apoio | [Glossário](#glossario) · [data-audit.md](./data-audit.md) (auditoria dos dados) · [audit_data.py](../solution/scripts/audit_data.py) (script) |

<a id="como-ler"></a>
## Como ler este documento

**Se você não é técnico:** leia a caixa **"Em linguagem simples"** que abre cada etapa, depois a [Etapa 4.1](#sub-4-1) (as 8 perguntas) e a [Etapa 4.4](#sub-4-4) (o que passa para a próxima fase). Termos técnicos têm link para o [Glossário](#glossario).

**Se você é técnico:** cada subetapa começa com uma tabela **"Referências desta subetapa"**, que lista o que ela herda das etapas anteriores, com link. A evidência numérica está em [data-audit.md](./data-audit.md) e é reproduzível pelo [script](../solution/scripts/audit_data.py).

**Sequência lógica:** as etapas formam uma cadeia. A Etapa 1 gera hipóteses; a Etapa 2 as transforma em sinais, KPIs e testes; a Etapa 3 executa os testes; a Etapa 4 responde às perguntas e entrega o handoff. Cada etapa termina com uma **"Ponte"** para a seguinte.

**Origem das afirmações:** na Etapa 2, as etiquetas `[Briefing]`, `[Setor]` e `[Validar]` indicam de onde vem cada afirmação (ver [2](#etapa-2)). Na Etapa 3 e no data-audit, `[FATO MEDIDO]`, `[INTERPRETAÇÃO]`, `[HIPÓTESE]` e `[NÃO VERIFICÁVEL]` seguem a [legenda do audit](./data-audit.md#como-ler).

**Correspondência com o process log:** a Etapa 4 deste documento corresponde à etapa "04 — Prioritization" do [process log](../process-log/PROCESS_LOG.md).

<a id="ids"></a>
### Convenção de identificadores

Cada identificador tem um link para o ponto onde é definido. Qualquer ocorrência dele neste documento aponta para lá.

| Identificador | O que é | Definido em |
| --- | --- | --- |
| [P-001](#p-001) a [P-003](#p-003) | Problemas declarados (sintomas) | [1.3](#sub-1-3) |
| [H-001](#h-001) a [H-008](#h-008) | Hipóteses sobre causas e dados | [1.3](#sub-1-3) |
| [D1](#d1) a [D26](#d26) | Conceitos de domínio | [2.1.2](#sub-2-1-2) |
| [S1](#s1) a [S22](#s22) | Sinais candidatos de decisão | [2.2](#sub-2-2) |
| [M1](#m1) a [M9](#m9) | Mecanismos de custo ou perda | [2.3](#sub-2-3) |
| [V1](#v1) a [V14](#v14) | Testes do plano de validação | [2.5](#sub-2-5) |
| [HD-01](#hd-01) a [HD-08](#hd-08) | Hipóteses do mapa de decisões | [2.6](#sub-2-6) |
| [O1](#o1) a [O5](#o5) | Objetivos e KPIs candidatos | [3.4](#sub-3-4) (origem em [1.4](#sub-1-4)) |
| [T-A](#t-a), [T-B](#t-b) | Testes adicionais decisivos, não executados | [3.8](#sub-3-8) |
| [AR-01](#ar-01) a [AR-12](#ar-12) | Questões abertas para a Arquitetura | [4.5](#sub-4-5) |
| `A§x.y` | Seção x.y do [data-audit.md](./data-audit.md) | data-audit.md |
| `S§n` | Seção n do script [audit_data.py](../solution/scripts/audit_data.py) | script |

Atenção: `S1` a `S22` (sinais) e `S§n` (seção do script) são coisas diferentes.

---

<a id="etapa-1"></a>
## 1. Business Decision Discovery

[↑ Voltar ao índice](#indice)

> **Em linguagem simples**
>
> **O que esta etapa responde:** qual é o problema, de quem é, e para decidir o quê.
>
> **O que fizemos:** lemos o [briefing do challenge](../../../../challenges/build-003-lead-scorer/README.md) e o transformamos em problema, decisões de cada papel, hipóteses sobre as causas e impactos possíveis.
>
> **O que encontramos:** o problema é plausível, mas é uma **percepção** da liderança: não há custo, [baseline](#g-baseline) nem medição. A ferramenta veio como solução antes de provar que priorizar é o gargalo. E o "valor" de uma oportunidade em aberto não existe até ela fechar.
>
> **O que passa para a próxima etapa:** 3 problemas declarados, 8 hipóteses e 5 perguntas-chave.

<a id="sub-1-1"></a>
### 1.1. Problem Statement

**Problema declarado:**
Segundo a Head de Revenue Operations, no briefing do Challenge 003: _"Nossos vendedores gastam tempo demais em deals que não vão fechar e deixam oportunidades boas esfriar."_ Hoje, 35 vendedores de escritórios regionais, gerenciados por managers, priorizam um pipeline de ~8.800 oportunidades "no feeling", com base na própria experiência e intuição. O pedido é uma ferramenta que o vendedor abra, veja o pipeline e saiba onde focar.

**Problema de negócio interpretado:**
Há indícios de um problema de alocação do esforço comercial: a atenção dos vendedores pode não estar sendo direcionada às oportunidades de maior contribuição esperada para a receita. Essa leitura vem da percepção da liderança e ainda não foi quantificada nem confirmada com dados. O briefing não distingue entre três explicações possíveis: falta de critério compartilhado de qualificação, sobrecarga de capacidade (muitos deals por vendedor) e incentivos ou disciplina de processo. Qual delas predomina é o que define se "priorizar melhor" é de fato a resposta ao problema.

**Objetivo de negócio:**
Direcionar o esforço dos vendedores para as oportunidades com maior chance e valor esperado, reduzindo o tempo gasto em deals de baixa chance e evitando que oportunidades boas esfriem, de forma que o vendedor entenda e use a priorização na rotina. O resultado mensurável ainda precisa ser definido e validado contra um [baseline](#g-baseline) (ver 1.4).

<a id="sub-1-2"></a>
### 1.2. Stakeholders & Decision Map

**Papéis:** solicita a Head de RevOps; usam vendedores (usuário primário) e managers; se beneficiam a empresa (receita e previsibilidade), vendedores (tempo e resultado), managers e, indiretamente, as contas atendidas no momento certo.

| Stakeholder                | Decisão que precisa tomar                                      | Dificuldade atual                                                           | Informação necessária                                                                  |
| -------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Vendedor                   | Qual deal trabalhar na semana (operacional)                    | Muitos deals, critério pessoal e invisível, sem comparabilidade entre eles  | Chance de fechar, valor esperado, idade do deal, casos semelhantes                     |
| Vendedor                   | Quando desqualificar ou abandonar um deal (operacional)        | Apego, otimismo, sem referência de ciclo típico                             | Ciclo típico por produto/conta, sinais de estagnação                                   |
| Vendedor                   | Quando reativar um deal parado (operacional)                   | Sem alerta de "janela"; esfriamento percebido tarde                         | Dias sem avanço versus benchmark                                                       |
| Manager                    | Onde intervir e fazer coaching (tática)                        | Visão depende do relato do vendedor; olha pessoas, não o portfólio          | Risco por vendedor e por deal, concentração de valor                                   |
| Manager                    | Como distribuir carga e foco no time (tática)                  | Sem visão comparável de carga e potencial entre vendedores                  | Nº de deals abertos por vendedor, valor esperado por carteira                          |
| Manager                    | Qual forecast comprometer (tática)                             | Pipeline inflado e subjetivo                                                | Pipeline ponderado, erro histórico de forecast                                         |
| Head de RevOps             | Se e como padronizar critério; onde investir em dados (estratégica) | Sem [baseline](#g-baseline) nem custo do problema; impacto de mudança difícil de isolar | Baseline de [win rate](#g-win-rate), ciclo e esforço; custo-hora; margem; evidência de que prioridade é o gargalo |
| Direção / Finanças\*       | Metas, capacidade e compromisso de receita (estratégica)       | Previsibilidade baixa; forecast depende de pipeline subjetivo               | Pipeline ponderado confiável, capacidade efetiva                                       |
| Analista de RevOps / CRM\* | Quais campos e regras de estágio exigir (tática)               | Dados incompletos, definição de estágio ambígua                             | Mapa de qualidade e de uso real dos campos                                             |

\* Stakeholder inferido; não citado no briefing.

<a id="sub-1-3"></a>
### 1.3. Problemas e hipóteses

| ID    | Problema / Hipótese                                                                                          | Tipo                              | Evidência necessária                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| <a id="p-001">P-001</a> | Vendedores gastam tempo demais em deals que não fecham                                                       | Percepção da Head de RevOps       | Registro de esforço/atividade por deal; definição de "ponto razoável de desqualificação"; outcomes      |
| <a id="p-002">P-002</a> | Boas oportunidades esfriam                                                                                   | Percepção da Head de RevOps       | Histórico de stage e datas; sinais de ausência de ação; chance de ganho com e sem atenção               |
| <a id="p-003">P-003</a> | A priorização é individual, subjetiva e sem critério compartilhado                                           | Fato declarado no briefing        | Como cada vendedor decide; variação de critério entre vendedores e escritórios                          |
| <a id="h-001">H-001</a> | A causa principal é falta de critério compartilhado de qualificação                                          | Hipótese                          | Dispersão de decisões entre vendedores para deals semelhantes                                           |
| <a id="h-002">H-002</a> | A causa principal é sobrecarga de capacidade: bons deals esfriam por falta de tempo, não por julgamento      | Hipótese                          | Nº de deals abertos por vendedor; relação entre carga e esfriamento                                     |
| <a id="h-003">H-003</a> | Incentivos (comissão, metas) e apego a deals já investidos mantêm deals sem chance no pipeline               | Hipótese                          | Regras de remuneração e de meta; tempo médio de permanência de deals que acabam [Lost](#g-estagios)                    |
| <a id="h-004">H-004</a> | O vendedor não enxerga padrões do portfólio ([win rate](#g-win-rate) por produto, conta, idade do deal)                     | Hipótese                          | Win rate segmentado; o que o vendedor consulta hoje antes de decidir                                    |
| <a id="h-005">H-005</a> | Qualidade do CRM (datas, campos, estágio) limita tanto a decisão quanto qualquer medição                     | Hipótese a verificar nos dados    | Completude e consistência de datas, valor e identificadores                                             |
| <a id="h-006">H-006</a> | O histórico de outcomes reflete a priorização passada ([viés de seleção](#g-vies)): o que foi ignorado tende a ter perdido | Hipótese                       | Como deals eram atribuídos e trabalhados; comparação entre deals trabalhados e negligenciados           |
| <a id="h-007">H-007</a> | O "feeling" atual pode já ser razoavelmente bom; o ganho incremental é incerto                               | Hipótese                          | [Baseline](#g-baseline): desempenho da priorização atual                                                               |
| <a id="h-008">H-008</a> | O valor de um deal aberto não está definido: `close_value` só existe após o fechamento (0 se Lost)           | Limitação de dado a verificar     | Regra para estimar valor esperado de deals Prospecting/Engaging (ex.: preço de produto, ticket histórico) |

<a id="sub-1-4"></a>
### 1.4. Business Impact

**Possíveis impactos:**

- Esforço comercial desperdiçado em deals que acabam [Lost](#g-estagios) (custo operacional).
- Receita perdida por oportunidades boas que esfriam (custo de oportunidade).
- Ciclo de venda mais longo e receita adiada.
- Forecast distorcido por pipeline inflado ou subjetivo.
- Decisões erradas por falsa confiança, caso a priorização classifique mal deals bons ou ruins.
- Custo de adoção: se o vendedor não usar ou não confiar, o investimento não gera retorno.

**Custos identificados:**
Nenhum custo foi confirmado. O briefing não traz valores financeiros, horas ou taxas; há apenas a percepção da Head de RevOps. Classificação atual:

- **Custo comprovado:** nenhum.
- **Exposição a risco (plausível, não quantificada):** esforço em deals Lost; receita perdida por esfriamento; erro de forecast; erro do próprio score.
- **Benefício hipotético (depende de validação):** aumento de [win rate](#g-win-rate) nos deals trabalhados; horas liberadas; ciclo mais curto; forecast mais preciso.

Fórmulas de estimativa e dados necessários (nada disso foi calculado):

- **Esforço mal alocado** = Σ horas em deals após o ponto razoável de desqualificação × custo-hora carregado. Requer log de atividades/horas e custo-hora (ausentes).
- **Custo de oportunidade por esfriamento** = Σ [(P(win se atendido) − P(win observada)) × valor esperado × margem]. Requer sinais de negligência, valor esperado de deals abertos e margem (ausentes; contrafactual difícil).
- **Custo de atraso** = valor ganho × (dias extras de ciclo ÷ ciclo-base) × taxa de desconto. Requer `engage_date` e `close_date`, e benchmark de ciclo (parcial).
- **Pipeline em risco** = Σ valor esperado dos deals abertos sem avanço por mais de X dias. Requer definição de "sem avanço" e histórico de stage (parcial a ausente).
- **Erro de forecast** = |previsto − realizado| ÷ realizado. Requer forecasts históricos (ausentes).
- **Benefício potencial** = Δ win rate × deals trabalhados × [ticket médio](#g-ticket) × margem. Win rate e ticket são deriváveis do dataset; margem e Δ validado, não.

Segundo o briefing, o dataset permitiria derivar [baselines](#g-baseline) históricos (win rate = Won ÷ (Won + Lost), ticket médio, ciclo engage→close, distribuição por vendedor, produto e conta). Isso ainda não foi verificado nos dados e não equivale a custo.

**Indicadores candidatos:**

- **Redução do esforço em deals de baixa chance:** % do esforço alocado a deals que terminam Lost. Mede diretamente a queixa de tempo perdido. Apoio: tempo até desqualificação de deals Lost; nº de deals Engaging parados por mais de X dias; % de perdas identificadas cedo.
- **Redução do esfriamento de bons deals:** win rate dos deals de alto potencial. Mede a segunda queixa do briefing. Apoio: dias sem avanço em deals de alto valor; tempo até a primeira ação após entrar em Engaging; % de deals de alto potencial sem ação em X dias.
- **Eficiência e receita comercial:** receita fechada por vendedor/período. Indicador de resultado final. Apoio: win rate geral; ticket médio; ciclo médio de venda.
- **Adoção e confiança:** % de vendedores que usam a priorização semanalmente. Sem adoção não há impacto. Apoio: % de decisões alinhadas à recomendação; confiança percebida; tempo para decidir o foco semanal.
- **Previsibilidade:** erro de forecast (MAPE). Relevante para managers e direção. Apoio: calibragem das probabilidades; slippage de fechamento; cobertura do pipeline ponderado.

Para medir o estado atual é preciso congelar um baseline do período anterior e definir formalmente "deal parado", "alto potencial" e "desqualificado cedo". Para validar melhorias: [backtest](#g-backtest) temporal sem [vazamento](#g-vazamento), comparação com a priorização atual dos vendedores e, se possível, piloto com [grupo de controle](#g-controle).

<a id="sub-1-5"></a>
### 1.5. Key Discovery Questions

| Pergunta                                                                                                                                  | Por que importa                                                                                              | Decisão impactada                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Qual é a [função de valor](#g-funcao-valor): maximizar receita, [win rate](#g-win-rate), velocidade ou previsibilidade? Quanto custa uma hora de vendedor contra um deal esfriado? | Define o que significa "prioridade": probabilidade, valor esperado ou urgência                               | Objetivo e KPI principal; critério de priorização                                                  |
| Qual é o [baseline](#g-baseline) do "feeling" atual e o histórico é confiável, ou reflete a priorização passada?                                         | Sem baseline não há como provar melhoria; [viés de seleção](#g-vies) pode contaminar qualquer leitura do histórico      | Se vale formalizar a priorização; como validar; quanto confiar no histórico                        |
| Existem dados de atividade (contatos, tempo) e de mudança de stage?                                                                       | Sem eles, "tempo perdido" e "esfriamento" talvez não sejam mensuráveis                                       | Se o problema é mensurável hoje ou se é preciso instrumentar antes de decidir                      |
| Qual é a carga real: quantos deals abertos por vendedor e quanto da escolha é do vendedor versus atribuída?                               | Se a capacidade for o gargalo, priorizar melhor não resolve; o briefing só traz ~250 deals/vendedor no total histórico (8.800 ÷ 35) | Se prioridade é de fato o gargalo; desenho do produto e do processo                    |
| Como a priorização será usada na gestão e nos incentivos: apoio ao vendedor, instrumento de cobrança ou insumo de forecast?               | Define adoção, risco de [gaming](#g-goodhart) e quem é o usuário primário                                                   | Usuário primário, granularidade da visão, governança e regras de uso                               |

<a id="sub-1-6"></a>
### 1.6. Conclusões da etapa

**Principais descobertas:**

- O briefing apresenta um problema plausível e bem formulado, mas **sem custo, [baseline](#g-baseline) ou quantificação**: o que existe é a percepção da Head de RevOps.
- O briefing traz uma solução pré-definida (uma ferramenta) antes de provar que priorização é o gargalo; a causa pode ser capacidade, critério ou incentivos.
- O valor de um deal aberto não está definido: `close_value` só existe no fechamento (0 se [Lost](#g-estagios)), então "valor" para deals em Prospecting/Engaging precisa ser definido.
- O histórico de Won/Lost reflete a priorização passada, o que pode introduzir [viés de seleção](#g-vies).
- Dados de esforço/atividade, margem, custo-hora e remuneração não constam do briefing.
- A carga total é de ~250 oportunidades por vendedor no histórico (8.800 ÷ 35), mas a carga aberta atual é desconhecida.

**Hipóteses prioritárias:**

- [H-002](#h-002): capacidade, e não critério, pode ser o gargalo.
- [H-001](#h-001): falta de critério compartilhado de qualificação.
- [H-006](#h-006): viés de seleção no histórico de outcomes.
- [H-007](#h-007): o "feeling" atual pode já ser razoável, o que limita o ganho.
- [H-008](#h-008): valor de deal aberto indefinido.

**Implicações preliminares para a solução:**

- A [função de valor](#g-funcao-valor) (o que significa "prioridade") precisa ser fechada antes de qualquer desenho.
- Qualquer melhoria precisa ser comparada ao baseline do julgamento atual; sem baseline, não há como validá-la.
- Como o esforço não é medido no briefing, o ganho em horas só poderá ser estimado, não comprovado.
- O resultado precisa ser compreensível para um usuário não técnico, que deve entender por que um deal tem prioridade alta ou baixa (requisito do briefing).
- A adoção deve ser tratada como resultado de negócio, e não como detalhe de implementação.

**Informações que ainda precisamos validar:**

- Função de valor, custo-hora do vendedor e margem.
- Baseline de [win rate](#g-win-rate), ciclo e ticket, e a qualidade e completude dos dados do CRM.
- Existência de dados de atividade e de histórico de mudança de stage.
- Carga de deals abertos por vendedor e regras de atribuição de deals.
- Regras de remuneração, metas e uso gerencial esperado da priorização.
- Representatividade do dataset (público, origem incerta) para a decisão real.


**Ponte para a Etapa 2.** A Etapa 1 deixou três coisas: um problema declarado ([P-001](#p-001) a [P-003](#p-003)), oito hipóteses sobre as causas ([H-001](#h-001) a [H-008](#h-008)) e cinco perguntas-chave ([1.5](#sub-1-5)). A primeira pergunta ("o que significa prioridade?") e a lista de informações a validar ([1.6](#sub-1-6)) exigem entender como uma venda B2B funciona e que sinais comerciais existem. É o que a [Etapa 2](#etapa-2) faz, ainda sem olhar os dados.

---

<a id="etapa-2"></a>
## 2. Domain & Value Discovery

_Status: Concluído_

[↑ Voltar ao índice](#indice)

> **Em linguagem simples**
>
> **O que esta etapa responde:** como funciona uma venda B2B, que sinais ajudam a priorizar, onde há perda de receita e como saberíamos que a solução funciona. Tudo isso **antes de olhar os dados**.
>
> **O que fizemos:** montamos cinco mapas (domínio, sinais por decisão, valor, KPIs e plano de validação) e avaliamos as hipóteses de cada decisão.
>
> **O que encontramos:** vários sinais "óbvios" são armadilhas. O valor do deal não existe em aberto; idade confunde deal grande com deal parado; o vendedor é o sinal mais forte e o mais perigoso. Sinais de atividade e de esfriamento não existem no dataset. Saímos com 14 testes para executar.
>
> **O que passa para a próxima etapa:** os testes [V1](#v1) a [V14](#v14), os sinais [S1](#s1) a [S22](#s22) e os KPIs candidatos.


Esta seção organiza o entendimento de domínio em cinco mapas (2.1 a 2.5), mais a avaliação crítica das hipóteses do mapa de decisões (2.6) e a lista do que depende de conhecimento da empresa (2.7). Os mapas respondem, nesta ordem: como funciona o processo comercial, quais informações ajudam a priorizar, onde há custo ou perda de receita, como saberemos se a solução gera valor e o que precisa ser verificado no dataset.

**Etiquetas de origem:**

- **[Briefing]:** está escrito no briefing do Challenge 003.
- **[Setor]:** prática geral de vendas B2B. Não é fato da empresa analisada.
- **[Validar]:** hipótese que só entrevista com a empresa ou análise de dados confirma.
- **A confirmar na Etapa 3:** característica do dataset que ainda não foi verificada.

**Legenda de disponibilidade:** ✅ disponível, 🟡 parcial ou derivável, ❌ ausente.

**Limite desta seção:** os arquivos CSV não foram analisados nesta etapa. Nenhuma afirmação sobre o conteúdo do dataset foi verificada; o que é derivável dos campos descritos no briefing está marcado como tal.

<a id="sub-2-1"></a>
### 2.1. Domain Knowledge Map

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Problema declarado e queixas ([P-001](#p-001) a [P-003](#p-003)) | [Etapa 1, 1.1](#sub-1-1) e [1.3](#sub-1-3) | Delimitam quais conceitos do domínio importam |
| Papéis e decisões de cada stakeholder | [Etapa 1, 1.2](#sub-1-2) | A tabela 2.1.1 detalha o dia a dia de cada papel |
| Hipóteses [H-001](#h-001) a [H-008](#h-008) | [Etapa 1, 1.3](#sub-1-3) | Cada conceito indica se precisa de validação com a empresa |


**Pergunta que responde:** como funciona o processo comercial?
**Resultado esperado:** entendimento dos conceitos, etapas e sinais comerciais relevantes.

Tudo o que está marcado como [Setor] descreve prática geral de vendas B2B e não deve ser lido como fato da empresa.

<a id="sub-2-1-1"></a>
#### 2.1.1. Quem faz o quê

| Papel                    | Responsabilidade típica [Setor]                              | Dia a Dia [Setor]                                                                                                                                                                                                                                                  | Relevância neste desafio                                                |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Vendedor (AE)            | Dono do deal; conduz e fecha                                 | Abre o CRM na segunda-feira, filtra "meus deals abertos" e ordena por data de fechamento esperada ou valor. Cruza isso com memória, e-mails pendentes e pressão do manager. Qualifica com frameworks informais (BANT, MEDDIC); o critério vive na cabeça dele. | Usuário primário. Os 35 `sales_agent` parecem ser AEs [Briefing].      |
| Manager                  | Pipeline review, coaching e forecast do time                 | Faz pipeline review semanal e 1:1 com cada vendedor, sempre pelo relato. Pergunta "o que está no commit?". Monta o forecast de baixo para cima, com ajustes por intuição. Tende a olhar pessoas, não portfólio.                                               | Cobra o vendedor e é cobrado pela meta.                                 |
| RevOps                   | Processo, CRM, dados, forecast, territórios, plano de comissão | Roda higiene de CRM (campos obrigatórios, deals sem atividade há X dias), consolida o forecast e mantém dashboards.                                                                                                                                         | Quem pediu a ferramenta. Dono da definição de estágio e da qualidade do dado. |
| Finanças / Direção       | Meta, headcount e previsão de receita                        | Não detalhado nesta análise [Validar].                                                                                                                                                                                                                         | Consome o forecast.                                                     |
| SDR / Marketing          | Geram e qualificam leads                                     | Não detalhado nesta análise [Validar].                                                                                                                                                                                                                         | Fora do escopo, mas determinam a qualidade do que chega ao pipeline.    |

**Comportamentos frequentes no setor [Setor]:** *happy ears* (otimismo sobre o cliente), *sandbagging* (segurar deal para fechar no trimestre seguinte), empurrão de fim de trimestre, deals [zumbis](#g-envelhecido) mantidos "abertos" para não piorar o [win rate](#g-win-rate) e limpeza do CRM em lote no fim do período.

**Leitura para este caso [Validar]:** a "priorização no feeling" do briefing provavelmente combina a intuição do vendedor com a cobrança do manager. Qual dos dois domina só as entrevistas dirão.

<a id="sub-2-1-2"></a>
#### 2.1.2. Conceitos, etapas e sinais

| ID  | Conceito                                       | O que é [Setor]                                                                      | Como aparece neste desafio                                                                                                 | Sinal comercial que sustenta                                               | Origem                 | Validar com a empresa?                                |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| <a id="d1">D1</a>  | Funil comercial                                | Lead → qualificação → oportunidade → descoberta → proposta → negociação → fechamento | O dataset começa na oportunidade e tem 4 valores em `deal_stage`                                                           | A posição no funil condiciona a probabilidade de fechar                    | [Briefing], [Setor]    | Sim: definição operacional de cada estágio            |
| <a id="d2">D2</a>  | [Prospecting](#g-estagios)                                    | Oportunidade criada e ainda sem engajamento ativo                                    | Estágio aberto inicial. Pode ter menos campos preenchidos (a confirmar na Etapa 3)                                         | Probabilidade-base menor e menos informação para pontuar                   | [Briefing], [Validar]  | Sim: o que significa "Prospecting" para a empresa     |
| <a id="d3">D3</a>  | Engaging                                       | Conversa ativa com o cliente                                                         | Estágio aberto com `engage_date` e sem `close_date`                                                                        | Idade do deal e comparação com o ciclo típico                              | [Briefing], [Validar]  | Sim: critério para entrar e permanecer em Engaging    |
| <a id="d4">D4</a>  | Won                                            | Oportunidade fechada com venda                                                       | Estágio final com `close_date` e `close_value`                                                                             | Rótulo positivo para win rate, ciclo e ticket                              | [Briefing]             | Não                                                   |
| <a id="d5">D5</a>  | Lost                                           | Oportunidade encerrada sem venda                                                     | Estágio final com `close_date`. `close_value` vale 0 [Briefing]                                                            | Rótulo negativo para win rate                                              | [Briefing], [Validar]  | Sim: o que conta como Lost                            |
| <a id="d6">D6</a>  | Data de engajamento (`engage_date`)            | Início do engajamento ativo                                                          | Base para idade e ciclo. Ausência em Prospecting é esperada (a confirmar na Etapa 3)                                       | Idade do deal até uma data de corte                                        | [Briefing]             | Não                                                   |
| <a id="d7">D7</a>  | Data de fechamento (`close_date`)              | Data em que o deal virou Won ou Lost                                                 | Só existe após o fechamento. É consequência do resultado                                                                   | Ciclo realizado. Não pode ser feature                                      | [Briefing]             | Sim: se reflete o fim real ou a limpeza do CRM        |
| <a id="d8">D8</a>  | Ciclo de venda                                 | Dias do engajamento ao fechamento                                                    | `close_date − engage_date`, apenas nos fechados                                                                            | Referência de "tempo normal" por produto e por resultado                   | [Setor]                | Sim: ciclo normal por produto                         |
| <a id="d9">D9</a>  | Idade do deal / aging (estagnação)             | Tempo no estágio sem avanço                                                          | Sem log de atividade nem histórico de estágio. Só a idade desde `engage_date` até uma data de corte                        | Candidato a risco de esfriamento e de deal zumbi                           | [Setor], [Validar]     | Sim: o que a empresa chama de "esfriou" ou "parado"   |
| <a id="d10">D10</a> | Slippage                                       | Deals cujo fechamento esperado é empurrado de período                                | Não observável: existe uma única `close_date`, a final                                                                     | Seria sinal de pipeline inflado                                            | [Setor]                | Não                                                   |
| <a id="d11">D11</a> | Valor realizado (`close_value`)                | Valor efetivamente contratado                                                        | Só existe após o fechamento e vale 0 se Lost [Briefing]                                                                    | Base do ticket histórico                                                   | [Briefing]             | Sim: desconto praticado                               |
| <a id="d12">D12</a> | [Preço de tabela](#g-preco-tabela)                                | Preço de catálogo do produto                                                         | O catálogo de produtos traz série e preço [Briefing]                                                                       | [Proxy](#g-proxy) de valor para deal aberto                                            | [Briefing]             | Sim: relação entre preço de tabela e valor fechado    |
| <a id="d13">D13</a> | Valor esperado de deal aberto                  | Estimativa do que está em jogo num deal ainda aberto                                 | Não definido no briefing ([H-008](#h-008)). Proxies possíveis: preço de tabela ou ticket histórico do produto e da conta             | Define o que "prioridade" significa em termos de receita                   | [Validar]              | Sim: como a empresa estima valor antes de fechar      |
| <a id="d14">D14</a> | [Ticket médio](#g-ticket) / ACV                             | Valor médio por deal ganho (ou valor anual do contrato)                              | Derivável dos Won                                                                                                          | Base do benefício potencial                                                | [Setor]                | Não                                                   |
| <a id="d15">D15</a> | Win rate                                       | Won ÷ (Won + Lost), em contagem ou em valor, por coorte de criação ou de fechamento  | Derivável de `sales_pipeline`                                                                                              | Probabilidade-base por segmento                                            | [Setor]                | Sim: qual definição a empresa usa                     |
| <a id="d16">D16</a> | Pipeline ponderado                             | Σ valor × probabilidade                                                              | Calculável se houver valor esperado e probabilidade [calibrada](#g-calibracao)                                                              | Visão agregada de receita esperada e de risco                              | [Setor]                | Não                                                   |
| <a id="d17">D17</a> | Cobertura de pipeline                          | Pipeline ÷ meta (regra comum: 3 a 4 vezes)                                           | Exige meta, que não consta do briefing                                                                                     | Indica se há pipeline suficiente para a meta                               | [Setor]                | Sim: metas e regra de cobertura                       |
| <a id="d18">D18</a> | Sales velocity                                 | (nº de deals × win rate × ticket) ÷ ciclo                                            | Calculável de forma agregada                                                                                               | Mostra quais alavancas movem a receita                                     | [Setor]                | Não                                                   |
| <a id="d19">D19</a> | Forecast                                       | Previsão de receita que será fechada no período                                      | Não há forecasts históricos no briefing. [Backtest](#g-backtest) só com pipeline reconstruído pelas datas                                 | Decisão do manager: qual número comprometer                                | [Setor], [Validar]     | Sim: se existem forecasts históricos guardados        |
| <a id="d20">D20</a> | Categorias de forecast                         | Commit, best case e pipeline                                                         | Não existem no dataset                                                                                                     | Separaria deals firmes de deals especulativos                              | [Setor]                | Sim: se a empresa usa categorias                      |
| <a id="d21">D21</a> | Capacidade e carga                             | Nº de deals que um vendedor consegue trabalhar bem                                   | Carga aberta reconstruível pelas datas: aberto em D se `engage_date ≤ D < close_date`                                      | Teste de "o problema é carga, não critério" ([H-002](#h-002))                        | [Setor], [Validar]     | Sim: capacidade esperada e regra de atribuição        |
| <a id="d22">D22</a> | Conta e segmentação                            | Fit com o perfil de cliente, porte, setor e relacionamento prévio                    | `accounts`: setor, receita, funcionários, localização e empresa-mãe (~85 contas) [Briefing]                                | Perfil e recorrência de compra                                             | [Briefing], [Setor]    | Não                                                   |
| <a id="d23">D23</a> | Tipo de venda (transacional × consultiva)      | Ticket baixo e ciclo curto contra ticket alto e ciclo longo                          | Inferível pelos preços e ciclos (a confirmar na Etapa 3)                                                                   | Muda o que é prioridade: probabilidade ou valor por hora do vendedor       | [Setor], [Validar]     | Sim                                                   |
| <a id="d24">D24</a> | [Censura](#g-censura) à direita                              | Deals abertos ainda não têm desfecho                                                 | O dataset é um retrato final. Prospecting e Engaging são os abertos                                                        | Win rate de coorte recente fica artificialmente baixo                      | [Setor]                | Não                                                   |
| <a id="d25">D25</a> | [Viés de seleção](#g-vies)                                | O histórico reflete onde o esforço foi aplicado                                      | Sem histórico de atribuição ou de esforço ([H-006](#h-006))                                                                          | Limita a confiança em win rate histórico                                   | [Setor], [Validar]     | Sim: como os deals são atribuídos e trabalhados       |
| <a id="d26">D26</a> | Incentivos e metas                             | Comissão, metas e cota                                                               | Fora do dataset                                                                                                            | Afeta se desqualificar um deal é aceitável para o vendedor                 | [Setor], [Validar]     | Sim: regras de remuneração e de meta                  |

#### Notas por conceito

**[D1](#d1) — Funil comercial**

- O desafio se chama "Lead Scorer", mas os dados são oportunidades já criadas. O problema é priorização de deals (*deal scoring*), não qualificação de leads antes da oportunidade (fit e intenção, domínio de marketing e SDR) [Setor].
- Com apenas 4 estágios e sem histórico de estágio nem log de atividade entre os campos descritos no briefing, sinais de saúde de deal muito usados na prática (último contato, próximo passo, nº de stakeholders) não existem aqui.

**[D5](#d5) — Lost**

- Won/Lost não são só resultado de venda. Em muitos CRMs, "Lost" mistura perdido para concorrente, "sem decisão", desistência do cliente e "limpeza de CRM". O briefing não diz qual é o caso aqui [Validar].
- Se os Lost são fechados em lote no fim do mês ou do trimestre, "tempo até desqualificar" mede a higiene do CRM, não quando o vendedor parou de trabalhar o deal [Validar].

**[D6](#d6) — Data de engajamento**

- Prospecting sem `engage_date` e Engaging sem `close_date` é estrutural, não falha de preenchimento. A completude deve ser medida condicionada ao estágio (a confirmar na Etapa 3).

**[D7](#d7) — Data de fechamento**

- `close_date` e `close_value` existem só porque o deal fechou. Usá-los como feature é contrabandear o rótulo ([vazamento](#g-vazamento)).

**[D8](#d8) — Ciclo de venda**

- O ciclo só existe para deals fechados, então é viesado para deals rápidos. Deals abertos e demorados ficam fora da distribuição.

**[D9](#d9) — Idade do deal**

- Deal grande é naturalmente lento. Sem normalizar por produto, a idade penaliza justamente os deals grandes.
- Em Engaging, idade muito acima do ciclo pode ser CRM sem higiene (zumbi), não perda. Isso indicaria que o problema é de dado, não de decisão.

**[D13](#d13) — Valor esperado de deal aberto**

- `close_value` só existe depois do fechamento. O preço de tabela é proxy, não valor realizado, e pode diferir por desconto [Validar].

**[D14](#d14) — Ticket médio**

- `close_value` vale 0 nos Lost. Misturar esses zeros derruba o ticket médio sem sentido. Calcular só sobre Won.

**[D15](#d15) — Win rate**

- Contagem ou valor, coorte de criação ou de fechamento, com ou sem deals abertos: são números diferentes. Toda leitura precisa informar a definição usada.
- O win rate agregado pode inverter ao segmentar (paradoxo de Simpson), e células pequenas geram ruído.

**[D16](#d16) — Pipeline ponderado**

- Probabilidade por estágio é grosseira. Só serve se estiver calibrada no recorte em que será usada.

**[D19](#d19) — Forecast**

- Os erros de forecast só podem ser medidos com forecasts guardados. Sem eles, o que se consegue é um backtest com pipeline reconstruído, que não equivale ao número que o manager efetivamente comprometeu.
- MAPE por deal não faz sentido. A métrica de deal é calibração (ver 2.4).

**[D21](#d21) — Capacidade e carga**

- A reconstrução da carga pelas datas é aproximada, e a atribuição de deals é desconhecida. Capacidade é convenção interna, não dado.

**[D22](#d22) — Conta e segmentação**

- Fit não é propensão a fechar. ~85 contas geram células pequenas, e o mesmo deal por conta repetida pode contaminar treino e teste.

**[D23](#d23) — Tipo de venda**

- Se os preços forem baixos e os ciclos curtos, o valor esperado por hora do vendedor pesa mais que a probabilidade de fechar [Validar].

**[D24](#d24) — Censura à direita**

- O win rate de um período fica artificialmente baixo até a coorte amadurecer. Treinar só com deals fechados e tratar os abertos como alvo de predição, nunca como negativos.

**[D25](#d25) — Viés de seleção**

- Um modelo treinado nesse histórico aprende o que o feeling já priorizava. Depois que a ferramenta passa a guiar a atenção, os dados futuros ficam contaminados por ela (*[feedback loop](#g-feedback)*).

**[D26](#d26) — Incentivos e metas**

- Se a comissão ou a cultura punem Lost, o sinal de desqualificar pode ser inviável, ou ser contornado pelo vendedor (*[gaming](#g-goodhart)*).

<a id="sub-2-2"></a>
### 2.2. Decision Signals Map

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Decisões do mapa de stakeholders | [Etapa 1, 1.2](#sub-1-2) | O mapa de sinais é organizado por decisão (Decisões 1 a 9) |
| Conceitos [D1](#d1) a [D26](#d26) | [Etapa 2, 2.1.2](#sub-2-1-2) | Cada sinal deriva de um ou mais conceitos |
| Pergunta "o que significa prioridade?" | [Etapa 1, 1.5](#sub-1-5) | Os sinais são os candidatos a compor a [função de valor](#g-funcao-valor) |
| Hipóteses [H-001](#h-001) a [H-008](#h-008) | [Etapa 1, 1.3](#sub-1-3) | Cada sinal ajuda a testar uma delas |


**Pergunta que responde:** quais informações ajudam a priorizar oportunidades?
**Resultado esperado:** lista de sinais candidatos com justificativa e limitações.

O mapa está organizado por decisão, na ordem do mapa de decisões (1.2). Cada sinal tem um ID global ([S1](#s1) a [S22](#s22)). A coluna "Limitação do dado" descreve o que falta ou o que o dado não consegue dizer. A coluna "Onde a interpretação distorce" descreve como um sinal disponível pode ser mal lido e em que cenário falha.

Sinais que parecem óbvios e merecem ceticismo [Setor]: valor do deal (não existe para deal aberto), idade do deal (deal grande é lento), setor e porte da conta (fit, não propensão) e vendedor (o sinal mais forte e o mais perigoso).

#### Decisão 1 — Qual deal trabalhar na semana

**Stakeholder:** Vendedor (operacional). **Dificuldade atual:** muitos deals, critério pessoal e invisível, sem comparabilidade.

| ID  | Sinal e derivação                                                                                        | Por que ajuda a decisão                                    | Limitação do dado                                                                         | Onde a interpretação distorce / cenário de falha                                                         | Disp. · Uso                  | Validar com a empresa?                      |
| --- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------- |
| <a id="s1">S1</a>  | Estágio atual (`deal_stage`)                                                                             | Estágios mais avançados tendem a ter maior probabilidade   | Só 2 estágios abertos. [Prospecting](#g-estagios) tem menos campos                                       | Estágio atualizado tarde reflete o CRM, não o deal                                                       | ✅ · Feature                 | Sim: definição de cada estágio              |
| <a id="s2">S2</a>  | Idade relativa ao ciclo típico: (data de corte − `engage_date`) ÷ ciclo P50/P90 de Won do mesmo produto  | Passar muito do ciclo normal é sinal de risco              | Exige data de corte, que o dataset não traz. O ciclo só existe para fechados              | Deal grande é lento por natureza. Ciclo só dos fechados é viesado para rápidos. Limpeza em lote contamina | 🟡 · Feature                 | Sim: ciclo normal por produto               |
| <a id="s3">S3</a>  | Produto (`product`)                                                                                      | [Win rate](#g-win-rate) e ciclo podem variar por produto                  | Possível sinal fraco. Grafias divergentes entre tabelas podem derrubar linhas no join     | Paradoxo de Simpson ao segmentar. Células pequenas                                                       | ✅ · Feature                 | Não                                         |
| <a id="s4">S4</a>  | Valor esperado: [preço de tabela](#g-preco-tabela) ou ticket histórico do produto e da conta                                | Define o que está em jogo                                  | `close_value` não existe para deal aberto                                                 | Preço de tabela ≠ valor fechado. Zeros dos Lost distorcem médias                                         | 🟡 · Feature ([proxy](#g-proxy))         | Sim: desconto praticado                     |
| <a id="s5">S5</a>  | Perfil da conta: setor, receita, funcionários, localização                                               | Fit pode correlacionar com compra                          | ~85 contas geram amostra pequena                                                          | Fit não é propensão a fechar e pode não discriminar                                                      | ✅ · Feature candidata       | Não                                         |
| <a id="s6">S6</a>  | Histórico da conta: Won/Lost anteriores da mesma conta, só com data anterior ao deal                     | Conta que já comprou tende a comprar de novo               | Exige corte temporal rigoroso                                                             | [Vazamento](#g-vazamento) se incluir deals posteriores. Conta repetida entre treino e teste infla a métrica              | 🟡 · Feature com corte       | Sim: se recompra é upsell ou renovação      |
| <a id="s10">S10</a> | Concorrência por atenção: deals simultâneos por conta e por vendedor                                     | Muitos deals competem pela mesma atenção                   | Hipótese sem validação                                                                    | Correlação com carga pode refletir mix de carteira, não esforço                                          | 🟡 · Contexto                | Sim                                         |
| <a id="s13">S13</a> | `close_date`, `close_value` e ciclo realizado                                                            | Nenhuma: são resultado, não sinal                          | —                                                                                         | Vazamento do rótulo                                                                                      | ✅ · **Proibido como feature** | Não                                         |

**Notas da decisão**

- Priorizar só por probabilidade de ganho (P(win)) é um erro frequente: deal muito provável fecha sozinho. O ganho marginal de atenção está em deals de valor alto e risco médio [Setor].
- Priorizar só por valor também não basta; o briefing pede lógica além de ordenar por valor [Briefing].

#### Decisão 2 — Quando desqualificar ou abandonar um deal

**Stakeholder:** Vendedor (operacional). **Dificuldade atual:** apego, otimismo, sem referência de ciclo típico.

| ID  | Sinal e derivação                                       | Por que ajuda a decisão                                          | Limitação do dado                                         | Onde a interpretação distorce / cenário de falha                                              | Disp. · Uso            | Validar com a empresa?                 |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------- |
| [S2](#s2)  | Idade relativa ao ciclo típico do produto               | Dá ao vendedor a referência de ciclo que ele não tem hoje        | Idem Decisão 1                                            | Existe ciclo longo legítimo. Falso positivo descarta deal bom                                  | 🟡 · Feature           | Sim: ciclo normal por produto          |
| [S3](#s3)  | Produto (ciclo e win rate por produto)                  | O ponto de desistência é diferente por produto                   | Idem Decisão 1                                            | Produto com poucos fechados gera referência instável                                          | ✅ · Feature           | Não                                    |
| [S1](#s1)  | Estágio atual                                           | Engaging muito além do ciclo é candidato a encerrar              | Sem histórico de estágio                                  | Estágio parado pode ser só falta de atualização                                               | ✅ · Feature           | Sim                                    |
| <a id="s14">S14</a> | Atividade, último contato e próximo passo               | É o sinal mais usado na prática para decidir abandonar [Setor]   | Não existe no dataset                                     | Sem ele, "parado" é indistinguível de negociação normal                                       | ❌ · Não disponível    | Sim: se é registrado fora do dataset   |
| <a id="s15">S15</a> | Motivo de perda, desconto e concorrente                 | Mostra padrões de perda e permite explicar                       | Não existe no dataset                                     | Sem eles a [explicabilidade](#g-explicabilidade) fica limitada aos sinais estruturais                               | ❌ · Não disponível    | Sim                                    |

**Notas da decisão**

- Idade acima do esperado é sinal de risco, não prova de perda. Um falso positivo de "abandone" é um custo introduzido pela solução ([M6](#m6)).
- Se a remuneração ou a cultura punem Lost, desqualificar pode ser inviável para o vendedor [Validar].

#### Decisão 3 — Quando reativar um deal parado

**Stakeholder:** Vendedor (operacional). **Dificuldade atual:** sem alerta de "janela"; esfriamento percebido tarde.

| ID  | Sinal e derivação                                       | Por que ajuda a decisão                                    | Limitação do dado                                        | Onde a interpretação distorce / cenário de falha                                                | Disp. · Uso            | Validar com a empresa?                         |
| --- | ------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------- |
| [S2](#s2)  | Idade relativa ao ciclo típico                          | Aponta o momento em que o deal ultrapassou o normal        | Idem Decisão 1                                           | O deal pode ter esfriado porque o cliente não tem interesse; nova ação não muda isso            | 🟡 · Feature           | Sim: o que é "esfriou"                         |
| [S4](#s4)  | Valor esperado                                          | Justifica o esforço de reativar deals de alto valor        | Idem Decisão 1                                           | Valor por preço de tabela superestima o que se recupera                                         | 🟡 · Feature (proxy)   | Sim                                            |
| <a id="s11">S11</a> | Momento do ciclo comercial: mês e trimestre de `engage_date` | Fim de mês ou de trimestre altera o fechamento        | Poucos períodos no dataset (a confirmar na Etapa 3)      | Sazonalidade confundida com tendência                                                           | 🟡 · Contexto          | Sim: calendário comercial                      |
| [S14](#s14) | Atividade e sinais de retomada do cliente               | Seria o gatilho mais direto de reativação [Setor]          | Não existe no dataset                                    | Sem ele o alerta vira falso alarme constante e o vendedor passa a ignorá-lo                     | ❌ · Não disponível    | Sim                                            |

**Notas da decisão**

- Sem log de atividade, o alerta de reativação fica restrito à idade. É a menos sustentada das três decisões do vendedor.

#### Decisão 4 — Onde intervir e fazer coaching

**Stakeholder:** Manager (tática). **Dificuldade atual:** visão depende do relato do vendedor; olha pessoas, não o portfólio.

| ID  | Sinal e derivação                                                   | Por que ajuda a decisão                                      | Limitação do dado                                           | Onde a interpretação distorce / cenário de falha                                                          | Disp. · Uso                   | Validar com a empresa?                 |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------- |
| <a id="s7">S7</a>  | Desempenho do vendedor: win rate histórico do `sales_agent`         | Indica onde o apoio pode render                              | Poucos deals por vendedor em cada recorte                   | Confunde habilidade com território e mix. Uso como avaliação de pessoa estimula [gaming](#g-goodhart)                    | ✅ · Contexto (evitar como feature principal) | Sim: regras de uso gerencial |
| <a id="s8">S8</a>  | Escritório e manager (`regional_office`, `manager`)                 | Contexto regional e de liderança                             | Células pequenas, sobrepostas ao vendedor                   | Efeito do time pode mascarar efeito individual                                                            | ✅ · Contexto                 | Não                                    |
| <a id="s17">S17</a> | Concentração de valor: parcela do valor aberto em poucos deals ou contas | Mostra onde o apoio do manager tem maior retorno        | Depende do proxy de valor ([S4](#s4))                              | Valor concentrado pode refletir preço de tabela, não risco                                                | 🟡 · Contexto                 | Não                                    |
| [S2](#s2)  | Idade relativa ao ciclo típico, nos deals de maior valor            | Deals de alto valor envelhecendo sem apoio                   | Idem Decisão 1                                              | Idade alta pode ser ciclo normal de deal grande                                                           | 🟡 · Contexto                 | Sim                                    |

**Notas da decisão**

- Win rate por vendedor reflete território e mix, não só habilidade. Usado como cobrança, estimula esconder deals ou inflar dados [Setor].
- O ponto de partida é separar, nos dados, o efeito do vendedor do efeito do deal (ver [V8](#v8)).

#### Decisão 5 — Como distribuir carga e foco no time

**Stakeholder:** Manager (tática). **Dificuldade atual:** sem visão comparável de carga e potencial entre vendedores.

| ID  | Sinal e derivação                                                                 | Por que ajuda a decisão                                      | Limitação do dado                                                 | Onde a interpretação distorce / cenário de falha                                              | Disp. · Uso            | Validar com a empresa?                          |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------- |
| <a id="s9">S9</a>  | Carga aberta: deals abertos por vendedor na data (`engage_date ≤ D < close_date`) | Sobrecarga pode explicar esfriamento ([H-002](#h-002))                 | Reconstrução aproximada. Atribuição de deals desconhecida         | Carga alta também correlaciona com vendedor sênior ou carteira maior                          | 🟡 · Diagnóstico       | Sim: capacidade esperada e regra de atribuição  |
| [S10](#s10) | Concorrência por atenção por vendedor e por conta                                 | Complementa a carga bruta                                    | Hipótese sem validação                                            | Pode refletir o mix da carteira                                                               | 🟡 · Contexto          | Sim                                             |
| [S4](#s4)  | Valor esperado por carteira: Σ valor esperado dos deals abertos por vendedor      | Compara potencial entre vendedores                           | Depende do proxy de valor                                         | Carteira com produtos de preço alto parece melhor sem ser                                     | 🟡 · Contexto          | Sim                                             |

**Notas da decisão**

- Se a capacidade for o gargalo, priorizar melhor não resolve o problema. Esta decisão testa a [H-002](#h-002) e foi reincluída porque sumia do mapa de decisões resumido.

#### Decisão 6 — Qual forecast comprometer

**Stakeholder:** Manager (tática). **Dificuldade atual:** pipeline inflado e subjetivo.

| ID  | Sinal e derivação                                                                           | Por que ajuda a decisão                                              | Limitação do dado                                                                      | Onde a interpretação distorce / cenário de falha                                                                        | Disp. · Uso                  | Validar com a empresa?                       |
| --- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------- |
| <a id="s16">S16</a> | Probabilidade [calibrada](#g-calibracao) por segmento (a partir de [S1](#s1), [S3](#s3) e [S5](#s5), calibrada em [backtest](#g-backtest) temporal) | Base do pipeline ponderado                                        | Poucos dados por segmento. Exige data de corte                                         | Herda o [viés de seleção](#g-vies) do histórico e pode inflar o forecast. Calibrada em um recorte, falha em outro                  | 🟡 · Derivado                | Sim                                          |
| [S4](#s4)  | Valor esperado dos deals abertos                                                            | Dá o peso de cada deal no pipeline                                   | Proxy de valor                                                                         | Preço de tabela superestima o valor fechado                                                                             | 🟡 · Feature (proxy)         | Sim: desconto praticado                      |
| [S2](#s2)  | Idade relativa ao ciclo típico                                                              | Pipeline [envelhecido](#g-envelhecido) costuma estar inflado                           | Idem Decisão 1                                                                         | Zumbis inflam o pipeline, mas deal grande legítimo também parece velho                                                  | 🟡 · Feature                 | Sim                                          |
| [S11](#s11) | Momento do ciclo comercial (mês e trimestre)                                                | Fim de trimestre concentra fechamentos                               | Poucos períodos                                                                        | Sazonalidade confundida com tendência                                                                                  | 🟡 · Contexto                | Sim: calendário comercial                    |
| [S17](#s17) | Concentração de valor em poucos deals ou contas                                             | Poucos deals grandes dominam o forecast e aumentam a variância       | Depende do proxy de valor                                                              | Um único deal perdido muda o número, mesmo com boa calibração                                                           | 🟡 · Contexto                | Não                                          |
| <a id="s18">S18</a> | Erro histórico do forecast: previsto × realizado por período                                | Calibra quanto confiar no número                                     | Não consta do briefing. Só há backtest com pipeline reconstruído                       | Backtest do pipeline reconstruído não equivale ao forecast que o manager de fato comprometeu                            | ❌ · Não disponível          | Sim: se existem forecasts guardados          |

**Notas da decisão**

- Pipeline ponderado só serve se as probabilidades estiverem calibradas no recorte de uso. A métrica correta no nível do deal é calibração ([Brier](#g-brier) ou curva de confiabilidade), não MAPE.
- Para o estágio Engaging, é possível reconstruir "o pipeline aberto em D" pelas datas. Prospecting perde o histórico porque não há data de criação.

#### Decisão 7 — Metas, capacidade e compromisso de receita

**Stakeholder:** Direção / Finanças (estratégica), inferido. **Dificuldade atual:** previsibilidade baixa; forecast depende de pipeline subjetivo.

| ID  | Sinal e derivação                                            | Por que ajuda a decisão                                      | Limitação do dado                                                | Onde a interpretação distorce / cenário de falha                                              | Disp. · Uso            | Validar com a empresa?                   |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------- |
| [S16](#s16) | Pipeline ponderado agregado por time e período               | Base mais confiável que o relato                             | Idem Decisão 6                                                   | Perfil do pipeline atual pode diferir do histórico                                            | 🟡 · Derivado          | Sim                                      |
| [S18](#s18) | Erro histórico do forecast                                   | Indica a confiança possível sobre o compromisso              | Idem Decisão 6                                                   | Só existe se houver forecasts guardados                                                       | ❌ · Não disponível    | Sim                                      |
| <a id="s19">S19</a> | Cobertura de pipeline: pipeline ÷ meta                       | Mostra se há pipeline suficiente para a meta                 | A meta não consta do briefing                                    | A regra de 3 a 4 vezes é convenção do setor, não parâmetro desta empresa                      | ❌ · Não disponível    | Sim: metas e regra de cobertura          |
| [S9](#s9)  | Carga e capacidade efetiva por vendedor                      | Entra no cálculo de capacidade                               | Capacidade não é dado                                            | Carga bruta não é capacidade                                                                  | 🟡 · Contexto          | Sim                                      |

**Notas da decisão**

- É um benefício de segunda ordem. "Receita por vendedor" depende de muitos fatores externos e não prova nada sobre a ferramenta; não deve dirigir o desenho do MVP.

#### Decisão 8 — Se e como padronizar o critério e onde investir em dados

**Stakeholder:** Head de RevOps (estratégica). **Dificuldade atual:** sem [baseline](#g-baseline) nem custo do problema; impacto difícil de isolar.

| ID  | Sinal e derivação                                                                 | Por que ajuda a decisão                                           | Limitação do dado                                                   | Onde a interpretação distorce / cenário de falha                                                          | Disp. · Uso              | Validar com a empresa?                    |
| --- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------- |
| <a id="s20">S20</a> | Baseline de win rate, ciclo e ticket por período, produto e vendedor              | Referência para provar melhoria                                   | Derivável do dataset. Custo e margem não                            | Win rate de coorte recente é censurado. Comparar períodos exige a mesma maturidade                        | 🟡 · Baseline            | Sim: período representativo               |
| [S7](#s7)  | Dispersão de desempenho entre vendedores para deals semelhantes                   | Indica se falta critério compartilhado ([H-001](#h-001))                    | Amostras pequenas e mix distinto                                    | Dispersão pode refletir carteira, não critério                                                            | 🟡 · Diagnóstico         | Sim                                       |
| <a id="s21">S21</a> | Custo-hora do vendedor e margem                                                   | Converte ganho em valor financeiro                                | Não constam do briefing                                             | Sem eles, o retorno vira estimativa com premissas                                                         | ❌ · Não disponível      | Sim                                       |
| <a id="s12">S12</a> | Completude dos dados por estágio                                                  | Mostra se vale investir em dados antes                            | Nulo pode ser estrutural                                            | Medir sem condicionar ao estágio gera falsos alarmes                                                      | ✅ · Controle de qualidade | Não                                     |

**Notas da decisão**

- Sem baseline, o ganho só pode ser apresentado como hipótese e cenário, nunca como resultado (ver 2.3 e 2.4).

#### Decisão 9 — Quais campos e regras de estágio exigir

**Stakeholder:** Analista de RevOps / CRM (tática), inferido. **Dificuldade atual:** dados incompletos, definição de estágio ambígua.

| ID  | Sinal e derivação                                                                        | Por que ajuda a decisão                                          | Limitação do dado                                         | Onde a interpretação distorce / cenário de falha                                               | Disp. · Uso                | Validar com a empresa?                      |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------- |
| [S12](#s12) | Completude por estágio (datas, valor, conta, vendedor)                                   | Define quais deals podem ser pontuados                           | Nulo pode ser estrutural, não falha                       | Medir completude sem condicionar ao estágio gera falsos alarmes                                | ✅ · Controle de qualidade | Sim: campos obrigatórios por estágio        |
| <a id="s22">S22</a> | Integridade referencial e temporal: chaves únicas, joins sem perda, `close_date ≥ engage_date` | Score sobre dado inconsistente é ruído                      | A verificar na Etapa 3                                    | Joins silenciosos descartam linhas sem aviso                                                   | ✅ · Controle de qualidade | Não                                         |
| [S14](#s14) | Registro de atividade e de mudança de estágio                                            | Sem ele, esfriamento e esforço não são mensuráveis               | Não existe no dataset                                     | —                                                                                              | ❌ · A instrumentar        | Sim: existe fora do dataset?                |

**Notas da decisão**

- Campos obrigatórios aumentam a fricção e podem reduzir a qualidade do preenchimento. Definição de estágio padronizada é pré-condição para qualquer score.

#### Erros frequentes ao resolver este problema com IA

| Erro                                                  | Por que acontece                  | Como evitar                                                                                                         |
| ----------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Treinar Won × Lost com split aleatório                | Parece o jeito padrão             | Backtest temporal, treinando no passado e testando no futuro                                                        |
| Incluir `close_date`, `close_value` ou ciclo como feature | Correlação alta, vazamento    | Congelar o conjunto de features na data de corte de cada deal                                                       |
| Tratar deals abertos como negativos                   | Praticidade                       | Treinar só com fechados. Os abertos são alvo de predição                                                            |
| Exibir "score 85" sem calibração                      | Parece intuitivo                  | Calibrar e mostrar como "em casos parecidos, cerca de X% fecharam"                                                  |
| Priorizar por P(win)                                  | É o óbvio                         | P(win) alta nem sempre precisa de atenção. O ganho marginal está em deals de valor alto e risco médio               |
| Priorizar só por valor                                | Ordenar por ticket é simples      | O briefing diz que ordenar por valor não é suficiente                                                               |
| Explicabilidade com SHAP de feature não acionável     | Parece sofisticado                | Explicar em termos que o vendedor controla ("parado há 2× o ciclo típico do produto")                               |
| Otimizar [AUC](#g-auc) e declarar vitória                       | Métrica de laboratório            | Medir [lift](#g-lift) no top-K ponderado por valor e, depois, mudança de comportamento                                         |
| Modelo complexo em poucos milhares de fechados        | Impressiona                       | Regras com pesos justificáveis tendem a vencer, como o próprio briefing sinaliza                                    |
| Dashboard sem fluxo de decisão                        | É fácil entregar                  | Entregar uma lista "segunda-feira, faça isto" com o motivo por linha                                                |
| Usar LLM para gerar "insights" sem checagem           | Rápido de demonstrar              | Toda narrativa gerada precisa ser verificada contra os dados. Causalidade inventada é o risco                       |
| Ignorar joins silenciosos                             | `merge` não avisa                 | Validar a contagem de linhas antes e depois, conferir chaves nulas e grafias divergentes entre tabelas              |
| Ignorar Goodhart                                      | O score vira meta                 | Prever que vendedores moverão estágio ou data para subir no ranking                                                 |

<a id="sub-2-3"></a>
### 2.3. Business Value Map

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Impactos e custos possíveis | [Etapa 1, 1.4](#sub-1-4) | Origem dos mecanismos [M1](#m1) a [M9](#m9) e das fórmulas |
| Conceitos de valor: [D11](#d11) a [D16](#d16) | [Etapa 2, 2.1.2](#sub-2-1-2) | Vocabulário de valor realizado, [preço de tabela](#g-preco-tabela), [win rate](#g-win-rate) e pipeline ponderado |
| Sinais [S4](#s4), [S20](#s20) e [S21](#s21) | [Etapa 2, 2.2](#sub-2-2) | Indicam quais dados cada fórmula precisa |


**Pergunta que responde:** onde o problema pode gerar custos ou perda de receita?
**Resultado esperado:** mecanismos econômicos, fórmulas e dados necessários.

Nenhum custo foi comprovado. Tudo abaixo é exposição a risco ou benefício hipotético e deve ser reportado como cenário, nunca como resultado.

| ID | Mecanismo                              | Como gera custo ou perda                                              | Fórmula                                                                                       | Dados necessários                                                                       | Disp.                                                                             | Natureza                                       |
| -- | -------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| <a id="m1">M1</a> | Esforço em deals que acabam [Lost](#g-estagios)       | Horas consumidas depois do ponto razoável de desqualificação          | Σ (horas após o ponto de desqualificação) × custo-hora carregado                              | Log de horas ou atividade, custo-hora, definição do ponto razoável                      | ❌ [Proxy](#g-proxy): dias entre `engage_date` e `close_date` nos Lost (calendário, não esforço) | Exposição                                      |
| <a id="m2">M2</a> | Esfriamento de bons deals              | Deal que ganharia com atenção e perdeu                                | Σ [(P(win\|atendido) − P(win\|observado)) × valor esperado × margem]                          | Sinal de negligência, efeito causal da atenção, valor esperado, margem                  | ❌ Contrafactual                                                                  | Exposição, difícil de provar                   |
| <a id="m3">M3</a> | Receita adiada (ciclo longo)           | O dinheiro entra depois                                               | Valor ganho × (dias extras ÷ ciclo-base) × taxa de desconto                                   | Ciclo por produto, benchmark, taxa de desconto                                          | 🟡 Ciclo sim. Taxa de desconto não                                                | Hipotético                                     |
| <a id="m4">M4</a> | Pipeline em risco                      | Valor aberto sem avanço, provavelmente inflado                        | Σ valor esperado dos deals abertos com idade > X (por exemplo, P90 do ciclo)                  | Definição de "sem avanço", valor esperado, data de corte                                | 🟡                                                                                | Exposição                                      |
| <a id="m5">M5</a> | Erro de forecast                       | Meta e headcount [calibrados](#g-calibracao) sobre base inflada                        | \|previsto − realizado\| ÷ realizado                                                          | Forecasts históricos                                                                    | ❌ [Backtest](#g-backtest) só com pipeline reconstruído                                          | Exposição                                      |
| <a id="m6">M6</a> | Falso negativo do score                | Deal bom despriorizado e perdido por causa da ferramenta              | Σ [P(win) × valor × margem × 1(deal ranqueado abaixo do corte)]                               | Backtest temporal, margem                                                               | 🟡 Medível em backtest                                                            | **Risco introduzido pela solução**             |
| <a id="m7">M7</a> | Custo de oportunidade da capacidade    | Hora gasta em deal marginal em vez do deal melhor                     | Horas liberadas × valor esperado por hora do deal alternativo                                 | Horas por deal, valor esperado por hora                                                 | ❌                                                                                | Hipotético                                     |
| <a id="m8">M8</a> | Ganho potencial do score               | Mais Won com o mesmo esforço                                          | Δ win rate × deals trabalhados × [ticket médio](#g-ticket) × margem                                        | Win rate e ticket (deriváveis), Δ validado (inexistente), margem (ausente)              | 🟡                                                                                | Hipotético                                     |
| <a id="m9">M9</a> | Custo de construir, adotar e manter    | Se ninguém usa, o investimento não retorna                            | Horas de build + manutenção + tempo de treinamento + tempo do vendedor                        | Estimativas internas                                                                    | ❌                                                                                | Custo                                          |

<a id="sub-2-4"></a>
### 2.4. KPI Framework

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Indicadores candidatos | [Etapa 1, 1.4](#sub-1-4) | Ponto de partida dos KPIs |
| Mecanismos [M1](#m1) a [M9](#m9) | [Etapa 2, 2.3](#sub-2-3) | Cada KPI mede um mecanismo de custo ou ganho |
| [Win rate](#g-win-rate) ([D15](#d15)), [censura](#g-censura) ([D24](#d24)) e [viés de seleção](#g-vies) ([D25](#d25)) | [Etapa 2, 2.1.2](#sub-2-1-2) | Explicam as limitações de cada KPI |


**Pergunta que responde:** como avaliaremos se a solução gera valor?
**Resultado esperado:** KPI principal candidato e até três métricas de apoio.

| Nível         | KPI                                                                  | Definição e fórmula                                                                                                                                                                                              | Por que este                                                                                                                  | Como medir                                                                                                                                                                                               | Limitações                                                                                                                         |
| ------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Principal** | **Δ de win rate ponderado por valor nos deals priorizados**          | Σ valor_proxy dos [Won](#g-estagios) ÷ Σ valor_proxy de (Won + Lost), comparando a coorte priorizada com o [baseline](#g-baseline). Usar o mesmo [proxy](#g-proxy) de valor nos dois lados, já que `close_value` é 0 nos Lost                               | Une as duas queixas do briefing (tempo perdido e oportunidade esfriada) em um número ligado a receita. Evita olhar só contagem | **No desafio:** valor capturado no top-K em [backtest](#g-backtest) temporal contra baselines (taxa global, por produto). **Em produção:** piloto com [grupo de controle](#g-controle), coortes de mesma maturidade                     | Censura à direita. Atribuição só com controle. Precisa de proxy de valor. Só vale se o KPI de adoção for positivo                  |
| Apoio 1       | **Adoção e ação semanal**                                            | % dos vendedores ativos que abrem a lista e executam ao menos uma ação sobre deals do top-K                                                                                                                      | Sem uso não há impacto                                                                                                        | Instrumentação da própria ferramenta                                                                                                                                                                     | Não existe no dataset. Precisa ser desenhada no produto                                                                            |
| Apoio 2       | **Qualidade do score**                                               | [Calibração](#g-calibracao) ([Brier](#g-brier) ou ECE) e [lift](#g-lift)@top-K em valor, em backtest temporal e depois monitorado                                                                                                                        | Garante que "score 80" signifique algo e que o ranking supere o ingênuo                                                       | Backtest sem [vazamento](#g-vazamento). Re-treino periódico                                                                                                                                                              | Mede o modelo, não o comportamento                                                                                                 |
| Apoio 3       | **Valor aberto em deals acima do P90 do ciclo**                      | % do valor esperado aberto com idade > P90 do ciclo de Won do mesmo produto                                                                                                                                      | Indicador de estoque de deals parados e de [zumbi](#g-envelhecido), menos contaminado por limpeza em lote que "tempo até desqualificar"          | Data de corte, ciclo por produto                                                                                                                                                                         | Idade alta não prova que o deal esteja perdido                                                                                     |

> **Propriedades do KPI principal (informação para a Arquitetura, anotada na consolidação).** O KPI desta tabela pode ser lido de duas formas, e cada uma se comporta de um jeito.
>
> - **Como razão** (Σ valor dos Won ÷ Σ valor de Won + Lost): como a taxa de ganho por produto é praticamente plana (60,0% a 64,8%, ver [H-004](#h-004) em [3.2](#sub-3-2)), a razão fica entre esses limites para qualquer composição de carteira e **não consegue indicar melhora**.
> - **Como "valor capturado no top-K"** (a forma de medir descrita acima): **sobe por construção** ao priorizar produtos caros. GTX Plus Pro vale 5.482 e MG Special vale 55, com taxa de ganho de 64,3% e 64,8%, então um topo "dos caros" captura muito mais valor sem acertar mais.
>
> Isso não é um problema a resolver no discovery. É a informação de que a Arquitetura precisa para escolher a leitura e projetar a instrumentação ([AR-12](#ar-12)). Nas duas leituras, o efeito só é estimável em **piloto com grupo de controle**. Ver [3.4](#sub-3-4) e a [pergunta 7 de 4.1](#sub-4-1). Decisão de 15/10/2026: manter o KPI.


<a id="sub-2-5"></a>
### 2.5. Data Validation Plan

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Hipóteses [H-001](#h-001) a [H-008](#h-008) | [Etapa 1, 1.3](#sub-1-3) | Cada teste V liga a uma hipótese |
| Sinais [S1](#s1) a [S22](#s22) | [Etapa 2, 2.2](#sub-2-2) | Cada teste verifica a disponibilidade ou o poder de um sinal |
| Mecanismos [M1](#m1) a [M9](#m9) e KPIs | [Etapa 2, 2.3](#sub-2-3) e [2.4](#sub-2-4) | A coluna "o que muda" indica a consequência para o valor ou o KPI |


**Pergunta que responde:** o que precisamos verificar no dataset?
**Resultado esperado:** hipóteses, campos necessários e testes para a Etapa 3.

Os limiares são propostas a [calibrar](#g-calibracao), não regras. Ordem de execução: bloco A, depois B, depois C.

| ID  | Bloco           | Hipótese a verificar                                                  | Liga a              | Campos                                                          | Teste (Etapa 3)                                                                                                                         | O que muda se confirmar ou refutar                                                                       | Prioridade |
| --- | --------------- | --------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| <a id="v1">V1</a>  | A. Integridade  | Chaves são únicas e os joins não perdem linhas                        | [H-005](#h-005)               | `opportunity_id`, `product`, `account`, `sales_agent`            | Unicidade. Contagem de linhas antes e depois de cada join. Grafias divergentes entre tabelas                                            | Refutar: corrigir o mapeamento antes de qualquer análise                                                 | 1          |
| <a id="v2">V2</a>  | A. Integridade  | A completude depende do estágio (nulo estrutural versus falha)       | [H-005](#h-005)               | Todos os campos × `deal_stage`                                   | % de nulos por estágio                                                                                                                  | Define quais deals são [pontuáveis](#g-pontuavel) e quais o MVP recusa pontuar                                           | 1          |
| <a id="v3">V3</a>  | A. Integridade  | As datas são coerentes e há uma data de corte definível               | [H-005](#h-005)               | `engage_date`, `close_date`                                      | `close < engage`, datas futuras, máximo das datas como data de corte                                                                    | Sem data de corte não há idade nem [backtest](#g-backtest)                                                              | 1          |
| <a id="v4">V4</a>  | A. Integridade  | [Lost](#g-estagios) significa abandono, e não limpeza de CRM                         | [P-001](#p-001), [H-003](#h-003)        | `close_date`, `close_value`, `deal_stage`                        | Agrupamento de `close_date` de Lost em fim de mês ou trimestre. Won com valor 0 e Lost com valor > 0                                    | Se forem em lote, "tempo até desqualificar" é métrica de higiene                                         | 1          |
| <a id="v5">V5</a>  | B. Estrutura    | O ciclo é estável e distinto por produto e por resultado              | [D8](#d8), [S2](#s2)              | `product`, datas, `deal_stage`                                   | Distribuição de ciclo (P50/P90) por produto, Won versus Lost                                                                            | Confirmar: [S2](#s2) é utilizável. Refutar: idade não discrimina                                                | 2          |
| <a id="v6">V6</a>  | B. Estrutura    | Há deals Engaging muito acima do ciclo normal ([zumbis](#g-envelhecido))                | [P-001](#p-001), [P-002](#p-002), [M4](#m4)    | `engage_date`, ciclo por produto                                 | Quantos e quanto valor acima do P90                                                                                                     | Mede o tamanho do problema de pipeline inflado                                                           | 2          |
| <a id="v7">V7</a>  | B. Estrutura    | Os segmentos têm sinal estatístico                                    | [S3](#s3), [S5](#s5), [S8](#s8)          | `product`, setor, porte, escritório                              | [Win rate](#g-win-rate) com intervalo de confiança e amostra mínima por célula                                                                         | Refutar: poder discriminativo baixo. A solução vira heurística simples com limitação explícita           | 2          |
| <a id="v8">V8</a>  | B. Estrutura    | O vendedor domina a variância do resultado                            | [H-001](#h-001), [S7](#s7)           | `sales_agent`, `product`, `account`, `regional_office`           | Decomposição de variância ou modelo misto                                                                                               | Se dominar, o score vira detector de "quem é o dono" e não deve usar vendedor como feature               | 2          |
| <a id="v9">V9</a>  | B. Estrutura    | O [preço de tabela](#g-preco-tabela) é um bom [proxy](#g-proxy) de valor                             | [H-008](#h-008), [S4](#s4)           | `close_value`, preço do produto                                  | Razão `close_value` ÷ preço nos Won                                                                                                     | Confirmar: valor esperado = preço. Refutar: usar ticket histórico                                        | 2          |
| <a id="v10">V10</a> | B. Estrutura    | Poucas contas concentram o valor e se repetem                         | [S6](#s6), [M8](#m8)              | `account`, `close_value`                                         | Participação das maiores contas. [Vazamento](#g-vazamento) por conta entre treino e teste                                                               | Define se o split deve ser por conta além de por tempo                                                   | 2          |
| <a id="v11">V11</a> | C. Decisão      | A carga aberta se relaciona com esfriamento                           | [H-002](#h-002), [S9](#s9)           | Datas por vendedor                                               | Abertos por vendedor ao longo do tempo versus win rate e ciclo                                                                          | Se houver relação, capacidade pode ser o gargalo e "priorizar melhor" é insuficiente                     | 3          |
| <a id="v12">V12</a> | C. Decisão      | O score supera [baselines](#g-baseline) ingênuos fora da amostra                     | [H-007](#h-007)               | Features congeladas na data de corte de cada deal                | Backtest temporal contra taxa global, por produto e por vendedor. [AUC](#g-auc), [Brier](#g-brier) e [lift](#g-lift)@top-K em valor                                      | Se não superar, entregar regras simples e dizer isso com clareza                                         | 3          |
| <a id="v13">V13</a> | C. Decisão      | A função-objetivo muda o ganho esperado                               | [HD-01](#hd-01)               | Valor, probabilidade, idade                                      | Replay semanal com capacidade K comparando políticas (aleatória, valor, P(win), valor esperado, valor esperado ÷ idade)                 | Define o que "prioridade" significa na interface. O ganho é teto, pois assume que atenção não altera o desfecho | 3     |
| <a id="v14">V14</a> | C. Decisão      | O win rate e o ciclo são estáveis no tempo                            | [S11](#s11), [D25](#d25)            | Datas                                                            | Win rate e ciclo por trimestre ou mês                                                                                                   | Instabilidade invalida treinar em um período para usar em outro                                          | 3          |

**O que este dataset não permite verificar**

- **Esforço real e tempo perdido ([M1](#m1), [M7](#m7)):** não há log de atividade.
- **Esfriamento causal ([M2](#m2)):** não há contrafactual.
- **Margem e custo-hora:** não constam do briefing.
- **Representatividade e incentivos:** dependem de entrevista com a Head de RevOps, managers e vendedores.

Esses pontos entram como limitações e premissas na seção 4, e não como resultados.

<a id="sub-2-6"></a>
### 2.6. Avaliação das hipóteses do mapa de decisões

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Decisões e dificuldades de cada papel | [Etapa 1, 1.2](#sub-1-2) | Cada HD é uma "mudança esperada" de uma decisão |
| Sinais por decisão | [Etapa 2, 2.2](#sub-2-2) | Indicam a condição de validade e onde pode falhar |
| Testes [V1](#v1) a [V14](#v14) | [Etapa 2, 2.5](#sub-2-5) | A última coluna aponta o teste que verifica cada HD |


Cada linha é uma "mudança esperada" do mapa de decisões, avaliada pelos mesmos cinco critérios. IDs [HD-01](#hd-01) a [HD-08](#hd-08) seguem a ordem do mapa. A coluna "Testes" aponta para o plano da seção 2.5.

| ID    | Decisão e mudança esperada                                                                                  | Por que pode fazer sentido                                                                                         | Condição de validade                                                                                                                | Onde pode falhar                                                                                                                                                                  | Evidência necessária                                                                                    | Decisão que influencia                                                                | Testes             |
| ----- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------ |
| <a id="hd-01">HD-01</a> | **Vendedor — qual deal trabalhar.** Esforço concentrado em deals de maior chance e valor esperado           | Tempo finito e muitos deals. Critério explícito e comparável é o argumento central da ferramenta                   | A carga excede a capacidade; o score discrimina melhor que o feeling; o vendedor consegue mudar o que faz                          | A capacidade não é o gargalo ([H-002](#h-002)); o feeling já é bom ([H-007](#h-007)); o score reproduz o viés do histórico ([H-006](#h-006)); priorizar por P(win) empurra para deals que fechariam sozinhos     | Carga aberta por vendedor; [backtest](#g-backtest) temporal contra [baselines](#g-baseline); retrato do comportamento atual           | Função-objetivo do score (P(win), valor esperado ou ganho marginal) e tela inicial    | [V11](#v11), [V12](#v12), [V13](#v13)      |
| <a id="hd-02">HD-02</a> | **Vendedor — quando desqualificar.** Deals sem chance são encerrados mais cedo                              | Deal [zumbi](#g-envelhecido) consome atenção e polui o forecast; sem ciclo de referência o vendedor não percebe que passou do ponto   | Há ciclo típico estável por produto; idade acima do esperado indica baixa chance; desqualificar é permitido e não penaliza a meta   | Ciclo longo legítimo; CRM sem higiene (problema de dado, não de decisão); remuneração ou cultura punem [Lost](#g-estagios); falso positivo mata deal bom                                          | Ciclo Won × Lost por produto; taxa de ganho de deals acima do P90; regras de comissão e metas           | Limiar de "revisar ou encerrar" e o tom do alerta (sugestão ou ordem)                 | [V4](#v4), [V5](#v5), [V6](#v6)         |
| <a id="hd-03">HD-03</a> | **Vendedor — quando reativar.** Deals de alto potencial recebem ação antes de esfriar                       | O briefing cita esfriamento explicitamente; janelas de retomada existem em vendas de ciclo curto                   | Há sinal confiável de "parado" (aqui, só a idade) e a retomada tem efeito causal na chance de ganho                                | Sem log de atividade, "parado" é indistinguível de negociação normal; o cliente pode não ter interesse; falso alarme constante faz o vendedor ignorar                              | Atividade por deal (ausente); [win rate](#g-win-rate) por faixa de idade condicional ao produto; entrevista            | Se existe módulo de reativação ou se ele se funde ao de desqualificação               | [V5](#v5), [V6](#v6)             |
| <a id="hd-04">HD-04</a> | **Manager — onde intervir.** Coaching guiado por risco e valor, não só por relato                           | Hoje depende do relato do vendedor; visão de portfólio ajuda a achar valor concentrado em risco                    | O manager tem tempo e autoridade; o risco por vendedor é separável do mix de produtos e contas                                     | Win rate por vendedor reflete território e mix e vira cobrança injusta; o vendedor esconde deals ou infla dados                                                                    | Decomposição de variância; win rate ajustado a mix; como o manager usa as informações hoje              | Se há visão de manager, nível de detalhe por pessoa e governança de uso               | [V8](#v8)                 |
| <a id="hd-05">HD-05</a> | **Manager — qual forecast comprometer.** Forecast sobre pipeline ponderado e [calibrado](#g-calibracao), com menos desvio    | Forecast por julgamento tende a ser otimista; probabilidades calibradas são a base padrão do pipeline ponderado    | As probabilidades estão calibradas no recorte de uso e há volume por agregado                                                      | Perfil do pipeline atual difere do histórico; [viés de seleção](#g-vies) infla probabilidades; não há forecasts passados                                                                     | Pipeline reconstruído em várias datas; comparação ponderado × realizado; calibração ([Brier](#g-brier))             | Se forecast entra no escopo do MVP ou fica como extensão. Recomendação: secundário    | [V12](#v12), [V14](#v14)           |
| <a id="hd-06">HD-06</a> | **Direção / Finanças — metas e capacidade.** Definidas sobre base mais confiável                            | Previsibilidade sustenta meta e headcount                                                                          | O score melhora o forecast de forma mensurável e a direção confia nele                                                             | A ferramenta é pensada para vendedor e a direção a usa para fins que ela não suporta; "receita por vendedor" é afetada por fatores externos                                       | Histórico de Won (derivável); capacidade efetiva e forecasts antigos (ausentes)                         | Praticamente nenhuma no MVP; benefício de segunda ordem                               | [V12](#v12), [V14](#v14)           |
| <a id="hd-07">HD-07</a> | **Head de RevOps — padronizar e investir.** Decisão apoiada em baseline e retorno medido                    | É a hipótese mais saudável do mapa: pede medir antes de afirmar                                                    | O baseline pode ser congelado e há ao menos um período de comparação ou piloto                                                     | Custo-hora, margem e esforço não existem; adoção e Δ win rate não são separáveis sem controle                                                                                     | Win rate e ciclo históricos; custo-hora e margem fornecidos pela Head; desenho de [piloto com controle](#g-controle)   | O que se promete no Executive Summary: sem baseline, só hipótese e cenário            | [V5](#v5), [V12](#v12)            |
| <a id="hd-08">HD-08</a> | **Analista de RevOps / CRM — campos e regras de estágio.** Definições padronizadas e auditáveis             | Score sobre dado ruim é ruído; definições ambíguas de estágio invalidam o histórico                                | As definições são seguidas na prática (hoje desconhecido)                                                                          | A incompletude é estrutural (Prospecting sem `engage_date`), não falha de preenchimento; campos obrigatórios elevam a fricção e reduzem a qualidade                               | Completude por estágio; duplicidade de IDs; nomes inconsistentes entre tabelas; datas impossíveis       | Quais deals são [pontuáveis](#g-pontuavel), o que o MVP deve recusar pontuar e o que vira limitação   | [V1](#v1), [V2](#v2), [V3](#v3)         |

**Observações gerais sobre o mapa de decisões**

- O mapa lista efeitos desejados, não mecanismos. Entre "o score existe" e "o win rate sobe" há uma cadeia (o score acerta, o vendedor confia, muda o comportamento, o resultado muda), e cada elo pode quebrar.
- A linha "distribuir carga e foco" do `discovery.md` (1.2) não consta do mapa resumido. Ela testa a [H-002](#h-002) e foi reincluída na Decisão 5 de 2.2.
- Vários KPIs do mapa são circulares ou atrasados. "Win rate de alto potencial" é alto por construção se "alto potencial" for definido pelo próprio score, e "receita por vendedor" está longe demais da intervenção para ser atribuída a ela. O KPI principal proposto em 2.4 tenta corrigir isso.
- "% de deals com datas e valor completos" é derivável do dataset ([V2](#v2)), mas precisa ser medido condicionado ao estágio.

<a id="sub-2-7"></a>
### 2.7. Conhecimento específico da empresa a validar

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Marcações [Validar] | [Etapa 2, 2.1.2](#sub-2-1-2) e [2.2](#sub-2-2) | Consolidadas nesta lista |
| Perguntas-chave | [Etapa 1, 1.5](#sub-1-5) | Parte delas só pode ser respondida pela empresa |
| "O que o dataset não permite verificar" | [Etapa 2, 2.5](#sub-2-5) | Complementa a lista com limites de dado |


Lista consolidada do que não pode ser assumido a partir do briefing nem do dataset. Alimenta "Limitações e premissas" da seção 4.

| Item                                              | Por que não dá para assumir                                | Impacto se estiver errado                                         | Aparece em                  |
| ------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------- |
| Significado de cada estágio e do [Lost](#g-estagios)             | Cada empresa define de um jeito. Lost pode incluir limpeza | Rótulo do modelo errado                                           | [D1](#d1) a [D5](#d5), [V4](#v4)                 |
| Como os deals chegam ao vendedor (atribuição)     | Atribuído ou escolhido muda a leitura do viés              | O score pode medir o critério de roteamento                       | [D21](#d21), [D25](#d25), [S9](#s9)                |
| Plano de comissão e metas                         | Define o incentivo a manter deals abertos                  | O sinal de "desqualificar" pode ser inviável ou punitivo          | [D26](#d26), [HD-02](#hd-02)                  |
| Capacidade esperada por vendedor                  | É convenção interna                                        | Define se o problema é critério ou carga                          | [D21](#d21), [S9](#s9), [V11](#v11)                |
| Ciclo e ticket normais por produto                | Referências do setor não valem                             | Limiar de "parado" arbitrário                                     | [D8](#d8), [D9](#d9), [S2](#s2)                  |
| Valor real de um deal aberto                      | [Preço de tabela](#g-preco-tabela) ≠ valor fechado                            | Ranking por valor esperado distorcido                             | [D12](#d12), [D13](#d13), [S4](#s4), [V9](#v9)            |
| Fluxo semanal real do vendedor                    | A interface correta depende dele                           | Baixa adoção                                                      | 2.1.1                       |
| Uso gerencial planejado do score                  | Apoio ou avaliação                                         | Gaming e rejeição                                                 | [S7](#s7), [HD-04](#hd-04)                   |
| Custo-hora do vendedor e margem                   | O briefing não traz                                        | ROI não calculável                                                | [S21](#s21), [M1](#m1), [M7](#m7), [M8](#m8)             |
| O que "esfriar" significa para a empresa          | Termo informal                                             | Métrica de esfriamento sem definição                              | [D9](#d9), [HD-03](#hd-03)                   |
| Existência de forecasts históricos                | Não consta do briefing                                     | Sem eles, a [calibração](#g-calibracao) do forecast fica restrita a [backtest](#g-backtest)       | [D19](#d19), [S18](#s18), [HD-05](#hd-05)             |


**Ponte para a Etapa 3.** A Etapa 2 produziu 26 conceitos ([D1](#d1) a [D26](#d26)), 22 sinais candidatos ([S1](#s1) a [S22](#s22)), 9 mecanismos de custo ([M1](#m1) a [M9](#m9)), um [framework de KPIs](#sub-2-4) e um plano com 14 testes ([V1](#v1) a [V14](#v14)). Nada disso foi verificado: o limite declarado no início da etapa é que os arquivos CSV não foram analisados. A [Etapa 3](#etapa-3) executa o plano e diz quais hipóteses e sinais sobrevivem.

---

<a id="etapa-3"></a>
## 3. Data Discovery

_Status: Concluído em 15/10/2026 (síntese sobre a auditoria executada). Dois testes decisivos ([T-A](#t-a) e [T-B](#t-b), seção 3.8) permanecem pendentes._

[↑ Voltar ao índice](#indice)

> **Em linguagem simples**
>
> **O que esta etapa responde:** o que os dados realmente permitem concluir.
>
> **O que fizemos:** executamos o plano da Etapa 2 sobre os cinco arquivos reais, com um script reproduzível, e classificamos cada hipótese como sustentada, contradita ou não verificável.
>
> **O que encontramos:** a estrutura dos dados é boa, com três armadilhas. Sabemos o resultado de 6.711 oportunidades (63% ganhas). Com os campos disponíveis, quase nada prevê ganhar ou perder melhor do que a média. O único padrão forte (fechar no fim do trimestre) é [vazamento](#g-vazamento). O valor de uma oportunidade aberta pode ser estimado pelo preço do produto. E 81% das oportunidades em negociação estão abertas há mais tempo do que qualquer uma que já fechou.
>
> **O que passa para a próxima etapa:** a lista do que os dados sustentam, do que não sustentam e do que ficou sem teste.


**Base de evidência:** [`data-audit.md`](./data-audit.md) e o script [`audit_data.py`](../solution/scripts/audit_data.py). A saída do script foi conferida como idêntica em uma reexecução em diretório temporário. Esta seção não repete a auditoria: converte os achados em conclusões para decisão.

**Classificação das hipóteses:** *Sustentada*, *Contradita*, *Parcialmente sustentada* ou *Não verificável*. Resultado histórico não é impacto comprovado da ferramenta; associação não é causalidade; [taxa-base](#g-taxa-base) não é probabilidade [calibrada](#g-calibracao).

**Nota de terminologia:** os dados medem **idade** do deal aberto, não abandono. Por isso esta seção usa "[envelhecido](#g-envelhecido)" onde o `data-audit.md` usa "zumbi" (rótulo da [V6](#v6)). *[Lost](#g-estagios)* é, segundo o README e o `metadata.csv`, um estágio terminal do deal (oposto de *Won*, com `close_value` = 0); o dataset não registra o motivo.

<a id="sub-3-1"></a>
### 3.1. Fontes de evidência e limitação temporal

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Plano de validação [V1](#v1) a [V14](#v14) | [Etapa 2, 2.5](#sub-2-5) | O script audit_data.py implementa o plano |
| Hipóteses [P-001](#p-001) a [H-008](#h-008) | [Etapa 1, 1.3](#sub-1-3) | São avaliadas em 3.2 |
| Auditoria dos dados | [data-audit.md](./data-audit.md) | Fonte primária de todos os números desta etapa |
| Limite "CSV não analisados" | [Etapa 2, início](#etapa-2) | Resolvido nesta etapa; os arquivos foram auditados |


| Fonte                                  | O que fornece                                                      | Estatuto                  |
| -------------------------------------- | ------------------------------------------------------------------ | ------------------------- |
| 5 CSVs em `solution/data/raw/`         | 8.800 oportunidades, 85 contas, 7 produtos, 35 vendedores          | Dado primário (hash fixo) |
| `audit_data.py` (execução 4)           | Todos os números citados                                           | Reproduzível, determinístico |
| `data-audit.md`                        | Leitura dos resultados                                             | Secundário (interpretação) |
| `discovery.md` §1 e §2                 | Hipóteses, sinais, KPIs e plano de validação [V1](#v1)–[V14](#v14)                | Premissas a testar        |
| README do challenge                    | Colunas, definição de estágio, `close_value` = 0 se [Lost](#g-estagios)           | Contrato                  |

O arquivo `docs/challenge-assessment.md`, citado nas instruções, não existe no repositório. O README do challenge foi usado como fonte de requisitos, por decisão registrada no início da auditoria.

**Limitação temporal**

| Fato medido                                                                                                              | Consequência                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Um único retrato final. `engage_date` de 2016-10-20 a 2017-12-27; `close_date` de 2017-03-01 a 2017-12-31               | Não há histórico de estágio nem de atividade; o estado do deal é só o de hoje                  |
| Não há data de extração                                                                                                  | A idade dos abertos depende da data de corte assumida (2017-12-31)                             |
| Nenhum fechamento antes de 2017-03-01; para cada mês de engage anterior, o ciclo mínimo coincide com a distância até essa data | [Truncamento](#g-truncamento) à esquerda: deals engajados antes de março são selecionados                  |
| Ciclo máximo entre fechados: 138 dias                                                                                    | 1.291 dos 1.589 Engaging (81,2%) estão [fora do suporte](#g-suporte) do histórico fechado                    |
| Taxa de ganho por mês de fechamento: 48,6% a 82,8%                                                                       | Qualquer métrica temporal depende da janela escolhida                                          |

**Limites da própria auditoria que afetam estas conclusões**

- A taxa de ganho de 63,15% é condicionada aos 6.711 fechados. Por aritmética, o piso e o teto com os 2.089 abertos são 48,2% (todos perdidos) e 71,9% (todos ganhos).
- Os cortes do [backtest](#g-backtest) se sobrepõem; os 40 intervalos de confiança não são independentes.
- Treino (fechados até T) e teste (abertos em T que depois fecharam) têm composição diferente.
- A carga do vendedor exclui Prospecting, que não tem data.

<a id="sub-3-2"></a>
### 3.2. Hipótese → Evidência → Conclusão → Limitação → Implicação para o MVP

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Hipóteses [P-001](#p-001) a [H-008](#h-008) | [Etapa 1, 1.3](#sub-1-3) | Cada linha da tabela é uma hipótese avaliada |
| Decisões [HD-01](#hd-01) a [HD-08](#hd-08) | [Etapa 2, 2.6](#sub-2-6) | Recebem a classificação final na segunda tabela |
| Testes [V1](#v1) a [V14](#v14) | [Etapa 2, 2.5](#sub-2-5) | Origem de cada evidência ([`A§2.10`](./data-audit.md#a-2-10) traz o resultado de cada V) |
| Resultados e leitura | [data-audit.md, seções 2 e 3](./data-audit.md#a-2) | As referências `A§` apontam para lá |


Fontes: A§ = seção do `data-audit.md`; S§ = seção do script. "Implicação" inclui a decisão afetada e o próximo teste.

| Hipótese | Evidência (fonte, cálculo, resultado, população) | Conclusão | Limitação e explicações alternativas | Implicação para o MVP |
| --- | --- | --- | --- | --- |
| **[P-001](#p-001)** Tempo demais em deals que não fecham | [A§2.7](./data-audit.md#a-2-7), S§6–7: ciclo `close − engage` nos 6.711 fechados. [Lost](#g-estagios) = 36,9% dos fechados (2.473). Ciclo do Lost: mediana 14 d, média 41,5 d; do Won: mediana 57 d, média 51,8 d. Lost ≈ 32% dos dias-calendário dos fechados (aritmética sobre médias, não executada no script) | **Não verificável.** Esforço não é medido. O [proxy](#g-proxy) de calendário não confirma "tempo demais" nos Lost: eles são proporcionalmente mais curtos | Dias-calendário ≠ esforço. O tempo perdido pode estar nos 1.291 abertos [envelhecidos](#g-envelhecido), que ficam fora da conta. *Lost* é estágio, não motivo, então "tempo até Lost" pode medir cadência de registro | Não prometer "horas liberadas". Decisão: o que significa "baixa chance" no ranking. Teste [T-B](#t-b) |
| **[P-002](#p-002)** Boas oportunidades esfriam | [A§2.9](./data-audit.md#a-2-9), S§16: [AUC](#g-auc) da idade em T em 5 cortes (teste n = 893 a 1.139): 0,571; 0,499; 0,475; 0,561; 0,505. O [IC95%](#g-ic) exclui 0,5 em 2 dos 5 | **Não verificável.** Sem histórico de estágio nem atividade. Idade isolada não tem direção estável | Só entram deals que fecharam ([censura](#g-censura)). Dois regimes de ciclo (≤ 14 d e 56–112 d) podem diluir o sinal. Esfriar não é o mesmo que envelhecer | "Esfriando" só pode ser heurística de idade, sem validação. Decisão: se o MVP tem módulo de alerta ou só sinaliza idade |
| **[P-003](#p-003)** Priorização individual, sem critério compartilhado | Afirmação do briefing. Nenhuma coluna registra decisão do vendedor | **Não verificável** | O dataset tem desfecho, não decisão | Capturar as decisões na própria ferramenta para criar um [baseline](#g-baseline) |
| **[H-001](#h-001)** Falta critério compartilhado de qualificação | [A§2.6](./data-audit.md#a-2-6), S§11–12: taxa de ganho por vendedor de 55,0% a 70,4% (30 vendedores, n = 79 a 553 fechados). [Qui-quadrado](#g-qui) p = 0,264; [ε²](#g-epsilon) ajustado 0,0007; produto + vendedor R² ajustado 0,0009 | **Não verificável como formulada** (critério não é observado). O desfecho não difere entre vendedores além do acaso | Sem diferença não implica critério homogêneo. Efeitos menores que ±4 a 10 p.p. não são detectáveis. Mix de carteira não controlado | Não usar vendedor como feature nem como ranking de pessoas |
| **[H-002](#h-002)** Capacidade, e não critério, é o gargalo | [A§2.10](./data-audit.md#a-2-10) [V11](#v11), S§15: carga média de 64,5 deals abertos por vendedor. ρ de Spearman carga × ganho: −0,066 (n = 6.711), −0,065 (janela madura, n = 3.718) e **−0,007 (p = 0,67)** controlando vendedor × mês | **Não verificável** (capacidade é desconhecida). A implicação mensurável **não é sustentada**: a associação inicial era calendário | Carga sem Prospecting; atribuição de deals desconhecida; ganho só dos fechados; esfriamento não medido | Não afirmar que capacidade ou critério é o gargalo. Carga entra como diagnóstico. Decisão: se a visão de manager entra no MVP |
| **[H-003](#h-003)** Incentivos e apego mantêm deals sem chance | [A§2.10](./data-audit.md#a-2-10) [V6](#v6), S§13: 1.291 de 1.589 Engaging com mais de 138 d (81,2%, corte = maior `close_date`); 1.238 (77,9%) com corte = maior `engage_date`. Nenhum fechado passou de 138 d | **Não verificável.** Compatível com a hipótese, mas não específico | Alternativas: ciclo longo legítimo, teto de extração, atraso de registro, abandono. Não há comissão nem meta no dataset | O limiar de "revisar ou encerrar" não pode ser derivado do histórico. Teste [T-B](#t-b) e pergunta à RevOps |
| **[H-004](#h-004)** O vendedor não enxerga padrões do portfólio | [A§2.6](./data-audit.md#a-2-6), S§11: taxa de ganho por produto 60,0% a 64,8% (p = 0,372); escritório 62,6% a 63,9%; manager 62,1% a 64,4% (p = 0,786); setor 61,2% a 64,9% (p = 0,971); conta 53,1% a 75,0% (85 contas, n ≥ 30, p = 0,943) | **Contradita** (segmentos estáticos): quase não há padrão de ganho a ser "visto" | Só variáveis disponíveis; atividade pode conter sinal. O único sinal legítimo repetido é fraco: mês-do-trimestre do engage (AUC 0,506 a 0,561) | Não vender "padrões ocultos" como valor. Explicar o ranking por valor e higiene |
| **[H-005](#h-005)** Qualidade do CRM limita a decisão e a medição | [A§2.3](./data-audit.md#a-2-3)–2.5, S§3–5: `GTXPro` perde 1.480 linhas (16,8%) em inner join; `account` nula em 1.425 de 2.089 abertos (68,2%) contra 0 de 6.711 fechados; 461 linhas idênticas (todas abertas); `technolgy` e `Philipines`; 5 vendedores sem deals; 0 violações estruturais de data e valor | **Sustentada** | "Limita a decisão" é inferência: o dataset não mede o efeito da qualidade sobre o vendedor | Camada de normalização documentada. "[Não pontuável](#g-pontuavel)" como saída explícita |
| **[H-006](#h-006)** O histórico reflete a priorização passada ([viés de seleção](#g-vies)) | Nenhuma coluna de atribuição ou esforço. Indício de **outra** seleção, comprovada: sem fechamentos antes de 2017-03-01 e ciclo mínimo por mês de engage igual à distância até essa data | **Não verificável** (viés de priorização). Há seleção de extração | Não há como separar "foi ignorado" de "estava perdido" | O score descreve o passado; risco de *[feedback loop](#g-feedback)*. Sem claim causal |
| **[H-007](#h-007)** O "feeling" atual já é razoável | [A§2.9](./data-audit.md#a-2-9), S§16: nenhum baseline estático acima de AUC 0,571; [Brier](#g-brier) a ±0,003 da taxa global | **Não verificável.** O feeling não é observável. Só se vê que regras estatísticas simples sobre estes campos não superam o acaso | O teste só detecta AUC acima de ~0,55 (n ≈ 900 a 1.100). Ausência de [lift](#g-lift) não é ausência de efeito | O ganho incremental só se mede em [piloto com controle](#g-controle) |
| **[H-008](#h-008)** O valor de um deal aberto não está definido | [A§2.6](./data-audit.md#a-2-6)–2.10 [V9](#v9), S§14: `close_value` nulo em 100% dos 2.089 abertos e igual a 0 em 2.473 de 2.473 Lost. Nos Won (n = 4.238): `close_value` ÷ preço de média 0,996, dp 0,099, 95,9% dentro de ±20%, Pearson 0,9915 | **Sustentada** (valor indefinido). Proxy por preço validado **só nos Won** | [Preço de tabela](#g-preco-tabela), sem desconto nem valor anual. O valor é função do produto (sem informação extra). GTK 500: 40 deals, 25 fechados | Valor esperado = preço × P(ganho); com P próxima da [taxa-base](#g-taxa-base), o ranking por valor se reduz ao ranking por produto |

**Decisões do mapa ([HD-01](#hd-01) a [HD-08](#hd-08))**

| ID | Decisão | Classificação | Base |
| --- | --- | --- | --- |
| [HD-01](#hd-01) | Vendedor: qual deal trabalhar | **Parcialmente sustentada** | Valor em jogo é mensurável; P(ganho) não discrimina |
| [HD-02](#hd-02) | Vendedor: quando desqualificar | **Parcialmente sustentada** | Há referência de ciclo (≤ 138 d), mas a idade não previu perda de forma estável |
| [HD-03](#hd-03) | Vendedor: quando reativar | **Não verificável** | Sem atividade nem histórico de estágio |
| [HD-04](#hd-04) | Manager: onde intervir | **Parcialmente sustentada** | Visão descritiva é possível; diferenças entre vendedores são indistinguíveis do acaso |
| [HD-05](#hd-05) | Manager: qual forecast comprometer | **Não verificável** | Sem forecasts históricos; taxa-base instável por mês |
| [HD-06](#hd-06) | Direção: metas e capacidade | **Não verificável** | Sem metas nem capacidade |
| [HD-07](#hd-07) | RevOps: baseline e retorno | **Parcialmente sustentada** | [Win rate](#g-win-rate), ciclo e ticket derivam do dataset; custo e margem não |
| [HD-08](#hd-08) | Analista de CRM: campos e regras de estágio | **Sustentada** | Completude, chaves e datas foram medidas |

<a id="sub-3-3"></a>
### 3.3. Campo/sinal → Disponível no momento da decisão? → Qualidade → Pode entrar no ranking?

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Sinais [S1](#s1) a [S22](#s22) | [Etapa 2, 2.2](#sub-2-2) | Coluna "previsto" da comparação com o medido |
| [Vazamento](#g-vazamento) e `close_*` ([D7](#d7), [S13](#s13)) | [Etapa 2, 2.1.2](#sub-2-1-2) e [2.2](#sub-2-2) | Base da lista de campos proibidos |
| Matriz de disponibilidade e vazamento medidos | [data-audit.md, 2.7 e 2.8](./data-audit.md#a-2-7) | Fonte da coluna "disponível no momento da decisão" |


Momento da decisão: segunda-feira, o vendedor olha os deals abertos. **P** = [Prospecting](#g-estagios), **E** = Engaging.

| Campo / sinal | Disponível no momento da decisão? | Qualidade | Pode entrar no ranking? |
| --- | --- | --- | --- |
| `deal_stage` | P e E: sim | Alta (0 nulos). O rótulo só existe nos fechados | **Como filtro ou segmento**, não como preditor (efeito não testável) |
| `product` (normalizado) | P e E: sim | Boa **depois** de corrigir `GTXPro` (16,8% das linhas) | **Sim, via preço** (valor). Sem sinal de ganho: 60% a 65% (p = 0,37) |
| `sales_price` | P e E: sim | Alta. [Proxy](#g-proxy) do valor validado nos Won (±20% em 95,9%) | **Sim, como valor em jogo**, não como chance |
| `sales_agent` | P e E: sim | Alta (30 vendedores, 0 nulos) | **Não** como feature: sem sinal (p = 0,26). Só filtro ou agrupamento |
| `manager`, `regional_office` | P e E: sim | Foto atual, sem histórico | **Não** (sem sinal). Filtro |
| `account` | P: 32,6%; E: 31,5% | Boa quando presente (85 contas, 0 órfãs). Treino 100% contra inferência ~32% | **Não** por ora: sem sinal (p = 0,94) e descompasso entre treino e inferência |
| Atributos da conta (setor, receita, funcionários, país) | Só se houver conta | Foto atual; rótulos com grafia errada | **Não** por ora: sem sinal (setor p = 0,97) |
| `engage_date` → idade | E: sim; **P: não (0%)** | Sem inversões; depende da data de corte; 81% [fora do suporte](#g-suporte) | **Condicional**, como flag de revisão e não como peso. [AUC](#g-auc) instável (0,475 a 0,571) |
| Mês-do-trimestre do engage | E: sim | Derivado de data válida | **Candidato fraco** (AUC 0,506 a 0,561; [ε²](#g-epsilon) 0,7%). Exige confirmação; pode ser artefato |
| Carga do vendedor (derivada) | E: sim (reconstruída) | Aproximada; exclui Prospecting | **Não** como feature (o efeito some). Diagnóstico |
| Histórico da conta (deals anteriores) | Parcial (só com conta) | A auto-junção multiplica as linhas por 96,6 | **Não testado diretamente.** A identidade da conta não tem sinal; exige corte temporal |
| `close_date`, mês de fechamento | **Não** | — | **Não: vazamento** (AUC 0,644 no 3º mês do trimestre) |
| `close_value`, `cycle_days` | **Não** | — | **Não: vazamento** (é o rótulo; ciclo = `close − engage`) |
| `opportunity_id`, posição da linha | n/a | Arquivo ordenado por `engage_date` | **Não**: artefato |
| Atividade, último contato, motivo de perda | **Ausente** | — | Não existe |

<a id="sub-3-4"></a>
### 3.4. KPI → Calculável agora? → Fonte → Condição para medir impacto futuro

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Indicadores candidatos ([O1](#o1) a [O5](#o5)) | [Etapa 1, 1.4](#sub-1-4) | São os KPIs avaliados quanto a serem calculáveis |
| KPI principal e KPIs de apoio | [Etapa 2, 2.4](#sub-2-4) | Últimas linhas da tabela |
| Mecanismos [M1](#m1) a [M9](#m9) | [Etapa 2, 2.3](#sub-2-3) | Definem quais dados cada KPI exige |
| [Baseline](#g-baseline) derivável | [data-audit.md, 2.6 e 2.7](./data-audit.md#a-2-6) | Fonte de [win rate](#g-win-rate), ticket e ciclo |


Os objetivos [O1](#o1) a [O5](#o5) coincidem com os "Indicadores candidatos" da seção 1.4. O KPI principal proposto na seção 2.4 é tratado aqui como KPI de validação.

| KPI | Calculável agora? | Fonte (valor medido) | Condição para medir impacto futuro |
| --- | --- | --- | --- |
| **<a id="o1">O1</a>** % do esforço em deals que terminam [Lost](#g-estagios) | **Não.** Só [proxy](#g-proxy): Lost = 36,9% dos fechados; ≈ 32% dos dias-calendário | `deal_stage` e datas | Log de atividade e horas; definição formal de "baixa chance"; baseline congelado; [grupo de controle](#g-controle) |
| [O1](#o1) apoio: tempo até desqualificação dos Lost | Parcial: média 41,5 d, mediana 14 d | `close − engage` nos Lost | Só mede cadência de registro; é preciso saber se o encerramento foi decisão |
| [O1](#o1) apoio: Engaging parados há mais de X dias | Parcial: 1.291 acima de 138 d | `engage_date` e corte assumido | Definir X e a data de corte reais |
| [O1](#o1) apoio: % de perdas identificadas cedo | **Não** | — | Alertas emitidos e data de encerramento (só com a ferramenta em operação) |
| **<a id="o2">O2</a>** Win rate dos deals de alto potencial | **Parcial.** Exige definição **independente do score**; por faixa de preço o win rate é ~plano (60% a 65%) | Preço × `deal_stage` | "Alto potencial" fixado antes e fora do score (senão é circular); ação registrada; controle |
| [O2](#o2) apoio: dias sem avanço, tempo até a 1ª ação, % sem ação em X dias | **Não** | — | Log de atividade e histórico de estágio |
| **<a id="o3">O3</a>** Receita fechada por vendedor e período | **Sim, descritivo** (Won soma 10.005.534, de mar a dez/2017). Não calculado por vendedor no script | `close_value`, `sales_agent`, `close_date` | Coortes de mesma maturidade; controle de território, mix e sazonalidade (48,6% a 82,8% por mês); vários trimestres |
| [O3](#o3) apoio: win rate, [ticket médio](#g-ticket), ciclo | **Sim**: 63,15% (fechados; faixa 48,2% a 71,9%), ticket Won 2.360,9 (mediana 1.117), ciclo 51,8 d (Won) | S§6–8 | Mesma definição e janela madura; o ciclo é viesado para rápidos (máximo de 138 d) |
| **<a id="o4">O4</a>** % de vendedores que usam a priorização por semana | **Não** | Instrumentação da ferramenta | Logs de uso e de ação, sobre vendedores ativos (30 com deals, não 35) |
| [O4](#o4) apoio: decisões alinhadas, confiança, tempo para decidir | **Não** | Survey e logs | Baseline do comportamento atual capturado antes |
| **<a id="o5">O5</a>** Erro de forecast (MAPE) | **Não** | Não há forecasts históricos | Guardar forecasts comprometidos; hoje só existe [backtest](#g-backtest) reconstruído |
| [O5](#o5) apoio: calibragem | **Parcial**: [Brier](#g-brier) de 0,208 a 0,243, próximo da taxa global | Backtest S§16 | Score com poder discriminativo; [calibração](#g-calibracao) por segmento e janela |
| [O5](#o5) apoio: slippage, cobertura do pipeline | **Não** | Uma única `close_date`; sem metas | Histórico de data prevista e metas |
| KPI da §2.4: Δ win rate ponderado por valor no top-K | **Calculável em backtest, mas enganoso:** ordenar por preço eleva o valor capturado por construção | Preço × desfecho | Separar *[skill](#g-skill-valor)* (discriminar P) de *valor* (escolher o caro); piloto com controle |
| KPI da §2.4: valor aberto acima do P90 do ciclo | **Sim**: 1.432 Engaging (90,1%) acima do P90 do próprio produto; 3,2 mi de 3,9 mi em [preço de tabela](#g-preco-tabela) acima de 138 d | `engage_date` e ciclo dos Won por produto | Data de corte real; confirmar que idade alta indica risco |

O dataset não informa a moeda dos preços de tabela; os valores acima estão em unidades do próprio campo.

> **Nota da consolidação.** A linha "KPI da §2.4" acima chama de "enganoso" a versão de valor capturado. A versão em razão não infla, mas fica quase plana. São propriedades do KPI, tratadas como requisito de projeto em [AR-12](#ar-12). Detalhe em [2.4](#sub-2-4).


<a id="sub-3-5"></a>
### 3.5. Três conclusões atraentes e injustificadas

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Idade e ciclo ([D9](#d9), [V6](#v6)) | [Etapa 2, 2.1.2](#sub-2-1-2) e [2.5](#sub-2-5) | Base da primeira conclusão atraente |
| [Vazamento](#g-vazamento) por data de fechamento ([S13](#s13)) | [Etapa 2, 2.2](#sub-2-2) e [data-audit.md, 2.8](./data-audit.md#a-2-8) | Base da segunda |
| Hipóteses classificadas | [Etapa 3, 3.2](#sub-3-2) | Mostram o que não foi provado |


1. **"81% do pipeline [Engaging](#g-estagios) está parado: limpar ou reativar libera 3,2 mi."**
   - O que há: idade acima do maior ciclo fechado, em [preço de tabela](#g-preco-tabela).
   - O que falta: sinal de abandono, de atividade ou de perda. O teto de 138 d pode ser artefato de extração.
   - E mais: o valor é preço de tabela, não receita.
2. **"Achamos o padrão: negócios fecham melhor no fim do trimestre ([AUC](#g-auc) 0,64); priorizem esse timing."**
   - É vazamento: o mês de fechamento só existe depois do desfecho.
   - É associação, e a causa (empurrão de trimestre, regra de registro, artefato do dataset) é hipótese.
   - Como entrada do score significa usar o futuro. Como insight de calendário, só vale com intervenção testada.
3. **"Os dados provam que priorizar por valor ou regra melhora a receita" ou "o vendedor X é melhor que o Y".**
   - Ordenar por preço aumenta o valor no top-K de forma mecânica; não prova que a atenção mude o desfecho.
   - A faixa de 55% a 70% entre vendedores é indistinguível do acaso.
   - Resultado histórico não é impacto comprovado da ferramenta.

<a id="sub-3-6"></a>
### 3.6. Três decisões que a auditoria já permite tomar

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Classificação das hipóteses e das decisões | [Etapa 3, 3.2](#sub-3-2) | Fundamentam cada decisão |
| Campos que podem ou não entrar | [Etapa 3, 3.3](#sub-3-3) | Base do que o ranking pode usar |
| KPIs calculáveis | [Etapa 3, 3.4](#sub-3-4) | Base do critério de aceite da validação |


1. **Rebaixar a promessa do produto.** O MVP não promete "probabilidade de ganho [calibrada](#g-calibracao)". Ele ordena por valor em jogo e sinaliza higiene (idade, conta ausente), exibindo a [taxa-base](#g-taxa-base) (~63%) como referência explícita.
2. **Fixar o critério de aceite da validação.** [Backtest](#g-backtest) temporal com vários cortes e janela madura; features congeladas na data da decisão; lista de proibidas (`close_*`, ciclo, mês de fechamento, ordem do arquivo); [baselines](#g-baseline) obrigatórios (taxa global e por produto); métrica que separe *[skill](#g-skill-valor)* de *valor*.
3. **Tratar "[não pontuável](#g-pontuavel)" e "[fora do suporte](#g-suporte)" como saída de primeira classe.** [Prospecting](#g-estagios) sem data (500), conta nula (68% dos abertos), idade acima de 138 d (81% dos Engaging). Levar à RevOps, antes da interface, as perguntas que bloqueiam: quando a conta é preenchida, o que explica os abertos acima de 138 d e se *Lost* é decisão do vendedor ou encerramento em lote.

<a id="sub-3-7"></a>
### 3.7. Perguntas sem resposta e premissas a documentar

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Perguntas-chave não respondidas | [Etapa 1, 1.5](#sub-1-5) | Reaparecem aqui, agora com a resposta dos dados |
| Conhecimento específico da empresa | [Etapa 2, 2.7](#sub-2-7) | Parte do que os dados não respondem |
| Hipóteses "não verificável" | [Etapa 3, 3.2](#sub-3-2) | Origem da lista |


**Perguntas que o dataset não permite responder**

1. Quanto esforço o vendedor gasta em cada deal.
2. O que é "esfriar" e se os bons deals esfriam.
3. Como o vendedor prioriza hoje ([baseline](#g-baseline) humano).
4. Qual é a capacidade por vendedor.
5. Se *[Lost](#g-estagios)* resulta de decisão do vendedor ou de encerramento automático ou em lote.
6. Quando o campo `account` é preenchido.
7. Por que 1.291 Engaging passam de 138 d.
8. Qual foi a regra e a data de extração.
9. Se existem forecasts históricos.
10. Margem, custo-hora, metas e incentivos.
11. Se o dataset representa a empresa real (os padrões são compatíveis com dado sintético, o que é hipótese).

**Premissas a registrar**

| Premissa | Fonte | Efeito se estiver errada |
| --- | --- | --- |
| Data de corte = 2017-12-31 | Escolha da auditoria | Muda a idade dos abertos (81,2% passa a 77,9% com outro corte) |
| `GTXPro` = `GTX Pro` | Evidência de preço (razão 1,0015) | Perda de 16,8% das linhas |
| Alvo: Won = 1, Lost = 0, abertos sem rótulo | README (*Lost* = estágio) | Viés se os abertos forem tratados como negativos |
| [Preço de tabela](#g-preco-tabela) = [proxy](#g-proxy) de valor | Validado só nos Won | Ranking por valor distorcido |
| A taxa de 63,15% é só dos fechados | Contagem | A faixa real vai de 48,2% a 71,9% |
| Manager e escritório são foto atual | Estrutura da tabela | Atribuição histórica incorreta |
| As 461 linhas idênticas são mantidas, sem deduplicar | Decisão da auditoria | Super ou subcontagem de Prospecting |
| Dias-calendário como proxy de tempo | Datas | Não é esforço |

<a id="sub-3-8"></a>
### 3.8. Testes adicionais decisivos

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Limites da própria auditoria | [Etapa 3, 3.1](#sub-3-1) | Os testes [T-A](#t-a) e [T-B](#t-b) atacam dois deles |
| Hipóteses [P-001](#p-001), [H-003](#h-003) e [H-006](#h-006) | [Etapa 3, 3.2](#sub-3-2) | São as que mais dependem do resultado |
| Testes [V4](#v4) a [V6](#v6) e [V14](#v14) | [Etapa 2, 2.5](#sub-2-5) | Os novos testes refinam o que eles mediram |


Baratos, sem nova auditoria completa. Ainda **não executados**.

| # | Teste | Por que decide |
| --- | --- | --- |
| **<a id="t-a">T-A</a>** | Taxa de ganho em **coorte madura** (engajados entre 2017-03-01 e 2017-08-15), com e sem abertos como limite | Dá um [baseline](#g-baseline) menos censurado para [O3](#o3) e [HD-07](#hd-07) |
| **<a id="t-b">T-B</a>** | Em cortes mensais, **parcela dos abertos em T com idade acima do maior ciclo fechado até T** | Se for constante, o padrão é estrutural; se crescer, é acúmulo. Muda a leitura de [H-003](#h-003) e de "[envelhecido](#g-envelhecido)" |

> **Nota da consolidação (15/10/2026).** [T-A](#t-a) e [T-B](#t-b) não foram executados no discovery. A incerteza que cada um reduziria já está delimitada por faixas medidas e é tratada como requisito de projeto em [4.5](#sub-4-5). Os testes só valeriam se a Arquitetura escolher exibir um número único ([T-A](#t-a)) ou um limiar absoluto de idade ([T-B](#t-b)).


<a id="sub-3-9"></a>
### 3.9. Resumo executivo e decisões para a arquitetura

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Hipóteses, campos e KPIs avaliados | [Etapa 3, 3.2](#sub-3-2), [3.3](#sub-3-3) e [3.4](#sub-3-4) | Resumidos nos 10 pontos abaixo |
| Decisões já possíveis | [Etapa 3, 3.6](#sub-3-6) | Viram as decisões para a arquitetura |
| Perguntas sem resposta e premissas | [Etapa 3, 3.7](#sub-3-7) | Limitam o que se pode prometer |


**Resumo executivo**

1. A estrutura dos dados é sólida; os joins não multiplicam linhas, mas `GTXPro` e a conta nula (68% dos abertos) exigem tratamento.
2. O desfecho é conhecido para 6.711 deals (63,15% [Won](#g-estagios)); 2.089 estão abertos e sem rótulo.
3. Com os campos disponíveis, quase não há sinal legítimo de ganho: [AUC](#g-auc) de 0,47 a 0,57, instável entre cortes. O único sinal forte (mês de fechamento) é [vazamento](#g-vazamento).
4. Vendedor, produto, setor e escritório não distinguem resultado além do acaso; a carga não explica o resultado após controle de calendário.
5. O valor de um deal aberto é estimável por [preço de tabela](#g-preco-tabela) (±20% em 95,9% dos Won), mas é função do produto.
6. 81% dos Engaging estão fora do ciclo já observado: não sabemos se são abandonados ou legítimos.
7. Esforço, esfriamento, [baseline](#g-baseline) humano, capacidade e custo não são mensuráveis com este dataset.
8. Dos KPIs, só os descritivos são calculáveis agora; impacto exige operação instrumentada e [grupo de controle](#g-controle).
9. Os dados sustentam uma priorização por valor e higiene, não uma estimativa de probabilidade.
10. Nada aqui comprova efeito da ferramenta.

**Três decisões que a próxima etapa de arquitetura deve resolver**

1. **O que o ranking significa e como expressa incerteza.** Regra transparente por valor mais flags, ou estimativa de P(ganho)? E como mostrar "[taxa-base](#g-taxa-base), sem discriminação" sem induzir falsa precisão.
2. **Como representar o estado do deal na data da decisão.** Treino por *[snapshot](#g-snapshot)* de idade; tratamento de conta nula (68%) e de deals [fora do suporte](#g-suporte) (> 138 d); a saída "[não pontuável](#g-pontuavel)".
3. **Como o impacto será medido.** O que a ferramenta registra (visualização, ação, decisão), como congelar o baseline e que desenho de controle viabiliza [O1](#o1) a [O5](#o5), já que nenhum desses KPIs é mensurável só com o histórico.

**Ponte para a Etapa 4.** A Etapa 3 mediu o que os dados permitem e deixou duas decisões prontas, uma lista do que não é verificável e dois testes não executados ([T-A](#t-a) e [T-B](#t-b)). Falta transformar isso em respostas às oito perguntas do discovery, em uma definição do que significa prioridade e em um handoff que a Arquitetura possa usar. É o que a [Etapa 4](#etapa-4) faz.

---

<a id="etapa-4"></a>
## 4. Discovery Conclusions

_Status: Concluído em 15/10/2026_

[↑ Voltar ao índice](#indice)

> **Em linguagem simples**
>
> **O que esta etapa responde:** o que o discovery conseguiu responder, com que grau de confiança, e o que a próxima fase (Estratégia de Solução e Arquitetura) recebe.
>
> **O que fizemos:** reunimos as Etapas 1 a 3 em oito respostas, em uma definição do que significa "prioridade" para o vendedor e em um pacote de entrega (handoff).
>
> **O que encontramos:** o discovery responde às 8 perguntas. A evidência é forte sobre **o que são os dados e o que eles permitem**, e mais fraca sobre **o problema** (é percepção da liderança) e sobre **o impacto** (só se mede em piloto). Essas fragilidades não são pendências do discovery: são informação para a Arquitetura projetar a solução para lidar com elas. As **regras de scoring ficam para a Arquitetura**.
>
> **O que passa para a próxima fase:** o [Discovery Handoff](#sub-4-4) e as [questões abertas](#sub-4-5).

> **Fonte dos números.** Os números desta etapa vêm de [data-audit.md](./data-audit.md) e do [script](../solution/scripts/audit_data.py), exceto os marcados com **(consulta direta)**, que são contagens simples sobre `sales_pipeline.csv` feitas na consolidação, fora do script.

<a id="sub-4-1"></a>
### 4.1. As 8 perguntas do discovery

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Problema, stakeholders e hipóteses | [Etapa 1](#etapa-1) | Perguntas 1 e 2 |
| Sinais, valor, KPIs e plano de validação | [Etapa 2](#etapa-2) | Perguntas 3, 5 e 7 |
| Evidência dos dados e classificação das hipóteses | [Etapa 3](#etapa-3) | Perguntas 4, 5, 6, 7 e 8 |


**Como ler a tabela.** *Respondida?* diz se o discovery produziu a conclusão que a pergunta exige. *Confiança* diz quão firme é a evidência por trás da resposta. Uma resposta pode estar completa e ter confiança baixa: isso é informação que a Arquitetura usa para projetar a solução, e não uma pendência do discovery. A última coluna lista o limite que vira requisito de projeto.

| # | Pergunta | O que o discovery responde | Respondida? | Confiança na evidência | Onde está | O que a Arquitetura deve tratar |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Qual problema estamos resolvendo? | Não há critério **explícito, compartilhado e visível** para decidir onde aplicar a atenção em um pipeline de 2.089 oportunidades abertas. A liderança percebe esforço em deals que não fecham e bons deals esfriando (sintomas [P-001](#p-001), [P-002](#p-002) e [P-003](#p-003)). Causas candidatas: [H-001](#h-001) (critério), [H-002](#h-002) (capacidade) e [H-003](#h-003) (incentivos); nenhuma confirmada. | ✅ | Baixa quanto à existência do problema (é percepção); alta quanto à formulação | [1.1](#sub-1-1), [1.3](#sub-1-3), [3.2](#sub-3-2), [4.4.1](#sub-4-4-1) | Esforço e esfriamento não são mensuráveis aqui. A solução deve registrar eventos para que passem a ser ([AR-08](#ar-08)). |
| 2 | Quem utilizará a solução e para decidir o quê? | **Vendedor**, para decidir **qual oportunidade trabalhar na segunda-feira** ([HD-01](#hd-01)). Secundária: revisar ou encerrar ([HD-02](#hd-02), suporte parcial). Manager: visão descritiva, sem ranking de pessoas ([HD-04](#hd-04)). Reativar ([HD-03](#hd-03)), forecast ([HD-05](#hd-05)) e metas ([HD-06](#hd-06)) não são sustentados pelos dados. | ✅ | Média: decisão tomada em 15/10/2026; os dados sustentam [HD-01](#hd-01) e [HD-02](#hd-02) só em parte | [1.2](#sub-1-2), [2.2](#sub-2-2), [2.6](#sub-2-6), [3.2](#sub-3-2), [4.4.2](#sub-4-4-2) | Só 27 dos 35 vendedores têm oportunidades abertas **(consulta direta)**. Visão de manager é descritiva ([AR-09](#ar-09)). |
| 3 | O que significa uma oportunidade prioritária? | Prioridade é **onde a atenção do vendedor tem maior valor em jogo**, entre as oportunidades dentro do ciclo observado, com sinalização à parte das que pedem revisão e das que não são [pontuáveis](#g-pontuavel). A chance de fechar **não discrimina** com os campos atuais ([taxa-base](#g-taxa-base) de 63,15%). | ✅ Conceito e critérios candidatos | Média: o valor é sustentado; o risco de esfriar é heurística | [1.5](#sub-1-5), [2.2](#sub-2-2), [3.2](#sub-3-2), [4.2](#sub-4-2) | As regras de scoring são decisão da Arquitetura ([AR-01](#ar-01), [AR-02](#ar-02)). |
| 4 | Quais informações realmente temos? | 4 tabelas ligadas por chaves únicas (8.800 oportunidades, 85 contas, 7 produtos, 35 vendedores). Estrutura sólida, com 3 armadilhas: `GTXPro` (16,8% das linhas), conta nula em 68% dos abertos e 461 linhas indistinguíveis. Resultado conhecido em 6.711 oportunidades. | ✅ | Alta | [3.1](#sub-3-1), [4.4.5](#sub-4-4-5), [`A§2.1`](./data-audit.md#a-2-1) a [`A§2.6`](./data-audit.md#a-2-6) | Camada de normalização, estados "não pontuável" e data de corte parametrizável ([AR-05](#ar-05), [AR-07](#ar-07)). |
| 5 | Quais sinais podemos usar legitimamente? | Válidos: estágio (filtro), produto e preço (valor), idade em [Engaging](#g-estagios) (flag) e completude. Proibidos: `close_date`, `close_value`, ciclo e mês de fechamento ([vazamento](#g-vazamento)). Vendedor, conta, setor e escritório não têm sinal. | ✅ | Alta | [3.3](#sub-3-3), [4.4.6](#sub-4-4-6), [`A§2.7`](./data-audit.md#a-2-7), [`A§2.8`](./data-audit.md#a-2-8) | Lista de proibidas com teste automático. O histórico da conta ([S6](#s6)) não foi testado e só entraria com corte temporal. |
| 6 | O que os dados permitem comprovar ou prever? | **Sustentadas:** qualidade do CRM ([H-005](#h-005)) e valor estimável por preço ([H-008](#h-008)). **Contradita:** padrões estáticos de ganho ([H-004](#h-004)). **Não sustentada:** capacidade ([H-002](#h-002)). **Não verificáveis:** esforço, esfriamento, [baseline](#g-baseline) humano. **Previsão de ganho por deal:** sem [lift](#g-lift) utilizável ([AUC](#g-auc) 0,47 a 0,57). Consequência: regra transparente; modelo supervisionado não se justifica com estes campos. | ✅ | Média: alta para o que foi medido; o teste só detecta AUC acima de ~0,55 | [3.2](#sub-3-2), [4.3](#sub-4-3), [4.4.7](#sub-4-4-7), [`A§2.9`](./data-audit.md#a-2-9) | Motor sem probabilidade por deal, com ponto de extensão para sinais futuros ([AR-11](#ar-11)). |
| 7 | Como saberemos se a solução funciona? | KPI principal candidato: Δ [win rate](#g-win-rate) ponderado por valor ([2.4](#sub-2-4)), **mantido**. Apoio: adoção, qualidade do score e valor aberto acima do P90 do ciclo. Hoje só são calculáveis os KPIs descritivos (baseline de 63,15%). O impacto exige [piloto com controle](#g-controle). | ✅ | Média: KPIs e critérios definidos; o impacto só se mede em piloto | [1.4](#sub-1-4), [2.4](#sub-2-4), [3.4](#sub-3-4), [4.4.8](#sub-4-4-8), [4.4.9](#sub-4-4-9) | Escolher a leitura do KPI principal e instrumentar eventos ([AR-08](#ar-08), [AR-12](#ar-12)). |
| 8 | Quais restrições e incertezas permanecem? | Retrato único, [truncamento](#g-truncamento) à esquerda, taxa de ganho instável no calendário, "Lost" sem definição, sem baseline humano, sem custo-hora nem margem, dado possivelmente sintético. Premissas e itens a pedir à empresa estão listados. | ✅ | Alta | [3.1](#sub-3-1), [3.7](#sub-3-7), [4.4.10](#sub-4-4-10), [4.5](#sub-4-5), [data-audit, seção 6](./data-audit.md#a-6) | Taxa-base como faixa e flag de idade robusta aos dois cenários ([AR-03](#ar-03), [AR-04](#ar-04)). O prazo de 4 a 6 h define o escopo. |

**Nota 1 (consulta direta).** Em `sales_pipeline.csv`, 27 vendedores têm ao menos uma oportunidade aberta, com mediana de 79 abertas por vendedor e máximo de 194. O data-audit informa 30 vendedores com histórico e mediana de 72 abertas, contando os que têm zero ([`A§2.6`](./data-audit.md#a-2-6)).

<a id="sub-4-2"></a>
### 4.2. O que é prioridade e como priorizar

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Pergunta "o que significa prioridade?" | [Etapa 1, 1.5](#sub-1-5) | É a pergunta que esta subetapa fecha em nível conceitual |
| Sinais candidatos por decisão ([S1](#s1) a [S22](#s22)) | [Etapa 2, 2.2](#sub-2-2) | Origem dos componentes de prioridade |
| Valor de um deal aberto ([H-008](#h-008)) e padrões de ganho ([H-004](#h-004)) | [Etapa 3, 3.2](#sub-3-2) | Mostram o que cada componente sustenta |
| Viabilidade de regras e modelos | [data-audit.md, 2.9](./data-audit.md#a-2-9) | Mostra o que supera a [taxa-base](#g-taxa-base) |


**Para o vendedor, prioridade tem quatro componentes. Só um é quantificável com respaldo:**

| Componente | O que significa para o vendedor | Respaldo nos dados | Status |
| --- | --- | --- | --- |
| **Valor em jogo** | Quanto vale se fechar | [Preço de tabela](#g-preco-tabela) ≈ valor fechado (±20% em 95,9% dos [Won](#g-estagios), [H-008](#h-008)). **É função só do produto: 7 níveis.** | ✅ Sustentado |
| **Chance de fechar** | Quão provável é fechar | [AUC](#g-auc) de 0,47 a 0,57. Produto, vendedor, setor, conta e escritório são indistinguíveis do acaso. Só existe a taxa-base de 63,15% (faixa de 48,2% a 71,9% com os abertos). | ❌ Não discrimina por deal |
| **Risco de esfriar** | Se eu não olhar agora, perco? | Só a idade desde `engage_date`, e só em Engaging. AUC instável (0,475 a 0,571). Sem atividade nem histórico de estágio. | 🟡 Heurística não validada |
| **Pontuabilidade** | Posso confiar no registro? | Conta nula em 68% dos abertos; Prospecting sem nenhuma data. | ✅ Mensurável |

**Consequência central.** Com a chance de fechar praticamente constante, valor esperado = preço × ~0,63. Isso é **monotônico no preço**: o ranking por valor esperado reduz-se a um ranking por produto, com empates massivos. Dentro do mesmo produto, a diferenciação só poderia vir de idade e de higiene de cadastro, e nenhum dos dois tem poder preditivo demonstrado.

**Possibilidades de priorização, com a viabilidade dada pelos dados:**

| Abordagem | Viável com estes dados? | Observação |
| --- | --- | --- |
| A. Regra transparente: valor em jogo + flags de idade e de cadastro | ✅ Sim | Pesos seriam **política**, não aprendidos. O efeito sobre o resultado não é verificável aqui. |
| B. Modelo supervisionado de probabilidade de ganho | ❌ Sem [lift](#g-lift) demonstrado | Pareceria rigoroso e entregaria a taxa-base. |
| C. Híbrido: regra + taxa-base exibida como referência | ✅ Sim | A taxa-base é contexto, não score. |
| D. Valor esperado ÷ idade, ganho marginal por atenção | ❓ Não testado | O ganho marginal exige o efeito causal da atenção, que é inobservável. O replay de políticas ([V13](#v13)) não foi executado. |

**O que fica decidido no discovery e o que fica para a Arquitetura:**

| Decidido aqui | Fica para a Arquitetura |
| --- | --- |
| Usuário central: vendedor. Decisão central: qual deal trabalhar na segunda-feira. | **Regras de scoring:** pesos, faixas ou tiers e desempate ([AR-01](#ar-01)) |
| Prioridade é composta por valor em jogo, risco de esfriar e pontuabilidade; probabilidade de ganho por deal **não** é sustentada. | Como reconciliar "scoring não é só ordenar por valor" (README do challenge) com o fato de que só o valor é sustentado ([AR-02](#ar-02)) |
| Restrições que os dados impõem (ver [4.3](#sub-4-3)). | Uma fila ou duas, e como expressar a incerteza ([AR-03](#ar-03) e [AR-04](#ar-04)) |

<a id="sub-4-3"></a>
### 4.3. Descoberta nos dados → consequência arquitetural

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Hipóteses classificadas | [Etapa 3, 3.2](#sub-3-2) | Cada linha parte de uma delas |
| Campos que podem ou não entrar | [Etapa 3, 3.3](#sub-3-3) | Origem das restrições de features |
| "O que isso muda na solução" | [data-audit.md, seção 5](./data-audit.md#a-5) | Versão original das restrições, aqui reorganizadas |


Cada linha é uma **restrição que a arquitetura precisa respeitar**, não uma decisão de desenho.

| # | Descoberta (medida) | Consequência arquitetural |
| --- | --- | --- |
| 1 | Nenhum sinal legítimo supera o acaso ([AUC](#g-auc) de 0,47 a 0,57; [Brier](#g-brier) a ±0,003 da taxa global) | O motor não pode ser um modelo supervisionado de probabilidade. A [taxa-base](#g-taxa-base) aparece só como referência, nunca por deal. Deixar ponto de extensão para um modelo futuro. |
| 2 | O maior sinal do dataset (mês de fechamento, AUC 0,644) é **[vazamento](#g-vazamento)** | Contrato de features com lista de proibidas (`close_*`, ciclo, mês de fechamento, posição no arquivo) e teste automático de vazamento. |
| 3 | O valor tem 7 níveis (função do produto) | Empates massivos. Um score contínuo daria falsa precisão: preferir faixas ou tiers e critério de desempate explícito ([AR-01](#ar-01)). |
| 4 | Conta nula em 68% dos abertos e em 0% dos fechados | Conta fora do score. "Dados incompletos" é um estado de saída de primeira classe. |
| 5 | [Prospecting](#g-estagios) (500) não tem nenhuma data | Tratamento próprio: só valor e quantidade; idade não se calcula ([AR-06](#ar-06)). |
| 6 | 1.291 de 1.589 Engaging (81,2%) estão acima do maior ciclo fechado; só **298** estão dentro do suporte | Uma flag que dispara em 81% deixa de priorizar. Separar "trabalhar" de "revisar" ou ranquear dentro do grupo. Como não se sabe se é estrutural ou acúmulo ([T-B](#t-b)), projetar para os dois cenários ([AR-03](#ar-03)). |
| 7 | Taxa de ganho oscila de 48,6% a 82,8% por mês; [truncamento](#g-truncamento) à esquerda | Validação em vários cortes e janela madura. Taxa-base com intervalo, nunca ponto único ([AR-04](#ar-04)). |
| 8 | Não há atividade nem histórico de estágio | "Esfriamento" e "reativar" ([HD-03](#hd-03)) ficam fora. Instrumentar a ferramenta para registrar visualização e ação ([AR-08](#ar-08), [AR-11](#ar-11)). |
| 9 | Não há [baseline](#g-baseline) humano, controle nem forecasts históricos | Registro de eventos desde o primeiro dia e baseline congelado. Sem isso, os KPIs de negócio não são mensuráveis ([AR-08](#ar-08)). |
| 10 | Vendedor, manager e escritório sem sinal (p = 0,26; [ε²](#g-epsilon) = 0,0007) | Só filtro e escopo, nunca feature. A visão de manager é descritiva, sem ranking de pessoas ([AR-09](#ar-09)). |
| 11 | `GTXPro` derruba 16,8% das linhas em silêncio; rótulos `technolgy` e `Philipines`; 461 linhas indistinguíveis | Camada de normalização versionada, com contagem de linhas antes e depois de cada junção. |
| 12 | Não há data de extração (corte assumido em 2017-12-31); manager e escritório são foto atual | "Hoje" deve ser **parâmetro** do sistema ([AR-07](#ar-07)). |
| 13 | Padrões compatíveis com dado sintético (28,4% de fechamentos em fim de semana) | Declarar a limitação: é prova de conceito e não generaliza para a empresa real. |

<a id="sub-4-4"></a>
### 4.4. Discovery Handoff

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Perguntas respondidas | [Etapa 4, 4.1](#sub-4-1) | O handoff organiza as respostas em itens de entrada para a Arquitetura |
| Definição de prioridade | [Etapa 4, 4.2](#sub-4-2) | Itens 4.4.3 e 4.4.4 |
| Restrições de dados | [Etapa 4, 4.3](#sub-4-3) | Itens 4.4.5 a 4.4.7 e 4.4.10 |


Este é o pacote de entrada da etapa de **Estratégia de Solução e Arquitetura**. Ele diz o que é fato, o que é hipótese e o que está em aberto.

<a id="sub-4-4-1"></a>
#### 4.4.1. Problema priorizado

Não há critério **explícito, compartilhado e visível** para decidir onde aplicar a atenção em um pipeline de 2.089 oportunidades abertas (1.589 [Engaging](#g-estagios) e 500 Prospecting). A leitura da liderança é que isso desperdiça esforço em deals que não fecham e deixa bons deals esfriarem.

- **Estatuto:** percepção da Head de RevOps. Os dois sintomas não são mensuráveis neste dataset (sem esforço, sem atividade).
- **Causas candidatas, nenhuma confirmada:** critério ([H-001](#h-001)), capacidade ([H-002](#h-002), não sustentada) e incentivos ([H-003](#h-003)).
- **Risco declarado:** a solução veio pré-definida no briefing antes de provar que priorizar é o gargalo.

<a id="sub-4-4-2"></a>
#### 4.4.2. Usuário e decisão central

- **Usuário primário:** vendedor.
- **Decisão central ([HD-01](#hd-01)):** "qual oportunidade abro e trabalho primeiro na segunda-feira?"
- **Decisão secundária ([HD-02](#hd-02)):** "qual oportunidade devo revisar ou encerrar?" Suporte parcial, só por idade.
- **Fora do núcleo:** manager (visão descritiva, sem ranking de pessoas), reativação ([HD-03](#hd-03)), forecast ([HD-05](#hd-05)) e metas ([HD-06](#hd-06)).
- **Escala de uso:** 27 vendedores com carteira aberta, mediana de 79 oportunidades abertas e máximo de 194 **(consulta direta)**.

<a id="sub-4-4-3"></a>
#### 4.4.3. Resultado de negócio desejado

Concentrar o esforço nas oportunidades de maior valor em jogo, evitar que oportunidades envelhecidas consumam atenção sem revisão e fazer o vendedor **entender e usar** a priorização. Adoção é resultado, não detalhe.

- **Não prometer:** horas liberadas, ganho de [win rate](#g-win-rate) ou retorno financeiro. Não há custo-hora, margem nem [baseline](#g-baseline) humano.
- **Prometer apenas** o que for testável em validação temporal e em [piloto com controle](#g-controle).

<a id="sub-4-4-4"></a>
#### 4.4.4. Objetivo candidato da priorização

> Direcionar a atenção ao **maior valor em jogo** entre as oportunidades ainda dentro do ciclo observado, sinalizando à parte as que pedem **revisão** (fora do ciclo) e as **[não pontuáveis](#g-pontuavel)** (cadastro incompleto).

- **Critérios comerciais candidatos:** valor em jogo (preço); idade relativa ao ciclo do produto (só Engaging); estágio (filtro); completude do cadastro.
- **Fora dos critérios:** vendedor, conta, setor, escritório e probabilidade de ganho por deal.
- **Não definido aqui:** pesos, faixas, desempate e número de filas. Ficam para a Arquitetura ([AR-01](#ar-01) e [AR-03](#ar-03)).

<a id="sub-4-4-5"></a>
#### 4.4.5. Dados disponíveis e confiabilidade

| Tabela | Granularidade e chave | Confiabilidade | Ressalvas |
| --- | --- | --- | --- |
| `sales_pipeline` (8.800) | 1 por oportunidade; `opportunity_id` único | Alta estrutural: 0 duplicatas, 0 datas invertidas, 0 violações estágio × campo | `GTXPro`; conta nula em 68,2% dos abertos; 461 linhas indistinguíveis; [truncamento](#g-truncamento) à esquerda; sem data de extração |
| `accounts` (85) | 1 por empresa | Boa quando presente (0 órfãs) | Rótulos `technolgy` e `Philipines`; foto atual |
| `products` (7) | 1 por produto | Alta | GTK 500: 40 oportunidades, 25 fechadas (instável) |
| `sales_teams` (35) | 1 por vendedor | Alta | 5 sem oportunidades; manager e escritório são foto atual |

O resultado (Won ou Lost) existe em 6.711 oportunidades (76,3%). As 2.089 abertas são alvo de predição e **nunca negativos**. Detalhe em [3.1](#sub-3-1) e [`A§2.1`](./data-audit.md#a-2-1) a [`A§2.7`](./data-audit.md#a-2-7).

<a id="sub-4-4-6"></a>
#### 4.4.6. Sinais válidos e inválidos

| Classe | Campos |
| --- | --- |
| ✅ Válidos (disponíveis na decisão, sem [vazamento](#g-vazamento)) | `deal_stage` (filtro); `product` normalizado e `sales_price` (valor); idade via `engage_date` (só Engaging, como flag); completude (conta nula, sem data) |
| 🟡 Candidato fraco | Mês-do-trimestre do `engage_date` ([AUC](#g-auc) de 0,506 a 0,561; [ε²](#g-epsilon) de 0,7%) |
| ⚠️ Só contexto (sem sinal) | `sales_agent`, `manager`, `regional_office`; setor e atributos da conta |
| ❌ Proibidos | `close_date`, `close_value`, `cycle_days`, mês de fechamento, posição da linha, `opportunity_id`, "conta preenchida → ganha" (artefato) |
| ∅ Ausentes | Atividade, histórico de estágio, motivo de perda, desconto, margem, metas, custo-hora, forecasts, regra de atribuição |

Detalhe em [3.3](#sub-3-3).

<a id="sub-4-4-7"></a>
#### 4.4.7. Hipóteses confirmadas e limitações

| Classificação | Hipóteses | Limitação |
| --- | --- | --- |
| **Sustentadas** | [H-005](#h-005) (qualidade do CRM); [H-008](#h-008) (valor de deal aberto indefinido, [proxy](#g-proxy) por preço validado) | O proxy foi validado só nos Won e é função do produto. |
| **Contradita** | [H-004](#h-004) (vendedor não vê padrões) | Só vale para segmentos estáticos; atividade poderia ter sinal. |
| **Não sustentada** | [H-002](#h-002) (capacidade): o efeito da carga some ao controlar vendedor × mês (ρ = −0,007) | A capacidade real é desconhecida, então a hipótese não foi refutada. |
| **Não verificáveis** | [P-001](#p-001), [P-002](#p-002), [P-003](#p-003), [H-001](#h-001), [H-003](#h-003), [H-006](#h-006), [H-007](#h-007) | O dataset não contém o que seria preciso. Ausência de [lift](#g-lift) não prova ausência de efeito. |

Detalhe em [3.2](#sub-3-2).

<a id="sub-4-4-8"></a>
#### 4.4.8. KPIs de negócio

| KPI | Calculável hoje? | Condição para medir impacto |
| --- | --- | --- |
| [O1](#o1). % do esforço em deals que terminam Lost | ❌ (proxy: Lost = 36,9% dos fechados) | Log de atividade, definição de "baixa chance", controle |
| [O2](#o2). Win rate de alto potencial | 🟡 | "Alto potencial" definido **fora do score** (senão é circular) |
| [O3](#o3). Receita fechada por vendedor e período | ✅ descritivo | Coortes maduras, controle de mix e sazonalidade |
| [O4](#o4). Adoção semanal | ❌ | Instrumentação da ferramenta |
| [O5](#o5). Erro de forecast | ❌ | Forecasts guardados |
| Valor aberto acima do P90 do ciclo | ✅ 1.432 Engaging (90,1%) acima do P90 do próprio produto; 3,2 mi de 3,9 mi em [preço de tabela](#g-preco-tabela) acima de 138 dias | Data de corte real |
| **KPI principal candidato ([2.4](#sub-2-4)):** Δ win rate ponderado por valor | 🟡 Só em validação temporal | Piloto com controle. Duas leituras com propriedades distintas (ver 2.4); a escolha é da Arquitetura ([AR-12](#ar-12)). |

**Baseline descritivo congelável:** win rate de 63,15% ([IC95%](#g-ic) de 61,99% a 64,30%), com variação de 48,6% a 82,8% por mês de fechamento; ticket Won de 2.360,9 (mediana 1.117); ciclo Won de 51,8 dias (mediana 57); soma Won de 10.005.534 (março a dezembro de 2017). 

**Como usar este baseline.** Ele é uma **faixa**, não um ponto: 63,15% entre os fechados; 48,2% a 71,9% se os abertos fossem todos perdidos ou todos ganhos; 48,6% a 82,8% por mês de fechamento; e a taxa de quem engajou entre nov/2016 e jan/2017 (73% a 82%) está provavelmente inflada por seleção. A Arquitetura deve tratá-lo como faixa ([AR-04](#ar-04)). Executar [T-A](#t-a) apenas estreitaria a faixa.

<a id="sub-4-4-9"></a>
#### 4.4.9. Critérios de funcionamento e validação

**Técnicos**

1. Validação temporal em 5 ou mais cortes, janela madura, features congeladas na data da decisão.
2. Baselines obrigatórios: taxa global, por produto, aleatório e só-valor.
3. Métricas separadas: poder de discriminação (AUC, [Brier](#g-brier)) e valor capturado (lift no top-K).
4. Teste automático de vazamento contra a lista de proibidas.
5. Se exibir probabilidade: [calibração](#g-calibracao) contra a [taxa-base](#g-taxa-base). Se não calibrar, não exibir.
6. Cobertura: % pontuável por estágio e % [fora do suporte](#g-suporte).
7. Contagem de linhas antes e depois de cada junção (regressão do caso `GTXPro`).

**Observáveis de funcionamento (produto)**

- Roda ponta a ponta nos dados reais.
- Cada oportunidade mostra o "porquê" em termos que o vendedor controla ("aberta há 2× o ciclo do produto"), não pesos de modelo.
- Uma pessoa não técnica entende sem treinamento.
- Filtro por vendedor, manager e escritório.
- Estados explícitos: pontuável, a revisar, não pontuável.

**Regra de honestidade:** nenhum resultado de validação é apresentado como efeito da ferramenta.

<a id="sub-4-4-10"></a>
#### 4.4.10. Restrições

- **Dados:** retrato único, sem histórico de estágio nem de atividade; truncamento à esquerda e janela de extração desconhecida; dado possivelmente sintético; células pequenas (GTK 500; vendedor com IC de ±4 a 10 p.p.).
- **Conceituais:** resultado histórico não é impacto; taxa-base não é probabilidade calibrada; idade não é abandono; Lost é estágio, não motivo.
- **Do desafio:** precisa rodar com dados reais; precisa ter lógica de scoring e explicar o porquê; budget de 4 a 6 horas; entregar Setup, Lógica, Limitações e Process Log; superar o baseline de IA.
- **De uso:** sem ranking de pessoas; risco de manipulação da métrica ([Goodhart](#g-goodhart)) e de *[feedback loop](#g-feedback)*.
- **Robustez exigida:** a solução deve funcionar sem [T-A](#t-a) e [T-B](#t-b). A taxa-base é tratada como faixa e a flag de idade como relativa ou configurável, de modo que nenhum dos resultados possíveis a invalide ([AR-03](#ar-03), [AR-04](#ar-04)).

<a id="sub-4-4-11"></a>
#### 4.4.11. Questões abertas para a arquitetura

Lista completa e numerada em [4.5](#sub-4-5) ([AR-01](#ar-01) a [AR-12](#ar-12)).

<a id="sub-4-5"></a>
### 4.5. Limitações, premissas e questões abertas

**Referências desta subetapa**

| O que usamos | De onde vem | Como é usado nesta subetapa |
| --- | --- | --- |
| Perguntas sem resposta e premissas | [Etapa 3, 3.7](#sub-3-7) | Reaproveitadas e ampliadas |
| Testes [T-A](#t-a) e [T-B](#t-b) | [Etapa 3, 3.8](#sub-3-8) | Tratados como incertezas que o projeto absorve |
| Conhecimento específico da empresa | [Etapa 2, 2.7](#sub-2-7) | Itens que só a empresa responde |
| Riscos priorizados | [data-audit.md, seção 6](./data-audit.md#a-6) | 12 riscos e dados a solicitar |


#### Questões para a Arquitetura

Cada questão traz a informação que o discovery já entrega para decidir. O que falta é decisão de projeto, não mais descoberta.

| ID | Decisão da Arquitetura | O que o discovery entrega para decidir | Requisito de projeto que decorre |
| --- | --- | --- | --- |
| <a id="ar-01">AR-01</a> | **Regras de scoring:** pesos, faixas ou tiers e desempate | 7 níveis de preço; a chance de fechar não discrimina; 4 componentes de prioridade ([4.2](#sub-4-2)) | Regra explicável, sem probabilidade por deal, com desempate explícito |
| <a id="ar-02">AR-02</a> | Reconciliar "scoring não é só ordenar por valor" (README do challenge) com o que os dados sustentam | Só o valor é sustentado; idade e cadastro são heurísticas ([3.3](#sub-3-3)) | Declarar os pesos como política e mostrar o porquê por oportunidade |
| <a id="ar-03">AR-03</a> | Uma fila ou duas ("trabalhar" × "revisar"); tratamento dos 1.291 [Engaging](#g-estagios) [envelhecidos](#g-envelhecido) | 81,2% acima do maior ciclo (138 d); 298 dentro do suporte; 77,9% com outro corte; não se sabe se é estrutural ou acúmulo | Funcionar nos dois cenários: flag relativa ou configurável, nunca absoluta e fixa |
| <a id="ar-04">AR-04</a> | Como expressar a incerteza e a [taxa-base](#g-taxa-base) | 63,15% ([IC95%](#g-ic) de 61,99% a 64,30%); 48,2% a 71,9% com os abertos; 48,6% a 82,8% por mês | Exibir como faixa e referência; não depender do valor exato |
| <a id="ar-05">AR-05</a> | Estado da oportunidade na data da decisão | Idade só em Engaging; conta nula em 68%; Prospecting sem data ([3.3](#sub-3-3)) | Estados explícitos: [pontuável](#g-pontuavel), a revisar, não pontuável |
| <a id="ar-06">AR-06</a> | Tratamento do Prospecting (500, sem data) | Só vendedor, produto e, em 33%, conta | Tratamento separado, sem idade |
| <a id="ar-07">AR-07</a> | "Hoje" fixo em 2017-12-31 ou parâmetro | Sem data de extração; a idade dos abertos muda com o corte | Parâmetro configurável |
| <a id="ar-08">AR-08</a> | Como medir impacto: o que se registra, como congelar o [baseline](#g-baseline), que controle usar | Nenhum KPI de impacto é calculável; só os descritivos ([3.4](#sub-3-4)) | Registro de eventos (visualização, ação, decisão) e baseline congelado desde o início |
| <a id="ar-09">AR-09</a> | Escopo da visão de manager | Diferenças entre vendedores indistinguíveis do acaso (p = 0,26) | Visão descritiva, sem ranking de pessoas |
| <a id="ar-10">AR-10</a> | Papel de um LLM (explicação em linguagem natural) | Risco de narrativa sem checagem ([2.2](#sub-2-2), erros frequentes) | Se houver, texto gerado só a partir de campos verificáveis |
| <a id="ar-11">AR-11</a> | Contrato de dados para enriquecimento futuro | Atividade e histórico de estágio ausentes | Ponto de extensão para novos sinais |
| <a id="ar-12">AR-12</a> | Qual leitura do KPI principal usar na validação | Razão: fica plana (60,0% a 64,8%). Valor capturado: sobe por construção ([2.4](#sub-2-4)) | Reportar *[skill](#g-skill-valor)* e valor separados; impacto só em piloto |

#### Incertezas que o projeto absorve (T-A e T-B não executados, decisão de 15/10/2026)

Identificar uma limitação não obriga o discovery a resolvê-la. A informação disponível já delimita cada incerteza e permite à Arquitetura projetar para ela.

| Teste | Incerteza | O que já sabemos | Como o projeto absorve | Quando valeria executar |
| --- | --- | --- | --- | --- |
| [T-A](#t-a) | Qual é a taxa de ganho "real", sem [truncamento](#g-truncamento) e [censura](#g-censura) | 63,15% entre fechados; 48,2% a 71,9% com os abertos; 48,6% a 82,8% por mês; engajados entre nov/2016 e jan/2017 inflados por seleção | Exibir a taxa-base como faixa e referência; validar em vários cortes ([AR-04](#ar-04)) | Se a Arquitetura decidir exibir um número único ou usá-lo como meta |
| [T-B](#t-b) | Os 1.291 envelhecidos são estrutura do dataset ou acúmulo | 81,2% acima do maior ciclo fechado; 77,9% com outro corte; nenhum fechado passou de 138 dias | Flag de idade relativa ou configurável; fila separada opcional ([AR-03](#ar-03)) | Se a Arquitetura decidir por um limiar absoluto de "revisar ou encerrar" |

#### Premissas a registrar

Reaproveita a lista de [3.7](#sub-3-7) e acrescenta:

| Premissa | Efeito se estiver errada |
| --- | --- |
| Data de corte = 2017-12-31 | Muda a idade dos abertos (81,2% passa a 77,9% com outro corte) |
| `GTXPro` = `GTX Pro` | Perda de 16,8% das linhas |
| Alvo: Won = 1, Lost = 0, abertos sem rótulo | Viés se os abertos forem tratados como negativos |
| [Preço de tabela](#g-preco-tabela) = [proxy](#g-proxy) de valor | Ranking por valor distorcido |
| A taxa de 63,15% é só dos fechados | A faixa real vai de 48,2% a 71,9% |
| O vendedor é o usuário central (decisão de 15/10/2026) | Se for o manager, a visão e a governança mudam |

#### Informações a pedir à empresa (por ordem de impacto)

1. Log de atividades (contatos, próximos passos) e histórico de mudança de estágio.
2. Quando o campo `account` é preenchido e por que 68% dos abertos não o têm.
3. Por que Engaging passa de 138 dias sem fechar; existe regra de expiração?
4. Definição de Lost e de cada estágio; data e regra de extração.
5. Como as oportunidades são atribuídas e qual é a capacidade esperada por vendedor.
6. Metas, comissão, custo-hora e margem.

#### Registro de alterações da consolidação (15/10/2026)

| Alteração | Onde |
| --- | --- |
| Índice, "Como ler", convenção de identificadores e glossário adicionados | Início e Apêndice A |
| Caixa "Em linguagem simples" e "Ponte" em cada etapa | Etapas 1 a 4 |
| Tabela "Referências desta subetapa" em cada subetapa das Etapas 2, 3 e 4 | 2.1 a 4.5 |
| Âncoras e links em identificadores, termos técnicos e referências ao audit | Todo o documento |
| Propriedades das duas leituras do KPI principal anotadas como informação para a Arquitetura (texto original mantido) | [2.4](#sub-2-4) e [3.4](#sub-3-4) |
| Limitações de taxa de ganho e de KPIs tratadas como requisitos de projeto, e não como pendências | [4.1](#sub-4-1), [4.4.8](#sub-4-4-8), [4.4.10](#sub-4-4-10), [4.5](#sub-4-5) e nota em [3.8](#sub-3-8) |
| Etapa 4 escrita (os 5 títulos vazios do template e os títulos duplicados foram substituídos) | Etapa 4 |
| `data-audit.md`: parágrafos duplicados do §7 removidos, "zumbi" → "envelhecido" e classificações de [HD-02](#hd-02), [HD-03](#hd-03), [HD-05](#hd-05) e [HD-06](#hd-06) alinhadas a [3.2](#sub-3-2). Nenhum número alterado | data-audit.md |


---

<a id="glossario"></a>
## Apêndice A. Glossário

[↑ Voltar ao índice](#indice)

Cada termo aparece com uma explicação simples e uma técnica. Os termos têm link a partir da primeira ocorrência em cada subetapa.

| Termo | Em linguagem simples | Em termos técnicos e neste projeto |
| --- | --- | --- |
| <a id="g-oportunidade">Oportunidade (deal)</a> | Uma venda em andamento ou já encerrada com um cliente | Uma linha de `sales_pipeline`, chave `opportunity_id` (8.800) |
| <a id="g-estagios">Estágios (Prospecting, Engaging, Won, Lost)</a> | Prospecting: ainda sem conversa ativa. Engaging: conversa ativa. Won: ganha. Lost: encerrada sem venda | Valores de `deal_stage`. Abertos = Prospecting + Engaging; fechados = Won + Lost. Lost é estágio, não motivo |
| <a id="g-win-rate">Taxa de ganho (win rate)</a> | De cada 100 oportunidades que terminaram, quantas foram ganhas | Won ÷ (Won + Lost). Aqui, 63,15% nos 6.711 fechados |
| <a id="g-taxa-base">Taxa-base</a> | O que se espera de uma oportunidade sem nenhuma informação a mais: a média geral | 63,15% (IC95% de 61,99% a 64,30%). Não é probabilidade calibrada por deal |
| <a id="g-ticket">Ticket médio</a> | Valor médio de uma venda ganha | Média de `close_value` nos Won (2.360,9; mediana 1.117). Os zeros dos Lost ficam de fora |
| <a id="g-ciclo">Ciclo de venda</a> | Dias entre começar a negociar e fechar | `close_date − engage_date`; só existe em fechados; máximo de 138 dias |
| <a id="g-idade">Idade da oportunidade</a> | Há quantos dias ela está em andamento | Data de corte − `engage_date`; só em Engaging; depende da data de corte assumida (2017-12-31) |
| <a id="g-envelhecido">Envelhecido (antes "zumbi")</a> | Aberta há mais tempo do que qualquer oportunidade que já fechou. Não prova que foi abandonada | Idade > 138 dias: 1.291 de 1.589 Engaging (81,2%) |
| <a id="g-preco-tabela">Preço de tabela</a> | Preço de catálogo do produto | `sales_price`. Proxy de valor validado nos Won (±20% em 95,9%) |
| <a id="g-proxy">Proxy</a> | Um número usado no lugar do que não se consegue medir | Ex.: preço de tabela no lugar do valor de uma oportunidade aberta |
| <a id="g-funcao-valor">Função de valor</a> | O que a empresa quer maximizar: receita, taxa de ganho, velocidade ou previsibilidade | Define o que "prioridade" significa (ver [1.5](#sub-1-5)) |
| <a id="g-vazamento">Vazamento (leakage)</a> | Usar, para prever algo, uma informação que só existe depois do resultado. O modelo parece ótimo e não vale nada | `close_date`, `close_value`, ciclo e mês de fechamento (AUC 0,644) |
| <a id="g-backtest">Backtest (validação temporal)</a> | Simular o passado: treinar com o que se sabia até uma data e testar no que aconteceu depois | 5 cortes, de maio a setembro de 2017 ([`A§2.9`](./data-audit.md#a-2-9)) |
| <a id="g-auc">AUC</a> | Nota de 0,5 a 1 de quão bem se separa quem ganha de quem perde. 0,5 é sorteio; 1 é perfeito | Área sob a curva ROC. Aqui, 0,47 a 0,57 para variáveis legítimas |
| <a id="g-brier">Brier</a> | Erro médio das probabilidades; menor é melhor | (p − y)². Difere da taxa global em no máximo ±0,003 |
| <a id="g-calibracao">Calibração</a> | Quando o modelo diz 70%, cerca de 70% devem fechar | Curva de confiabilidade ou ECE |
| <a id="g-censura">Censura à direita</a> | Oportunidades abertas ainda não têm resultado. Olhar só as fechadas favorece as rápidas | Por isso os abertos são alvo de predição, nunca negativos |
| <a id="g-truncamento">Truncamento à esquerda</a> | O extrato não mostra o que fechou antes de 2017-03-01. Negócios longos iniciados antes só aparecem se fecharam depois | Ciclo mínimo por mês de engage coincide com a distância até 2017-03-01 ([`A§2.10`](./data-audit.md#a-2-10)) |
| <a id="g-vies">Viés de seleção</a> | O histórico reflete onde o esforço foi aplicado, não o que aconteceria com atenção igual | Não testável aqui ([H-006](#h-006)) |
| <a id="g-feedback">Feedback loop</a> | Depois que a ferramenta guia a atenção, os dados futuros passam a refletir a própria ferramenta | Contamina re-treino e medição |
| <a id="g-snapshot">Snapshot</a> | Uma "foto" da oportunidade em uma data, usada para treinar e avaliar como se estivéssemos naquele dia | Idade e estágio congelados na data da decisão |
| <a id="g-suporte">Fora do suporte</a> | Situação que não aparece no histórico, então não há base para opinar | Idade acima de 138 dias; Prospecting sem data |
| <a id="g-pontuavel">Pontuável / não pontuável</a> | Se há dado suficiente para colocar a oportunidade no ranking | Ex.: Prospecting sem data; conta nula |
| <a id="g-lift">Lift (no top-K)</a> | Quanto a lista dos K primeiros é melhor do que uma lista ingênua | Compara a lista priorizada com baseline |
| <a id="g-skill-valor">Skill × valor</a> | Skill: o ranking separa quem ganha de quem perde. Valor: o ranking põe no topo o que vale mais | O valor sobe por construção ao ordenar por preço; o skill não |
| <a id="g-goodhart">Goodhart / gaming</a> | Quando uma métrica vira meta, passa a ser manipulada | Mexer em estágio ou data para subir no ranking |
| <a id="g-baseline">Baseline</a> | Ponto de comparação: o que se faz hoje ou a regra mais simples | Taxa global, por produto, só-valor |
| <a id="g-controle">Piloto com controle</a> | Usar a ferramenta com um grupo e comparar com um grupo sem ela | Única forma de estimar efeito causal |
| <a id="g-explicabilidade">Explicabilidade</a> | Dizer por que a oportunidade está onde está, em termos que o vendedor controla | Exigência do briefing |
| <a id="g-ic">IC95%</a> | Faixa em que o valor verdadeiro provavelmente está | Intervalo de confiança de 95% |
| <a id="g-epsilon">ε² (épsilon-quadrado)</a> | Quanto da variação do resultado uma variável explica (0 é nada) | Efeito do vendedor: 0,0007 |
| <a id="g-qui">Qui-quadrado</a> | Teste de se as diferenças entre grupos são maiores do que o acaso. Valor p alto: indistinguível do acaso | Vendedor: p = 0,26; produto: p = 0,37 |
