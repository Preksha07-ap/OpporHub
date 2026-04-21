require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.api.ping()
  .then(res => {
    console.log('✅ Successfully connected to Cloudinary! Response status:', res.status);
    console.log('You are ready to upload images!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Cloudinary connection failed. Error:', err.message);
    process.exit(1);
  });
