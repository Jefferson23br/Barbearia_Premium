# ✅ Testar SSL da API Após Ativação no CyberPanel

## 🧪 Testes Rápidos

### 1. Teste Básico (VPS)

```bash
curl -I https://api.protesecapilarcuiaba.com.br/health
```

**Esperado:** Status 200 OK

### 2. Teste Detalhado (VPS)

```bash
curl -v https://api.protesecapilarcuiaba.com.br/health 2>&1 | head -20
```

### 3. Teste no Navegador

Abra: `https://api.protesecapilarcuiaba.com.br/health`

### 4. Teste no PowerShell (Windows)

```powershell
curl https://api.protesecapilarcuiaba.com.br/health
```

---

## ✅ Resultados Esperados

- ✅ HTTPS funcionando
- ✅ Certificado válido
- ✅ Cadeado verde no navegador
- ✅ Resposta da API

---

**Execute e me diga o resultado!** 🚀

