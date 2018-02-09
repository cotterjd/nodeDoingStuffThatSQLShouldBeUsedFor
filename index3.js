'use strict'
var
	log = console.log
, R = require('ramda')
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
				, email: 20
				, website: 21
				, hospital_id: 22
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
, hospitalsWithVet = function (hospitalData, vetData) {
		return hospitalData.filter(hospital => {
			return R.find(vet => {
				return vet.hospital_id == hospital.id
			}, vetData) != null
		})
	}
, vetsWithHospital = function (vetData) {
		return vetData.filter(vet => {
			return vet.hospitalId != null
		})
	}
, getDataTasks = [
		getCVSData("vetTable8.csv", getData(vetCols))
	, getCVSData("Animal_Hospitals.csv", getData(vetCols))
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
	const hosps = hospitalsWithVet(r[1].data, r[0].data)

	writeTable('hospitals', 'hospitals3.csv', hosps).then(() => {
		console.log("done!");
		console.log(moment().toDate())
	});
})
