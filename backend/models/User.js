const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters long']
    },
    email: {
      type: String,
      required: [true, 'Email ID is required'],
      unique: true,
      trim: true,
      lowercase: true,
      alias: 'emailId',
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address'
      ]
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [1, 'Age must be at least 1']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        ret.emailId = ret.email;
        return ret;
      }
    },
    toObject: {
      virtuals: true
    }
  }
);

userSchema.methods.comparePassword = function (candidatePassword) {
  return this.password === candidatePassword;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
