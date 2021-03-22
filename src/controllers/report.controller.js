
const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path')
const { getUploadFilesDirectory, memoryReportFile } = require('../config')
const serviceHelper = require("../services/helper");

exports.ingest = async (req, res, next) => {
    serviceHelper.removeRecursive(getUploadFilesDirectory)
    serviceHelper.upload(req, res, function (err) {
        if (err) {
            return res.status(400).send({ error: 1, message: err.message })
        }
        if(!req.file) {
            return res.status(400).send({ error: 1, message: "Filename is required" })
        }

        var obj = xlsx.parse(`${getUploadFilesDirectory}/${req.file.filename}`); // parses a file
        var rows = [];
        var writeStr = "";
        //looping through all sheets
        for(var i = 0; i < obj.length; i++)
        {
            var sheet = obj[i];
            //loop through all rows in the sheet
            for(var j = 0; j < sheet['data'].length; j++)
            {
                    //add the row to the rows array
                    rows.push(sheet['data'][j]);
            }
        }

        //creates the csv string to write it to a file
        for(var i = 0; i < rows.length; i++)
        {
            writeStr += rows[i].join(",") + "\n";
        }

        //writes to a file, but you will presumably send the csv as a
        //response instead
        fs.writeFile(`${getUploadFilesDirectory}/${memoryReportFile}`, writeStr, function(err) {
            if(err) {
                return res.json({
                    error: 1,
                    message: err
                })
            }

            return res.json({
                success: 1,
                message: `${memoryReportFile} was saved in the current directory!`
            })
        });

    })
}

exports.categories = async (req, res, next) => {

    const csvData = await serviceHelper.readMemoryReportFile()
    if(csvData) {
        return res.status(200).json({
            success: 1,
            categories: [...new Set(csvData.map(item => item.Section).filter((el) => el != null))]
        })
    }
    return res.status(404).json({
        error: 1,
        message: `${memoryReportFile} is not exist, please ingest file first!`
    })
}

exports.summary = async (req, res, next) => {
    const { category = undefined, year = undefined, month = undefined } = req.body
    if( !category || !year || !month) {
        return res.status(400).json({
            error: 1,
            message: 'Category, Month and Year fields are required'
        })
    }
    const csvData = await serviceHelper.readMemoryReportFile()
    if(csvData) {
        const allCategories = [...new Set(csvData.map(item => item.Section).filter((el) => el != null))]
        if(!allCategories.includes(category)) {
            return res.status(404).json({
                error: 1,
                message: "No category found!"
            })
        }

        const totalUnits = csvData.reduce((total, csv) => {
            if(csv.Section === category) {
                return total + parseInt(csv[`${year}-${month} Units`]);
            }
            return total
        }, 0);

        const totalGrossSales = csvData.reduce((total, csv) => {
            if(csv.Section === category) {
                return total + parseInt(csv[`${year}-${month} Gross Sales`]);
            }
            return total
        }, 0);

        if(isNaN(totalUnits) && isNaN(totalGrossSales)) {
            return res.status(404).json({
                error: 1,
                message: `No data Available!`
            })
        }
        return res.status(200).json({
            success: 1,
            summary: {
                category,
                totalUnits,
                totalGrossSales
            }
        })
    }
    return res.status(404).json({
        error: 1,
        message: `${memoryReportFile} is not exist, please ingest file first!`
    })
}

exports.generate_report = async (req, res, next) => {
    const { filename = undefined } = req.body
    if( !filename || !path.extname(filename)) {
        return res.status(400).json({
            error: 1,
            message: 'Please specify filename with .csv'
        })
    }
    const csvData = await serviceHelper.readMemoryReportFile()
    if(csvData) {
        const outputData = []
        for(var i=0; i< csvData.length; i++) {
            let getSecondPartKey
            let year
            let month
            let SKU
            let skuValue
            let sectionValue
            var count =1
            let temp = []

            for (var key in csvData[i]) {
                if(!['Section', 'SKU'].includes(key)) {
                    const allKeys = key.split(' ')
                    const getFirstPartKey = allKeys[0].split('-')
                    getSecondPartKey = allKeys[1]
                    year = getFirstPartKey[0]
                    month = getFirstPartKey[1]
                }
                else if(key === 'SKU'){
                    SKU = csvData[i][key]
                }
                if(key === 'SKU') {
                    skuValue = csvData[i][key]
                } else if(key === 'Section') {
                    sectionValue = csvData[i][key]
                } else {
                    temp['SKU'] = skuValue
                    temp['Section'] = sectionValue
                    temp['Year'] = year
                    temp['Month'] = month
                    temp[getSecondPartKey] = csvData[i][key]
                    if(count > 2 && count%2 ===0) {
                        outputData.push(temp)
                        temp = []
                    }
                }
                count++
            }
        }

        const csvOutput = serviceHelper.multiSort(outputData, {
            SKU: 'asc',
            Year: 'asc',
            Month: 'asc'
        })
        var rows = [];
        var writeStr = "";
        //looping through all sheets
        rows.push(['SKU', 'Section', 'Year', 'Month', 'Units', 'Gross'])
        for(var i = 0; i < csvOutput.length; i++)
        {
            const tempRow = []
            // //loop through all rows in the sheet
            for (var key in csvOutput[i]) {
                tempRow.push(csvOutput[i][key])
            }
            rows.push(tempRow);
        }
        for(var j = 0; j < rows.length; j++) {
            writeStr += rows[j].join(",") + "\n";
        }
        fs.writeFileSync(`${getUploadFilesDirectory}/${filename}`, writeStr)

        return res.json({
            success: 1,
            message: `${getUploadFilesDirectory}/${filename} was saved in the current directory!`
        })
    }

    return res.status(404).json({
        error: 1,
        message: `${memoryReportFile} is not exist, please ingest file first!`
    })
}

exports.get_file = async (req, res, next) => {
    const { filename = undefined } = req.params
    if( !filename || !path.extname(filename)) {
        return res.status(400).json({
            error: 1,
            message: 'Please specify filename with .csv'
        })
    }
    if( !serviceHelper.checkFileExists(`${getUploadFilesDirectory}/${filename}`)) {
        return res.status(400).json({
            error: 1,
            message: `${getUploadFilesDirectory}/${filename} is not available`
        })
    }
    res.download(`${getUploadFilesDirectory}/${filename}`,filename);
}

exports.exit = async (req, res, next) => {
    serviceHelper.removeRecursive(getUploadFilesDirectory)
    return res.status(200).json({
        success: 1,
        message: "Program Exit successfully!"
    })
}