import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI!;
const options = {};
const client = new MongoClient(uri, options);
let clientPromise = client.connect();
export default clientPromise;
