const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

exports.handler = async (event, context) => {
  // 1. Verificar se é POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. Validar Variáveis de Ambiente essenciais
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL;
    // Tenta ler com "ROLE" ou sem "ROLE" para garantir compatibilidade
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!secret || !supabaseUrl || !supabaseKey) {
      console.error("ERRO: Variáveis de ambiente faltando no Netlify.");
      return { 
        statusCode: 500, 
        body: `Erro: Configuração incompleta (Secret: ${!!secret}, URL: ${!!supabaseUrl}, Key: ${!!supabaseKey})` 
      };
    }

    // 3. Validar a Assinatura (Segurança do Lemon Squeezy)
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(event.body).digest('hex');
    const signature = event.headers['x-signature'];

    if (!signature || signature !== digest) {
      console.error("Assinatura inválida detectada.");
      return { statusCode: 401, body: 'Assinatura inválida' };
    }

    // 4. Ler os dados da venda
    const payload = JSON.parse(event.body);
    const { meta, data } = payload;
    
    const eventName = meta.event_name;
    const userEmail = data.attributes.user_email;

    console.log(`Processando evento: ${eventName} para: ${userEmail}`);

    // 5. Se o evento for de criação ou atualização de assinatura/pedido
    const validEvents = ['order_created', 'subscription_created', 'subscription_updated'];
    
    if (validEvents.includes(eventName)) {
      
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Gerar um token único
      const tokenAcesso = crypto.randomBytes(16).toString('hex');

      // Gravar ou Atualizar no Banco de Dados
      // Usamos upsert baseado no email para não duplicar linhas se o usuário mudar o plano
      const { error } = await supabase
        .from('access_tokens')
        .upsert({ 
          email: userEmail, 
          token: tokenAcesso,
          created_at: new Date().toISOString(),
          is_active: true
        }, { onConflict: 'email' });

      if (error) {
        console.error('Erro ao inserir no Supabase:', error);
        throw error;
      }

      console.log(`Sucesso! Acesso liberado para ${userEmail}`);
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: 'Webhook processado com sucesso' }) 
    };

  } catch (error) {
    console.error('Erro crítico no webhook:', error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};