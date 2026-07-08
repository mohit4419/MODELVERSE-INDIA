Deno.serve(async (req: Request) => {
  const contentType = req.headers.get("content-type") ?? "";
  const rawBody = await req.text();

  const responseBody = {
    received: true,
    method: req.method,
    contentType,
    bodyLength: rawBody.length,
  };

  try {
    if (rawBody) {
      const parsed = JSON.parse(rawBody);
      responseBody["event"] = parsed?.event || parsed?.type || null;
      responseBody["payload"] = parsed?.payload || null;
    }
  } catch {
    responseBody["bodyPreview"] = rawBody.slice(0, 200);
  }

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
});
