const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  try {
    const token = event.queryStringParameters?.token;

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ valid: false, message: "Token ausente" }) };
    }

    const { data, error } = await supabase
      .from("access_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) {
      return { statusCode: 403, body: JSON.stringify({ valid: false, message: "Token inválido" }) };
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (expiresAt < now || data.status !== 'active') {
      return { statusCode: 403, body: JSON.stringify({ valid: false, message: "Acesso expirado" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true, email: data.email })
    };

  } catch (err) {
    console.error("Erro interno:", err);
    return { statusCode: 500, body: JSON.stringify({ valid: false }) };
  }
};