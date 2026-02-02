const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!secret || !supabaseUrl || !supabaseKey) {
      return { 
        statusCode: 500, 
        body: `Erro: Configuração incompleta (Secret: ${!!secret}, URL: ${!!supabaseUrl}, Key: ${!!supabaseKey})` 
      };
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(event.body).digest('hex');
    const signature = event.headers['x-signature'];

    if (!signature || signature !== digest) {
      return { statusCode: 401, body: 'Assinatura inválida' };
    }

    const payload = JSON.parse(event.body);
    const { meta, data } = payload;
    
    const eventName = meta.event_name;
    const userEmail = data.attributes.user_email;
    const productName = data.attributes.product_name || 'Plano LexOps';
    const status = data.attributes.status || 'active'; // Captura o status da assinatura (active, cancelled, etc)

    console.log(`Processando evento: ${eventName} para: ${userEmail}`);

    const validEvents = ['order_created', 'subscription_created', 'subscription_updated'];
    
    if (validEvents.includes(eventName)) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const tokenAcesso = crypto.randomBytes(16).toString('hex');

      const { error } = await supabase
        .from('access_tokens')
        .upsert({ 
          email: userEmail, 
          token: tokenAcesso,
          plan: productName,
          subscription_status: status, // Adicionada a coluna que faltava
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