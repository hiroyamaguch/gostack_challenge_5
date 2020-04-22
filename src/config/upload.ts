import path from 'path';
import multer from 'multer';

const folder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: folder,

  storage: multer.diskStorage({
    destination: folder,
    filename(request, file, callback) {
      return callback(null, file.originalname);
    },
  }),
};
