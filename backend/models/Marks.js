import mongoose from 'mongoose';

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: false,
    },
    examType: {
      type: String,
      enum: ['Midsem', 'Endsem', 'Quiz', 'Assignment', 'Lab'],
      required: [true, 'Please specify exam type'],
    },
    marks: {
      type: Number,
      required: [true, 'Please provide marks obtained'],
      min: [0, 'Marks cannot be negative'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Please provide maximum marks'],
      default: 100,
      min: [1, 'Maximum marks must be at least 1'],
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup and uniqueness per exam
marksSchema.index({ student: 1, course: 1, examType: 1 });

const Marks = mongoose.model('Marks', marksSchema);
export default Marks;
