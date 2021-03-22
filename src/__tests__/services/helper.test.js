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
            serviceHelper.upload()
        })
    })

    describe('multiSort', () => {
        const array = [
            {'id': 1, 'name': 'xyz'},
            {'id': 2, 'name': 'def'},
            {'id': 2, 'name': 'abc'}
        ]
        test('success without any sorting', async () => {
            const response = serviceHelper.multiSort(array)
            expect(response).toEqual(array)
        })

        test('success with sorting', async () => {
            const response = serviceHelper.multiSort(array, { id: 'asc', 'name': 'asc'})
            expect(response).toEqual(array)
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