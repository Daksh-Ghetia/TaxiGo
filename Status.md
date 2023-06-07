## Ride Status are as shown

0 = Cancelled
1 = Pending
2 = No driver Found
3 = Assigning
4 = Accepted
5 = Arrived
6 = Started
7 = Completed

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


publishable key             pk_test_51NBczjSGn5pa8TVPBB0vQzrD9IpK7pq7WojrB8Tho1vLboN7RGeYdNgejcuJrsLzdP6NsvZ5PDhTzjzwT7I7lXM400soCiyNNd
Secret key                  sk_test_51NBczjSGn5pa8TVP59IJ7wibRFklV0SghBDZ4TuapBdWjBSvHKe9Lt5YWNJMldpMWZmqZt9ZIboSeF1SFJMIEQTd00KtW68gKD


succesful  4242424242424242
failed     4000000000009995
req auth   4000002500003155




## To make site https in local
https://mkcert.dev/

in angular.json add projects -> argon-dashboard-angular -> server -> options
"sslKey": "key.pem",
"sslCert": "cert.pem",
"ssl": true