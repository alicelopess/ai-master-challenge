# Backtest temporal da ordenação

Gerado por `scripts/backtest.py` (não editar à mão). Desenho e leitura: README, seção Resultados.

## Cortes

| Corte | Treino (fechadas até T) | Teste (engajadas até T, fechadas depois) | Taxa de ganho do teste | Limite de ciclo em T | Teste em Focar em T |
| --- | --- | --- | --- | --- | --- |
| 2017-05-31 | 2038 | 930 | 73,9% | 138 d | 100,0% |
| 2017-06-30 | 2679 | 970 | 62,8% | 138 d | 100,0% |
| 2017-07-31 | 3306 | 1139 | 65,1% | 138 d | 100,0% |
| 2017-08-31 | 4091 | 893 | 71,3% | 138 d | 100,0% |
| 2017-09-30 | 4726 | 935 | 59,8% | 138 d | 100,0% |

Nenhuma negociação fechada passou de 138 dias, então todo o teste estava em Focar em T: a divisão Focar/Revisar não tem rótulo para ser avaliada aqui, e a regra coincide com "só valor".

## Habilidade: AUC (IC95%) por corte

| Ordenador | 2017-05-31 | 2017-06-30 | 2017-07-31 | 2017-08-31 | 2017-09-30 | Média |
| --- | --- | --- | --- | --- | --- | --- |
| Taxa global | 0,500 (0,500–0,500) | 0,500 (0,500–0,500) | 0,500 (0,500–0,500) | 0,500 (0,500–0,500) | 0,500 (0,500–0,500) | 0,500 |
| Taxa por produto | 0,504 (0,461–0,546) | 0,533 (0,493–0,569) | 0,498 (0,464–0,532) | 0,500 (0,461–0,547) | 0,495 (0,457–0,527) | 0,506 |
| Aleatório | 0,527 (0,491–0,560) | 0,500 (0,468–0,536) | 0,493 (0,459–0,528) | 0,467 (0,423–0,506) | 0,487 (0,450–0,526) | 0,495 |
| Só valor de tabela | 0,498 (0,456–0,542) | 0,492 (0,458–0,526) | 0,510 (0,478–0,544) | 0,498 (0,459–0,537) | 0,478 (0,444–0,514) | 0,495 |
| Regra da ferramenta | 0,498 (0,456–0,542) | 0,492 (0,458–0,526) | 0,510 (0,478–0,544) | 0,498 (0,459–0,537) | 0,478 (0,444–0,514) | 0,495 |
| [VAZAMENTO] fechou no 3º mês do trimestre | 0,645 (0,613–0,684) | 0,614 (0,588–0,639) | 0,618 (0,590–0,648) | 0,650 (0,620–0,684) | 0,631 (0,600–0,664) | 0,632 |

## Valor capturado: parcela do valor ganho nos 20% primeiros da ordem

| Ordenador | 2017-05-31 | 2017-06-30 | 2017-07-31 | 2017-08-31 | 2017-09-30 | Média |
| --- | --- | --- | --- | --- | --- | --- |
| Taxa global | 23,4% | 21,8% | 20,7% | 20,9% | 22,7% | 21,9% |
| Taxa por produto | 20,8% | 25,0% | 1,8% | 7,1% | 0,6% | 11,1% |
| Aleatório | 19,2% | 20,3% | 19,9% | 18,7% | 17,9% | 19,2% |
| Só valor de tabela | 50,7% | 49,8% | 49,6% | 49,5% | 48,9% | 49,7% |
| Regra da ferramenta | 50,7% | 49,8% | 49,6% | 49,5% | 48,9% | 49,7% |
| [VAZAMENTO] fechou no 3º mês do trimestre | 23,6% | 26,8% | 23,6% | 21,1% | 23,0% | 23,6% |
