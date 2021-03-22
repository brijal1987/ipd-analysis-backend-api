# IPD-Analysis-Backend-API

## Clone Repo
`git clone https://github.com/brijal1987/ipd-analysis-backend-api.git`

## Load .env file
`cp .env-example .env`

# Building by docker compose

## Start Server - Building docker image
`npm run docker-up`

## Check API running on
`http://localhost:9000/`

## Stop Server
`npm run docker-stop`

## OR after cloning repo, in case docker not working
`npm run start`

## Check API running on
`http://localhost:9000/`


## RestAPI

## Check status

### Request

`GET http://localhost:9000/heartbeat`

### Response
```
    {"status":"online"}
```

## Ingest CSV or txt

### Request

`POST http://localhost:9000/ingest`

### Body
```
filename: '201904.xlsx' OR '212323.txt'
```

### Response
```
    {
        "success": 1,
        "message": "memoryReportFile.csv was saved in the current directory!"
    }
```

## Get all categories

### Request

`GET http://localhost:9000/categories`


### Response
```
    {
        "success": 1,
        "categories": []
    }
```

## Get Summary

### Request

`POST http://localhost:9000/summary`

## Body
```
    {
        "category": "Produce",
        "year": "2018",
        "month": "12"
    }
```

### Response
```
    {
        "success": 1,
        "summary": {
            "category": "Produce",
            "totalUnits": 138557,
            "totalGrossSales": 1525635
        }
    }
```


## Generate Report

### Request

`POST http://localhost:9000/generate_report`

## Body
```
    {
        "filename": "test.csv"
    }
```

### Response
```
    {
        "success": 1,
        "message": "uploads/test.csv was saved in the current directory!"
    }
```

## Get Generated report file

### Request

`GET http://localhost:9000/generate_report/test.csv`

### Response
```
    Download File
```

## Exit process

### Request

`GET http://localhost:9000/exit`


### Response
```
    {
        "success": 1,
        "message": "Program Exit successfully!"
    }
```
