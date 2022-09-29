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

define(['N/https', 'N/search'], function (https, search) {

  var responseObj = {
    success: false,
    message: '',
  };

  function onRequest(context) {
    if (context.request.method === https.Method.GET)
      handleGetRequest(context);
    else if (context.request.method === https.Method.POST)
      handlePostRequest(context);
  }

  function handleGetRequest(context) {
    log.debug("In GET function...");

    // Wrap our parameter in a try/catch block to catch any errors or blank parameter
    try {
      var params = context.request.parameters;
      // Grab the customer email from the POST request
      var customer = params["customer_email"];
      log.debug("Customer Params" + JSON.stringify(customer));

      // Wrap our main search in a try/catch block to prevent errors from breaking the script
      try {

        // Run Customer Function 
        let isFound = searchCustomer(customer);
        if (isFound) {
          context.response.write("True");
        }
        else {
          context.response.write("False");
        }


      } catch (error) {
        log.error({ title: 'Unable to run customer search.', details: error });
      }

    } catch (error) {
      log.error({ title: "Unable to grab customer script parameters: \'customer_email\'.", details: error });
    }

  }// end of handleGetRequest function

  function handlePostRequest(context) {
    log.debug("In handle POST function...");
    // var jsonResponse = new JSONResponse();
    // Wrap our parameter in a try/catch block to catch any errors or blank parameter
    try {
      var params = context.request.parameters;

      // Grab the Parameters from the POST request
      var firstname = params["fname"];
      log.debug("First Name: " + JSON.stringify(firstname));
      var lastname = params["lname"];
      log.debug("Last Name: " + JSON.stringify(lastname));
      var companyname = params["cname"];
      log.debug("Company Name: " + JSON.stringify(companyname));
      var jobtitle = params["jobtitle"];
      log.debug("Job Title: " + JSON.stringify(jobtitle));
      var phone = params["phone"];
      log.debug("Phone: " + JSON.stringify(phone));
      var email = params["email"];
      log.debug("Email: " + JSON.stringify(email));
      var companyphone = params["cphone"];
      log.debug("Company Phone: " + JSON.stringify(companyphone));
      var salestaxid = params["staxid"];
      log.debug("Sales Tax ID: " + JSON.stringify(salestaxid));
      var street = params["street"];
      log.debug("Street: " + JSON.stringify(street));
      var city = params["city"];
      log.debug("City: " + JSON.stringify(city));
      var state = params["state"];
      log.debug("State: " + JSON.stringify(state));
      var zip = params["zip"];
      log.debug("Zip: " + JSON.stringify(zip));
      var website = params["website"];
      log.debug("Website: " + JSON.stringify(website));
      var message = params["message"];
      log.debug("Message: " + JSON.stringify(message));


      // Wrap our main search in a try/catch block to prevent errors from breaking the script
      try {

        // Run Customer Function 
        let isFound = searchCustomer(email);
        if (isFound) {
          
          responseObj.message = "Error: Customer Lead already exists.";

          log.audit({
            title: 'Error: Customer Lead already exists.',
            details: JSON.stringify(responseObj)
          });
          
          // Write error message to the response
          context.response.write(JSON.stringify(responseObj));
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
            fieldId: 'custentity_company_phone',
            value: companyphone
          });
          lead.setValue({
            fieldId: 'custentity_sales_tax_id',
            value: salestaxid
          });
          lead.setValue({
            fieldId: 'custentity_website',
            value: website
          });
          lead.setValue({
            fieldId: 'comments',
            value: message
          });
          lead.setValue({
            fieldId: 'custentity_lead_source',
            value: 1
          });

          // run attachFile function and attach file to lead custom field
          //attachfile(lead, context);

          // Save the lead record
          var leadId = lead.save();

          // log success the lead id and return success message
          log.debug("Lead ID: " + leadId);

          // Write success message to response
          responseObj.success = true;
          responseObj.message = "Success: Lead created successfully.";
          context.response.write(JSON.stringify(responseObj));
        }

      } catch (error) {
        log.error({ title: 'Unable to run existing customer lead search.', details: error });
        responseObj.message = error
        context.response.write(JSON.stringify(responseObj));
      }

    } catch (error) {
      log.error({ title: "Unable to grab customer lead script parameters: \'email\'.", details: error });
      responseObj.message = error
      context.response.write(JSON.stringify(responseObj));
    }

  }// End of handlePostRequest function

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
    log.debug({ title: "customerSearchObj result count", details: searchResultCount });

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