/**
 * AVA v4 - Node.js entry point
 * Registers all engines before exporting AVA.
 */

import { DuckDBEngine } from './duckdb';
import { JavaScriptEngine, PythonEngine } from './interpreter';
import { ClickHouseEngine, SupabaseEngine,SnowflakeEngine } from './remote';
import { registerEngine } from './engines';

registerEngine('duckdb', DuckDBEngine);
registerEngine('clickhouse', ClickHouseEngine);
registerEngine('supabase', SupabaseEngine);
registerEngine('snowflake', SnowflakeEngine);
registerEngine('javascript', JavaScriptEngine);
registerEngine('python', PythonEngine);

export { AVA } from './ava';

export type { JavaScriptEngine } from './interpreter';
export type {
  LLMConfig,
  AVAConfig,
  AnalysisConfig,
  EngineConfig,
  DuckDBEngineOptions,
  PythonEngineOptions,
  DataSourceConfig,
  ClickHouseSourceOptions,
  SnowflakeAuthenticator,
  SnowflakeSourceOptions,
  Schema,
  TableSchema,
  TableIndex,
  TableRelation,
  FieldMetadata,
  AnalysisEngine,
  ExecutionOptions,
  ExecutionResult,
  QueryLanguage,
  QueryDialect,
  AnalysisResponse,
  AnalysisStrategy,
  AnalysisStrategyConfig,
  AnalysisRuntime,
  DataContext,
  VisualizeResponse,
  ChartSpec,
  SuggestResult,
  ChartType,
  Profile,
  TableProfile,
  FieldProfile,
  ProfileOptions,
  ParsedProfileOptions,
  Metric,
  MetricId,
  MetricConfig,
  LogicalType,
} from './types';
