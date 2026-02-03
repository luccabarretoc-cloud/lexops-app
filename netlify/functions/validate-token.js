const { createClient } = require("@supabase/supabase-js");

// HARDCODED PARA TESTE - Remove depois!
const VALID_TOKENS_TEST = {
  '12345678': { email: 'alice.johnson@example.com', customer_name: 'Alice Johnson' },
  'vitoria2026': { email: 'luccacazetta@hotmail.com', customer_name: 'Lucca Cazetta' }
};

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

    console.log('[validate-token] === INICIO ===');
    console.log('[validate-token] Token recebido:', token);
    console.log('[validate-token] SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Configurado' : '✗ NÃO CONFIGURADO');
    console.log('[validate-token] SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Configurado' : '✗ NÃO CONFIGURADO');

    if (!token) {
      console.log('[validate-token] Token vazio!');
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Código de transação ausente." 
        }) 
      };
    }

    // TESTE COM HARDCODED PRIMEIRO
    if (VALID_TOKENS_TEST[token]) {
      console.log('[validate-token] ✅ Token encontrado no teste hardcoded!');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          valid: true, 
          email: VALID_TOKENS_TEST[token].email,
          customer_name: VALID_TOKENS_TEST[token].customer_name
        })
      };
    }

    // DEPOIS TENTA SUPABASE
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.log('[validate-token] ❌ Variáveis de ambiente não configuradas! Usando apenas teste hardcoded.');
      return { 
        statusCode: 403, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Servidor de autenticação não configurado. Use: 12345678 ou vitoria2026 para teste." 
        }) 
      };
    }

    console.log('[validate-token] Consultando tabela access_tokens...');
    const { data, error } = await supabase
      .from("access_tokens")
      .select("*")
      .eq("token", token)
      .single();

    console.log('[validate-token] Erro de consulta:', error?.message || 'Nenhum erro');
    console.log('[validate-token] Código do erro:', error?.code);
    console.log('[validate-token] Dados encontrados:', data ? 'SIM' : 'NÃO');

    if (error) {
      console.log('[validate-token] Erro ao buscar:', error.message);
      if (error.code === 'PGRST116') {
        return { 
          statusCode: 403, 
          headers,
          body: JSON.stringify({ 
            valid: false, 
            message: "Código de transação inválido ou não encontrado." 
          }) 
        };
      }
      return { 
        statusCode: 403, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Erro ao buscar token: " + error.message 
        }) 
      };
    }

    if (!data) {
      console.log('[validate-token] Nenhum registro encontrado');
      return { 
        statusCode: 403, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Código de transação inválido ou não encontrado." 
        }) 
      };
    }

    console.log('[validate-token] ✓ Token encontrado no Supabase!');
    console.log('[validate-token] Email:', data.email);
    console.log('[validate-token] Customer:', data.customer_name);
    console.log('[validate-token] Status:', data.status);

    if (data.expires_at) {
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (expiresAt < now) {
        console.log('[validate-token] ✗ Token expirado!');
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
        console.log('[validate-token] ✗ Status não permitido!');
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

    console.log('[validate-token] ✅ SUCESSO - Token VÁLIDO!');
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


