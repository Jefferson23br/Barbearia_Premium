# 🔧 Solução para Conflito OpenLiteSpeed vs Nginx

## 📊 Situação Atual

- ✅ **OpenLiteSpeed** usando portas **80 e 443**
- ✅ **Nginx** usando porta **8080** (API)
- ⚠️ **Conflito:** Dois serviços não podem usar as mesmas portas

---

## 💡 3 Soluções Possíveis

### Solução 1: OpenLiteSpeed Proxy para Nginx (MAIS SIMPLES) ⭐

**Como funciona:**
- OpenLiteSpeed continua nas portas 80/443
- OpenLiteSpeed recebe requisições para `api.protesecapilarcuiaba.com.br`
- OpenLiteSpeed faz proxy reverso para Nginx na porta 8080
- SSL fica no OpenLiteSpeed (já configurado pelo CyberPanel)

**Vantagens:**
- ✅ Não precisa parar serviços
- ✅ Usa SSL do CyberPanel/OpenLiteSpeed
- ✅ Mais simples de configurar

**Desvantagens:**
- ⚠️ Mais uma camada (OpenLiteSpeed → Nginx → Node.js)

---

### Solução 2: Certbot Standalone (TEMPORÁRIO)

**Como funciona:**
1. Parar OpenLiteSpeed temporariamente (1-2 minutos)
2. Gerar certificado SSL com Certbot standalone
3. Reiniciar OpenLiteSpeed
4. Configurar Nginx com certificado gerado
5. Resolver conflito de portas depois

**Vantagens:**
- ✅ Gera certificado mesmo com porta ocupada
- ✅ Controle total sobre Nginx

**Desvantagens:**
- ⚠️ Precisa parar OpenLiteSpeed temporariamente
- ⚠️ Ainda precisa resolver conflito de portas depois

---

### Solução 3: Nginx com Porta Diferente + Cloudflare SSL (ALTERNATIVA)

**Como funciona:**
- Nginx continua na porta 8080
- Cloudflare fornece SSL (já configurado)
- Cloudflare faz proxy para porta 8080

**Vantagens:**
- ✅ Sem conflitos
- ✅ SSL gratuito do Cloudflare
- ✅ Funciona imediatamente

**Desvantagens:**
- ⚠️ URL fica: `https://api...com.br:8080` (se Cloudflare não proxyar)
- ⚠️ Menos ideal

---

## 🎯 RECOMENDAÇÃO: Solução 1 (OpenLiteSpeed Proxy)

**Por quê?**
- Mais simples
- Não precisa parar serviços
- Já tem infraestrutura pronta (CyberPanel)
- SSL já configurado

---

## 📋 Plano de Implementação (Solução 1)

### PASSO 1: Verificar Configuração Atual

```bash
# Ver vHosts do OpenLiteSpeed
sudo ls -la /usr/local/lsws/conf/vhosts/

# Verificar se existe vHost para API
sudo ls -la /usr/local/lsws/conf/vhosts/ | grep api

# Ver configuração atual
sudo cat /usr/local/lsws/conf/vhosts/*/vhconf.conf | grep -A 10 api
```

### PASSO 2: Configurar OpenLiteSpeed para Proxy

Via CyberPanel ou manualmente:
- Criar/configurar vHost para `api.protesecapilarcuiaba.com.br`
- Configurar como proxy reverso para `127.0.0.1:8080`
- Ativar SSL no CyberPanel

---

## ❓ Qual Solução Você Prefere?

**Opção A:** OpenLiteSpeed Proxy (mais simples) ⭐  
**Opção B:** Certbot Standalone (mais controle)  
**Opção C:** Manter porta 8080 + Cloudflare SSL (mais rápido)

---

**Execute os comandos do PASSO 1 e me envie os resultados para decidirmos!** 🚀

