const CONNECT_TIMEOUT_MS = 30000;

export async function connect(
    connection:{connect(callback:(error?:Error)=>void):void},
    dispose:() => Promise<void>,
):Promise<void>{
    try{
        await new Promise<void>((resolve,reject)=>{
            const timer = setTimeout(()=>{
                reject(new Error(`Snowflake connection timed out after ${CONNECT_TIMEOUT_MS} ms.`));
            },CONNECT_TIMEOUT_MS);
        try{
            connection.connect((error)=>{
                clearTimeout(timer);
                if(error) reject(error);
                else resolve();
            });
        }catch(error){
            clearTimeout(timer);
            reject(error);
        }});
    }catch(error){
        await dispose().catch(()=>undefined);
        throw error;
    }
}