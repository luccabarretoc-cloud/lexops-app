const { createClient } = require("@supabase/supabase-js");

// Inicializa o cliente do Supabase com as variáveis de ambiente do Netlify
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  // 1. CONFIGURAÇÃO DE HEADERS CORS (Essencial para o navegador não bloquear)
  const headers = {
    "Access-Control-Allow-Origin": "*", // Permite acesso de qualquer origem
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // 2. TRATAMENTO DE PRE-FLIGHT (Método OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "OK"
    };
  }

  try {
    // 3. CAPTURA DO TOKEN DA URL
    const token = event.queryStringParameters?.token;

    if (!token) {
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Acesso negado: Código de transação ausente." 
        }) 
      };
    }

    // 4. CONSULTA AO SUPABASE
    const { data, error } = await supabase
      .from("access_tokens")
      .select("*")
      .eq("token", token)
      .single();

    // Se o token não existir ou houver erro na busca
    if (error || !data) {
      return { 
        statusCode: 403, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Código de transação inválido ou não encontrado." 
        }) 
      };
    }

    // 5. VALIDAÇÃO DE DATA E STATUS
    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (expiresAt < now || data.status !== 'active') {
      return { 
        statusCode: 403, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Este acesso expirou ou foi desativado." 
        }) 
      };
    }

    // 6. RESPOSTA DE SUCESSO
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        valid: true, 
        email: data.email,
        customer_name: data.customer_name 
      })
    };

  } catch (err) {
    console.error("Erro interno no validate-token:", err);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        valid: false, 
        message: "Erro interno no servidor de autenticação." 
      }) 
    };
  }
};