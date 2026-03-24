import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64 } = await req.json();

    if (!image_base64) {
      return new Response(
        JSON.stringify({ error: "image_base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all active AR experiences
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: experiences, error } = await supabase
      .from("ar_experiences")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;
    if (!experiences || experiences.length === 0) {
      return new Response(
        JSON.stringify({ match: false, message: "No experiences configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Lovable AI to compare the uploaded image against stored trigger images
    const aiApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    // Build image list for the AI prompt
    const imageDescriptions = experiences
      .map((e, i) => `Image ${i + 1} (ID: ${e.id}): ${e.trigger_image_url}`)
      .join("\n");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an image matching system. You will be given a user's photo and a list of reference images. Your job is to determine if the user's photo matches any of the reference images. The photos may be taken from different angles, lighting, or distances - look for the same subject/content.

Respond ONLY with a JSON object in this exact format:
{"match": true, "id": "matched-experience-id", "confidence": 0.95}
or
{"match": false, "id": null, "confidence": 0}

Only return match:true if you are at least 70% confident it's the same image/subject.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Here are the reference images to match against:\n${imageDescriptions}\n\nDoes the following uploaded photo match any of these reference images?`,
                },
                ...experiences.map((e) => ({
                  type: "image_url" as const,
                  image_url: { url: e.trigger_image_url },
                })),
                {
                  type: "image_url" as const,
                  image_url: {
                    url: `data:image/jpeg;base64,${image_base64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 200,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", errText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse AI response
    let matchResult;
    try {
      // Extract JSON from response (might have markdown wrapping)
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      matchResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { match: false };
    } catch {
      console.error("Failed to parse AI response:", content);
      matchResult = { match: false };
    }

    if (matchResult.match && matchResult.id) {
      const matched = experiences.find((e) => e.id === matchResult.id);
      if (matched) {
        return new Response(
          JSON.stringify({
            match: true,
            experience: {
              id: matched.id,
              title: matched.title,
              description: matched.description,
              video_url: matched.video_url,
              trigger_image_url: matched.trigger_image_url,
            },
            confidence: matchResult.confidence,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ match: false, message: "No matching image found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
