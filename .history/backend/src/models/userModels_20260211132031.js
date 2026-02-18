import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: { type: String, enum: ["user", "artist"], default: "user" },
  },
 
);

const User = mongoose.models.user || mongoose.model("user", userSchema);
export default User;
