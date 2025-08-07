-- This file should undo anything in `up.sql`
DELETE FROM locations
WHERE id = 1 OR id = 2;
