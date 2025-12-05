# 🔍 Verificar Portas 80 e 443 - Comandos para Executar

## ✅ Vamos Verificar Primeiro!

Execute estes comandos na VPS e me envie os resultados.

---

## 🚀 Opção 1: Script Automático (Mais Fácil)

Execute este comando para ver tudo de uma vez:

```bash
# Criar e executar script de verificação
cat > /tmp/verificar_portas.sh << 'EOF'
#!/bin/bash
echo "═══════════════════════════════════════════════════"
echo "  🔍 VERIFICAÇÃO DE PORTAS"
echo "═══════════════════════════════════════════════════"
echo ""
echo "1️⃣ PORTA 80:"
sudo ss -tlnp | grep :80 || echo "   ✅ LIVRE"
echo ""
echo "2️⃣ PORTA 443:"
sudo ss -tlnp | grep :443 || echo "   ✅ LIVRE"
echo ""
echo "3️⃣ STATUS NGINX:"
sudo systemctl status nginx --no-pager | head -3
echo ""
echo "4️⃣ STATUS OPENLITESPEED:"
sudo systemctl status lsws --no-pager | head -3
echo ""
echo "5️⃣ VHOSTS OPENLITESPEED:"
sudo ls -la /usr/local/lsws/conf/vhosts/ 2>/dev/null | grep api || echo "   ✅ Nenhum vHost API"
echo ""
echo "6️⃣ FIREWALL:"
sudo firewall-cmd --list-ports 2>/dev/null || echo "   ℹ️ Firewall não configurado"
EOF

chmod +x /tmp/verificar_portas.sh
/tmp/verificar_portas.sh
```

---

## 📋 Opção 2: Comandos Individuais (Mais Detalhado)

Execute um por um e me envie os resultados:

### 1. Verificar Porta 80

```bash
sudo ss -tlnp | grep :80
```

### 2. Verificar Porta 443

```bash
sudo ss -tlnp | grep :443
```

### 3. Status do Nginx

```bash
sudo systemctl status nginx
```

### 4. Status do OpenLiteSpeed

```bash
sudo systemctl status lsws
```

### 5. Verificar vHosts do OpenLiteSpeed

```bash
sudo ls -la /usr/local/lsws/conf/vhosts/ | grep api
```

### 6. Verificar Firewall

```bash
sudo firewall-cmd --list-ports
sudo firewall-cmd --query-port=80/tcp
sudo firewall-cmd --query-port=443/tcp
```

---

## 📊 O que Fazer com os Resultados

Depois de executar os comandos:

1. **Copie os resultados** de cada comando
2. **Me envie aqui** no chat
3. **Vou analisar** e te dizer exatamente o que fazer!

---

## ✅ Exemplo de Resultados Esperados

### Se Porta 80 estiver LIVRE:
```bash
$ sudo ss -tlnp | grep :80
(nenhum resultado)
```
✅ **OK! Podemos usar!**

### Se Porta 80 estiver em USO:
```bash
$ sudo ss -tlnp | grep :80
LISTEN 0 128 *:80 *:* users:(("nginx",pid=1234))
```
⚠️ **Nginx já está usando. Precisamos verificar configuração.**

### Se OpenLiteSpeed estiver usando:
```bash
$ sudo ss -tlnp | grep :80
LISTEN 0 128 *:80 *:* users:(("lshttpd",pid=5678))
```
⚠️ **OpenLiteSpeed está usando. Precisamos desabilitar vHost da API.**

---

## 🎯 Próximo Passo

**Execute os comandos e me envie os resultados!** 

Com essas informações, vou criar um plano específico para sua situação! 🚀

---

**Comece pelo script automático (Opção 1) - é mais rápido!** ⚡

