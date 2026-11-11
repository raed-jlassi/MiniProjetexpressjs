import express from "express"
import connectmongo from "./database/database.js"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(express.json());

const start = async () => {
    await connectmongo()
    app.listen(3000, () => {
        console.log(`Server is running on port 3000`)
    })
}


start()