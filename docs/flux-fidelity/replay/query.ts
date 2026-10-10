export * from '../../node_modules/@tanstack/react-query/build/modern/index.js'
import {useQuery as original} from '../../node_modules/@tanstack/react-query/build/modern/index.js'
export function useQuery(options:any,client?:any){return original({...options,refetchInterval:false,retry:false,refetchOnWindowFocus:false,refetchOnReconnect:false},client)}
