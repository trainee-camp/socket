export interface Session_IF {
    set: (val1: string, val2: string) => Promise<string | null>;
    get: (val: string) => Promise<string | null>
}