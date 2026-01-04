declare global{
    namespace Express{
        interface Request{
            auth?:{
                sub?: string;
                realm_access?:{
                    roles?: string[];
                }
            }
        }
    }
}

export { };

