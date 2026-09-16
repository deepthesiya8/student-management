import mongoose from 'mongoose';

const querySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    queryText: {
      type: String,
      required: [true, 'Please provide query text'],
      trim: true,
    },
    response: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Answered'],
      default: 'Pending',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Query = mongoose.model('Query', querySchema);
export default Query;
