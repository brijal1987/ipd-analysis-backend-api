const reportController = require('../../controllers/report.controller')
const serviceHelper = require('../../services/helper')
const { memoryReportFile } = require('../../config')
var multer  = require('multer')

const mockResponse = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

jest.mock('multer', () => {
	const multer = jest.fn().mockImplementation(() => {
        console.log('[---')
        return {
            single: () => jest.fn().mockImplementation((req, res, cb) => {
                req.body = { title: req.query.title };
                req.file = [{ originalname: 'sample.name', mimetype: 'sample.type', path: 'sample.url' }];
                cb()
            })
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

describe('reportController', () => {
    describe('get ingest', () => {
        const req = {}
        test('when ingest', async () => {

            jest.spyOn(serviceHelper, 'removeRecursive').mockResolvedValue(true)
            jest.spyOn(serviceHelper, 'upload').mockImplementation(() => {
                return multer.mock.calls[0][0]
            })
            const res = mockResponse()

            await reportController.ingest(req, res)
            expect(multer).toHaveBeenCalled()
            // expect(res.status).toHaveBeenCalledWith(200)
            // expect(res.json).toHaveBeenCalledWith({
            //     error: 1,
            //     message: `${memoryReportFile} is not exist, please ingest file first!`
            // })
        })

        test('when categories found', async () => {
            const categories = [{ 'Section': 'test' }, { 'Section': 'test1'}]
            jest.spyOn(serviceHelper, 'readMemoryReportFile').mockResolvedValue(categories)
            const res = mockResponse()

            await reportController.categories(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: 1,
                categories: ['test', 'test1']
            })
        })
    })

    describe('get Categories', () => {
        const req = {}
        test('when categories not found', async () => {

            jest.spyOn(serviceHelper, 'readMemoryReportFile').mockResolvedValue(false)
            const res = mockResponse()

            await reportController.categories(req, res)
            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                error: 1,
                message: `${memoryReportFile} is not exist, please ingest file first!`
            })
        })

        test('when categories found', async () => {
            const categories = [{ 'Section': 'test' }, { 'Section': 'test1'}]
            jest.spyOn(serviceHelper, 'readMemoryReportFile').mockResolvedValue(categories)
            const res = mockResponse()

            await reportController.categories(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: 1,
                categories: ['test', 'test1']
            })
        })
    })

    describe('get summary', () => {
        test('when body data not passed properly', async () => {
            const res = mockResponse()

            await reportController.summary({
                body: {
                    category: undefined,
                    year: 1,
                    month: 1
                }
            }, res)
            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({
                error: 1,
                message: 'Category, Month and Year fields are required'
            })
        })

        test('when data from csv not found', async () => {
            jest.spyOn(serviceHelper, 'readMemoryReportFile').mockResolvedValue(false)
            const res = mockResponse()

            await reportController.summary({
                body: {
                    category: 'test',
                    year: 1,
                    month: 1
                }
            }, res)
            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                error: 1,
                message: `${memoryReportFile} is not exist, please ingest file first!`
            })
        })

        test('when categories not found in csv data', async () => {
            const categories = [{ 'Section': 'test' }, { 'Section': 'test1'}]

            jest.spyOn(serviceHelper, 'readMemoryReportFile').mockResolvedValue(categories)
            const res = mockResponse()

            await reportController.summary({
                body: {
                    category: 'undefined',
                    year: 1,
                    month: 1
                }
            }, res)
            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                error: 1,
                message: 'No category found!'
            })
        })

        test('when no summary available', async () => {
            const categories = [{ 'Section': 'test' }, { 'Section': 'test1'}]
            jest.spyOn(serviceHelper, 'readMemoryReportFile').mockResolvedValue(categories)
            const res = mockResponse()

            await reportController.summary({
                body: {
                    category: 'test',
                    year: 1,
                    month: 1
                }
            }, res)
            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                error: 1,
                message: "No data Available!"
            })
        })

        test('when summary found', async () => {
            const categories = []
            const tempCategories = {}
            tempCategories["Section"] = 'test'
            tempCategories["2019-11 Units"] = 1
            tempCategories["2019-11 Gross Sales"] = 1000
            categories.push(tempCategories)
            jest.spyOn(serviceHelper, 'readMemoryReportFile').mockResolvedValue(categories)
            const res = mockResponse()

            await reportController.summary({
                body: {
                    category: 'test',
                    year: 2019,
                    month: 11
                }
            }, res)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: 1,
                summary: {
                    category: 'test',
                    totalUnits: 1,
                    totalGrossSales: 1000
                }
            })
        })
    })

    describe('get exit', () => {
        const req = {}
        test('when reset called', async () => {

            jest.spyOn(serviceHelper, 'removeRecursive').mockResolvedValue(true)
            const res = mockResponse()

            await reportController.exit(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: 1,
                message: "Program Exit successfully!"
            })
        })
    })
})

