/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType Suitelet
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       Aug 28th, 2022   Kevin Carpenter, Fourth Wave Consulting
 *
 *  Name of Script	hande_dealer_reg.js
 *
 * Date			08/28/22
 *
 * Version		1.0
 *
 * Type			Suitelet
 *
 *
 *
 * Description:	This Suitelet will run on the 'onRequest' function and return a customer if it exists.

 * NetSuite Ver.	2017.2 or later
 *
 * Script record: https://3888896.app.netsuite.com/app/common/scripting/script.nl?id=160
 * Deployment (on-demand): https://3888896.app.netsuite.com/app/common/scripting/scriptrecord.nl?id=295&whence=
 * Primary function: onRequest, handleGetRequest, handlePostRequest
 *
 *
 * License 		THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 *			EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 *			MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
 *			THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 *			SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 *			OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 *			HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 *			TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *			SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * 

 */

define(['N/https', 'N/search', 'N/record', 'N/file'], function (https, search, record, file) {

  var responseObj = {
    success: false,
    message: '',
  };

  function onRequest(context) {
    if (context.request.method === 'GET') {
      // Our Suitelet design code is in here
      handleGetRequest(context);
    } else if (context.request.method === 'POST') {
      log.debug("Suitelet is posting.");
      handlePostRequest(context);
    }
   
  }
  function handlePostRequest(context) {
    log.debug("In POST function...");
    // Wrap our parameter in a try/catch block to catch any errors or blank parameter

    try {
      var body = context.request;
      log.debug({
        title: "Context Request",
        details: body
      });

      // Get the parameters from the context request body
      var param = body.parameters;
      log.debug({
        title: "Param",
        details: param
      });

      // Get First Name
      var firstName = param.firstName;
      // Get Last Name
      var lastName = param.lastName;
      var fullName = firstName + " " + lastName;
      // Get Company
      var company = param.company;
      // Get Title
      var title = param.title;
      // Get Phone
      var phone = param.phone;
      // Get Email
      var email = param.email;
      // Get Company Phone
      var companyPhone = param.companyPhone;
      // Get Sales Tax Id
      var salesTaxId = param.salesTaxId;
      // Get Street
      var street = param.street;
      // Get City
      var city = param.city;
      // Get State
      var state = param.state;
      // Get Zip
      var zip = param.zip;
      // Get company website
      var companyWebsite = param.companyWebsite;
      // Get Message
      var message = param.message;
      // Get businessLicense from files
      var businessLicense = body.files.businessLicense;

      // Wrap our main search in a try/catch block to prevent errors from breaking the script
      try {

        // Run Customer Function 
        let isFound = searchCustomer(email);
        if (isFound) {
          responseObj.success = false;
          responseObj.message = "Error: That email already exists. Please sign up using a different email address.";

          log.audit({
            title: 'Error: Customer Lead already exists.',
            details: JSON.stringify(responseObj)
          });

          // Write error message to the response
          context.response.write(JSON.stringify(responseObj));
          context.response.setHeader("Access-Control-Allow-Origin", "*");
          context.response.setHeader("Content-Type", "application/json");

        }
        else {
          // Existing customer not found, proceeding with creating a new lead
          // Proceed with creating a new lead as normal

          // Create a new lead
          var lead = record.create({
            type: record.Type.LEAD,
            isDynamic: true
          });
          // Set the lead values on the record
          lead.setValue({
            fieldId: 'firstname',
            value: firstName
          });
          lead.setValue({
            fieldId: 'lastname',
            value: lastName
          });

          lead.setValue({
            fieldId: 'companyname',
            value: company
          });
          lead.setValue({
            fieldId: 'title',
            value: title
          });
          lead.setValue({
            fieldId: 'phone',
            value: phone
          });
          lead.setValue({
            fieldId: 'email',
            value: email
          });
          lead.setValue({
            fieldId: 'altphone',
            value: companyPhone
          });
          lead.setValue({
            fieldId: 'custentity_sales_tax_id',
            value: salesTaxId
          });
          lead.setValue({
            fieldId: 'url',
            value: companyWebsite
          });
          lead.setValue({
            fieldId: 'custentity_message',
            value: message
          });
          var currentAddressCount = lead.getLineCount({
            'sublistId': 'addressbook'
          });

          if (currentAddressCount === 0) {
            lead.selectNewLine({
              sublistId: 'addressbook'
            });
          } else {
            lead.selectLine({
              sublistId: 'addressbook',
              line: 0
            });
          }
          var addressSubrecord = lead.getCurrentSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress'
          });

          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'defaultshipping', value: true, ignoreFieldChange: true });
          // Set cyrrentSublistValue for addressee
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'addressee', value: firstName + " " + lastName, ignoreFieldChange: true });
          // Set CurrentSublistValue for street
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'addr1', value: street, ignoreFieldChange: true });
          // Set CurrentSublistValue for city
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'city', value: city, ignoreFieldChange: true });
          // Set CurrentSublistValue for state
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'state', value: state, ignoreFieldChange: true });
          // Set CurrentSublistValue for zip
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'zip', value: zip, ignoreFieldChange: true });
          // Set CurrentSublistValue for country
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'country', value: 'US', ignoreFieldChange: true });
          // Commit the line
          lead.commitLine({ sublistId: 'addressbook' });


          // Use suitescript 2 to upload the business license file
          // https://stackoverflow.com/questions/46954507/in-netsuite-with-suitescript-2-0-unable-to-send-a-file-with-http-post-request-wi
          // Business Licenses folder id 54320

          // log outputs the file name
          log.debug({
            title: 'Business License',
            details: businessLicense
          });
          var fileType = businessLicense.fileType;
          var type = '';
          var ext = '';
          if ((fileType == 'plain') || (fileType == 'PLAIN')) {
            type = 'PLAINTEXT';
            ext = 'txt';
          }
          if ((fileType == 'pdf') || (fileType == 'PDF')) {
            type = 'PDF';
            ext = 'pdf';
          }
          if ((fileType == 'png') || (fileType == 'PNG')) {
            type = 'PNGIMAGE';
            ext = 'png';
          }
          if ((fileType == 'jpeg') || (fileType == 'JPEG')) {
            type = 'JPGIMAGE';
            ext = 'jpeg';
          }
          if ((fileType == 'jpg') || (fileType == 'JPG')) {
            type = 'JPGIMAGE';
            ext = 'jpg';
          }

          var fileRequest = {
            name: fullName + ext,
            fileType: file.Type.PNGIMAGE,
            contents: businessLicense.imgdata,
            description: fullName + ' Business License',
            encoding: file.Encoding.UTF8,
            folder: 54320,
            isOnline: true
          };

          try {
            var resultingFile = file.create(fileRequest);
            // Upload to Dropbox or some other external source
            // try {
            //   var _url = DROPBOX_URL_V2 + _UPLOAD_150_MB_FILE
            //   var _headers = {
            //     'Content-Type': 'application/octet-stream',
            //     'Authorization': 'Bearer ' + ACCESS_TOKEN,
            //     'Dropbox-API-Arg': JSON.stringify({ 'path': path_to_upload + '/' + filename })
            //   }
            //   var responseDB = https.post({
            //     url: _url,
            //     headers: _headers,
            //     body: file.load({ id: fileid })
            //   });
            //   if (responseDB.code != 200)
            //     log.audit({ title: 'Request Failed', details: responseDB })
            //   if (responseDB.code == 200)
            //     log.audit({ title: 'Request Succeed', details: responseDB })
            // } catch (error) {
            //   log.error('fileid : ' + fileid, error)
            // }
          }
          catch (ex) {
            log.error({ title: 'Unable to create file.', details: ex });
            responseObj.success = false;
            responseObj.message = "Error: That email already exists. Please sign up using a different email address.";
            responseObj.message = ex
            context.response.write(JSON.stringify(responseObj));
            context.response.setHeader("Access-Control-Allow-Origin", "*");
            context.response.setHeader("Content-Type", "application/json");
          }

          var fileId = resultingFile.save();

          // log outputs the file id
          log.debug({
            title: 'File ID',
            details: fileId
          });

          lead.setValue({
            fieldId: 'custentity_business_license',
            value: fileId
          });

          // Save the lead record
          var leadId = lead.save();

          // log success the lead id and return success message
          log.debug("Lead ID: " + leadId);

          // Write success message to response
          responseObj.success = true;
          responseObj.message = "Success: Lead created successfully.";
          context.response.write(JSON.stringify(responseObj));
          context.response.setHeader("Access-Control-Allow-Origin", "*");
          context.response.setHeader("Content-Type", "application/json");
        }

      } catch (error) {
        log.error({ title: 'Unable to run existing customer lead search.', details: error });
        responseObj.message = error
        context.response.write(JSON.stringify(responseObj));
        context.response.setHeader("Access-Control-Allow-Origin", "*");
        context.response.setHeader("Content-Type", "application/json");
      }
     



    } catch (error) {
      log.error({ title: "Unable to grab customer lead script parameters:.", details: error });
      responseObj.message = error
      context.response.write(JSON.stringify(responseObj));
      context.response.setHeader("Access-Control-Allow-Origin", "*");
      context.response.setHeader("Content-Type", "application/json");
    }

  }// end of handlePostRequest function

  function handleGetRequest(context) {
    log.debug("In GET function...");
    // Wrap our parameter in a try/catch block to catch any errors or blank parameter
    
    try {
      var params = context.request.parameters;

      // Grab the Parameters from the POST request
      var firstname = params["firstname"];
      log.debug({
        title: "First Name",
        details: firstname
      })
      var lastname = params["lastname"];
      log.debug({
        title: "Last Name",
        details: lastname
      })

      // full name
      var fullName = firstname + " " + lastname;

      var companyname = params["company"];
      log.debug({
        title: "Company Name",
        details: companyname
      })
      var jobtitle = params["title"];
      log.debug({
        title: "Job Title",
        details: jobtitle
      })
      var phone = params["phone"];
      log.debug({
        title: "Phone",
        details: phone
      })
      var companyphone = params["companyPhone"];
      log.debug({
        title: "Company Phone",
        details: companyphone
      })
      var email = params["email"];
      log.debug({
        title: "Email",
        details: email
      }) 
      var salestaxid = params["salesTaxId"];
      log.debug({
        title: "Sales Tax ID",
        details: salestaxid
      })
      var street = params["street"];
      log.debug({
        title: "Street Address",
        details: street
      })
      var city = params["city"];
      log.debug({
        title: "City",
        details: city
      })
      var state = params["state"];
      log.debug({
        title: "State",
        details: state
      })
      var zip = params["zip"];
      log.debug({
        title: "Zip",
        details: zip
      })
      var website = params["companyWebsite"];
      log.debug({
        title: "Company Website",
        details: website
      })
      var message = params["message"];
      log.debug({
        title: "Message",
        details: message
      })
      var businessLicense = params["businessLicense"];
      
      log.debug({
        title: "Business License",
        details: businessLicense
      });

      // Wrap our main search in a try/catch block to prevent errors from breaking the script
      try {

        // Run Customer Function 
        let isFound = searchCustomer(email);
        if (isFound) {
          responseObj.success = false;
          responseObj.message = "Error: That email already exists. Please sign up using a different email address.";

          log.audit({
            title: 'Error: Customer Lead already exists.',
            details: JSON.stringify(responseObj)
          });

          // Write error message to the response
          context.response.write(JSON.stringify(responseObj));
          context.response.setHeader("Access-Control-Allow-Origin", "*");
          context.response.setHeader("Content-Type", "application/json");
          
        }
        else {
          // Existing customer not found, proceeding with creating a new lead
          // Proceed with creating a new lead as normal

          // Create a new lead
          var lead = record.create({
            type: record.Type.LEAD,
            isDynamic: true
          });
          // Set the lead values on the record
          lead.setValue({
            fieldId: 'firstname',
            value: firstname
          });
          lead.setValue({
            fieldId: 'lastname',
            value: lastname
          });
          
          lead.setValue({
            fieldId: 'companyname',
            value: companyname
          });
          lead.setValue({
            fieldId: 'title',
            value: jobtitle
          });
          lead.setValue({
            fieldId: 'phone',
            value: phone
          });
          lead.setValue({
            fieldId: 'email',
            value: email
          });
          lead.setValue({
            fieldId: 'altphone',
            value: companyphone
          });
          // Set Sales Tax ID Field
          lead.setValue({
            fieldId: 'custentity_sales_tax_id',
            value: salestaxid
          });
          // set web address
          lead.setValue({
            fieldId: 'url',
            value: website
          });
          // set message
          lead.setValue({
            fieldId: 'custentity_message',
            value: message
          });
          // set business license
          var currentAddressCount = lead.getLineCount({
            'sublistId': 'addressbook'
          });

          if (currentAddressCount === 0) {
            lead.selectNewLine({
              sublistId: 'addressbook'
            });
          } else {
            lead.selectLine({
              sublistId: 'addressbook',
              line: 0
            });
          }
          var addressSubrecord = lead.getCurrentSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress'
          });

          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'defaultshipping', value: true, ignoreFieldChange: true });
          // Set cyrrentSublistValue for addressee
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'addressee', value: firstname + " " + lastname, ignoreFieldChange: true });
          // Set CurrentSublistValue for street
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'addr1', value: street, ignoreFieldChange: true });
          // Set CurrentSublistValue for city
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'city', value: city, ignoreFieldChange: true });
          // Set CurrentSublistValue for state
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'state', value: state, ignoreFieldChange: true });
          // Set CurrentSublistValue for zip
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'zip', value: zip, ignoreFieldChange: true });
          // Set CurrentSublistValue for country
          addressSubrecord.setValue({ sublistId: 'addressbook', fieldId: 'country', value: 'US', ignoreFieldChange: true });
          // Commit the line
          lead.commitLine({ sublistId: 'addressbook' });

          
          // Use suitescript 2 to upload the business license file
          // https://stackoverflow.com/questions/46954507/in-netsuite-with-suitescript-2-0-unable-to-send-a-file-with-http-post-request-wi
          // Business Licenses folder id 54320

          var businessLicenseFile = params['businessLicense'];

          // log outputs the file name
          log.debug({
            title: 'File Name',
            details: businessLicenseFile
          });
          var fileType = businessLicenseFile.type;
          var type = '';
          var ext = '';
          if ((fileType == 'plain') || (fileType == 'PLAIN')) {
            type = 'PLAINTEXT';
            ext = 'txt';
          }
          if ((fileType == 'pdf') || (fileType == 'PDF')) {
            type = 'PDF';
            ext = 'pdf';
          }
          if ((fileType == 'png') || (fileType == 'PNG')) {
            type = 'PNGIMAGE';
            ext = 'png';
          }
          if ((fileType == 'jpeg') || (fileType == 'JPEG')) {
            type = 'JPGIMAGE';
            ext = 'jpeg';
          }
          if ((fileType == 'jpg') || (fileType == 'JPG')) {
            type = 'JPGIMAGE';
            ext = 'jpg';
          }
          
          var fileRequest = {
            name: fullName + ext,
            fileType: file.Type.PNGIMAGE,
            contents: businessLicenseFile.imgdata,
            description: fullName + ' Business License',
            encoding: file.Encoding.UTF8,
            folder: 54320,
            isOnline: true
          };

          try {
            var resultingFile = file.create(fileRequest);
            // Upload to Dropbox or some other external source
            // try {
            //   var _url = DROPBOX_URL_V2 + _UPLOAD_150_MB_FILE
            //   var _headers = {
            //     'Content-Type': 'application/octet-stream',
            //     'Authorization': 'Bearer ' + ACCESS_TOKEN,
            //     'Dropbox-API-Arg': JSON.stringify({ 'path': path_to_upload + '/' + filename })
            //   }
            //   var responseDB = https.post({
            //     url: _url,
            //     headers: _headers,
            //     body: file.load({ id: fileid })
            //   });
            //   if (responseDB.code != 200)
            //     log.audit({ title: 'Request Failed', details: responseDB })
            //   if (responseDB.code == 200)
            //     log.audit({ title: 'Request Succeed', details: responseDB })
            // } catch (error) {
            //   log.error('fileid : ' + fileid, error)
            // }
          }
          catch (ex) {
            log.error({ title: 'Unable to create file.', details: ex });
            responseObj.success = false;
            responseObj.message = "Error: That email already exists. Please sign up using a different email address.";
            responseObj.message = ex
            context.response.write(JSON.stringify(responseObj));
            context.response.setHeader("Access-Control-Allow-Origin", "*");
            context.response.setHeader("Content-Type", "application/json");
          }

          var fileId = resultingFile.save();

          // log outputs the file id
          log.debug({
            title: 'File ID',
            details: fileId
          });

          lead.setValue({
            fieldId: 'custentity_business_license',
            value: fileId
          });
          
          // Save the lead record
          var leadId = lead.save();

          // log success the lead id and return success message
          log.debug("Lead ID: " + leadId);

          // Write success message to response
          responseObj.success = true;
          responseObj.message = "Success: Lead created successfully.";
          context.response.write(JSON.stringify(responseObj));
          context.response.setHeader("Access-Control-Allow-Origin", "*");
          context.response.setHeader("Content-Type", "application/json");
        }

      } catch (error) {
        log.error({ title: 'Unable to run existing customer lead search.', details: error });
        responseObj.message = error
        context.response.write(JSON.stringify(responseObj));
        context.response.setHeader("Access-Control-Allow-Origin", "*");
        context.response.setHeader("Content-Type", "application/json");
      }

    } catch (error) {
      log.error({ title: "Unable to grab customer lead script parameters: \'email\'.", details: error });
      responseObj.message = error
      context.response.write(JSON.stringify(responseObj));
      context.response.setHeader("Access-Control-Allow-Origin", "*");
      context.response.setHeader("Content-Type", "application/json");
    }

  }// end of handleGetRequest function


  function searchCustomer(customerEmail) {
    var customer = customerEmail;

    // Create the customer search to find if the customer exists already
    var customerSearchObj = search.create({
      type: "customer",
      filters:
        [
          search.createFilter({
            name: 'email',
            operator: search.Operator.CONTAINS,
            values: customer
          }),
        ],
      columns:
        [
          search.createColumn({
            name: "entityid",
            sort: search.Sort.ASC
          }),
          "email"
        ]
    });

    var searchResultCount = customerSearchObj.runPaged().count;

    if (searchResultCount > 0) {

      log.debug({ title: "Existing customer found for email:", details: customer });
      return true;

    }
    else {
      log.debug({ title: "No existing customer found for email: ", details: customer });
      return false

    }

  }// End of searchCustomer function

  return {
    onRequest: onRequest
  }

});