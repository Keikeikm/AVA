const DISPOSE_TIMEOUT_MS = 5000

export async function destroyConnection(
    connection:{destroy(callback:(error?:Error)=>void):void} | null,
):Promise<void>{
    if(!connection) return ;
    await new Promise<void>((resolve)=>{
        const timer = setTimeout(resolve,DISPOSE_TIMEOUT_MS);
        try{
            connection.destroy(()=>{
                clearTimeout(timer);
                resolve();
            });
        }catch{
            clearTimeout(timer);
            resolve();
        }
    })
}