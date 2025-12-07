# ⚡ Correção Rápida - Erro VARCHAR(2)

## 🔴 Problema

Erro ao inserir usuário: `value too long for type character varying(2)`

O campo `tipo_contrato` está como `VARCHAR(2)` mas precisa aceitar `'CLT'` (3 caracteres).

---

## ✅ Solução - Execute Este Comando No DBeaver:

```sql
ALTER TABLE protese.usuarios_administrativos 
    ALTER COLUMN tipo_contrato TYPE VARCHAR(3);
```

---

## ✨ Pronto!

Depois de executar esse comando, você pode inserir os usuários normalmente. 

**Execute este comando primeiro, depois tente inserir os usuários novamente!**

