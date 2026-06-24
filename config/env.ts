import "dotenv/config"

const requiredEnv = ["DATABASE_URL" , "PORT"]

for(let key of requiredEnv){
    if(!process.env[key]){
        throw new Error(`${key} doesn't exist`)
    }
}


export const env = {
    databaseUrl : process.env.DATABASE_URL,
    port : process.env.PORT
}