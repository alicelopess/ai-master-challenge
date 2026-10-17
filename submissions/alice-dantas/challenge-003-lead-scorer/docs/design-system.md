# Design system — Rankio

**Status:** Aceito em 16/10/2026, antes da implementação da interface (fases U1 a U6). Decisão registrada em [ADR-005](./architecture.md#adr-005).
**Fonte dos valores:** as cores foram medidas por pixel na peça de marca aprovada (fundo, pílula, ícone e textos). Os contrastes foram calculados pela fórmula WCAG 2.1.
**Onde vive no código:** os tokens estão em `solution/web/app/globals.css`, os primitivos em `solution/web/components/ui/` e as composições em `solution/web/components/<domínio>/`.

## 1. Para quem e para quê

| Pessoa | Pergunta que a tela responde | Onde |
| --- | --- | --- |
| Vendedor, segunda de manhã | Qual é o meu próximo passo? | Carteira (cartão "Seu próximo passo" e abas) |
| Gestor e Head de RevOps | Onde está a carteira da equipe? A lista ajuda a escolher onde investir? | Equipe e Evidência |
| Todos | Como a lista é montada? | Como funciona |

**Princípios:**
1. **A resposta vem primeiro.** Cada página abre pela pergunta que responde. A lista vem depois.
2. **Não inventar prioridade.** A tela mostra a ordem que o back decidiu. Dentro de um empate, nenhum item é destacado sozinho.
3. **Dizer só o que a regra diz.** Os textos seguem a [ADR-004](./architecture.md#adr-004): os números vêm dos parâmetros, e o vocabulário proibido não aparece.
4. **Cor nunca sozinha.** Todo estado tem rótulo em texto. A cor só reforça.
5. **shadcn primeiro.** Antes de criar um componente, procure o equivalente no shadcn e use o que existe.

## 2. Marca

- **Nome:** Rankio. No logotipo vai em minúsculas ("rankio"), peso 700.
- **Símbolo:** três barras crescentes (`ChartNoAxesColumnIncreasing`, do lucide) no lilás da marca.
- **Assinatura:** "Saiba onde focar. Venda com mais direção."
- **Pílula:** "Inteligência para priorização de oportunidades comerciais". Aparece no estado inicial da Carteira, antes de o vendedor escolher o nome.

## 3. Tokens

Todos os valores são hex. Ficam em `:root` (claro) e em `.dark` (escuro), com os nomes do shadcn, e o Tailwind v4 os expõe via `@theme inline`. O teste `web/tests/tokens.test.ts` lê esse arquivo e confere o contraste dos pares de texto.

### 3.1. Cores

Cores medidas na peça de marca:
- fundo: `#111723`
- pílula: `#1D283B`
- lilás: `#8091FA`
- logotipo: `#FFFFFF`
- assinatura: `#C4CFDD`
- texto da pílula: `#B4BFCD`

| Token | Claro | Escuro | Uso | Contraste (claro / escuro) |
| --- | --- | --- | --- | --- |
| `--background` | `#F3F4F7` | `#111723` | Fundo da página | — |
| `--foreground` | `#111723` | `#FFFFFF` | Texto principal | 16,3 : 1 / 17,9 : 1 |
| `--card` · `--popover` | `#FFFFFF` | `#1D283B` | Cartões, sheet, menus | — |
| `--primary` | `#8091FA` | `#8091FA` | Lilás da marca: preenchimento, aba ativa, ícone | — |
| `--primary-foreground` | `#111723` | `#111723` | Texto sobre o lilás | 6,3 : 1 (branco daria 2,9 : 1) |
| `--primary-strong` | `#4F5BD5` | `#A5B1FC` | Lilás usado como texto e link | 5,5 : 1 / 7,3 : 1 sobre o card e 6,1 : 1 na linha selecionada |
| `--secondary` · `--muted` | `#ECEEF2` | `#27344B` | Lista de abas, superfícies neutras | — |
| `--accent` | `#EEF0FE` | `#27344B` | Hover e linha selecionada | — |
| `--muted-foreground` | `#5B6577` | `#A3AEBD` | Texto secundário | ≥ 5,0 : 1 em todos os fundos |
| `--border` · `--input` | `#DDE1E8` · `#C9CED8` | `#2C3A52` · `#33425C` | Bordas | — |
| `--ring` | `#8091FA` | `#8091FA` | Anel de foco | — |
| `--destructive` | `#B91C1C` | `#F87171` | Erro | 5,9 : 1 / 5,4 : 1 |

O lilás da marca (`#8091FA`) é o mesmo nos dois temas.
- **No claro:** ele preenche botões, abas ativas e o ícone, sempre com texto `#111723` por cima. Como texto sobre branco ele não atinge o contraste AA (2,9 : 1), por isso existe o `--primary-strong`.
- **No escuro:** como texto, ele passa no card (5,2 : 1), mas não na linha selecionada (4,4 : 1), por isso o texto e os links usam um lilás mais claro (`#A5B1FC`).

### 3.2. Status dos grupos

Cada grupo tem um par de texto e fundo. A cor nunca aparece sem o nome do grupo. O token segue a chave do grupo; o nome na tela é do catálogo ([ADR-006](./architecture.md#adr-006)).

| Grupo (nome na tela) | Claro (texto / fundo) | Escuro (texto / fundo) | Leitura | Contraste |
| --- | --- | --- | --- | --- |
| `focar` (Focar) | `#4F5BD5` / `#EEF0FE` | `#A5B1FC` / `#2D395A` | Lilás da marca | 4,9 / 5,6 : 1 |
| `acompanhar` (Acompanhar) | `#6D28D9` / `#EDE9FE` | `#C4B5FD` / `#3B2F5C` | Violeta, vizinho do lilás de Focar: ainda em andamento, há mais tempo | 6,0 / 6,5 : 1 |
| `revisar` (Confirmar; também `--warning`) | `#92400E` / `#FEF3C7` | `#FBBF24` / `#414037` | Âmbar, de atenção; nunca vermelho, porque não é "perdida" | 6,4 / 6,3 : 1 |
| `qualificar` (Qualificar) | `#0E7490` / `#CFFAFE` | `#67D4E8` / `#294457` | Ciano, de início de funil | 4,8 / 5,9 : 1 |
| `nao_pontuavel` (Completar) | `#5B6577` / `#ECEEF2` | `#A3AEBD` / `#27344B` | Neutro, porque falta dado | 5,1 / 5,6 : 1 |

Dois usos que não são grupo têm variante própria no `Badge`, com as cores de um grupo: `reference` (a estratégia de referência na Evidência, cor de Focar) e `missing` (o campo ausente na tabela, cor de Completar). Assim nenhum componente escreve uma chave de grupo à mão (`web/tests/policy.test.ts`).

**Gráficos:**
- `--chart-1` é o lilás: a regra atual, em destaque.
- `--chart-2` é o `muted-foreground`: as demais estratégias.

### 3.3. Tipografia

A fonte é **Inter**, carregada por `next/font/google` na variável `--font-sans`. Números usam `tabular-nums` e ficam alinhados à direita em tabelas.

| Papel | Classe | Tamanho / altura | Peso |
| --- | --- | --- | --- |
| Logotipo | `text-xl tracking-tight` | 20/28 | 700 |
| Título da página (h1) | `text-2xl tracking-tight` | 24/32 | 600 |
| Seção ou cartão (h2) | `text-lg` | 18/28 | 600 |
| Número de destaque | `text-3xl tabular-nums` | 30/36 | 600 |
| Próximo passo | `text-base` | 16/24 | 500 |
| Corpo, tabela, controles | `text-sm` | 14/20 | 400; rótulos e abas 500 |
| Legenda, cabeçalho de tabela, badge | `text-xs` | 12/16 | 500 |

### 3.4. Espaçamento e layout

A grade é de 4 px (escala padrão do Tailwind).

| Uso | Valor |
| --- | --- |
| Contêiner da página | `max-w-6xl` (1152 px), `px-4` no mobile e `sm:px-6` |
| Entre seções da página | `gap-6` (24 px) |
| Dentro de cartões | `gap-4` (16 px) |
| Itens em linha (ícone e texto, badges) | `gap-2` (8 px) |
| Respiro do cartão | `p-6`, que é o padrão do Card; `p-4` abaixo de `sm`. Tabela em cartão vai de borda a borda |
| Cabeçalho do app | `h-16` no desktop; duas linhas no mobile |
| Controles (botão, select, aba) | `h-9` (36 px) |
| Linha de tabela | `h-10` (40 px) |

**Pontos de quebra:** os padrões do Tailwind. As telas são verificadas em 375 px, 768 px e 1280 px, e nenhuma página pode rolar na horizontal. Tabelas largas rolam dentro do próprio contêiner.

### 3.5. Raio, elevação, movimento, ícones e foco

**Raio:** `--radius: 0.625rem` (10 px), com `sm` 6, `md` 8, `lg` 10 e `xl` 14.
- `rounded-md`: pílula da marca, botões, campos, select e abas.
- `rounded-xl`: cartões e sheet. `rounded-lg`: alertas.
- Os badges ficam em formato de pílula (`rounded-4xl`), como no estilo do shadcn.

**Elevação:**
- Cartões usam o padrão do estilo Vega do shadcn: contorno de 1 px (`ring-foreground/10`) e `shadow-xs`. No escuro a sombra quase some, e o contorno faz o papel da borda.
- O cartão "Seu próximo passo" troca o contorno pelo lilás (`ring-primary/40`).
- A sheet usa a sombra padrão do shadcn.

**Movimento:**
- Os padrões do `tw-animate-css` (150 a 300 ms).
- `prefers-reduced-motion` é respeitado.
- A troca de tema não anima.

**Ícones:**
- `lucide-react`, traço 2.
- `size-4` em controles e badges; `size-5` em títulos.

**Foco:** o padrão do shadcn (`focus-visible:ring-[3px] ring-ring/50`), sempre visível no teclado.

**Cursor:**
- Todo elemento clicável mostra a mãozinha: botões, links, abas, opções de select e de menu, e o combobox.
- O Tailwind v4 tirou esse padrão dos botões, e alguns primitivos marcam os itens com `cursor-default`. Por isso a regra fica em `globals.css`, fora de `@layer`, para valer sobre os utilitários.
- Itens desabilitados ficam de fora.

### 3.6. Tema

`next-themes` com `attribute="class"`. Por padrão segue o sistema, e o seletor Claro / Escuro / Sistema fica no cabeçalho. A escolha fica salva no navegador.

## 4. Componentes

### 4.1. Regra: shadcn primeiro

**Instalação:**
- Estilo `radix-vega` (base Radix), em `web/components.json`.
- Os primitivos entram por `npx shadcn@4.21.1 add <nome>`. A CLI é usada só pelo `npx`; ela não é dependência do projeto.
- `cn` vem do pacote `cn` do shadcn (substitui `clsx` + `tailwind-merge`).
- As variantes e os utilitários CSS de que os primitivos dependem estão em `web/app/shadcn.css`. O arquivo é uma cópia sem alteração do `dist/tailwind.css` do shadcn 4.21.1 (MIT). A alternativa seria instalar a CLI como dependência, o que traria 34 dependências só por esse CSS.

1. **Antes de criar,** procure no registro do shadcn (documentação ou `npx shadcn view <nome>`). Se existir, use o que existe.
2. **`components/ui/`** só tem primitivos gerados pela CLI do shadcn. A única edição permitida é ligar tokens: variantes de status no `Badge` (uma por grupo, mais `reference` e `missing`) e a variante `warning` no `Alert`.
3. **Composições do produto** ficam em `components/<domínio>/` e são montadas só com primitivos. Elas não usam elementos HTML crus que tenham equivalente shadcn (`<button>`, `<table>`, `<select>`, `<details>`), cor literal nem `style={{…}}`. O teste `web/tests/design-system.test.ts` confere essa regra.
4. **Nada de CSS próprio** além dos tokens e da camada base em `globals.css`.

### 4.2. Inventário

| Necessidade | Primitivo shadcn | Composição |
| --- | --- | --- |
| Navegação central entre páginas | NavigationMenu | `app/MainNav` |
| Tema claro, escuro ou sistema | DropdownMenu + Button | `app/ThemeToggle` |
| Data dos dados, contagem, campo ausente, grupo | Badge | `app/DataBadge`, abas, tabela, sheet |
| Escolher vendedor (35 nomes, com busca) | Combobox (Popover + Command) | `portfolio/SellerCombobox` |
| Filtros de gerente e escritório (um restringe o outro) | Select + Button | `team/TeamFilters`, `lib/team.ts` |
| Linguagem da Evidência (negócio ou técnica) | Select | `evidence/EvidencePage` |
| Próximo passo, números, blocos de explicação | Card | `portfolio/NextStepCard`, `team/TeamSummary` |
| Grupos da carteira | Tabs | `portfolio/GroupTabs` |
| Listas | Table | `portfolio/ItemsTable` |
| Páginas da tabela | Pagination | `app/TablePagination` |
| "Por que está aqui" | Sheet + Separator + Button | `portfolio/ReasonSheet` |
| Ajuda de coluna | Tooltip | `portfolio/ItemsTable` |
| Vazio, carregando, erro e aviso | Empty, Skeleton, Alert | Todas as páginas |
| Gráfico da evidência | Chart (Recharts) | `evidence/*` |

## 5. Padrões de página

- **Cabeçalho:**
  - Desktop: marca à esquerda, navegação no centro, e à direita o badge "Dados até …" e o seletor de tema.
  - Mobile: a navegação desce para uma segunda linha centralizada.
  - Não há sidebar. Uma página nova entra como uma rota e uma linha em `lib/nav.ts`.
- **Abertura de página:** título (h1), uma linha do que a página responde e, em seguida, a resposta (cartão ou números). A lista vem depois.
- **Abas de análise** (Equipe):
  - Dividem análises diferentes da mesma página: "Por vendedor" e "Por oportunidade".
  - Ficam abaixo dos números, para a página não virar uma rolagem longa.
  - Variante `line` do Tabs, centralizada, com sublinhado lilás. No celular ocupam a largura toda, em duas metades.
  - Assim não se confundem com as abas de grupo (segmentadas) que ficam dentro de "Por oportunidade".
  - A escolha fica na URL.
- **Abas de grupo:**
  - Rótulo com contagem, na ordem de `ordering.group_order`.
  - A aba inicial é o grupo por onde começar, conforme o back (`start_with_group` quando Focar está vazio).
  - No celular, a lista vira uma grade de duas colunas que cresce em linhas (cinco grupos, três linhas); a partir de `sm`, uma linha de 36 px.
  - A aba fica na URL.
- **Tabelas:**
  - A ordem é a do back.
  - Listas longas são paginadas, nunca com rolagem infinita nem "Mostrar mais":
    - 25 linhas por página, com a faixa "26–50 de 1.291", página anterior, números com saltos e próxima;
    - no celular, só anterior, a página atual e próxima;
    - quando o painel avança para um item de outra página, a tabela acompanha.
  - Linhas de faixa e de empate separam blocos.
  - A linha inteira abre a sheet, e o ID é o botão acessível.
  - Os números ficam à direita.
- **Sheet "Por que está aqui":**
  - Os dois motivos, agrupados pelo `role` do contrato: o que decidiu o grupo e o que decidiu a posição. Abaixo, uma nota fixa do que o sistema não vê (ligações, reuniões, e-mails).
  - Depois vem o próximo passo, com Anterior e Próxima na ordem do grupo, e "Copiar ID".
- **Estados:** carregando usa Skeleton; vazio usa Empty com o texto do código; erro usa Alert `destructive`; dados fora da versão auditada usam Alert `warning`.
- **Gráficos:**
  - São complemento: os mesmos números ficam numa tabela visível, que é a versão para leitores de tela (o gráfico leva `aria-hidden`).
  - No cartão "A pergunta" da Evidência, os números ficam empilhados à esquerda e o gráfico ocupa a direita.
  - Abaixo de `md` o gráfico some, porque as barras ficariam curtas demais para ler.
  - A estratégia de referência usa `--chart-1`, e as demais `--chart-2`, mais apagadas.
- **Tabelas de pessoas** (por vendedor): seguem a ordem da API, que é alfabética, e não têm controle de ordenação, para que a tela nunca vire um ranking.
- **Filtros dependentes:** cada filtro mostra só as opções compatíveis com o outro; por exemplo, com um gerente escolhido aparecem só os escritórios dele.
- **Duas linguagens** (Evidência):
  - **Linguagem de negócio,** o padrão para gestores: pontos em palavras ("4,6 pontos a menos, margem de erro entre 2,5 e 6,8"), sem siglas nem jargão estatístico, que um teste confere.
  - **O recorte sem as negociações que nunca fecham** fica em largura cheia, com o veredito do back num Alert `warning` quando a regra servida fica atrás: é a limitação principal da evidência.
  - **Linguagem técnica,** para quem audita o método: Val@K, P@K, Lift@K, AUC, IC95% e o desenho do backtest.
  - A escolha fica na URL (`?linguagem=tecnica`), e os números são os mesmos nas duas.

## 6. Texto

A [ADR-004](./architecture.md#adr-004) continua valendo:
- Todo texto de tela está em `web/copy/pt-BR.ts`.
- Os números das frases vêm dos parâmetros recebidos.
- Uma frase não afirma mais do que o código.
- O vocabulário proibido (`probabilidade`, `perdida`, `encerre`, `prioridade alta`, `chance alta`, `score`) é testado em todo texto do catálogo.

## 7. Acessibilidade

- Contraste AA (≥ 4,5 : 1) em todos os pares de texto, nos dois temas, conferido por teste.
- Navegação por teclado: abas com setas, sheet com foco preso, Esc fecha, foco visível.
- `aria-current="page"` no item de menu da página ativa.
- O gráfico tem uma tabela equivalente para leitores de tela.
