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

