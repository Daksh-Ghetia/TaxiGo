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

async function getCustomerDetails(customerId) {
    try {
        const customer = await stripe.customers.retrieve(customerId);        
        return customer;
    } catch (error) {
        console.log(error);
    }
}

async function setDefaultCard(customerId, defaultPaymentCardId) {
  try {
    const customer = await stripe.customers.update(
      customerId, 
      {
        invoice_settings: {
          default_payment_method : defaultPaymentCardId,
        }
      }
    );

    return customer;
  } catch (error) {
    console.log(error);
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
        console.log(error);
    }
}

async function deleteCard(cardId) {
  try {
    const deletedCard = await stripe.paymentMethods.detach(cardId);
    return deleteCard;
  } catch (error) {
    console.log(error);
  }
}

async function deductPayment(customerId, paymentCardId, amountToDeduct) {
  try {
    payment_intent = await stripe.paymentIntents.create({
      amount: amountToDeduct*100,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentCardId,
      confirm: true
    })

    if (payment_intent.status == 'succeeded') {
      console.log('Payment processed successfully.');
    }
    else {
      console.log('Payment failed.');
    }
  } catch (error) {
    console.log("error occured while paying", error);
  }
}

module.exports = {
    createCustomer: createCustomer,
    createIntent: createIntent,
    getCustomerDetails: getCustomerDetails,
    setDefaultCard: setDefaultCard,
    getCardsList: getCardsList,
    deleteCard: deleteCard,
    deductPayment: deductPayment
}
