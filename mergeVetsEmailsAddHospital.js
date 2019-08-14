'use strict'
var
  log = console.log
, R = require('Ramda')
, Task = require('data.task')
, Async = require('control.async')(Task)
, Excel = require('exceljs')
, moment = require('moment')
, logI = x => {log(x); return x}
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
, emailCols = {
    id: 1
  , account: 2
  , address: 3
  , city: 4
  , state: 5
  , zip: 6
  , county: 7
  , phone: 8
  , first: 9
  , last: 10
  , full_name: 11
  , email: 12
  , website: 13
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
, buildObject = vd => {
    return {
    id: vd.id
    , account: vd.account
    , address: vd.address
    , city: vd.city
    , state: vd.state
    , zip: vd.zip
    , zip_plus: vd.zip_plus
    , county: vd.county
    , phone: vd.phone
    , fax: vd.fax
    , first: vd.first
    , last: vd.last
    , full_name: vd.full_name
    , gender: vd.gender
    , latitude: vd.latitude
    , longitude: vd.longitude
    , sq_footage: vd.sq_footage
    , total_employees: vd.total_employees
    , total_sales: vd.total_sales
    , email: ""
    , website: ""
    , hospital_id: ""
    }
  }
, addEmailData = (obj, emailDatum) => {
    obj.address = obj.address || emailDatum.address
    obj.county = obj.county || emailDatum.county
    obj.state = obj.state || emailDatum.state
    obj.first = obj.first || emailDatum.first
    obj.last = obj.last || emailDatum.last
    obj.full_name = obj.full_name || emailDatum.full_name

    obj.email = emailDatum.email
    obj.website = emailDatum.website

    return obj;
  }
, filterDuplicates = R.curry(function (fields, getPropsNum, hospitals) {
    const hospitalsWithPropCount = hospitals.map(getPropsNum(fields))
    , hospitalsSortedByMostProps = R.sortBy(R.prop("count"), hospitalsWithPropCount)
    ;

    return hospitalsSortedByMostProps[0];
  })
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
, getDataTasks = [
    getCVSData("Veterinaian_List.csv", getData(vetCols))
  , getCVSData("Vet_Email_List.csv", getData(emailCols))
  , getCVSData("uniqueHospitals.csv", getData(vetCols))
  ]
, f = s => String(s).trim().replace(/[^0-9]/g, '')
, compareNumbers = (a, b) => {
    if(!a || !b) return false
    return f(a) == f(b)
  }
, compareStrings = (a, b) => {
    if(!a || !b) return false
    a = a.toLowerCase().trim()
    b = b.toLowerCase().trim()
    return a == b
  }
, compareAddresses = (a, b) => {
    if(!a || !b) return false
    a = a.toLowerCase().replace('highway', 'hwy').trim()
    b = b.toLowerCase().replace('highway', 'hwy').trim()
    const isSubSet = (a, b) => a.indexOf(b) != -1 || b.indexOf(a) != -1
    return a == b || isSubSet(a, b)
  }
, matchHospital = (vet, hosp) => {
    if ( compareNumbers(vet.zip, hosp.zip) && compareAddresses(vet.address, hosp.address) ) {
      return true
    } else {
      return false
    }
  }
, matchEmail = (vet, email) => {
    if ((compareStrings(vet.first, email.first) && compareStrings(vet.last, email.last)) ||
        (compareStrings(vet.last, email.last) && compareNumbers(vet.zip, email.zip)) ||
         compareAddresses(vet.address, email.address) ||
         compareNumbers(vet.phone, email.phone)
       ) {
      return true
    } else {
      return false
    }
  }
, matchRecords = function (vet_data, email_data, hospital_data) {
    var h_matches = 0
    var e_matches = 0
    const newData = vet_data.reduce((newList, vd) => {
        let returnObj = buildObject(vd)
        , matchEmails = e => matchEmail(vd, e)
        , matchHospitals = h => matchHospital(vd, h)
        , emailDatum = R.find(matchEmails, email_data)
        , hospitalDatum = R.find(matchHospitals, hospital_data)
        ;

        if(hospitalDatum) {
          returnObj.account = hospitalDatum.account
          returnObj.hospital_id = hospitalDatum.id
          h_matches++
        }
        if(emailDatum) {
          returnObj = addEmailData(returnObj, emailDatum);
          e_matches++
        }

        return hospitalDatum ? R.append(returnObj, newList) : newList
      }, [])
    ;
    log("h matches", h_matches)
    log("e_matches", e_matches)
    return newData
  }
, nil = null
;

Async.parallel(getDataTasks).fork(logI, r => {
  log(moment().toDate())
  const matches = matchRecords(r[0].data, r[1].data, r[2].data)

  writeTable('vets', 'mergedTable12.csv', matches).then(() => {
      log("done!")
      log(moment().toDate())
  })
})
