import type {AnalysisEngine,DataContext,DataSourceConfig,ExecutionOptions,ExecutionResult,Profile,ProfileOptions,Schema} from '../../types';
import { destroyConnection } from './dispose';
import {openSession} from './session-load';
import { createSnowflakeConnection, type SnowflakeDriver } from './driver';

export class SnowflakeEngine implements AnalysisEngine{
    readonly language = {name :'Snowflake SQL dialect',fence :'sql'};
    private connection:SnowflakeDriver | null = null;
    async load(config: DataSourceConfig): Promise<Schema>{
        await this.dispose();
        if(config.type !== 'snowflake'){
            throw new Error(`SnowflakeEngine only supports Snowflake data sources, got '${config.type}'`);
        }
        const connection = createSnowflakeConnection(config.options);
        this.connection = connection
        return openSession(config.options,connection,(sql)=>connection.execute(sql),()=>this.dispose());
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
        const connection = this.connection;
        this.connection = null;
        await destroyConnection(connection);
    }

}