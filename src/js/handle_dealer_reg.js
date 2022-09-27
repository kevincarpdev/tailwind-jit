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

  var CAPTCHA_VERIFICATION_URL = 'https://www.google.com/recaptcha/api/siteverify'; //This is the verification URL
  var CAPTCHA_PRIVATE_KEY = '6LdfCTMiAAAAAEfUqHbURg2c4LtXYY4L8SVIJz2J'; //This is the private key we've obtained from Part 1 of this tutorial

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
    log.debug("In POST function...");
    // var jsonResponse = new JSONResponse();
    // Wrap our parameter in a try/catch block to catch any errors or blank parameter
    try {
      var params = context.request.parameters;

      // Grab the customer email from the POST request
      var customer = params["customer_email"];
      log.debug("Customer Params: " + JSON.stringify(customer));

      //var clientIpAddress = request.getHeader('NS-Client-IP'); //Use this to get the IP Address of the client

      //var captchaResponse = JSON.parse(request.body);
      //captchaResponse = captchaResponse.token
      //nlapiLogExecution('DEBUG', 'Captcha Token: ', captchaResponse);

      // var postData = {
      //   secret: CAPTCHA_PRIVATE_KEY,
      //   response: captchaResponse,
      //   remoteip: clientIpAddress,
      // };
      //var captchaVerificationResponse = nlapiRequestURL(CAPTCHA_VERIFICATION_URL, postData); //Send the POST Request to Google for verification.

      /* 
      * Test the response. If the server does not respond with an HTTP 200 Status code, then it was not verified.
      * Google also returns true when the challenge and the user's response matches.
      */
      // if (captchaVerificationResponse.getCode() != 200 || captchaVerificationResponse.getBody().indexOf('true') == -1) {
      //   jsonResponse.status.success = false;
      //   jsonResponse.status.errorMessage = 'Failed Verification';
      // }

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
        context.response.write("False");
      }

    } catch (error) {
      log.error({ title: "Unable to grab customer script parameters: \'customer_email\'.", details: error });
      context.response.write("False");
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
          // ["email", "contains", "support@fourthwc.com"]
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

  function attachfile(recType, recId, recTypeTo, recIdTo) {
    record.attach({
      record: {
        type: recType,
        id: recId
      },
      to: {
        type: recTypeTo,
        id: recIdTo
      }
    });

    return true;
  }
  // function JSONResponse() {
  //   this.status = {
  //     success: true,
  //     errorMessage: '',
  //   };
  // }


  return {
    onRequest: onRequest
  }

});