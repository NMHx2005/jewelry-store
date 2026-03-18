import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String },
    position: {
      type: String,
      enum: ['hero', 'popup', 'sidebar'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;

