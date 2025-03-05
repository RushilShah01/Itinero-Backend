import mongoose from 'mongoose';

const travelRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userName: {
      type: String,
      required: [true, 'User name is required'], // Manually provided by the client
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          // Ensure endDate is after startDate
          return value > this.startDate;
        },
        message: 'End date must be after the start date',
      },
    },
    expenseType: {
      type: String,
      enum: {
        values: ['Hotel', 'Flight', 'Both'],
        message: 'Expense type must be Hotel, Flight, or Both',
      },
      required: [true, 'Expense type is required'],
    },
    expense: {
      type: Number,
      required: [true, 'Expense is required'],
      min: [0, 'Expense must be a positive number'], // Ensure expense is non-negative
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      maxlength: [500, 'Purpose cannot exceed 500 characters'], // Limit purpose length
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: 'Status must be Pending, Approved, or Rejected',
      },
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Indexes for frequently queried fields
travelRequestSchema.index({ user: 1 }); // Index for user field
travelRequestSchema.index({ status: 1 }); // Index for status field

// Export the model
const TravelRequest = mongoose.model('TravelRequest', travelRequestSchema);
export default TravelRequest;