const stripe = require("stripe")("sk_test_51NBdBuEF3TbQVrFuWAcyfZdHSriE4EfN9w1N0p0c83vMGC2ec2MyyvDYq7qX3vHktNCi6m0mTJynwLIz9j8R0mJs00vH5GcJys");

async function createCustomer(user) {
    try {
        const customer = await stripe.customers.create({
            name: user.userName,
            email: user.userEmail
        });
        return customer.id;
    } catch (error) {
        console.log("Error while creating customer in payment gateway ", error);
    }    
}

async function createIntent(userPaymentCustomerId) {
    try {
        const intent = await stripe.setupIntents.create({
            customer: userPaymentCustomerId,
            automatic_payment_methods: {enabled: true},
        });
        return intent.client_secret;
    } catch (error) {
        console.log("Error while creating intent in payment gateway ", error);
    }    
}

async function getCardsList(customerId) {
    try {
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });
        return paymentMethods.data;
    } catch (error) {
        
    }
}

module.exports = {
    createCustomer: createCustomer,
    createIntent: createIntent,
    getCardsList: getCardsList,
}

/*
{
    "object": "list",
    "data": [
      {
        "id": "pm_1NGe6WEF3TbQVrFuJCm0Ycnp",
        "object": "payment_method",
        "billing_details": {
          "address": {
            "city": null,
            "country": "IN",
            "line1": null,
            "line2": null,
            "postal_code": null,
            "state": null
          },
          "email": null,
          "name": null,
          "phone": null
        },
        "card": {
          "brand": "visa",
          "checks": {
            "address_line1_check": null,
            "address_postal_code_check": null,
            "cvc_check": "pass"
          },
          "country": "US",
          "exp_month": 4,
          "exp_year": 2024,
          "fingerprint": "6n3MA6zWUcxveoqJ",
          "funding": "credit",
          "generated_from": null,
          "last4": "4242",
          "networks": {
            "available": [
              "visa"
            ],
            "preferred": null
          },
          "three_d_secure_usage": {
            "supported": true
          },
          "wallet": null
        },
        "created": 1686212521,
        "customer": "cus_O2jDtRQFO02vYh",
        "livemode": false,
        "metadata": {},
        "type": "card"
      }
    ],
    "has_more": false,
    "url": "/v1/payment_methods"
  }
*/