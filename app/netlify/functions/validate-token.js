const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  try {
    // Pega o token da URL
    const token = event.queryStringParameters?.token;

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ valid: false, message: "Token ausente" }) };
    }

    // Busca no banco (CORRIGIDO: busca por 'status' e 'expires_at')
    const { data, error } = await supabase
      .from("access_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) {
      return { statusCode: 403, body: JSON.stringify({ valid: false, message: "Token inválido" }) };
    }

    // Verifica validade e status
    const now = new Date();
    const expiresAt = new Date(data.expires_at); // Coluna padronizada

    // Se estiver expirado ou status não for active
    if (expiresAt < now || data.status !== 'active') {
      return { statusCode: 403, body: JSON.stringify({ valid: false, message: "Acesso expirado" }) };
    }

    // Sucesso
    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true, email: data.email })
    };

  } catch (err) {
    console.error("Erro interno:", err);
    return { statusCode: 500, body: JSON.stringify({ valid: false }) };
  }
};