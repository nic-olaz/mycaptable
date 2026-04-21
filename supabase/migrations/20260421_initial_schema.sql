-- MyCapTable – Initial Schema
-- Deployt: 2026-04-21

-- companies
CREATE TABLE IF NOT EXISTS companies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  legal_form      text DEFAULT 'GmbH',
  founded_at      date,
  share_capital   numeric(15,2) NOT NULL,
  currency        text DEFAULT 'EUR',
  user_id         uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- shareholders
CREATE TABLE IF NOT EXISTS shareholders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid REFERENCES companies(id) ON DELETE CASCADE,
  name            text NOT NULL,
  share_percent   numeric(7,4) NOT NULL,
  shares          integer,
  share_value     numeric(15,2),
  shareholder_type text DEFAULT 'founder',
  created_at      timestamptz DEFAULT now()
);

-- rounds
CREATE TABLE IF NOT EXISTS rounds (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid REFERENCES companies(id) ON DELETE CASCADE,
  name            text NOT NULL,
  round_type      text DEFAULT 'equity',
  pre_money       numeric(15,2),
  investment      numeric(15,2),
  post_money      numeric(15,2) GENERATED ALWAYS AS (pre_money + investment) STORED,
  investor_percent numeric(7,4),
  closed_at       date,
  created_at      timestamptz DEFAULT now()
);

-- round_participants
CREATE TABLE IF NOT EXISTS round_participants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id        uuid REFERENCES rounds(id) ON DELETE CASCADE,
  investor_name   text NOT NULL,
  investment      numeric(15,2) NOT NULL,
  share_percent   numeric(7,4) NOT NULL,
  created_at      timestamptz DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies: nur eigene Daten sehen/bearbeiten
CREATE POLICY IF NOT EXISTS "Users own companies" ON companies
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users own shareholders via company" ON shareholders
  FOR ALL USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users own rounds via company" ON rounds
  FOR ALL USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users own round_participants via round" ON round_participants
  FOR ALL USING (
    round_id IN (
      SELECT r.id FROM rounds r
      JOIN companies c ON r.company_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );
