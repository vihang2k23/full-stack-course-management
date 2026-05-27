import mongoose from 'mongoose';
import colors from 'colors';

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
    console.log(`Database: ${conn.connection.name}`.green);
  } catch (error) {
    console.log(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

export default connectDb;
