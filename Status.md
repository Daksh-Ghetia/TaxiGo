## Ride Status are as shown

0 = Cancelled
1 = Pending
2 = No driver Found
3 = Assigning
4 = Accepted
5 = Arrived
6 = Started
7 = Completed

## Ride Payment status

0 = cash
1 = Card

## Driver status

0 = Free
1 = Has request
2 = Accepted Ride

## Ride, driver assign type

0 = pending
1 = Assign selected Driver
2 = Assign nearest Driver


## Twilio credentials
Phone number: +13614703337
Account SID: ACee4aff8103262da2f169b1155f93b9f6
Auth Token:  bc73fb368adf7927c02e0ae455be6305


## Mail credentials
ClientId:      552509408536-g966403bdh7v11t99knt6h1jahen263f.apps.googleusercontent.com
ClientSecret:  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


## Stripe credentials
publishable key             pk_test_51NBdBuEF3TbQVrFuugu1BAMWKX2oAVuoC5bpR0io2v4gVjcknbVI6zFqHCYhwDVuWSSxuTxrBldguWrZuVXns8oz00M1WV7P5h
Secret key                  sk_test_51NBdBuEF3TbQVrFuWAcyfZdHSriE4EfN9w1N0p0c83vMGC2ec2MyyvDYq7qX3vHktNCi6m0mTJynwLIz9j8R0mJs00vH5GcJys


succesful  4242424242424242
failed     4000000000009995
req auth   4000002500003155




## To make site https in local
https://mkcert.dev/

in angular.json add projects -> argon-dashboard-angular -> server -> options
"sslKey": "key.pem",
"sslCert": "cert.pem",
"ssl": true