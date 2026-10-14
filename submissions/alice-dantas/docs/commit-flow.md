# Visão Geral

Fluxo de commits para resolver o problema destacado na DEC 001 do [README.md](../README.md).

## Fluxo de Commit

```bash

# ==========================================
# 1. CONFERIR O REPOSITÓRIO E A BRANCH
# ==========================================

git rev-parse --show-toplevel
git branch --show-current
git status

# Branch esperada:
# submission/alice-dantas

# ==========================================
# 2. VERIFICAR ARQUIVOS INDESEJADOS
# ==========================================

find submissions/alice-dantas \
  \( -name '.DS_Store' \
  -o -name '.env' \
  -o -name '.env.*' \
  -o -name '__pycache__' \
  -o -name '*.pyc' \
  -o -name '*.log' \
  -o -name '*.key' \
  -o -name '*.pem' \
  -o -name 'node_modules' \
  -o -name '.venv' \
  -o -name 'venv' \
  -o -name '.git' \
  -o -name '.claude' \
  -o -name 'datasets' \
  -o -name '.vscode' \
  -o -name '.idea' \
  -o -name '_internal' \
  -o -name 'Thumbs.db' \
  -o -name '.ipynb_checkpoints' \) -print

# Conferir arquivos maiores que 1 MB

find submissions/alice-dantas \
  -type f -size +1M -print

# Listar todos os arquivos

find submissions/alice-dantas -type f -print


# ==========================================
# 3. SIMULAR A ADIÇÃO
# ==========================================

git add -n -f -- submissions/alice-dantas/


# ==========================================
# 4. ADICIONAR ARQUIVOS
# ==========================================

# Execute somente após revisar a lista acima.

git add -f -- submissions/alice-dantas/


# ==========================================
# 5. REVISAR O STAGING
# ==========================================

# Mostrar os arquivos preparados

git -c core.quotepath=false \
  diff --cached --name-status

# Mostrar arquivos fora da submissão
# Resultado esperado: nenhuma linha

git -c core.quotepath=false \
  diff --cached --name-only -- \
  . ':(exclude)submissions/alice-dantas/**'

# Mostrar arquivos indesejados dentro da submissão
# Resultado esperado: nenhuma linha

git -c core.quotepath=false \
  diff --cached --name-only |
  grep -E '(^|/)(\.DS_Store|Thumbs\.db|\.env|\.env\..+|__pycache__|node_modules|\.venv|venv|\.claude|\.vscode|\.idea|_internal|datasets|\.ipynb_checkpoints)(/|$)|\.(pyc|log|key|pem)$' \
  || true

# Conferir conteúdo das alterações

git -c core.whitespace=-trailing-space diff --cached --check
git diff --cached


# ==========================================
# 6. BUSCAR POSSÍVEIS SEGREDOS
# ==========================================

git diff --cached -U0 --no-color |
  grep -E '^\+[^+]' |
  grep -iE \
  'api[_-]?key|secret|password|passwd|senha|token|sk-[a-z0-9]{20,}|BEGIN .*PRIVATE KEY' \
  || true

# Atenção: essa busca não substitui
# uma auditoria completa de segredos.


# ==========================================
# 7. REMOVER ARQUIVOS INDEVIDOS
# ==========================================

# Somente se precisar retirar algo do staging:

# git restore --staged caminho/do/arquivo


# ==========================================
# 8. CRIAR O COMMIT
# ==========================================

# Somente após validar o staging.

git commit -m "[mensagem]"


# ==========================================
# 9. VERIFICAR O PULL REQUEST
# ==========================================

git fetch origin

# Pressupõe que a branch-base do PR seja main.
# Se for outra, ajuste a referência.

git -c core.quotepath=false \
  diff --name-status origin/main...HEAD

# Conferir novamente se há arquivos
# fora da pasta autorizada.

git -c core.quotepath=false \
  diff --name-only origin/main...HEAD -- \
  . ':(exclude)submissions/alice-dantas/**'


# ==========================================
# 10. ENVIAR PARA O REMOTO
# ==========================================

git push -u origin submission/alice-dantas

```
