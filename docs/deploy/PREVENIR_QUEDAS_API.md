# 🛡️ Prevenir Quedas da API - Monitoramento e Estabilização

Guia para prevenir que a API caia novamente e monitorar sua saúde.

---

## 🔍 Análise do Problema

Se a API reiniciou **16 vezes** (↺ 16), isso indica:
- ❌ Crash recorrente (erro não tratado)
- ❌ Problema de memória (OOM - Out of Memory)
- ❌ Erro de conexão com banco
- ❌ Timeout ou erro não capturado

---

## 🔧 PASSO 1: Verificar Logs de Erro Detalhados

```bash
# Ver todos os erros
pm2 logs api-protese-capilar --err --lines 100

# Ver logs do sistema
journalctl -u pm2-root -n 100

# Verificar se há erros de memória
dmesg | grep -i "killed process"
```

---

## 🔧 PASSO 2: Configurar Limites de Recursos no PM2

Criar arquivo `ecosystem.config.js` na pasta do backend:

```bash
cd /home/cyberpanel/app/backend
nano ecosystem.config.js
```

**Conteúdo:**

```javascript
module.exports = {
  apps: [{
    name: 'api-protese-capilar',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',  // Reiniciar se usar mais de 500MB
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,  // Máximo de 10 restarts em 1 minuto
    min_uptime: '10s',  // Considerar estável após 10 segundos
    restart_delay: 4000,  // Esperar 4 segundos entre restarts
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

**Aplicar configuração:**

```bash
# Parar processo atual
pm2 delete api-protese-capilar

# Iniciar com novo config
pm2 start ecosystem.config.js

# Salvar
pm2 save
```

---

## 🔧 PASSO 3: Adicionar Tratamento de Erros no server.js

Verificar se o `server.js` tem tratamento de erros global:

```javascript
// No final do server.js, antes de app.listen()

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  // Não encerrar o processo imediatamente
  // PM2 vai reiniciar automaticamente
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  console.error('Promise:', promise);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM recebido, encerrando graciosamente...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});
```

---

## 🔧 PASSO 4: Configurar Monitoramento de Memória

```bash
# Ver uso de memória em tempo real
pm2 monit

# Ou verificar periodicamente
watch -n 5 'pm2 list'
```

**Criar script de monitoramento:**

```bash
nano /home/cyberpanel/app/backend/monitor.sh
```

**Conteúdo:**

```bash
#!/bin/bash

# Verificar uso de memória
MEM=$(pm2 jlist | jq -r '.[] | select(.name=="api-protese-capilar") | .monit.memory')
MEM_MB=$((MEM / 1024 / 1024))

echo "Memória usada: ${MEM_MB}MB"

# Se usar mais de 400MB, alertar
if [ $MEM_MB -gt 400 ]; then
    echo "⚠️ ALERTA: Uso de memória alto (${MEM_MB}MB)"
    # Opcional: enviar email ou notificação
fi

# Verificar se está online
STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="api-protese-capilar") | .pm2_env.status')
if [ "$STATUS" != "online" ]; then
    echo "❌ API está offline! Status: $STATUS"
    # Reiniciar
    pm2 restart api-protese-capilar
fi
```

**Tornar executável e agendar:**

```bash
chmod +x /home/cyberpanel/app/backend/monitor.sh

# Adicionar ao crontab (verificar a cada 5 minutos)
crontab -e
# Adicionar linha:
*/5 * * * * /home/cyberpanel/app/backend/monitor.sh >> /home/cyberpanel/app/backend/monitor.log 2>&1
```

---

## 🔧 PASSO 5: Verificar Conexão com Banco

Adicionar health check mais robusto no `server.js`:

```javascript
// Endpoint de health check melhorado
app.get('/health', async (req, res) => {
  try {
    // Testar conexão com banco
    const dbTest = await pool.query('SELECT NOW()');
    
    // Verificar memória
    const memUsage = process.memoryUsage();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

---

## 🔧 PASSO 6: Configurar Logs Rotativos

```bash
# Instalar pm2-logrotate
pm2 install pm2-logrotate

# Configurar
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 🔧 PASSO 7: Verificar Configuração do OpenLiteSpeed

Verificar se o proxy reverso está configurado corretamente:

```bash
# Ver configuração do vHost
cat /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br/vhost.conf | grep -A 10 "proxy"
```

**Se não estiver configurado, adicionar:**

```bash
nano /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br/vhost.conf
```

**Adicionar contexto de proxy:**

```
context / {
  type                    proxy
  handler                 lsphp
  location                http://localhost:3001
  addDefaultCharset       off
}
```

**Reiniciar OpenLiteSpeed:**

```bash
sudo systemctl restart lsws
```

---

## 📊 PASSO 8: Monitoramento Contínuo

### Opção A: PM2 Plus (Gratuito)

```bash
# Conectar ao PM2 Plus
pm2 link [secret] [public]
```

### Opção B: Script Simples

Criar dashboard básico:

```bash
# Ver status completo
pm2 status
pm2 describe api-protese-capilar
```

---

## 🧪 PASSO 9: Testes de Carga

Testar se a API aguenta carga:

```bash
# Instalar Apache Bench
sudo dnf install -y httpd-tools

# Teste de carga (100 requisições, 10 simultâneas)
ab -n 100 -c 10 http://localhost:3001/health
```

---

## 📋 Checklist de Prevenção

- [ ] Configurar `ecosystem.config.js` com limites de memória
- [ ] Adicionar tratamento de erros global no `server.js`
- [ ] Configurar `pm2-logrotate` para logs
- [ ] Criar script de monitoramento
- [ ] Verificar configuração do OpenLiteSpeed
- [ ] Testar health check melhorado
- [ ] Configurar alertas (opcional)

---

## 🆘 Comandos Rápidos de Recuperação

```bash
# Ver status
pm2 status

# Ver logs de erro
pm2 logs api-protese-capilar --err --lines 50

# Reiniciar
pm2 restart api-protese-capilar

# Ver uso de recursos
pm2 monit

# Verificar memória
free -h
```

---

## 📝 Próximos Passos Recomendados

1. **Implementar tratamento de erros** no `server.js`
2. **Configurar `ecosystem.config.js`** com limites
3. **Instalar `pm2-logrotate`** para gerenciar logs
4. **Criar script de monitoramento** básico
5. **Verificar configuração do OpenLiteSpeed**

---

**Última atualização**: Dezembro 2024




