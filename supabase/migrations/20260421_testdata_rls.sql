-- Temporäre Policies für Testdaten mit user_id=null
-- Hintergrund: Die migrierten viprize GmbH Daten wurden ohne user_id eingetragen.
-- Diese Policies erlauben allen eingeloggten Usern das Lesen dieser Daten.
-- Kann nach Zuweisung der user_id entfernt werden.

CREATE POLICY "Allow null user_id read" ON companies
  FOR SELECT USING (user_id IS NULL);

CREATE POLICY "Allow null user_id shareholders read" ON shareholders
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE user_id IS NULL)
  );
