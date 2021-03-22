
const fs = require('fs');
const multer = require('multer');
const csv = require('csv-parser');
const path = require('path')
const { allowedExtention, getUploadFilesDirectory, memoryReportFile } = require('../config')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, getUploadFilesDirectory)
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

const multiSort = (array, sortObject = {}) => {
   const sortKeys = Object.keys(sortObject);

   // Return array if no sort object is supplied.
   if (!sortKeys.length) {
       return array;
   }

   // Change the values of the sortObject keys to -1, 0, or 1.
   for (let key in sortObject) {
       sortObject[key] = sortObject[key] === 'desc' || sortObject[key] === -1 ? -1 : (sortObject[key] === 'skip' || sortObject[key] === 0 ? 0 : 1);
   }

   const keySort = (a, b, direction) => {
       direction = direction !== null ? direction : 1;

       if (a === b) { // If the values are the same, do not switch positions.
           return 0;
       }

       // If b > a, multiply by -1 to get the reverse direction.
       return a > b ? direction : -1 * direction;
   };

   return array.sort((a, b) => {
       let sorted = 0;
       let index = 0;

       // Loop until sorted (-1 or 1) or until the sort keys have been processed.
       while (sorted === 0 && index < sortKeys.length) {
           const key = sortKeys[index];

           if (key) {
               const direction = sortObject[key];

               sorted = keySort(a[key], b[key], direction);
               index++;
           }
       }

       return sorted;
   });
}

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.xlsx' && ext !== '.txt') {
            return callback(new Error(`Please enter proper file: allowed extentions are ${allowedExtention.join(',')}`))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
}).single('filename');

const removeRecursive = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => fs.unlinkSync(`${getUploadFilesDirectory}/${file}`))
}

const checkFileExists = (file) => {
    return fs.existsSync(file)
}

const readMemoryReportFile = () => {
    if(checkFileExists(`${getUploadFilesDirectory}/${memoryReportFile}`)) {
        const csvData = []
        return new Promise((resolve, reject) => {
            fs.createReadStream(`${getUploadFilesDirectory}/${memoryReportFile}`)
                .pipe(csv({delimiter: ':'}))
                .on('data', function(csvrow) {
                    csvData.push(csvrow);
                })
                .on('end',function() {
                    resolve(csvData);
                })
                .on('error', reject);
        });
    }
    return false
}

module.exports = {
    checkFileExists,
    multiSort,
    upload,
    removeRecursive,
    readMemoryReportFile
  }