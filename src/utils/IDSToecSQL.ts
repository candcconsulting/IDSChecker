import { spec } from "node:test/reporters";
import { synonym } from "../helperFunctions/synonyms";

///NOTES : TODO
/*
1 : When checking attribute values we need to review what the options are
  requirement > attribute > value > simplevalue when it is ? should find all values
  requirement > attribute > value > simplevalue when it is a value should find items that are NOT that  value
  and probably should be in the handleAttribute function
2 : There is a limitation in that if the IFC uses the same Pset for two properties but the application uses different classes then we will not find the correct class
*/


interface propertyCheck {
  sqlClass: string;
  sqlProperty: string;
  valueCheck: string;
}

function getNodeRestriction(node: Element): any | null {
  let returnValue: any | null = null;
  const restrictionType = node.firstElementChild;
  switch (restrictionType!.nodeName) {
    case 'xs:minExclusive': {
      returnValue = ' ifnull(<property>,0) < ' + restrictionType!.attributes.getNamedItem('value')!.textContent;
      break;
    }
    case 'xs:minInclusive': {
      returnValue = ' ifnull(<property>,0) <= ' + restrictionType!.attributes.getNamedItem('value')!.textContent;
      break;
    }
    case 'xs:enumeration': {
      let inValue = "'" + restrictionType!.attributes.getNamedItem('value')!.textContent + "'";
      let nextElement = restrictionType!.nextElementSibling;
      while (nextElement) {
        if (nextElement.nodeName === 'xs:enumeration') {
          const nextInValue = nextElement.attributes.getNamedItem('value')!.textContent;
          inValue = inValue + ', ' + "'" + nextInValue + "'";
        }
        nextElement = nextElement.nextElementSibling;
      }
      returnValue = 'NOT IN ('+ inValue + ')';
      break;
    }
  }
  return returnValue;
}

function getNodeValue(node: Element, compare = false): any | null {
  let returnValue: any | null = null;
  const contentNode = node.firstElementChild
  switch (contentNode!.nodeName) {
    case 'simpleValue': {
      returnValue = contentNode!.textContent;
      if (compare)
        returnValue = " NOT REGEXP('" + returnValue + "', <property>)";
      break;
    }
    case 'xs:restriction': {
      returnValue = getNodeRestriction(contentNode!);
      break;
    }
  }  
  return returnValue;
}

function handleMaterial(material: Element): propertyCheck {
  // each material has a materialSet and a value
  let returnValue: propertyCheck = {
    sqlClass: '',
    sqlProperty: '',
    valueCheck: ''
  }
  const materialValue = material.querySelector('value');
  const materialCheck = getNodeValue(materialValue!);
  /* material should only have a value
  so the sqlClass will be physicalMaterial which we need to JOIN to the inputClass
  the sqlProperty will be userLabel from physicalMaterial
  the valueCheck will be the value or the restriction
  restriction can be xs:restriction with xs:enumeration
  */
  if (materialCheck) {
    returnValue = {
      sqlClass: 'physicalMaterial',
      sqlProperty: 'pm.userLabel',
      valueCheck: materialCheck
    }
  }
  return returnValue;
}

function handleProperty(property: Element, requirement = false): propertyCheck {
  // each property has a propertySet and a value
  let returnValue: propertyCheck = {
    sqlClass: '',
    sqlProperty: '',
    valueCheck: ''
  }
  let valueCheck = '';
  const propertySet = property.querySelector('propertySet');
  const propertyName = property.querySelector('name');
  if (propertySet && propertyName ) {
    const sqlClass = getNodeValue(propertySet);
    const sqlProperty = getNodeValue(propertyName);
    returnValue.sqlClass = sqlClass;
    returnValue.sqlProperty = sqlProperty;          
  }
  const propertyValue = property.querySelector('value');
  if (propertyValue) {
    valueCheck = getNodeValue(propertyValue, requirement);
    if (valueCheck === '?' && requirement)
      valueCheck = ` is null `;
  }
  else
    valueCheck = ' is not null';    
  returnValue.valueCheck = valueCheck;
  return returnValue;
}

function handleAttribute(property: Element, baseClass : string, requirement = false, ): propertyCheck {
  // each property has a propertySet and a value
  let returnValue: propertyCheck = {
    sqlClass: baseClass,
    sqlProperty: '',
    valueCheck: ''
  }
  //const propertySet = property.querySelector('propertySet');
  const propertyName = property.querySelector('name');
  const propertyValue = property.querySelector('value');
  if (propertyName && propertyValue) {
//    const sqlClass = getNodeValue(propertySet);
    const sqlClass = baseClass;
    const sqlProperty = getNodeValue(propertyName);
    let valueCheck = getNodeValue(propertyValue);
    if (!valueCheck) 
      valueCheck = ' is not null';
    else
      if (valueCheck === '?' && requirement) {
        valueCheck = ` is null `;
      }    
    if (sqlClass && sqlProperty && valueCheck) {
      returnValue = {
        sqlClass: sqlClass,
        sqlProperty: sqlProperty,
        valueCheck: valueCheck
      }
    }

  }
  return returnValue;
}



// Function to convert XML to ecSQL
export const convertXmlToEcSQL = (xmlDoc: string): string => {
  // we need to be passed in a specification which will have an applicability section and a requirements section
  // applicability will have an entity which may refer to a class and a property set which will have a property set and property and maybe a value
  // this will return the innerSQL ie (select id from entity where property = value)
  // if there is a property set we will need to join against that
  // requirements will have a property which will have a property set and a value

  let returnecSQL = '';
  let applicabilitySearch = '';
  const parser = new DOMParser();
  const xmlParsed = parser.parseFromString(xmlDoc, 'text/xml');
  const specifications = xmlParsed.querySelectorAll('specifications');
  let library = "";
  try {
    library = xmlParsed.querySelector('info > library')?.textContent ?? "";
  } catch (error) {

  }
  specifications.forEach((specification : any) => {
    // in reality we need to passed in a specification not the whole document ... but handle here for now
    const applicability = specification.querySelector('applicability');
    const classEntity = applicability.querySelector('entity');
    const propertySet = applicability.querySelector('propertySet');
    const property = applicability.querySelector('property');    
    let classSearch = 'bis.geometricElement3d';
    let setLinkProperty = 'ecInstanceid';
    let linkProperty = 'ecInstanceId';
    let whereClause = '';
    let nameClassEntity = 'default';
    if (classEntity) {
      nameClassEntity = getNodeValue(classEntity.querySelector('name'));
      classSearch = synonym(getNodeValue(classEntity.querySelector('name')),library, nameClassEntity).join('');
      if (classSearch.includes('Aspect'))
        linkProperty = 'element.id';
    }
    let propertySetSearch = '';
    if (propertySet) {
      propertySetSearch = synonym(getNodeValue(propertySet),library, nameClassEntity).join('');
      if (propertySetSearch.includes('Aspect')) {
        setLinkProperty = 'element.id';
      }
    }
    let propertySearch : any;
    if (property) {
      propertySearch = handleProperty(property);
      whereClause = `WHERE ${synonym(getNodeValue(propertySearch.sqlProperty),library, nameClassEntity).join('')} = ${propertySearch.sqlValue}`

    }

    let joinSQL = '';
    if (propertySetSearch !== '')
      joinSQL = `join ${propertySetSearch} b on b.${setLinkProperty} = a.${linkProperty} `;
    applicabilitySearch = `SELECT ecInstanceId as id from ${synonym(classSearch,library, nameClassEntity).join('')} ${joinSQL} a ${whereClause}`;
    console.log(`Applicability Search = ${applicabilitySearch}`);
    const requirements = specification.querySelector('requirements');
    requirements.childNodes.forEach((requirement : any) => {
      // OK property should define the WHERE clause ... looks like
      // then attribute is a requirement check
      // so select everthing where ecinstanceid in (select ecinstanceid from the property criteria)
      let ecSQL = '';
      let checkValue = undefined;
      switch (requirement.nodeName) 
      {
        case ('property') :
          // this is the case where we want to check if the property has a value
        {
          checkValue = handleProperty(requirement, requirement = true); 
          if (checkValue) {
            console.log(`checking for property ${synonym(checkValue.sqlClass,library, nameClassEntity).join('')}`)
            const fromClass = synonym(checkValue.sqlClass,library, nameClassEntity).join('');
            let id = 'ecInstanceId'
            if (fromClass.includes('Aspect')) {
              id = 'element.id'
            }
            let whereClause = ''
            if (checkValue.valueCheck.includes('<property>'))  {
              checkValue.valueCheck = checkValue.valueCheck.replace('<property>',synonym(checkValue.sqlProperty,library, nameClassEntity).join(''));
              whereClause = ` WHERE ${checkValue.valueCheck}`;
            }
            else {
              whereClause = ` WHERE ${synonym(checkValue.sqlProperty,library).join(" ")} ${checkValue.valueCheck}`
            }

            ecSQL = `SELECT '${checkValue.sqlClass}' as entity, ${id} as id, '${checkValue.sqlProperty}' as Property, ${synonym(checkValue.sqlProperty,library).join(" ")} as PropertyValue  from ${synonym(checkValue.sqlClass,library, nameClassEntity).join('')} ${whereClause}`
          }
          break;
        }
        case ('material') :
        {
          checkValue = handleMaterial(requirement); 
          console.log(checkValue);
          if (checkValue) {
            console.log(`checking for material ${synonym(checkValue.sqlClass,library, nameClassEntity).join('')}`)
            const fromClass = synonym(checkValue.sqlClass,library, nameClassEntity).join('');
            let id = 'ecInstanceId'
            if (fromClass.includes('Aspect')) {
              id = 'element.id'
            }
            ecSQL = `SELECT ec_classname(pe.ecClassid) as entity, pe.ecInstanceId as id, 'Material' as Property, pm.userLabel as PropertyValue  from ${synonym(propertySetSearch).join(" ")} a join bis.physicalelement pe on a.element.id = pe.ecinstanceid join bis.physicalMaterial pm on pe.physicalmaterial.id = pm.ecinstanceid WHERE ${synonym(checkValue.sqlProperty).join(" ")} ${checkValue.valueCheck} and ${propertySearch} Like ${propertySetSearch}`
          }
          break;
        }
        case ('attribute') :
        {
          checkValue = handleAttribute(requirement, classSearch, true); 
          console.log(checkValue);
          if (checkValue) {
            console.log(`Checking for attribute ${synonym(checkValue.sqlClass,library, nameClassEntity).join('')}`)
            const fromClass = synonym(checkValue.sqlClass, library).join(' ');
            let id = 'ecInstanceId'
            if (fromClass.indexOf('Aspect') > -1) {
              id = 'element.id'
            }
            let whereClause = `${synonym(checkValue.sqlProperty, library, nameClassEntity).join('')} ${checkValue.valueCheck}`
            if (checkValue.valueCheck === '?')
              whereClause = `${synonym(checkValue.sqlProperty, library, nameClassEntity).join('')} like '%'`;              
            ecSQL = `SELECT '${checkValue.sqlClass}' as entity, ${id} as id, '${checkValue.sqlProperty}' as Property, ${synonym(checkValue.sqlProperty, library, nameClassEntity).join('')} as PropertyValue  from ${synonym(checkValue.sqlClass, library, nameClassEntity).join('')} WHERE ${whereClause}`
          }
          break;
        }
        default : {
          console.log('unsupported ' + requirement.nodeName)
          break;
        }
      }
      if (ecSQL !== '') {
        if (returnecSQL !== '') {
          returnecSQL = returnecSQL + ' UNION ' + ecSQL;                
        }
        else {
          returnecSQL = ecSQL;                
        }
      }
    });
  });
  returnecSQL = 'select * from (' + returnecSQL + ') where id in (' + applicabilitySearch + ')';
  console.log(returnecSQL)
  return returnecSQL;

}


export default convertXmlToEcSQL;