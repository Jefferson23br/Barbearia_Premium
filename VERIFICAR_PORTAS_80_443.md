# 🔍 Verificar Portas 80 e 443 ANTES de Configurar SSL

## ✅ Excelente Ideia!

Vamos verificar o que está usando as portas 80 e 443 antes de fazer qualquer mudança.

---

## 🔍 PASSO 1: Verificar Porta 80 (HTTP)

Execute estes comandos na VPS:

```bash
# Método 1: Usando ss (mais moderno)
sudo ss -tlnp | grep :80

# Método 2: Usando netstat (alternativa)
sudo netstat -tlnp | grep :80

# Método 3: Ver todos os processos usando portas
sudo lsof -i :80
```

**O que procurar:**
- Se aparecer `nginx` → Nginx já está usando
- Se aparecer `litespeed` ou `lshttpd` → OpenLiteSpeed está usando
- Se aparecer `httpd` ou `apache` → Apache está usando
- Se **não aparecer nada** → Porta 80 está livre! ✅

---

## 🔍 PASSO 2: Verificar Porta 443 (HTTPS)

```bash
# Método 1: Usando ss
sudo ss -tlnp | grep :443

# Método 2: Usando netstat
sudo netstat -tlnp | grep :443

# Método 3: Ver todos os processos
sudo lsof -i :443
```

**O que procurar:**
- Geralmente não deve estar em uso ainda
- Se aparecer algo, anote qual serviço

---

## 🔍 PASSO 3: Verificar Serviços Ativos

```bash
# Ver status do Nginx
sudo systemctl status nginx

# Ver status do OpenLiteSpeed
sudo systemctl status lsws

# Ver todas as portas que o Nginx está usando
sudo ss -tlnp | grep nginx

# Ver todas as portas que o OpenLiteSpeed está usando
sudo ss -tlnp | grep litespeed
```

---

## 🔍 PASSO 4: Verificar Configuração do OpenLiteSpeed

```bash
# Ver se existe vHost para a API
sudo ls -la /usr/local/lsws/conf/vhosts/ | grep api

# Ver portas configuradas no OpenLiteSpeed
sudo grep -r "listen.*80" /usr/local/lsws/conf/
sudo grep -r "listen.*443" /usr/local/lsws/conf/
```

---

## 📊 Interpretando os Resultados

### Cenário 1: Porta 80 Livre ✅
```
(nenhum resultado)
```
**Ação:** Podemos usar a porta 80 sem problemas!

### Cenário 2: OpenLiteSpeed Usando Porta 80 ⚠️
```
tcp LISTEN 0 128 *:80 *:* users:(("lshttpd",pid=1234))
```
**Ação:** 
- Verificar se está servindo a API
- Se estiver, precisamos desabilitar o vHost da API no OpenLiteSpeed
- Deixar OpenLiteSpeed usar 80/443 para outros sites (se houver)

### Cenário 3: Nginx Já Usando Porta 80 ✅
```
tcp LISTEN 0 128 *:80 *:* users:(("nginx",pid=1234))
```
**Ação:** 
- Nginx já está configurado
- Só precisamos adicionar a configuração SSL

### Cenário 4: Outro Serviço Usando Porta 80 ⚠️
```
tcp LISTEN 0 128 *:80 *:* users:(("httpd",pid=1234))
```
**Ação:** 
- Identificar o serviço
- Decidir se precisa parar ou mudar de porta

---

## 🔧 PASSO 5: Verificar Firewall

```bash
# Ver portas abertas no firewall
sudo firewall-cmd --list-ports

# Ver se porta 80 está aberta
sudo firewall-cmd --query-port=80/tcp

# Ver se porta 443 está aberta
sudo firewall-cmd --query-port=443/tcp

# Se não estiverem abertas, vamos abrir depois
```

---

## 📝 Formato para Reportar

Depois de executar os comandos, me envie os resultados neste formato:

```bash
# Resultado do comando 1
sudo ss -tlnp | grep :80
# [COLE O RESULTADO AQUI]

# Resultado do comando 2
sudo ss -tlnp | grep :443
# [COLE O RESULTADO AQUI]

# Resultado do comando 3
sudo systemctl status nginx
# [COLE O RESULTADO AQUI]

# Resultado do comando 4
sudo systemctl status lsws
# [COLE O RESULTADO AQUI]
```

---

## ✅ Checklist de Verificação

Execute todos estes comandos e me envie os resultados:

- [ ] `sudo ss -tlnp | grep :80`
- [ ] `sudo ss -tlnp | grep :443`
- [ ] `sudo systemctl status nginx`
- [ ] `sudo systemctl status lsws`
- [ ] `sudo ls -la /usr/local/lsws/conf/vhosts/ | grep api`
- [ ] `sudo firewall-cmd --list-ports`

---

**Execute os comandos e me envie os resultados! Assim posso te ajudar a configurar corretamente! 🚀**

