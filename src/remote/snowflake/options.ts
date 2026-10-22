import type {SnowflakeAuthenticator,SnowflakeSourceOptions} from '../../types';

const DEFAULT_SCHEMA = 'PUBLIC';
const DEFAULT_QUERY_TIMEOUT_MS = 60000; // 60 seconds
const MIN_QUERY_TIMEOUT_MS = 1000; // 1 second
const MAX_QUERY_TIMEOUT_MS = 900000; // 15 minutes

export interface NormalizedSnowflakeOptions extends SnowflakeSourceOptions{
    schema: string;
    queryTimeoutMs: number;
    authenticator: SnowflakeAuthenticator;
}

function resolveAuthenticator(options: SnowflakeSourceOptions): SnowflakeAuthenticator{
    const password = options.password !== undefined
    const key = options.privateKey !== undefined
    const keyPath = options.privateKeyPath !== undefined
    const token = options.token !== undefined
    if (key&& keyPath){
        throw new Error('Snowflake privateKey and privateKeyPath are mutually exclusive');
    }
    if(Number(password)+Number(key || keyPath)+Number(token) !== 1){
        throw new Error('Snowflake authentication requires exactly one of password, privateKey/privateKeyPath, or token');
    }
    if(options.privateKeyPass !== undefined && !(key || keyPath)){
        throw new Error('Snowflake privateKeyPass requires privateKey or privateKeyPath');
    }
    const authenticator = options.authenticator ?? (password ? 'SNOWFLAKE' : key || keyPath ? 'SNOWFLAKE_JWT' :  undefined);
    if (authenticator === undefined){
        throw new Error('Snowflake authenticator requires authenticator OAUTH or PROGRAMMATIC_ACCESS_TOKEN');
    }
    const matches = authenticator === 'SNOWFLAKE' ? password : authenticator === 'SNOWFLAKE_JWT' ? key || keyPath :token;
    if(!matches) throw new Error(`Snowflake authenticator &{authenticator} doesnot match the apply credential`);
    return authenticator;
}

export function normalizeOptions(options:SnowflakeSourceOptions): NormalizedSnowflakeOptions{
    const queryTimeoutMs = options.queryTimeoutMs ?? DEFAULT_QUERY_TIMEOUT_MS;
    if(
        !Number.isInteger(queryTimeoutMs) ||
        queryTimeoutMs < MIN_QUERY_TIMEOUT_MS ||
        queryTimeoutMs > MAX_QUERY_TIMEOUT_MS
    ){
        throw new Error(`queryTimeoutMs must be an integer between ${MIN_QUERY_TIMEOUT_MS} and ${MAX_QUERY_TIMEOUT_MS}`);
    }
    return {
        ...options,
        schema: options.schema ?? DEFAULT_SCHEMA,
        queryTimeoutMs,
        authenticator: resolveAuthenticator(options)
    };
}
export function connectionOptions(options:NormalizedSnowflakeOptions){
    return {
        account: options.account,
        username: options.username,
        password: options.password,
        privateKey:options.privateKey,
        privateKeyPath : options.privateKeyPath,
        privateKeyPass : options.privateKeyPass,
        token: options.token,
        authenticator: options.authenticator,
        warehouse:options.warehouse,
        database:options.database,
        schema:options.schema,
        role:options.role,
        accessUrl:options.accessUrl,
        application:'AVA' as const,
        rowMode:'object_with_renamed_duplicated_columns' as const,
        jsTreatIntegerAsBigInt:true,
        clientSessionKeepAlive:false,
    }


}