import { sqlIdentifier } from '../../util/sql';

import type { TableIndex, TableRelation } from '../../types';

/** A SQL statement and its positional binds, ready for `driver.execute`. */
export interface SnowflakeQuery {
  sqlText: string;
  binds: string[];
}

export function tablesQuery(database: string, schema: string): SnowflakeQuery {
  return {
    sqlText: `SELECT TABLE_NAME AS table_name, TABLE_TYPE AS table_type
FROM ${sqlIdentifier(database)}.INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = ?
AND TABLE_TYPE IN ('BASE TABLE', 'VIEW', 'MATERIALIZED VIEW', 'EXTERNAL TABLE')
ORDER BY TABLE_NAME`,
    binds: [schema],
  };
}

export function columnsQuery(database: string, schema: string): SnowflakeQuery {
  return {
    sqlText: `SELECT
  TABLE_NAME AS table_name,
  COLUMN_NAME AS column_name,
  DATA_TYPE AS data_type,
  IS_NULLABLE AS is_nullable,
  ORDINAL_POSITION AS ordinal_position,
  NUMERIC_PRECISION AS numeric_precision,
  NUMERIC_SCALE AS numeric_scale
FROM ${sqlIdentifier(database)}.INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = ?
ORDER BY TABLE_NAME, ORDINAL_POSITION`,
    binds: [schema],
  };
}

export function columnNullable(isNullable: string): boolean {
  if (isNullable === 'YES') {
    return true;
  }
  if (isNullable === 'NO') {
    return false;
  }
  throw new Error(`Snowflake IS_NULLABLE is: ${isNullable}`);
}

/** Lower-case the keys of a `SHOW ...` row; the driver preserves their original case. */
function lowerKeys(row: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) fields[key.toLowerCase()] = value;
  return fields;
}

function keyText(row: Record<string, unknown>, name: string): string {
  const value = row[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Snowflake metadata row is missing '${name}'`);
  }
  return value;
}

export function primaryKeysQuery(database: string, schema: string): SnowflakeQuery {
  return {
    sqlText: `SHOW PRIMARY KEYS IN SCHEMA ${sqlIdentifier(database)}.${sqlIdentifier(schema)}`,
    binds: [],
  };
}

export function primaryIndexes(rows: Record<string, unknown>[]): { table: string; index: TableIndex }[] {
  const groups = new Map<string, { table: string; name: string; columns: [number, string][] }>();
  for (const raw of rows) {
    const row = lowerKeys(raw);
    const table = keyText(row, 'table_name');
    const name = keyText(row, 'constraint_name');
    const sequence = Number(row.key_sequence);
    if (!Number.isInteger(sequence) || sequence < 1) {
      throw new Error(`Snowflake primary key is missing key sequence: ${String(row.key_sequence)}`);
    }
    const key = `${name}\0${table}`;
    const columns = groups.get(key)?.columns ?? [];
    columns.push([sequence, keyText(row, 'column_name')]);
    groups.set(key, { table, name, columns });
  }
  return [...groups.values()].map(({ table, name, columns }) => ({
    table,
    index: {
      name,
      columns: columns.sort(([a], [b]) => a - b).map(([, column]) => column),
      unique: true,
      primary: true,
    },
  }));
}

export function importedKeysQuery(database: string, schema: string): SnowflakeQuery {
  return {
    sqlText: `SHOW IMPORTED KEYS IN SCHEMA ${sqlIdentifier(database)}.${sqlIdentifier(schema)}`,
    binds: [],
  };
}

export function importedRelations(rows: Record<string, unknown>[], database: string, schema: string): TableRelation[] {
  const same = (value: string, expected: string) => value.toUpperCase() === expected.toUpperCase();
  const groups = new Map<string, { name: string; from: string; to: string; columns: [number, string, string][] }>();
  for (const raw of rows) {
    const row = lowerKeys(raw);
    if (!same(keyText(row, 'fk_database_name'), database)) continue;
    if (!same(keyText(row, 'pk_database_name'), database)) continue;
    if (!same(keyText(row, 'fk_schema_name'), schema)) continue;
    if (!same(keyText(row, 'pk_schema_name'), schema)) continue;
    const name = keyText(row, 'fk_name');
    const from = keyText(row, 'fk_table_name');
    const sequence = Number(row.key_sequence);
    if (!Number.isInteger(sequence) || sequence < 1) {
      throw new Error(`Snowflake imported key is missing key sequence: ${String(row.key_sequence)}`);
    }
    const key = `${name}\0${from}`;
    const columns = groups.get(key)?.columns ?? [];
    columns.push([sequence, keyText(row, 'fk_column_name'), keyText(row, 'pk_column_name')]);
    groups.set(key, { name, from, to: keyText(row, 'pk_table_name'), columns });
  }
  return [...groups.values()].map(({ name, from, to, columns }) => {
    const ordered = columns.sort(([a], [b]) => a - b);
    return {
      name,
      kind: 'foreign-key',
      from: { table: from, columns: ordered.map(([, fk]) => fk) },
      to: { table: to, columns: ordered.map(([, , pk]) => pk) },
    };
  });
}
