select count(*) from vets.vet_emails
select * from vets.hospitals
select * from vets.vets where Last like '%Goldberg%'
select * from vets.vets where Last like '%Windham%'
select * from vets.vets where Account like '%Winter%'
select * from vets.vets where Account like '%Winter%'

insert into vets.masterTable (ID, Account, Address, City, State, Zip, `Zip Plus`, County, Phone, Fax, First, Last, `Full Name`, Gender, Latitude, Longitude, SqFootage, `Total Employees`, `Total Sales`, `hospitalId`) 
select v.*, (Select h.ID from vets.hospitals h where v.Phone = h.Phone limit 1) 
from vets.vets v join vets.hospitals h on h.Phone = v.Phone

insert into vets.masterTable (ID, Account, Address, City, State, Zip, `Zip Plus`, County, Phone, Fax, First, Last, `Full Name`, Gender, Latitude, Longitude, SqFootage, `Total Employees`, `Total Sales`, `Hospital ID`) 
values select 'id', 'account', 'address', 'city', 'state', 'zip', 'zip plbu', 'county', 'phone', 'fax', 'First', 'Last', 'full name', 'gender', 'latitude', 'longitude', 'sqfootge', 'tot em', 'tots s', (Select 'an id' from vets.hospitals) 
from vets.vets

insert into vets.masterTable (ID, Account, Address, City, State, Zip, `Zip Plus`, County, Phone, Fax, First, Last, `Full Name`, Gender, Latitude, Longitude, SqFootage, `Total Employees`, `Total Sales`, HospitalId) 
values (select v.*, (Select h.ID from vets.hospitals h join vets.vets v on v.Phone = h.Phone or v.Zip = h.Zip) 
from vets.vets v join vets.hospitals h on h.Phone = v.Phone or h.Zip = v.Zip)

select v.*, (Select h.ID from vets.hospitals h where v.Phone = h.Phone or v.Zip = h.Zip limit 1) as HospitalId
from vets.vets v join vets.hospitals h on h.Phone = v.Phone or h.Zip = v.Zip group by v.ID

select t.* from (select v.*, (Select h.ID from vets.hospitals h where v.Phone = h.Phone limit 1) as HospitalId
from vets.vets v join vets.hospitals h on h.Phone = v.Phone) as t where HospitalId = ''


select count(*) from vets.hospitals where Phone = ''; /*0, 11*/
select count(*) from vets.hospitals where First = ''; /*837, >20*/
select count(*) from vets.hospitals where Last = ''; /*837, >20*/
select count(*) from vets.hospitals where Zip = ''; /*0, 19*/
select count(*) from vets.hospitals where City = ''; /*0, >20*/
select count(*) from vets.hospitals where State = ''; /*0, >20*/
select count(*) from vets.hospitals where County = ''; /*0, >20*/
select count(*) from vets.hospitals where `Full Name` = ''; /*837, 0*/
select count(*) from vets.hospitals where Address = ''; /*88, 11*/
select count(*) from vets.hospitals where `Account` = ''; /*0, 3*/
select count(*) from vets.hospitals where `Zip Plus` = ''; /*0, >20*/
select count(*) from vets.hospitals where `Fax` = ''; /*2509, >20*/
select count(*) from vets.hospitals where `Gender` = ''; /*837, >20*/
select count(*) from vets.hospitals where `Latitude` = ''; /*0, 0*/
select count(*) from vets.hospitals where `Longitude` = ''; /*0, 0*/
select count(*) from vets.hospitals where `SqFootage` = ''; /*0, >20*/
select count(*) from vets.hospitals where `Total Employees` = ''; /*0, >20*/
select count(*) from vets.hospitals where `Total Sales` = ''; /*0, >20*/



/*

last, zip -> 1
last, city -> 1
phone, address -> 11
zip, city -> 19
city, zip, state -> 19
city, state -> >20
city, state, county -> >20
city, state, county, zip, zip_plus -> 6
city, state, county, zip -> 19

*/

DROP FUNCTION IF EXISTS STRIP_NON_DIGIT;
DELIMITER $$
CREATE FUNCTION STRIP_NON_DIGIT(input VARCHAR(255))
   RETURNS VARCHAR(255)
BEGIN
   DECLARE output   VARCHAR(255) DEFAULT '';
   DECLARE iterator INT          DEFAULT 1;
   WHILE iterator < (LENGTH(input) + 1) DO
      IF SUBSTRING(input, iterator, 1) IN ( '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ) THEN
         SET output = CONCAT(output, SUBSTRING(input, iterator, 1));
      END IF;
      SET iterator = iterator + 1;
   END WHILE;
   RETURN output;
END
$$

select STRIP_NON_DIGIT(Phone) from vets.hospitals;

SELECT v.ID as `ID`, v.Account, ve.Account, v.Address, ve.Address, v.Phone, ve.Phone
, v.First, ve.First, v.Last, ve.Last, v.City, ve.City, v.State, ve.State
, v.Zip, ve.Zip, v.`Zip Plus`, ve.`Zip Plus`, v.County, ve.County
, v.`Full Name`, ve.`Full Name`, v.Fax, ve.Fax, v.Gender, ve.Gender, v.Latitude, ve.Latitude
, v.Longitude, ve.Longitude, v.SqFootage, ve.SqFootage, v.`Total Employees`, ve.`Total Employees`, v.`Total Sales`, ve.`Total Sales` 
FROM vets.vets v
join vets.hospitals ve on v.`Zip` = ve.`Zip`
where ve.ID in (38492, 3960, 15182, 3793, 32622, 18361, 43263, 32547, 37559, 8220, 1692, 11258, 24943, 44598, 36345, 11451, 7753, 44823, 35051, 45280);

select count(*) from vets.vets where Phone = ''; /*3250*/
select count(*) from vets.vets where First = ''; /*21*/
select count(*) from vets.vets where Last = ''; /*1*/
select count(*) from vets.vets where Zip = ''; /*0*/
select count(*) from vets.vets where `Zip Plus` = ''; /*0*/
select count(*) from vets.vets where City = ''; /*0*/
select count(*) from vets.vets where State = ''; /*1*/
select count(*) from vets.vets where County = ''; /*14*/
select count(*) from vets.vets where `Full Name` = ''; /*3430*/
select count(*) from vets.vets where Address = ''; /*3430*/
select count(*) from vets.vets where `Account` = ''; /*0*/

select count(*) from vets.vet_emails where Phone = ''; /*3250*/
select count(*) from vets.vet_emails where First = ''; /*21*/
select count(*) from vets.vet_emails where Last = ''; /*1*/
select count(*) from vets.vet_emails where Zip = ''; /*0*/
select count(*) from vets.vet_emails where City = ''; /*0*/
select count(*) from vets.vet_emails where State = ''; /*1*/
select count(*) from vets.vet_emails where County = ''; /*14*/
select count(*) from vets.vet_emails where Full_Name = ''; /*0*/
select count(*) from vets.vet_emails where Account = ''; /*0*/
select count(*) from vets.vet_emails where Address = ''; /*16*/

/*
Vets
phone -> 4
last -> >20
first -> >20
zip -> >20
city -> >20
state -> >20
county -> >20
fullname -> 0
account -> 3
address -> 2
last, first -> 4
last, city -> 3
last, state -> 5
last, county -> 2
last, zip -> 3
last, zip -> 3
city, zip, state, county -> >20
*/

/*
Emails
phone -> >20
last -> >20
first -> >20
zip -> >20
city -> >20
state -> >20
county -> >20
fullname -> 0
account -> 0
address -> 18
last, first -> 7
last, city -> 8
last, state -> 13
last, county -> 7
last, zip -> 8
city, zip -> >20
city, zip, state, county -> >20
first, last | address | phone -> >20
first, last | address | phone | last, zip -> >20

*/

typo id 9 id 33

SELECT ve.ID, v.Account, ve.Account, v.Address, ve.Address, v.Phone, ve.Phone, v.First, ve.First, v.Last, ve.Last, v.City, ve.City, v.State, ve.State, v.Zip, ve.Zip, v.County, ve.County, v.`Full Name`, ve.`Full_Name` FROM vets.vets v
join vets.vet_emails ve on (v.`First` = ve.`First` and v.`Last` = ve.`Last`) or v.`Address` = ve.`Address` or v.`Phone` = ve.`Phone` or (v.`Last` = ve.`Last` and v.`Zip` = ve.`Zip`)
where ve.ID in (15262, 17248, 8858, 15407, 15192, 4160, 8664, 3665, 7504, 6360, 7007, 1538, 10952, 14503, 7596, 14463, 8498, 4527, 2153, 16950)

SELECT ve.ID, v.Account, ve.Account, v.Address, ve.Address, v.Phone, ve.Phone, v.First, ve.First, v.Last, ve.Last, v.City, ve.City, v.State, ve.State, v.Zip, ve.Zip, v.County, ve.County, v.`Full Name`, ve.`Full_Name` FROM vets.vets v
join vets.vet_emails ve on v.`Address` = ve.`Address`
where v.ID in (34195, 24011, 10035, 28627, 15469, 13447, 25762, 9890, 3059, 391, 37862, 39161, 10818, 22655, 27340, 18899, 12214, 2270, 44775, 14982)

SELECT v.Account, ve.Account, v.Address, ve.Address, v.Phone, ve.Phone, v.First, ve.First, v.Last, ve.Last, v.City, ve.City, v.State, ve.State, v.Zip, ve.Zip, v.County, ve.County, v.`Full Name`, ve.`Full_Name` FROM vets.vet_emails ve
join vets.vets v on v.Last = ve.Last and v.City = ve.City and v.Zip = ve.Zip and v.State = ve.State limit 1000

SELECT v.Account, ve.Account, v.Address, ve.Address, v.Phone, ve.Phone, v.First, ve.First, v.Last, ve.Last, v.City, ve.City, v.State, ve.State, v.Zip, ve.Zip, v.County, ve.County, v.`Full Name`, ve.`Full_Name` FROM vets.vet_emails ve
join vets.vets v on v.Last = ve.Last and v.Zip = ve.Zip where ve.ID in (7047, 3294, 12206, 10712, 378, 14031, 5779, 6900, 13635, 15245, 4228, 16912, 13166, 8630, 8444, 12761, 11373, 17166, 6268, 5647)

SELECT * FROM vets.vets v
join vets.vet_emails ve on ve.Last LIKE v.Last

SELECT * FROM vets.vets v
join vets.vet_emails ve on ve.First LIKE v.First

SELECT count(*) FROM vets.vets v
join vets.vet_emails ve on ve.ID = v.ID

8915

SELECT * FROM vets.vets v
join vets.vet_emails ve on ve.`Full Name` = v.`Full Name`