// Very important that requests are ran synchronously in this benchmark, otherwise concurrent request limits may be hit.
// sync-request library was used to perform synchronous HTTP requests.
var request = require('sync-request');

// performance-now library was used to give nanosecond precision.
var now = require("performance-now");

// faker library was used to run
var faker = require('faker');
faker.locale = "en_GB";

// prompt library was used to accept user input during benchmark run.
var prompt = require('prompt');

// yargs library was used to get pre-run user input.
var argv = require('yargs').argv;

// array-to-csv library was used to write benchmark test results to file.
var toCSV = require('array-to-csv');

// fs library was used to access OS file system to save the results file.
var fs = require('fs');

// A valid user token to test user ordering.
var TEST_TOKEN = '9d25e2fd-fa09-4bea-ac4d-b609643747fa';

// Number of users to create as a test.
var TEST_USERS = 10000;

// Number of test orders to run concurrently as a test.
var TEST_ORDERS = 10000;

// API base URL.
var BASE_URL = 'http://localhost:3000/';

// A placeholder to hold the number of requests that are being ran.
var max = 0;

// A placeholder array to store benchmark results before writing to file,
// so that disk I/O does not impact benchmark time.
var timeLog = [];

// A function to log
function logTime(key, time) {
    var logObject = {};
    logObject['object'] = key;
    logObject['time'] = time;
    console.log(key + ' took ' + time);
    timeLog.push(logObject);

    if (timeLog.length == max) {
        // Limit hit, write out benchmarks currently held in memory to disk.
        console.log('Writing out time log.');

        // Placeolder array for CSV writing.
        var writeArray = [['index', 'object', 'time']];

        // Iterate in-memory benchmarks, adding them to the write array.
        timeLog.forEach(function(t,i) {
            var x = [i, t.object, t.time];
            writeArray.push(x);

        });


        var csvString = toCSV(writeArray);

        fs.writeFile("sprintrlog.csv", csvString, function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    }

}

// Generate test orders
function testUserCreation() {
    max = TEST_USERS;
    var testUsers = [];

    for (var i = 0; i < TEST_USERS; i++) {
        testUsers.push(i);

    }

    testUsers.forEach(function(u, i){
        // Generate fake user info...
        var userEmail = faker.internet.email();
        var userFirstName = faker.name.firstName();
        var userLastName = faker.name.lastName();

        console.log('Request ' + i);

        var start = now();

        var res = request('POST', BASE_URL + 'users/create', {
            json: { email: userEmail,
                password: 'test',
                firstName: userFirstName,
                lastName: userLastName }
            });
            var end = now();
            var delta = (start-end) * -1;
            logTime(userEmail, delta);

        });

        prompt.start();

    }

function testOrderCreation() {
    max = TEST_ORDERS;
    var testOrders = [];

    for (var i = 0; i < TEST_ORDERS; i++) {
        testOrders.push(i);

    }

    testOrders.forEach(function(o,i ){
        // Generate fake delivery info...
        var randomCompanyName = faker.company.companyName();
        var randomOrder = faker.commerce.productName();

        var randomAddress1Street = faker.address.streetAddress();
        var randomAddress1County = faker.address.county();
        var randomAddress1Postcode = faker.address.zipCode();
        var randomAddress1Country = faker.address.country();
        var randomAddress1Latitude = Number(faker.address.latitude());
        var randomAddress1Longitude = Number(faker.address.longitude());

        var randomAddress2Street = faker.address.streetAddress();
        var randomAddress2County = faker.address.county();
        var randomAddress2Postcode = faker.address.zipCode();
        var randomAddress2Country = faker.address.country();


        console.log('Request ' + i);


        var start = now();

        var res = request('POST', BASE_URL + 'orders/create', {
            json: { placeId: '1a2b3c4e5f6f7f8f',
            placeName: randomCompanyName,
            orderDescription: randomOrder,
            deliveryLatitude: randomAddress1Latitude,
            deliveryLongitude: randomAddress1Latitude,
            pickupAddress:
            { street: randomAddress1Street,
                county: randomAddress1County,
                postcode: randomAddress1Postcode,
                country: randomAddress1Country },
                deliveryAddress:
                { street: randomAddress2Street,
                    county: randomAddress2County,
                    postcode: randomAddress2Postcode,
                    country: randomAddress2Country } },
                    'headers': {
                        'Authorization': TEST_TOKEN
                    }
                });

                var end = now();
                var delta = (start-end) * -1;
                logTime(randomCompanyName, delta);


            });

            prompt.start();

}

// Main prompt loop
function main() {
    if (argv.users) {
        testUserCreation();
    }

    if (argv.orders) {
        testOrderCreation();
    }

}

prompt.get(['rerun'], function (err, result) {
    // Log the results.
    if (result.rerun) {
        // Re-run
        main();

    }


});

// Run main loop.
main();
