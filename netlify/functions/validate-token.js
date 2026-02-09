const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
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

    console.log('[validate-token] Consultando tabela...');
    
    // Qual é o nome da tabela? (access_tokens ou usuarios_assinantes?)
    const { data, error } = await supabase
      .from("usuarios_assinantes")
      .select("*")
      .eq("token", token);

    console.log('[validate-token] Token procurado:', token);
    console.log('[validate-token] Erro:', error?.message || 'Nenhum');
    console.log('[validate-token] Total de registros encontrados:', data?.length || 0);
    if (data?.length > 0) {
      console.log('[validate-token] Primeiro registro:', JSON.stringify(data[0]));
    }

    if (error) {
      console.log('[validate-token] ❌ Erro na consulta:', error.message);
      return { 
        statusCode: 403, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Erro ao buscar token: " + error.message 
        }) 
      };
    }

    // Se não encontrou nenhum registro
    if (!data || data.length === 0) {
      console.log('[validate-token] ❌ Token não encontrado na tabela');
      return { 
        statusCode: 403, 
        headers,
        body: JSON.stringify({ 
          valid: false, 
          message: "Código de transação inválido ou não encontrado." 
        }) 
      };
    }

    // Pega o primeiro registro encontrado
    const foundData = data[0];

    console.log('[validate-token] ✓ Token encontrado!');

    if (foundData.expires_at) {
      const now = new Date();
      const expiresAt = new Date(foundData.expires_at);
      
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

    if (foundData.status) {
      const statusLower = String(foundData.status).toLowerCase();
      const validStatuses = ['active', 'pago', 'paid', 'valid', 'approved'];
      
      if (!validStatuses.includes(statusLower)) {
        console.log('[validate-token] ❌ Status não permitido:', foundData.status);
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
    
    // ─── Enviar email com o token (opcional) ───
    if (foundData.email && process.env.RESEND_API_KEY) {
      console.log('[validate-token] 📧 Enviando email para:', foundData.email);
      try {
        // Chama a function send-email via fetch
        const sendEmailUrl = `${event.headers.origin || 'https://' + event.headers.host}/.netlify/functions/send-email`;
        await fetch(sendEmailUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: foundData.email,
            token: token,
            nome: foundData.customer_name || foundData.nome || "Cliente"
          })
        }).then(r => r.json()).then(data => {
          console.log('[validate-token] ✅ Email enviado:', data);
        }).catch(err => {
          console.log('[validate-token] ⚠️ Erro ao enviar email:', err.message);
        });
      } catch (emailErr) {
        console.log('[validate-token] ⚠️ Erro ao disparar email:', emailErr.message);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        valid: true, 
        email: foundData.email || "usuário",
        customer_name: foundData.customer_name || "Cliente"
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


