import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
      required: [true, 'Please provide a teacher ID'],
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: [true, 'Please provide a department'],
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      default: 'Assistant Professor',
    },
    qualification: {
      type: String,
      trim: true,
      default: 'M.Tech / Ph.D',
    },
  },
  {
    timestamps: true,
  }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
