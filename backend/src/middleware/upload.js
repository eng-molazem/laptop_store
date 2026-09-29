const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function makeUploader(subfolder) {
  const dir = path.join(__dirname, '..', '..', 'uploads', subfolder);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('نوع الملف غير مدعوم'));
    cb(null, true);
  };

  return multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
}

module.exports = {
  uploadProductImages: makeUploader('products'),
  uploadPaymentMethodImage: makeUploader('payment-methods'),
  uploadPaymentProof: makeUploader('payment-proofs'),
};
