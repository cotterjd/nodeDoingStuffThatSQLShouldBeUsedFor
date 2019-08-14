'use strict'
var
  log = console.log
, R = require('Ramda')
, Task = require('data.task')
, Async = require('control.async')(Task)
, Excel = require('exceljs')
, moment = require('moment')
, logI = x => {log(x); return x;}
, dataWorkbook = new Excel.Workbook()
, vetCols = {
          id: 1
        , account: 2
        , address: 3
        , city: 4
        , state: 5
        , zip: 6
        , zip_plus: 7
        , county: 8
        , phone: 9
        , fax: 10
        , first: 11
        , last: 12
        , full_name: 13
        , gender: 14
        , latitude: 15
        , longitude: 16
        , sq_footage: 17
        , total_employees: 18
        , total_sales: 19
        }
//getData :: Object -> Worksheet -> Array
, getData = R.curry(function (columns, worksheet) {
    var
      hasMoreData = true
    , index = 2
    , data = []
    ;

    while (hasMoreData) {
      const
        row = worksheet.getRow(index)
      , cols = columns
      ;

      if(row.getCell(1).value) {
        const record = {};
        Object.keys(cols).forEach(k => {
          record[k] = row.getCell(cols[k]).value
        })
        data.push(record);
        index++;
      } else {
        hasMoreData = false;
      }
    }
    return data;
  })
//getCVSData :: String -> Function -> Task
, getCVSData = function (filename, func) {
    return new Task (function (reject, resolve) {

      dataWorkbook.csv.readFile(filename).then(function(csv){
        const data = func(csv)
        ;

        if (data.length) {
          resolve({
                    data: data,
                  });
        } else {
          reject("file is empty");
        }

      })
    });
  }
, f = s => String(s).trim().replace(/[^0-9]/g, '')
, notEmpty = x => x != null && x != "" && x != undefined
, compareNumbers = (a, b) => notEmpty(a) && notEmpty(b) && f(a) == f(b)
, compareStrings = (a, b) => {
    a = a.toLowerCase().trim()
    b = b.toLowerCase().trim()
    return notEmpty(a) && notEmpty(b) && a == b
  }
, compareAddresses = (a, b) => {
    a = a.toLowerCase().trim()
    b = b.toLowerCase().trim()
    const isSubSet = (a, b) => a.indexOf(b) != -1 || b.indexOf(a) != -1
    return notEmpty(a) && notEmpty(b) && (a == b || isSubSet(a, b))
  }
, filterDuplicates = R.curry(function (fields, getPropsNum, hospitals) {
        const hospitalsWithPropCount = hospitals.map(getPropsNum(fields))
        , hospitalsSortedProps = R.sortBy(R.prop("count"), hospitalsWithPropCount)
        ;

        return R.last(hospitalsSortedProps);
  })
, uniqueHospitals = function (data) {
    const
      hospitalsWithoutAddress = data.filter(h => !h.address)
    , hospitalsWithAddress = data.filter(h => h.address)
    , groupedData = R.groupBy(R.prop("address"), hospitalsWithAddress)
    , fields = ['firstname', 'lastname', 'full_name', 'fax', 'gender']
    , getNumberOfProps = R.curry((fields, hospital) => {
        return R.assoc("count", fields.reduce((a, f) => {
          return a + Number(Boolean(hospital[f]) )
        }, 0), hospital)
      } )
    ;
    return R.pipe(
      R.map(filterDuplicates(fields, getNumberOfProps))
    , R.values
    , R.concat(hospitalsWithoutAddress)
    )(groupedData)
  }
, getDataTasks = [
    getCVSData("Animal_Hospitals.csv", getData(vetCols))
  ]
, createRows = xs => xs.map(R.values)
, getHeaders = x => R.keys(x)
, writeTable = function (sheet, filename, data) {
    const
      rows = createRows(data)
    , headers = getHeaders(data[0])
    , newWorkbook = new Excel.Workbook()
    ;

    newWorkbook.addWorksheet(sheet)
    const worksheet = newWorkbook.getWorksheet(sheet)
    worksheet.addRow(headers).commit()
    rows.forEach(r => worksheet.addRow(r).commit())

    return newWorkbook.csv.writeFile(filename)
  }
, nil = null
;

Async.parallel(getDataTasks).fork(logI, r => {
  console.log(moment().toDate())
  const hospitals = uniqueHospitals(r[0].data)

  writeTable('hospitals', 'uniqueHospitals.csv', hospitals).then(() => {
      console.log("done!");
      console.log(moment().toDate())
  })
})
