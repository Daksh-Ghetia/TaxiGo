const Setting = require('../models/setting');
let stripe;

async function getSettingData() {
  let {stripeSecretKey} = await Setting.findOne();
  stripe = require("stripe")(stripeSecretKey);
}
getSettingData();

async function createCustomer(user) {
    try {
        const customer = await stripe.customers.create({
            name: user.userName,
            email: user.userEmail
        });
        return customer.id;
    } catch (error) {
      throw new Error(error.raw.message || "Error in payment gateway while creating customer");
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
      throw new Error(error.raw.message || "Error in payment gateway while creating intent");
    }    
}

async function getCustomerDetails(customerId) {
    try {
        const customer = await stripe.customers.retrieve(customerId);
        return customer;
    } catch (error) {
      throw new Error(error.raw.message || "Error in payment gateway while creating customer.");
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
    throw new Error(error.raw.message || "Error in payment gateway while setting default card")
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
      throw new Error(error.raw.message || "Error in payment gateway while getting card list");
    }
}

async function deleteCard(cardId) {
  try {
    const deletedCard = await stripe.paymentMethods.detach(cardId);
    return deleteCard;
  } catch (error) {
    throw new Error(error.raw.message || "Error in payment gateway while deleting card")
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
    throw new Error(error.raw.message || "Error in payment gateway while deduction payment");
  }
}

module.exports = {
    createCustomer: createCustomer,
    createIntent: createIntent,
    getCustomerDetails: getCustomerDetails,
    setDefaultCard: setDefaultCard,
    getCardsList: getCardsList,
    deleteCard: deleteCard,
    deductPayment: deductPayment,
    getSettingData: getSettingData
}
