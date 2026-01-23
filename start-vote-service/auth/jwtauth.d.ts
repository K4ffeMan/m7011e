declare global{
    namespace Express{
        interface Request{
            action?: string;
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

