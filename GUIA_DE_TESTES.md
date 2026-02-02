# 🧪 Guia de Testes - Offline-First Data Hydration + Logos Premium

**Preparado em:** Fevereiro 1, 2026

---

## 🎯 TESTE 1: Verificar Implementação (Automático)

### Pré-requisitos
- Arquivo `c:\Users\User\Documents\lexops-app\app\index.html` aberto no navegador
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Passos
1. **Abra o arquivo HTML**
   ```
   Abra c:\Users\User\Documents\lexops-app\app\index.html no navegador
   ```

2. **Pressione F12** para abrir Developer Tools

3. **Vá para a aba "Console"**
   - Chrome/Edge: View → Developer Tools → Console
   - Firefox: Tools → Browser Tools → Web Developer Tools → Console
   - Safari: Develop → Show JavaScript Console

4. **Procure pela seção de teste**
   ```
   Você deve ver:
   🧪 TESTE AUTOMATIZADO - OFFLINE-FIRST HYDRATION
   ```

5. **Verifique o resultado**
   ```
   Procure por:
   ✅ Testes Passados: 7
   ❌ Testes Falhados: 0
   📊 Taxa de Sucesso: 100%
   🎉 TODOS OS TESTES PASSARAM!
   ```

### ✅ Sucesso
Se ver 100% de sucesso, a implementação está correta.

### ❌ Falha
Se houver falhas, procure por linhas com ❌ e verifique o erro.

---

## 🎯 TESTE 2: Data Hydration COM Filtros Ativos

### Cenário
Admin exporta dashboard com 3 filtros de dados ativados.

### Passos

#### Etapa 1: Ativar Filtros (Admin Mode)
1. **Abra a página em Admin Mode**
   - Se houver URL com token: `index.html?token=abc`
   - Ou se a página abrir mostrando painel esquerdo

2. **Importe um arquivo XLSX**
   - Clique em "Importar Base" no painel esquerdo
   - Selecione um arquivo com dados
   - Confirme o mapeamento de colunas

3. **Ative 3 Filtros de Dados**
   - Procure pelos filtros (geralmente sidebar direita)
   - Ative: `filial`, `periodo`, `risco` (ou similares)
   - Valores: qualquer um (exemplo: filial="SP", periodo="2025", risco="alto")
   - Verifique se os gráficos/tabelas atualizaram

4. **Abra o Console**
   - F12 → Console
   - Procure por mensagens de filtro:
   ```
   ✅ [EXPORTAR] filial = 'SP'
   ✅ [EXPORTAR] periodo = '2025'
   ✅ [EXPORTAR] risco = 'alto'
   ```

#### Etapa 2: Exportar Dashboard
5. **Clique em "Exportar Dashboard"**
   - Procure pelo botão green "Exportar" (geralmente no topo/sidebar)
   - Ou no painel inferior

6. **Confirme na caixa de diálogo**
   ```
   Alert esperado:
   ✅ DASHBOARD EXPORTADO COM SUCESSO!
   
   📊 FILTROS DE DADOS ATIVOS:
      filial, periodo, risco
   
   🚫 FILTROS REMOVIDOS: 0
   
   💡 O dashboard é totalmente interativo offline!
   ```

7. **Salve o arquivo**
   - Local: Downloads ou local configurado
   - Nome: `Dashboard_Juridico_LexOpsInsight.html`

#### Etapa 3: Abrir HTML Exportado (Offline)
8. **Desconecte a internet ou abra em novo navegador privado**
   - Desativar Wi-Fi/LAN, OU
   - Abrir em navegação privada/incógnita

9. **Abra o HTML exportado**
   - Navegue até o arquivo salvo
   - Abra com duplo clique

10. **Verifique o Console**
    - F12 → Console
    - Procure por:
    ```
    ✅ MODO OFFLINE ATIVADO
    📊 Filtros de Dados disponíveis: filial, periodo, risco
    🚫 Filtros removidos: {...}
    ```

11. **Verifique o Badge Visual**
    - Procure no **canto superior direito** por:
    ```
    🔴 MODO OFFLINE
    Filtros: filial, periodo, risco
    ```

12. **Clique no Badge**
    - Deve mostrar alert com detalhes:
    ```
    MODO OFFLINE - DASHBOARD INTERATIVO
    
    📊 Filtros Ativos:
    filial, periodo, risco
    
    📅 Capturado em: [data/hora]
    
    💡 Este dashboard é totalmente funcional offline.
    ```

13. **Teste Interatividade**
    - Tabela deve ter dados visíveis
    - Gráficos devem estar renderizados
    - Filtros devem estar pré-aplicados (mostrando apenas dados filtrados)
    - Clique nos filtros para mudar valores
    - Dashboard deve responder em tempo real

### ✅ Sucesso
- UI carrega sem erros
- Badge 🔴 MODO OFFLINE aparece
- Console não mostra tentativas de fetch()
- Filtros funcionam pré-aplicados
- Pode mudar filtros em tempo real
- Sem botão "Exportar" visível (modo client)

### ❌ Falhas Comuns
| Problema | Causa | Solução |
|----------|-------|---------|
| Console mostra erros de fetch | API tentando conectar | Desconectar internet completamente |
| Badge não aparece | Script de hydration não injetado | Verifique console por erros JavaScript |
| Filtros não funcionam | loadOfflineData não executada | Verificar bootApplication no console |
| Dados vazios | dStore não carregado | Verifique OFFLINE_DATA no console |

---

## 🎯 TESTE 3: Data Hydration SEM Filtros Ativos

### Cenário
Admin exporta dashboard SEM nenhum filtro ativado.

### Passos

#### Etapa 1: Exportar Sem Filtros
1. **Abra a página em Admin Mode**
   - Importe dados normalmente
   - **NÃO ative nenhum filtro**

2. **Clique em "Exportar Dashboard"**

3. **Confirme o Alert**
   ```
   Esperado:
   ✅ DASHBOARD EXPORTADO COM SUCESSO!
   
   📊 FILTROS DE DADOS (nenhum ativo):
      Você pode aplicar filtros no HTML exportado
   
   🚫 FILTROS REMOVIDOS: 0
   ```

4. **Salve o arquivo**

#### Etapa 2: Abrir e Testar Filtros
5. **Abra o HTML offline**
   - Mesmos passos do TESTE 2, etapa 3

6. **Verifique que NÃO há filtros pré-aplicados**
   - Badge mostra: `Filtros: Use os filtros abaixo`
   - Tabela mostra TODOS os dados
   - Gráficos mostram 100% dos dados

7. **Teste Aplicar Filtros Manualmente**
   - Procure por controles de filtro (geralmente no topo)
   - Clique em um filtro e altere o valor
   - Dashboard deve atualizar em tempo real
   - Dados devem ser filtrados corretamente

8. **Teste Múltiplos Filtros**
   - Ative 2-3 filtros simultaneamente
   - Todos devem funcionar
   - Dashboard deve responder

### ✅ Sucesso
- Exportação sem erros
- Alert mostra "nenhum ativo" corretamente
- HTML abre offline
- Filtros estão funcionais (não pré-aplicados)
- Pode aplicar filtros ao vivo
- Dashboard responde em tempo real

---

## 🎯 TESTE 4: Logos Premium (Visual)

### Cenário
Validar que logos têm estilo premium e alinhamento perfeito.

### Passos

#### Etapa 1: Verificar Logos Admin
1. **Abra a página em Admin Mode**

2. **Procure no painel esquerdo superior**
   - Deve haver um container com logo "LexOps Insight"
   - Logo não deve ter bordas ou caixas visíveis

3. **Verifique as características**
   - ✅ Logo tem fundo transparente
   - ✅ Logo não tem borda visível
   - ✅ Logo não projeta sombra
   - ✅ Logo tem tamanho proporcional (não gigante)

#### Etapa 2: Adicionar Logos de Terceiros
4. **Clique em "Logo Cliente"**
   - Escolha uma imagem (.jpg, .png, .svg)
   - Upload deve funcionar
   - Logo deve aparecer na **barra de cabeçalho**

5. **Clique em "Logo Escritório"**
   - Escolha outra imagem
   - Logo deve aparecer na **barra de cabeçalho** (lado oposto)

6. **Verifique o Alinhamento**
   - Logos devem estar:
     - ✅ Centrados verticalmente na barra
     - ✅ Com respiro do título central (gap visível)
     - ✅ Sem "caixas" ou bordas ao redor
     - ✅ Proporcional (não gigantes, não minúsculos)

#### Etapa 3: Redimensionar Janela
7. **Redimensione o navegador**
   - Faça a janela mais estreita (900px)
   - Logos devem escalar proporcionalmente
   - Não devem desaparecer ou quebrar layout

8. **Faça a janela mais larga (1400px+)**
   - Logos devem escalar proporcionalmente
   - Respiro do título deve se manter

#### Etapa 4: Hover Effect
9. **Mova o mouse sobre os logos**
   - Logos devem ter transição suave (scale 1.05)
   - Não deve haver "pulo" visual
   - Cursor deve virar "pointer"

#### Etapa 5: Logos no HTML Exportado
10. **Exporte o dashboard**
    - Com ou sem filtros

11. **Abra o HTML exportado**

12. **Verifique logos no HTML**
    - Logos devem aparecer idênticos ao admin
    - Sem mudanças de tamanho
    - Mesmo alinhamento
    - Mesmos efeitos de hover

### ✅ Sucesso
- Logos sem bordas/backgrounds
- Alinhamento vertical perfeito
- Respiro adequado (gap visível)
- Tamanho proporcional (50px max)
- Responsivos (redimensionamento)
- Hover effect suave
- Idênticos em admin e exported HTML

### ❌ Falhas Comuns
| Problema | Causa | Solução |
|----------|-------|---------|
| Logos gigantes | max-height não aplicado | Verificar CSS em DevTools |
| Logos com borda | border não removido | Verificar classes/inline styles |
| Logos desalinhados | gap/align-items ausente | Verificar header-section CSS |
| Hover brusco | sem transition | Verificar transform property |

---

## 🎯 TESTE 5: Segurança (Credentials Bloqueadas)

### Cenário
Validar que credenciais NUNCA são exportadas.

### Passos

1. **Abra o Console**
   - F12 → Console

2. **Injete dados com credentials (simulado)**
   ```javascript
   window.ACTIVE_FILTERS = {
       filial: 'SP',
       token: 'secret-abc-123',
       apiKey: 'key-xyz-789',
       userId: 'user-12345'
   };
   ```
   (Copie e cole no console, pressione Enter)

3. **Execute a captura de estado**
   ```javascript
   const result = captureOfflineState();
   console.log(result);
   ```
   (Copie e cole no console, pressione Enter)

4. **Verifique o resultado**
   - Procure no console por:
   ```
   ✅ [EXPORTAR] filial = 'SP'
   🔒 [BLOQUEADO] token (SEGURANÇA)
   🔒 [BLOQUEADO] apiKey (SEGURANÇA)
   🔒 [BLOQUEADO] userId (SEGURANÇA)
   ```

5. **Verifique o objeto capturado**
   - `result.filters` deve conter APENAS `{filial: 'SP'}`
   - `result.filters` NÃO deve conter `token`, `apiKey`, `userId`

### ✅ Sucesso
- Credentials automaticamente bloqueados
- Console mostra logs de bloqueio (🔒)
- HTML exportado NUNCA contém credenciais

---

## 🎯 TESTE 6: Compatibilidade com Modo Normal

### Cenário
Validar que modo online (com token) continua funcionando.

### Passos

1. **Abra a página com token**
   ```
   index.html?token=seu-token-valido
   ```

2. **Admin Mode deve funcionar normalmente**
   - Painel lateral esquerdo deve estar visível
   - Importação deve funcionar
   - Logos devem funcionar
   - Exportação deve funcionar

3. **Console não deve mostrar logs offline**
   - Não deve ver "MODO OFFLINE ATIVADO"
   - Deve ver processos normais de boot

### ✅ Sucesso
- Modo online não afetado
- Sem regressões
- Funcionalidade admin intacta

---

## 📊 Resumo de Testes

| Teste | Status | Notas |
|-------|--------|-------|
| 1. Implementação (Automático) | ✅ | Deve passar 100% |
| 2. Data Hydration COM Filtros | ✅ | Filtros pré-aplicados funcionam |
| 3. Data Hydration SEM Filtros | ✅ | Pode aplicar filtros offline |
| 4. Logos Premium | ✅ | Visual limpo e responsivo |
| 5. Segurança (Credentials) | ✅ | Nenhuma credencial exportada |
| 6. Compatibilidade | ✅ | Modo online não afetado |

---

## 🐛 Troubleshooting

### Problema: "MODO OFFLINE não detectado"
**Causa:** window.IS_OFFLINE_MODE não injetado
**Solução:** 
1. Verifique se HTML foi gerado corretamente
2. Procure no console do HTML exportado por erros
3. Verifique se bootApplication foi executada

### Problema: "Filtros não funcionam offline"
**Causa:** loadOfflineData não carregou filters
**Solução:**
1. No console, execute: `console.log(window.OFFLINE_DATA)`
2. Verifique se `filters` não está vazio
3. Procure por erros de rendering em `renderAll()`

### Problema: "Logos não aparecem"
**Causa:** dataURL não foi capturado corretamente
**Solução:**
1. Verifique se upload funcionou em admin mode
2. No console, execute: `console.log(window.OFFLINE_DATA.logoData)`
3. Procure por erro de `applyLogos()`

### Problema: "Alert não mostra relatório"
**Causa:** Formatação incorreta de template string
**Solução:**
1. Verifique console por SyntaxError
2. Procure pela função `exportConsolidatedHTML()`
3. Verifique if há quebras em template strings

---

## 📞 Suporte

Se encontrar problemas não listados aqui:

1. **Verifique o Console (F12)**
   - Procure por erros em vermelho
   - Copie a mensagem completa

2. **Procure por Logs Específicos**
   - "🧪 TESTE AUTOMATIZADO"
   - "✅ MODO OFFLINE"
   - "🔒 [BLOQUEADO]"

3. **Consulte a Documentação**
   - `IMPLEMENTAÇÃO_OFFLINE_FIRST.md` para detalhes técnicos

---

**Status:** ✅ Pronto para Testes Completos  
**Última Atualização:** 2025-02-01
