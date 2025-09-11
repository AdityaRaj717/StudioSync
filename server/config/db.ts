import mongoose from "mongoose";

async function connect() {
  try {
    let connectString: string = process.env.MONGO_URI;
    if (connectString === "") {
      throw new error("No connection string found.");
    } else {
      await mongoose.connect(connectString);
      console.log("Successfully connected to DB.");
    }
  } catch (error) {
    console.log("Could not connect to the DB", error?.message);
    process.exit();
  }
}

export default connect;
