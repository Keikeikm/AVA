import {connect} from './connect';
import { verifyCurrentNames } from './context';
import { normalizeOptions } from './options';
import { applySessionGuards,applySessionTail } from './session';

import type{Schema,SnowflakeSourceOptions} from '../../types';

export async function openSession(
    source:SnowflakeSourceOptions,
    connection:{connect(callback:(error?:Error)=>void):void},
    execute:(sql:string) => Promise<Record<string,unknown>[]>,
    dispose:() =>Promise<void>,
):Promise<Schema>{
    const options = normalizeOptions(source);
    const run = (sql:string) => execute(sql).then(()=>undefined);
    try{
        await connect(connection,dispose);
        await applySessionGuards(options.queryTimeoutMs,run);
        await applySessionTail(options,run);
        await verifyCurrentNames(options,execute);
        return {
            tables:[],relations:[]
        };
    }catch(error){
        await dispose();
        throw error;

    }
}
