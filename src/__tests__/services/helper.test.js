const fs = require('fs');
const serviceHelper = require('../../services/helper')
const multer = require('multer');
jest.mock('fs')
jest.mock('multer', () => {
	const multer = jest.fn().mockImplementation(() => {
        return {
            single: () => jest.fn().mockImplementation()
        }
    })

	multer.diskStorage =  jest.fn().mockImplementation(() => {
        return {
            destination: () => jest.fn().mockImplementation((req, file, cb) => {
                cb(null)
            }),
            filename: () => jest.fn().mockImplementation((req, file, cb) => {
                cb(null)
            })
        }
    })
    // jest.fn()

	return multer
})

describe('Helper', () => {
    describe('upload', () => {
        test('success', async () => {
            // await multer.single.mockReturnValue(true);
            serviceHelper.upload()

        })
    })

    describe('removeRecursive', () => {
        test('success', async () => {
            await fs.readdirSync.mockReturnValue(['test.txt']);
            await fs.unlinkSync.mockReturnValue(true);
            serviceHelper.removeRecursive('test')
            expect(fs.readdirSync).toHaveBeenCalled();
            expect(fs.unlinkSync).toHaveBeenCalled();

        })
    })
    describe('readMemoryReportFile', () => {
        test('success', async () => {
            await fs.existsSync.mockReturnValue(true);
            await fs.createReadStream.mockReturnValue([]);
            serviceHelper.readMemoryReportFile()
            expect(fs.existsSync).toHaveBeenCalled();
            expect(fs.createReadStream).toHaveBeenCalled();

        })
        test('file not exists', async () => {
            await fs.existsSync.mockReturnValue(false);
            serviceHelper.readMemoryReportFile()
            expect(fs.existsSync).toHaveBeenCalled();
        })
    })
})