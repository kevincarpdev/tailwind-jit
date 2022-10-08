/**
 * @NApiVersion 2.1
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

define(['N/https', 'N/search', 'N/record'], function (https, search, record) {

  var responseObj = {
    success: false,
    message: '',
  };

  function onRequest(context) {
    handleGetRequest(context);
  }

  function handleGetRequest(context) {
    log.debug("In GET function...");
    // var jsonResponse = new JSONResponse();
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
      var email = params["email"];
      log.debug({
        title: "Email",
        details: email
      })
      var companyphone = params["companyPhone"];
      log.debug({
        title: "Company Phone",
        details: companyphone
      })
      var salestaxid = params["salesTaxId"];
      log.debug({
        title: "Sales Tax ID",
        details: salestaxid
      })
      var street = params["streetAddress"];
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
          lead.setValue({
            fieldId: 'custentity_sales_tax_id',
            value: salestaxid
          });
          lead.setValue({
            fieldId: 'custentity_url',
            value: website
          });
          lead.setValue({
            fieldId: 'custentity_message',
            value: message
          });

          // set the addressbook sublist values
          // lead.selectNewLine({
          //   sublistId: 'addressbook'
          // });
          // lead.setValue({
          //   fieldId: 'addr1',
          //   value: street,
          // });
          // lead.setValue({
          //   fieldId: 'city',
          //   value: city,
          // });
          // lead.setValue({
          //   fieldId: 'state',
          //   value: state,
          // });
          // lead.setValue({
          //   fieldId: 'country',
          //   value: 'US',
          // })
          // lead.setValue({
          //   fieldId: 'zip',
          //   value: zip,
          // });
          // lead.commitLine({
          //   sublistId: 'addressbook'
          // });
          // set web address
          lead.setValue({
            fieldId: 'url',
            value: website
          });
          // run attachFile function and attach file to lead custom field
          //attachfile(lead, context);
          lead.setValue({
            fieldId: 'custentity_business_license',
            value: businessLicense,
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

  // function attachfile(recType, recId, recTypeTo, recIdTo) {
  //   record.attach({
  //     record: {
  //       type: recType,
  //       id: recId
  //     },
  //     to: {
  //       type: recTypeTo,
  //       id: recIdTo
  //     }
  //   });

  //   return true;
  // }

  return {
    onRequest: onRequest
  }

});