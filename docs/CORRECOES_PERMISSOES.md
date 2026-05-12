# Correções no Sistema de Permissões

> **Atualização (2026):** Em produção as permissões vêm da API persistindo em **Oracle**. Abaixo, “PostgreSQL” refere-se ao período da correção; o fluxo correto segue sendo **sempre buscar no backend**.

## Problemas Identificados e Corrigidos

### 1. ✅ Hook usePermissions — sempre buscar no backend (banco/API)
**Problema:** O hook estava usando permissões padrão baseadas no tipo de usuário quando não encontrava no backend.

**Correção:**
- Removida a lógica de permissões padrão por tipo (proprietário/funcionário)
- Agora sempre busca no backend (hoje Oracle em produção)
- Se não encontrar, cria permissões vazias (todas false)
- Master ainda tem todas as permissões, mas também busca do backend para consistência
- Adicionado `cache: 'no-store'` para sempre buscar do servidor

### 2. ✅ Página de Controle de Permissões - Remoção de Duplicações
**Problema:** Itens apareciam duplicados (tanto como individuais quanto dentro dos módulos).

**Correção:**
- Removidos todos os itens que estão nos módulos da lista de itens individuais
- Agora apenas mostra itens que realmente não estão em módulos:
  - Dashboard
  - Agenda
  - Lançamento de Venda
  - CRM
  - Help Desk
  - Configurações
- Os demais itens aparecem apenas dentro de seus respectivos módulos

### 3. ✅ Sidebar - Recarregamento Automático
**Problema:** Sidebar não recarregava permissões após alterações.

**Correção:**
- Adicionado listener para evento `permissoes-atualizadas`
- Adicionado `cache: 'no-store'` para sempre buscar módulos do servidor
- Sidebar agora recarrega automaticamente quando permissões são atualizadas

### 4. ✅ Recarregamento após Salvar Permissões
**Problema:** Após salvar permissões, o sistema não recarregava automaticamente.

**Correção:**
- Após salvar permissões, recarrega as permissões do usuário editado
- Dispara evento `permissoes-atualizadas` para atualizar outros componentes
- Hook usePermissions escuta o evento e recarrega automaticamente

## Estrutura de Permissões

### Permissões são por USUÁRIO, não por CATEGORIA
- Master, Proprietário e Funcionário são apenas categorias informativas
- Cada usuário tem suas próprias permissões no banco (via API)
- As permissões são armazenadas na tabela `protese.permissoes_usuarios`

### Fluxo de Permissões

1. **Carregamento:**
   - Hook `usePermissions` sempre busca do backend (`/api/v1/permissoes/:usuarioId`)
   - Se não encontrar, retorna permissões vazias (todas false)
   - Master tem todas as permissões, mas ainda busca do backend

2. **Verificação:**
   - `podeAcessar(modulo)` - verifica permissão de visualização
   - `podeEditar(modulo)` - verifica permissão de edição
   - `podeExcluir(modulo)` - verifica permissão de exclusão

3. **Atualização:**
   - Ao salvar permissões, dispara evento `permissoes-atualizadas`
   - Todos os componentes que usam permissões recarregam automaticamente
   - Sidebar atualiza o menu baseado nas novas permissões

## Arquivos Modificados

1. `frontend/painel-admin/src/hooks/usePermissions.ts`
   - Removida lógica de permissões padrão por tipo
   - Adicionado listener para recarregamento automático
   - Sempre busca no backend

2. `frontend/painel-admin/src/components/admin/Sidebar.tsx`
   - Adicionado listener para recarregamento automático
   - Adicionado `cache: 'no-store'` para módulos

3. `frontend/painel-admin/src/app/dashboard/controle-permissoes/page.tsx`
   - Removidos itens duplicados da lista de individuais
   - Adicionado recarregamento após salvar
   - Filtra itens que já estão nos módulos

## Como Funciona Agora

1. **Usuário faz login:**
   - Sistema busca permissões no backend para aquele usuário específico
   - Se não encontrar, todas as permissões são false

2. **Sidebar carrega:**
   - Busca módulos do backend
   - Verifica permissões do usuário
   - Mostra apenas itens que o usuário tem permissão de ver

3. **Páginas verificam:**
   - Cada página verifica `podeAcessar()` antes de mostrar conteúdo
   - Botões de editar/excluir verificam `podeEditar()` e `podeExcluir()`

4. **Administrador edita permissões:**
   - Seleciona usuário
   - Edita permissões (agrupadas por módulos)
   - Salva no banco via API
   - Sistema recarrega automaticamente

## Próximos Passos

1. Testar o sistema completo:
   - Login com diferentes usuários
   - Verificar se sidebar mostra apenas itens permitidos
   - Verificar se páginas respeitam permissões de edição/exclusão
   - Editar permissões e verificar se recarrega automaticamente

2. Verificar se todas as páginas estão usando `podeEditar()` e `podeExcluir()`:
   - Já verificado que várias páginas usam, mas pode haver algumas que não usam

3. Garantir que o backend está retornando todas as permissões corretamente do banco

