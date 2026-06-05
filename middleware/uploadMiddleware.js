// Mock Upload middleware
// In production, use multer + multer-storage-cloudinary

const mockUpload = (req, res, next) => {
  // Simulate file upload logic
  next();
};

module.exports = {
  uploadSingle: mockUpload,
  uploadMultiple: mockUpload
};
