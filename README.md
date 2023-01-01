# latest-deals

Having been inspired by the modelling of the "Latest Deals" application in the DynamoDB book, I decided to attempt a backend serverless implementation of this application.

This started by sketching out the ERD - docs/ERD.png

Then listing out the access patterns and writing out the entity chart - docs/Latest-deals.pdf

After modelling this on the NoSQL workbench, I exported the cloudformation template and converted it to YAML - src/db/template.yaml . This made it easy to create a table with all of the indexes I needed.

Since a method of learning a new API is through repetition, I decided to create plenty of lambda functions which would be invoked by certain paths and methods in API Gateway.

This gave me plenty of practice with the DynamoDB API, API Gateway, Lambda and SAM.

At it's core, this is a very simple: API Gateway -> Lambda -> DynamoDB . However, I didn't want to model a simple DynamoDB table that stored a simple key value pair. I wanted real complexity to demonstrate how one can create one to many and many to many relations in DynamoDB. Overall, it was very fun to model this out and at times, felt like a computer game.
