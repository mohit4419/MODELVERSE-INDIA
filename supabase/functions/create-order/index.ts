import { serve } from "@supabase/functions-js";
import Razorpay from "npm:razorpay";
import { createClient } from "@supabase/server";

interface CreateOrderBody {
  
  model_id?: string;
  
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}

serve(async (req: Request) => {
  try {
    const { model_id } = (await req.json()) as CreateOrderBody;

    if (!model_id) {
  return new Response(
    JSON.stringify({ error: "Model ID is required" }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    // prefer PEOJECT_URL if present (custom env), fallback to SUPABASE_URL
    const supabaseUrl = Deno.env.get("PEOJECT_URL") ?? Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(JSON.stringify({ error: "Razorpay credentials are not configured." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Supabase configuration is not set." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // initialize Supabase client before any queries
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: model, error: modelError } = await supabase
      .from("models")
      .select("price")
      .eq("id", model_id)
      .single();

    if (modelError || !model) {
      return new Response(JSON.stringify({ error: "Model not found" }), { status: 404 });
    }

    const amount = (model as any).price;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: crypto.randomUUID(),
    });

    const authHeader = req.headers.get("Authorization");

if (!authHeader) {
  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    { status: 401 }
  );
}

const token = authHeader.replace("Bearer ", "");

const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser(token);

if (authError || !user) {
  return new Response(
    JSON.stringify({ error: "Invalid user" }),
    { status: 401 }
  );
}
    const { error } = await supabase.from("payments").insert({
      user_id: user.id,
      model_id,
      amount,
      currency: "INR",
      razorpay_order_id: order.id,
      status: "created",
    });

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: razorpayKeyId,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});