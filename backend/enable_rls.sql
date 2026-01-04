-- =========================================
-- SCRIPT COMPLETO: Ativar RLS na Tabela produtos
-- =========================================
-- Este arquivo ativa Row Level Security e cria todas as políticas necessárias
-- 
-- COMO USAR:
-- 1. Copie TUDO (Ctrl+A, Ctrl+C)
-- 2. Abra Supabase Dashboard → SQL Editor
-- 3. Cole e clique em RUN
-- 
-- Tempo: ~5 segundos
-- =========================================

-- PASSO 1: Criar Política de Leitura Pública
-- Qualquer pessoa pode VER produtos (público)
CREATE POLICY "Permitir leitura pública de produtos"
ON produtos
FOR SELECT
TO public
USING (true);

-- PASSO 2: Criar Política de Inserção
-- Apenas usuários autenticados podem CRIAR produtos
CREATE POLICY "Permitir inserção apenas para usuários autenticados"
ON produtos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- PASSO 3: Criar Política de Atualização
-- Apenas usuários autenticados podem EDITAR produtos
CREATE POLICY "Permitir atualização apenas para usuários autenticados"
ON produtos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- PASSO 4: Criar Política de Exclusão
-- Apenas usuários autenticados podem DELETAR produtos
CREATE POLICY "Permitir exclusão apenas para usuários autenticados"
ON produtos
FOR DELETE
TO authenticated
USING (true);

-- PASSO 5: Ativar RLS na Tabela
-- IMPORTANTE: Este comando ATIVA o RLS. Só funciona porque criamos as políticas antes!
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- =========================================
-- VERIFICAÇÃO (Opcional - Execute depois)
-- =========================================

-- Verifica se RLS está ativo (deve retornar rowsecurity = true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'produtos';

-- Lista todas as políticas criadas (deve retornar 4 políticas)
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'produtos';

-- =========================================
-- TUDO CERTO! 🎉
-- =========================================
-- Após executar:
-- 1. Abra seu sistema: http://localhost:5173
-- 2. Teste sem estar logado (deve ver produtos mas não editar)
-- 3. Faça login e teste criar/editar/deletar (deve funcionar)
-- =========================================
