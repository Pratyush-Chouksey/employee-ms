import mongoose from 'mongoose'

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },

    period: {
      month: {
        type: Number,       
        required: true,
      },
      year: {
        type: Number,      
        required: true,
      },
    },

    basicSalary: {
      type: Number,
      required: true,
    },

    allowances: {
      type: Number,
      default: 0,         
    },

    deductions: {
      type: Number,
      default: 0,        
    },

    netSalary: {
      type: Number,
      required: true,
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',   
    },
  },
  { timestamps: true }
)

payslipSchema.index(
  { employee: 1, 'period.month': 1, 'period.year': 1 },
  { unique: true }
)

const Payslip = mongoose.model('Payslip', payslipSchema)

export default Payslip