# 📊 Análise de Conflito de Portas

## 🔍 Resultados da Verificação

### ✅ Portas em Uso

| Porta | Serviço | PID | Status |
|-------|---------|-----|--------|
| **80** | OpenLiteSpeed | 280129, 280131, 280132 | ⚠️ **CONFLITO** |
| **443** | OpenLiteSpeed | 280129, 280131, 280132 | ⚠️ **CONFLITO** |
| 8080 | Nginx | 280202, 280203, 280204 | ✅ OK (API atual) |
| 8081 | PowerDNS | 1217 | ✅ OK |
| 8090 | CyberPanel (lscpd) | 179106, 179109 | ✅ OK |

---

## ⚠️ PROBLEMA IDENTIFICADO

**OpenLiteSpeed está usando as portas 80 e 443!**

Isso significa:
- ❌ Nginx não pode usar porta 80/443 enquanto OpenLiteSpeed estiver usando
- ⚠️ Precisamos desabilitar o vHost da API no OpenLiteSpeed
- ✅ OpenLiteSpeed pode continuar servindo outros sites, mas não a API

---

## 🎯 SOLUÇÃO: Estratégia em 3 Passos

### Estratégia Recomendada:

1. **Verificar se OpenLiteSpeed tem vHost para API**
2. **Desabilitar vHost da API no OpenLiteSpeed** (se existir)
3. **Configurar Nginx para portas 80/443** (substituirá OpenLiteSpeed apenas para API)

---

## 📋 PLANO DE AÇÃO

### PASSO 1: Verificar vHosts do OpenLiteSpeed

Execute:

```bash
# Ver todos os vHosts
sudo ls -la /usr/local/lsws/conf/vhosts/

# Verificar se existe vHost para API
sudo ls -la /usr/local/lsws/conf/vhosts/ | grep api

# Ver configuração do OpenLiteSpeed (portas e domínios)
sudo grep -r "api.protesecapilarcuiaba.com.br" /usr/local/lsws/conf/ 2>/dev/null
```

### PASSO 2: Desabilitar vHost da API (se existir)

Se encontrar um vHost para `api.protesecapilarcuiaba.com.br`:

```bash
# Renomear para desabilitar
sudo mv /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br \
        /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br.disabled

# Reiniciar OpenLiteSpeed
sudo systemctl restart lsws

# Verificar se ainda está usando porta 80/443 para outros sites
sudo ss -tlnp | grep litespeed
```

### PASSO 3: Configurar Nginx para Portas 80/443

**IMPORTANTE:** O Nginx e OpenLiteSpeed **NÃO podem** escutar nas mesmas portas simultaneamente!

**Opções:**

#### Opção A: Nginx para API, OpenLiteSpeed para outros sites (Recomendado)

- OpenLiteSpeed continua usando 80/443 para outros sites
- Nginx usa 80/443 APENAS quando receber requisições para `api.protesecapilarcuiaba.com.br`
- Como fazer: Configurar OpenLiteSpeed para não processar requisições da API

#### Opção B: Nginx usar 80/443, OpenLiteSpeed mudar portas

- Mais complexo
- Pode afetar outros sites

#### Opção C: Certbot em modo standalone (Temporário)

- Parar OpenLiteSpeed temporariamente
- Gerar certificado SSL
- Reiniciar OpenLiteSpeed
- Configurar Nginx depois

---

## 🔧 SOLUÇÃO PRÁTICA RECOMENDADA

### Abordagem: Configurar OpenLiteSpeed para não servir a API

O OpenLiteSpeed pode continuar nas portas 80/443, mas vamos configurar para que:
1. OpenLiteSpeed **ignora** requisições para `api.protesecapilarcuiaba.com.br`
2. Nginx **processa** essas requisições nas portas 80/443

Mas isso é complexo. **Melhor abordagem:**

### ✅ SOLUÇÃO SIMPLES: Desabilitar API no OpenLiteSpeed

1. Desabilitar vHost da API no OpenLiteSpeed (se existir)
2. Nginx substitui OpenLiteSpeed nas portas 80/443 **apenas para a API**
3. OpenLiteSpeed continua servindo outros sites

**Problema:** Dois serviços não podem escutar na mesma porta simultaneamente!

---

## 💡 MELHOR SOLUÇÃO: Certbot Standalone

Como OpenLiteSpeed está usando 80/443, vamos usar uma estratégia diferente:

1. **Parar OpenLiteSpeed temporariamente** (apenas para gerar certificado)
2. **Gerar certificado SSL com Certbot standalone**
3. **Reiniciar OpenLiteSpeed**
4. **Configurar Nginx para usar certificado já gerado**

---

## 📝 Próximos Comandos para Executar

Execute estes comandos e me envie os resultados:

```bash
# 1. Ver vHosts do OpenLiteSpeed
sudo ls -la /usr/local/lsws/conf/vhosts/

# 2. Verificar se existe vHost para API
sudo ls -la /usr/local/lsws/conf/vhosts/ | grep api

# 3. Ver configuração de domínios no OpenLiteSpeed
sudo grep -r "api.protesecapilarcuiaba.com.br" /usr/local/lsws/conf/ 2>/dev/null

# 4. Ver status do OpenLiteSpeed
sudo systemctl status lsws --no-pager | head -10
```

---

## 🎯 Recomendação Final

Com base na análise, recomendo:

**Usar Certbot em modo STANDALONE:**
1. Parar OpenLiteSpeed temporariamente (1-2 minutos)
2. Gerar certificado SSL
3. Reiniciar OpenLiteSpeed
4. Configurar Nginx com certificado gerado
5. Nginx usará portas diferentes ou configuração especial

**OU**

**Verificar se podemos configurar OpenLiteSpeed para proxy da API:**
- OpenLiteSpeed faz proxy para Nginx na porta 8080
- Mantém SSL no OpenLiteSpeed
- Mais simples, mas menos controle

---

**Execute os comandos acima e me envie os resultados para decidirmos a melhor estratégia!** 🚀

