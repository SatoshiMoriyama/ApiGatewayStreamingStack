import { Agent } from "@strands-agents/sdk";

const agent = new Agent();

export const handler = awslambda.streamifyResponse(
  async (event: any, responseStream: any) => {
    const { message } = JSON.parse(event.body || "{}");
    const stream = awslambda.HttpResponseStream.from(responseStream, {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    if (!message) return stream.end("message is required");

    for await (const chunk of agent.stream(message)) {
      if (
        chunk.type === "modelContentBlockDeltaEvent" &&
        chunk.delta.type === "textDelta"
      ) {
        stream.write(chunk.delta.text);
      }
    }
    stream.end();
  }
);
