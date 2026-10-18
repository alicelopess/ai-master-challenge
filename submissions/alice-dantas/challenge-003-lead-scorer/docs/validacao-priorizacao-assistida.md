# Validação da priorização assistida

Protocolo da rodada de compreensão e esforço com pessoas reais, para a priorização assistida ([ADR-010](./architecture.md#adr-010), P0-5 do [PRD](./prd.md)). **Ainda não foi executado:** o reteste com personas simuladas pelo mesmo modelo acha problemas de texto e de fluxo, mas não vale como evidência de usuários reais.

## O que a rodada quer saber

1. O vendedor consegue avaliar duas oportunidades empatadas sozinho, sem ajuda?
2. Ele explica por que o Rankio sugeriu determinada ordem e determinado tipo de ação?
3. Ele lê os pontos como previsão de fechamento? (Não deveria.)
4. A avaliação **poupa** ou **custa** esforço, comparada a olhar direto no CRM?
5. A ordem por pontos faz sentido para quem conhece a carteira, ou os pesos iniciais mandam uma oportunidade que ele não escolheria?

A rodada **não** mede se as oportunidades mais bem pontuadas fecham mais. Isso só o piloto com grupo de controle mede.

## Quem e como

- 5 vendedores B2B, sem conhecimento técnico de dados, que nunca viram o Rankio, de preferência com uma carteira real de empatadas em mãos.
- Individualmente, cerca de 25 minutos, com a Carteira de um vendedor com empate no topo (a Darcel Schlecht serve: 13 empatadas em Qualificar) e **sem explicação prévia**.
- Quem conduz só lê as tarefas e cronometra. Não ajuda nem comenta a resposta.

## Tarefas e critério

| # | Tarefa lida à pessoa | Resposta que conta como acerto |
| --- | --- | --- |
| 1 | "Escolha duas oportunidades empatadas e avalie as duas." | Conclui o questionário das duas sem ajuda. |
| 2 | "Diga, com suas palavras, por que uma ficou na frente da outra." | Cita o que ela própria respondeu (ex.: "porque eu disse que a necessidade está confirmada"), e não um dado do CRM. |
| 3 | "O que você faria agora com a primeira da lista?" | Descreve a ação sugerida ("Definir continuidade", "Verificar o compromisso" etc.) com as próprias palavras. |
| 4 | "Qual destas vai fechar?" | Responde que a ferramenta não diz. |
| 5 | "O que significa '72 de 100 pontos'?" | Diz que é o resumo do que ela respondeu, não uma chance de fechar. |
| 6 | "Uma oportunidade ficou em 'Investigar primeiro'. O que isso diz sobre ela?" | Entende que faltam informações, e não que é uma oportunidade ruim. |
| 7 | "Quais informações você precisaria conferir no CRM?" | Cita ao menos duas, a partir de "O que ainda não sabemos". |

**Passa** se pelo menos 4 de 5 pessoas acertam as tarefas 1, 2, 3 e 7, **e** nenhuma lê os pontos como previsão (tarefas 4 e 5). Se 1 pessoa ou mais ler assim, o texto e a forma de mostrar o número mudam antes de qualquer piloto.

## O que registrar

- Resposta literal de cada tarefa e se foi acerto.
- **Tempo e número de cliques** para avaliar 2 e 5 oportunidades, e se a pessoa desistiu ou usou "Pular por agora".
- Quanto ela já sabia sem consultar o CRM (quantos "Não sei" por pergunta) e quais perguntas estranhou.
- Se concordou com a ordem, e se moveu alguma oportunidade com os botões de subir e descer (e por quê).
- Pergunta final: "Sem a ferramenta, quanto tempo você levaria para chegar à mesma lista?".

## Como ler o resultado

- Compreensão boa **não prova** que a ordem ajuda a vender mais.
- Se a maioria mover as mesmas oportunidades, os pesos iniciais precisam mudar: é o sinal mais direto de que a hierarquia não reflete como vendedores pensam.
- Se o esforço for maior que consultar o CRM direto, o fluxo precisa encurtar (menos perguntas ou avaliação só do topo) antes de qualquer piloto.
- Uma resposta que repete frases da tela pode ser eco: peça um exemplo com outra oportunidade.
