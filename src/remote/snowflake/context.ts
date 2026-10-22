function field(row: Record<string,unknown>,name : string) : string{
    const value = Object.entries(row).find(([key])=>key.toLowerCase()===name)?.[1];
    if (typeof value !== 'string'|| value.length === 0) throw  new Error('Snowflake did not report ${name')
        return value;
}

export async function verifyCurrentNames(
    expected:{database:string;schema:string},
    query:(sql:string) => Promise<Record<string,unknown>[]>,
):Promise<{database:string;schema:string}>{
    const [row] = await query('SELECT CURRENT_DATABASE() AS database_name,CURRENT_SCHEMA() AS schema_name'); 
    const database = field(row??{},'database_name');
    const schema = field(row??{},'schema_name');
    const same = (actual:string,wanted:string) => actual.toUpperCase()===wanted.toUpperCase();
    if(!same(database,expected.database)||!same(schema,expected.schema)){
        throw new Error(`Snowflake connection is not in the expected database and schema: ${JSON.stringify(expected)}`);
    }
    return {database,schema};
}