import mongoose from 'mongoose';

const connectDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "sound_match"
    }
    await mongoose.connect(DATABASE_URL, DB_OPTIONS)
    console.log('Connected Successfully...')
  } catch (error) {
    console.log(error)
  }
}

export default connectDB