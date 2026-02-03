const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const token = event.queryStringParameters?.token;

    console.log('[validate-token] === VALIDAÇÃO INICIADA ===');
    console.log('[validate-token] Token recebido:', token ? token.substring(0, 4) + '...' : 'VAZIO');

    if (!token) {
      console.log('[validate-token] ❌ Token ausente');
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Código de transação ausente." 
        }) 
      };
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.log('[validate-token] ❌ Variáveis de ambiente não configuradas');
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Erro de configuração no servidor." 
        }) 
      };
    }

    console.log('[validate-token] Consultando tabela access_tokens...');
    const { data, error } = await supabase
      .from("access_tokens")
      .select("*")
      .eq("token", token)
      .single();

    console.log('[validate-token] Resposta:', error ? '❌ Erro' : '✓ Sucesso');

    if (error) {
      console.log('[validate-token] ❌ Token não encontrado');
      return { 
        statusCode: 403, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Código de transação inválido ou não encontrado." 
        }) 
      };
    }

    if (!data) {
      console.log('[validate-token] ❌ Nenhum registro encontrado');
      return { 
        statusCode: 403, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Código de transação inválido ou não encontrado." 
        }) 
      };
    }

    console.log('[validate-token] ✓ Token encontrado!');

    if (data.expires_at) {
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (expiresAt < now) {
        console.log('[validate-token] ❌ Token expirado');
        return { 
          statusCode: 403, 
          headers,
          body: JSON.stringify({ 
            valid: false, 
            message: "Este acesso expirou." 
          }) 
        };
      }
    }

    if (data.status) {
      const statusLower = String(data.status).toLowerCase();
      const validStatuses = ['active', 'pago', 'paid', 'valid', 'approved'];
      
      if (!validStatuses.includes(statusLower)) {
        console.log('[validate-token] ❌ Status não permitido:', data.status);
        return { 
          statusCode: 403, 
          headers,
          body: JSON.stringify({ 
            valid: false, 
            message: "Este acesso foi desativado." 
          }) 
        };
      }
    }

    console.log('[validate-token] ✅ VALIDAÇÃO SUCESSO');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        valid: true, 
        email: data.email || "usuário",
        customer_name: data.customer_name || "Cliente"
      })
    };

  } catch (err) {
    console.error('[validate-token] ❌ Erro não tratado:', err);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        valid: false, 
        message: "Erro interno: " + err.message 
      }) 
    };
  }
};


