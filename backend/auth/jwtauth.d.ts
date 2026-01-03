declare global{
    namespace Express{
        interface Request{
            auth?:{
                sub?: string;
            }
        }
    }
}

export { };
