import type { SnowflakeSourceOptions } from "../../types";

export function statementTimeoutSeconds(queryTimeoutMs: number):number{
    const seconds = Math.ceil(queryTimeoutMs/1000);
    if(!Number.isInteger(seconds) || seconds<1){
        throw new Error('Snowflake statement timeout must be at least 1 second');
    }
    return seconds;
}

export async function applySessionGuards(queryTimeoutMs:number,execute:(sql:string)=>Promise<void>):Promise<void>{
    const seconds = statementTimeoutSeconds(queryTimeoutMs);
    await execute(`ALTER SESSION SET STATEMENT_TIMEOUT=${seconds}`);
    await execute(`ALTER SESSION SET MULTI_STATEMENT_COUNT = 1`);
}

const DEFAULT_QUERY_TAG = 'AVA'
const MAX_QUERY_TAG_LENGTH = 2000

export function queryTagSql(queryTag?:string):string{
    const tag = queryTag ?? DEFAULT_QUERY_TAG;
    if(tag.length>MAX_QUERY_TAG_LENGTH || /['\\\r\n]/.test(tag)){
        throw new Error('Snowflake queryTag must be at most 2000 characters without quotes, backslashes, or line breaks')
    }
    return `ALTER SESSION SET QUERY_TAG = '${tag}'`
}

export  async function applySessionTail(
    options:Pick<SnowflakeSourceOptions,'queryTag'|'secondaryRoles'>,
    execute:(sql:string) => Promise<void>,
):Promise<void>{ 
    await execute(queryTagSql(options.queryTag)).catch(() => undefined);
    await execute('ALTER SESSION SET JS_TREAT_INTEGER_AS_BIGINT = true');
    if(options.secondaryRoles !== 'ALL') await execute('USE SECONDARY ROLES NONE')
}