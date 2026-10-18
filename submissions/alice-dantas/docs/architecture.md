# Architecture — Challenge 003 | Lead Scorer

**Status:** Decisões propostas (ADR-001 a ADR-003, registradas em 15/10/2026); ADR-004 (16/10/2026) corrige o contrato entre back e front do ADR-003; ADR-005 (16/10/2026) registra o design system Rankio e a navegação entre páginas; ADR-006 (16/10/2026) troca a regra de grupos pela regra A e substitui em parte o ADR-001 e a decisão 5 do ADR-002; ADR-007 (17/10/2026) acrescenta a página Inteligência comercial, descritiva; ADR-009 (17/10/2026) põe Qualificar logo depois de Focar; ADR-008 (17/10/2026) troca o "próximo passo" por orientação de verificação, trata a conta ausente como lacuna de cadastro e dá contexto histórico à idade; ADR-010 (18/10/2026) acrescenta a priorização assistida pelo vendedor, no navegador. A seção 1 mantém as **entradas de produto** como contexto; a seção 2 registra as decisões. Implementação não iniciada.
**Última atualização:** 17/10/2026
**Documentos de origem:** [discovery.md](./discovery.md) (Etapas 1 a 4) e [data-audit.md](./data-audit.md) (auditoria dos dados)

<a id="indice"></a>
## Índice

| Seção | Pergunta que responde | Conteúdo (clique para ir) |
| --- | --- | --- |
| **Antes de começar** | Como ler este documento? | [Como ler](#como-ler) · [Procedência](#procedencia) · [Convenção de identificadores](#ids) |
| [**1. Contexto: entradas de produto**](#secao-1) | O que construir primeiro, para quem, com que evidência e sob quais limites? | [1.1 Conclusões](#sub-1-1) · [1.2 Requisitos](#sub-1-2) · [1.3 Matriz de oportunidades](#sub-1-3) · [1.4 Priorização](#sub-1-4) · [1.5 P0 e jornada](#sub-1-5) · [1.6 Rastreabilidade](#sub-1-6) · [1.7 Trade-offs](#sub-1-7) · [1.8 Fora do MVP](#sub-1-8) · [1.9 Sinais mínimos e restrições](#sub-1-9) · [1.10 Incertezas](#sub-1-10) |
| [**2. Registros de decisão arquitetural**](#secao-2) | O que decidimos, por quê, o que rejeitamos, o que sacrificamos, como verificamos e quando mudaríamos de ideia? | [2.0 Panorama](#sub-2-0) · [ADR-001 Scoring](#adr-001) · [ADR-002 Dados](#adr-002) · [ADR-003 Tecnologia](#adr-003) · [ADR-004 Contrato](#adr-004) · [ADR-005 Design system](#adr-005) · [ADR-006 Regra A](#adr-006) · [ADR-007 Inteligência](#adr-007) · [ADR-008 Verificação](#adr-008) · [ADR-009 Ordem](#adr-009) · [ADR-010 Priorização assistida](#adr-010) |
| [**3. Rastreabilidade e pendências**](#secao-3) | Onde cada questão aberta foi resolvida e o que ainda precisa ser corrigido? | [3.1 Questões do discovery](#sub-3-1) · [3.2 Requisitos por ADR](#sub-3-2) · [3.3 Evidência nova](#sub-3-3) · [3.4 Correções pendentes](#sub-3-4) |
| **Apêndice** | Limites e registro | [Limites deste documento](#limites) |

<a id="como-ler"></a>
## Como ler este documento

**Se você não é técnico:** leia a caixa "Em linguagem simples" da seção 1, depois [1.5](#sub-1-5) (a jornada do vendedor) e [1.8](#sub-1-8) (o que não entra).

**Se você é técnico:** cada subseção diz de onde herda, com link para o [discovery.md](./discovery.md). A cadeia completa está em [1.6](#sub-1-6); as decisões estão em [2](#secao-2): decisão do usuário → problema → requisito → funcionalidade → prioridade → evidência → critério de aceite.

**Relação com o discovery.** Este documento **não repete** a descoberta. Ele a converte em oportunidades de produto, prioridades e restrições. Todo identificador do discovery (por exemplo [HD-01](./discovery.md#hd-01), [H-005](./discovery.md#h-005), [AR-03](./discovery.md#ar-03)) tem link para onde é definido. Termos técnicos têm link para o [Glossário do discovery](./discovery.md#glossario).

<a id="procedencia"></a>
### Procedência das afirmações

Cada afirmação traz uma destas etiquetas:

| Etiqueta | Significado |
| --- | --- |
| **[Briefing]** | Está escrito no [README do challenge](../../../challenges/build-003-lead-scorer/README.md) ou nas regras do repositório ([README raiz](../../../README.md), [CONTRIBUTING](../../../CONTRIBUTING.md)) |
| **[Dados]** | Foi medido na auditoria (referência `A§`) ou em **consulta direta** |
| **[Hipótese]** | É plausível, mas nem os dados nem a empresa confirmaram |
| **[Escolha]** | É decisão de projeto: reversível e de nossa responsabilidade, não um fato |

**Consulta direta** é uma contagem simples sobre `sales_pipeline.csv`, feita ao preparar este documento, fora do script de auditoria, com o corte assumido de 2017-12-31. Não consta do [data-audit.md](./data-audit.md).

<a id="ids"></a>
### Convenção de identificadores

Cada identificador tem um link para o ponto onde é definido.

| Identificador | O que é | Definido em |
| --- | --- | --- |
| [RB-01](#rb-01) a [RB-08](#rb-08), [RD-01](#rd-01) a [RD-09](#rd-09), [RE-01](#re-01) a [RE-04](#re-04) | Requisitos: do briefing (RB), dos dados (RD) e de escolha de projeto (RE) | [1.2](#sub-1-2) |
| [OP-01](#op-01) a [OP-13](#op-13) | Oportunidades de produto | [1.3](#sub-1-3) |
| [F-01](#f-01) a [F-13](#f-13) | Funcionalidades candidatas, com prioridade P0, P1 ou P2 | [1.3](#sub-1-3) e [1.4](#sub-1-4) |
| [TO-01](#to-01) a [TO-08](#to-08) | Trade-offs | [1.7](#sub-1-7) |
| [RJ-01](#rj-01) a [RJ-07](#rj-07) | Abordagens rejeitadas do MVP | [1.8](#sub-1-8) |
| [Q-01](#q-01) a [Q-03](#q-03) | Questões adicionais para a arquitetura | [1.9](#sub-1-9) |
| [U-01](#u-01) a [U-10](#u-10) | Incertezas | [1.10](#sub-1-10) |
| [ADR-001](#adr-001) a [ADR-010](#adr-010) | Registros de decisão arquitetural | [2](#secao-2) |
| [CP-01](#cp-01) a [CP-06](#cp-06) | Correções pendentes nos documentos de origem | [3.4](#sub-3-4) |
| [P-001](./discovery.md#p-001) a [P-003](./discovery.md#p-003) · [H-001](./discovery.md#h-001) a [H-008](./discovery.md#h-008) | Problemas e hipóteses | [discovery 1.3](./discovery.md#sub-1-3) |
| [HD-01](./discovery.md#hd-01) a [HD-08](./discovery.md#hd-08) | Decisões do mapa | [discovery 2.6](./discovery.md#sub-2-6) |
| [AR-01](./discovery.md#ar-01) a [AR-12](./discovery.md#ar-12) | Questões abertas para a arquitetura | [discovery 4.5](./discovery.md#sub-4-5) |
| `A§x.y` | Seção x.y do [data-audit.md](./data-audit.md) | data-audit.md |

---

<a id="secao-1"></a>
## 1. Entradas de produto para a arquitetura

[↑ Voltar ao índice](#indice)

> **Em linguagem simples**
>
> **O que esta seção responde:** o que vale construir primeiro, para quem, e com que evidência.
>
> **O que fizemos:** transformamos cada decisão do vendedor, do manager e da RevOps em uma oportunidade de produto, comparamos todas com os mesmos critérios e separamos o que entra no MVP, o que pode entrar depois e o que não deve entrar.
>
> **O que encontramos:** os dados sustentam uma ferramenta de **triagem explicável** (valor em jogo, o que passou do ciclo já observado, o que não dá para pontuar). Não sustentam um previsor de quem vai fechar. O ganho sobre "ordenar por preço" é pequeno e não dá para comprová-lo aqui.
>
> **O que passa para a arquitetura:** seis funcionalidades P0, a jornada do vendedor, sete abordagens rejeitadas, sinais mínimos, restrições e dez incertezas.

**Referências desta seção**

| O que usamos | De onde vem | Como é usado nesta seção |
| --- | --- | --- |
| Problema, stakeholders e hipóteses | [discovery, Etapa 1](./discovery.md#etapa-1) | Usuários, decisões e dificuldades da matriz |
| Sinais, valor e KPIs | [discovery, Etapa 2](./discovery.md#etapa-2) | Sinais mínimos e valor esperado |
| Evidência dos dados e classificação das hipóteses | [discovery, Etapa 3](./discovery.md#etapa-3) e [data-audit.md](./data-audit.md) | Evidência de cada funcionalidade |
| Prioridade, restrições e questões abertas | [discovery, Etapa 4](./discovery.md#etapa-4) | Requisitos, restrições e handoff |
| Requisitos do challenge e regras de submissão | [README do challenge](../../../challenges/build-003-lead-scorer/README.md) e [submission-guide](../../../submission-guide.md) | Requisitos RB |

<a id="sub-1-1"></a>
### 1.1. Conclusões

**Herda de:** [discovery 4.1](./discovery.md#sub-4-1), [discovery 4.2](./discovery.md#sub-4-2) e [discovery 3.9](./discovery.md#sub-3-9).

1. **[Dados] O que é sustentável:** ordenar por valor em jogo (preço de tabela ≈ valor fechado, ±20% em 95,9% dos Won), sinalizar o que passou do ciclo já observado do produto e declarar o que não dá para pontuar. Detalhe em [discovery 4.2](./discovery.md#sub-4-2).
2. **[Dados] O que não é:** probabilidade de ganho por deal ([AUC](./discovery.md#g-auc) de 0,47 a 0,57) e esfriamento ou reativação (não há log de atividade).
3. **[Escolha] Consequência de produto:** o MVP é uma ferramenta de triagem explicável. Seu "scoring" é uma regra multicritério (valor em jogo e posição no ciclo, com o estado do cadastro como aviso) cujos pesos são **política**, não aprendizado. Isso atende "não é só ordenar por valor" por integrar três critérios com explicação. Não promete melhorar o desfecho.
4. **[Dados] A lista que o vendedor usará é curta e depende da data de corte (consulta direta).**
   - Só **298** das 1.589 Engaging estão dentro do ciclo observado (até 138 dias).
   - 21 dos 27 vendedores com carteira aberta têm ao menos uma (mediana 16; máximo 31). Os outros 6 não têm nenhuma.
   - Dentro do ciclo ficam 17,8% do valor de tabela das Engaging (0,69 mi de 3,89 mi).
   - O restante é "revisar" ou "não pontuável".
5. **[Hipótese] O ganho incremental sobre "ordenar por preço" é pequeno.** O vendedor mediano tem 6 produtos distintos na carteira aberta (consulta direta): ordenar por preço já lhe dá quase o mesmo topo. O valor adicional está em integrar idade e cadastro, explicar e padronizar o critério. Se isso muda o resultado, só um [piloto com controle](./discovery.md#g-controle) diz ([U-01](#u-01)).
6. **[Dados] Nada aqui comprova efeito da ferramenta.** Resultado histórico não é impacto ([discovery 3.5](./discovery.md#sub-3-5)).

<a id="sub-1-2"></a>
### 1.2. Requisitos que a matriz precisa atender

**Herda de:** README do challenge ([RB](#sub-1-2)), [discovery 4.3](./discovery.md#sub-4-3) e [discovery 4.4.10](./discovery.md#sub-4-4-10) ([RD](#sub-1-2)) e [discovery 4.5](./discovery.md#sub-4-5) ([RE](#sub-1-2)). Origem declarada de cada requisito.

| ID | Requisito | Procedência | Fonte |
| --- | --- | --- | --- |
| <a id="rb-01">RB-01</a> | Rodar de verdade, com os dados reais do dataset | [Briefing] | README do challenge, "Requisitos mínimos" |
| <a id="rb-02">RB-02</a> | Ter lógica de scoring ou priorização que não seja só ordenar por valor | [Briefing] | Idem |
| <a id="rb-03">RB-03</a> | O vendedor entende por que um deal tem prioridade alta ou baixa | [Briefing] | Idem; dica "Explainability ganha" |
| <a id="rb-04">RB-04</a> | Ajudar a decidir onde focar (não só mostrar dados), na segunda-feira de manhã, sem exigir perfil técnico | [Briefing] | Critérios de qualidade e dicas |
| <a id="rb-05">RB-05</a> | Documentar setup, lógica e limitações; entregar process log | [Briefing] | README do challenge; submission-guide |
| <a id="rb-06">RB-06</a> | Filtro por vendedor, manager e região (bônus) | [Briefing] | Dicas |
| <a id="rb-07">RB-07</a> | Superar substancialmente o que uma IA produz sozinha | [Briefing] (regra do repositório) | README raiz, "Sobre o baseline" |
| <a id="rb-08">RB-08</a> | Alterar apenas arquivos em `submissions/alice-dantas/` | [Briefing] (regra do repositório) | CONTRIBUTING |
| <a id="rd-01">RD-01</a> | Não exibir probabilidade de ganho por deal | [Dados] | AUC 0,47 a 0,57 ([`A§2.9`](./data-audit.md#a-2-9)) |
| <a id="rd-02">RD-02</a> | Não usar `close_date`, `close_value`, ciclo, mês de fechamento, posição no arquivo nem `opportunity_id`, com verificação automática | [Dados] | [`A§2.8`](./data-audit.md#a-2-8) |
| <a id="rd-03">RD-03</a> | "Não pontuável" e "fora do ciclo observado" são saídas válidas, com motivo | [Dados] | [`A§2.5`](./data-audit.md#a-2-5) e V6 em [`A§2.10`](./data-audit.md#a-2-10) |
| <a id="rd-04">RD-04</a> | Normalizar rótulos e provar que nenhuma linha se perde nas junções | [Dados] | [`A§2.4`](./data-audit.md#a-2-4) |
| <a id="rd-05">RD-05</a> | Mostrar a taxa-base só como faixa de referência, nunca por deal | [Dados] | [discovery 4.4.8](./discovery.md#sub-4-4-8) e [AR-04](./discovery.md#ar-04) |
| <a id="rd-06">RD-06</a> | Vendedor, manager e escritório só como escopo, nunca como sinal nem ranking de pessoas | [Dados] | [H-001](./discovery.md#h-001) e [discovery 4.3](./discovery.md#sub-4-3) (linha 10) |
| <a id="rd-07">RD-07</a> | "Hoje" como parâmetro explícito; limiar de idade relativo ao produto | [Dados] | [discovery 4.3](./discovery.md#sub-4-3) (linhas 6 e 12) |
| <a id="rd-08">RD-08</a> | Registrar eventos de uso para medir impacto depois | [Dados] | [discovery 3.4](./discovery.md#sub-3-4) e [AR-08](./discovery.md#ar-08) |
| <a id="rd-09">RD-09</a> | Validar com [backtest](./discovery.md#g-backtest) temporal em vários cortes contra baselines | [Dados] | [discovery 4.4.9](./discovery.md#sub-4-4-9) |
| <a id="re-01">RE-01</a> | O usuário central é o vendedor | [Escolha] | Decisão de 15/10/2026 ([discovery 4.5](./discovery.md#sub-4-5)) |
| <a id="re-02">RE-02</a> | A precisão exibida não excede a dos dados (7 níveis de valor, uma flag de idade) | [Escolha] | [discovery 4.3](./discovery.md#sub-4-3) (linha 3) |
| <a id="re-03">RE-03</a> | No MVP a ferramenta lê o CRM e não escreve nele | [Escolha] | Escopo de 4 a 6 horas |
| <a id="re-04">RE-04</a> | Toda frase mostrada ao vendedor aponta para um campo verificável | [Escolha] | [AR-10](./discovery.md#ar-10) e erros frequentes de [discovery 2.2](./discovery.md#sub-2-2) |

<a id="sub-1-3"></a>
### 1.3. Matriz de oportunidades

**Herda de:** decisões e dificuldades de [discovery 1.2](./discovery.md#sub-1-2), sinais de [discovery 2.2](./discovery.md#sub-2-2), valor de [discovery 2.3](./discovery.md#sub-2-3) e hipóteses classificadas em [discovery 3.2](./discovery.md#sub-3-2).

Treze oportunidades, uma por par "usuário × decisão". A matriz está em três tabelas que compartilham o ID da oportunidade. Os 11 itens pedidos se distribuem assim: **Tabela A** (1 a 4), **Tabela B** (5 a 8) e **Tabela C** (9 a 11). Cada oportunidade tem uma funcionalidade candidata (F-xx), que é o que recebe prioridade em [1.4](#sub-1-4).

**Tabela A. Quem decide, o quê, por que é difícil hoje e que informação falta** (itens 1 a 4)

| ID | 1. Usuário beneficiado | 2. Decisão a melhorar | 3. Dificuldade atual | 4. Informação necessária |
| --- | --- | --- | --- | --- |
| <a id="op-01">OP-01</a> | Vendedor (primário) [Briefing] | Qual oportunidade abrir e trabalhar primeiro na segunda-feira ([HD-01](./discovery.md#hd-01)) | Mediana de 79 abertas por vendedor, máximo 194 (consulta direta); critério pessoal e invisível, sem comparação entre deals ([P-003](./discovery.md#p-003)) [Briefing] | Abertas do vendedor; produto normalizado e preço; estágio; idade relativa ao ciclo; completude |
| <a id="op-02">OP-02</a> | Vendedor | Seguir ou não a recomendação (confiar para agir) | Um número sem contexto não é usado; hoje o critério é invisível ([P-003](./discovery.md#p-003)) [Briefing] | Para cada deal, os campos verificáveis que definem a posição, em termos que o vendedor controla; o que não se sabe |
| <a id="op-03">OP-03</a> | Vendedor; Analista de RevOps/CRM [inferido] | Posso confiar neste registro? O que corrijo antes de contar com o deal? ([HD-08](./discovery.md#hd-08)) | `account` nula em 68,2% das abertas e em 0% das fechadas; Prospecting sem nenhuma data (500) [Dados, [`A§2.5`](./data-audit.md#a-2-5)]; nulo estrutural se confunde com falha | Completude condicionada ao estágio; motivo da lacuna por deal |
| <a id="op-04">OP-04</a> | Vendedor | Qual deal revisar ou encerrar ([HD-02](./discovery.md#hd-02)) | Sem referência de ciclo típico; apego e otimismo [Hipótese, [H-003](./discovery.md#h-003)]; 1.291 de 1.589 Engaging acima do maior ciclo fechado [Dados] | Idade desde `engage_date`; ciclo do produto (fechados anteriores ao corte); data de corte |
| <a id="op-05">OP-05</a> | Analista de RevOps/CRM; quem constrói [inferido] | Quais registros entram e com que regra de limpeza ([HD-08](./discovery.md#hd-08)) | `GTXPro` derruba 1.480 linhas (16,8%) em silêncio num inner join; rótulos com grafia errada; 461 linhas indistinguíveis [Dados, [`A§2.3`](./data-audit.md#a-2-3) e [`A§2.4`](./data-audit.md#a-2-4)] | Mapa de grafias; contagem antes e depois de cada junção; lista de decisões de limpeza |
| <a id="op-06">OP-06</a> | Head de RevOps (pediu e avalia) | A priorização é melhor que o "feeling" ou só parece? Posso defendê-la? ([HD-07](./discovery.md#hd-07)) | Sinal legítimo fraco e instável; o único padrão forte é [vazamento](./discovery.md#g-vazamento) (mês de fechamento, AUC 0,644) [Dados, [`A§2.8`](./data-audit.md#a-2-8) e [`A§2.9`](./data-audit.md#a-2-9)] | Backtest temporal em 5 ou mais cortes; baselines; lista de campos proibidos |
| <a id="op-07">OP-07</a> | Head de RevOps; vendedor | Vale padronizar o critério e investir em dados e instrumentação? ([HD-07](./discovery.md#hd-07)) | Sem baseline humano, sem esforço e sem atividade; KPIs [O1](./discovery.md#o1) a [O5](./discovery.md#o5) não calculáveis [Dados, [discovery 3.4](./discovery.md#sub-3-4)] | O que foi mostrado, o que o vendedor fez (viu, marcou, descartou) e quando; baseline congelado |
| <a id="op-08">OP-08</a> | Manager (secundário) | Onde apoiar o time ([HD-04](./discovery.md#hd-04)) | Visão depende do relato do vendedor [Briefing]; diferenças entre vendedores indistinguíveis do acaso (p = 0,26) [Dados] | Carteira por vendedor e escritório (valor em jogo, fora do ciclo, não pontuáveis), de forma descritiva |
| <a id="op-09">OP-09</a> | Vendedor; manager | Quanto confiar em "prioridade alta" como chance de fechar | Faixas podem ser lidas como probabilidade; a taxa de ganho vai de 48,6% a 82,8% por mês [Dados] | [Taxa-base](./discovery.md#g-taxa-base) como faixa e o aviso de que ela não separa deals |
| <a id="op-10">OP-10</a> | Manager; Head de RevOps | O gargalo é carga ou critério? ([H-002](./discovery.md#h-002)) | Capacidade desconhecida; a associação carga × resultado some ao controlar vendedor × mês (ρ = −0,007) [Dados] | Abertas por vendedor no tempo; capacidade esperada (ausente) |
| <a id="op-11">OP-11</a> | Vendedor | Quando reativar um deal parado ([HD-03](./discovery.md#hd-03)) | Sem alerta de janela [Briefing]; sem log de atividade nem histórico de estágio [Dados] | Atividade, último contato, próximo passo, mudança de estágio (todos ausentes) |
| <a id="op-12">OP-12</a> | Manager; Direção/Finanças [inferido] | Qual forecast comprometer ([HD-05](./discovery.md#hd-05), [HD-06](./discovery.md#hd-06)) | Pipeline subjetivo [Hipótese]; sem forecasts históricos; taxa instável no calendário [Dados] | Probabilidades [calibradas](./discovery.md#g-calibracao) por segmento; forecasts guardados; metas (ausentes) |
| <a id="op-13">OP-13</a> | Head de RevOps | Escalar, ajustar ou abandonar a ferramenta | O efeito só é estimável com controle [Dados, [discovery 3.4](./discovery.md#sub-3-4)] | Coortes com e sem ferramenta, de mesma maturidade; adoção; baseline |

**Tabela B. O que a solução deve oferecer, a funcionalidade, a evidência e o valor** (itens 5 a 8)

| ID | 5. Capacidade que a solução deve oferecer | 6. Funcionalidade candidata | 7. Evidência que a justifica (procedência) | 8. Valor esperado |
| --- | --- | --- | --- | --- |
| [OP-01](#op-01) | Ordenar as abertas do vendedor por "onde a atenção vale mais", com critério único e visível, sem prometer chance de fechar | <a id="f-01">**F-01**</a> Lista "Onde focar": oportunidades em faixas de prioridade por valor em jogo, desempate explícito e escopo por vendedor | [Briefing] "o vendedor abra, veja o pipeline e saiba onde focar". [Dados] preço ≈ valor fechado, ±20% em 95,9% dos Won (V9, [`A§2.10`](./data-audit.md#a-2-10)); valor tem 7 níveis, logo empates ([discovery 4.3](./discovery.md#sub-4-3), linha 3). [Escolha] valor é o componente central por ser o único quantificável com respaldo ([discovery 4.2](./discovery.md#sub-4-2)) | Troca critério pessoal por um comum e visível; menos tempo para decidir. Ganho em resultado: **hipotético** ([U-01](#u-01)) |
| [OP-02](#op-02) | Expor o porquê de cada posição em termos do vendedor, e o que não se sabe | <a id="f-02">**F-02**</a> Painel "Por que está aqui": valor (preço do produto), idade contra o ciclo do produto, estado do cadastro e a frase fixa "não distinguimos a chance de fechar entre deals" | [Briefing] "precisa entender por que"; "Explainability ganha". [Dados] pesos de modelo não são acionáveis ([discovery 2.2](./discovery.md#sub-2-2), erros frequentes). [Hipótese] explicar aumenta o uso | Confiança e uso; protege contra a leitura do ranking como probabilidade |
| [OP-03](#op-03) | Declarar quando um deal não pode ser pontuado e por quê | <a id="f-03">**F-03**</a> Estado explícito por oportunidade ([pontuável](./discovery.md#g-pontuavel), a revisar, não pontuável) com motivo e o que corrigir | [Dados] conta nula em 68,2% das abertas; Prospecting sem datas; 81% [fora do suporte](./discovery.md#g-suporte) ([`A§2.5`](./data-audit.md#a-2-5), [`A§2.10`](./data-audit.md#a-2-10)); [H-005](./discovery.md#h-005) sustentada. [Escolha] "não pontuável" é saída válida ([discovery 3.6](./discovery.md#sub-3-6), decisão 3) | Evita falsa precisão; transforma lacuna de dado em ação (corrigir cadastro) |
| [OP-04](#op-04) | Distinguir, entre as abertas, o que passou do ciclo já observado do produto, sem chamar de perdido | <a id="f-04">**F-04**</a> Grupo ou marca "Revisar": "aberta há X dias; ciclo fechado do produto: até Y". Formato (fila ou flag) fica com a arquitetura ([AR-03](./discovery.md#ar-03)) | [Briefing] "tempo demais em deals que não vão fechar". [Dados] 1.291 de 1.589 acima de 138 d; 1.432 acima do P90 do produto (V6). [Dados] idade tem AUC 0,475 a 0,571, instável: é heurística. [Hipótese] incentivos ([H-003](./discovery.md#h-003)) | Cobre a primeira queixa do briefing com o único sinal disponível; impede que 1.291 deals [envelhecidos](./discovery.md#g-envelhecido) diluam a lista. Valor depende de a idade indicar risco (não validado) |
| [OP-05](#op-05) | Garantir que o que entra no ranking é o dado correto e rastreável | <a id="f-05">**F-05**</a> Preparação com relatório: normalização (`GTXPro` → `GTX Pro`, rótulos), contagem antes e depois de cada junção, cobertura por estágio | [Dados] 1.480 linhas perdidas em inner join; joins N:1 não multiplicam; auto-junção por conta multiplica por 96,6 ([`A§2.4`](./data-audit.md#a-2-4)); [H-005](./discovery.md#h-005) sustentada | Pré-condição de todas as outras; evita erro silencioso |
| [OP-06](#op-06) | Provar que a regra não vaza o futuro e dizer sem exagero o que ela entrega | <a id="f-06">**F-06**</a> Relatório de validação temporal e verificação automática de campos proibidos, com habilidade ([skill](./discovery.md#g-skill-valor)) e valor reportados separados | [Dados] sinal ilegítimo AUC 0,644; legítimos 0,47 a 0,57 ([`A§2.8`](./data-audit.md#a-2-8), [`A§2.9`](./data-audit.md#a-2-9)); o KPI de valor capturado sobe por construção ([discovery 2.4](./discovery.md#sub-2-4)). [Briefing] "O scoring faz sentido?". [Escolha] critérios de [discovery 4.4.9](./discovery.md#sub-4-4-9) | Credibilidade com a RevOps; impede vender regra como modelo; é o que separa a entrega de um baseline de IA ([RB-07](#rb-07)) |
| [OP-07](#op-07) | Registrar uso e decisão para criar o baseline humano e medir adoção | <a id="f-07">**F-07**</a> Marcação simples por oportunidade ("vou trabalhar", "revisei", "descartei" com motivo curto) e registro de eventos | [Dados] [O1](./discovery.md#o1) a [O5](./discovery.md#o5) não calculáveis ([discovery 3.4](./discovery.md#sub-3-4)); baseline humano inobservável ([H-007](./discovery.md#h-007)). [Briefing] "uma ferramenta que o vendedor abra". [Hipótese] a marcação não afasta o vendedor | Habilita adoção ([O4](./discovery.md#o4)), baseline e piloto. Sem isto nenhum impacto é mensurável |
| [OP-08](#op-08) | Mostrar a carteira agregada por vendedor e escritório, sem ranking de pessoas | <a id="f-08">**F-08**</a> Filtros de manager e escritório e resumo descritivo da carteira (nº e valor em jogo por estado) | [Briefing] bônus "filtro por vendedor/manager/região". [Dados] vendedores indistinguíveis do acaso ([H-001](./discovery.md#h-001)); visão descritiva possível ([HD-04](./discovery.md#hd-04), parcial) | Visão de portfólio para o manager sem cobrança injusta. Valor gerencial é hipótese |
| [OP-09](#op-09) | Contextualizar prioridade com a referência histórica, como faixa | <a id="f-09">**F-09**</a> Faixa de referência: "historicamente cerca de 63% das fechadas foram ganhas (48% a 72% com as abertas); isto não separa deals" | [Dados] 63,15% (IC95% 61,99% a 64,30%); 48,2% a 71,9%; 48,6% a 82,8% por mês ([discovery 4.4.8](./discovery.md#sub-4-4-8)). [Escolha] exibir como faixa ([AR-04](./discovery.md#ar-04)) | Evita ancoragem em um número falso; custo baixo. Valor é de proteção, não de ganho |
| [OP-10](#op-10) | Mostrar a carga por vendedor como diagnóstico, não como conclusão | <a id="f-10">**F-10**</a> Painel de carga: abertas por vendedor ao longo do tempo (Prospecting à parte) | [Dados] carga média 64,5; efeito some com controle (V11); capacidade inobservável ([H-002](./discovery.md#h-002)) | Só testa [H-002](./discovery.md#h-002) quando houver capacidade; hoje é informação |
| [OP-11](#op-11) | Alertar quando um bom deal deixou de receber atenção | <a id="f-11">**F-11**</a> Alerta de esfriamento e reativação baseado em atividade | [Briefing] "deixam oportunidades boas esfriar". [Dados] atividade ausente; só idade ([HD-03](./discovery.md#hd-03), não verificável) | Alto se houver atividade; hoje próximo de nulo e arriscado (falso alarme) |
| [OP-12](#op-12) | Estimar a receita esperada do pipeline por time e período | <a id="f-12">**F-12**</a> Pipeline ponderado e forecast | [Hipótese] benefício de segunda ordem ([discovery 2.2](./discovery.md#sub-2-2), decisão 7). [Dados] sem forecasts históricos; probabilidade não discrimina ([HD-05](./discovery.md#hd-05), não verificável) | Potencial em previsibilidade; hoje não sustentável |
| [OP-13](#op-13) | Medir o efeito causal da ferramenta | <a id="f-13">**F-13**</a> Desenho de piloto com grupo de controle (processo, não tela) | [Dados] impacto só em piloto ([discovery 3.4](./discovery.md#sub-3-4), [discovery 4.1](./discovery.md#sub-4-1) pergunta 7). [Escolha] fora do MVP | Única forma de afirmar resultado; é pós-MVP |

**Tabela C. Esforço, riscos e como validar** (itens 9 a 11)

Escala de esforço (estimativa de produto, [Hipótese]): **Baixo** = regra simples sobre campos já limpos; **Médio** = várias regras ou decisão de desenho; **Alto** = exige dado inexistente ou processo fora da ferramenta. A arquitetura refaz a estimativa.

| ID | 9. Esforço | 10. Riscos e incertezas | 11. Como validar se funciona |
| --- | --- | --- | --- |
| [OP-01](#op-01) | Médio | Só 7 níveis de valor: empates e pouca diferença sobre "ordenar por preço" ([U-01](#u-01)); lista principal curta, 298 deals dentro do ciclo ([U-04](#u-04)); falsa precisão se virar score contínuo | Teste de tarefa com 3 a 5 pessoas não técnicas: "quais 3 você abre primeiro e por quê?", sem ajuda, em até 2 minutos. Reconciliação: soma por estado = 2.089 abertas. Comparar o topo com "só valor" e justificar cada diferença |
| [OP-02](#op-02) | Médio | Explicação "bonita" que não reflete a regra real; leitura de "valor" como "chance"; excesso de texto | Teste de compreensão: o testador diz com as próprias palavras por que um deal está no topo e o que a ferramenta não sabe (4 de 5 acertam). Checagem: cada frase mapeia para um campo |
| [OP-03](#op-03) | Baixo | Tratar conta nula como bloqueio deixaria 68,2% das abertas fora da lista sem razão analítica, pois conta não entra no score ([Q-02](#q-02)); leitura de "não pontuável" como "ruim" | Cobertura por estágio reportada; amostra de 20 casos conferida à mão; nenhuma oportunidade some (soma dos estados = total) |
| [OP-04](#op-04) | Médio | Flag que dispara em 81% deixa de discriminar; falso positivo "mata deal bom" ([M6](./discovery.md#m6)); "revisar" lido como "encerre"; idade depende do corte assumido; incentivos contra Lost ([D26](./discovery.md#d26)) | Sensibilidade ao corte (138 d × P90 do produto: 1.291 × 1.432) mostrando que a mensagem muda pouco; teste de leitura de que "revisar" ≠ "perdido"; em piloto, % de revisados que mudam de estado |
| [OP-05](#op-05) | Baixo | Decisões de limpeza são premissas (`GTXPro` = `GTX Pro`; 461 linhas mantidas); se erradas, distorcem | Contagem de linhas igual a 8.800 em cada junção; teste de regressão do caso `GTXPro`; premissas visíveis na documentação |
| [OP-06](#op-06) | Médio | Validar "só valor" cria ilusão (sobe por construção); conclusão "sem lift" pode decepcionar; a janela muda a métrica (taxa de ganho do teste de 0,598 a 0,739) | 5 ou mais cortes com intervalo; a verificação falha se campo proibido for usado; valor e habilidade em colunas separadas |
| [OP-07](#op-07) | Médio | Fricção do vendedor; gaming; uso gerencial para vigiar; o uso contamina dados futuros ([feedback loop](./discovery.md#g-feedback)) | % de vendedores ativos que marcam ao menos uma ação por semana ([O4](./discovery.md#o4)); taxa de motivo preenchido; comparação com baseline congelado |
| [OP-08](#op-08) | Baixo (filtros); Médio (resumo) | Vira ranking de pessoas ([Goodhart](./discovery.md#g-goodhart)); IC por vendedor de ±4 a 10 p.p.; células pequenas | Revisão de interface: nenhuma tela ordena pessoas por desempenho; conversa com 1 manager, se houver |
| [OP-09](#op-09) | Baixo | Ignorado ou mal lido; confusão entre faixa e probabilidade | Teste de leitura de uma linha; números conferem com [discovery 4.4.8](./discovery.md#sub-4-4-8) |
| [OP-10](#op-10) | Baixo a Médio | Vira instrumento de cobrança; carga reconstruída é aproximada e exclui Prospecting | Não validável sem capacidade; só voltar após a pergunta 5 de [discovery 4.5](./discovery.md#sub-4-5) ("informações a pedir à empresa") |
| [OP-11](#op-11) | Alto (dado inexistente) | Falso alarme constante faz o vendedor ignorar; semântica causal inventada | Só após log de atividade; comparar com grupo de controle |
| [OP-12](#op-12) | Alto | Forecast inflado pelo [viés de seleção](./discovery.md#g-vies); calibração não verificável aqui | Backtest do pipeline reconstruído em 5 ou mais cortes, e forecasts guardados quando existirem |
| [OP-13](#op-13) | Alto (processo) | Contaminação entre grupos; sazonalidade; amostra pequena | Coortes de mesma maturidade, vários trimestres, controle de território e mix |

<a id="sub-1-4"></a>
### 1.4. Priorização

**Herda de:** requisitos ([1.2](#sub-1-2)), matriz ([1.3](#sub-1-3)) e classificação das hipóteses ([discovery 3.2](./discovery.md#sub-3-2)).

**Como ler a tabela.** Cada coluna diz quanto o critério **favorece** a entrada do item no MVP: **A** = favorece; **M** = neutro ou parcial; **B** = pesa contra. Na coluna de risco, **A** significa risco baixo. São julgamentos qualitativos: **não há nota numérica**, porque os dados não sustentam essa precisão.

| Item | Requisitos obrigatórios | Aderência ao briefing | Importância da decisão | Impacto potencial | Qualidade da evidência | Viabilidade técnica | Risco e leakage | Uso real | **Prioridade** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [F-01](#f-01) Lista "Onde focar" | A | A | A | M | M | A | M | A | **P0** |
| [F-02](#f-02) "Por que está aqui" | A | A | A | M | M | A | A | A | **P0** |
| [F-03](#f-03) Estados e motivos | M | M | M | M | A | A | A | A | **P0** |
| [F-04](#f-04) "Revisar" fora do ciclo | M | A | A | M | B | A | B | M | **P0** (forma mínima) |
| [F-05](#f-05) Preparação e normalização | M | M | M | M | A | A | A | M | **P0** (base) |
| [F-06](#f-06) Validação e guarda de vazamento | A | M | A | M | A | M | A | B | **P0** (base) |
| [F-07](#f-07) Marcação e registro de eventos | B | M | A | A | M | M | M | M | **P1** |
| [F-08](#f-08) Filtros de manager e resumo | M | A | M | M | M | A | B | M | **P1** |
| [F-09](#f-09) Faixa da taxa-base | B | B | M | B | A | A | A | M | **P1** |
| [F-10](#f-10) Painel de carga | B | B | M | B | B | M | M | B | **P2** |
| [F-11](#f-11) Alerta de esfriamento | B | A | A | A | B | B | B | M | **P2** (bloqueado por dado) |
| [F-12](#f-12) Forecast ponderado | B | B | M | M | B | B | B | B | **P2** (fora do MVP) |
| [F-13](#f-13) Piloto com controle | B | B | A | A | M | B | A | B | **P2** (pós-MVP) |

**O que cada nível significa**

- **P0: sem isto o MVP não cumpre o briefing ou engana o usuário.** Teste de corte: se o item sair, (a) o vendedor deixa de conseguir decidir, ou (b) a ferramenta passa a induzir erro, ou (c) um requisito obrigatório do briefing deixa de ser cumprido. Basta uma resposta "sim".
- **P1: o MVP funciona e é honesto sem isto, mas com isto melhora adoção, mensurabilidade ou uso gerencial.** Custo baixo ou médio. Entra se o orçamento de 4 a 6 horas permitir. O que não for construído precisa deixar o ponto de entrada previsto na arquitetura.
- **P2: depende de dado ou decisão que não existe, tem efeito não verificável aqui, ou serve a usuário secundário sem evidência.** Fica documentado como evolução. Não é construído.

**Por que cada item caiu onde caiu**

| Item | Nível | Justificativa explícita |
| --- | --- | --- |
| [F-01](#f-01) | P0 | Sem lista não há ferramenta ([RB-01](#rb-01), [RB-04](#rb-04)). É a decisão central ([HD-01](./discovery.md#hd-01)). |
| [F-02](#f-02) | P0 | Sem o "porquê" descumpre [RB-03](#rb-03) e a lista vira um número sem contexto, que o briefing declara inútil. |
| [F-03](#f-03) | P0 | Sem estados explícitos o produto parece preciso onde não é ([RD-03](#rd-03)): 68,2% das abertas têm conta nula e 500 não têm data. |
| [F-04](#f-04) | P0 (mínimo) | Sem ela, metade do briefing (deals que não vão fechar) fica sem resposta e 1.291 deals fora do ciclo diluem a lista. **A evidência é fraca (B), então o item entra só como exibição de um fato, "idade e ciclo do produto", e não como recomendação de encerrar.** A evidência fraca limita o *tom*, não a *presença*. |
| [F-05](#f-05) | P0 (base) | Sem normalização, 1.480 linhas somem em silêncio ([RD-04](#rd-04)). O vendedor não vê, mas todas as outras dependem dela. |
| [F-06](#f-06) | P0 (base) | Sem validação e guarda de vazamento, a regra pode parecer boa por usar o futuro ([RD-02](#rd-02)), e a entrega não se diferencia de um baseline de IA ([RB-07](#rb-07)). |
| [F-07](#f-07) | P1 | O MVP funciona sem ela, mas sem registro nenhum KPI de impacto é mensurável depois ([RD-08](#rd-08)). |
| [F-08](#f-08) | P1 | Bônus do briefing ([RB-06](#rb-06)). O filtro por vendedor já está em [F-01](#f-01); aqui entram manager, escritório e resumo, sem ranking de pessoas. |
| [F-09](#f-09) | P1 | A frase mínima ("não distinguimos a chance") já está em [F-02](#f-02). A faixa numérica agrega proteção, não função. |
| [F-10](#f-10) | P2 | O efeito da carga some com controle; capacidade é desconhecida. Informação sem decisão associada. |
| [F-11](#f-11) | P2 | Depende de atividade, que não existe. Com só idade vira falso alarme ([HD-03](./discovery.md#hd-03)). |
| [F-12](#f-12) | P2 | Sem forecasts históricos nem calibração, é a decisão menos sustentada ([HD-05](./discovery.md#hd-05)). |
| [F-13](#f-13) | P2 | É processo, não tela; só faz sentido com a ferramenta em uso. |

**Se o tempo apertar, dentro do P0 corta-se profundidade, não item:** [F-06](#f-06) reduz-se a uma tabela de backtest e à checagem de proibidos; [F-02](#f-02) a frases-padrão por fator; [F-05](#f-05) a uma regra de normalização com contagem.

**De onde veio cada item P0** (procedência explícita):

| Funcionalidade | Veio do briefing | Veio dos dados | É hipótese | É escolha de projeto |
| --- | --- | --- | --- | --- |
| [F-01](#f-01) | "saiba onde focar"; filtro por vendedor | Preço ≈ valor fechado; 7 níveis | Que a regra melhore o desfecho | Valor como componente central; faixas; leitura apenas |
| [F-02](#f-02) | "entender por que"; explainability | Pesos de modelo não são acionáveis | Que explicar aumente o uso | Frases fixas por fator; só campos verificáveis |
| [F-03](#f-03) | (implícito em "dados reais") | 68,2% de conta nula; Prospecting sem data | Que o vendedor corrija o cadastro | "Não pontuável" como saída válida |
| [F-04](#f-04) | "tempo demais em deals que não vão fechar" | 1.291 acima de 138 d; AUC 0,475 a 0,571 | Que idade acima do ciclo signifique risco; incentivos | Rótulo factual, sem verbo "encerre" |
| [F-05](#f-05) | "dados reais" | `GTXPro`; rótulos; 461 linhas indistinguíveis | — | Premissas de limpeza registradas |
| [F-06](#f-06) | "scoring faz sentido?" | AUC 0,644 é vazamento; 0,47 a 0,57 legítimo | — | Critérios técnicos e baselines de [discovery 4.4.9](./discovery.md#sub-4-4-9) |

<a id="sub-1-5"></a>
### 1.5. Proposta inicial de P0 e jornada ponta a ponta

**Herda de:** prioridade P0 ([1.4](#sub-1-4)) e [discovery 4.4.2](./discovery.md#sub-4-4-2) (usuário e decisão central).

**P0 proposto:** seis funcionalidades. Quatro aparecem na jornada do vendedor ([F-01](#f-01) a [F-04](#f-04)); duas são base invisível ([F-05](#f-05) e [F-06](#f-06)).

**Usuário:** vendedor ([RE-01](#re-01)). **Momento:** segunda-feira de manhã, com a carteira aberta na frente dele. **[Hipótese]** uso semanal de poucos minutos; não houve entrevista nem observação de vendedor.

**Resultado da jornada:** o vendedor sai com uma lista curta do que abrir primeiro, com o motivo de cada uma, e sabe o que está fora do ciclo e o que está com cadastro incompleto.

| # | O que o vendedor faz e vê | Funcionalidade | Caso de borda tratado |
| --- | --- | --- | --- |
| 1 | Abre a ferramenta e escolhe o próprio nome | [F-01](#f-01) (escopo) | 8 dos 35 vendedores não têm abertas: mensagem clara, sem tela quebrada |
| 2 | Vê o resumo da carteira: total de abertas e quantas estão em "trabalhar", "revisar" e "não pontuável" (a soma fecha com o total) | [F-03](#f-03) e [F-04](#f-04) | Lista principal vazia ou curta ([Q-01](#q-01)): 6 de 27 vendedores com abertas não têm Engaging dentro do ciclo |
| 3 | Lê "Onde focar": faixas por valor em jogo; cada linha traz produto, conta (ou "sem conta"), estágio, valor de tabela (rotulado como referência), idade contra o ciclo e estado | [F-01](#f-01) | Empates dentro da faixa tratados por regra declarada |
| 4 | Abre uma oportunidade e lê "Por que está aqui", incluindo "o que não sabemos" | [F-02](#f-02) | Nenhum número de chance por deal |
| 5 | Vê o grupo "Revisar": "aberta há X dias; ciclo fechado do produto: até Y", sem rótulo de perdido | [F-04](#f-04) | Corte diferente muda as idades; o corte é visível |
| 6 | Vê o que está incompleto e o que corrigir | [F-03](#f-03) | Prospecting sem data: só valor, sem idade |
| 7 | Decide e age no CRM, fora da ferramenta | (limite declarado, [RE-03](#re-03)) | — |
| 8 | **Bastidor:** dados normalizados, campos proibidos verificados, validação publicada | [F-05](#f-05) e [F-06](#f-06) | Contagem de linhas antes e depois, em cada junção |

**Fora da jornada P0, de propósito:** marcar ação ([F-07](#f-07), P1), visão de manager ([F-08](#f-08), P1) e qualquer coisa de P2.

<a id="sub-1-6"></a>
### 1.6. Rastreabilidade: decisão → problema → requisito → funcionalidade → prioridade → evidência → critério de aceite

**Herda de:** matriz ([1.3](#sub-1-3)), prioridade ([1.4](#sub-1-4)) e requisitos ([1.2](#sub-1-2)).

Os critérios de aceite descrevem o que se observa, não como se constrói. As linhas P2 trazem a **condição de entrada** no lugar do aceite.

| Decisão do usuário | Problema | Requisito | Funcionalidade | Prioridade | Evidência | Critério de aceite |
| --- | --- | --- | --- | --- | --- | --- |
| Qual deal abrir primeiro ([HD-01](./discovery.md#hd-01)) | Critério pessoal e invisível; ~79 abertas por vendedor ([P-003](./discovery.md#p-003)) | [RB-01](#rb-01), [RB-02](#rb-02), [RB-04](#rb-04), [RD-01](#rd-01), [RD-06](#rd-06), [RE-02](#re-02) | [F-01](#f-01) | P0 | [Dados] preço ≈ valor fechado (V9); 7 níveis | **100% das abertas** do vendedor aparecem, agrupadas em faixas; o total geral das abertas é 2.089; empates têm regra declarada; roda ponta a ponta com os CSVs reais seguindo o setup |
| Seguir ou não a recomendação | Número sem contexto não é usado ([P-003](./discovery.md#p-003)) | [RB-03](#rb-03), [RE-04](#re-04), [RD-01](#rd-01), [RD-05](#rd-05) | [F-02](#f-02) | P0 | [Briefing] "Explainability ganha"; [Dados] pesos não acionáveis | 100% das oportunidades exibidas têm explicação que cita só campos verificáveis; nenhuma menciona probabilidade por deal; 4 de 5 testadores não técnicos explicam por que um deal está no topo e o que a ferramenta não sabe |
| Posso confiar no registro? ([HD-08](./discovery.md#hd-08)) | Lacunas estruturais: conta nula, Prospecting sem data ([H-005](./discovery.md#h-005)) | [RD-03](#rd-03), [RD-04](#rd-04) | [F-03](#f-03) | P0 | [Dados] 68,2% de conta nula; 500 sem data | Toda oportunidade tem exatamente um estado e um motivo quando não é "pontuável"; a contagem por estado fecha com 2.089; Prospecting não recebe idade |
| Qual deal revisar ou encerrar ([HD-02](./discovery.md#hd-02)) | Tempo em deals que não fecham ([P-001](./discovery.md#p-001)) | [RB-04](#rb-04), [RD-03](#rd-03), [RD-07](#rd-07) | [F-04](#f-04) | P0 (mínimo) | [Dados] 1.291 acima de 138 d; AUC 0,475 a 0,571 (fraca) | Toda Engaging acima da referência aparece distinguida, com idade e ciclo do produto; a ferramenta não usa "perdida" nem "encerre"; o corte é parâmetro visível e, com 2017-12-31, 1.291 caem em "revisar" |
| Quais registros entram ([HD-08](./discovery.md#hd-08)) | Joins silenciosos; rótulos errados ([H-005](./discovery.md#h-005)) | [RD-04](#rd-04), [RB-01](#rb-01) | [F-05](#f-05) | P0 (base) | [Dados] 1.480 linhas perdidas sem aviso | Relatório com linhas antes e depois de cada junção; 8.800 oportunidades e 7 produtos preservados; rótulos corrigidos listados |
| Posso defender a priorização? ([HD-07](./discovery.md#hd-07)) | Sinal fraco; vazamento tentador | [RD-02](#rd-02), [RD-09](#rd-09), [RB-05](#rb-05), [RB-07](#rb-07) | [F-06](#f-06) | P0 (base) | [Dados] AUC 0,644 é vazamento; 0,47 a 0,57 legítimo | Backtest com 5 ou mais cortes e baselines (global, por produto, aleatório, só valor); a verificação falha se campo proibido for usado; habilidade e valor separados; nenhuma frase atribui efeito à ferramenta |
| Vale padronizar e investir? ([HD-07](./discovery.md#hd-07)) | Baseline humano e adoção não mensuráveis | [RD-08](#rd-08) | [F-07](#f-07) | P1 | [Dados] [O1](./discovery.md#o1) a [O5](./discovery.md#o5) não calculáveis | Cada marcação gera registro com oportunidade, vendedor, ação e data; [O4](./discovery.md#o4) é calculável a partir do registro; baseline congelado antes do uso |
| Onde apoiar o time ([HD-04](./discovery.md#hd-04)) | Visão por relato; risco de cobrança injusta | [RB-06](#rb-06), [RD-06](#rd-06) | [F-08](#f-08) | P1 | [Briefing] bônus; [Dados] vendedores = acaso | Filtros alteram todas as contagens de forma consistente; nenhuma tela ordena pessoas por desempenho |
| Quanto confiar em "alta" | Faixa lida como probabilidade | [RD-05](#rd-05) | [F-09](#f-09) | P1 | [Dados] 63,15%; 48,2% a 71,9% | Mostra faixa, não ponto; o texto diz que não separa deals; números conferem com [discovery 4.4.8](./discovery.md#sub-4-4-8) |
| Carga ou critério? ([H-002](./discovery.md#h-002)) | Capacidade desconhecida | — | [F-10](#f-10) | P2 | [Dados] ρ = −0,007 com controle | **Entrada:** capacidade esperada por vendedor fornecida |
| Quando reativar ([HD-03](./discovery.md#hd-03)) | Esfriamento não mensurável | — | [F-11](#f-11) | P2 | [Dados] sem atividade | **Entrada:** log de atividade e histórico de estágio |
| Qual forecast comprometer ([HD-05](./discovery.md#hd-05)) | Pipeline subjetivo | — | [F-12](#f-12) | P2 | [Dados] sem forecasts históricos | **Entrada:** forecasts guardados e sinal que discrimine |
| Escalar ou abandonar | Efeito só com controle | — | [F-13](#f-13) | P2 | [Dados] [discovery 3.4](./discovery.md#sub-3-4) | **Entrada:** ferramenta em uso, baseline congelado e grupo de controle viável |

<a id="sub-1-7"></a>
### 1.7. Trade-offs

**Herda de:** [discovery 4.2](./discovery.md#sub-4-2) (o que é prioridade), [discovery 4.3](./discovery.md#sub-4-3) (restrições) e [1.4](#sub-1-4).

| ID | Escolha | O que ganhamos | O que perdemos | Por que decidimos assim | Procedência |
| --- | --- | --- | --- | --- | --- |
| <a id="to-01">TO-01</a> | Honestidade em vez de "cara de modelo" | Nenhuma promessa que os dados não sustentam | O apelo de "IA prevendo vendas" | AUC 0,47 a 0,57; o briefing diz que "pode ser simples" | [Dados], [Briefing] |
| <a id="to-02">TO-02</a> | Regra transparente em vez de modelo supervisionado | Explicação direta e prazo viável | Discriminação por deal, que os dados hoje não oferecem | Um modelo pareceria rigoroso e entregaria a taxa-base ([discovery 4.2](./discovery.md#sub-4-2)). Ponto de extensão preservado ([AR-11](./discovery.md#ar-11)) | [Dados], [Escolha] |
| <a id="to-03">TO-03</a> | Aceitar uma lista principal curta | Lista que reflete o que os dados sustentam | A sensação de "ferramenta cheia" | 298 deals dentro do ciclo, mediana de 16 entre os 21 vendedores que têm algum; encher a lista seria inventar prioridade | [Dados] (consulta direta) |
| <a id="to-04">TO-04</a> | Marcar o que passou do ciclo, em tom factual | Resposta à primeira queixa do briefing | Risco de falso positivo e de leitura como "encerre" | O único sinal disponível; contido pelo rótulo ("revisar", nunca "perdida") | [Briefing], [Hipótese] |
| <a id="to-05">TO-05</a> | Pesos e faixas assumidos como política | Transparência sobre o que é escolha | Aparência de objetividade | Os dados não aprendem pesos; alguém precisa ser dono deles ([U-06](#u-06)) | [Escolha] |
| <a id="to-06">TO-06</a> | Visão de manager só descritiva | Evita ranking de pessoas e [Goodhart](./discovery.md#g-goodhart) | Menos "controle" gerencial | Diferenças entre vendedores indistinguíveis do acaso (p = 0,26) | [Dados] |
| <a id="to-07">TO-07</a> | Registro de eventos como P1 | Cabe no orçamento de 4 a 6 horas | KPIs de impacto não nascem prontos | O contrato de dados deixa o ponto de entrada ([RD-08](#rd-08)) | [Escolha] |
| <a id="to-08">TO-08</a> | Ferramenta de leitura, sem escrever no CRM | Menos risco e menos escopo | O vendedor age em outro lugar | A decisão que melhoramos é "o que abrir", não "atualizar o CRM" | [Escolha] |

**Prioridade por probabilidade ou por valor?** Priorizar só por chance empurra para deals que fechariam sozinhos; priorizar só por valor é o que o briefing diz não bastar. Com a chance praticamente constante (~63%), o valor esperado vira monotônico no preço ([discovery 4.2](./discovery.md#sub-4-2)). Por isso o produto integra valor, posição no ciclo e completude, e declara os pesos como política ([TO-05](#to-05)).

<a id="sub-1-8"></a>
### 1.8. O que NÃO deve entrar no MVP

**Herda de:** [discovery 3.5](./discovery.md#sub-3-5) (conclusões atraentes e injustificadas), [discovery 4.2](./discovery.md#sub-4-2) e [discovery 4.3](./discovery.md#sub-4-3).

Sete abordagens rejeitadas. As duas que mais atraem por serem comuns no mercado são [RJ-01](#rj-01) e [RJ-02](#rj-02).

| ID | O que rejeitamos | Por que atrai | Por que rejeitar | Procedência | Quando reconsiderar |
| --- | --- | --- | --- | --- | --- |
| <a id="rj-01">RJ-01</a> | **Modelo supervisionado de probabilidade de ganho por deal, exibido como score ou percentual** | É o padrão de "lead scoring" e dá aparência de rigor | AUC de 0,47 a 0,57, instável entre cortes; [Brier](./discovery.md#g-brier) a ±0,003 da taxa global. Entregaria a taxa-base com cara de previsão e induziria o vendedor ao erro ([RD-01](#rd-01)) | [Dados] | Com sinais novos (atividade, histórico de estágio) e [lift](./discovery.md#g-lift) demonstrado em backtest temporal |
| <a id="rj-02">RJ-02</a> | **Usar `close_date`, mês ou fim de trimestre como sinal, ou recomendar "timing de fechamento"** | É o padrão mais forte do dataset (AUC 0,644) | É [vazamento](./discovery.md#g-vazamento): só existe depois do desfecho. Como insight de calendário, só valeria com intervenção testada ([discovery 3.5](./discovery.md#sub-3-5)) | [Dados] | Nunca como feature. Como hipótese de processo, só em piloto |
| <a id="rj-03">RJ-03</a> | **Ranking ou scorecard de vendedores; vendedor, conta ou setor como feature** | O "vendedor" parece o sinal mais forte | Sem sinal (p = 0,26; [ε²](./discovery.md#g-epsilon) = 0,0007); estimula gaming e cobrança injusta ([RD-06](#rd-06)) | [Dados] | Se houver dado que separe habilidade de território e mix |
| <a id="rj-04">RJ-04</a> | **Alertas de "esfriando" ou "reativar", e "horas perdidas"** | Aparecem nas duas queixas do briefing | Não há atividade nem esforço medido; só idade. Geraria falso alarme e causalidade inventada ([HD-03](./discovery.md#hd-03)) | [Dados] | Com log de atividade e histórico de estágio |
| <a id="rj-05">RJ-05</a> | **Forecast ponderado e ROI (R$ ou horas liberadas) na tela** | Interessa a gestores e à direção | Sem forecasts históricos, custo-hora nem margem; o ROI seria premissa apresentada como resultado | [Dados] | Com forecasts guardados, custo-hora e piloto |
| <a id="rj-06">RJ-06</a> | **Score contínuo (0 a 100) com casas decimais** | O briefing cita "score 85" | Há 7 níveis de valor e uma flag de idade: o contínuo exibiria precisão que os dados não têm ([RE-02](#re-02)) | [Dados], [Escolha] | Se surgir sinal que discrimine dentro de um mesmo produto |
| <a id="rj-07">RJ-07</a> | **Texto livre gerado por LLM como explicação ou "insight"** | Parece fácil e "inteligente" | Narrativa sem checagem inventa causalidade ([AR-10](./discovery.md#ar-10)); a explicação precisa vir de campos verificáveis ([RE-04](#re-04)) | [Escolha] | Se o texto for gerado só de campos verificados e conferido por teste |

**Adiados, não rejeitados:** escrita de volta no CRM e notificações por Slack ou e-mail (exemplos do briefing). Têm valor, mas dependem de a lista provar utilidade primeiro e ampliam o escopo além de 4 a 6 horas.

<a id="sub-1-9"></a>
### 1.9. Sinais mínimos e restrições para a arquitetura

**Herda de:** [discovery 3.3](./discovery.md#sub-3-3) (campo → pode entrar?), [discovery 4.3](./discovery.md#sub-4-3) (descoberta → consequência) e [discovery 4.4.6](./discovery.md#sub-4-4-6) (sinais válidos e inválidos).

Sem prescrever implementação: o que o produto precisa receber e respeitar para cumprir o P0.

**Sinais mínimos**

| Sinal | Papel no produto | Disponibilidade ([`A§2.7`](./data-audit.md#a-2-7)) | Cuidado |
| --- | --- | --- | --- |
| Produto normalizado e preço de tabela | Valor em jogo ([proxy](./discovery.md#g-proxy)) | 100% das abertas | Proxy validado só nos Won; função só do produto (7 níveis) |
| Estágio (Prospecting, Engaging) | Segmento; define se há idade | 100% | Filtro, não preditor |
| Data de engajamento | Idade em Engaging | Engaging 100%; Prospecting 0% | Depende da data de corte; 81% [fora do suporte](./discovery.md#g-suporte) |
| Ciclo de referência por produto | Régua para a idade | Derivável dos Won | Calculado só com fechamentos anteriores ao corte; viesado para rápidos; teto de 138 d |
| Data de corte ("hoje") | Calcula a idade | Ausente no dataset | Parâmetro; premissa 2017-12-31 |
| Completude (conta, datas) | Estado do cadastro | Mensurável | Nulo estrutural não é falha; condicionar ao estágio |
| Vendedor, manager, escritório | Escopo e filtro | 100% | Foto atual; nunca feature nem ranking |

**Restrições**

1. Nenhuma probabilidade por deal ([RD-01](#rd-01), [RD-05](#rd-05)).
2. Lista de campos proibidos com verificação automática ([RD-02](#rd-02)).
3. Toda aberta aparece em exatamente um estado e a soma fecha com 2.089 ([RD-03](#rd-03), [RD-04](#rd-04)).
4. "Hoje" e o limiar de idade parametrizados; funcionar nos dois cenários de [T-B](./discovery.md#t-b) ([RD-07](#rd-07), [AR-03](./discovery.md#ar-03)).
5. Taxa-base apenas como faixa ([RD-05](#rd-05), [AR-04](./discovery.md#ar-04)).
6. Sem ranking de pessoas ([RD-06](#rd-06), [AR-09](./discovery.md#ar-09)).
7. Explicação só com campos verificáveis ([RE-04](#re-04), [AR-10](./discovery.md#ar-10)).
8. Precisão exibida não excede a dos dados; empates declarados ([RE-02](#re-02), [AR-01](./discovery.md#ar-01)).
9. Eventos de uso ou ponto de extensão para sinais futuros ([RD-08](#rd-08), [AR-08](./discovery.md#ar-08), [AR-11](./discovery.md#ar-11)).
10. Executável com setup documentado a partir dos CSVs reais, com resultado reprodutível ([RB-01](#rb-01), [RB-05](#rb-05)).
11. Linguagem do vendedor, legível sem treinamento ([RB-04](#rb-04)).
12. Orçamento de 4 a 6 horas ([discovery 4.4.10](./discovery.md#sub-4-4-10)).

**Questões adicionais que esta seção levanta** (somam-se a [AR-01](./discovery.md#ar-01) a [AR-12](./discovery.md#ar-12))

| ID | Questão | Por que surge |
| --- | --- | --- |
| <a id="q-01">Q-01</a> | O que o vendedor vê quando a lista principal é vazia ou muito curta? | Com o corte de 2017-12-31, 298 Engaging estão dentro do ciclo; 6 dos 27 vendedores com abertas não têm nenhuma (consulta direta). Relaciona-se a [AR-03](./discovery.md#ar-03) |
| <a id="q-02">Q-02</a> | Conta nula bloqueia a pontuação ou apenas avisa? | Conta não entra no score ([discovery 4.3](./discovery.md#sub-4-3), linha 4). Tratá-la como bloqueio deixaria 68,2% das abertas fora da lista sem razão analítica. Relaciona-se a [AR-05](./discovery.md#ar-05) |
| <a id="q-03">Q-03</a> | Como nomear o grupo "Revisar" sem induzir ao encerramento? | Idade não prova abandono, e Lost pode ser penalizado ([D26](./discovery.md#d26)) |

<a id="sub-1-10"></a>
### 1.10. Quadro de incertezas

**Herda de:** [discovery 4.5](./discovery.md#sub-4-5) (incertezas que o projeto absorve), [discovery 3.7](./discovery.md#sub-3-7) (perguntas sem resposta) e [discovery 2.7](./discovery.md#sub-2-7) (conhecimento específico da empresa).

Cada incerteza diz de onde vem, o que muda no MVP e como reduzi-la. As marcadas "absorvida" já têm tratamento de projeto; as demais seguem abertas.

| ID | Incerteza | Procedência | Por que importa | Efeito no MVP | Como reduzir e quem responde | Status |
| --- | --- | --- | --- | --- | --- | --- |
| <a id="u-01">U-01</a> | O ganho sobre "ordenar por preço" é pequeno e não verificável | [Dados], [Hipótese] | É a razão de existir da ferramenta | Declarar como limitação; foco em integrar idade e cadastro, explicar e padronizar | Piloto com controle ([F-13](#f-13)); replay de políticas ([V13](./discovery.md#v13)), não executado | Aberta |
| <a id="u-02">U-02</a> | A idade acima do ciclo indica risco de perda | [Dados] AUC 0,475 a 0,571 | Sustenta o "Revisar" | Exibir como fato, nunca como veredito | Log de atividade; [T-B](./discovery.md#t-b); entrevista com a RevOps | Aberta |
| <a id="u-03">U-03</a> | Os 1.291 envelhecidos são estrutura do dataset ou acúmulo | [Dados] | Muda a leitura de "Revisar" | Flag relativa ou configurável ([AR-03](./discovery.md#ar-03)) | [T-B](./discovery.md#t-b); regra de extração | Absorvida |
| <a id="u-04">U-04</a> | A lista principal é curta e depende do corte assumido | [Dados] (consulta direta), [Escolha] | Define a utilidade percebida | "Hoje" como parâmetro; estado vazio tratado ([Q-01](#q-01)) | Data de extração real | Aberta |
| <a id="u-05">U-05</a> | O vendedor confia e muda o que faz | [Hipótese] | Sem adoção não há impacto | Explicação e linguagem simples; registro de uso ([F-07](#f-07)) | Teste de tarefa; piloto | Aberta |
| <a id="u-06">U-06</a> | Pesos e faixas são política: quem é o dono? | [Escolha] | Sem dono, a regra parece arbitrária | Pesos declarados e justificados ([AR-02](./discovery.md#ar-02)) | Head de RevOps valida a política | Aberta |
| <a id="u-07">U-07</a> | Preço de tabela ≠ valor real (desconto, valor anual) | [Dados] V9, só nos Won | Distorce o ranking por valor | Rotular como "valor de tabela" | Política de desconto da empresa | Absorvida |
| <a id="u-08">U-08</a> | O que "Lost" significa e como incentivos afetam o "revisar" | [Hipótese] ([H-003](./discovery.md#h-003), [D26](./discovery.md#d26)) | Pode inviabilizar ou distorcer o alerta | Tom factual ([Q-03](#q-03)) | Definição de Lost; plano de comissão | Aberta |
| <a id="u-09">U-09</a> | O dataset pode ser sintético e não representar a empresa | [Dados] (28,4% de fechamentos em fim de semana) | Limita qualquer generalização | Declarar como prova de conceito ([discovery 4.3](./discovery.md#sub-4-3), linha 13) | Origem do dado | Absorvida |
| <a id="u-10">U-10</a> | Uso gerencial como cobrança; gaming e feedback loop | [Hipótese] | Pode corromper o sinal e a adoção | Visão descritiva; sem ranking de pessoas ([RD-06](#rd-06)) | Acordo de uso com managers e RevOps | Aberta |

---

<a id="secao-2"></a>
## 2. Registros de decisão arquitetural (ADR)

[↑ Voltar ao índice](#indice)

> **Em linguagem simples**
>
> **O que esta seção responde:** o que decidimos construir, por que, o que rejeitamos, o que sacrificamos, como vamos verificar e quando mudaríamos de ideia.
>
> **Como está organizada:** são três decisões independentes, cada uma com sua evidência e sua condição de revisão: [ADR-001](#adr-001) (scoring), [ADR-002](#adr-002) (dados) e [ADR-003](#adr-003) (tecnologia). O [ADR-004](#adr-004) (contrato entre back e front) veio depois do build e corrige o ADR-003; o [ADR-005](#adr-005) registra o design system e a navegação; o [ADR-006](#adr-006) troca a regra de grupos (regra A) e substitui em parte o ADR-001; o [ADR-007](#adr-007) acrescenta a Inteligência comercial, que descreve o histórico sem pontuar oportunidades.
>
> **O que NÃO decide:** pesos definitivos. As faixas de valor e a ordem de desempate são **política provisória** ([U-06](#u-06)), à espera de validação da Head de RevOps.

**Herda de:** a seção 1 deste documento (requisitos, matriz, prioridade, restrições e incertezas) e de [discovery 4.5](./discovery.md#sub-4-5) ([AR-01](./discovery.md#ar-01) a [AR-12](./discovery.md#ar-12)).

**Decisões do usuário registradas (15/10/2026):** três ADRs separados; ADR no próprio `architecture.md`; scoring em faixas ordinais, sem número contínuo; desempate sem idade na chave (estado, faixa de valor, preço exato, ID estável), com a idade exibida como coluna (opção A, após a revisão adversarial); janela de resolução só como relatório exploratório; FastAPI no back-end e Next.js no front-end, com front mínimo P0; nome da estratégia "scoring multidimensional com ordenação por regras, sem eixo de potencial"; limite do ciclo de 138 d global com P90 em texto; faixas de valor como política provisória.

<a id="sub-2-0"></a>
### 2.0. Panorama: as seis perguntas, por ADR

| Pergunta | [ADR-001](#adr-001) Scoring | [ADR-002](#adr-002) Dados | [ADR-003](#adr-003) Tecnologia |
| --- | --- | --- | --- |
| **O que decidi?** | Scoring multidimensional com ordenação por regras, sem eixo de potencial: estado → faixa de valor → preço exato → ID estável (a idade é exibida, não ordena). Sem número contínuo e sem probabilidade por deal | Normalização explícita, junções validadas, "hoje" parametrizado (padrão 2017-12-31), limite de ciclo de 138 d global, e partição dos abertos em estados que somam 2.089 | Núcleo Python puro (pandas) + API FastAPI + front Next.js mínimo + CLI, com pytest e sem banco de dados |
| **Por quê?** | Só valor e higiene de cadastro têm respaldo: AUC legítimo de 0,47 a 0,57; GBM com todos os campos de 0,503; empresa e região sem sinal | `GTXPro` derruba 1.480 linhas; conta nula em 68,2% das abertas; sem data de extração; o maior sinal é vazamento | Requisito do usuário: apresentação desacoplada da lógica e ranking consultável por API. O núcleo reutilizável protege o P0 |
| **O que rejeitei?** | Pontos ponderados, segmentos estatísticos, ML, valor esperado como ranking, híbrido com modelo e uplift (no MVP) | Inner join sem normalizar, deduplicação, imputação de conta, auto-junção por conta e "hoje" real | Streamlit, HTML estático, planilha e banco de dados |
| **O que sacrifico?** | Discriminação por deal; lista "Focar" curta (298); ganho sobre "ordenar por preço" não comprovável; pesos são política | Fidelidade a uma data real de extração; resolução das 461 linhas ambíguas; enriquecimento por histórico de conta | Prazo e simplicidade: dois runtimes, mais dependências e mais risco de setup |
| **Como verifico?** | Partição = 2.089; vazamento por invariância; texto proibido; backtest de 5 cortes; teste de compreensão | Reconciliação 8.800 e 2.089; regressão do `GTXPro`; sensibilidade ao `as_of` | Instalação do zero; contrato da API; e2e nos CSVs reais |
| **Quando mudaria de ideia?** | Atividade e histórico de estágio com lift demonstrado; piloto com controle; data de extração real | Data de extração real; regra de deduplicação da empresa; fonte viva no lugar de CSV | Instalação inviável; mais de ~30 usuários ou escrita; avaliador sem Node |

---

<a id="adr-001"></a>
### ADR-001 — Estratégia de Scoring

**Status:** Proposto. **A regra de estados foi substituída em parte pelo [ADR-006](#adr-006)** (16/10/2026): Engaging passa a ter três grupos (até o P90 das ganhas, até o maior ciclo, acima dele) e a referência de ciclo por produto sai da explicação. Ordenação, faixas e o restante deste ADR continuam valendo.
**Data:** 15/10/2026

#### Contexto

Precisamos priorizar oportunidades comerciais para ajudar vendedores a decidir onde concentrar seus esforços. A decisão central é [HD-01](./discovery.md#hd-01): qual deal abrir primeiro na segunda-feira. O briefing exige scoring que **não seja só ordenar por valor** ([RB-02](#rb-02)) e que o vendedor entenda o porquê ([RB-03](#rb-03)).

A auditoria dos dados identificou:

- **[Dados]** 8.800 oportunidades; 6.711 fechadas (4.238 Won, 2.473 Lost) e 2.089 abertas (1.589 Engaging e 500 Prospecting). Taxa de ganho entre as fechadas de 63,15% (faixa de 48,2% a 71,9% com as abertas) ([`A§2.7`](./data-audit.md#a-2-7)).
- **[Dados]** Nenhum preditor legítimo supera o acaso: AUC de 0,47 a 0,57, instável entre cortes, e Brier a ±0,003 da taxa global ([`A§2.9`](./data-audit.md#a-2-9)). O maior sinal do dataset, o mês de fechamento (AUC 0,644), é [vazamento](./discovery.md#g-vazamento) ([`A§2.8`](./data-audit.md#a-2-8)).
- **[Dados]** **Sonda desta etapa:** um gradient boosting com todos os campos, validado em 5 cortes temporais, tem AUC médio de **0,503** e Brier pior que a taxa global em 0,0275. Só com os campos disponíveis nas abertas, 0,524 e Brier 0,020 pior.
- **[Dados]** **Empresa e região não têm sinal** (sonda desta etapa): escritório p = 0,60; manager p = 0,79; conta p = 0,94, com AUC de backtest de 0,462 a 0,489 e correlação de −0,19 entre a primeira e a segunda metade do período; setor p = 0,97.
- **[Dados]** O valor de uma aberta é estimável pelo preço de tabela (±20% em 95,9% dos Won), mas tem 7 níveis, função só do produto ([`A§2.10`](./data-audit.md#a-2-10)).
- **[Dados]** Não há atividade, histórico de estágio, esforço nem baseline humano. A conta é nula em 68,2% das abertas e em 0% das fechadas; Prospecting não tem nenhuma data ([`A§2.5`](./data-audit.md#a-2-5)).
- **[Dados]** 1.291 das 1.589 Engaging têm mais de 138 dias de idade, o maior ciclo fechado; 298 estão dentro (consulta direta, corte 2017-12-31).
- **[Dados]** O histórico reflete a priorização passada ([H-006](./discovery.md#h-006)); o efeito da ferramenta não é estimável com estes dados.

**Limitações da evidência:** o teste só detecta AUC acima de ~0,55 com ~900 a 1.100 casos; ausência de lift não é ausência de efeito. As sondas desta etapa ainda **não têm script no repositório** ([CP-01](#cp-01)).

#### Alternativas consideradas

Cobrem as sete famílias de scoring de vendas. O modelo de ADR sugere regras, ML e híbrida; elas correspondem a A, C e F.

##### A. Regras ponderadas (pontos por característica comercial)

- **Vantagens:** simples, explicável, sem treino.
- **Limitações:** pesos arbitrários; somar mistura eixos que não são comparáveis (preço, idade, cadastro) e exibe precisão que não existe com 7 níveis de preço ([RJ-06](#rj-06)).
- **Veredito:** rejeitada na forma de soma de pontos; a ideia de regras é mantida em E.

##### B. Scoring estatístico por segmentos (pontos por padrões históricos)

- **Vantagens:** usa o histórico; fácil de calcular.
- **Limitações:** os segmentos não têm sinal. Conta, setor e escritório com AUC de 0,46 a 0,52; a taxa por conta não persiste entre períodos (correlação −0,19); o score aprenderia ruído.
- **Veredito:** rejeitada.

##### C. Machine Learning supervisionado (propensão de ganho)

- **Vantagens:** é o padrão de mercado; scikit-learn já está no ambiente.
- **Limitações:** sem lift demonstrado (AUC médio 0,503 no GBM; 0,47 a 0,57 nas sondas da auditoria). Descompasso entre treino (conta 100% preenchida) e inferência (31,8%). 81% das Engaging fora do suporte do histórico. Pesos de modelo não são acionáveis ao vendedor ([RE-04](#re-04)). A [literatura](https://ojs.aaai.org/index.php/AAAI/article/view/9455) que mostra ganho usa logs de atividade do vendedor, que não existem aqui.
- **Veredito:** rejeitada para o MVP. Mantida como extensão ([AR-11](./discovery.md#ar-11)).

##### D. Valor esperado (valor × chance de ganho)

- **Vantagens:** é a lógica correta de pipeline ponderado quando há probabilidade calibrada.
- **Limitações:** com a chance praticamente constante (~63%), o valor esperado é monotônico no preço: um ranking por produto com outro nome ([discovery 4.2](./discovery.md#sub-4-2)).
- **Veredito:** rejeitada como critério de ranking. O valor de tabela é exibido como tal.

##### E. Scoring multidimensional com ordenação por regras, sem eixo de potencial

- **Vantagens:** separa o que tem respaldo (valor em jogo e posição no ciclo, esta só exibida) do que não tem (chance), mantém o critério explícito e declara a ordem de prioridade como política. Cada deal cai em exatamente um estado.
- **Limitações:** o topo é dominado por valor; a ordem dentro de empates é política; o ganho sobre "ordenar por preço" é pequeno e inverificável aqui ([U-01](#u-01)).
- **Veredito:** **escolhida.**

##### F. Ranking híbrido (modelo preditivo + regras)

- **Vantagens:** preserva o ponto de extensão para sinais futuros.
- **Limitações:** o componente de modelo valeria ~0,5 hoje, então o híbrido degenera em regras e carrega o custo de C.
- **Veredito:** rejeitada para o MVP. Ponto de extensão preservado ([AR-11](./discovery.md#ar-11)).

##### G. Uplift / valor incremental

- **Vantagens:** é o alvo correto em teoria: o benefício de uma intervenção, não a chance.
- **Limitações:** exige tratamento observado e grupo de controle, em geral por randomização. Não há log de atividade nem controle, e o histórico tem viés de seleção. Estimar uplift aqui seria correlação rotulada como causa ([visão geral](https://en.wikipedia.org/wiki/Uplift_modelling)).
- **Veredito:** rejeitada para o MVP e **mantida como meta**: [F-07](#f-07) (registro de ação) e [F-13](#f-13) (piloto com controle) criam os dados para estimá-la depois.

#### Decisão

**Adotamos scoring multidimensional com ordenação por regras, sem eixo de potencial.** Não há probabilidade por deal nem número contínuo: a prioridade é expressa em estados e faixas ordinais.

| Dimensão | O que mede | Insumo | Valores | Respaldo |
| --- | --- | --- | --- | --- |
| **Estado** | Onde o deal está e se dá para pontuar | `deal_stage`, `engage_date`, produto e preço | **Focar**: Engaging com idade ≤ 138 d. **Revisar**: Engaging com idade > 138 d. **Qualificar**: Prospecting (sem idade). **Não pontuável**: sem produto ou preço (0 hoje) | [RD-03](#rd-03); a partição soma 2.089 |
| **Valor em jogo** | Quanto vale se fechar | Preço de tabela do produto normalizado | **Valor de tabela alto** (≥ 3.000), **médio** (500 a 3.000), **baixo** (< 500). Política provisória. O rótulo sempre leva "de tabela" e nunca "alta/baixa" sozinho, para não ser lido como chance ou prioridade | V9 em [`A§2.10`](./data-audit.md#a-2-10) |
| **Posição no ciclo** | Proximidade do limite do ciclo observado | Idade = `as_of` − `engage_date` | **Só exibida:** define Focar ou Revisar pelo limite de 138 d, mas **não ordena** dentro do estado | AUC da idade de 0,475 a 0,571 e direção não sustentada: heurística |
| **Cadastro** | Qualidade do registro | Conta nula, datas ausentes | **Aviso único no cabeçalho**, não por linha; não altera a posição | Conta fora do score ([discovery 4.3](./discovery.md#sub-4-3), linha 4) |

**Ordenação** (política, [U-06](#u-06)): estado (Focar, Revisar, Qualificar, Não pontuável) → faixa de valor de tabela (alto, médio, baixo) → preço de tabela exato → `opportunity_id`, **só para ordem estável** (nunca entra em cálculo). **A idade não ordena:** aparece como coluna. Deals do mesmo produto e estado são **empate**: a ordem entre eles é estável, mas arbitrária, e a tela os apresenta como grupo de mesmo valor.

**Volumes com o corte de 2017-12-31** (consulta direta): Focar 298 (valor alto 123, médio 113, baixo 62), Revisar 1.291, Qualificar 500, Não pontuável 0.

**Referência de ciclo no texto:** o P90 do ciclo dos Won do produto (de 102 a 116 dias) aparece só na explicação, como contexto. O limite que define Focar e Revisar é o maior ciclo fechado global (138 d), parametrizável.

**Janela de resolução por idade:** relatório exploratório no backtest. Não ordena nem aparece ao vendedor, porque é dominada pelo calendário (taxa de 0% nos cortes de fim de trimestre).

#### Justificativa

1. **[Dados] Só valor e higiene têm respaldo** ([RD-01](#rd-01), [RD-03](#rd-03)). Por isso a decisão tem duas dimensões com respaldo e declara a terceira, a chance, como não suportada.
2. **[Briefing] Atende "não é só ordenar por valor"** ([RB-02](#rb-02)) por integrar estado, posição no ciclo e cadastro, com explicação por oportunidade ([RB-03](#rb-03)).
3. **[Dados] Faixas ordinais, não pontos:** há 7 níveis de preço e uma flag de idade; um número contínuo exibiria precisão que os dados não têm ([RE-02](#re-02), [RJ-06](#rj-06)).
4. **[Dados] Empresa e região ficam fora do cálculo:** não discriminam, não persistem no tempo e só 31,8% das abertas têm conta. Permanecem como filtros ([RD-06](#rd-06), [RB-06](#rb-06)).
5. **[Escolha] Pesos e ordem são política:** os dados não aprendem pesos. A faixa de valor segue quebras naturais do catálogo (1.096 → 3.393 e 55 → 550).
6. **[Hipótese] A idade não ordena.** A leitura "mais antigo = mais urgente" não tem suporte: AUC da idade de 0,475 a 0,571 e resolução em 30 d de 1% a 5% a partir de 120 d (sonda desta etapa, em parte efeito do teto de 138 d e do calendário). Em Focar, o mais antigo é a borda do ciclo, a poucos dias de virar Revisar. Por isso a idade é exibida e não ordena; a revisão adversarial de 15/10/2026 motivou a mudança.
7. **[Escolha] Uplift como meta:** a decisão preserva o caminho para estimá-lo ([F-07](#f-07), [F-13](#f-13)).

#### Trade-offs

**Benefícios:**

- Explicação 1:1 com campos verificáveis; nenhuma promessa que os dados não sustentam.
- Determinística e reprodutível; cabe em 4 a 6 horas.
- Não precisa ser retreinada quando o `as_of` muda; só a lista de "Focar" muda de tamanho.
- Proteção contra vazamento por construção (lista de campos permitidos).

**Limitações aceitas:**

- **Sem discriminação por deal.** Todos os deals de uma mesma faixa e estado são tratados como equivalentes, exceto pelo preço exato do produto; deals do mesmo produto e estado são empate.
- **Lista "Focar" curta e sensível ao corte:** 298 com 2017-12-31, 351 com 2017-12-27, 160 com 2018-01-31 e 34 com 2018-03-31 (consulta direta). 6 dos 27 vendedores com abertas não têm nenhum "Focar".
- **Ganho incremental sobre "ordenar por preço" pequeno e não verificável aqui** ([U-01](#u-01)).
- **Pesos são política** e precisam de dono ([U-06](#u-06)).
- **"Revisar" é heurística:** nenhum fechado passou de 138 d, então a flag não tem rótulo para validar.
- **70% de Focar é anônimo:** 209 de 298 oportunidades não têm conta (e 337 de 500 em Qualificar). A ferramenta não promete "saber quem ligar"; identifica o deal pelo ID.
- **Prospecting só é ordenado por valor.**
- **Sem esfriamento, reativação nem forecast** ([RJ-04](#rj-04), [RJ-05](#rj-05)).

#### Consequências para a implementação

- **Arquivos e componentes** (indicativo; estrutura completa em [ADR-003](#adr-003)):
  - política editável com faixas, limite, `as_of`, nomes dos grupos e textos;
  - função pura de classificação e ordenação, sem dependência de web;
  - gerador de explicação por modelo de frase, sem LLM ([RJ-07](#rj-07));
  - guarda de campos permitidos ([RD-02](#rd-02));
  - módulo de backtest.
- **Como o score é calculado:** não há número. Cada oportunidade recebe um **estado** e uma **faixa de valor**; a ordem segue a chave "estado, faixa de valor, preço exato, identificador estável". A idade é uma coluna exibida, fora da chave.
- **Como será explicado ao usuário:** quatro linhas por oportunidade, a partir de campos. Exemplo ilustrativo: "GTX Pro: valor de tabela 4.821 (alto). Aberta há 104 dias; em 90% das vendas fechadas deste produto o ciclo terminou em até 102 dias, e o maior observado foi 137. Não sabemos a chance de fechar: historicamente cerca de 63% das fechadas foram ganhas (48% a 72% contando as abertas)."
- **Identificação da linha:** toda oportunidade exibe `opportunity_id`, produto e `engage_date`; o cliente aparece quando existe. Em 70% de Focar o cliente não está registrado (209 de 298, consulta direta), então o ID é o que permite localizar o deal.
- **Aviso de conta:** um **aviso único no cabeçalho**, não por linha, porque a conta falta em 68,2% das abertas e um aviso por linha viraria ruído: "68% das abertas não têm cliente registrado neste dataset; a conta aparece apenas após o fechamento". É uma limitação do dado, não do deal.
- **Linguagem:** "Revisar" nunca vira "perdida" nem "encerre" ([Q-03](#q-03)). Estados vazios têm mensagem própria ([Q-01](#q-01)).

#### Validação

| # | Teste | Critério de aceite |
| --- | --- | --- |
| 1 | **Partição** | Cada aberta tem exatamente um estado; Focar + Revisar + Qualificar + Não pontuável = 2.089; Engaging = 1.589; Prospecting = 500; por vendedor a soma também fecha |
| 2 | **Lista de campos permitidos** | Nenhum `close_*`, ciclo, mês de fechamento, posição no arquivo nem `opportunity_id` entra no cálculo |
| 3 | **Invariância (vazamento)** | Embaralhar linhas, `opportunity_id` e o `close_value` das fechadas, ou apagar eventos posteriores ao `as_of`, não muda nenhum veredito |
| 4 | **Guarda ativa** | Injetar o mês de fechamento eleva o AUC a ~0,64 e o teste reprova |
| 5 | **Texto** | Todo número exibido é igual ao campo; ausência de "probabilidade", "perdida", "encerre", "prioridade alta", "chance alta" e "score"; "alta/média/baixa" nunca aparece sem "de tabela"; a frase "não sabemos a chance" está sempre presente |
| 6 | **Sensibilidade ao `as_of`** | 2017-12-27, 2017-12-31 e 2018-01-31 mantêm todos os invariantes e tratam lista vazia |
| 7 | **Backtest** | 5 ou mais cortes, com IC; habilidade (AUC) e valor capturado em colunas separadas; baselines: taxa global, por produto, aleatório e só valor; nenhuma frase atribui efeito à ferramenta |
| 8 | **Armadilha documentada** | Relatório mostra o modelo ingênuo com mês de fechamento (AUC ~0,64) contra o legítimo (~0,5) |
| 9 | **Exploratório** | Taxa de resolução por idade, com a ressalva de calendário (0% em 30/06 e 30/09) |
| 10 | **Compreensão** | 4 de 5 testadores não técnicos dizem por que um deal está no topo e o que a ferramenta não sabe |
| 11 | **Idade não ordena** | Embaralhar `engage_date` entre deals do mesmo estado e produto não muda a ordem; a coluna de idade é exibida em Focar e em Revisar |
| 12 | **Identificação da linha** | 100% das linhas exibem `opportunity_id`, produto e `engage_date`, inclusive as 209 de Focar sem conta; o aviso de conta aparece uma vez no cabeçalho, não por linha |

**Regra de honestidade:** um AUC próximo de 0,5 não reprova a entrega; esconder isso reprovaria.

#### Condição para revisitar a decisão

- **Existirem atividade ou histórico de estágio** e um backtest temporal em que o limite inferior do IC do AUC fique acima de 0,5 em ao menos 4 de 5 cortes, com Brier melhor que a taxa global: reavaliar C ou F.
- **Um piloto com controle** ([F-13](#f-13)) mostrar efeito, ou ausência dele: ajustar ou simplificar; reavaliar G.
- **A empresa real fornecer segmentos** (conta, região, porte) com sinal estável entre períodos: reavaliar B.
- **A data real de extração ou a definição de Lost** mudarem a leitura do ciclo: reavaliar o limite e os estados.
- **Existir evidência de que a idade discrimina** (por exemplo, atividade ou histórico de estágio mostrando resolução ou ganho por idade, sem o artefato do teto de 138 d): reintroduzir a idade como critério de desempate.
- **A Head de RevOps** discordar das faixas ou da ordem: ajustar a política, não o motor.

---

<a id="adr-002"></a>
### ADR-002 — Estratégia de Manipulação de Dados

**Status:** Proposto
**Data:** 15/10/2026

#### Contexto

O scoring ([ADR-001](#adr-001)) só é tão confiável quanto os dados que recebe. Os cinco CSVs têm estrutura sólida, mas com armadilhas que não aparecem sem verificação.

A auditoria identificou:

- **[Dados]** `GTXPro` ≠ `GTX Pro`: um inner join pelo nome original perde **1.480 linhas (16,8%)** em silêncio, inclusive 333 abertas (253 Engaging e 80 Prospecting). O mapeamento é seguro: razão `close_value`/preço de 1,0015 ([`A§2.4`](./data-audit.md#a-2-4)).
- **[Dados]** Conta nula em 68,2% das abertas e 0% das fechadas ([`A§2.5`](./data-audit.md#a-2-5)). Auto-junção por conta multiplica as linhas por 96,6 ([`A§2.4`](./data-audit.md#a-2-4)).
- **[Dados]** A falta de conta **não acompanha o avanço do estágio**: 67,4% em Prospecting e 68,5% em Engaging, e entre 61% e 90% das abertas de cada vendedor. A disponibilidade do campo depende de o deal estar aberto ou fechado, um **vazamento de disponibilidade** que a auditoria já registra.
- **[Hipótese]** A conta é preenchida **no fechamento**, ou o dataset foi construído assim (compatível com dado sintético). Só a empresa confirma; é a pergunta 2 de "informações a pedir à empresa" ([discovery 4.5](./discovery.md#sub-4-5)). Num CRM real, uma aberta costuma ter conta, então o efeito pode ser um artefato desta base.
- **[Dados]** 461 linhas abertas idênticas, exceto o `opportunity_id`, em 109 grupos. Não é possível distinguir duplicata de pouco preenchimento ([`A§2.3`](./data-audit.md#a-2-3)).
- **[Dados]** Rótulos com grafia errada (`technolgy`, `Philipines`); manager e escritório são foto atual ([`A§2.3`](./data-audit.md#a-2-3)).
- **[Dados]** Sem data de extração; nenhum fechamento antes de 2017-03-01 (truncamento à esquerda) ([`A§2.10`](./data-audit.md#a-2-10)).
- **[Dados]** `close_date`, `close_value` e ciclo são [vazamento](./discovery.md#g-vazamento) ([`A§2.8`](./data-audit.md#a-2-8)).

#### Alternativas consideradas

##### A. Junção direta pelos nomes originais

- **Vantagens:** nenhum tratamento.
- **Limitações:** perde 1.480 linhas em silêncio; é exatamente o erro que a auditoria encontrou.

##### B. Normalização explícita, junções validadas e partição em estados

- **Vantagens:** preserva as 8.800 linhas, é auditável e cada decisão de limpeza fica registrada.
- **Limitações:** o mapa de rótulos é manual; cada novo rótulo desconhecido exige decisão.
- **Veredito:** **escolhida.**

##### C. Correspondência aproximada, deduplicação e imputação automáticas

- **Vantagens:** menos trabalho manual; mais "limpo" na aparência.
- **Limitações:** deduplicar as 461 linhas poderia tirar até 352 de Prospecting sem prova de duplicidade; imputar conta inventa informação que o score nem usa.
- **Veredito:** rejeitada.

##### D. Enriquecer com histórico da conta por auto-junção

- **Vantagens:** permitiria "conta que já comprou".
- **Limitações:** multiplica linhas por 96,6; só 31,8% das abertas têm conta; exige corte temporal rigoroso; sem sinal medido.
- **Veredito:** rejeitada para o MVP.

##### E. Tratamento da data "hoje"

- **E1. Fixa em 2017-12-31 no código:** simples, mas esconde a premissa.
- **E2. Parâmetro, padrão `max(close_date)`, visível na tela:** **escolhida.**
- **E3. Data real (2026):** classificaria todas as Engaging como "Revisar".

#### Decisão

**Adotamos a alternativa B, com E2.**

1. **Normalização por mapa explícito:** `GTXPro` → `GTX Pro`. Um rótulo de produto desconhecido **falha**, em vez de descartar a linha. `technolgy` e `Philipines` são reportados e não entram no score.
2. **Junções `m:1` validadas**, com contagem de linhas antes e depois de cada passo; o total de 8.800 é verificado.
3. **As 461 linhas são mantidas**, sem deduplicar.
4. **`as_of` é parâmetro**, com padrão `max(close_date)` (2017-12-31), exibido na tela.
5. **Limite do ciclo:** o maior ciclo fechado, 138 d, global e parametrizável; P90 por produto só em texto. *Substituída pelo [ADR-006](#adr-006): dois limites globais (o P90 das ganhas e o maior ciclo), e o P90 por produto sai da tela.*
6. **Referência de ciclo** calculada apenas com fechadas de `close_date` ≤ `as_of`.
7. **Lista de campos permitidos:** estágio, produto, preço, `engage_date`, vendedor, manager, escritório e, apenas para o aviso, conta.
8. **Estados** conforme [ADR-001](#adr-001), com conta nula como **aviso único no cabeçalho** e identificação da linha por `opportunity_id` ([Q-02](#q-02)).
9. **Dados brutos somente leitura;** saídas em área separada; sem banco de dados.

#### Justificativa

1. **[Dados] O erro mais caro é o silencioso.** A junção direta some com 16,8% das linhas, incluindo a faixa de valor mais alta ([RD-04](#rd-04)).
2. **[Dados] Não há prova de duplicidade** nas 461 linhas, e deduplicar alteraria a contagem que reconcilia com a fonte ([RD-03](#rd-03)).
3. **[Dados] Conta não entra no score,** então imputá-la ou bloqueá-la não teria razão analítica (68,2% das abertas ficariam de fora).
4. **[Escolha] "Hoje" é parâmetro** porque a data real é desconhecida e a lista de "Focar" depende dela: 298, 351, 160 ou 34 ([RD-07](#rd-07), [U-04](#u-04)).
5. **[Dados] Referência calculada com `close_date` ≤ `as_of`** evita que a régua do ciclo use o futuro.

#### Trade-offs

**Benefícios:**

- Nenhuma linha some sem aviso; o total reconcilia em 8.800 e 2.089.
- Cada decisão de limpeza é rastreável e reversível.
- Os resultados são reproduzíveis a partir dos CSVs.

**Limitações aceitas:**

- O mapa de rótulos é manual.
- As 461 linhas ambíguas permanecem e podem superestimar a fila "Qualificar".
- Sem enriquecimento por histórico de conta.
- Sem data de extração real: a idade das abertas é uma premissa.
- Manager e escritório são foto atual, sem histórico.

#### Consequências para a implementação

- **Componentes:** carga e normalização; junções com asserts; referência de ciclo; classificação de estado; relatório de reconciliação.
- **Relatório de reconciliação** com contagens antes e depois de cada junção, por estado e por vendedor, e o hash dos CSVs de entrada (já registrado em [`A§7`](./data-audit.md#a-7)).
- **Parâmetros expostos:** `as_of`, limite do ciclo e faixas, no mesmo arquivo de política do [ADR-001](#adr-001).
- **Fronteira com o CRM:** somente leitura ([RE-03](#re-03)).

#### Validação

| # | Teste | Critério de aceite |
| --- | --- | --- |
| 1 | **Reconciliação das junções** | 8.800 linhas após cada junção; 0 `sales_price` nulo |
| 2 | **Regressão `GTXPro`** | Sem o mapa, o teste detecta 1.480 não casadas; com o mapa, 0 |
| 3 | **Rótulo desconhecido** | Falha explícita, nunca descarte silencioso |
| 4 | **Partição** | Estados somam 2.089, também por vendedor |
| 5 | **Sensibilidade ao `as_of`** | Focar = 351, 298, 160 e 34 em 2017-12-27, 2017-12-31, 2018-01-31 e 2018-03-31, sem erro |
| 6 | **Sem futuro** | A referência de ciclo não muda ao acrescentar um Won com `close_date` > `as_of` |
| 7 | **Determinismo** | Duas execuções geram saídas idênticas (hash) |

#### Condição para revisitar a decisão

- **A empresa informar a data real de extração** ou que o teto de 138 d é artefato: rever limite, estados e `as_of`.
- **A empresa informar a regra de deduplicação:** rever as 461 linhas.
- **Descobrir quando a conta é preenchida** e que ela tem sinal: reavaliar [ADR-001](#adr-001), alternativa B.
- **A fonte passar a ser viva** (CRM em vez de CSV): reavaliar armazenamento e carga incremental.

---

<a id="adr-003"></a>
### ADR-003 — Escolha das Tecnologias

**Status:** Proposto; o contrato entre back e front foi corrigido pelo [ADR-004](#adr-004) (16/10/2026)
**Data:** 15/10/2026

#### Contexto

O vendedor precisa abrir a ferramenta, ver o pipeline e saber onde focar ([RB-04](#rb-04)). O usuário definiu duas exigências: **apresentação desacoplada da lógica de scoring** e **consulta ao ranking por API**, com reaproveitamento de componentes Python. O orçamento do desafio é de 4 a 6 horas ([RB-01](#rb-01), [RB-05](#rb-05)).

Fatos do ambiente (verificados nesta etapa):

- **[Dados]** Python 3.9.6, com pandas 2.2.3, numpy 2.0.2, scipy 1.13.1 e scikit-learn 1.5.2 no `.venv` ([`A§7`](./data-audit.md#a-7)).
- **[Dados]** Node 22.12.0 e npm 11.5.2 disponíveis.
- **[Dados]** FastAPI, uvicorn, pydantic, pytest e Streamlit **não estão instalados** no `.venv`.
- **[Dados]** Carga e junção dos 5 CSVs levam ~0,02 s, e o volume é de 8.800 linhas.

#### Alternativas consideradas

##### A. Streamlit (Python)

- **Vantagens:** interface rápida, tudo em Python.
- **Limitações:** acopla apresentação e lógica; não expõe API de consulta; nova dependência não testada com Python 3.9.6.

##### B. HTML estático gerado por Python

- **Vantagens:** zero servidor, abre com duplo clique, setup mínimo.
- **Limitações:** sem API; o `as_of` e os filtros exigiriam regerar o arquivo; não atende à consulta ao ranking.

##### C. Planilha com fórmulas

- **Vantagens:** familiar ao vendedor.
- **Limitações:** difícil de testar e versionar; a lógica de estados e a reconciliação não cabem bem em fórmulas.

##### D. FastAPI (back-end) + Next.js (front-end), sobre núcleo Python puro

- **Vantagens:** apresentação desacoplada; ranking consultável por API; o mesmo núcleo serve API, CLI e testes; contrato de dados explícito.
- **Limitações:** dois runtimes e mais dependências; mais risco de setup do zero; é a stack mais pesada para 4 a 6 horas.
- **Veredito:** **escolhida** (decisão do usuário).

##### E. FastAPI servindo um HTML/JS simples

- **Vantagens:** mantém a API e elimina o runtime de Node.
- **Limitações:** não atende à escolha de Next.js e reduz o desacoplamento de apresentação.
- **Veredito:** é o **plano de contenção** se a instalação de Node ou do Next.js se mostrar inviável.

##### F. Armazenamento

- **F1. CSV em memória, saídas em arquivos:** **escolhida.** Um usuário, leitura.
- **F2. SQLite ou banco servido:** só se houver escrita multiusuário ([F-07](#f-07)) ou fonte viva.

#### Decisão

**Adotamos D, com F1.**

| Camada | Tecnologia | Papel | Motivo |
| --- | --- | --- | --- |
| **Núcleo** | Python 3.9 + pandas | Carga, normalização, estado, ordenação e explicação, **sem dependência de web** | Ambiente já existe; 8.800 linhas; reutilizado por API, CLI e testes |
| **API** | FastAPI (camada fina sobre o núcleo) | Consulta de vendedores, ranking, explicação e metadados (`as_of`, taxa-base) | Exigência do usuário; contrato tipado |
| **Front** | Next.js, **mínimo P0**: uma página | Escolher vendedor, resumo por estado, lista "Onde focar", "Por que está aqui", grupos "Revisar" e "Qualificar" | Exigência do usuário; escopo cortado para caber no prazo |
| **CLI** | Python, sobre o núcleo | Gera CSV por vendedor sem UI; **garante o P0 sem front** | Plano de contenção |
| **Testes** | pytest + httpx | Partição, vazamento, texto, contrato da API e e2e | Natural com FastAPI |
| **Dados** | CSV somente leitura | Fonte | Um usuário, leitura |

Filtros de manager e escritório ficam **na API**; na interface, só entram se sobrar tempo ([F-08](#f-08)).

#### Justificativa

1. **[Escolha] Exigência do usuário** de desacoplar apresentação e lógica e consultar o ranking por API, o que A, B e C não atendem.
2. **[Dados] Núcleo sem dependência de web** porque o P0 precisa funcionar mesmo se a API ou o front falharem. É o que torna a stack pesada aceitável.
3. **[Dados] Volume pequeno:** 8.800 linhas e ~0,02 s de carga dispensam banco e serviços.
4. **[Hipótese] pytest + httpx** reduzem atrito, já que as dependências de FastAPI precisam ser instaladas de qualquer forma.
5. **[Escolha] Front mínimo** porque o critério do briefing é "o vendedor decide", não "o dashboard é completo".

#### Trade-offs

**Benefícios:**

- Lógica testável sem navegador; API reutilizável por outros consumidores.
- Apresentação trocável sem tocar no scoring.
- CLI como rede de segurança.

**Limitações aceitas:**

- **Setup mais longo e mais frágil:** dois runtimes e dependências não instaladas hoje ([RB-01](#rb-01)).
- **Risco de compatibilidade** entre FastAPI/pydantic e Python 3.9.6, que não foi testada.
- **Mais tempo de integração** (CORS, dois processos) para um ganho que o vendedor não vê.
- **Interface sem escrita:** o vendedor age no CRM, fora da ferramenta ([RE-03](#re-03)).

#### Consequências para a implementação

Estrutura **indicativa** em `solution/`:

- `leadscorer/`: núcleo (carga, normalização, referência de ciclo, estado, ordenação, explicação, guarda de campos, backtest, política editável, CLI);
- `api/`: aplicação FastAPI fina, com modelos de resposta;
- `web/`: aplicação Next.js (uma página);
- `tests/`: partição, vazamento, texto, API e e2e;
- `requirements.txt` com versões fixadas e `package.json` com `lockfile`;
- `README.md` com setup em dois comandos, lógica e limitações ([RB-05](#rb-05)).

**Primeira tarefa da implementação:** instalar as dependências em um `venv` limpo e confirmar a compatibilidade com Python 3.9.6, antes de escrever código.

**Ordem de corte se o tempo apertar:** front (volta ao plano E) → filtros na interface → marcações; o núcleo, a API e os testes não são cortados.

#### Validação

| # | Teste | Critério de aceite |
| --- | --- | --- |
| 1 | **Setup do zero** | Em `venv` limpo e `npm install`, seguindo o README, API e front sobem |
| 2 | **Contrato da API** | Resposta do ranking por vendedor contém estado, faixa, idade e explicação; soma dos estados = total do vendedor |
| 3 | **Reconciliação via API** | O total das abertas é 2.089 |
| 4 | **Independência do núcleo** | A CLI gera o mesmo resultado que a API para o mesmo `as_of` |
| 5 | **Front** | Um testador não técnico escolhe o vendedor e nomeia 3 deals e o porquê em até 2 minutos |
| 6 | **Plano de contenção** | A CLI entrega o P0 sem Node |

#### Condição para revisitar a decisão

- **Instalar FastAPI ou Next.js for inviável** com Python 3.9.6 ou Node 22 em tempo razoável: cair para E (FastAPI servindo HTML) ou B.
- **Mais de ~30 vendedores** usando ou necessidade de escrita (marcações): migrar para banco e autenticação.
- **O avaliador não tiver Node:** servir o front pré-compilado pela própria API.
- **A fonte passar a ser o CRM vivo:** reavaliar a camada de dados.

---

<a id="adr-004"></a>
### ADR-004 — Contrato orientado a dados entre back e front

**Status:** Aceito e implementado (fases F1 a F5 do plano do contrato). Corrige o [ADR-003](#adr-003) no que ele previa como "contrato tipado".
**Data:** 16/10/2026

#### Contexto

O [ADR-003](#adr-003) pedia apresentação desacoplada da lógica e um contrato tipado. O build entregou outra coisa:

- **[Código] Payload com texto de tela.** O payload trazia frases prontas em pt-BR: nomes dos grupos, as frases do "por que está aqui", próximo passo, legenda, avisos e mensagens de vazio.
- **[Código] Sem schema de resposta.** As rotas devolviam `Dict[str, Any]`, então o `/docs` não descrevia o formato e o front não tinha tipos para gerar nem para validar.
- **[Código] Front preso ao back.** Qualquer mudança de texto exigia mudar Python e testes de frase exata, e um time de front não conseguia evoluir a tela sozinho.
- **[Dados] Frases que diziam mais do que a regra.** Duas frases afirmavam mais do que a regra decidia:
  - "Qualificar porque ainda não tem data de engajamento", quando a regra é o estágio Prospecting;
  - "isso não diferencia uma da outra", quando a idade diferencia os grupos no backtest corrigido.

#### Alternativas consideradas

##### A. Manter o texto no núcleo

- **Vantagens:** a frase e a regra ficam juntas, e a CLI e a tela mostram o mesmo texto.
- **Limitações:** o back decide a experiência de uso; o front não evolui sozinho; não há contrato tipado.

##### B. Códigos e números no back, texto no front e na CLI

- **Vantagens:**
  - cada lado tem sua responsabilidade;
  - o front gera tipos e validação do contrato;
  - a garantia de honestidade fica onde dá para provar: o back testa que o código cita o que decidiu, e quem apresenta testa que a frase só usa os valores do código.
- **Limitações:** dois catálogos de texto (tela e CLI) e mais arquivos gerados.
- **Veredito:** **escolhida**.

##### C. Camada BFF no servidor do Next, dona dos textos

- **Vantagens:** mais limpa para times grandes.
- **Limitações:** mais uma camada para um MVP de uma página.

##### D. Catálogo de textos único, lido pela tela e pela CLI

- **Vantagens:** uma fonte só de texto.
- **Limitações:** acopla de novo o front a um arquivo do back; os públicos (vendedor na tela, operador no terminal) são diferentes.

#### Decisão

**Adotamos B.**

| Responsabilidade | Dono | Como |
| --- | --- | --- |
| Grupo de cada oportunidade e ordem (dos grupos e dentro deles) | Back | `group`, a ordem dos itens e `ordering` (critérios como dado) |
| Motivos da posição | Back | `reasons: [{code, role, params}]`; `role` diz se o motivo decidiu o grupo, a ordem ou é só contexto |
| Ação sugerida e grupo indicado quando o primeiro está vazio | Back | `next_action` e `empty`, como código com parâmetros |
| Números e cálculos | Back | Inclusive derivados; o front não calcula valor de negócio |
| Erros | Back | `{code, params, detail}`; o `detail` é a mensagem para quem opera |
| Nomes, frases, formatação, layout, abas, filtros | Front e CLI | `web/copy/pt-BR.ts` e `leadscorer/cli_text.py` |

**Artefatos do contrato:**

| Artefato | Onde | Papel |
| --- | --- | --- |
| Códigos | `leadscorer/codes.py` | Fonte dos códigos do contrato |
| Modelos de resposta | `api/schemas.py` (pydantic) | Proíbem campos extras e usam uniões discriminadas por `code` |
| Snapshot do contrato | `web/contract/openapi.json` | Gerado por `scripts/export_openapi.py` |
| Tipos e validação do front | `web/lib/contract/` (TypeScript e zod) | Gerados por `npm run contract` |
| Respostas sintéticas | `web/tests/fixtures/` | Geradas por `scripts/export_fixtures.py` |

**Versões do contrato:**
- **Versão 2:** os códigos foram acrescentados ao lado dos textos.
- **Versão 3:** os textos saíram do payload.
- **Versão 4** (16/10/2026, para as páginas da [ADR-005](#adr-005)):
  - `GET /api/evidence`: o resultado de `scripts/backtest.py` em código e número, sem a armadilha de vazamento. Responde mesmo sem os CSVs; resultado ausente ou inválido dá 503 com `evidence_unavailable`.
  - `GET /api/rules`: a política como dado (`meta`, `ordering` e faixas de valor de tabela).
  - `by_seller` em `/api/pipeline`: o resumo de cada vendedor do filtro, inclusive quem tem zero abertas, em ordem alfabética.
  - A mudança é aditiva no back. O front exige a versão 4 e mostra erro de contrato contra uma API antiga.
- **Versão 5** (16/10/2026, para a regra A do [ADR-006](#adr-006)):
  - grupo `acompanhar`; `meta.won_cycle_limit_days` (L1) ao lado de `cycle_limit_days` (L2);
  - motivos de grupo `age_within_won_cycle`, `age_above_won_cycle` e `age_above_cycle_limit`; cada item tem exatamente dois motivos (grupo e ordem). Saem os motivos de contexto, o papel `context`, `meta.cycle_references`, `meta.min_cases` e `meta.base_rate`;
  - ação `check_progress`; `start_with_group` leva os dois limites; erro `no_won_history` (503);
  - estratégias com nomes que descrevem a regra (`age_p90_then_max_cycle`, `age_max_cycle_only`); `evidence.reference` é a servida, o resultado traz o carimbo `design.served_rule` (outra regra dá 503) e `without_no_outcome_verdict` diz, em código, como a regra servida fica sem as negociações que nunca fecham.
  - A mudança quebra o contrato: back, CLI e tela mudam juntos.
- **Versão 6** (17/10/2026, para a Inteligência do [ADR-007](#adr-007)):
  - `GET /api/intelligence`: histórico, carteira aberta (o mesmo `Summary` da Equipe), diagnósticos e descobertas em uniões por `code`, um recorte por dimensão com teste de acaso e decomposição, mix vendedor × produto, faixas de ciclo e ritmo mensal;
  - `GET /api/intelligence/deals`: as negociações por trás de um número, por desfecho (`won`, `lost`, `open`) e, nas abertas, por grupo;
  - todo parâmetro chega como texto e é validado no núcleo (`invalid_parameter`, 422); `data_bad_number` (503) para `close_value` ou receita do cliente inválidos;
  - a carga passa a exigir `close_value` e, em `accounts`, setor, receita e sede. A classificação continua sem enxergá-los.
- **Versão 7** (17/10/2026, para a orientação de verificação do [ADR-008](#adr-008)):
  - `next_action.code` passa a ser `check_status` (Focar), `check_progress`, `confirm_still_active` e `check_prospecting`; saem `work_highest_list_price_first` e `advance_prospecting`;
  - os três primeiros levam `params.has_account` (a conta está registrada?), nulo na ação do grupo;
  - `meta.won_cycle_median_days`: mediana do ciclo das ganhas até o `as_of`, só contexto da idade (não decide grupo nem ordem).

O campo `meta.contract_version` informa qual é a versão em uso.

**Regras de fronteira:**
1. O front formata e escolhe o que mostrar, mas não calcula valores de negócio. Um número novo na tela vem do back como campo.
2. A frase não afirma mais do que o código diz. O significado de cada código fica na descrição do schema.
3. O front tolera campo novo (mudança aditiva) e recusa código ou tipo desconhecido, mostrando uma mensagem de erro em vez de uma tela quebrada.

#### Justificativa

1. **[Escolha] Fronteira definida pelo usuário:** a apresentação é do front; a entrega dos dados segundo a regra é do back.
2. **[Código] Honestidade testável nos dois lados:**
   - o back garante que cada motivo de grupo e de ordem cita exatamente os valores que decidiram, nos 2.089 itens;
   - os catálogos garantem que todo número da frase vem desses valores e que nenhum termo proibido aparece.
3. **[Código] O núcleo Python continua necessário:** a regra servida é a mesma que o backtest avalia (`scripts/backtest.py` importa o núcleo), e a lógica é de dados (pandas).

#### Trade-offs

**Benefícios:**

- O front muda textos e layout sem tocar no back.
- Tipos gerados do contrato.
- Erro de contrato visível.
- A CLI deixa de depender de campos de texto.

**Limitações aceitas:**

- **Dois catálogos de texto:** cada um tem seu teste de vocabulário e de cobertura de códigos.
- **Três artefatos gerados a manter atualizados:** snapshot, fixtures e `lib/contract`. Testes nos dois lados falham quando ficam velhos.
- **Ferramentas do front fixadas para Node 22.12:** Vite 7, jsdom 28 e `@hey-api/openapi-ts` 0.95.

#### Consequências para a implementação

- **Núcleo:**
  - `explain.py` emite só códigos;
  - `policy.py` não tem texto de tela;
  - os estados são as próprias chaves (`focar` … `nao_pontuavel`);
  - as etapas de junção usam chaves, e os rótulos estão na CLI.
- **API:** `response_model` nas quatro rotas, com corpo de erro único.
- **Front:**
  - TypeScript;
  - cliente que valida cada resposta (`lib/api.ts`);
  - catálogo com `switch` exaustivos, de modo que um código novo sem texto falha o `typecheck`.
- **CLI:** `cli_text.py` monta `list`, `explain` e `check-data`. A saída de `list` ficou idêntica byte a byte à anterior, e a de `explain` mudou só nas duas frases corrigidas.

#### Validação

| # | Teste | Onde |
| --- | --- | --- |
| 1 | O snapshot e as respostas sintéticas estão atualizados; toda rota responde com modelo tipado, sem objeto solto | `tests/test_contract.py` |
| 2 | O payload não traz nenhum campo de texto pronto | `tests/test_contract.py` |
| 3 | Os motivos de grupo e de ordem citam os valores que decidiram; nenhum desfecho entra no que decide; `ordering` descreve a ordem real | `tests/test_codes.py` |
| 4 | O núcleo e o schema listam os mesmos códigos; todo erro do núcleo tem código do contrato | `tests/test_codes.py` |
| 5 | Todo código tem texto na CLI; vocabulário; números só dos parâmetros | `tests/test_cli_text.py` |
| 6 | As respostas passam na validação gerada; código desconhecido é recusado; `lib/contract` está atualizado | `web/tests/contract.test.ts` |
| 7 | Todo código tem texto na tela; vocabulário; números só dos parâmetros; textos de referência | `web/tests/copy.test.ts` |
| 8 | A tela renderiza lista, painel e vazios; resposta fora do contrato e erro da API viram mensagem | `web/tests/render.test.tsx` |
| 9 | Versão 4: a evidência bate com o backtest, sem a armadilha e sem depender dos CSVs; as regras são a política; `by_seller` é alfabético e soma o `summary` | `tests/test_evidence.py`, `tests/test_views.py` |

#### Condição para revisitar a decisão

- **Mais de um front ou um time grande de front:** considerar uma camada BFF (alternativa C).
- **A CLI deixar de ser usada:** remover `cli_text.py`.
- **Necessidade de idiomas:** os catálogos viram arquivos por idioma.

---

<a id="adr-005"></a>
### ADR-005: Design system Rankio e navegação entre páginas

**Status:** Aceito em 16/10/2026. Os tokens e os padrões foram definidos antes da implementação e estão em [design-system.md](./design-system.md).
**Data:** 16/10/2026

#### Contexto

- **[Código] Página única com CSS próprio:** grupos em `<details>` colapsáveis, sem identidade visual e sem componentes reutilizáveis.
- **[Uso] O "abre e fecha" escondia o ponto de partida.** O vendedor precisava abrir seções para descobrir por onde começar, e Focar vazio (6 vendedores) ficava a um clique de distância do grupo indicado.
- **[Produto] A Head de RevOps não tinha onde decidir.** A API já filtrava por manager e escritório, mas nenhuma tela usava isso, e a evidência do backtest só existia em Markdown.
- **[Escolha] Decisões do usuário:**
  - marca Rankio, com a paleta da peça de marca no escuro e um claro com o mesmo lilás;
  - componentes só do shadcn;
  - abas no lugar das seções colapsáveis;
  - navegação central entre páginas, sem sidebar.

#### Alternativas consideradas

##### A. Manter o CSS próprio e trocar só cores e seções

- **Vantagens:** nenhuma dependência nova.
- **Limitações:** cada componente novo (combobox, sheet, abas acessíveis) seria escrito à mão, e a consistência dependeria de disciplina.

##### B. shadcn (Radix + Tailwind v4) com tokens próprios

- **Vantagens:**
  - primitivos acessíveis (teclado, foco, ARIA) já prontos;
  - o código fica no repositório, então pode ser lido e testado;
  - os tokens vivem num só arquivo.
- **Limitações:** Tailwind e Radix entram como dependências; há binários nativos (`lightningcss`, `oxide`); o jsdom precisa de polyfills nos testes.
- **Veredito:** **escolhida**.

##### C. Biblioteca fechada (MUI, Chakra)

- **Vantagens:** muitos componentes.
- **Limitações:** tema mais difícil de alinhar à marca; componentes fora do repositório; contraria a decisão de usar shadcn.

#### Decisão

**Adotamos B**, com quatro regras:

1. **shadcn primeiro.** Primitivos em `components/ui/`, gerados pela CLI. Composições do produto em `components/<domínio>/`, montadas só com eles.
2. **Tokens em hex** em `app/globals.css`: claro em `:root` e escuro em `.dark`, com contraste AA medido.
3. **Navegação central entre páginas,** sem sidebar. `lib/nav.ts` é a fonte única dos itens do menu.

   | Rota | Para quem | Pergunta |
   | --- | --- | --- |
   | `/carteira` | Vendedor | Qual é o meu próximo passo? |
   | `/equipe` | Gestor e RevOps | Onde está a carteira da equipe? |
   | `/inteligencia` | RevOps e gestor | Onde o processo pode melhorar e o que explica a receita? ([ADR-007](#adr-007)) |
   | `/evidencia` | RevOps | A lista ajuda a escolher onde investir? |
   | `/como-funciona` | Todos | Como a lista é montada? |

4. **O front compõe, não calcula** ([ADR-004](#adr-004)):
   - o cartão "O que verificar agora" (antes "Seu próximo passo") mostra o primeiro bloco da ordem do back (o empate inteiro, sem eleger um ID);
   - a aba inicial é o grupo por onde começar, vindo de `start_with_group`;
   - os números das páginas Equipe, Evidência e Como funciona vêm da API (contrato v4).

#### Trade-offs

**Benefícios:**
- Componentes acessíveis.
- Consistência visual garantida por teste.
- Páginas novas sem mudar o layout.
- Claro e escuro saem dos mesmos tokens.

**Limitações aceitas:**
- **Mais dependências no front:**
  - fixadas em versão exata, publicadas há pelo menos 14 dias;
  - a CLI do shadcn não entra (só via `npx`);
  - o CSS de que os primitivos dependem fica copiado em `app/shadcn.css`.
- **O jsdom precisa de polyfills para o Radix:** ficam em `tests/setup.ts`.
- **A sheet cobre parte da lista:** Anterior e Próxima permitem percorrer a lista sem fechá-la.

#### Validação

| # | Teste | Onde |
| --- | --- | --- |
| 1 | Contraste AA dos pares de texto, nos dois temas | `web/tests/tokens.test.ts` |
| 2 | Composições sem HTML cru que tenha equivalente shadcn, sem cor literal e sem `style` | `web/tests/design-system.test.ts` |
| 3 | Navegação: os cinco links (Inteligência entre Equipe e Evidência, [ADR-007](#adr-007)) e `aria-current` na página ativa | `web/tests/render.test.tsx` |
| 4 | Carteira: cartão de próximo passo, aba inicial, sheet por `role` e estados vazios | `web/tests/render.test.tsx` |
| 5 | Nenhuma página rola na horizontal em 375 px | Roteiro no navegador ([PRD](./prd.md)) |

#### Condição para revisitar a decisão

- **Mais de seis páginas, ou páginas por perfil:** reavaliar o menu (agrupar itens ou criar um menu por perfil).
- **Marca com design system corporativo próprio:** trocar os tokens, mantendo os primitivos.

---

<a id="adr-006"></a>
### ADR-006: Regra A — dois limites de idade para as negociações em andamento

**Status:** Aceito em 16/10/2026. Substitui em parte o [ADR-001](#adr-001) (a regra de estados) e a decisão 5 do [ADR-002](#adr-002).
**Data:** 16/10/2026

#### Contexto

- **[Dados] A regra do ADR-001 tinha um corte só, no maior ciclo fechado (138 d).** Focar juntava negociações de 10 e de 130 dias e ordenava só por preço, então uma negociação velha e cara ficava no topo, à frente de uma recente.
- **[Dados] A tela contradizia a si mesma:** 140 das 298 em Focar já tinham passado do P90 do ciclo do próprio produto, que a explicação mostrava como contexto.
- **[Backtest] As duas regras por idade dependem das negociações que nunca recebem desfecho.** Sem elas, a regra de 138 d empata com "só preço" (é idêntica a ele, porque nenhuma fechada passou de 138 d) e a regra A fica 1,0 pp atrás.
- **[Dados] Dentro de cada faixa de idade, o produto não muda a chance de ganhar** (permutação estratificada, p = 0,82); trocar "preço" por "taxa do produto × preço" não muda nenhuma das 180 listas top-10.

#### Alternativas consideradas

| Alternativa | Val@10 com / sem as que nunca fecham | Por que não (ou por que sim) |
| --- | --- | --- |
| Manter 138 d | 56,9% / 79,1% | Um caso extremo como limite; contradiz a referência que a tela mostra |
| Só preço | 53,8% / 79,1% | Ignora o único sinal que separa ganho nesta base |
| Limite fixo (90 a 120 d) | 58,0% a 59,3% / — | Escolhido olhando o teste; no walk-forward rende 55,8% |
| **Regra A: P90 das ganhas em T → maior ciclo → preço** | **58,4% / 78,1%** | Calculada só com o passado, dentro do platô de 100 a 120 d, e nenhum limite escolhido fora da amostra a supera (56,3%) |

#### Decisão

- **Dois limites, os dois só com fechadas até o `as_of`:** L1 = piso do P90 linear do ciclo das ganhas (106 d), um número para todos os produtos; L2 = maior ciclo fechado (138 d).
- **Grupos:** `focar` (idade ≤ L1, 157), `acompanhar` (L1 < idade ≤ L2, 141), `revisar` (> L2, 1.291), `qualificar` (Prospecting, 500), `nao_pontuavel` (0). Prospecting continua depois das Engaging: o backtest não o avalia, então a posição dele não muda.
- **A ordem dentro do grupo continua por faixa e preço;** sem peso por produto.
- **Fonte única:** `triage.engaging_group` decide o grupo; `classify` e o backtest a chamam.
- **Explicação:** só o que decidiu (grupo e ordem), com os limites como fato do histórico, nunca como prazo. Nomes na tela: Focar, Qualificar, Acompanhar, Confirmar e Completar (ordem do ADR-009).
- **Sem venda ganha até o `as_of`:** erro `no_won_history`, em vez de um limite inventado.

#### Consequências

- **O ganho é condicional e pequeno:** +1,5 pp de Val@10 (IC +0,2 a +2,7) e +1,7 pp de P@10 contra a regra anterior, cerca de 0,18 venda a mais por lista de 10 a cada 90 dias. Sem as que nunca fecham, "só preço" fica 1,0 pp à frente (IC +0,3 a +1,9). A Evidência mostra essa conclusão, calculada pelo back.
- **No pior caso, perde menos que a regra anterior:** −1,0 pp contra −1,5 pp.
- **Mais vendedores sem Focar:** 10 dos 27 com Engaging (antes, 6); o cartão leva para Acompanhar (4) ou Confirmar (6).
- **Com dados parados, Focar esvazia mais rápido:** 84 em 31/01/2018 e 9 em 31/03/2018 (antes, 160 e 34).
- **Contrato v5** ([ADR-004](#adr-004)): back, CLI e tela mudam juntos.

#### Validação

| # | O que verificar | Como |
| --- | --- | --- |
| 1 | Fronteiras: L1, L1 + 1, L2, L2 + 1 e o piso do P90 | `tests/test_triage.py` (dados sintéticos com L1 = 100 exato) |
| 2 | Os dois motivos reconstroem o grupo e a ordem dos 2.089 itens | `tests/test_codes.py` |
| 3 | Núcleo, API, CLI, carteira da equipe, detalhe e regras servem a mesma lista | `tests/test_views.py`, `tests/test_api.py` |
| 4 | O backtest reproduz a ordem servida em cada um dos 7 cortes | `tests/test_backtest.py` |
| 5 | A evidência traz o carimbo da regra servida e o veredito | `tests/test_evidence.py` |
| 6 | A tela segue a ordem de grupos da API e nenhum componente escreve uma chave de grupo | `web/tests/policy.test.ts` |

#### Condição para revisitar a decisão

- **Dados reais com atividade:** testar se a idade continua separando ganho sem as negociações que nunca fecham; se não separar, voltar a "só preço" dentro de Engaging.
- **Produção:** trocar L2 (um caso extremo) por um quantil robusto ou por uma política definida com a RevOps.
- **Piloto com grupo de controle:** é o que mede se trabalhar a lista muda o resultado.
- **Teste de compreensão dos nomes** com 3 a 5 vendedores leigos.

---

<a id="adr-007"></a>
### ADR-007: Inteligência comercial descritiva

**Status:** Aceito em 17/10/2026. Acrescenta uma página; não muda a regra da lista ([ADR-006](#adr-006)).
**Data:** 17/10/2026

#### Contexto

- **[Briefing] A Head de RevOps precisa ver onde o processo falha,** não só a lista de cada vendedor. A Equipe mostra a carteira aberta; nenhuma página mostra o histórico.
- **[Dados] A taxa de ganho é igual em todo recorte:** produto (p = 0,37), vendedor (0,26), gerente (0,79), escritório (0,60), setor (0,97), cliente (0,94) e porte (0,14). Nenhuma diferença se repete entre semestres (correlação de 0,12 por vendedor e 0,00 por vendedor × produto).
- **[Dados] A receita varia por volume e mix, não por conversão:** entre vendedores, 61,5% da diferença vem do volume, 39,9% do ticket e quase nada da taxa; entre produtos, 89,6% do ticket; entre portes de cliente, 76,0% do volume.
- **[Dados] As alavancas visíveis são de processo:**
  - 1.291 das 1.589 negociações em andamento estão abertas há mais de 138 dias;
  - 1.425 das 2.089 abertas não têm cliente, contra 0 das 6.711 fechadas;
  - as 500 em prospecção não têm data;
  - 5 dos 35 vendedores não têm nenhuma oportunidade;
  - a entrada caiu para 283 e 121 em nov e dez/2017, contra 864,6 por mês de jun a out;
  - cada cliente teve fechadas com 10 vendedores (mediana).
- **[Dados] O que não dá para mostrar:**
  - venda cruzada: 73 dos 85 clientes já compraram 6 dos 7 produtos;
  - comparação entre períodos: o 1º trimestre só tem março, e o último mês de cada trimestre tem 80,7% de ganho contra 52,3% nos outros, o vazamento da [RJ-02](#rj-02);
  - região do cliente: 84% das sedes são nos Estados Unidos.

#### Alternativas consideradas

| Alternativa | Por que não (ou por que sim) |
| --- | --- |
| Só a Equipe | Não mostra o histórico nem as falhas de processo |
| Painel de BI com rankings | Rankings de pessoas violam a [RD-06](#rd-06) e a [RJ-03](#rj-03), e taxas sem n e sem teste de acaso levam a conclusões que os dados não sustentam |
| Texto gerado por LLM | Não é verificável nem reproduzível ([RJ-07](#rj-07)) |
| **Regras determinísticas em código e params, texto no catálogo** | Escolhida: cada frase vem de um código testável, e todo número vem do payload ([ADR-004](#adr-004)) |

#### Decisão

1. **Descreve, não prevê.** `leadscorer/intelligence.py` é uma função pura sobre o `Dataset`. Nada entra na classificação; as abertas vêm de `triage.classify` com o recorte de `views.scope`, o mesmo da Equipe.
2. **Toda taxa leva o n, a faixa provável (Wilson 95%) e o veredito de acaso:** qui-quadrado nos segmentos com pelo menos 20 fechadas, com α = 0,05 ÷ 7 dimensões (Bonferroni, família fixa).
3. **A decomposição da receita** (volume × taxa × ticket) vem pela variância do log, com pelo menos 4 segmentos, e só no nível da dimensão.
4. **Pessoas:** vendedor, gerente e escritório em ordem alfabética, sem gráfico e sem índice por pessoa. A matriz vendedor × produto mostra fechadas e a fatia do mix, nunca a taxa por célula.
5. **Realizado e valor de tabela nunca se somam:** modelos e cartões separados.
6. **Diagnósticos e descobertas** aparecem só quando a regra vale no recorte; os limites ficam em `policy.py`. O padrão de fim de trimestre aparece só como conferência do registro, nunca como sinal.
7. **Sem filtro de período, sem matriz de venda cruzada e sem sede do cliente como filtro** (contexto acima).
8. **Números antes do texto:** o corpo da página só tem números, gráficos e tabelas; os filtros ficam num botão, e os diagnósticos, as descobertas e as definições ficam em painéis laterais ("Ver análises" e "Como funciona").

#### Trade-offs

- **Ganha-se** uma visão de processo verificável, que não contradiz a lista nem a [RD-06](#rd-06).
- **Perde-se** o "quem vende mais" que um painel comum mostraria em primeiro lugar. A decomposição mostra por que essa leitura engana nesta base.
- **A carga fica mais exigente:** sem `close_value`, setor, receita ou sede, nenhuma página carrega ([ADR-002](#adr-002), nenhuma lista parcial).

#### Validação

| # | Teste | Onde |
| --- | --- | --- |
| 1 | Oráculos reais: KPIs, diagnósticos, descobertas, p-valores, decomposições e faixas | `tests/test_intelligence.py` |
| 2 | Abertas iguais às da Equipe em todo gerente e escritório e em qualquer `as_of` | `tests/test_intelligence.py`, `web/tests/policy.test.ts` |
| 3 | Somas que fecham: segmentos, matriz, faixas, meses e detalhamento | `tests/test_intelligence.py` |
| 4 | Toda regra e veredito disparam na base sintética rica | `tests/test_intelligence.py`, `web/tests/copy.test.ts` |
| 5 | Texto só com números dos params, sem jargão e sem termo proibido | `web/tests/copy.test.ts` |
| 6 | API = núcleo; contrato v6 | `tests/test_api.py`, `tests/test_contract.py`, `web/tests/contract.test.ts` |

#### Condição para revisitar a decisão

- **Dados com atividade, motivo de perda ou histórico de estágio:** entram como diagnósticos e como dimensões.
- **Dado que separe habilidade de território e mix:** só então rever a [RJ-03](#rj-03).
- **Histórico de vários anos:** coortes por mês de engajamento, com aviso de censura, no lugar do filtro de período.
- **Base grande:** paginação no servidor e exportação.

---

<a id="adr-008"></a>
### ADR-008: Orientação de verificação, conta neutra e contexto da idade

**Status:** Aceito em 17/10/2026. Não muda a regra da lista ([ADR-006](#adr-006)): grupos, ordem e backtest ficam como estão.
**Data:** 17/10/2026

#### Contexto

- **[Teste de personas] Os seis perfis chegaram ao painel sem ajuda,** mas o "próximo passo" de Focar era a regra de ordenação repetida, e o vendedor iniciante (Boris) criou a própria regra para decidir: cliente nomeado e idade perto do limite. A causa não é a regra dele ser melhor, e sim a ferramenta não trazer dado para diferenciar oportunidades do mesmo grupo e produto.
- **[Dados] A base não registra atividades, estágio nem contatos.** Qualquer "ação comercial" (retomar o contato, marcar reunião) presumiria algo que não vemos.
- **[Dados] A conta nunca falta nas fechadas** (4.238 ganhas e 2.473 sem venda) e falta em 69% das abertas. Sem variação nas fechadas, não há como testar se ter conta indica proximidade do fechamento. Nas abertas, ter conta não se relaciona com a idade (mediana de 165 d com conta e 164 d sem; Mann-Whitney p = 0,32; 29%, 31% e 32% nas três faixas de idade), com o vendedor (qui-quadrado p = 0,55; V de Cramér 0,11) nem com o escritório (32,7%, 31,6% e 30,8%).
- **[Dados] Não há evidência de que 102 dias merecem mais atenção que 12.** O backtest só mostra que ordenar por idade ("mais recentes primeiro", 26,6%) rende bem menos que a regra servida (58,4%).

#### Decisão

- **Orientação de verificação, não de ação.** O "próximo passo" vira "O que verificar agora": uma consulta ao CRM que depende só do grupo e de a conta estar registrada (`has_account`, nulo na ação do grupo). Não cita atividade, intenção nem compromisso. O painel diz por quê: a base não registra atividades, estágio nem contatos.
- **Conta ausente é lacuna de cadastro.** Filtro neutro "com / sem cliente registrado" (na URL, `cliente=com|sem`), nota neutra no resumo e a coluna Cliente como indicador por linha. Nenhum efeito na ordem nem no grupo. Sem ícone extra: ele marcaria 69% das linhas.
- **Idade com contexto, sem urgência.** O `meta` ganha `won_cycle_median_days`. O painel e a coluna Idade mostram a idade ao lado da mediana, de L1 e de L2 das ganhas, com o aviso de que isso descreve as vendas que fecharam. Sem semáforo, contagem regressiva nem ícone por linha: todo gatilho seria um limiar que repete a hipótese sem prova.
- **Empate sem falsa ordem.** Mesmo grupo, produto e valor de tabela são "empatadas, sem ordem entre si"; a ordem por código é só estabilidade. O critério de desempate não muda.
- **Contrato v7.** Códigos `check_status`, `check_progress`, `confirm_still_active`, `check_prospecting` (os três primeiros com `has_account`); saem `work_highest_list_price_first` e `advance_prospecting`.

#### Alternativas descartadas

- **Barra de score de 10 a 100 por oportunidade:** a ordem só tem 7 preços distintos por grupo, o número seria lido como chance de fechar (a Head de RevOps leu o valor de tabela como "nota"), e "score" está entre os termos proibidos (AC-3.8).
- **"Minha sessão de trabalho" (selecionar e copiar um plano):** o painel já mostra o que verificar em cada linha, então o plano repetiria o mesmo texto. Fica para depois da validação com vendedores iniciantes, e só se eles perderem o fio entre uma oportunidade e outra.
- **Desempate por idade ("mais perto do limite primeiro"):** parte da mesma hipótese sem prova.

#### Consequências

- Mais utilizável: o vendedor sabe o que consultar no CRM e o que a tela não sabe.
- **Não comprova** que as oportunidades escolhidas fecham mais: a ferramenta organiza a verificação; o ganho só se mede no piloto com grupo de controle.
- Validação com vendedores iniciantes reais: protocolo em [validacao-vendedor-iniciante.md](./validacao-vendedor-iniciante.md).

---

<a id="adr-009"></a>
### ADR-009: Qualificar antes de Acompanhar e Confirmar

**Status:** Aceito em 17/10/2026. Substitui em parte o [ADR-006](#adr-006) na posição de Qualificar; os limites de idade, os grupos de Engaging e a ordem dentro do grupo não mudam.
**Data:** 17/10/2026

#### Contexto

- **[Pedido do produto]** A ordem passa a ser Focar → Qualificar → Acompanhar → Confirmar → Completar, porque as Engaging acima de L1 já passaram do tempo em que 90% das vendas ganhas fecharam, e as acima de L2, de qualquer venda ganha da base.
- **[Dados] Confirmar quase não converte no passado:** nos 7 cortes mensais do backtest, as abertas acima de L2 somam 1.469 observações e nenhuma ganhou em 90 dias (Acompanhar, 10,2%; Focar, 39,3%). É o mesmo fato do L2 visto no tempo: nenhuma venda da base passou de 138 dias; a base termina em dezembro de 2017 e é provavelmente sintética.
- **[Dados] Não há prova para Qualificar:** nenhuma Prospecting tem desfecho (as 4.238 ganhas e as 2.473 sem venda têm todas data de engajamento; as 500 Prospecting não têm), então o backtest não a avalia e nada mostra que ela converta mais ou menos que Acompanhar.
- **[Dados] O ciclo da vendedora que motivou a discussão (Anna Snelling) é o da empresa:** mediana 60 d contra 57 d, P90 105 d contra 106 d, 16,3% das ganhas em até 7 dias contra 17,8%. Limites só dela não tirariam nenhuma das 56 abertas dela de Confirmar.

#### Decisão

- `policy.STATES` passa a ser `focar, qualificar, acompanhar, revisar, nao_pontuavel`. Tudo que depende da ordem (payload `ordering`, abas, legenda, "comece por") sai dessa tupla.
- Focar vazio aponta para o primeiro grupo seguinte com itens; para Qualificar, o parâmetro novo `has_engaging` diz se o motivo é "nenhuma aberta há até L1" ou "nenhuma negociação em andamento".
- A ordem de Acompanhar e Confirmar entre si, e a dentro de cada grupo, não muda; o backtest segue reproduzindo a ordem servida.

#### Consequências

- **Não está provado que a ordem nova ajude:** é uma hipótese de produto. Só o piloto com grupo de controle mede se o vendedor que começa por Qualificar vende mais do que o que começa por verificar as antigas.
- Todos os 10 vendedores sem Focar passam a começar por Qualificar.
- **Condição para revisitar:** dados de desfecho para Prospecting, ou o piloto mostrar que a verificação das antigas (Confirmar) libera esforço melhor do que a prospecção.

<a id="adr-010"></a>
### ADR-010: Priorização assistida pelo vendedor, no navegador

**Status:** Aceito em 18/10/2026. Não substitui nenhum ADR; abre uma exceção declarada à regra de fronteira do [ADR-004](#adr-004) ("o front não calcula regra de negócio").
**Data:** 18/10/2026

#### Contexto

- **[Teste com personas]** Darcel (13 oportunidades empatadas, GTX Plus Pro, 5.482) e Boris pediram uma forma de escolher entre oportunidades que o scoring não separa: a ordem entre elas é só pelo código (ADR-008, "sem ordem entre si").
- **[Dados]** O que separa essas oportunidades (resposta do cliente, necessidade, decisor, orçamento, ação combinada) **não está nos CSVs**. O desempate por idade e a "sessão de trabalho" foram descartados no ADR-008 por falta de prova.
- **[Produto]** A dona do produto definiu uma avaliação **declarada pelo vendedor**, com pontos de 0 a 100 (pesos 20/20/15/15/15/10/5, Urgência reduzida de 25 para 15 para somar 100) e a categoria de trabalho ao lado dos pontos.

#### Decisão

- A priorização assistida é um **segundo mecanismo de decisão**, separado do scoring: recebe a oportunidade, coleta respostas e devolve um resultado à parte. **Nenhuma resposta altera grupo, ordem, contadores, contrato (v7), API, CLI, backtest ou Evidência.**
- O motor roda **no front**, em `lib/assisted/` (função pura, constantes em `weights.ts`, `policy_version` `assisted-points-v1`). Não vai para o núcleo Python porque as respostas são sobre clientes e **nada deve ser gravado no backend**; mantê-las no navegador evita criar a primeira rota que não é GET e uma persistência com autenticação.
- Os textos vivem em `copy/assisted.ts` e passam pelo mesmo vocabulário proibido (AC-3.8). O resultado nunca mostra porcentagem, "chance" ou "melhor oportunidade".
- As respostas ficam em `localStorage` (`rankio.avaliacoes.v1`), por vendedor e oportunidade, sem texto livre.
- **"Não sei" vale 0 ponto confirmado**, mas não é um "não": a tela mostra o potencial (até N pontos). Pontos iguais ficam empatados; 4 ou mais "Não sei" levam ao bloco à parte, sem posição.

#### Alternativas rejeitadas

- **Motor no núcleo Python com POST sem estado:** mantém a regra do ADR-004, mas cria a primeira rota não-GET (CORS, testes de somente leitura) e leva respostas de clientes ao servidor.
- **Só perguntas orientativas, sem coletar respostas:** não diferencia as empatadas.
- **Pontuação a partir dos dados:** não há dado que sustente.

#### Consequências

- **Os pesos e os pontos por resposta são hipóteses do desenho, não evidência.** A tela diz "pesos iniciais, a validar". Um número de 0 a 100 pode soar mais exato do que é; por isso há faixa, quebra por pergunta e o aviso fixo.
- A regra de negócio do front fica restrita a esta camada, testada em unitário e coberta pelos AC-7.x.
- Os dados somem se o navegador for limpo e não passam de um dispositivo para outro: serve para demonstração e piloto pequeno, não para dado oficial.
- **Condição para revisitar:** o teste com vendedores reais mostrar que o número é lido como previsão, ou o piloto pedir persistência por usuário (backend com autenticação).

---

---

<a id="secao-3"></a>
## 3. Rastreabilidade e pendências

[↑ Voltar ao índice](#indice)

<a id="sub-3-1"></a>
### 3.1. Questões abertas do discovery: onde cada uma foi resolvida

**Herda de:** [discovery 4.5](./discovery.md#sub-4-5) ([AR-01](./discovery.md#ar-01) a [AR-12](./discovery.md#ar-12)) e [1.9](#sub-1-9) ([Q-01](#q-01) a [Q-03](#q-03)).

| Questão | Resolvida em | Como |
| --- | --- | --- |
| [AR-01](./discovery.md#ar-01) Regras de scoring: pesos, faixas, desempate | [ADR-001](#adr-001) | Faixas de valor de tabela alto, médio e baixo, por preço; ordem estado → faixa → preço exato; idade só exibida; política provisória |
| [AR-02](./discovery.md#ar-02) Reconciliar "não é só ordenar por valor" | [ADR-001](#adr-001) | Três dimensões integradas, com explicação; pesos declarados como política |
| [AR-03](./discovery.md#ar-03) Uma fila ou duas; envelhecidos | [ADR-001](#adr-001), [ADR-002](#adr-002), [ADR-006](#adr-006) | Três grupos de Engaging (Focar, Acompanhar, Revisar) com os limites L1 = P90 das ganhas e L2 = maior ciclo, calculados no `as_of` |
| [AR-04](./discovery.md#ar-04) Expressar incerteza e taxa-base | [ADR-001](#adr-001) | Faixa na explicação; nunca por deal |
| [AR-05](./discovery.md#ar-05) Estado na data da decisão | [ADR-001](#adr-001), [ADR-002](#adr-002) | Quatro estados, partição que soma 2.089 |
| [AR-06](./discovery.md#ar-06) Tratamento do Prospecting | [ADR-001](#adr-001) | "Qualificar": só valor, sem idade |
| [AR-07](./discovery.md#ar-07) "Hoje" fixo ou parâmetro | [ADR-002](#adr-002) | Parâmetro, padrão `max(close_date)` |
| [AR-08](./discovery.md#ar-08) Como medir impacto | [ADR-001](#adr-001), [ADR-003](#adr-003) | Ponto de extensão; [F-07](#f-07) e [F-13](#f-13) como caminho |
| [AR-09](./discovery.md#ar-09) Visão de manager | [ADR-001](#adr-001), [ADR-007](#adr-007) | Descritiva, sem ranking de pessoas; a Inteligência mostra pessoas em ordem alfabética, com a decomposição só no nível da dimensão |
| [AR-10](./discovery.md#ar-10) Papel de um LLM | [ADR-001](#adr-001) | Sem LLM; explicação por modelo de frase |
| [AR-11](./discovery.md#ar-11) Contrato de dados para enriquecimento | [ADR-001](#adr-001), [ADR-003](#adr-003) | Núcleo desacoplado e política editável |
| [AR-12](./discovery.md#ar-12) Leitura do KPI principal | [ADR-001](#adr-001) | Habilidade e valor em colunas separadas |
| [Q-01](#q-01) Lista principal vazia ou curta | [ADR-001](#adr-001) | Estado vazio com mensagem própria; contagem exibida |
| [Q-02](#q-02) Conta nula bloqueia? | [ADR-002](#adr-002) | Não bloqueia; aviso único no cabeçalho e linha identificada por ID |
| [Q-03](#q-03) Nome do grupo "Revisar" | [ADR-001](#adr-001) | Texto factual; nunca "perdida" nem "encerre" |

<a id="sub-3-2"></a>
### 3.2. Requisitos cobertos por ADR

| Requisito | Coberto por | Verificado por |
| --- | --- | --- |
| [RB-01](#rb-01) Rodar com dados reais | [ADR-002](#adr-002), [ADR-003](#adr-003) | Setup do zero; e2e nos CSVs |
| [RB-02](#rb-02) Lógica além de ordenar por valor | [ADR-001](#adr-001) | Backtest vs. "só valor" |
| [RB-03](#rb-03) Vendedor entende o porquê | [ADR-001](#adr-001) | Teste de compreensão; teste de texto |
| [RB-04](#rb-04) Decidir onde focar | [ADR-001](#adr-001), [ADR-003](#adr-003) | Teste de tarefa |
| [RB-05](#rb-05) Setup, lógica e limitações | [ADR-003](#adr-003) | README e process log |
| [RB-06](#rb-06) Filtros por vendedor, manager e região | [ADR-003](#adr-003) | Contrato da API |
| [RD-01](#rd-01) a [RD-03](#rd-03) | [ADR-001](#adr-001) | Partição; guarda; texto |
| [RD-04](#rd-04) Normalização e junções | [ADR-002](#adr-002) | Reconciliação; regressão `GTXPro` |
| [RD-07](#rd-07) "Hoje" como parâmetro | [ADR-002](#adr-002) | Sensibilidade ao `as_of` |
| [RD-08](#rd-08) Eventos de uso | [ADR-001](#adr-001), [ADR-003](#adr-003) | Ponto de extensão |
| [RD-09](#rd-09) Backtest temporal | [ADR-001](#adr-001) | 5 ou mais cortes |

<a id="sub-3-3"></a>
### 3.3. Evidência nova desta etapa

Os números abaixo **não constam do `data-audit.md`** e hoje **não têm script no repositório** ([CP-01](#cp-01)).

| Achado | Resultado | Método | Situação |
| --- | --- | --- | --- |
| GBM com todos os campos | AUC médio 0,503 (0,474 a 0,534); Brier +0,0275 | 5 cortes temporais | Executado nesta etapa |
| GBM só com campos das abertas | AUC médio 0,524; Brier +0,020 | Idem | Executado nesta etapa |
| Conta | p = 0,94; AUC 0,462 a 0,489; correlação −0,19 entre períodos; 2 de 85 com p < 0,05 | Qui-quadrado, backtest, metades do período | Executado nesta etapa |
| Escritório e manager | p = 0,60 e 0,79; AUC 0,462 a 0,515 | Idem | Executado nesta etapa |
| Interações produto × escritório e produto × vendedor | 2 de 18 e 5 de 89 células com p < 0,05 | Binomial por célula | Executado nesta etapa |
| Taxa de resolução por idade | Dominada pelo calendário: 0% em cortes de fim de trimestre | Janelas de 30 dias, 6 cortes | Executado nesta etapa |
| Sensibilidade ao `as_of` | Focar = 351, 298, 160 e 34 | Contagem direta | Reconferido |
| Faixas de valor em Focar | Valor alto 123, médio 113, baixo 62 | Contagem direta | Reconferido |
| Acúmulo de abertas acima do maior ciclo | Cresce de ~1,5% (abril) a ~25% (outubro) e 81% (dezembro) | Relato de dois agentes | **Não reconferido por mim** |

<a id="sub-3-4"></a>
### 3.4. Correções pendentes nos documentos de origem

Registradas aqui e **não aplicadas**: exigem editar o `discovery.md` ou o `data-audit.md`.

| ID | Correção | Onde |
| --- | --- | --- |
| <a id="cp-01">CP-01</a> | Criar scripts reproduzíveis para as sondas da seção [3.3](#sub-3-3) e para as "consultas diretas" | `solution/scripts/` |
| <a id="cp-02">CP-02</a> | Atualizar [U-03](#u-03) e a leitura dos "envelhecidos": é acúmulo ao longo do tempo, não valor constante | [discovery 3.8](./discovery.md#sub-3-8), [discovery 4.5](./discovery.md#sub-4-5) |
| <a id="cp-03">CP-03</a> | Alinhar o papel da completude: aviso, não critério do score | [discovery 4.3](./discovery.md#sub-4-3) (linha 4) |
| <a id="cp-04">CP-04</a> | Alinhar o tratamento de Prospecting: "Qualificar", só valor | [discovery 3.6](./discovery.md#sub-3-6) (decisão 3) |
| <a id="cp-05">CP-05</a> | Fixar "dentro do ciclo" como idade ≤ 138 d (com `<` seriam 288, não 298). Com a regra A ([ADR-006](#adr-006)), os dois limites são inclusivos: idade ≤ 106 d é Focar (157) e idade ≤ 138 d é Acompanhar | [discovery 4.3](./discovery.md#sub-4-3) (linha 6) |
| <a id="cp-06">CP-06</a> | Explicitar a sensibilidade ao `as_of` além de 81,2% → 77,9% | [discovery 3.1](./discovery.md#sub-3-1) |

---

<a id="limites"></a>
## Limites deste documento

- **Não é PRD** e não escolhe pesos definitivos: faixas de valor e ordem de desempate são política provisória ([U-06](#u-06)).
- **Nada aqui comprova efeito da ferramenta.** Resultado histórico não é impacto; o efeito só se mede em [piloto com controle](./discovery.md#g-controle).
- **A seção 1 é contexto.** Foi escrita antes dos ADRs; a única alteração posterior foi alinhar o papel da completude em [1.1](#sub-1-1) ([CP-03](#cp-03)).
- **Esforço** é estimativa de produto ([Hipótese]); a implementação a refaz.
- **As contagens "consulta direta" e as sondas de [3.3](#sub-3-3)** não têm script e não constam do [data-audit.md](./data-audit.md).
- **A pesquisa de literatura** é, em sua maior parte, material de fornecedores; só o paper da IBM/AAAI tem rigor acadêmico. A defesa da decisão se apoia mais nos dados do projeto do que na literatura.
- **Este documento não altera** o [discovery.md](./discovery.md) nem o [data-audit.md](./data-audit.md).
