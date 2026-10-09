
Deno.serve(async (req: Request) => {
  // Allow POST requests only.
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
    });
  }

  try {
    // Read credentials from Supabase Edge Function secrets.
    const consumerKey = Deno.env.get("DARAJA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET");

    // Check that both credentials exist.
    if (!consumerKey || !consumerSecret) {
      console.error("Daraja credentials are missing.");

      return new Response(
        JSON.stringify({ error: "Server configuration error." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Encode the Consumer Key and Secret for Basic Authentication.
    const credentials = btoa(`${consumerKey}:${consumerSecret}`);

    // Request an OAuth access token from Safaricom Sandbox.
    const response = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    // Read Safaricom's response.
    const data = await response.json();

    // Handle authentication failure without exposing credentials.
    if (!response.ok) {
      console.error("Daraja authentication failed:", response.status);

      return new Response(
        JSON.stringify({ error: "Daraja authentication failed." }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

  // Confirm authentication succeeded without exposing the token.
  return new Response(
    JSON.stringify({
      success: true,
      message: "Daraja Sandbox authentication successful.",
      expires_in: data.expires_in,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
  } catch (error) {
    console.error("Token request failed:", error);

    return new Response(
      JSON.stringify({ error: "Token request failed." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});