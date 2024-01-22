/* eslint-disable no-self-assign */
/* eslint-disable guard-for-in */
import { LightningElement, wire, track, api } from "lwc";
import getObjectMetadata from "@salesforce/apex/LegacyApi.getObjectMetadata";
import insertFieldMappings from "@salesforce/apex/fieldMappingController.insertFieldMappings";
import getFieldMappings from "@salesforce/apex/fieldMappingController.getfieldMapping";

export default class FieldMapping extends LightningElement {
  @track configRecordId;
  @track oldResponsedata;
  @track selectedObject;
  @track selectedField;
  @track item = [];
  @track options = [];
  @track objectOptions = [];
  @track fieldOptions = [];
  @track requriedFieldOptions = [];
  @track relatedObject = [];
  @track relatedField = [];
  @track relatedFieldOptions = [];
  @track index = 1;
  @track rIndex = 1;
  @track relatedIndex = 1;
  @track objectMetadata;

  @track jsonResponse;
  @track systemValue;
  @track relatedObjectchecked;
  @track listOfSfFieldOption;
  @track nestedFieldTrack;
  @track isobjectLoaded = false;
  @track isfieldOptionsLoaded = false;
  @track isrequriedFieldOptionsLoaded = false;
  @track objectFieldMapping = [];
  @track categorizedFieldsvalue = [];
  @track categorizedFieldStore = [];
  @track tempcategorizedFieldStore = [];
  @track categorizedNestedFields = [];
  @track categorizedFields = [];
  @track nestedatalist = [];
  @track platformObject;
  @track isShowModal = false;
  @track tableData = [];
  @track listOfSfRequriedFieldOption;
  @api alldatatocarry;
  @track columns = [
    { label: "Salesforce Field", fieldName: "sfFieldName__c", type: "text" },
    {
      label: "Salesforce Object",
      fieldName: "SF_Object_Name__c",
      type: "text"
    },
    {
      label: "Platform Field Name ",
      fieldName: "Platform_Field_Name__c",
      type: "text"
    },
    {
      label: "Platform Object Name",
      fieldName: "Platform_Object_Name__c",
      type: "text"
    },
    { label: "Nested Field Name", fieldName: "NestedField__c", type: "text" },
    { label: "ConfigRecordId", fieldName: "configRecordId__c", type: "text" }
  ];

  connectedCallback() {
     console.log('FieldMapping alldatatocarry==68==>>' ,JSON.stringify(this.alldatatocarry));
      console.log('this is fieldResponse=69==>12',this.alldatatocarry["fieldResponse"]);
      let newResponse = this.alldatatocarry["fieldResponse"];
    if(this.alldatatocarry["fieldResponse"] !=null && this.alldatatocarry["oldResponsedata"] !=null && this.alldatatocarry["configRecordId"] != null ){
      this.jsonResponse    =  this.alldatatocarry["fieldResponse"];
      this.oldResponsedata =  this.alldatatocarry["oldResponsedata"];
      this.configRecordId =   this.alldatatocarry["configRecordId"];
      console.log('this is jsonResponse Data=74==>>',this.jsonResponse);
      console.log('OldoldResponsedata',this.oldResponsedata);
      console.log('allconfigId==78==>',this.configRecordId);
    }
    if (newResponse) {
      console.log('this is json response data:==> ' + newResponse);
    }
    this.handleResponse(newResponse);
    console.log("this.configRecordId==>>", this.configRecordId);
    getObjectMetadata({})
      .then((result) => {
        if (result) {
          console.log("data", result);
          this.objectMetadata = result;
          this.objectOptions = result.map((obj) => ({
            label: obj.objectName,
            value: obj.objectName
          }));
          console.log("objectOptions>>>",JSON.stringify(this.objectOptions));
          console.log('Result Data ++ ' + JSON.stringify(result));
          console.log("this.oldResponsedata", this.oldResponsedata);
          console.log('this is configId===>123==>',this.configRecordId);
          if (this.oldResponsedata == true) {
            console.log("this.oldResponsedataAFTER", this.oldResponsedata);
            console.log('this is configId===>124==>',this.configRecordId);
            getFieldMappings({ configId: this.configRecordId })
              .then((result) => {
                console.log("result==>>", result[0]);
                this.tableData = result;
                this.selectedObject = result[0].SF_Object_Name__c;
                let nestedParts = result[0].NestedField__c;
                this.nestedFieldTrack = result[0].NestedField__c;
                let split_result =   this.nestedFieldTrack.split('.');
                this.platformObject = split_result[split_result.length - 1];
                let selectedObjectMetadata = this.objectMetadata.find(
                  (obj) => obj.objectName === this.selectedObject
                );
                let oldindex = 1;
                this.listOfSfFieldOption =
                  selectedObjectMetadata.fields
                    .filter((field) => !field.isRequired)
                    .map((field) => ({
                      label: field.fieldName.fieldLabel,
                      value: field.fieldName.fieldApiName,
                      datatype: field.fieldName.datatype,
                      relatedObject: field.relatedObjectName,
                      Id: oldindex++
                    })) || [];

                let roldindex = 1;
                this.listOfSfRequriedFieldOption =
                  selectedObjectMetadata.fields
                    .filter((field) => field.isRequired)
                    .map((field) => ({
                      label: field.fieldName.fieldLabel,
                      value: field.fieldName.fieldApiName,
                      datatype: field.fieldName.datatype,
                      relatedObject: field.relatedObjectName,
                      Id: roldindex++
                    })) || [];

                this.isfieldOptionsLoaded = true;

                this.categorizedFieldStore = this.categorizedFields.find(
                  (item) => item.label === nestedParts
                );
                console.log(
                  "this.categorizedFieldStore=125==>>",
                  JSON.stringify(this.categorizedFieldStore)
                );
                if (this.categorizedFieldStore) {
                  console.log("value=127==>", this.categorizedFieldStore.value);
                  let jsonValue = JSON.parse(this.categorizedFieldStore.value);
                  console.log(
                    "jsonValue==131==>",
                    JSON.stringify(jsonValue[0])
                  );
                  let record = jsonValue[0];
                  this.categorizedFields = [];
                  for (let key in record) {
                    console.log("key==132==>>", key);
                    this.categorizedFields.push({
                      dataType: typeof key,
                      label: key,
                      apiName: key,
                      value: JSON.stringify(record[key])
                    });
                    if (typeof record[key] === "object") {
                      let subvalue = record[key];

                      for (let subkey in subvalue) {
                        console.log("subkey==>>", subkey);
                        this.categorizedFields.push({
                          dataType: typeof key,
                          label: key + "." + subkey,
                          apiName: subkey,
                          value: JSON.stringify(subvalue[subkey])
                        });
                      }
                    }
                  }
                  console.log(
                    "this.categorizedFields==156==>>",
                    JSON.stringify(this.categorizedFields)
                  );
                }

                this.fieldOptions = result
                  .map((field) => {
                    let matchedFieldOption = this.listOfSfFieldOption.find(
                      (opt) => opt.label === field.sfFieldName__c
                    );
                    let matchedCategorizedField = this.categorizedFields.find(
                      (opt) => opt.label === field.Platform_Field_Name__c
                    );
                    console.log(
                      "matchedFieldOption==175==>>",
                      JSON.stringify(matchedFieldOption)
                    );
                    console.log(
                      "matchedCategorizedField==175==>>",
                      JSON.stringify(matchedCategorizedField)
                    );
                    if (matchedFieldOption && matchedCategorizedField) {
                      return {
                        Id: this.index++,
                        label: field.sfFieldName__c,
                        value: matchedFieldOption.value,
                        datatype: matchedFieldOption.datatype,
                        relatedObject: matchedFieldOption.relatedObject,
                        apifieldLabel: field.Platform_Field_Name__c,
                        apifieldValue: matchedCategorizedField.value,
                        apifieldName: matchedCategorizedField.apiName,
                        apifieldDataType: matchedCategorizedField.dataType,
                        recordId : field.Id
                      };
                    }

                    return null; // Handle the case where there are no matches
                  })
                  .filter((field) => field !== null);

                console.log(
                  "this is field mapping: " + JSON.stringify(this.fieldOptions)
                );
                
                
               
                this.requriedFieldOptions = result
                  .map((field) => {
                    let matchedFieldOption =
                      this.listOfSfRequriedFieldOption.find(
                        (opt) => opt.label === field.sfFieldName__c
                      );
                    let matchedCategorizedField = this.categorizedFields.find(
                      (opt) => opt.label === field.Platform_Field_Name__c
                    );

                    if (matchedFieldOption && matchedCategorizedField) {
                      return {
                        Id: this.rIndex++,
                        label: matchedFieldOption.label,
                        value: matchedFieldOption.value,
                        datatype: matchedFieldOption.datatype,
                        relatedObject: matchedFieldOption.relatedObject,
                        apifieldLabel: matchedCategorizedField.label,
                        apifieldValue: matchedCategorizedField.value,
                        apifieldName: matchedCategorizedField.apiName,
                        apifieldDataType: matchedCategorizedField.dataType,
                        recordId : field.Id
                      };
                    }
                    return null;
                  })
                  .filter((field) => field !== null);
                  console.log(' this.requriedFieldOptions', JSON.stringify( this.requriedFieldOptions));
              })
              .catch((error) => {
                console.log("error==>>333", error);
              });
          }
          console.log('this is field123 ',this.oldResponsedata);
          this.dispatchEvent(new CustomEvent('insertfield',{
            detail:this.oldResponsedata
        }))
          this.spinnerHandler(false);
        } else if (error) {
          console.log("error", error);
          console.error(error);
        }
      })
      .catch((error) => {
        console.log("error==>>243", error);
        this.error = error;
      });
          
  }

  @api handleSearch(data) {
    console.log("@@@ this is the API METHOD Child   :: ");
    this.handleResponse(data);
  }

  handleResponse(data) {
    let dataType = typeof data;
    console.log("DATA type value" + dataType);

    if (dataType === "string") {
      // Assuming data is a JSON string, parse it
      try {
        data = JSON.parse(data);
        dataType = typeof data; // Update dataType after parsing
      } catch (error) {
        console.error("Error parsing JSON string:", JSON.stringify(error));
        return;
      }
    }

    switch (dataType) {
      case "object":
        if (Array.isArray(data)) {
          if (data.length > 1) {
            this.categorizeFieldsByDataType(data[0]);
          }
        } else if (data instanceof Map) {
          // Handle map
        } else {
          this.categorizeFieldsByDataType(data);
        }
        break;
      default:
        console.warn("Unsupported data type:", dataType);
        break;
    }
  }

  categorizeFieldsByDataType(record) {
    this.categorizedFields = [];
    this.categorizedNestedFields = [];
    console.log("@@@@ this is the DATA " + JSON.stringify(record));
    this.categorizedFieldStore = record;
    console.log("record1", record);
    for (let key in record) {
      console.log("key1", key);
      this.categorizedFields.push({
        dataType: typeof key,
        label: key,
        apiName: key,
        value: JSON.stringify(record[key])
      });

      if (typeof record[key] === "object") {
        this.categorizedNestedFields.push({
          dataType: typeof key,
          label: key,
          apiName: key,
          value: JSON.stringify(record[key])
        });
      } else {
        console.log("this is error at line number><92>");
      }

      console.log("typeof record[key]", typeof record[key]);

      if (typeof record[key] === "object") {
        let subvalue = record[key];

        for (let subkey in subvalue) {
          // if (subkey ==0){
          //     break;
          // }
          console.log("subkey==>>", subkey);
          this.categorizedFields.push({
            dataType: typeof key,
            label: key + "." + subkey,
            apiName: subkey,
            value: JSON.stringify(subvalue[subkey])
          });
        }
      }
    }

    console.log("categorizedFields", JSON.stringify(this.categorizedFields));
    this.dispatchEvent(new CustomEvent('newmappinddata',{
      detail: this.categorizedFields
    }))

    return this.categorizedFields;
  }

  handleSelectField(event) {
    this.categorizedFieldsvalue = event.target.value;
    let selectedvalue = JSON.parse(this.categorizedFieldsvalue);
    this.tempcategorizedFieldStore = [];

    let seenObjects = new Set();
    if (typeof selectedvalue === "boolean") {
      //values = values.toString();
    } else if (typeof selectedvalue === "number") {
    } else if (typeof selectedvalue === "string") {
    } else if (typeof selectedvalue === "list") {
      let value = selectedvalue[0];
      for (let key in value) {
        let val = value[key];
        if (
          typeof val === "boolean" ||
          typeof val === "number" ||
          typeof val === "string" ||
          typeof val === "list"
        ) {
          this.tempcategorizedFieldStore.push({
            dataType: typeof val,
            label: key,
            apiName: key,
            value: JSON.stringify(val)
          });
        } else {
          this.tempcategorizedFieldStore.push({
            dataType: typeof val,
            label: key,
            apiName: key,
            value: JSON.stringify(val)
          });
          for (let key2 in val) {
            console.log("value---", key2);
            let val2 = val[key2];
            this.tempcategorizedFieldStore.push({
              dataType: typeof val2,
              label: key + "." + key2,
              apiName: key + "." + key2,
              value: JSON.stringify(val2)
            });
          }
        }
      }
    } else {
      for (let key in selectedvalue) {
        if (key == 0) {
          selectedvalue = selectedvalue[0];
          break;
        }
      }
      for (let key in selectedvalue) {
        console.log("value---", key);
        let val = selectedvalue[key];
        this.tempcategorizedFieldStore.push({
          dataType: typeof val,
          label: key,
          apiName: key,
          value: JSON.stringify(val)
        });
        console.log("typeof--", typeof val);
        if (
          typeof val === "boolean" ||
          typeof val === "number" ||
          typeof val === "string" ||
          typeof val === "list"
        ) {
        } else {
          for (let key1 in val) {
            if (key1 == 0) {
              break;
            }
            this.tempcategorizedFieldStore.push({
              dataType: typeof key1,
              label: key + "." + key1,
              apiName: key + "." + key1,
              value: JSON.stringify(val[key1])
            });
          }
        }
      }
    }
    this.isShowModal = false;
    this.categorizedFields = [];

    console.log(
      "thisTesting><172>",
      JSON.stringify(this.tempcategorizedFieldStore)
    );
    this.categorizedNestedFields = [];
    console.log(
      "this.tempcategorizedFieldStore><175>",
      JSON.stringify(this.tempcategorizedFieldStore)
    );
    this.categorizedFields.push(...this.tempcategorizedFieldStore);
    console.log("testing1><216>", JSON.stringify(this.categorizedFields));

    for (let nestedData in this.tempcategorizedFieldStore) {
      console.log(
        "this.tempcategorizedFieldStore><193>",
        JSON.stringify(this.tempcategorizedFieldStore[nestedData])
      );
      console.log(
        "this is size @@@@@@@",
        this.tempcategorizedFieldStore.length
      );
      if (
        this.tempcategorizedFieldStore[nestedData].dataType === "object" &&
        !seenObjects.has(
          JSON.stringify(this.tempcategorizedFieldStore[nestedData])
        )
      ) {
        this.temp = { dataType: "", label: "", apiName: "", value: "" };
        
        this.tempcategorizedFieldStore[nestedData].dataType;
        this.temp.label = this.tempcategorizedFieldStore[nestedData].label;
        this.temp.apiName = this.tempcategorizedFieldStore[nestedData].apiName;
        this.temp.value = this.tempcategorizedFieldStore[nestedData].value;
        console.log("this.temp><205>", JSON.stringify(this.temp));
        this.categorizedNestedFields.push(this.temp);
        console.log("this is key@@@@@@@@" + this.temp.label);
        console.log(
          "categorizedNestedFields push >>>>>>>>>>@@" +
            JSON.stringify(this.categorizedNestedFields)
        );
      }
    }

    console.log("showModel>>>", this.isShowModal);
  }

  openPopUp() {
   console.log('OUTPUT : ',this.oldResponsedata);
    this.isShowModal = true;
    if (this.oldResponsedata === 'true') {
      console.log('old==495==>');
      this.isShowModal = false;
      console.log('old==495==>',this.isShowModal);  
    } else {
      this.isShowModal = true;
      console.log('new==498==>',this.isShowModal);  
    }
    console.log('isShowModal=497==>',this.isShowModal);
    //this.categorizedFields = [];

    for (let key in this.categorizedFieldStore) {
      if (typeof this.categorizedFieldStore[key] === "object") {
        let subvalues = this.categorizedFieldStore[key];

        for (let subkey in subvalues) {
          if (typeof subvalues[subkey] === "object") {
            this.categorizedFields.push({
              dataType: typeof subvalues[subkey],
              label: key + "." + subkey,
              apiName: subkey,
              value: JSON.stringify(subvalues[subkey])
            });
            this.nestedFieldTrack = key + "." + subkey;
            this.platformObject = subkey;
          }
        }
      }
    }
    console.log(
      "this.categorizedFieldStore",
      JSON.stringify(this.categorizedFieldStore)
    );
  }

  handleNextNested() {
    console.log("testing next");
    let nextValues = JSON.parse(this.categorizedNestedFields[0].value);
    this.categorizedNestedFields = [];

    for (let key in nextValues) {
      console.log("key22", key);
      console.log("typeof nextValues[key]", typeof nextValues[key]);

      if (typeof nextValues[key] === "object") {
        let subvalues = nextValues[key];
        console.log("key", key);
        console.log("subvalues", JSON.stringify(subvalues));

        this.categorizedNestedFields.push({
          dataType: typeof subvalues[key],
          label: key,
          apiName: key,
          value: JSON.stringify(subvalues)
        });
      } else {
        this.categorizedNestedFields.push({
          dataType: typeof subvalues[key],
          label: key,
          apiName: key,
          value: JSON.stringify(subvalues)
        });
        alert("Do Not have Nested Field.");
      }
    }

    console.log("categorizedNestedFields", this.categorizedNestedFields);
  }

  // saveModalBox() {
  //     console.log('save');
  //     this.isShowModal = false;
  //     this.categorizedFields = [];
  //     console.log('this.tempcategorizedFieldStore', JSON.stringify(this.tempcategorizedFieldStore));
  //     this.categorizedFields.push(...this.tempcategorizedFieldStore);
  // }

  hideModalBox() {
    console.log("cancel");
    this.isShowModal = false;
  }

  // @wire(getObjectMetadata)
  // objectMetadataWire({ error, data }) {
  //   if (data) {
  //     console.log("data", data);
  //     this.objectMetadata = data;
  //     this.objectOptions = data.map((obj) => ({
  //       label: obj.objectName,
  //       value: obj.objectName
  //     }));
  //     this.spinnerHandler(false);
  //   } else if (error) {
  //     console.log("error", error);
  //     console.error(error);
  //   }
  // }

  handleObjectChange(event) {
    try {
      this.index = 1;
      this.rIndex = 1;
      this.fieldOptions = [];
      this.requriedFieldOptions = [];
      this.listoflookupObj = [];
      this.selectedObject = event.target.value;
      let indexOfField = 0;
      let rindexOfField = 0;
      let selectedObjectMetadata = this.objectMetadata.find(
        (obj) => obj.objectName === this.selectedObject
      );
      console.log("selectedObjectMetadata", selectedObjectMetadata);
      if (selectedObjectMetadata) {
        this.fieldOptions =
          selectedObjectMetadata.fields
            .filter((field) => !field.isRequired)
            .map((field) => ({
              label: field.fieldName.fieldLabel,
              value: field.fieldName.fieldApiName,
              datatype: field.fieldName.datatype,
              relatedObject: field.relatedObjectName,
              Id: this.index++,
              apifieldLabel: this.categorizedFields[indexOfField]?.label,
              apifieldValue: this.categorizedFields[indexOfField]?.value,
              apifieldName: this.categorizedFields[indexOfField]?.apiName,
              apifieldDataType: this.categorizedFields[indexOfField++]?.dataType
            })) || [];
        console.log(
          "this.fieldOptions===>>>",
          JSON.stringify(this.fieldOptions)
        );
        this.listOfSfFieldOption =
          selectedObjectMetadata.fields
            .filter((field) => !field.isRequired)
            .map((field) => ({
              label: field.fieldName.fieldLabel,
              value: field.fieldName.fieldApiName,
              datatype: field.fieldName.datatype,
              relatedObject: field.relatedObjectName,
              Id: this.index++
            })) || [];

        this.requriedFieldOptions =
          selectedObjectMetadata.fields
            .filter(
              (field) =>
                field.isRequired &&
                field.fieldName.fieldApiName !== "OwnerId" &&
                field.fieldName.fieldLabel !== "Owner ID"
            )
            .map((field) => ({
              label: field.fieldName.fieldLabel,
              value: field.fieldName.fieldApiName,
              datatype: field.fieldName.datatype,
              relatedObject: field.relatedObjectName,
              Id: this.rIndex++,
              apifieldLabel: this.categorizedFields[rindexOfField]?.label,
              apifieldValue: this.categorizedFields[rindexOfField]?.value,
              apifieldName: this.categorizedFields[rindexOfField]?.apiName,
              apifieldDataType:
                this.categorizedFields[rindexOfField++]?.dataType
            })) || [];
        console.log(
          "REQUIRED FIELD MAPPPING ::: " +
            JSON.stringify(this.requriedFieldOptions)
        );

        this.isfieldOptionsLoaded = true;
        this.isrequriedFieldOptionsLoaded = true;
        console.log(
          "listoflookupObj><349>",
          JSON.stringify(this.listoflookupObj)
        );
      }
    } catch (error) {
      console.log("Error at line number", error);
    }
  }

  handRelatedObject(event) {
    this.relatedObjectchecked = event.target.value;
  }

  handleFieldChange(event) {
    this.selectedField = event.target.value;
    console.log("This is Selected Value" + this.selectedvalue);
    const selectedFieldData = this.objectMetadata
      .find((obj) => obj.objectName === this.selectedObject)
      .fields.find((field) => field.fieldName === this.selectedField);
    console.log("selectedFieldData", selectedFieldData);
    console.log(
      "selectedFieldData.relatedObjectName",
      selectedFieldData.relatedObjectName
    );

    if (selectedFieldData && selectedFieldData.relatedObjectName) {
      this.selectedRelatedObject = null;
      this.relatedObject = selectedFieldData.relatedObjectName;
      this.relatedField = selectedFieldData.relatedFieldName;

      console.log("this.relatedObject==>>", this.relatedObject);
      console.log("this.relatedField==>>", this.relatedField);

      this.relatedObjectOptions =
        this.objectMetadata
          .find((obj) => obj.objectName === this.relatedObject)
          ?.fields.map((field) => ({
            label: field.relatedObjectName,
            value: field.relatedObjectName
          })) || [];

      console.log("this.selectedRelatedObject", this.selectedRelatedObject);
      console.log("this.relatedObjectOptions ", this.relatedObjectOptions);
      this.relatedFieldOptions = this.relatedObjectOptions;
    } else {
      this.relatedObject = null;
      this.relatedField = null;
      this.relatedObjectOptions = [];
      this.relatedFieldOptions = [];
    }
  }

  handleRelatedObjectChange(event) {
    this.selectedRelatedObject = event.target.value;
  }

  handleCategorizedFieldsChange(event) {
    let fieldvalue = event.target.value;
  }

  addObjectRow() {
    console.log(
      "@@@ this is the length before add :: " + this.fieldOptions.length
    );
    console.log("this.index", this.index);
    this.index = this.fieldOptions.length + 1;
    this.fieldOptions.push({ Id: this.index, label: "", value: "" });
  }

  deleteObjectRow(event) {
    let indexNumber = 1;

    for (let option of this.fieldOptions) {
      if (event.target.dataset.value == option.Id) {
        indexNumber = this.fieldOptions.indexOf(option);
      }
    }

    if (indexNumber != null) {
      this.fieldOptions.splice(indexNumber, 1);
      let i = 1;

      for (let option of this.fieldOptions) {
        option.Id = i;
        i++;
      }
    }

    this.index = this.index - 1;
    console.log("Indexx", this.index);
  }

  spinnerHandler(enable) {
    const passEvent = new CustomEvent("getspinnervalue", {
      detail: { value: enable }
    });
    this.dispatchEvent(passEvent);
  }

  handleFieldMappingChange(event) {
    let selectedValue = event.detail.value;
    let selectedIndex = event.target.dataset.value;
    for (let externalField of this.fieldOptions) {
      if (selectedIndex == externalField.Id) {
        let selectedOption = event.target.options.find(
          (opt) => opt.value === selectedValue
        );
        externalField.label = externalField.label;
        externalField.value = externalField.value;
        externalField.datatype = externalField.datatype;
        externalField.relatedObject = externalField.relatedObject;
        externalField.Id = externalField.Id;
        externalField.apifieldLabel = selectedOption.label;
        externalField.apifieldName = selectedOption.apiName;
        externalField.apifieldValue = selectedOption.value;
        externalField.apifieldDataType = selectedOption.dataType;
      }
    }

    console.log(
      "this.fieldOptions==614=>> ",
      JSON.stringify(this.fieldOptions)
    );
  }

  handleSFFieldMappingChange(event) {
    console.log("handleSFFieldMappingChange");

    for (let sfField of this.fieldOptions) {
      console.log("sfField.Id==>", sfField.Id);
      console.log("event.target.dataset.value==>>", event.target.dataset.value);
      if (event.target.dataset.value == sfField.Id) {
        sfField.label = event.detail.value;
        sfField.value = event.detail.value;
        sfField.relatedObject = event.detail.relatedObject;
        sfField.datatype = event.detail.datatype;
      }
    }
  }

  handleRequriedFieldMappingChange(event) {
    let selectedValue = event.detail.value;
    let selectedIndex = event.target.dataset.value;
    for (let sfRField of this.requriedFieldOptions) {
      if (selectedIndex == sfRField.Id) {
        let selectedOption = event.target.options.find(
          (opt) => opt.value === selectedValue
        );
        console.log("Indexing ==>>", event.target.dataset.value);
        sfRField.apifieldLabel = selectedOption.label;
        sfRField.apifieldName = selectedOption.apiName;
        sfRField.apifieldValue = selectedValue;
        sfRField.apifieldDataType = selectedOption.dataType;
      }
    }
    console.log(
      "this.requriedFieldOption=653=>>",
      JSON.stringify(this.requriedFieldOptions)
    );
  }

  handleListDataFromChild(event) {
    console.log("enter in method handleListDataFromChild");
    this.nestedatalist = event.detail.value;
    console.log("nestedatalist", JSON.stringify(this.nestedatalist));
    console.log("checking");
    this.categorizedFields.push(...this.nestedatalist);
    console.log("categorizedFields@@", this.categorizedFields);
  }

  handleSaveButton() {
    console.log(
      "this.fieldOptions==657==>>",
      JSON.stringify(this.fieldOptions)
    );
    console.log("save Button");
    let mergedFieldOptions = [
      ...this.requriedFieldOptions,
      ...this.fieldOptions
    ];
    console.log("mergedFieldOptions", JSON.stringify(mergedFieldOptions));

    insertFieldMappings({
      objectFieldMappings: JSON.stringify(mergedFieldOptions),
      sObjectName: this.selectedObject,
      configRecordId: this.configRecordId,
      platformObject: this.platformObject,
      nestedName: this.nestedFieldTrack
    })
      .then((result) => {
        console.log("Field mappings inserted successfully:", result);
        this.tableData = result;
        if(this.tableData){
          this.dispatchFieldMappingEventHandle();
        }
        console.log("This data table result" + JSON.stringify(this.tableData));
      })
      .catch((error) => {
        console.error("Error inserting field mappings:", error);
      });
  }
  dispatchFieldMappingEventHandle(){
    this.dispatchEvent(new CustomEvent('fieldmappingevent',{
        detail: {
          tableData : this.tableData
        }
    }));
  }
}