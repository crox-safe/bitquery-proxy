# How To Use Bitquery In A Secure Way In The Front End

# Table of Contents
1. [Introduction](#Introduction)
2. [Developing A Reverse Proxy](#developing-a-reverse-proxy)
3. [Deploying the Reverse Proxy For Production](#deploying-the-reverse-proxy-for-production)
4. [Adding more security!](#adding-more-security)
5. [Installation and usage](#installation-and-usage)
6. [References](#references)


## Introduction 

*If you just want to install and run the script you can go [here](#installation-and-usage)*

To begin this article we will start by learning what a POST request does.
In a nutshell, a POST request is used to send data to a page, this can be an image, text, audio, etc. In Bitquery this can be reflected when we get the data. We always make a POST request sending our query to get the data! 

So far so good, but in the headers of our request we send our API Key, an API Key? What is that? Our API Key is our secret key to access Bitquery services, it is the key that will make the difference between getting the data and not getting it.

As you know, Bitquery has a point system, each query is equivalent to certain points, but what does it have to do with API Key? Imagine that you filter your key through the internet, by doing that someone malicious can use your key to use YOUR Bitquery points, if you have a payment plan you will be losing money!

### Bad practices
It is very common to see Front End applications using Bitquery, but with the big problem that the requests are visible to everyone, this makes our API Key is exposed to all who visit that page, anyone with basic knowledge of developer can get it!

![visible-api](https://user-images.githubusercontent.com/82739614/185565044-84693816-7e46-40f0-88ab-e5d892b8d624.png)

### Solution:
A reverse proxy! A reverse proxy will help us not to expose our credentials in the Front End, allowing us to have everything more controlled.

![notvisible-key](https://user-images.githubusercontent.com/82739614/185559705-224770a9-61ef-4be8-8d87-e79cb212f58a.png)

### Advantages of a reverse proxy:

- You can control everything
- You can predefine certain queries
- You can add CORS so that requests can only be made from certain domains.

### Disadvantages of a reverse proxy:
- You need a backend to be able to host the endpoint.


# Developing A Reverse Proxy
Requirements:

- [node.js](https://nodejs.org/en/download/) 
- [Bitquery API Key](graphql.bitquery.io/)


The reverse proxy will be programmed in node.js, specifically with the following modules:

- [fastify](https://github.com/fastify/fastify) - It will serve us to mount our endpoint, it is one of the lightest and fastest modules at the moment.
- [@fastify/http-proxy](https://github.com/fastify/fastify-http-proxy) - To make our reverse proxy in a few lines of code.
- [axios](https://github.com/axios/axios) - To make our POST requests.
- [dotenv](https://github.com/motdotla/dotenv) - To get our environment variables.

> Before we start we will create a `server.js` file and then run `npm init` to create the project structure.

### Installing the packages
`npm i @fastify/http-proxy fastify axios dotenv --save`

### .env
Creating our .env file

`BITQUERY_API_KEY=YOUR-API-KEY`

There we will place our Bitquery API Key 

### server.js
Now we will create a single file called server.js (yes, just one) 

```js
const Fastify = require('fastify')

require('dotenv').config();

const server = Fastify()

server.register(require('@fastify/http-proxy'), {
  upstream: 'https://graphql.bitquery.io',
  prefix: '/bitquery',
  http2: false,
  undici: true,
	replyOptions: {
		rewriteRequestHeaders: (originalRequest, headers) => {
			return {
				...headers,
				'X-API-KEY': process.env.BITQUERY_API_KEY,
			};
		},
	},
});  

try {
	server.listen({port: process.env.PORT || 3000, host: '0.0.0.0'});
  
} catch (error) {
	server.log.error(error);
	process.exit(1);
}  
```
> Remember the path we have added, which is /bitquery

To run the program just run `node server.js`

With this we would have our reverse proxy ready, very easy, isn't it? 

Now we will test it locally, I will make a script that instead of using the endpoint `https://graphql.bitquery.io` will use `localhost:3000/bitquery`

This is the script:
```js
var axios = require('axios');

var data = JSON.stringify({
   "query": "query {\n  ethereum(network: ethereum){\n    transactions (date: {since: \"2022-08-15\"}){\n      date {date}\n        trades: count\n        senders: count(uniq:receivers)\n        recievers: count(uniq:senders)\n    }\n  }\n}",
   "variables": "{}"
});

var config = {
   method: 'post',
   url: 'http://localhost:8000/bitquery',
   headers: { 
      'Content-Type': 'application/json', 
   },
   data : data
};

axios(config)
.then(function (response) {
   console.log(JSON.stringify(response.data));
})
.catch(function (error) {
   console.log(error);
});
```
> This script was generated automatically thanks to the Bitquery IDE tool.

As we can see, the only thing I changed was the endpoint/url.


## Deploying the Reverse Proxy For Production

There are many paid and unpaid platforms that will allow you to host the script, if you want to test before going to production I would recommend using Heroku.

It is not recommended to use Heroku to host the script in production (at least not if you are in the free tier) because the nodes can go to sleep, anyway Heroku is easy to configure and monitor. To run the script I logged into bash and used `node server.js`. 
Here is my endpoint with heroku: https://bitquery-reverseproxy.herokuapp.com/bitquery/

Personally for production I would prefer something self-hosted, a vps or aws.


## Adding more security!

### CORS
With the example above we managed to hide the API Key so that the Front End user could not see it, however we can increase the security by adding for example `CORS`, you can see the following package:

- [@fastify/cors](https://github.com/fastify/fastify-cors)


### Custom Endpoints
Also what you can do to not expose the endpoint directly, would be to create custom queries where you do not allow the attacker to execute the queries that he wants.

Example: Create the `bitquery-reverse-proxy.com/last_block` endpoint.

If you create a specific route for that, you avoid having to execute the queries and you will only have to call the endpoint

### Rate Limit
Another way to add more security is to apply a rate limit, you can see the following module for it:

- [@fastify/rate-limit](https://github.com/fastify/fastify-rate-limit)

By adding a rate limit we can limit flood requests, which would prevent too many requests in a short period of time.

## Installation and usage

*If you followed the tutorial above, you do not need to do this.*

To install and run you must have `node` and `git` installed.

We will clone the repository

`git clone https://github.com/crox-safe/bitquery-proxy`

We will enter the folder

`cd bitquery-proxy`

Install the modules

`npm install`

Change the name from `.env_sample` to `.env`

`mv .env_sample .env # Unix based`

`move .env_sample .env # Windows`

Now we can run the script

`node server.js`


## References

If you need help, documentation or have an error, the following links will help you

*-- Bitquery Links --*

[Bitquery WebPage]()

[Bitquery Forum]()

[Bitquery Telegram Group]()

*-- Fastify Links --*

[Fastify WebPage](https://www.fastify.io/)

[Fastify Github](https://github.com/fastify/fastify)

[Fastify Twitter](https://twitter.com/fastifyjs)