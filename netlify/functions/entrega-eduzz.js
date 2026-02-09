const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Suporta CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  // Apenas POST é aceito
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Apenas POST é aceito" })
    };
  }

  try {
    console.log('[entrega-eduzz] === WEBHOOK EDUZZ RECEBIDO ===');
    
    // Parse do body (pode vir em URL-encoded ou JSON)
    let params = {};
    
    if (event.body) {
      // Tenta JSON primeiro
      if (event.headers['content-type']?.includes('application/json')) {
        params = JSON.parse(event.body);
      } else {
        // URL-encoded
        const urlParams = new URLSearchParams(event.body);
        for (let [key, value] of urlParams.entries()) {
          params[key] = value;
        }
      }
    }

    console.log('[entrega-eduzz] Parâmetros recebidos:', Object.keys(params));

    // Extrai o código da fatura (token)
    const tokenFatura = params.edz_fat_cod;

    if (!tokenFatura) {
      console.log('[entrega-eduzz] ❌ edz_fat_cod ausente no POST');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Campo edz_fat_cod obrigatório"
        })
      };
    }

    console.log('[entrega-eduzz] Token extraído:', tokenFatura.substring(0, 4) + '...');

    // Dados adicionais da Eduzz (opcional)
    const edzCustCode = params.edz_cust_code;    // Código do cliente
    const edzProdId = params.edz_prod_id;        // ID do produto
    const edzTranCode = params.edz_tran_code;    // Código da transação

    console.log('[entrega-eduzz] Dados Eduzz:', {
      fat_cod: tokenFatura.substring(0, 4) + '...',
      cust_code: edzCustCode,
      prod_id: edzProdId,
      tran_code: edzTranCode
    });

    // Verifica se variáveis de ambiente estão configuradas
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('[entrega-eduzz] ⚠️ Variáveis Supabase não configuradas, mas redirecionando mesmo assim');
      // Redireciona mesmo se Supabase não estiver disponível
      return {
        statusCode: 302,
        headers: {
          ...headers,
          'Location': `/?token=${encodeURIComponent(tokenFatura)}`
        },
        body: JSON.stringify({
          message: "Redirecionando para dashboard",
          token: tokenFatura
        })
      };
    }

    // Tenta registrar/atualizar na tabela usuarios_assinantes
    try {
      console.log('[entrega-eduzz] Consultando Supabase...');

      // Verifica se o token já existe
      const { data: existingData, error: selectError } = await supabase
        .from("usuarios_assinantes")
        .select("id, token")
        .eq("token", tokenFatura)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 = não encontrado, qual é esperado
        console.log('[entrega-eduzz] ⚠️ Erro ao consultar:', selectError.message);
      }

      if (existingData?.id) {
        // Atualiza registro existente
        console.log('[entrega-eduzz] Atualizando registro existente...');
        const { error: updateError } = await supabase
          .from("usuarios_assinantes")
          .update({
            status: 'pago',
            edz_cust_code: edzCustCode,
            edz_prod_id: edzProdId,
            edz_tran_code: edzTranCode,
            updated_at: new Date().toISOString()
          })
          .eq("token", tokenFatura);

        if (updateError) {
          console.log('[entrega-eduzz] ⚠️ Erro ao atualizar:', updateError.message);
        } else {
          console.log('[entrega-eduzz] ✓ Registro atualizado com sucesso');
        }
      } else {
        // Cria novo registro
        console.log('[entrega-eduzz] Criando novo registro...');
        const { error: insertError } = await supabase
          .from("usuarios_assinantes")
          .insert([{
            token: tokenFatura,
            status: 'pago',
            edz_cust_code: edzCustCode,
            edz_prod_id: edzProdId,
            edz_tran_code: edzTranCode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.log('[entrega-eduzz] ⚠️ Erro ao inserir:', insertError.message);
        } else {
          console.log('[entrega-eduzz] ✓ Registro criado com sucesso');
        }
      }
    } catch (supabaseErr) {
      console.log('[entrega-eduzz] ⚠️ Erro Supabase (não crítico):', supabaseErr.message);
      // Continua mesmo com erro no Supabase, o importante é o redirect funcionar
    }

    // Retorna redirect 302 com o token na URL
    console.log('[entrega-eduzz] ✅ Enviando redirect para /?token=...');
    return {
      statusCode: 302,
      headers: {
        ...headers,
        'Location': `/?token=${encodeURIComponent(tokenFatura)}`
      },
      body: JSON.stringify({
        message: "Redirecionando para dashboard",
        token: tokenFatura
      })
    };

  } catch (err) {
    console.error('[entrega-eduzz] ❌ Erro crítico:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Erro interno: " + err.message
      })
    };
  }
};
