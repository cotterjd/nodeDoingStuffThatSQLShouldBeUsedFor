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
		getCVSData("mergedTable9.csv", getData(vetCols))
	, getCVSData("uniqueHospitals.csv", getData(vetCols))
	]
, f = s => String(s).trim().replace(/[^0-9]/g, '')
, compareNumbers = (a, b) => {
		if(!a || !b) return false
		return f(a) == f(b)
	}
, compareAddresses = (a, b) => {
		if(!a || !b) return false
		a = a.toLowerCase().trim()
		b = b.toLowerCase().trim()
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
, matchRecords = function (vet_data, hospital_data) {
		var h_matches = 0
		const newData = vet_data.reduce((newList, vd) => {
				let
				  matchHospitals = h => matchHospital(vd, h)
				, hospitalDatum = R.find(matchHospitals, hospital_data)
				;

				if(hospitalDatum) {
					vd.account = hospitalDatum.account
					vd.hospital_id = hospitalDatum.id
					h_matches++
				}

				return hospitalDatum ? R.append(vd, newList) : newList
			},[])
		;
		console.log("h matches", h_matches)
		return newData
	}
, nil = null
;

Async.parallel(getDataTasks).fork(logI, r => {
	console.log(moment().toDate())
	const matches = matchRecords(r[0].data, r[1].data)

	writeTable('vets', 'mergedTable10.csv', matches).then(() => {
			console.log("done!");
			console.log(moment().toDate())
	})
})
