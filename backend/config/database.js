import mongoose from 'mongoose';
import colors from 'colors';

// Establishes a connection to the MongoDB database using Mongoose.
const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
    console.log(`Database: ${conn.connection.name}`.green);
    console.log(
      `Atlas web: Cluster → Browse Collections → ${conn.connection.name} → courses`.gray
    );
  } catch (error) {
    console.log(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

export default connectDatabase;
