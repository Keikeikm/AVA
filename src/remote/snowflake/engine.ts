import type {AnalysisEngine,DataContext,DataSourceConfig,ExecutionOptions,ExecutionResult,Profile,ProfileOptions,Schema} from '../../types';

export class SnowflakeEngine implements AnalysisEngine{
    readonly language = {name :'Snowflake SQL dialect',fence :'sql'};

    async load(config: DataSourceConfig): Promise<Schema>{
        void config;
        throw new Error('SnowflakEngine.load is not implemented');
    }
    async profile(options: ProfileOptions = {}): Promise<Profile>{
        void options;
        throw new Error('SnowflakEngine.profile is not implemented');
    }
    async getDSL(query: string, context?: DataContext): Promise<string> {
        void query;
        void context;
        throw new Error('SnowflakEngine.getDSL is not implemented');
    }
    async execute<T = Record<string, unknown>>(sql: string, options?: ExecutionOptions): Promise<ExecutionResult<T>>{
        void sql;
        void options;
        throw new Error('SnowflakEngine.execute is not implemented');
    }
    async dispose(): Promise<void> {
        return;
    }

}