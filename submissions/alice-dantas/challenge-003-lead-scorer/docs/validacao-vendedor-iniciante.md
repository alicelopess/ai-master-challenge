# Validação com vendedores iniciantes

Protocolo da rodada de compreensão com pessoas reais, para a persona do vendedor iniciante (Boris Faz, no teste de personas de [testes-personas/](./testes-personas/)). Cobre as mudanças do [ADR-008](./architecture.md#adr-008). **Ainda não foi executado:** as seis personas do teste anterior eram simuladas pelo mesmo modelo e não valem como evidência de usuários reais.

## O que a rodada quer saber

O vendedor iniciante consegue, sozinho, transformar a lista em um plano de verificações, sem confundir a classificação com uma previsão individual?

A rodada **não** mede se as oportunidades escolhidas fecham mais. Isso só o piloto com grupo de controle mede.

## Quem e como

- 5 pessoas que vendem B2B há até 2 anos, sem conhecimento técnico de dados e que nunca viram o Rankio.
- Individualmente, cerca de 20 minutos, com a Carteira de um vendedor com Focar, Acompanhar e Confirmar (o Boris Faz serve) e **sem explicação prévia** de telas, regras ou números.
- Quem conduz só lê as tarefas e anota. Não ajuda, não explica o painel e não comenta a resposta.

## Tarefas e critério

| # | Tarefa lida à pessoa | Resposta que conta como acerto |
| --- | --- | --- |
| 1 | "Escolha uma oportunidade e diga, com suas palavras, por que ela está nesse grupo e nessa posição." | Cita a idade em relação ao histórico das vendas ganhas **e** o valor de tabela como critério de posição. |
| 2 | "Dessa mesma oportunidade, diga o que a tela **não** sabe." | Cita pelo menos duas lacunas: atividades ou contatos, estágio, valor negociado, conta (quando ausente). |
| 3 | "Você tem uma hora. Escolha quais negociações vai verificar e diga por que." | Justifica com dado da tela (grupo, conta registrada, idade). Se usar critério próprio (ex.: "conheço esse cliente"), diz que é dela. |
| 4 | "Qual destas tem mais chance de fechar?" | Responde que a ferramenta não diz. |
| 5 | "Duas oportunidades aparecem como empatadas. O que isso significa?" | Diz que a ferramenta não diferencia uma da outra (a ordem entre elas não é recomendação). |
| 6 | "Uma oportunidade está sem cliente registrado. O que você entende disso?" | Entende como lacuna de cadastro, e não como oportunidade pior ou melhor. |

**Passa** se pelo menos 4 de 5 pessoas acertam cada tarefa. A tarefa 4 é a de controle: se 2 ou mais responderem com uma oportunidade, a classificação está sendo lida como previsão, e o texto precisa mudar antes de qualquer piloto.

## O que registrar

- Resposta literal de cada tarefa e se foi acerto.
- Quanto tempo levou até a primeira oportunidade escolhida na tarefa 3.
- Palavras que a pessoa estranhou ("Confirmar", "Início da negociação", "empatadas", "contexto do histórico").
- Se abriu o contexto histórico da idade e o que entendeu dele.
- Se usou o filtro de cliente e para quê.

## Como ler o resultado

- Compreensão boa **não prova** que a lista ajuda a vender mais. Só diz que o texto é claro para quem vai usar.
- Uma resposta que repete frases da tela pode ser eco. Peça, na tarefa 1, que a pessoa dê um exemplo com outra oportunidade.
- O critério do PRD (4 de 5 explicam a posição e o limite) só fica atendido com esta rodada feita com pessoas reais.
