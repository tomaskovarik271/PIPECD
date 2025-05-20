import type { Handler, HandlerContext, HandlerEvent } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("<<<<< HELLO FUNCTION INVOKED >>>>>");
  console.log("Hello event:", JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from simple function!" }),
    headers: { "Content-Type": "application/json" }
  };
}; 