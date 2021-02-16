import _ from "lodash";
import parser from "xml-js";

const OPTIONS = {
  compact: true,
  trim: true,
  instructionHasAttributes: true,
  ignoreDeclaration: true,
};


const parseCabinetsList = (list) => _.map(
  parser.xml2js(list,OPTIONS).Root
  .Cabinet,
   "_attributes"
  )

const parseCabinetsService = (list) => _.map( _.map(
  parser.xml2js(list,OPTIONS).Root
  .Cabinet,"Services"), _.castArray
  ).map((item)=> _.map(item, "_attributes"))

const parseCabinets = (list) => {
  const CabinetsList = parseCabinetsList(list);
  const CabinetsService = parseCabinetsService(list);

  return _.zip(CabinetsList, CabinetsService).map((listServices) =>
    _.zipObject(["Cabinet", "Services"], listServices)
  );
};



const parseSpecialities = (list) =>
  _.map(
    parser.xml2js(list.replace("<Specialty/>", ""), OPTIONS).SpecialtyList
      .Specialty,
    "_attributes"
  );

const parseDoctorList = (list) =>
  _.map(
    parser.xml2js(list.replace("<Doctor/>", ""), OPTIONS).Doctors.Doctor,
    "_attributes"
  );

const parseDoctorListSpecs = (list) =>
  _.map(
    _.map(parser.xml2js(list, OPTIONS).Doctors.Doctor, "SpecId"),
    _.castArray
  ).map((specialities) => _.map(specialities, "_text"));

const parseDoctors = (list) => {
  const doctorList = parseDoctorList(list);
  const doctorListSpecs = parseDoctorListSpecs(list);

  return _.zip(doctorList, doctorListSpecs).map((doctor) =>
    _.zipObject(["info", "specialities"], doctor)
  );
};

const parseWindowList = (list) => {
  let result = _.map(
    parser.xml2js(list, OPTIONS).Windows.Window,
    "_attributes"
  );

  if (result[0] !== undefined) {
    return result;
  } else if (result.length === 0) {
    return [];
  } else {
    return [parser.xml2js(list, OPTIONS).Windows.Window._attributes];
  }
};

export default { parseSpecialities, parseDoctors, parseWindowList, parseCabinets };
