import type { LogicalType } from '../../types';

const NUMERIC = new Set([
  'NUMBER',
  'DECIMAL',
  'NUMERIC',
  'DECFLOAT',
  'INT',
  'INTEGER',
  'BIGINT',
  'SMALLINT',
  'TINYINT',
  'BYTEINT',
  'FLOAT',
  'FLOAT4',
  'FLOAT8',
  'REAL',
  'DOUBLE',
]);

const STRING = new Set(['VARCHAR', 'CHAR', 'CHARACTER', 'STRING', 'TEXT', 'BINARY', 'VARBINARY']);

const DATE = /^(?:DATE|DATETIME|TIME|TIMESTAMP(?:_NTZ|_LTZ|_TZ)?)$/;

function baseName(type: string): string {
  const base = type.trim().toUpperCase();
  return (base === 'DOUBLE PRECISION' ? 'DOUBLE' : base).replace(/\s*\(.*\)$/, '');
}

export function logicalType(type: string): LogicalType {
  const name = baseName(type);
  if (NUMERIC.has(name)) return 'numeric';
  if (STRING.has(name)) return 'string';
  if (name === 'BOOLEAN') return 'boolean';
  if (DATE.test(name)) return 'date';
  return 'unknown';
}

export function formatColumnType(row: {
  dataType: string;
  numericPrecision?: number | null;
  numericScale?: number | null;
}): string {
  const name = baseName(row.dataType);
  if (
    (name === 'NUMBER' || name === 'DECIMAL' || name === 'NUMERIC') &&
    row.numericPrecision != null &&
    row.numericScale != null
  ) {
    return `${name}(${row.numericPrecision},${row.numericScale})`;
  }
  return name;
}
