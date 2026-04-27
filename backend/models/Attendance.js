import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    checkIn: {
      type: Date,  
    },

    checkOut: {
      type: Date,
    },

    workingHours: {
      type: Number,
      default: 0,
    },

    dayType: {
      type: String,
      enum: ['Full Day', 'Half Day'],
      default: 'Full Day',
    },

    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Present',
    },

    isLate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true })

const Attendance = mongoose.model('Attendance', attendanceSchema)

export default Attendance