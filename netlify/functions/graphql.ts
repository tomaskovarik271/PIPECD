import type { Handler, HandlerContext, HandlerEvent } from '@netlify/functions';

console.log("<<<<< MINIMAL GRAPHQL.TS MODULE LOADED >>>>>");

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("<<<<< MINIMAL GRAPHQL HANDLER INVOKED >>>>>");
  console.log("Minimal GraphQL Event:", JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Minimal GraphQL function responding!" }),
    headers: { "Content-Type": "application/json" }
  };
}; 