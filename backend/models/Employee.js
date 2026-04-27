import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    employeeId: {
      type: String,
      unique: true,
    },

    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    position: {
      type: String,
      required: [true, 'Position is required'],
    },

    department: {
      type: String,
      required: [true, 'Department is required'],
    },

    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: 0,
    },

    phone: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      maxlength: 500,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

employeeSchema.pre('save', async function () {
  if (!this.isNew) return

  const count = await mongoose.model('Employee').countDocuments()
  this.employeeId = `EMP${String(count + 1).padStart(3, '0')}`
})

const Employee = mongoose.model('Employee', employeeSchema)

export default Employee