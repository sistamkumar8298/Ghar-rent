import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "POST method required" },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error("Server configuration missing");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json(
        { error: "Login required" },
        { status: 401, headers: corsHeaders },
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "Invalid login" },
        { status: 401, headers: corsHeaders },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const feeType = body.fee_type;
    const propertyId = body.property_id;

    if (
      !["registration_fee", "platform_fee"].includes(feeType) ||
      !propertyId
    ) {
      return Response.json(
        { error: "Invalid fee type or property ID" },
        { status: 400, headers: corsHeaders },
      );
    }

    const { data: property, error: propertyError } =
      await adminClient
        .from("Properties")
        .select('"Owner id", "Monthly rent"')
        .eq("id", propertyId)
        .maybeSingle();

    if (propertyError || !property) {
      return Response.json(
        { error: "Property not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    if (property["Owner id"] !== user.id) {
      return Response.json(
        { error: "Only the property owner can request this payment" },
        { status: 403, headers: corsHeaders },
      );
    }

    const { data: settings, error: settingsError } =
      await adminClient
        .from("platform_settings")
        .select("key, value_json")
        .in("key", ["registration_fee_inr", "platform_fee_percent"]);

    if (settingsError || !settings) {
      throw new Error("Could not load fee settings");
    }

    const setting = Object.fromEntries(
      settings.map((row) => [row.key, row.value_json]),
    );

    let amount: number;

    if (feeType === "registration_fee") {
      amount = Number(setting.registration_fee_inr?.value ?? 300);
    } else {
      const rent = Number(property["Monthly rent"]);
      const percent = Number(setting.platform_fee_percent?.value ?? 2);

      if (!Number.isFinite(rent) || rent <= 0) {
        return Response.json(
          { error: "Invalid monthly rent" },
          { status: 400, headers: corsHeaders },
        );
      }

      amount = Math.round(rent * percent) / 100;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    return Response.json(
      {
        message:
          "Amount calculated. A verified payment gateway must be connected before accepting payment.",
        user_id: user.id,
        property_id: propertyId,
        fee_type: feeType,
        amount,
        currency: "INR",
        payment_gateway_connected: false,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Payment order error:", error);

    return Response.json(
      { error: "Could not prepare payment order" },
      { status: 500, headers: corsHeaders },
    );
  }
});
