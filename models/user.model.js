// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['employee', 'admin'], default: 'employee' }
// },
//     {
//         timestamps: true
//     }
// );

// const User=mongoose.model('User',userSchema);
// export default User;

// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ["admin", "user"], default: "user" },
// });

// export default mongoose.model("User", UserSchema);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator'; // For email and password validation

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address'], // Validate email format
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be at least 8 characters long'], // Minimum length
    },
    role: { type: String, enum: ['Employee', 'Admin'], default: 'Employee' }
  },
  { timestamps: true }
);

// Indexes for frequently queried fields
userSchema.index({ email: 1 }); // Index for email field

// Encrypt password before saving (using bcrypt)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Hash password with 10 rounds of salting
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords (used for login)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model
const User = mongoose.model('User', userSchema);
export default User;