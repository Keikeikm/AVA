import {expect,it} from 'vitest'
import {normalizeOptions} from '../../../src/remote/snowflake/options'

import type { SnowflakeSourceOptions } from '../../../src/types'

const base = {account:'ORG-ACCOUNT',username:'AVA',warehouse:'WH',database:'DB'};
const options = (extra:Partial<SnowflakeSourceOptions>):SnowflakeSourceOptions => ({...base,...extra});

it('fills schema,timeout, and authenticator defaults',()=>{
    expect(normalizeOptions(options({password:'secret'}))).toMatchObject({
        schema:'PUBLIC',
        queryTimeoutMs:60000,
        authenticator:'SNOWFLAKE',
    });
    expect(normalizeOptions(options({privateKeyPath:'k.pem'})).authenticator).toBe('SNOWFLAKE_JWT')
    expect(normalizeOptions(options({token:'t',authenticator:'OAUTH'})).authenticator).toBe('OAUTH')
})