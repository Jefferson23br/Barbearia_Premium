# 🗄️ Schema do Banco de Dados - PostgreSQL

## 📋 Tabelas Principais

### 1. users (Usuários)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(14),
  role VARCHAR(20) DEFAULT 'client', -- 'client' | 'admin'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. plans (Planos/Pacotes)

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  uses_count INTEGER, -- Quantidade de usos (NULL = ilimitado)
  validity_days INTEGER, -- Dias de validade
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. user_plans (Planos Adquiridos)

```sql
CREATE TABLE user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  remaining_uses INTEGER,
  expires_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'expired' | 'cancelled'
  purchased_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. services (Serviços)

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  uses_cost INTEGER DEFAULT 1, -- Custo em "usos"
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. appointments (Agendamentos)

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  scheduled_at TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. transactions (Transações/Pagamentos)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID REFERENCES plans(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50), -- 'pix' | 'credit_card' | 'debit_card' | 'boleto'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  gateway_id VARCHAR(255), -- ID do gateway de pagamento
  gateway_response JSONB,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. usage_history (Histórico de Uso)

```sql
CREATE TABLE usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  user_plan_id UUID NOT NULL REFERENCES user_plans(id),
  service_id UUID REFERENCES services(id),
  appointment_id UUID REFERENCES appointments(id),
  uses_spent INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 8. notifications (Notificações)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- NULL = notificação em massa
  type VARCHAR(50) NOT NULL, -- 'appointment' | 'payment' | 'expiration' | 'promotion' | 'alert'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(20), -- 'email' | 'whatsapp' | 'sms' | 'in_app'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 9. invoices (Faturas/Notas Fiscais)

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  user_id UUID NOT NULL REFERENCES users(id),
  nfe_number VARCHAR(50),
  nfe_key VARCHAR(44), -- Chave de acesso NFe
  nfe_xml TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'issued' | 'cancelled'
  issued_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 10. nfe_logs (Logs de Integração NFe)

```sql
CREATE TABLE nfe_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  action VARCHAR(50), -- 'issue' | 'cancel' | 'status_check'
  request_data JSONB,
  response_data JSONB,
  status VARCHAR(20), -- 'success' | 'error'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 Relacionamentos

- `users` → `user_plans` (1:N)
- `plans` → `user_plans` (1:N)
- `users` → `appointments` (1:N)
- `services` → `appointments` (1:N)
- `users` → `transactions` (1:N)
- `plans` → `transactions` (1:N)
- `users` → `usage_history` (1:N)
- `user_plans` → `usage_history` (1:N)
- `transactions` → `invoices` (1:1)
- `invoices` → `nfe_logs` (1:N)

---

## 📊 Índices Recomendados

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX idx_user_plans_status ON user_plans(status);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_usage_history_user_id ON usage_history(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

---

*Schema baseado nas especificações do sistema*





