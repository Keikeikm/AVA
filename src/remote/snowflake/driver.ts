import type { SnowflakeSourceOptions }  from "../../types";

export interface SnowflakeDriver{
    connect(callback:(error?:Error)=>void):void;
    destroy(callback:(error?:Error)=>void):void;
    execute(sql:string):Promise<Record<string,unknown>[]>;
}

export function createSnowflakeConnection(source:SnowflakeSourceOptions):SnowflakeDriver{
    void source;
    throw new Error("placeholder");
}